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


/**
 * 
 * @param dir This command will delete everything include .git folder
 */

export async function deleteEverything(dir: string) {
  try {
    const entries = await fs.readdir(dir);

    for (const entry of entries) {

      const fullPath = path.join(dir, entry);
      const stat = await fs.lstat(fullPath);

      if (stat.type === "dir") {
        await deleteEverything(fullPath);  // Recurse
        await fs.rmdir(fullPath);          // Remove empty folder
      } else {
        await fs.unlink(fullPath);         // Delete file
      }
    }
  } catch (err) {
    console.error(`Error deleting: ${dir}`, err);
  }
}