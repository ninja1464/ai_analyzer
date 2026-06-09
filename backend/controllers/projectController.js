import { randomUUID } from "crypto";
import { readDB, writeDB } from "../db.js";

export const createProject = async (req, res) => {
  try {
    const { title, summary, technologies, repositoryUrl } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    if (!title || !summary) {
      return res.status(400).json({
        success: false,
        error: "title and summary are required",
      });
    }

    const projects = await readDB("projects.json");
    const newProject = {
      id: randomUUID(),
      userId,
      title,
      summary,
      technologies: Array.isArray(technologies) ? technologies : [],
      repositoryUrl: repositoryUrl || null,
      createdAt: new Date().toISOString(),
    };

    projects.push(newProject);
    await writeDB(projects, "projects.json");

    return res.status(201).json({
      success: true,
      data: newProject,
    });
  } catch (error) {
    console.error("PROJECT CREATE ERROR:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

export const listProjects = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const projects = await readDB("projects.json");
    const userProjects = projects.filter(
      (project) => project.userId === userId,
    );
    return res.status(200).json({ success: true, data: userProjects });
  } catch (error) {
    console.error("PROJECT LIST ERROR:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
