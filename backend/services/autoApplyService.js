import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { Writable } from "stream";
import PDFDocument from "pdfkit";
import { chromium } from "playwright";
import { findOne, findMany, insertOne, updateOne } from "../db.js";
import { resolveJobPosting } from "./jobDescriptionService.js";
import { generateTailoredResume, generateCoverLetter } from "./aiService.js";
import { computeAtsScore } from "./atsScoreService.js";
import * as greenhouseAdapter from "./platformAdapters/greenhouse.js";
import * as leverAdapter from "./platformAdapters/lever.js";

const GENERATED_DIR = path.resolve("uploads", "generated");
const DRY_RUN = process.env.AUTO_APPLY_DRY_RUN === "true";

const ADAPTERS = { greenhouse: greenhouseAdapter, lever: leverAdapter };

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function isHeadingLine(line) {
  const trimmed = line.trim();
  return (
    trimmed.length > 2 &&
    trimmed.length < 40 &&
    trimmed === trimmed.toUpperCase() &&
    /[A-Z]/.test(trimmed)
  );
}

// Tries progressively smaller body font sizes with a real (discarded) trial
// render of each, counting actual pages via PDFKit's "pageAdded" event —
// estimating height via heightOfString() turned out to undercount slightly
// and let short overflows slip onto a second page. This is exact instead.
const FONT_SIZE_LADDER = [11, 10.5, 10, 9.5, 9, 8.5, 8, 7.5, 7, 6.5, 6];

function writeResumeContent(doc, text, fontSize) {
  doc.font("Helvetica").fontSize(fontSize);
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      doc.moveDown(0.5);
      continue;
    }
    if (isHeadingLine(line)) {
      doc.moveDown(0.5).font("Helvetica-Bold").fontSize(fontSize + 1).text(line.trim());
      doc.font("Helvetica").fontSize(fontSize);
    } else {
      doc.text(line);
    }
  }
}

function countPagesAtFontSize(text, fontSize) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50, size: "LETTER" });
    let pageCount = 1;
    doc.on("pageAdded", () => {
      pageCount++;
    });
    const discard = new Writable({
      write(_chunk, _enc, cb) {
        cb();
      },
    });
    doc.pipe(discard);
    writeResumeContent(doc, text, fontSize);
    doc.end();
    discard.on("finish", () => resolve(pageCount));
  });
}

async function pickFittingFontSize(text) {
  for (const fontSize of FONT_SIZE_LADDER) {
    const pages = await countPagesAtFontSize(text, fontSize);
    if (pages <= 1) return fontSize;
  }
  return FONT_SIZE_LADDER[FONT_SIZE_LADDER.length - 1];
}

async function renderResumePdf(text, outputPath) {
  const fontSize = await pickFittingFontSize(text);
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "LETTER" });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);
    writeResumeContent(doc, text, fontSize);
    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

async function fillApplicationForm({
  atsPlatform,
  applyUrl,
  profile,
  userEmail,
  resumePdfPath,
  coverLetterText,
  screenshotPath,
}) {
  const adapter = ADAPTERS[atsPlatform];
  if (!adapter) throw new Error(`No autofill adapter for platform "${atsPlatform}"`);

  const browser = await chromium.launch({ headless: true });
  const filledFields = {};
  try {
    const page = await browser.newPage();
    await page.goto(applyUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(1000);

    await adapter.fillForm(page, profile, userEmail, filledFields);
    await adapter.uploadResume(page, resumePdfPath, filledFields);
    if (coverLetterText && adapter.attachCoverLetter) {
      await adapter.attachCoverLetter(page, coverLetterText, filledFields);
    }

    await page.screenshot({ path: screenshotPath, fullPage: true });
    return { filledFields };
  } finally {
    await browser.close();
  }
}

export async function prepareApplication({ userId, jobUrl, resumeText }) {
  if (!resumeText) throw new Error("resumeText is required");
  if (!jobUrl) throw new Error("jobUrl is required");

  const existing = await findOne("jobApplications", {
    userId,
    jobUrl,
    status: "submitted",
  });
  if (existing) {
    const err = new Error(
      `You already applied to this job on ${new Date(existing.submittedAt).toLocaleDateString()}.`,
    );
    err.code = "DUPLICATE_APPLICATION";
    throw err;
  }

  const posting = await resolveJobPosting(jobUrl);
  const [user, profile] = await Promise.all([
    findOne("users", { id: userId }),
    findOne("applicantProfiles", { userId }),
  ]);
  const applicantProfile = profile || {};

  const applicationId = randomUUID();
  const userDir = path.join(GENERATED_DIR, userId);
  ensureDir(userDir);

  let tailoredResumeText = resumeText;
  let coverLetterText = "";
  let atsScore = null;

  if (posting.descriptionText) {
    const tailored = await generateTailoredResume(resumeText, posting.descriptionText, null);
    if (tailored.success) {
      tailoredResumeText = tailored.data.generatedResume;
    }

    const coverLetter = await generateCoverLetter(
      tailoredResumeText,
      posting.descriptionText,
      posting.company,
      user?.name,
    );
    if (coverLetter.success) {
      coverLetterText = coverLetter.data.coverLetter;
    }

    atsScore = await computeAtsScore(tailoredResumeText, posting.descriptionText);
  }

  const resumePdfPath = path.join(userDir, `${applicationId}.pdf`);
  await renderResumePdf(tailoredResumeText, resumePdfPath);

  let filledFields = {};
  let screenshotPath = null;
  let status = "draft";
  let autoFillError = null;

  if (posting.autoFillSupported && posting.applyUrl) {
    const previewScreenshotPath = path.join(userDir, `${applicationId}-preview.png`);
    try {
      const result = await fillApplicationForm({
        atsPlatform: posting.atsPlatform,
        applyUrl: posting.applyUrl,
        profile: applicantProfile,
        userEmail: user?.email,
        resumePdfPath,
        coverLetterText,
        screenshotPath: previewScreenshotPath,
      });
      filledFields = result.filledFields;
      screenshotPath = previewScreenshotPath;
      status = "ready_for_review";
    } catch (error) {
      console.error("AUTO APPLY PREPARE FORM ERROR:", error);
      autoFillError = error.message;
      status = "draft";
    }
  }

  const record = {
    id: applicationId,
    userId,
    jobUrl,
    atsPlatform: posting.atsPlatform,
    company: posting.company,
    jobTitle: posting.title,
    jobDescriptionText: posting.descriptionText,
    tailoredResumeText,
    coverLetterText,
    atsScore,
    filledFields,
    screenshotPath,
    confirmationScreenshotPath: null,
    resumePdfPath,
    applyUrl: posting.applyUrl,
    autoFillSupported: Boolean(posting.autoFillSupported),
    manualApplyMessage: posting.manualApplyMessage,
    status,
    error: autoFillError,
    dryRun: DRY_RUN,
    createdAt: new Date().toISOString(),
    submittedAt: null,
  };

  await insertOne("jobApplications", record);
  return record;
}

export async function submitApplication({ userId, applicationId }) {
  const record = await findOne("jobApplications", { id: applicationId, userId });
  if (!record) {
    const err = new Error("Application not found");
    err.code = "NOT_FOUND";
    throw err;
  }
  if (record.status !== "ready_for_review") {
    const err = new Error(
      `This application isn't ready to submit (current status: ${record.status}).`,
    );
    err.code = "INVALID_STATE";
    throw err;
  }

  const adapter = ADAPTERS[record.atsPlatform];
  if (!adapter) throw new Error(`No autofill adapter for platform "${record.atsPlatform}"`);

  const userDir = path.join(GENERATED_DIR, userId);
  ensureDir(userDir);
  const confirmationScreenshotPath = path.join(userDir, `${applicationId}-confirmation.png`);

  // Headed (visible) rather than headless: some ATS forms add a
  // human-verification step (e.g. an emailed code) right before the real
  // submit. When that happens we leave this actual window open below
  // instead of closing it, so the person can finish that step themselves —
  // deliberately not automated, since defeating a "prove you're human"
  // check is the one thing this tool won't do.
  const browser = await chromium.launch({ headless: false });
  let closeBrowser = true;
  try {
    const page = await browser.newPage();
    await page.goto(record.applyUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(1000);

    const [user, profile] = await Promise.all([
      findOne("users", { id: userId }),
      findOne("applicantProfiles", { userId }),
    ]);

    const refilledFields = {};
    await adapter.fillForm(page, profile || {}, user?.email, refilledFields);
    await adapter.uploadResume(page, record.resumePdfPath, refilledFields);
    if (record.coverLetterText && adapter.attachCoverLetter) {
      await adapter.attachCoverLetter(page, record.coverLetterText, refilledFields);
    }

    let confirmed;
    if (DRY_RUN) {
      confirmed = true;
    } else {
      const clicked = await adapter.submit(page);
      if (!clicked) {
        throw new Error("Could not find the submit button on the application form");
      }
      confirmed = await adapter.waitForConfirmation(page);
    }

    if (!confirmed && !DRY_RUN) {
      // Most likely cause: a manual step (verification code, captcha
      // challenge) that only a human can finish. Leave the real browser
      // window open on the filled-out form instead of closing it.
      closeBrowser = false;
      const update = {
        status: "awaiting_manual_step",
        error:
          "This form needs a manual step to finish (e.g. an emailed verification code). A browser window has been opened with everything filled in — complete that step and click submit yourself.",
      };
      await updateOne("jobApplications", { id: applicationId }, { $set: update });
      return { ...record, ...update };
    }

    await page.screenshot({ path: confirmationScreenshotPath, fullPage: true });

    const update = {
      status: "submitted",
      submittedAt: new Date().toISOString(),
      confirmationScreenshotPath,
      error: null,
    };
    await updateOne("jobApplications", { id: applicationId }, { $set: update });
    return { ...record, ...update };
  } catch (error) {
    await updateOne(
      "jobApplications",
      { id: applicationId },
      { $set: { status: "failed", error: error.message } },
    );
    throw error;
  } finally {
    if (closeBrowser) await browser.close();
  }
}

// After a headed-browser handoff (see "awaiting_manual_step" above), nothing
// in this process is watching that browser window anymore, so we have no way
// to detect on our own whether the person actually finished and submitted.
// This lets them tell us, instead of the record being stuck forever.
export async function confirmManualSubmission({ userId, applicationId }) {
  const record = await findOne("jobApplications", { id: applicationId, userId });
  if (!record) {
    const err = new Error("Application not found");
    err.code = "NOT_FOUND";
    throw err;
  }
  if (record.status !== "awaiting_manual_step") {
    const err = new Error(
      `This application isn't waiting on a manual step (current status: ${record.status}).`,
    );
    err.code = "INVALID_STATE";
    throw err;
  }

  const update = { status: "submitted", submittedAt: new Date().toISOString(), error: null };
  await updateOne("jobApplications", { id: applicationId }, { $set: update });
  return { ...record, ...update };
}

export async function listApplications(userId) {
  return findMany("jobApplications", { userId });
}

export async function getApplication(userId, applicationId) {
  return findOne("jobApplications", { id: applicationId, userId });
}
