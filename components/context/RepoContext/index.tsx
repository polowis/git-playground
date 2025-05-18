import { getStatus } from "@/lib/commands/status";
import { FSEntry, listFiles } from "@/lib/fs";
import { dir } from "@/lib/git-commands";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { useFolderContext } from "../FolderContext";
import { StatusRow } from "isomorphic-git";

interface RepoContextType {
  statusMatrix: StatusRow[];
  setStatusMatrix: React.Dispatch<React.SetStateAction<StatusRow[]>>;
  fileStatuses: Record<string, { status: string; color: string }>;
  triggerRefresh: () => void;
  files: FSEntry[];
  loadFiles: () => void;
}

const RepoContext = createContext<RepoContextType | undefined>(undefined);

export const useRepoContext = () => {
  const context = useContext(RepoContext);
  if (!context) {
    throw new Error("useRepoContext must be used within a RepoProvider");
  }
  return context;
};

interface RepoProviderProps {
  children: ReactNode;
}

export const RepoProvider = ({ children }: RepoProviderProps) => {
  const [statusMatrix, setStatusMatrix] = useState<StatusRow[]>([]);
  const [fileStatuses, setFileStatuses] = useState<
    Record<string, { status: string; color: string }>
  >({});
  const [files, setFiles] = useState<FSEntry[]>([]);
  const { currentDir } = useFolderContext();

  const loadFiles = async () => {
    const fileList = await listFiles(currentDir);
    setFiles(fileList);
  };

  const triggerRefresh = async () => {
    const status = await getStatus(dir);
    setStatusMatrix(status);

    const updatedFileStatuses: Record<
      string,
      { status: string; color: string }
    > = { ...fileStatuses };

    status.forEach((entry) => {
      const [filepath, headStatus, workdirStatus, stageStatus] = entry;

      let status = "";
      let color = "";

      // File is staged (added)
      if (headStatus === 0 && stageStatus === 2) {
        status = "Staged";
        color = "text-green-500";
      }
      // File is modified and staged
      else if (headStatus === 1 && workdirStatus === 2 && stageStatus === 2) {
        status = "Staged";
        color = "text-green-500";
      }
      // File is modified but not staged
      else if (headStatus === 1 && workdirStatus === 2 && stageStatus === 1) {
        status = "Modified";
        color = "text-yellow-500";
      }
      // File is untracked
      else if (headStatus === 0 && workdirStatus === 2 && stageStatus === 0) {
        status = "Untracked";
        color = "text-red-500";
      }

      if (status) {
        updatedFileStatuses[filepath as string] = { status, color };
      }
    });

    setFileStatuses(updatedFileStatuses);
  };

  return (
    <RepoContext.Provider
      value={{
        statusMatrix,
        setStatusMatrix,
        fileStatuses,
        triggerRefresh,
        files,
        loadFiles,
      }}
    >
      {children}
    </RepoContext.Provider>
  );
};
