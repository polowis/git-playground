import * as git from "isomorphic-git";
import { fs } from "./fs";

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
