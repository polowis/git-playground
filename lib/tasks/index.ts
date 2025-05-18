import * as git from "isomorphic-git";

export interface Task {
  id: string;
  title: string;
  description: string;
  validate: (args: { fs: any; dir: string }) => Promise<boolean>;
}

export const tasks: Task[] = [
  {
    id: "git-config",
    title: "Setup your identity",
    description: "Use git config to setup your identity",
    validate: async () => {
      return localStorage.getItem('global.user.name') !== null && localStorage.getItem('global.user.email') != null;
    },
  },
  {
    id: "init-repo",
    title: "Initialize a Repository",
    description: "Run `git init` to start a repository.",
    validate: async ({ fs, dir }) => {
      try {
        const stat = await fs.stat(`${dir}/.git`);
        return !!stat;
      } catch {
        return false;
      }
    },
  },
  {
    id: "first-commit",
    title: "Make Your First Commit",
    description: "Create a file, add it, and commit it.",
    validate: async ({ fs, dir }) => {
      try {
        const log = await git.log({ fs, dir });
        return log.length > 0;
      } catch {
        return false;
      }
    },
  },
];
