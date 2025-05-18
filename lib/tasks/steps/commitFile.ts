import { Task } from "..";
import * as git from "isomorphic-git";

export const commitFileTask: Task = {
  id: "commit-file",
  title: "📝 Make a Commit",
  description: 'Run `git commit -m "Add alice.txt with greeting"` to save your changes.',
  content: "first-commit.md",
  validate: async ({ fs, dir }) => {
    try {
      const commits = await git.log({ fs, dir, depth: 1 });
      if (!commits.length) return false;

      const lastCommit = commits[0];
      const tree = await git.readTree({ fs, dir, oid: lastCommit.oid });
      return tree.tree.some((entry) => entry.path === "alice.txt");
    } catch {
      return false;
    }
  },
};
