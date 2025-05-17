import * as git from "isomorphic-git";
import { fs } from "../fs";

export type GitDiff = {
  A?: string; // first commit
  B?: string; // last commit
  type: string; // status
  fullpath: string; // filename
};

function formatChanges(set: Set<GitDiff>) {
  return [...set]
    .map(item => {
      const { fullpath, type, A, B } = item;
      const shortA = A?.slice(0, 7);
      const shortB = B?.slice(0, 7);

      switch (type) {
        case 'add':
          return `A  ${fullpath}`;
        case 'remove':
          return `D  ${fullpath} (${shortA})`;
        case 'modify':
          return `M  ${fullpath} (${shortA} → ${shortB})`;
        default:
          return `?  ${fullpath}`;
      }
    })
    .join('\n');
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
        let type = 'equal';
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
          type: type
        });
      },
    });
    return formatChanges(changes);
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}
