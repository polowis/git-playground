import { getStatus } from "@/lib/commands/status";
import * as git from "isomorphic-git";
import { Task } from "..";
import { isGitRepository } from "@/lib/git-utils";

export const stagingAreaTask: Task = {
  id: "staging-area",
  title: "🎯 The Staging Area (aka “Index”)",
  description: "",
  content: "staging-area.md",

  init: async ({ fs, dir }) => {
    // Ensure Git repo exists
    const isRepo = await isGitRepository(dir);
    if (!isRepo) {
      await git.init({ fs, dir });
    }

    // Check if file already exists
    const fileExists = await fs
      .stat(`${dir}/alice.txt`)
      .then(() => true)
      .catch(() => false);

    // Only create if not there
    if (!fileExists) {
      await fs.writeFile(`${dir}/alice.txt`, "Hello Git!\n");
    }

    await git.resetIndex({ fs, dir, filepath: "alice.txt" });
    return true;
  },

  validate: async ({ fs, dir }) => {
    try {
      const statusMatrix = await getStatus(dir);
      for (const [filepath, headStatus, , stageStatus] of statusMatrix) {
        const file = filepath as string;
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

  cleanup: async ({ fs, dir }) => {
    try {
      // Remove file if it exists
      await fs.unlink(`${dir}/alice.txt`).catch(() => {});

      // Reset any stage data
      await git.remove({ fs, dir, filepath: "alice.txt" }).catch(() => {});
      return true;
    } catch {
      return false;
    }
  },
};
