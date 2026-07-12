const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;
const ADZUNA_COUNTRY = process.env.ADZUNA_COUNTRY || "de";

export async function searchJobs({ keywords, location, resultsCount = 15 }) {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    throw new Error("Job search isn't configured — ADZUNA_APP_ID / ADZUNA_APP_KEY are missing.");
  }
  if (!keywords) {
    throw new Error("keywords is required");
  }

  const params = new URLSearchParams({
    app_id: ADZUNA_APP_ID,
    app_key: ADZUNA_APP_KEY,
    results_per_page: String(resultsCount),
    what: keywords,
    "content-type": "application/json",
  });
  if (location) params.set("where", location);

  const url = `https://api.adzuna.com/v1/api/jobs/${ADZUNA_COUNTRY}/search/1?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Adzuna search failed (${res.status})`);
  }
  const data = await res.json();
  const rawResults = data.results || [];

  // Adzuna's result link is their own tracking/landing page, not the
  // original company posting — getting to that requires following their
  // click-through redirect, which is rate-limited against scripted access
  // (we hit a 429 attempting it). So this app can't auto-detect whether a
  // result is Greenhouse/Lever; that's confirmed by actually opening the
  // listing, which is what "View posting" is for.
  return rawResults.map((job) => ({
    title: job.title,
    company: job.company?.display_name || null,
    location: job.location?.display_name || null,
    description: job.description,
    url: job.redirect_url,
    createdAt: job.created,
  }));
}
