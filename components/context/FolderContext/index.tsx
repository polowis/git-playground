import { dir } from '@/lib/git-commands';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FolderContextType {
  currentDir: string;
  setCurrentDir: React.Dispatch<React.SetStateAction<string>>
  folderHistory: string[];
  setFolderHistory: React.Dispatch<React.SetStateAction<string[]>>
}

const FolderContext = createContext<FolderContextType | undefined>(undefined);

export const useFolderContext = () => {
  const context = useContext(FolderContext);
  if (!context) {
    throw new Error('useFolderContext must be used within a FolderProvider');
  }
  return context;
};

interface FolderProviderProps {
  children: ReactNode;
}

const initialDir = dir;

export const FolderProvider = ({ children }: FolderProviderProps) => {
  const [currentDir, setCurrentDir] = useState(initialDir);
  const [folderHistory, setFolderHistory] = useState<string[]>([initialDir]);

  return (
    <FolderContext.Provider
      value={{ currentDir, setCurrentDir, folderHistory, setFolderHistory }}
    >
      {children}
    </FolderContext.Provider>
  );
};
