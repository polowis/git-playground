import * as git from "isomorphic-git";
import { fs } from "../fs";
import { getStatus } from "./status";

export async function addFiles(dir: string, filepath: string): Promise<string> {
  try {
    if (filepath === ".") {
      // Add all files
      const statusMatrix = await getStatus(dir);
      for (const [file] of statusMatrix) {
        const status = await git.status({ fs, dir, filepath: file as string });
        if (status === "deleted") {
          await git.remove({ fs, dir, filepath });
        } else {
          await git.add({ fs, dir, filepath: file as string });
        }
      }
      return "Added all files to staging area";
    } else {
      // Add specific file
      const status = await git.status({ fs, dir, filepath });
      if (status === "deleted") {
        await git.remove({ fs, dir, filepath });
      } else {
        await git.add({ fs, dir, filepath });
      }
      return `Added '${filepath}' to staging area`;
    }
  } catch (error) {
    console.error("Error adding files:", error);
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}
