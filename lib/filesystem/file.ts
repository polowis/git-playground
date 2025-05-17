import { fs } from "../fs";

export async function readFile(currentDir: string, filename: string) {
  try {
    const content = await fs.readFile(`${currentDir}/${filename}`, {
      encoding: "utf8",
    });
    return content;
  } catch (error) {
    return `Error: File '${filename}' does not exist or cannot be read`;
  }
}

export async function writeToFile(
  currentDir: string,
  filename: string,
  content: string
) {
  try {
    await fs.writeFile(`${currentDir}/${filename}`, content);
    return `Wrote to file: ${filename}`;
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}
