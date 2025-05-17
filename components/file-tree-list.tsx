import React, { useState } from "react";
import { useFolderContext } from "./context/FolderContext";
import { dir } from "@/lib/git-commands";
import { FSEntry } from "@/lib/fs";
import { ChevronLeftIcon, FileIcon, FolderIcon, SaveIcon } from "lucide-react";
import CodeMirrorEditor from "./libs/CodeEditor";
import { Button } from "./ui/button";
import { readFile, writeToFile } from "@/lib/filesystem/file";
import { useToast } from "@/hooks/use-toast";

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

interface Props {
  fileStatuses: Record<string, { status: string; color: string }>;
  files: FSEntry[];
}

function FileTreeList({ fileStatuses, files }: Props) {
  const { currentDir, folderHistory, setFolderHistory, setCurrentDir } =
    useFolderContext();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [fileContent, setFileContent] = useState<string>("");
  const [activeFilename, setActiveFilename] = useState<string>("");
  const { toast } = useToast();

  const handlePop = () => {
    if (folderHistory.length === 0) return;

    const newList = folderHistory.slice(0, -1);
    const popped = newList[newList.length - 1];

    setFolderHistory(newList);
    setCurrentDir(popped);
  };

  const changeDirectory = (file: FSEntry) => {
    setCurrentDir(`${currentDir}/${file.name}`);
    setFolderHistory((prev) => [...prev, `${currentDir}/${file.name}`]);
  };

  const openFile = async (filename: string) => {
    try {
      const content = await readFile(currentDir, filename);
      setFileContent(content);
      setActiveFilename(filename);
    } catch {
      toast({
        description: "An error occured while reading the file",
        variant: "destructive",
      });
    }
  };

  const saveFile = async () => {
    try {
      await writeToFile(currentDir, activeFilename, fileContent);
      closeFile();
      toast({
        description: "File updated",
      });
    } catch {
      toast({
        description: "An error occured while saving the file",
        variant: "destructive",
      });
    }
  };

  const closeFile = () => {
    setFileContent("");
    setActiveFilename("");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div>
        <div className="mb-3 flex justify-between items-center">
          <div
            className="flex items-center gap-1 cursor-pointer hover:underline"
            onClick={closeFile}
          >
            <ChevronLeftIcon />
            <div>Back</div>
          </div>
          <div className="font-bold text-base">{activeFilename}</div>
        </div>

        <CodeMirrorEditor
          value={fileContent}
          filename={activeFilename}
          onChange={setFileContent}
        ></CodeMirrorEditor>
        <div className="mt-3">
          <Button variant="outline" onClick={saveFile} className="py-0 px-3 h-9 hover:bg-accent">
            <SaveIcon /> Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {folderHistory.length > 1 ? (
        <div
          className="flex mb-2 cursor-pointer hover:underline"
          onClick={handlePop}
        >
          <ChevronLeftIcon />
          <div>Back</div>
        </div>
      ) : null}

      {files.length === 0 ? (
        <div className="text-zinc-500 text-sm p-4 text-center">
          <p>No files in repository</p>
          <p className="mt-1">Create files with 'touch filename'</p>
        </div>
      ) : (
        <ul className="space-y-1">
          {files
            .sort((a, b) => {
              if (a.stats.type !== b.stats.type) {
                return a.stats.type === "dir" ? -1 : 1;
              }
              return collator.compare(a.name, b.name);
            })
            .filter((f) => f.name !== ".gt")
            .map((file) => {
              let fileStatus;
              if (currentDir === dir) {
                fileStatus = fileStatuses[file.name];
              } else {
                fileStatus =
                  fileStatuses[
                    `${currentDir.replace(dir + "/", "")}/${file.name}`
                  ];
              }

              return (
                <li
                  key={file.name}
                  className="flex items-center relative cursor-pointer hover:underline justify-between py-1 px-2 rounded hover:bg-zinc-900"
                  onClick={
                    file.stats.type === "dir"
                      ? () => changeDirectory(file)
                      : () => {
                          setIsEditing(true);
                          openFile(file.name);
                        }
                  }
                >
                  <div className="flex items-center gap-2">
                    {file.stats.type === "dir" ? (
                      <FolderIcon className="w-4 h-4 text-zinc-400 fill-white" />
                    ) : (
                      <FileIcon className="w-4 h-4 text-zinc-400" />
                    )}
                    <span className="text-zinc-300">{file.name}</span>
                  </div>
                  {fileStatus && (
                    <span
                      className={`text-xs absolute right-0 ${fileStatus.color}`}
                    >
                      {fileStatus.status}
                    </span>
                  )}
                </li>
              );
            })}
        </ul>
      )}
    </>
  );
}

export default React.memo(FileTreeList);
