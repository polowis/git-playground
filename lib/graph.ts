import * as git from "isomorphic-git";
import { fs } from "./fs";
import { getCurrentBranch } from "./commands/branch";

export type VisualizationData = {
  commits: git.ReadCommitResult[];
  branches: string[];
  branchHeads: Record<string, string>;
  currentBranch: string;
};
export async function getVisualizationData(dir: string): Promise<VisualizationData> {
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
    console.error("Error getting visualisation data:", error);
    return {
      commits: [],
      branches: [],
      branchHeads: {},
      currentBranch: "",
    };
  }
}
