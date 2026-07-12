import { findOne, updateOne } from "../db.js";

const PROFILE_FIELDS = [
  "firstName",
  "lastName",
  "phone",
  "location",
  "linkedinUrl",
  "portfolioUrl",
  "githubUrl",
  "currentCompany",
  "workAuthorization",
  "needsSponsorship",
  "willingToRelocate",
  "noticePeriod",
  "salaryExpectation",
  "howDidYouHearAboutUs",
];

export const getApplicantProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const profile = await findOne("applicantProfiles", { userId });
    return res.status(200).json({ success: true, data: profile || { userId } });
  } catch (error) {
    console.error("GET APPLICANT PROFILE ERROR:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const updateApplicantProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const update = { userId, updatedAt: new Date().toISOString() };
    for (const field of PROFILE_FIELDS) {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field];
      }
    }

    await updateOne("applicantProfiles", { userId }, { $set: update }, { upsert: true });
    const profile = await findOne("applicantProfiles", { userId });

    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error("UPDATE APPLICANT PROFILE ERROR:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};
