import fs from "fs";
import { PDFParse } from "pdf-parse";

export const parseResume = async (filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();

    return result.text;
  } catch (error) {
    console.error("Parsing error:", error);
    throw new Error("Failed to parse resume");
  }
};
