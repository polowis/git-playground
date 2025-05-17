import * as git from "isomorphic-git";
import { fs } from "./fs";
import { mergeBranch } from "./commands/merge";
import { commitChanges } from "./commands/commit";
import {
  createBranch,
  getCurrentBranch,
  listBranches,
} from "./commands/branch";
import { checkoutBranch } from "./commands/checkout";
import { getHelpText, isGitRepository } from "./git-utils";
import { getLog } from "./commands/log";
import { getStatus } from "./commands/status";
import { addFiles } from "./commands/staging";
import { initRepo } from "./commands/init";
import { cherryPickChanges } from "./commands/cherry-pick";
import { gitDiff } from "./commands/diff";

export const dir = "/workspace"; // root dir
export let currentDir = "/workspace"; // Mutable for file-level commands

// Format status for display
export async function formatStatus(): Promise<string> {
  try {
    const statusMatrix = await getStatus(dir);
    const isRepo = await isGitRepository(dir);

    if (!isRepo) {
      return "Not a git repository. Use 'git init' to create a new repository.";
    }

    let output = "";

    // Get current branch
    const currentBranch = await getCurrentBranch(dir);
    output += `On branch ${currentBranch}\n\n`;

    if (statusMatrix.length === 0) {
      output += "nothing to commit, working tree clean";
      return output;
    }

    const staged: string[] = [];
    const modified: string[] = [];
    const untracked: string[] = [];

    for (const [
      filepath,
      headStatus,
      workdirStatus,
      stageStatus,
    ] of statusMatrix) {
      const file = filepath as string;

      // File is staged (added)
      if (headStatus === 0 && stageStatus === 2) {
        staged.push(`  new file: ${file}`);
      }
      // File is modified and staged
      else if (headStatus === 1 && workdirStatus === 2 && stageStatus === 2) {
        staged.push(`  modified: ${file}`);
      }
      // File is modified but not staged
      else if (headStatus === 1 && workdirStatus === 2 && stageStatus === 1) {
        modified.push(`  modified: ${file}`);
      }
      // File is untracked
      else if (headStatus === 0 && workdirStatus === 2 && stageStatus === 0) {
        untracked.push(`  ${file}`);
      }
    }

    if (staged.length > 0) {
      output += "Changes to be committed:\n";
      output += staged.join("\n") + "\n\n";
    }

    if (modified.length > 0) {
      output += "Changes not staged for commit:\n";
      output += modified.join("\n") + "\n\n";
    }

    if (untracked.length > 0) {
      output += "Untracked files:\n";
      output += untracked.join("\n");
    }

    return output;
  } catch (error) {
    console.error("Error formatting status:", error);
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}

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
    try {
      await fs.writeFile(`${currentDir}/${filename}`, content);
      return `Wrote to file: ${filename}`;
    } catch (error) {
      return `Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    }
  }

  if (command === "cat") {
    if (parts.length < 2) {
      return "Error: Missing filename";
    }

    const filename = parts[1];
    try {
      const content = await fs.readFile(`${currentDir}/${filename}`, {
        encoding: "utf8",
      });
      return content;
    } catch (error) {
      return `Error: File '${filename}' does not exist or cannot be read`;
    }
  }

  if (command === "rm") {
    if (parts.length < 2) {
      return "Error: Missing filename";
    }

    const filename = parts[1];
    try {
      await fs.unlink(`${currentDir}/${filename}`);
      return `Removed file: ${filename}`;
    } catch (error) {
      return `Error: File '${filename}' does not exist or cannot be deleted`;
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
    return await formatStatus();
  }

  // Handle git add
  if (gitCommand === "add") {
    if (parts.length < 3) {
      return "Error: No files specified";
    }

    const filepath = parts[2];
    return await addFiles(dir, filepath);
  }

  if (gitCommand === "diff") {
    return await gitDiff(dir);
  }

  if (gitCommand === "cherry-pick") {
    // Check if we have a commit hash (the commit ID to cherry-pick)
    if (parts.length < 2) {
      return "Error: Invalid or missing commit hash. Use: git cherry-pick <commit>";
    }

    // Extract the commit hash (should be the second argument)
    const commitHash = parts[2];

    try {
      return await cherryPickChanges(dir, commitHash);
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

  // Handle git log
  if (gitCommand === "log") {
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
