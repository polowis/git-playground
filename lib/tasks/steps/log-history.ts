import { Task } from "..";
import * as git from "isomorphic-git";

export const logHistoryTask: Task = {
  id: "log-history",
  title: "📜 View Your Project History",
  description: "Run `git log` to see your commit history.",
  content: "log-history.md",
  validate: async ({ fs, dir }) => {
    try {
      const commits = await git.log({ fs, dir, depth: 1 });
      if (!commits.length) {
        return false;
      }

      const lastCommit = commits[0];
      const tree = await git.readTree({ fs, dir, oid: lastCommit.oid });

      return tree.tree.some((entry) => entry.path === "alice.txt");
    } catch {
      return false;
    }
  },
};
