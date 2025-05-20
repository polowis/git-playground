import FS from "@isomorphic-git/lightning-fs";
import { appOverviewTask } from "./steps/app-overview";
import { gitConfigTask } from "./steps/git-config";
import { initRepoTask } from "./steps/init-repo";
import { projectOverviewTask } from "./steps/project-overview";
import { stagingAreaTask } from "./steps/stagingArea";
import { commitFileTask } from "./steps/commitFile";
import { logHistoryTask } from "./steps/log-history";
import { gitDiffTask } from "./steps/git-diff";
import { undoingTask } from "./steps/undoing";
import { restoreFileTask } from "./steps/restore";
import { branchingTask } from "./steps/branching";
import { branchingCommitTask } from "./steps/branch-commit";

export interface Task {
  id: string;
  title: string;
  description: string;
  content: string;
  init?: (args: { fs: FS.PromisifiedFS; dir: string }) => void;
  validate: (args: { fs: FS.PromisifiedFS; dir: string }) => Promise<boolean>;
  cleanup?: (args: { fs: FS.PromisifiedFS; dir: string }) => void;
}

export const tasks: Task[] = [
  appOverviewTask,
  gitConfigTask,
  initRepoTask,
  projectOverviewTask,
  stagingAreaTask,
  commitFileTask,
  logHistoryTask,
  gitDiffTask,
  undoingTask,
  restoreFileTask,
  branchingTask,
  branchingCommitTask
];
