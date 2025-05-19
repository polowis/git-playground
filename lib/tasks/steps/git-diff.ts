import { Task } from "..";

export const gitDiffTask: Task = {
  id: "git-diff",
  title: "🔀 See your changes",
  description: "Use git diff to review your changes",
  content: "git-diff.md",
  validate: async () => {
    return true
  },
};