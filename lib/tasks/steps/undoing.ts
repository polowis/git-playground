import * as git from "isomorphic-git";
import { Task } from "..";
import { isGitRepository } from "@/lib/git-utils";
import { getStatus } from "@/lib/commands/status";
import { commitChanges } from "@/lib/commands/commit";

export const undoingTask: Task = {
  id: "undoing",
  title: "↩️ Undoing with git reset",
  description: "Learn how to unstage a file using `git reset`.",
  content: "undoing.md",

  init: async ({ fs, dir }) => {
    // Ensure the repo exists
    const isRepo = await isGitRepository(dir);
    if (!isRepo) {
      await git.init({ fs, dir });
    }

    // Create the file if not there
    const filepath = `${dir}/alice.txt`;
    const fileExists = await fs
      .stat(filepath)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      await fs.writeFile(filepath, "Hello Git!\n");
      await git.add({ fs, dir, filepath: "alice.txt" });
      await commitChanges(dir, "Add alice.txt with greeting");
      // Append a line to simulate a new change
      const existing = await fs.readFile(filepath, { encoding: "utf8" });
      const newContent =
        existing +
        "I met an interesting turtle while the song on the radio blasted away\n";
      await fs.writeFile(filepath, newContent);

      // Stage the change
      await git.add({ fs, dir, filepath: "alice.txt" });
    }

    return true;
  },

  validate: async ({ dir }) => {
    try {
      const statusMatrix = await getStatus(dir);

      for (const [
        filepath,
        headStatus,
        workdirStatus,
        stageStatus,
      ] of statusMatrix) {
        if (filepath === "alice.txt") {
          // File is modified in working directory (2)
          // but NOT staged (stageStatus 0)
          if (headStatus === 0 && workdirStatus === 2 && stageStatus === 0) {
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
      await fs.unlink(`${dir}/alice.txt`).catch(() => {});
      await git.remove({ fs, dir, filepath: "alice.txt" }).catch(() => {});
      return true;
    } catch {
      return false;
    }
  },
};
