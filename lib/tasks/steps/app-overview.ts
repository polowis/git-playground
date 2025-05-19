import { Task } from "..";

export const appOverviewTask: Task = {
  id: "app-overview",
  title: "ℹ️ Overview",
  description: "",
  content: "app-overview.md",
  validate: async () => true,
};
