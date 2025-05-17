import { FSEntry } from "@/lib/fs";
import { GitCommit } from "lucide-react";
import React from "react";

interface Props {
  files: FSEntry[];
  fileStatuses: Record<string, { status: string; color: string }>;
}

function RepoFileStats({ files, fileStatuses }: Props) {
  return (
    <div className="mt-4 pt-4 border-t border-zinc-800">
      <div className="flex items-center gap-2 mb-2">
        <GitCommit className="w-4 h-4 text-zinc-400" />
        <h3 className="text-zinc-200 font-medium">File Stats</h3>
      </div>
      <div className="text-sm text-zinc-400 pl-2">
        <p>Total files: {files.length}</p>
        <p>
          Modified:{" "}
          {
            Object.values(fileStatuses).filter((s) => s.status === "Modified")
              .length
          }
        </p>
        <p>
          Staged:{" "}
          {
            Object.values(fileStatuses).filter((s) => s.status === "Staged")
              .length
          }
        </p>
        <p>
          Untracked:{" "}
          {
            Object.values(fileStatuses).filter((s) => s.status === "Untracked")
              .length
          }
        </p>
      </div>
    </div>
  );
}

export default React.memo(RepoFileStats);
