import * as git from "isomorphic-git";
import { fs } from "../fs";

export async function getLog(dir: string): Promise<string> {
  try {
    const commits = await git.log({ fs, dir });

    if (commits.length === 0) {
      return "No commits yet";
    }

    let output = "";

    for (const commit of commits) {
      output += `commit ${commit.oid}\n`;
      output += `Author: ${commit.commit.author.name} <${commit.commit.author.email}>\n`;
      output += `Date: ${new Date(
        commit.commit.author.timestamp * 1000
      ).toLocaleString()}\n\n`;
      output += `    ${commit.commit.message}\n\n`;
    }

    return output;
  } catch (error) {
    console.error("Error getting log:", error);
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}

export async function getFileCommitHistory(dir: string, filepath: string) {
  const commits = await git.log({ fs, dir });
  let lastSHA = null;
  let lastCommit = null;
  const commitsThatMatter: (git.ReadCommitResult | null)[] = [];
  for (const commit of commits) {
    try {
      const o = await git.readObject({ fs, dir, oid: commit.oid, filepath });
      if (o.oid !== lastSHA) {
        if (lastSHA !== null) commitsThatMatter.push(lastCommit);
        lastSHA = o.oid;
      }
    } catch (err) {
      // file no longer there
      commitsThatMatter.push(lastCommit);
      break;
    }
    lastCommit = commit;
  }
  return commitsThatMatter
}

export async function getCommitHistoryLog(dir: string, filepath: string) {
  const commitsThatMatter = await getFileCommitHistory(dir, filepath);

  let output = "";

  for (const commit of commitsThatMatter) {
    if (!commit) continue;
    output += `commit ${commit.oid}\n`;
    output += `Author: ${commit.commit.author.name} <${commit.commit.author.email}>\n`;
    output += `Date: ${new Date(
      commit.commit.author.timestamp * 1000
    ).toLocaleString()}\n\n`;
    output += `    ${commit.commit.message}\n\n`;
  }
  return output;
}
