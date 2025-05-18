import * as git from "isomorphic-git";
import { fs } from "./fs";
import { getCurrentBranch } from "./commands/branch";
import { getStatus } from "./commands/status";

export async function isGitRepository(dir: string): Promise<boolean> {
  try {
    await git.findRoot({ fs, filepath: dir });
    return true;
  } catch (error) {
    return false;
  }
}

export function getHelpText(): string {
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
  cp <source> <dest>            Copy file content

Other:
  clear                         Clear the terminal
  help                          Show this help message
`.trim();
}

export async function removeGitFolder(dir: string) {
  const gitDir = `${dir}/.git`;

  async function deleteRecursive(path: string) {
    const stat = await fs.stat(path);
    if (stat.type === 'dir') {
      const entries = await fs.readdir(path);
      for (const entry of entries) {
        await deleteRecursive(`${path}/${entry}`);
      }
      await fs.rmdir(path);
    } else {
      await fs.unlink(path);
    }
  }

  try {
    await deleteRecursive(gitDir);
    console.log(".git folder removed successfully");
  } catch (err) {
    console.error("Failed to remove .git:", err);
  }
}


export async function formatStatus(dir: string): Promise<string> {
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