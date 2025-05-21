import * as git from "isomorphic-git";
import { Task } from "..";

export const mergeTask: Task = {
  id: "merging",
  title: "🔀 Bringing It All Together",
  description: "Merge your turtle work into the master branch so it's part of the main project.",
  content: "merging.md",

  validate: async ({ fs, dir }) => {
    const filepath = "turtle.txt";

    try {
      const currentBranch = await git.currentBranch({ fs, dir, fullname: false });
      if (currentBranch !== "master") return false;

      // Check if turtle.txt exists in HEAD (committed)
      const statusMatrix = await git.statusMatrix({ fs, dir, filepaths: [filepath] });
      const [ , headStatus ] = statusMatrix[0];

      const isCommitted = headStatus === 1 || headStatus === 0;
      return isCommitted;
    } catch {
      return false;
    }
  },
};
