// lib/tasks.ts
import * as git from 'isomorphic-git';

export interface Task {
  id: string;
  title: string;
  description: string;
  validate: (args: { fs: any; dir: string }) => Promise<boolean>;
}

export const tasks: Task[] = [
  {
    id: 'init-repo',
    title: 'Initialize a Repository',
    description: 'Run `git init` to start a repository.',
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
    id: 'first-commit',
    title: 'Make Your First Commit',
    description: 'Create a file, add it, and commit it.',
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
