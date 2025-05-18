import * as git from "isomorphic-git";
import { fs } from "../fs";
import { commitChanges } from "./commit";

export async function initRepo(dir: string): Promise<string> {
  try {
    await git.init({ fs, dir, defaultBranch: 'master' });
    await commitChanges(dir, 'Initial commit');
    return `Initialized empty Git repository at ${dir}`;
  } catch (error) {
    console.error("Error initializing repository:", error);
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}