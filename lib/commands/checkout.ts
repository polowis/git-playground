import * as git from "isomorphic-git";
import { fs } from "../fs";

export async function checkoutFiles(dir: string, file: string) {
  try {
    await git.checkout({ fs, dir, filepaths: [file], force: true });
    return `Switched to commit: ${file}`;
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}
export async function checkoutBranch(
  dir: string,
  branchName: string
): Promise<string> {
  try {
    await git.checkout({ fs, dir, ref: branchName });
    return `Switched to branch '${branchName}'`;
  } catch (error) {
    console.error("Error checking out branch:", error);
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}
