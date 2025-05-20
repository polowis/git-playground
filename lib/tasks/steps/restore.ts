import * as git from "isomorphic-git";
import { Task } from "..";
import { isGitRepository } from "@/lib/git-utils";
import { commitChanges } from "@/lib/commands/commit";

export const restoreFileTask: Task = {
  id: "restore-file",
  title: "🗑️ Discard Changes with git checkout",
  description:
    "Use `git checkout -- <file>` to discard working directory changes.",
  content: "restore-file.md",

  init: async ({ fs, dir }) => {
    const filepath = "alice.txt";

    // Ensure repo exists
    const isRepo = await isGitRepository(dir);
    if (!isRepo) {
      await git.init({ fs, dir });
    }

    // Write and commit initial content
    const initialContent = "Hello Git!\n";
    await fs.writeFile(`${dir}/${filepath}`, initialContent);
    await git.add({ fs, dir, filepath });
    await commitChanges(dir, "Add alice.txt with greeting");

    // Modify the file (but DO NOT stage it)
    const modifiedContent =
      initialContent +
      "I met an interesting turtle while the song on the radio blasted away.\n";
    await fs.writeFile(`${dir}/${filepath}`, modifiedContent);

    return true;
  },

  validate: async ({ fs, dir }) => {
    const filepath = "alice.txt";
    const fullPath = `${dir}/${filepath}`;

    try {
      const fileContent = await fs.readFile(fullPath, { encoding: "utf8" });

      // Check if file content matches the committed version
      if (fileContent === "Hello Git!\n") {
        return true; // Success: user has discarded changes
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
