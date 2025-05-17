import * as git from "isomorphic-git";
import { fs } from "../fs";
import { diffCommitVsHead } from "./diff";

export async function gitShow(
  dir: string,
  commitHash?: string
): Promise<string> {
  try {
    let result = "";

    // If no commit hash is provided, get the latest commit (HEAD)
    if (!commitHash) {
      const log = await git.log({ fs: fs, dir, ref: "HEAD" });
      commitHash = log[0].oid;
    } else { // grab full oid hash
      commitHash = await git.expandOid({ fs, dir, oid: commitHash });
    }

    // Retrieve the commit details
    const commit = await git.readCommit({ fs: fs, dir, oid: commitHash });

    // Get the commit message, author, and date
    const commitMessage = commit.commit.message;
    const commitAuthor = commit.commit.author;
    const commitDate = new Date(
      commit.commit.author.timestamp * 1000
    ).toLocaleString();

    // Concatenate commit details
    result += `commit ${commitHash}\n`;
    result += `Author: ${commitAuthor.name} <${commitAuthor.email}>\n`;
    result += `Date: ${commitDate}\n\n`;
    result += `${commitMessage}\n`;

    const diff = await diffCommitVsHead(dir, commitHash)
    result += diff

    return result;
  } catch (error) {
    return `Error: ${error}\n`;
  }
}
