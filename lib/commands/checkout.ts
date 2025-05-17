import * as git from "isomorphic-git";
import { fs } from "../fs";

export async function checkoutBranch(dir: string, branchName: string): Promise<string> {
  try {
    await git.checkout({ fs, dir, ref: branchName });
    return `Switched to branch '${branchName}'`;
  } catch (error) {
    console.error("Error checking out branch:", error);
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}
