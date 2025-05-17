import * as git from "isomorphic-git";
import { fs } from "../fs";
import { getCurrentBranch } from "./branch";

export async function commitChanges(
  dir: string,
  message: string
): Promise<string> {
  const authorName = localStorage.getItem("global.user.name") || "Git user";
  const authorEmail =
    localStorage.getItem("global.user.email") || "user@gitplayground.com";
  try {
    const sha = await git.commit({
      fs,
      dir,
      message,
      author: {
        name: authorName,
        email: authorEmail,
      },
    });
    return `[${await getCurrentBranch(dir)} ${sha.slice(0, 7)}] ${message}`;
  } catch (error) {
    console.error("Error committing changes:", error);
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}
