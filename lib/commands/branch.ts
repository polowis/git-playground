import * as git from "isomorphic-git";
import { fs } from "../fs";

export async function getCurrentBranch(dir: string): Promise<string> {
  try {
    const currentBranch = await git.currentBranch({ fs, dir });
    return currentBranch || "HEAD";
  } catch (error) {
    console.error("Error getting current branch:", error);
    return "unknown";
  }
}

export async function createBranch(
  dir: string,
  branchName: string
): Promise<string> {
  try {
    await git.branch({ fs, dir, ref: branchName });
    return `Created branch '${branchName}'`;
  } catch (error) {
    console.error("Error creating branch:", error);
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}

export async function listBranches(dir: string): Promise<string> {
  try {
    const branches = await git.listBranches({ fs, dir });
    const currentBranch = await getCurrentBranch(dir);

    if (branches.length === 0) {
      return "No branches";
    }

    let output = "";

    for (const branch of branches) {
      if (branch === currentBranch) {
        output += `* ${branch}\n`;
      } else {
        output += `  ${branch}\n`;
      }
    }

    return output;
  } catch (error) {
    console.error("Error listing branches:", error);
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}

export async function isBranchExist(
  dir: string,
  branchName: string
): Promise<boolean> {
  const branches = await git.listBranches({ fs, dir });
  for (const branch of branches) {
    if (branch === branchName) {
      return true;
    }
  }
  return false;
}
