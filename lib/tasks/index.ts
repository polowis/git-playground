import FS from "@isomorphic-git/lightning-fs";
import * as git from "isomorphic-git";
import { getStatus } from "../commands/status";

export interface Task {
  id: string;
  title: string;
  description: string;
  content: string;
  init?: (args: { fs: FS.PromisifiedFS; dir: string }) => void;
  validate: (args: { fs: FS.PromisifiedFS; dir: string }) => Promise<boolean>;
  cleanup?: (args: { fs: FS.PromisifiedFS; dir: string }) => void;
}

export const tasks: Task[] = [
  {
    id: "app-overview",
    title: "Overview",
    description: "",
    content: "app-overview.md",
    validate: async () => {
      return true;
    },
  },
  {
    id: "git-config",
    title: "Setup your identity",
    description: "Use git config to setup your identity",
    content: "setup-your-identity.md",
    validate: async () => {
      return (
        localStorage.getItem("global.user.name") !== null &&
        localStorage.getItem("global.user.email") != null
      );
    },
  },
  {
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
  },
  {
    id: "project-overview",
    title: "📁 See What's in Your Project",
    description:
      "Before we dive deeper into Git, it helps to see what's in your current folder.",
    content: "project-overview.md",
    validate: async () => {
      return true;
    },
  },

  {
    id: "staging-area",
    title: "🎯 The Staging Area (aka “Index”)",
    description: "",
    content: "staging-area.md",
    validate: async ({ fs, dir }) => {
      try {
        const statusMatrix = await getStatus(dir);
        for (const [filepath, headStatus, stageStatus] of statusMatrix) {
          const file = filepath as string;
          // File is staged (added)
          if (headStatus === 0 && stageStatus === 2) {
            if (file === "alice.txt") {
              return true;
            }
          }
        }
        return false;
      } catch {
        return false;
      }
    },
  },
  {
    id: "commit-file",
    title: "📝 Make a Commit",
    description:
      'Run `git commit -m "Add alice.txt with greeting"` to save your changes.',
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
  },
];
