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
import CLI from "./cli";
import path from "path";
import { CommandArgs } from "./cli/cli";

export const dir = "/workspace"; // root dir
export let currentDir = "/workspace"; // Mutable for file-level commands
const cli = new CLI();

cli.register("help", async () => {
  return getHelpText();
});

cli.register("clear", async () => {
  return "CLEAR_TERMINAL";
});

cli.register("ls", async (args: CommandArgs) => {
  try {
    let files: string[] = [];
    if (args._.length > 0) {
      let folderPath = path.join(dir, args._[0] || "");
      files = await fs.readdir(folderPath);
    } else {
      files = await fs.readdir(currentDir);
    }
    return files.join("\n") || "(empty directory)";
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
});

cli.register("cp", async (args: CommandArgs) => {
  try {
    // Ensure that source and destination paths are provided
    if (args._.length !== 2) {
      return "Error: Please provide both source and destination paths.";
    }

    const [src, dest] = args._;

    const sourcePath = path.join(dir, src); // src is relative to the base directory
    const destPath = path.join(dir, dest); // dest is relative to the base directory

    // Check if source file exists
    const stats = await fs.stat(sourcePath);
    if (!stats.isFile()) {
      return `Error: Source path is not a valid file: ${sourcePath}`;
    }

    // Read the file from the source path
    const fileContent = await fs.readFile(sourcePath, "utf8");

    await fs.writeFile(destPath, fileContent, "utf8");

    return `File copied from ${sourcePath} to ${destPath}`;
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
});

cli.register("touch", async (args: CommandArgs) => {
  if (args._.length < 1) {
    return "Error: Missing filename";
  }

  const filename = args._[0];
  const filePath = path.join(currentDir, filename);

  try {
    // Check if the file already exists
    const stats = await fs.stat(filePath);

    if (stats.isFile()) {
      return `Error: File ${filename} already exists`;
    }
  } catch (err) {
    // If the file doesn't exist, `fs.stat` will throw an error.
    try {
      await fs.writeFile(filePath, "", "utf8");

      return `Created file: ${filename}`;
    } catch (error) {
      return `Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    }
  }

  return `Error: ${filename} already exists`;
});

cli.register("mkdir", async (args: CommandArgs) => {
  if (args._.length < 1) {
    return "Error: Missing directory name";
  }
  const dirname = args._[0];

  try {
    const filePath = path.join(currentDir, dirname);
    await fs.mkdir(filePath);
    return `Created directory: ${dirname}`;
  } catch (error) {
    return `Error creating directory: ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
  }
});

cli.register("cd", async (args: CommandArgs) => {
  if (args._.length === 0) {
    return `Current directory: ${currentDir}`;
  }

  const target = args._[0];
  let newPath = path.join(currentDir, target);
  try {
    if (newPath === "/") {
      // resolve to root dir
      newPath = dir;
    }
    const stat = await fs.stat(newPath);
    if (stat.type !== "dir") return `Error: '${target}' is not a directory`;
    currentDir = newPath;
    return `Changed directory to ${currentDir}`;
  } catch {
    return `Error: Directory '${target}' does not exist`;
  }
});

cli.register("echo", async (arg: CommandArgs) => {
  const args = arg._;
  if (args.length < 3 || args[1] !== ">") {
    return 'Error: Invalid command format. Use: echo "content" > file';
  }
  const content = args[0];
  const filename = args[args.length - 1]; // Last part is the filename

  try {
    // override the file
    await writeToFile(currentDir, filename, content);

    return `Content written to: ${filename}`;
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
});

cli.register("cat", async (args: CommandArgs) => {
  if (args._.length < 1) {
    return "Error: Missing filename";
  }
  const filename = args._[0];
  return await readFile(currentDir, filename);
});

cli.register("rm", async (args: CommandArgs) => {
  const recursive = Boolean(args.r);
  const force = Boolean(args.f);
  const rf = Boolean(args.rf);
  const verbose = Boolean(args.v);
  const interactive = Boolean(args.i);

  let target = "";
  if (!recursive && !force && !verbose && !interactive && !rf) {
    target = args._[0];
    if (!target) {
      return "Error: Missing filename or folder";
    }
  } else {
    target = (args.r || args.f || args.v || args.i || args.rf) as string;
  }

  if (!target) {
    return "Error: Missing filename or folder";
  }

  if (target.endsWith(".git")) {
    return "Cannot delete .git folder. Please use reset button instead";
  }

  const fullPath = path.join(currentDir, target);

  async function confirmDeletion(path: string): Promise<boolean> {
    if (!interactive) return true;

    // In browser, simulate confirmation;
    return window.confirm(`Delete ${path}?`);
  }

  async function rmrf(
    absPath: string,
    relPath: string
  ): Promise<void | string> {
    try {
      const stat = await fs.lstat(absPath);

      if (stat.type === "dir") {
        if (!recursive) {
          return `Error: '${target}' is a directory. Use -r to delete folders.`;
        }

        const entries = await fs.readdir(absPath);
        for (const entry of entries) {
          await rmrf(path.join(absPath, entry), path.join(relPath, entry));
        }

        if (await confirmDeletion(absPath)) {
          await fs.rmdir(absPath);
          if (verbose) console.log(`Removed directory: ${relPath}`);
        }
      } else {
        if (await confirmDeletion(absPath)) {
          await fs.unlink(absPath);
          if (verbose) console.log(`Removed file: ${relPath}`);
          try {
            await git.remove({ fs, dir, filepath: relPath });
          } catch (err) {
            if (!force) throw err;
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
    const relativePath = path.relative(dir, fullPath);
    const result = await rmrf(fullPath, relativePath);
    return result ?? (verbose ? `Removed: ${target}` : "");
  } catch (error) {
    return `Error: '${target}' could not be deleted. ${
      error instanceof Error ? error.message : error
    }`;
  }
});

cli.register(["git", "init"], async () => {
  return await initRepo(dir);
});

cli.register(["git", "status"], async () => {
  return await formatStatus(dir);
});

// Execute a Git command
export async function executeGitCommand(commandLine: string): Promise<string> {
  const parts = commandLine.trim().split(/\s+/);
  const command = parts[0];

  let output = await cli.run(commandLine); // new cli
  if (!output.startsWith("Unknown command")) {
    return output;
  }

  // Handle git commands
  if (command !== "git") {
    return `Command not found: ${command}`;
  }

  const gitCommand = parts[1];

  // Check if git is initialized for all other commands
  const isRepo = await isGitRepository(dir);
  if (!isRepo && gitCommand !== "init") {
    return "Not a git repository. Use 'git init' to create a new repository.";
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
