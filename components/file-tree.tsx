"use client";

import { useEffect, useState } from "react";
import {
  Folder,
  GitBranch,
} from "lucide-react";
import { FSEntry, listFiles } from "@/lib/fs";
import { dir, getStatus } from "@/lib/git-commands";
import { getCurrentBranch } from "@/lib/commands/branch";
import { isGitRepository } from "@/lib/git-utils";
import { useFolderContext } from "./context/FolderContext";
import FileTreeList from "./file-tree-list";
import RepoFileStats from "./repo-file-stats";

export default function FileTree() {
  const [files, setFiles] = useState<FSEntry[]>([]);
  const [isRepo, setIsRepo] = useState(false);
  const [currentBranch, setCurrentBranch] = useState("");
  const [statusMatrix, setStatusMatrix] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentDir } = useFolderContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Check if it's a git repository
        const repoStatus = await isGitRepository(dir);
        setIsRepo(repoStatus);

        // Get files
        const fileList = await listFiles(currentDir);
        setFiles(fileList);

        if (repoStatus) {
          // Get current branch
          const branch = await getCurrentBranch(dir);
          setCurrentBranch(branch);

          // Get status matrix
          const status = await getStatus();
          setStatusMatrix(status);
        }
      } catch (error) {
        console.error("Error fetching file tree data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentDir]);

  if (!isRepo) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
        <p>Git repository not initialized</p>
        <p className="text-sm mt-2">Use 'git init' to start</p>
      </div>
    );
  }

  // Process status matrix to get file statuses
  const fileStatuses: Record<string, { status: string; color: string }> = {};

  statusMatrix.forEach((entry) => {
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
      fileStatuses[filepath as string] = { status, color };
    }
  });

  return (
    <div className="bg-zinc-950 rounded-lg p-4 h-full overflow-auto">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-800">
        <Folder className="w-4 h-4 text-zinc-400" />
        <h3 className="text-zinc-200 font-medium">Repository Files</h3>
      </div>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500">
          <p>Loading files...</p>
        </div>
      ) : (
        <FileTreeList fileStatuses={fileStatuses} files={files} />
      )}

      <div className="mt-6 pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-2 mb-2">
          <GitBranch className="w-4 h-4 text-zinc-400" />
          <h3 className="text-zinc-200 font-medium">Current Branch</h3>
        </div>
        <div className="pl-2">
          <div className="flex items-center gap-2 py-1">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="text-sm text-white font-medium">
              {currentBranch}
            </span>
          </div>
        </div>
      </div>

      <RepoFileStats files={files} fileStatuses={fileStatuses}/>
    </div>
  );
}
