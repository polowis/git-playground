import * as git from "isomorphic-git";
import { fs } from "./fs";

export async function isGitRepository(dir: string): Promise<boolean> {
  try {
    await git.findRoot({ fs, filepath: dir });
    return true;
  } catch (error) {
    return false;
  }
}