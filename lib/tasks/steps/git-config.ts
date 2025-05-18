import { Task } from "..";

export const gitConfigTask: Task = {
  id: "git-config",
  title: "Setup your identity",
  description: "Use git config to setup your identity",
  content: "setup-your-identity.md",
  validate: async () => {
    return (
      localStorage.getItem("global.user.name") !== null &&
      localStorage.getItem("global.user.email") != null
    );
  },
};
