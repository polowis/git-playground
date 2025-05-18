import { Task } from "..";

export const projectOverviewTask: Task = {
  id: "project-overview",
  title: "📁 See What's in Your Project",
  description: "Before we dive deeper into Git, it helps to see what's in your current folder.",
  content: "project-overview.md",
  validate: async () => true,
};
