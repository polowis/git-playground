import React, { useEffect } from "react";
import Markdown from "react-markdown";
import rehypeSlug from 'rehype-slug';
import { ScrollArea } from "./ui/scroll-area";


export default function ActivityPanel() {
  const [content, setContent] = React.useState<string>("");

  const getDocument = async () => {
    const res = await fetch(`/extra/github.md`);
    const content = await res.text();
    setContent(content);
  };

  useEffect(() => {
    getDocument();
  }, []);
  return (
    <ScrollArea className="overflow-auto h-full">
      <div className="markdown line-break p-4 px-6">
        <Markdown rehypePlugins={[rehypeSlug]}>{content}</Markdown>
      </div>
    </ScrollArea>
  );
}
