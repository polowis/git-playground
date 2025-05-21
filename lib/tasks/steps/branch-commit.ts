import { Task } from "..";
import * as git from "isomorphic-git";

export const branchingCommitTask: Task = {
  id: "branching-commit",
  title: "🎭 The Disappearing Trick",
  description: 'Parallel Worlds: A File in One, Gone in Another',
  content: "branching-commit.md",
  validate: async ({ fs, dir }) => {
    const filepath = "turtle.txt";
    const targetBranch = "feature-turtle";

    try {
      // Save the current branch
      const currentBranch = await git.currentBranch({ fs, dir, fullname: false });
      if(!currentBranch) return false;

      if (currentBranch !== targetBranch) {
        await git.checkout({ fs, dir, ref: targetBranch });
      }

      const statusMatrix = await git.statusMatrix({ fs, dir, filepaths: [filepath] });
      const [ , headStatus ] = statusMatrix[0];

      const isCommitted = headStatus === 0 || headStatus === 1;

      if (currentBranch !== "feature-turtle") {
        await git.checkout({ fs, dir, ref: currentBranch });
      }

      return isCommitted;
    } catch {
      return false;
    }
  },
};
