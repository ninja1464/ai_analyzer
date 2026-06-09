import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveDataPath(filename = "projects.json") {
  return path.resolve(__dirname, "data", filename);
}

export async function readDB(filename = "projects.json") {
  const filePath = resolveDataPath(filename);

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await writeDB([], filename);
      return [];
    }
    throw error;
  }
}

export async function writeDB(data, filename = "projects.json") {
  const filePath = resolveDataPath(filename);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}
