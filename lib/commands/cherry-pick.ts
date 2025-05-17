import * as git from "isomorphic-git";
import { fs } from "../fs";

export async function cherryPickChanges(dir: string, commitHash: string) {
  // Get the commit details and parent commit of the cherry-pick commit
  const fullOid = await git.expandOid({ fs, dir, oid: commitHash });
  const { commit } = await git.readCommit({ fs, dir, oid: fullOid });
  const parentOid = commit.parent[0];

  if (!parentOid) {
    throw new Error("Cannot cherry-pick root commit (no parent)");
  }

  // Track changed files
  const changedFiles: string[] = [];

  // Use walk to find the file differences between the parent and the cherry-pick commit
  await git.walk({
    fs,
    dir,
    trees: [
      git.TREE({ ref: parentOid }), // Base (previous commit)
      git.TREE({ ref: commitHash }), // The cherry-pick commit
    ],
    map: async (filepath, [base, target]) => {
      if (!filepath) return;

      const baseOid = await base?.oid();
      const targetOid = await target?.oid();
      const targetType = await target?.type();

      if (baseOid !== targetOid) {
        // File was added, modified, or deleted
        if (target && targetType === "blob" && targetOid) {
          const { blob } = await git.readBlob({ fs, dir, oid: targetOid });
          await fs.writeFile(`${dir}/${filepath}`, blob);
          changedFiles.push(filepath);
        } else {
          
         
        }
      }
    },
  });

  // Stage all changed files
  for (const file of changedFiles) {
    await git.add({ fs, dir, filepath: file });
  }

  // Commit the changes (simulating cherry-pick commit)
  await git.commit({
    fs,
    dir,
    message: `cherry-pick: ${commit.message}`,
    author: {
      name: "Your Name", // Customize author name
      email: "your@email.com", // Customize email
    },
  });

  return `Cherry-pick of commit ${commitHash} applied successfully.`;
}
