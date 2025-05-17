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