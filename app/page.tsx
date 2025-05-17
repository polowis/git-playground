"use client";

import { useState, useEffect, useRef } from "react";
import Terminal from "@/components/terminal";
import GitVisualization from "@/components/git-visualization";
import CommandHistory from "@/components/command-history";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileTree from "@/components/file-tree";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { RefreshCcw, HelpCircle, BookOpen } from "lucide-react";
import CommandHelp from "@/components/command-help";
import { dir, executeGitCommand } from "@/lib/git-commands";
import { initializeFileSystem } from "@/lib/fs";
import { TerminalProvider } from "@/components/context/TerminalContext";
import { FolderProvider } from "@/components/context/FolderContext";
import { removeGitFolder } from "@/lib/git-utils";
import { RepoProvider } from "@/components/context/RepoContext";

export default function GitPlayground() {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize the file system when the component mounts
  useEffect(() => {
    const init = async () => {
      try {
        await initializeFileSystem();
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize file system:", error);
        toast({
          title: "Initialization Error",
          description:
            "Failed to initialize the file system. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    init();
  }, [toast]);

  const handleCommand = async (command: string) => {
    // Add command to history
    setCommandHistory((prev) => [...prev, command]);

    try {
      // Execute the command and get the output
      const output = await executeGitCommand(command);
      return output;
    } catch (error) {
      if (error instanceof Error) {
        return `Error: ${error.message}`;
      }
      return "An unknown error occurred";
    }
  };

  const resetPlayground = async () => {
    try {
      await initializeFileSystem();
      setCommandHistory([]);
      removeGitFolder(dir);
      toast({
        title: "Playground Reset",
        description: "Git playground has been reset to initial state",
      });
    } catch (error) {
      console.error("Failed to reset playground:", error);
      toast({
        title: "Reset Error",
        description: "Failed to reset the playground. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900 text-zinc-100">
        <div className="text-center">
          <h2 className="text-xl mb-2">Initializing Git Playground...</h2>
          <p className="text-zinc-400">
            Setting up the file system and Git environment
          </p>
        </div>
      </div>
    );
  }

  return (
    <FolderProvider>
      <RepoProvider>
        <TerminalProvider>
          <main className="flex flex-col h-screen bg-zinc-900 text-zinc-100">
            <header className="border-b border-zinc-800 p-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">
                  Git Interactive Playground
                </h1>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={toggleHelp}>
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetPlayground}>
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href="https://git-scm.com/doc"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Git Docs
                    </a>
                  </Button>
                </div>
              </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
              <div className="flex flex-col w-full md:w-1/2 border-r border-zinc-800">
                <Tabs defaultValue="terminal" className="flex flex-col h-full">
                  <TabsList className="mx-4 mt-2 justify-start bg-zinc-800">
                    <TabsTrigger value="terminal">Terminal</TabsTrigger>
                    <TabsTrigger value="history">Command History</TabsTrigger>
                  </TabsList>
                  <TabsContent
                    value="terminal"
                    className="flex-1 p-4 overflow-auto"
                  >
                    <Terminal onCommand={handleCommand} ref={terminalRef} />
                  </TabsContent>
                  <TabsContent
                    value="history"
                    className="flex-1 p-4 overflow-auto"
                  >
                    <CommandHistory commands={commandHistory} />
                  </TabsContent>
                </Tabs>
              </div>

              <div className="hidden md:flex md:flex-col md:w-1/2">
                <Tabs
                  defaultValue="visualization"
                  className="flex flex-col h-full"
                >
                  <TabsList className="mx-4 mt-2 justify-start bg-zinc-800">
                    <TabsTrigger value="visualization">Git Graph</TabsTrigger>
                    <TabsTrigger value="files">File Tree</TabsTrigger>
                  </TabsList>
                  <TabsContent
                    value="visualization"
                    className="flex-1 p-4 overflow-auto"
                  >
                    <GitVisualization />
                  </TabsContent>
                  <TabsContent
                    value="files"
                    className="flex-1 p-4 overflow-auto"
                  >
                    <FileTree />
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {showHelp && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Git Command Help</h2>
                    <Button variant="ghost" size="sm" onClick={toggleHelp}>
                      Close
                    </Button>
                  </div>
                  <CommandHelp />
                </div>
              </div>
            )}

            <Toaster />
          </main>
        </TerminalProvider>
      </RepoProvider>
    </FolderProvider>
  );
}
