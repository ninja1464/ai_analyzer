import * as cheerio from "cheerio";

const BLOCKED_HOSTS = ["linkedin.com", "indeed.com", "glassdoor.com", "ziprecruiter.com"];

// Some ATS CDNs (Cloudflare in front of Greenhouse boards, etc.) reject
// requests with no User-Agent / Accept headers as bot traffic and return
// 406/403. A realistic browser-like header set avoids that false positive.
const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

function stripHtml(html) {
  if (!html) return "";
  // Some ATS APIs (e.g. Greenhouse) return their rich-text content
  // HTML-entity-escaped, so a single pass just decodes entities and leaves
  // literal "<div>"-style text behind. Decode once, then strip real tags —
  // this is a no-op (safe) on already-plain HTML.
  const decoded = cheerio.load(html)("body").text();
  const $ = cheerio.load(decoded);
  $("script, style, nav, footer, header").remove();
  return $("body").text().replace(/\s+/g, " ").trim();
}

function detectPlatform(hostname) {
  if (hostname.includes("greenhouse.io")) return "greenhouse";
  if (hostname.includes("lever.co")) return "lever";
  if (hostname.includes("myworkdayjobs.com") || hostname.includes("workday.com")) return "workday";
  if (hostname.includes("ashbyhq.com")) return "ashby";
  if (BLOCKED_HOSTS.some((host) => hostname.includes(host))) return "blocked";
  return "unsupported";
}

async function resolveGreenhouse(url) {
  const match = url.pathname.match(/^\/([^/]+)\/jobs\/(\d+)/);
  if (match) {
    const [, board, jobId] = match;
    const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${board}/jobs/${jobId}`;
    const res = await fetch(apiUrl, { headers: FETCH_HEADERS });
    if (res.ok) {
      const job = await res.json();
      return {
        company: job.company_name || board,
        title: job.title,
        descriptionText: stripHtml(job.content || ""),
        applyUrl: job.absolute_url || url.toString(),
      };
    }
  }

  const res = await fetch(url.toString(), { headers: FETCH_HEADERS });
  if (!res.ok) throw new Error(`Failed to fetch Greenhouse posting (${res.status})`);
  const html = await res.text();
  const $ = cheerio.load(html);
  return {
    company: $("meta[property='og:site_name']").attr("content") || null,
    title: $("h1").first().text().trim() || $("title").text().trim(),
    descriptionText: stripHtml(html),
    applyUrl: url.toString(),
  };
}

async function resolveLever(url) {
  const match = url.pathname.match(/^\/([^/]+)\/([a-f0-9-]{20,})/i);
  if (match) {
    const [, company, postingId] = match;
    const apiUrl = `https://api.lever.co/v0/postings/${company}/${postingId}?mode=json`;
    const res = await fetch(apiUrl, { headers: FETCH_HEADERS });
    if (res.ok) {
      const job = await res.json();
      return {
        company,
        title: job.text,
        descriptionText: stripHtml(
          `${job.descriptionPlain || job.description || ""} ${(job.lists || [])
            .map((l) => `${l.text} ${stripHtml(l.content || "")}`)
            .join(" ")}`,
        ),
        applyUrl: job.applyUrl || `${url.toString().replace(/\/$/, "")}/apply`,
      };
    }
  }

  const res = await fetch(url.toString(), { headers: FETCH_HEADERS });
  if (!res.ok) throw new Error(`Failed to fetch Lever posting (${res.status})`);
  const html = await res.text();
  const $ = cheerio.load(html);
  return {
    company: url.pathname.split("/").filter(Boolean)[0] || null,
    title: $("h2").first().text().trim() || $("title").text().trim(),
    descriptionText: stripHtml(html),
    applyUrl: `${url.toString().replace(/\/$/, "")}/apply`,
  };
}

async function resolveGeneric(url) {
  const res = await fetch(url.toString(), { headers: FETCH_HEADERS });
  if (!res.ok) throw new Error(`Failed to fetch job posting (${res.status})`);
  const html = await res.text();
  const $ = cheerio.load(html);
  return {
    company: $("meta[property='og:site_name']").attr("content") || url.hostname,
    title: $("title").text().trim() || null,
    descriptionText: stripHtml(html),
    applyUrl: url.toString(),
  };
}

export async function resolveJobPosting(jobUrl) {
  let url;
  try {
    url = new URL(jobUrl);
  } catch {
    throw new Error("Invalid job URL");
  }

  const atsPlatform = detectPlatform(url.hostname.replace(/^www\./, ""));

  if (atsPlatform === "blocked") {
    return {
      atsPlatform,
      autoFillSupported: false,
      manualApplyMessage:
        "Automated applying on LinkedIn/Indeed-style platforms isn't supported — it violates their terms of service and risks your account. Use the tailored resume and cover letter below to apply manually.",
      company: null,
      title: null,
      descriptionText: null,
      applyUrl: jobUrl,
    };
  }

  let resolved;
  if (atsPlatform === "greenhouse") {
    resolved = await resolveGreenhouse(url);
  } else if (atsPlatform === "lever") {
    resolved = await resolveLever(url);
  } else {
    resolved = await resolveGeneric(url);
  }

  const autoFillSupported = atsPlatform === "greenhouse" || atsPlatform === "lever";

  return {
    atsPlatform,
    autoFillSupported,
    manualApplyMessage: autoFillSupported
      ? null
      : `Auto-fill isn't supported for this site yet (${atsPlatform}). Use the tailored resume and cover letter below to apply manually.`,
    ...resolved,
  };
}
