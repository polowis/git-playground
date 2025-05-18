import React from "react";
import Markdown from "react-markdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useTaskContext } from "./context/TaskContext";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { CheckIcon, ChevronLeft } from "lucide-react";
import { tasks } from "@/lib/tasks";

export default function TaskView() {
  const { activeTaskContent, completeTask, activeTask, previousTask } =
    useTaskContext();
  return (
    <Card className="bg-zinc-900 text-white mx-4 mt-2 h-[90%] rounded-md border-none">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <div className="rounded-full font-bold border w-10 h-10 flex items-center justify-center">
              {tasks.findIndex((t) => t.id === activeTask?.id)}
            </div>{" "}
            {activeTask?.title}
          </CardTitle>
          <CardDescription className="mt-2">
            {activeTask?.description}
          </CardDescription>
        </div>
      </CardHeader>
      <ScrollArea className="h-[75%] overflow-auto">
        <CardContent className="p-4 pt-0">
          <div className="markdown">
            <Markdown>{activeTaskContent}</Markdown>
          </div>
        </CardContent>
        <CardFooter className="justify-start p-4 gap-3">
          {tasks.findIndex((t) => t.id === activeTask?.id) !== 0 && (
            <Button variant="outline" onClick={previousTask}>
              <ChevronLeft /> Back
            </Button>
          )}
          <Button
            onClick={completeTask}
            variant="outline"
            className="bg-green-500 text-white border-none hover:bg-green-800"
          >
            <CheckIcon /> Complete
          </Button>
        </CardFooter>
      </ScrollArea>
    </Card>
  );
}
