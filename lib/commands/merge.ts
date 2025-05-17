import * as git from "isomorphic-git";
import { fs } from "../fs";
import { getCurrentBranch } from "./branch";


export async function mergeBranch(dir: string, branchName: string): Promise<string> {
  const authorName = localStorage.getItem("global.user.name") || "Git user";
  const authorEmail =
    localStorage.getItem("global.user.email") || "user@gitplayground.com";
  try {
    const currentBranch = await getCurrentBranch(dir);

    await git.merge({
      fs,
      dir,
      theirs: branchName,
      author: {
        name: authorName,
        email: authorEmail,
      },
    });

    return `Merged branch '${branchName}' into ${currentBranch}`;
  } catch (error) {
    console.error("Error merging branch:", error);
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}