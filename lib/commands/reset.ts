import * as git from "isomorphic-git";
import { fs } from "../fs";

export async function gitReset(dir: string, filepath: string): Promise<string> {
  await git.resetIndex({ fs, dir, filepath });
  return `<color='lightgreen'>M</color>   ${filepath}`;
}

export async function gitResetAll(dir: string): Promise<string> {
  const status = await git.statusMatrix({ fs, dir });

  // Filter to get only the files that are staged (status = 2 means staged for commit)
  const stagedFiles = status
    .filter(([filepath, , , stageStatus]) => stageStatus == 2)
    .map(([filepath]) => filepath);

  let result = "Unstaged changes after reset: \n";
  // Unstage each staged file
  for (const filepath of stagedFiles) {
    const output = await gitReset(dir, filepath);
    result += `${output}\n`;
  }

  return result;
}

export async function gitResetHard() {
  
}