"use client";

import type React from "react";

import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  type ForwardedRef,
} from "react";
import { useTerminal } from "./context/TerminalContext";
import { ScrollArea } from "./ui/scroll-area";
import "../styles/terminal.css";
import { useRepoContext } from "./context/RepoContext";
import HightlightText from "./utils/ColorInput";

interface TerminalProps {
  onCommand: (command: string) => Promise<string>;
}

interface TerminalLine {
  type: "input" | "output";
  content: string;
}

const Terminal = forwardRef(function Terminal(
  { onCommand }: TerminalProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const [input, setInput] = useState("");
  const { lines, setLines, historyIndex, setHistoryIndex } = useTerminal();
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const { triggerRefresh, loadFiles } = useRepoContext();

  const inputLines = lines.filter((line) => line.type === "input");

  // Merge refs
  useEffect(() => {
    if (typeof ref === "function") {
      ref(terminalRef.current);
    } else if (ref) {
      ref.current = terminalRef.current;
    }
  }, [ref]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleInputKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();

      let nextIndex: number;
      if (historyIndex === null) {
        nextIndex = inputLines.length - 1; // Start from latest
      } else if (historyIndex > 0) {
        nextIndex = historyIndex - 1; // Go back
      } else {
        nextIndex = historyIndex; // Stay at 0
      }

      setHistoryIndex(nextIndex);
      setInput(inputLines[nextIndex].content);
    }

    if (e.key === "ArrowDown") {
      let nextIndex: number | null;
      if (historyIndex === null) {
        nextIndex = null;
      } else {
        const next = historyIndex + 1;

        if (next >= inputLines.length) {
          nextIndex = null; // Clear input
        } else {
          nextIndex = next;
        }
      }
      setHistoryIndex(nextIndex);
      if (nextIndex !== null) {
        setInput(inputLines[nextIndex].content);
      } else {
        setInput("");
      }
    }

    if (e.key === "Enter" && input.trim() && !isProcessing) {
      // Add the command to the terminal
      const newLines: TerminalLine[] = [
        ...lines,
        { type: "input", content: input },
      ];
      setLines(newLines);

      const command = input;
      setInput("");
      setIsProcessing(true);

      try {
        // Execute the command and get the output
        const output = await onCommand(command);

        // Handle special clear command
        if (output === "CLEAR_TERMINAL") {
          setLines([]);
        } else {
          // Add the output to the terminal
          const outputLines = output
            .split("\n")
            .map((line) => ({ type: "output" as const, content: line }));
          setLines((prev) => [...prev, ...outputLines]);
        }
      } catch (error) {
        // Handle errors
        setLines((prev) => [
          ...prev,
          {
            type: "output",
            content: `Error: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          },
        ]);
      } finally {
        e.preventDefault();
        setIsProcessing(false);
        setTimeout(() => {
          focusInput();
        }, 100);
        triggerRefresh();
        loadFiles();
      }
    }
  };

  // Auto-scroll to the bottom when new lines are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus the input when the terminal is clicked
  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      ref={terminalRef}
      className="terminal-container bg-zinc-950 rounded-lg p-4 h-full font-mono text-sm"
      onClick={focusInput}
    >
      <ScrollArea className="h-full overflow-auto">
        {lines.map((line, index) => (
          <div key={index} className="mb-1 terminal-line">
            {line.type === "input" ? (
              <div className="flex terminal-input">
                <span className="text-green-500 mr-2">$</span>
                <span>
                  <HightlightText text={line.content} />
                </span>
              </div>
            ) : (
              <div className="pl-4 text-zinc-400 terminal-output">
                <HightlightText text={line.content} />
              </div>
            )}
          </div>
        ))}
        <div className="flex items-center">
          <span className="text-green-500 mr-2">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            className="bg-transparent outline-none flex-1 text-zinc-100 terminal-input"
            autoFocus
            disabled={isProcessing}
          />
          {isProcessing && (
            <span className="animate-pulse text-zinc-500 ml-2">
              Processing...
            </span>
          )}
        </div>
      </ScrollArea>
    </div>
  );
});

export default Terminal;
