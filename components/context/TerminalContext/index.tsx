import React, { createContext, useContext, useState, ReactNode } from "react";
import { TerminalLine } from "./types";

type TerminalContextType = {
  lines: TerminalLine[];
  setLines: React.Dispatch<React.SetStateAction<TerminalLine[]>>;
  addLine: (line: TerminalLine) => void;

  historyIndex: number | null;
  setHistoryIndex: React.Dispatch<React.SetStateAction<number | null>>;
};

const TerminalContext = createContext<TerminalContextType | undefined>(
  undefined
);

export const TerminalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "output", content: "Welcome to Git Interactive Playground!" },
    { type: "output", content: "Type 'help' to see available commands." },
  ]);

  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const addLine = (line: TerminalLine) => {
    setLines((prev) => [...prev, line]);
    setHistoryIndex(null);
  };

  return (
    <TerminalContext.Provider
      value={{
        lines,
        setLines,
        addLine,
        historyIndex,
        setHistoryIndex,
      }}
    >
      {children}
    </TerminalContext.Provider>
  );
};

export const useTerminal = (): TerminalContextType => {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error("useTerminal must be used within a TerminalProvider");
  }
  return context;
};
