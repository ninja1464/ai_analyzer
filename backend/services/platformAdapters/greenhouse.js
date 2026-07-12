import fs from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import { fillFirstMatch, uploadFile, clickFirstMatch, answerComboboxQuestions } from "./formUtils.js";

const QUESTION_ANSWERS = (profile) => [
  { pattern: /sponsorship/i, getAnswer: () => (profile.needsSponsorship ? "Yes" : "No") },
  { pattern: /onsite/i, getAnswer: () => "Yes" },
  { pattern: /how did you hear/i, getAnswer: () => profile.howDidYouHearAboutUs || "Other" },
  { pattern: /salary/i, getAnswer: () => profile.salaryExpectation || null },
];

export async function fillForm(page, profile, userEmail, filledFields) {
  await fillFirstMatch(
    page,
    [
      () => page.locator("#first_name"),
      () => page.getByLabel(/first name/i),
    ],
    profile.firstName,
    filledFields,
    "First Name",
  );

  await fillFirstMatch(
    page,
    [
      () => page.locator("#last_name"),
      () => page.getByLabel(/last name/i),
    ],
    profile.lastName,
    filledFields,
    "Last Name",
  );

  await fillFirstMatch(
    page,
    [() => page.locator("#email"), () => page.getByLabel(/^email/i)],
    userEmail,
    filledFields,
    "Email",
  );

  await fillFirstMatch(
    page,
    [() => page.locator("#phone"), () => page.getByLabel(/phone/i)],
    profile.phone,
    filledFields,
    "Phone",
  );

  await fillFirstMatch(
    page,
    [() => page.getByLabel(/location/i), () => page.getByLabel(/city/i)],
    profile.location,
    filledFields,
    "Location",
  );

  await fillFirstMatch(
    page,
    [() => page.getByLabel(/linkedin/i)],
    profile.linkedinUrl,
    filledFields,
    "LinkedIn",
  );

  await fillFirstMatch(
    page,
    [() => page.getByLabel(/website|portfolio/i)],
    profile.portfolioUrl,
    filledFields,
    "Website/Portfolio",
  );

  await answerComboboxQuestions(page, QUESTION_ANSWERS(profile), filledFields);
}

export async function uploadResume(page, pdfPath, filledFields) {
  await uploadFile(
    page,
    [
      () => page.locator("#resume-upload_resume input[type=file]"),
      () => page.locator("input[name='resume']"),
      () => page.locator("input[type=file]").first(),
    ],
    pdfPath,
    filledFields,
    "Resume",
  );
}

export async function attachCoverLetter(page, coverLetterText, filledFields) {
  const filledAsText = await fillFirstMatch(
    page,
    [() => page.getByLabel(/cover letter/i)],
    coverLetterText,
    filledFields,
    "Cover Letter",
  );
  if (filledAsText) return;

  // Some Greenhouse forms only accept the cover letter as an uploaded file
  // rather than a text field.
  const tempPath = path.join(os.tmpdir(), `cover-letter-${randomUUID()}.txt`);
  fs.writeFileSync(tempPath, coverLetterText, "utf8");
  try {
    await uploadFile(
      page,
      [() => page.locator("#cover_letter")],
      tempPath,
      filledFields,
      "Cover Letter",
    );
  } finally {
    fs.unlinkSync(tempPath);
  }
}

export async function submit(page) {
  return clickFirstMatch(page, [
    () => page.locator("#submit_app"),
    () => page.getByRole("button", { name: /submit application/i }),
  ]);
}

export async function waitForConfirmation(page) {
  try {
    await page.waitForSelector("text=/thank you|application submitted|successfully applied/i", {
      timeout: 15000,
    });
    return true;
  } catch {
    return false;
  }
}
