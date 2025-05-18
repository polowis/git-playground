"use client";

import { useEffect, useState } from "react";
import { Folder, GitBranch } from "lucide-react";
import { dir } from "@/lib/git-commands";
import { getCurrentBranch } from "@/lib/commands/branch";
import { isGitRepository } from "@/lib/git-utils";
import { useFolderContext } from "./context/FolderContext";
import FileTreeList from "./file-tree-list";
import RepoFileStats from "./repo-file-stats";
import { useRepoContext } from "./context/RepoContext";
import { ScrollArea } from "./ui/scroll-area";

export default function FileTree() {
  const [isRepo, setIsRepo] = useState(false);
  const [currentBranch, setCurrentBranch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const { currentDir } = useFolderContext();
  const { fileStatuses, triggerRefresh, loadFiles, files } = useRepoContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Check if it's a git repository
        const repoStatus = await isGitRepository(dir);
        setIsRepo(repoStatus);

        // Get files
        loadFiles();

        if (repoStatus) {
          // Get current branch
          const branch = await getCurrentBranch(dir);
          setCurrentBranch(branch);

          // Get status matrix
          triggerRefresh();
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
        <p className="text-sm mt-2">Use &apos;git init&apos; to start</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full overflow-auto">
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

        <RepoFileStats files={files} fileStatuses={fileStatuses} />
      </div>
    </ScrollArea>
  );
}
