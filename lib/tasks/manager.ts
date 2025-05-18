import { Task, tasks } from ".";

const taskManager = {
  getTaskList: (): Task[] => {
    return tasks;
  },
  nextTask: () => {},
  currentTask: () => {},
  completeTask: () => {},
  reset: () => {},
};

export default taskManager