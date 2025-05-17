import * as git from "isomorphic-git";
import { fs } from "../fs";
import { diffLines } from "diff";

export type GitDiff = {
  A?: string; // first commit
  B?: string; // last commit
  type: string; // status
  fullpath: string; // filename
};

function formatChanges(set: Set<GitDiff>) {
  return [...set]
    .map((item) => {
      const { fullpath, type, A, B } = item;
      const shortA = A?.slice(0, 7);
      const shortB = B?.slice(0, 7);

      switch (type) {
        case "add":
          return `A  ${fullpath}`;
        case "remove":
          return `D  ${fullpath} (${shortA})`;
        case "modify":
          return `M  ${fullpath} (${shortA} → ${shortB})`;
        default:
          return `?  ${fullpath}`;
      }
    })
    .join("\n");
}

// this is not a full implementation of git diff
export async function gitDiff(dir: string) {
  const commits = await git.log({ fs, dir: dir, depth: 2 });
  const oids = commits.map((commit) => commit.oid);

  // Make TREE objects for the first and last commits
  const A = git.TREE({ ref: oids[0] });
  const B = git.TREE({ ref: oids[oids.length - 1] });

  // Get a list of the files that changed
  let changes: Set<GitDiff> = new Set();
  try {
    await git.walk({
      fs,
      dir: dir,
      trees: [A, B],
      map: async function (filename, [A, B]) {
        if ((await A?.type()) === "tree") return;

        let Aoid = await A?.oid();
        let Boid = await B?.oid();

        // Skip pairs where the oids are the same
        if (Aoid === Boid) return;
        let type = "equal";
        if (Aoid !== Boid) {
          type = "modify";
        }

        if (Aoid === undefined) {
          type = "add";
        }
        if (Boid === undefined) {
          type = "remove";
        }

        changes.add({
          fullpath: filename,
          A: Aoid,
          B: Boid,
          type: type,
        });
      },
    });
    return formatChanges(changes);
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}

export async function diffUnstagedChangesVsLastCommit(
  dir: string,
  filepath?: string
): Promise<string> {
  let diffResult = '';
  try {
    // 1. Get the file content from the last commit (HEAD)
    const commitOid = await git.resolveRef({ fs, dir, ref: "HEAD" });

    let filesToDiff: string[] = [];

    if (filepath) {
      // If a specific filepath is provided, just use that file
      filesToDiff = [filepath];
    } else {
      // List all files in the repository if no filepath is provided
      filesToDiff = await git.listFiles({ fs, dir });
    }

    // 2. Loop through the files to compare them
    for (const file of filesToDiff) {
      const { blob } = await git.readBlob({
        fs,
        dir,
        oid: commitOid,
        filepath: file,
      });
      const committedContent = new TextDecoder().decode(blob);
      

      // 3. Read the current unstaged content (working directory content) using Lightning FS
      const currentContent = await fs.readFile(`${dir}/${file}`, "utf8");

      // 4. Diff the two contents using the "diff" package
      const diff = diffLines(committedContent, currentContent);

      // 5. Output the diff result for this file
      if (diff.length > 0) {

        diff.forEach((part) => {
          if(!part.added && !part.removed) { // no changes
            return
          }
          const symbol = part.added ? "+" : part.removed ? "-" : " ";
          diffResult += symbol + part.value + ` (${file}) \n`;
        });
        diffResult += '\n\n';
      }
    }
    if(diffResult.trim().length === 0) return 'No changes';
    return diffResult;
  } catch (error) {
    console.error("Error during diffing:", error);
    return 'error during diffing'
  }
}
