import { useToast } from "@/hooks/use-toast";
import { fs } from "@/lib/fs";
import { dir } from "@/lib/git-commands";
import { Task, tasks } from "@/lib/tasks";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface TaskContextType {
  activeTaskId: string;
  activeTaskContent: string;
  activeTask?: Task;
  getActiveTaskDetails: () => Promise<string>;
  completeTask: () => void;
  previousTask: () => void;
}

const localStorageKey = "gp-task";

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider = ({ children }: TaskProviderProps) => {
  const [activeTaskId, setActiveTaskId] = useState<string>("");
  const [activeTaskContent, setActiveTaskContent] = useState<string>("");
  const [activeTask, setActiveTask] = useState<Task>();
  const { toast } = useToast();

  React.useEffect(() => {
    // retrieve stored task
    const savedTaskId = localStorage.getItem(localStorageKey);
    if (!savedTaskId) {
      setActiveTaskId(tasks[0].id);
      return;
    }
    setActiveTaskId(savedTaskId);
  }, []);

  React.useEffect(() => {
    getActiveTaskDetails();
    const currentTask = getTaskById(activeTaskId);
    if (currentTask?.init) {
      currentTask?.init({ fs, dir });
    }
  }, [activeTaskId]);

  const getTaskById = (id: string) => {
    return tasks.find((t) => t.id === id);
  };

  const getActiveTaskDetails = async (): Promise<string> => {
    const task = getTaskById(activeTaskId);
    if (!task) return "";
    const res = await fetch(`/docs/${task?.content}`);
    const content = await res.text();
    setActiveTaskContent(content);
    setActiveTask(task);
    return content;
  };

  const nextTask = () => {
    const currentIdx = tasks.findIndex((t) => t.id === activeTaskId);
    const nextIdx = currentIdx + 1;
    if (nextIdx > tasks.length - 1) {
      toast({
        title: "You have completed everything! Hooray",
      });
      return;
    }
    localStorage.setItem(localStorageKey, tasks[nextIdx].id);
    setActiveTaskId(tasks[nextIdx].id);
  };

  const previousTask = () => {
    const currentIdx = tasks.findIndex((t) => t.id === activeTaskId);
    let nextIdx = currentIdx - 1;
    if(nextIdx < 0) { // cannot go outside array boundaries
      nextIdx = 0
    }

    // clean up current stage before backward
    const currentTask = getTaskById(activeTaskId);
    if (currentTask?.cleanup) {
      currentTask?.cleanup({ fs, dir });
    }
    
    localStorage.setItem(localStorageKey, tasks[nextIdx].id);
    setActiveTaskId(tasks[nextIdx].id);
  };



  const completeTask = async () => {
    const currentTask = getTaskById(activeTaskId);
    const passed = await currentTask?.validate({ fs, dir });
    if (!passed) {
      toast({
        description: "Checks failed",
        variant: "destructive",
      });
      return;
    }
    if (currentTask?.cleanup) {
      currentTask?.cleanup({ fs, dir });
    }

    return nextTask();
  };

  return (
    <TaskContext.Provider
      value={{
        activeTaskId,
        getActiveTaskDetails,
        completeTask,
        activeTaskContent,
        activeTask,
        previousTask
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
