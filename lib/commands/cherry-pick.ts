import * as git from "isomorphic-git";
import { fs } from "../fs";
import { getCurrentBranch } from "./branch";

// TODO
export async function cherryPick(dir: string, commitHash: string) {
  const targetBranch = await getCurrentBranch(dir);
  await git.checkout({ fs: fs, dir, ref: targetBranch });
  const fullOid = await git.expandOid({ fs, dir, oid: commitHash });

  await git.merge({
    fs: fs,
    dir,
    ours: targetBranch,
    theirs: fullOid,
    author: { name: "Git User", email: "user@gitplayground.com" },
  });

  await git.checkout({
    fs,
    dir,
    ref: targetBranch,
  });

  await git.commit({
    fs: fs,
    dir,
    author: { name: "Git User", email: "user@gitplayground.com" },
    message: `Cherry-pick commit ${commitHash}`,
  });

  return "Success";
}
