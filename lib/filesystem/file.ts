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

// Append content to a file (manual implementation)
export async function appendToFile(dir: string, filename: string, content: string) {
  const filePath = path.join(dir, filename);

  try {
    const fileExists = await fs.stat(filePath).then(() => true).catch(() => false);

    let existingContent = '';
    if (fileExists) {
      existingContent = await readFile(dir, filename)
    }

    // Append the new content to the existing content
    const newContent = existingContent + content + '\n'; // Adding newline after appending

    // Write the combined content back to the file
    await writeToFile(dir, filename, newContent);
  } catch (error) {
    throw new Error(`Failed to append to file: ${error}`);
  }
}


