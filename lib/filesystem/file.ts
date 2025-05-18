import path from "path";
import { fs } from "../fs";

export async function readFile(currentDir: string, filename: string) {
  try {
    const filePath = path.join(currentDir, filename);
    const content = await fs.readFile(filePath, {
      encoding: "utf8",
    });
    return content;
  } catch {
    return `Error: File '${filename}' does not exist or cannot be read`;
  }
}

export async function writeToFile(
  currentDir: string,
  filename: string,
  content: string
) {
  try {
    const filePath = path.join(currentDir, filename);
    await fs.writeFile(filePath, content);
    return `Wrote to file: ${filename}`;
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}
