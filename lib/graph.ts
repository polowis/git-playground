import * as git from "isomorphic-git";
import { fs } from "./fs";
import { getCurrentBranch } from "./commands/branch";

export async function getVisualizationData(dir: string) {
  try {
    const commits = await git.log({ fs, dir });
    const branches = await git.listBranches({ fs, dir });
    const currentBranch = await getCurrentBranch(dir);

    // Get the commit each branch points to
    const branchHeads: Record<string, string> = {};
    for (const branch of branches) {
      try {
        const oid = await git.resolveRef({ fs, dir, ref: branch });
        branchHeads[branch] = oid;
      } catch (error) {
        console.error(`Error resolving ref for branch ${branch}:`, error);
      }
    }

    return {
      commits,
      branches,
      branchHeads,
      currentBranch,
    };
  } catch (error) {
    console.error("Error getting visualization data:", error);
    return {
      commits: [],
      branches: [],
      branchHeads: {},
      currentBranch: "",
    };
  }
}