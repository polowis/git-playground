import { Task } from "..";

export const initRepoTask: Task = {
  id: "init-repo",
  title: "🧱 Initialize a Repository",
  description: "Run `git init` to start a repository.",
  content: "init-repo.md",
  validate: async ({ fs, dir }) => {
    try {
      const stat = await fs.stat(`${dir}/.git`);
      return !!stat;
    } catch {
      return false;
    }
  },
};
