import { matchResumeToJob } from "./jobMatchService.js";

const STOPWORDS = new Set([
  "the","and","for","are","with","this","that","from","have","has","had","will",
  "your","you","our","their","they","them","its","it's","a","an","of","to","in",
  "on","at","by","as","is","be","or","we","us","if","into","across","within",
  "about","using","use","used","including","include","includes","etc","per",
  "role","team","teams","work","working","job","company","candidate","candidates",
  "years","year","strong","excellent","ability","abilities","skills","skill",
  "knowledge","understanding","experience","experienced","responsibilities",
  "responsible","requirements","required","preferred","plus","must","should",
  "can","also","other","related","looking","opportunity","new","all","any","one",
  "day","days","time","full","part","apply","applicant","position","who","what",
  "where","when","why","how","not","but","than","then","these","those","such",
  "may","more","most","some","every","each","help","helping","ensure","provide",
  "providing","support","supporting","office","benefits","base","pay","paid",
  "range","compensation","mission","best","fast","ready","future","join","spark",
  "person","building","strong","high","performing","scale","build","best-in",
  "believe","power","progress","innovation","community","intentional","energizing",
  "designed","fully","expected","attendance","based","hiring","equal","employer",
  "diversity","inclusion","disability","veteran","identity","expression","without",
  "regard","applicable","law","laws","accommodation","please","contact","email",
  "click","below","submit","submitting","interested","excited","invite",
  "invited","impact","reward","rewards","ambitious","careers","career",
]);

const SKILL_DICTIONARY = [
  "javascript","typescript","react","react.js","node","node.js","express",
  "next.js","vue","angular","redux","html","css","sass","tailwind","graphql",
  "rest api","restful","python","django","flask","fastapi","java","spring",
  "kotlin","swift","c++","c#",".net","go","golang","rust","ruby","rails","php",
  "laravel","sql","mysql","postgresql","postgres","mongodb","redis","dynamodb",
  "elasticsearch","aws","azure","gcp","google cloud","docker","kubernetes","k8s",
  "terraform","ci/cd","jenkins","github actions","git","linux","bash","shell",
  "microservices","machine learning","deep learning","tensorflow","pytorch",
  "nlp","data science","data engineering","etl","spark","hadoop","kafka",
  "airflow","tableau","power bi","excel","agile","scrum","jira","figma",
  "product management","project management","ui/ux","seo","salesforce",
  "communication","leadership","problem solving","analytical","stakeholder",
  "cross-functional","api design","testing","unit testing","jest","cypress",
  "selenium","devops","cybersecurity","networking","android","ios","flutter",
  "react native","webpack","vite","graphql","oauth","jwt",
];

const STRIP_REGEX = /[^a-z0-9+.#/ ]/g;

function normalize(text) {
  return (text || "").toLowerCase();
}

function tokenize(text) {
  return normalize(text)
    .replace(STRIP_REGEX, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function extractJobKeywords(jobDescription, maxKeywords = 30) {
  const normalizedJD = normalize(jobDescription);
  const found = new Map();

  for (const skill of SKILL_DICTIONARY) {
    const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
    const matches = normalizedJD.match(pattern);
    if (matches?.length) {
      found.set(skill, (found.get(skill) || 0) + matches.length);
    }
  }

  const freq = new Map();
  for (const rawWord of tokenize(jobDescription)) {
    // Sentence-ending punctuation rides along on the last word of a
    // sentence (e.g. "community."); strip it before it pollutes frequency
    // counts. Interior punctuation (node.js, c#) is handled separately via
    // the curated SKILL_DICTIONARY regex match above, not this path.
    const word = rawWord.replace(/^[.#/]+|[.#/]+$/g, "");
    if (word.length < 3 || STOPWORDS.has(word) || /^\d+$/.test(word)) continue;
    freq.set(word, (freq.get(word) || 0) + 1);
  }
  const rankedWords = [...freq.entries()]
    .filter(([word, count]) => count >= 2 || SKILL_DICTIONARY.includes(word))
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);

  for (const word of rankedWords) {
    if (!found.has(word)) found.set(word, freq.get(word));
  }

  return [...found.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([keyword]) => keyword);
}

function keywordPresentInResume(keyword, resumeTextNormalized) {
  const pattern = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
  return pattern.test(resumeTextNormalized);
}

function checkFormat(resumeText) {
  const warnings = [];
  const text = resumeText || "";
  const wordCount = tokenize(text).length;

  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
  const hasPhone = /(\+?\d[\d\s().-]{8,}\d)/.test(text);
  const hasExperienceSection = /\b(experience|employment history|work history)\b/i.test(text);
  const hasEducationSection = /\beducation\b/i.test(text);
  const hasSkillsSection = /\bskills\b/i.test(text);

  if (!hasEmail) warnings.push("No email address detected — ATS systems may reject resumes without contact info.");
  if (!hasPhone) warnings.push("No phone number detected.");
  if (!hasExperienceSection) warnings.push("No clear 'Experience' section header found.");
  if (!hasEducationSection) warnings.push("No clear 'Education' section header found.");
  if (!hasSkillsSection) warnings.push("No clear 'Skills' section header found.");
  if (wordCount < 150) warnings.push("Resume looks short — ATS and recruiters may see it as underdeveloped.");
  if (wordCount > 1200) warnings.push("Resume looks long — consider trimming for readability and ATS parsing.");

  const structureScore = 100 - warnings.length * 10;
  return { warnings, structureScore: Math.max(0, structureScore) };
}

export function computeKeywordScore(resumeText, jobDescription) {
  const jobKeywords = extractJobKeywords(jobDescription);
  const normalizedResume = normalize(resumeText).replace(STRIP_REGEX, " ");

  const matchedKeywords = [];
  const missingKeywords = [];
  for (const keyword of jobKeywords) {
    if (keywordPresentInResume(keyword, normalizedResume)) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  }

  const keywordScore = jobKeywords.length
    ? Math.round((matchedKeywords.length / jobKeywords.length) * 100)
    : 50;

  return { keywordScore, matchedKeywords, missingKeywords, jobKeywords };
}

export async function computeAtsScore(resumeText, jobDescription) {
  const { keywordScore, matchedKeywords, missingKeywords } = computeKeywordScore(
    resumeText,
    jobDescription,
  );
  const { warnings: formatWarnings, structureScore } = checkFormat(resumeText);

  const llmResult = await matchResumeToJob(resumeText, jobDescription);
  let llmScore = llmResult.success ? Number(llmResult.data?.matchScore) || 0 : null;
  // Guard against the LLM occasionally returning a 0-1 fraction instead of
  // a 0-100 percentage despite the prompt asking for the latter.
  if (llmScore !== null && llmScore > 0 && llmScore <= 1) {
    llmScore = Math.round(llmScore * 100);
  }

  const blendedKeywordAndFormat = Math.round(keywordScore * 0.8 + structureScore * 0.2);
  const overall =
    llmScore === null
      ? blendedKeywordAndFormat
      : Math.round(blendedKeywordAndFormat * 0.6 + llmScore * 0.4);

  return {
    overall,
    keywordScore,
    structureScore,
    llmScore,
    matchedKeywords,
    missingKeywords,
    formatWarnings,
    fitAnalysis: llmResult.success ? llmResult.data?.fitAnalysis : null,
    improvementSuggestions: llmResult.success ? llmResult.data?.improvementSuggestions : [],
  };
}
