import { fillFirstMatch, uploadFile, clickFirstMatch } from "./formUtils.js";

export async function fillForm(page, profile, userEmail, filledFields) {
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();

  await fillFirstMatch(
    page,
    [() => page.locator("input[name='name']"), () => page.getByLabel(/full name/i)],
    fullName,
    filledFields,
    "Full Name",
  );

  await fillFirstMatch(
    page,
    [() => page.locator("input[name='email']"), () => page.getByLabel(/^email/i)],
    userEmail,
    filledFields,
    "Email",
  );

  await fillFirstMatch(
    page,
    [() => page.locator("input[name='phone']"), () => page.getByLabel(/phone/i)],
    profile.phone,
    filledFields,
    "Phone",
  );

  await fillFirstMatch(
    page,
    [() => page.locator("input[name='org']"), () => page.getByLabel(/current company/i)],
    profile.currentCompany,
    filledFields,
    "Current Company",
  );

  await fillFirstMatch(
    page,
    [() => page.locator("input[name='urls[LinkedIn]']"), () => page.getByLabel(/linkedin/i)],
    profile.linkedinUrl,
    filledFields,
    "LinkedIn",
  );

  await fillFirstMatch(
    page,
    [
      () => page.locator("input[name='urls[Portfolio]']"),
      () => page.getByLabel(/portfolio|website/i),
    ],
    profile.portfolioUrl,
    filledFields,
    "Portfolio",
  );

  await fillFirstMatch(
    page,
    [() => page.locator("input[name='urls[GitHub]']"), () => page.getByLabel(/github/i)],
    profile.githubUrl,
    filledFields,
    "GitHub",
  );
}

export async function uploadResume(page, pdfPath, filledFields) {
  await uploadFile(
    page,
    [() => page.locator("input[name='resume']"), () => page.locator("input[type=file]").first()],
    pdfPath,
    filledFields,
    "Resume",
  );
}

export async function attachCoverLetter(page, coverLetterText, filledFields) {
  await fillFirstMatch(
    page,
    [
      () => page.locator("textarea[name='comments']"),
      () => page.getByLabel(/additional information|cover letter/i),
    ],
    coverLetterText,
    filledFields,
    "Cover Letter",
  );
}

export async function submit(page) {
  return clickFirstMatch(page, [
    () => page.locator("button[type='submit']"),
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
