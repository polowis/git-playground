"use client";

import React from "react";
import CodeMirror from "@uiw/react-codemirror";

import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import "./style.css";

export const languageExtensions = {
  js: javascript({ jsx: true }),
  py: python(),
};

interface CodeMirrorEditorProps {
  value: string;
  filename: string;
  onChange: (value: string) => void;
}

const getLanguageExtension = (filename: string) => {
  const extension = filename.split(".").pop();
  if (!extension) return undefined;
  return (
    languageExtensions[(extension as keyof typeof languageExtensions) || ""] ||
    undefined
  );
};

const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({
  value,
  filename,
  onChange,
}) => {
  return (
    <div>
      <CodeMirror
        autoFocus
        value={value}
        onChange={(editorValue) => onChange(editorValue)}
        theme="dark"
        extensions={
          getLanguageExtension(filename)
            ? [getLanguageExtension(filename)]
            : undefined
        }
        />
    </div>
  );
};

export default CodeMirrorEditor;
