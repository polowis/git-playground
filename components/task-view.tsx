import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ChevronDownIcon } from "lucide-react";

export default function TaskView() {
  return (
    <Card className="bg-zinc-900 text-white mx-4 mt-2 rounded-md border border-zinc-800">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <div className="rounded-full font-bold border w-10 h-10 flex items-center justify-center">
              1
            </div>{" "}
            Setup your identity
          </CardTitle>
          <CardDescription className="mt-2">
            Use git config to setup your identity
          </CardDescription>
        </div>
        <div>
          <ChevronDownIcon />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">Task 1</CardContent>
      <CardContent className="p-4 pt-0">Task 1</CardContent>
    </Card>
  );
}
