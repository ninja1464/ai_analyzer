// Shared helpers for filling job-application forms whose exact markup drifts
// over time. Each helper tries several locator strategies and silently
// no-ops if the field can't be found — callers read back `filledFields` to
// know what actually landed, rather than trusting a filled-blind assumption.

export async function fillFirstMatch(page, locatorFactories, value, filledFields, fieldLabel) {
  if (!value) return false;
  for (const factory of locatorFactories) {
    try {
      const locator = factory();
      const count = await locator.count();
      if (count === 0) continue;
      const target = locator.first();
      await target.waitFor({ state: "visible", timeout: 1500 });
      await target.fill(String(value));
      filledFields[fieldLabel] = String(value);
      return true;
    } catch {
      // try next strategy
    }
  }
  return false;
}

export function byLabelOrPlaceholder(page, patterns) {
  return patterns.map((pattern) => () => page.getByLabel(pattern, { exact: false }));
}

export async function uploadFile(page, locatorFactories, filePath, filledFields, fieldLabel) {
  for (const factory of locatorFactories) {
    try {
      const locator = factory();
      const count = await locator.count();
      if (count === 0) continue;
      await locator.first().setInputFiles(filePath);
      // The site's own JS (parsing/preview/validation) reacts to the file
      // input's change event asynchronously — submitting immediately after
      // setInputFiles() can race it and still show a stale "required" error.
      await page.waitForTimeout(2000);
      filledFields[fieldLabel] = filePath.split("/").pop();
      return true;
    } catch {
      // try next strategy
    }
  }
  return false;
}

export async function clickFirstMatch(page, locatorFactories) {
  for (const factory of locatorFactories) {
    try {
      const locator = factory();
      const count = await locator.count();
      if (count === 0) continue;
      const target = locator.first();
      await target.waitFor({ state: "visible", timeout: 1500 });
      await target.click();
      return true;
    } catch {
      // try next strategy
    }
  }
  return false;
}

// Custom screening questions (e.g. "Do you require sponsorship?") are usually
// rendered as react-select-style comboboxes whose element id is randomly
// generated per posting, so they can't be targeted by id. Their accessible
// name (via aria-labelledby) is stable, so match on that instead.
export async function answerComboboxQuestions(page, questionAnswers, filledFields) {
  const comboboxes = await page.getByRole("combobox").all();

  for (const combo of comboboxes) {
    let accessibleName = "";
    try {
      accessibleName = await combo.evaluate((el) => {
        const labelledBy = el.getAttribute("aria-labelledby");
        if (labelledBy) {
          return labelledBy
            .split(" ")
            .map((id) => document.getElementById(id)?.textContent || "")
            .join(" ");
        }
        return el.getAttribute("aria-label") || "";
      });
    } catch {
      continue;
    }

    const match = questionAnswers.find(({ pattern }) => pattern.test(accessibleName));
    if (!match) continue;

    const answer = match.getAnswer();
    if (!answer) continue;

    try {
      await combo.click();
      const option = page.getByRole("option", { name: answer, exact: false });
      await option.first().waitFor({ state: "visible", timeout: 2000 });
      await option.first().click();
      filledFields[accessibleName.replace(/\*$/, "").trim()] = answer;
    } catch {
      // leave unanswered if this posting's widget doesn't match the expected shape
    }
  }
}
