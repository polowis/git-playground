import * as git from "isomorphic-git";
import { fs } from "../fs";

export async function getStatus(dir: string): Promise<git.StatusRow[]> {
  try {
    const statusMatrix = await git.statusMatrix({ fs, dir });
    return statusMatrix;
  } catch (error) {
    console.error("Error getting status:", error);
    throw error;
  }
}