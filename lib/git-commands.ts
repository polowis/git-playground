import * as git from "isomorphic-git";
import { fs } from "./fs";
import type { GitState } from "./git-state";
import { mergeBranch } from "./commands/merge";
import { commitChanges } from "./commands/commit";
import { createBranch, getCurrentBranch, listBranches } from "./commands/branch";
import { checkoutBranch } from "./commands/checkout";
import { isGitRepository } from "./git-utils";

interface CommandResult {
  newState: GitState;
  output: string;
}

export const dir = "/workspace"; // root dir
export let currentDir = "/workspace"; // Mutable for file-level commands

// Initialize a Git repository
export async function initRepo(): Promise<string> {
  try {
    await git.init({ fs, dir });
    return "Initialized empty Git repository";
  } catch (error) {
    console.error("Error initializing repository:", error);
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}


// Get repository status
export async function getStatus(): Promise<git.StatusRow[]> {
  try {
    const statusMatrix = await git.statusMatrix({ fs, dir });
    return statusMatrix;
  } catch (error) {
    console.error("Error getting status:", error);
    throw error;
  }
}

// Format status for display
export async function formatStatus(): Promise<string> {
  try {
    const statusMatrix = await getStatus();
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

// Add files to staging area
export async function addFiles(filepath: string): Promise<string> {
  try {
    if (filepath === ".") {
      // Add all files
      const statusMatrix = await getStatus();
      for (const [file] of statusMatrix) {
        await git.add({ fs, dir, filepath: file as string });
      }
      return "Added all files to staging area";
    } else {
      // Add specific file
      await git.add({ fs, dir, filepath });
      return `Added '${filepath}' to staging area`;
    }
  } catch (error) {
    console.error("Error adding files:", error);
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}

// Get commit log
export async function getLog(): Promise<string> {
  try {
    const commits = await git.log({ fs, dir });

    if (commits.length === 0) {
      return "No commits yet";
    }

    let output = "";

    for (const commit of commits) {
      output += `commit ${commit.oid}\n`;
      output += `Author: ${commit.commit.author.name} <${commit.commit.author.email}>\n`;
      output += `Date: ${new Date(
        commit.commit.author.timestamp * 1000
      ).toLocaleString()}\n\n`;
      output += `    ${commit.commit.message}\n\n`;
    }

    return output;
  } catch (error) {
    console.error("Error getting log:", error);
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}


// Get repository visualization data
export async function getVisualizationData() {
  try {
    const commits = await git.log({ fs, dir });
    const branches = await git.listBranches({ fs, dir });
    const currentBranch = await getCurrentBranch(dir);

    // Get the commit each branch points to
    const branchHeads: Record<string, string> = {};
    for (const branch of branches) {
      try {
        const oid = await git.resolveRef({ fs, dir, ref: branch });
        branchHeads[branch] = oid;
      } catch (error) {
        console.error(`Error resolving ref for branch ${branch}:`, error);
      }
    }

    return {
      commits,
      branches,
      branchHeads,
      currentBranch,
    };
  } catch (error) {
    console.error("Error getting visualization data:", error);
    return {
      commits: [],
      branches: [],
      branchHeads: {},
      currentBranch: "",
    };
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
    return await initRepo();
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
    return await addFiles(filepath);
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
    return await getLog();
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

function getHelpText(): string {
  return `
Available commands:

Git Commands:
  git init                      Initialize a new repository
  git status                    Show repository status
  git add <file>                Add file to staging area
  git add .                     Add all files to staging area
  git commit -m "message"       Create a new commit
  git log                       Show commit history
  git branch                    List branches
  git branch <name>             Create a new branch
  git checkout <branch>         Switch to a branch
  git merge <branch>            Merge a branch into current branch

File Operations:
  touch <file>                  Create a new empty file
  echo "content" > <file>       Create/overwrite file with content
  cat <file>                    Display file content
  rm <file>                     Remove a file
  ls                            List files
  mkdir                         Create a directory
  cd                            Change current directory

Other:
  clear                         Clear the terminal
  help                          Show this help message
`.trim();
}
