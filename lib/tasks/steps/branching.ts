import * as git from "isomorphic-git";
import { Task } from "..";

export const branchingTask: Task = {
  id: "branching",
  title: "🌿 Branching",
  description:
    "Learn how to use `git branch` and `git checkout` to work on separate branches safely.",
  content: "branching.md",

  validate: async ({ fs, dir }) => {
    try {
      const currentBranch = await git.currentBranch({ fs, dir, fullname: false });

      const branches = await git.listBranches({ fs, dir });
      return branches.includes("feature-turtle") && currentBranch === "feature-turtle";
    } catch {
      return false;
    }
  },
};
