import * as git from "isomorphic-git";
import { fs } from "./fs";
import { mergeBranch } from "./commands/merge";
import { commitChanges } from "./commands/commit";
import { createBranch, listBranches } from "./commands/branch";
import { checkoutBranch } from "./commands/checkout";
import { formatStatus, getHelpText, isGitRepository } from "./git-utils";
import { getCommitHistoryLog, getLog } from "./commands/log";
import { addFiles } from "./commands/staging";
import { initRepo } from "./commands/init";
import { cherryPick } from "./commands/cherry-pick";
import { diffUnstagedChangesVsLastCommit } from "./commands/diff";
import { readFile, writeToFile } from "./filesystem/file";
import { gitShow } from "./commands/show";
import { setGitConfig } from "./commands/config";

export const dir = "/workspace"; // root dir
export let currentDir = "/workspace"; // Mutable for file-level commands

// Execute a Git command
export async function executeGitCommand(commandLine: string): Promise<string> {
  const parts = commandLine.trim().split(/\s+/);
  const command = parts[0];

  // Handle non-git commands
  if (command === "clear") {
    return "CLEAR_TERMINAL";
  }

  if (command === "help") {
    return getHelpText();
  }

  if (command === "ls") {
    try {
      const files = await fs.readdir(currentDir);
      return files.join("\n") || "(empty directory)";
    } catch (error) {
      return `Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    }
  }

  if (command === "touch") {
    if (parts.length < 2) {
      return "Error: Missing filename";
    }
    const filename = parts[1];
    try {
      await fs.writeFile(`${currentDir}/${filename}`, "");
      return `Created file: ${filename}`;
    } catch (error) {
      return `Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    }
  }

  if (command === "mkdir") {
    if (parts.length < 2) {
      return "Error: Missing directory name";
    }

    const dirname = parts[1];

    try {
      await fs.mkdir(`${dir}/${dirname}`);
      return `Created directory: ${dirname}`;
    } catch (error) {
      return `Error creating directory: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    }
  }

  if (command === "cd") {
    if (parts.length < 2) return "Error: Missing directory";

    const target = parts[1];
    if (target === "/") {
      currentDir = dir;
      return `Changed directory to ${currentDir}`;
    }

    if (target === "..") {
      const segments = currentDir.split("/").filter(Boolean);
      segments.pop(); // Go up one level
      currentDir = "/" + segments.join("/");
      return `Changed directory to ${currentDir}`;
    }

    const newPath = `${currentDir}/${target}`;
    try {
      const stat = await fs.stat(newPath);
      if (stat.type !== "dir") return `Error: '${target}' is not a directory`;
      currentDir = newPath;
      return `Changed directory to ${currentDir}`;
    } catch {
      return `Error: Directory '${target}' does not exist`;
    }
  }

  if (command === "echo") {
    // Handle echo "content" > file
    const cmdStr = commandLine.trim();
    const match = cmdStr.match(/echo\s+"([^"]*)"\s+>\s+(\S+)/);

    if (!match) {
      return 'Usage: echo "content" > filename';
    }

    const [, content, filename] = match;
    return await writeToFile(currentDir, filename, content);
  }

  if (command === "cat") {
    if (parts.length < 2) {
      return "Error: Missing filename";
    }

    const filename = parts[1];
    return await readFile(currentDir, filename);
  }

  if (command === "rm") {
    if (parts.length < 2) {
      return "Error: Missing filename or folder";
    }

    const flags = parts[1].startsWith("-") ? parts[1].slice(1) : "";
    const targetIndex = parts[1].startsWith("-") ? 2 : 1;
    const target = parts[targetIndex];
    const fullPath = `${currentDir}/${target}`;

    if (target.endsWith(".git")) {
      return "Cannot delete .git folder. Please use reset button instead";
    }

    const recursive = flags.includes("r");
    const force = flags.includes("f");
    const verbose = flags.includes("v");
    const interactive = flags.includes("i");

    async function confirmDeletion(path: string) {
      if (!interactive) return true;
      return confirm(`Delete ${path}?`); // Simulate with window.confirm() or similar
    }

    async function rmrf(path: string, relativePath: string) {
      try {
        const stat = await fs.lstat(path);

        if (stat.type === "dir") {
          if (!recursive) {
            return `Error: '${target}' is a directory. Use -r to delete folders.`;
          }
          const entries = await fs.readdir(path);
          for (const entry of entries) {
            await rmrf(`${path}/${entry}`, `${relativePath}/${entry}`);
          }
          if (await confirmDeletion(path)) {
            await fs.rmdir(path);
            if (verbose) console.log(`Removed directory: ${path}`);
          }
        } else {
          if (await confirmDeletion(path)) {
            await fs.unlink(path);
            if (verbose) console.log(`Removed file: ${path}`);
            try {
              await git.remove({ fs, dir: dir, filepath: relativePath });
            } catch (err) {
              console.error(err);
              if (!force) throw err; // Swallow error if force is enabled
            }
          }
        }
      } catch (error) {
        if (!force) {
          throw error;
        }
      }
    }

    try {
      const relativePath = fullPath.replace(dir + "/", "");
      await rmrf(fullPath, relativePath);
      return verbose ? `Removed: ${target}` : "";
    } catch (error) {
      return `Error: '${target}' could not be deleted. ${error}`;
    }
  }

  // Handle git commands
  if (command !== "git") {
    return `Command not found: ${command}`;
  }

  const gitCommand = parts[1];

  // Handle git init
  if (gitCommand === "init") {
    return await initRepo(dir);
  }

  // Check if git is initialized for all other commands
  const isRepo = await isGitRepository(dir);
  if (!isRepo && gitCommand !== "init") {
    return "Not a git repository. Use 'git init' to create a new repository.";
  }

  // Handle git status
  if (gitCommand === "status") {
    return await formatStatus(dir);
  }

  // Handle git add
  if (gitCommand === "add") {
    if (parts.length < 3) {
      return "Error: No files specified";
    }

    const filesToAdd = parts.slice(2);

    const results = [];
    for (const filepath of filesToAdd) {
      const result = await addFiles(dir, filepath);
      results.push(result);
    }

    // Return a message for all files added
    return results.join("\n");
  }

  if (gitCommand === "diff") {
    return await diffUnstagedChangesVsLastCommit(dir);
  }

  if (gitCommand === "cherry-pick") {
    // Check if we have a commit hash (the commit ID to cherry-pick)
    if (parts.length < 2) {
      return "Error: Invalid or missing commit hash. Use: git cherry-pick <commit>";
    }

    // Extract the commit hash (should be the second argument)
    const commitHash = parts[2];

    try {
      return await cherryPick(dir, commitHash);
    } catch (error) {
      return `Error: Failed to cherry-pick commit ${commitHash}. ${error}`;
    }
  }

  // Handle git commit
  if (gitCommand === "commit") {
    // Check for -m flag and message
    if (parts[2] !== "-m" || !parts[3]) {
      return 'Error: Missing commit message. Use: git commit -m "message"';
    }

    // Extract commit message (handle quotes)
    let message = parts.slice(3).join(" ");
    if (message.startsWith('"') && message.endsWith('"')) {
      message = message.slice(1, -1);
    }

    return await commitChanges(dir, message);
  }

  // handle git show
  if (gitCommand === "show") {
    if (parts.length > 2) {
      return await gitShow(dir, parts[2]);
    }
    return await gitShow(dir);
  }

  if (gitCommand === "config") {
    if (parts.length < 4) {
      return "Error: Missing arguments. Usage: git config --global key value";
    }

    const isGlobal = parts.includes("--global"); // Check for the global flag
    const configIndex = isGlobal ? 3 : 2; // Config key-value starts at index 3 if --global is present
    const configPairs = parts.slice(configIndex); // Extract key-value pairs

    const results = [];

    for (let i = 0; i < configPairs.length; i += 2) {
      const key = configPairs[i];
      const value = configPairs[i + 1];

      if (!key || !value) {
        results.push(
          `Error: Invalid configuration format for ${configPairs[i]}`
        );
      } else {
        const result = await setGitConfig(isGlobal, key, value);
        results.push(result);
      }
    }

    return results.join("\n");
  }

  // Handle git log
  if (gitCommand === "log") {
    if (parts.length > 2) {
      return await getCommitHistoryLog(dir, parts[2]);
    }
    return await getLog(dir);
  }

  // Handle git branch
  if (gitCommand === "branch") {
    // List branches if no arguments
    if (parts.length === 2) {
      return await listBranches(dir);
    }

    // Create new branch
    const branchName = parts[2];
    return await createBranch(dir, branchName);
  }

  // Handle git remote add <name> <url>
  if (gitCommand === "remote" && parts[2] === "add") {
    if (parts.length < 5) {
      return "Usage: git remote add <name> <url>";
    }

    const remoteName = parts[3];
    const remoteUrl = parts[4];

    try {
      await git.addRemote({ fs, dir, remote: remoteName, url: remoteUrl });
      return `Added remote '${remoteName}' with URL '${remoteUrl}'`;
    } catch (error) {
      return `Error adding remote: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    }
  }

  // Handle git checkout
  if (gitCommand === "checkout") {
    if (parts.length < 3) {
      return "Error: No branch specified";
    }

    const branchName = parts[2];
    return await checkoutBranch(dir, branchName);
  }

  // Handle git merge
  if (gitCommand === "merge") {
    if (parts.length < 3) {
      return "Error: No branch specified";
    }

    const branchName = parts[2];
    return await mergeBranch(dir, branchName);
  }

  return `Unknown git command: ${gitCommand}`;
}
