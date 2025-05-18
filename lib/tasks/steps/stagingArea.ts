import { getStatus } from "@/lib/commands/status";
import { Task } from "..";

export const stagingAreaTask: Task = {
  id: "staging-area",
  title: "🎯 The Staging Area (aka “Index”)",
  description: "",
  content: "staging-area.md",
  validate: async ({ fs, dir }) => {
    try {
      const statusMatrix = await getStatus(dir);
      for (const [filepath, headStatus, stageStatus] of statusMatrix) {
        const file = filepath as string;
        if (headStatus === 0 && stageStatus === 2) {
          if (file === "alice.txt") {
            return true;
          }
        }
      }
      return false;
    } catch {
      return false;
    }
  },
};
