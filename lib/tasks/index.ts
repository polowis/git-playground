import FS from "@isomorphic-git/lightning-fs";
import * as git from "isomorphic-git";

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
      return true
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
    validate: async ({ fs, dir }) => {
      return true;
    },
  },

  {
    id: "staging-area",
    title: "🎯 The Staging Area (aka “Index”)",
    description: "",
    content: "staging-area.md",
    validate: async ({ fs, dir }) => {
      return true;
    },
  },
];
