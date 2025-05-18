import React, { JSX } from "react";

interface HighlightRule {
  pattern: RegExp;
  render: (...matches: string[]) => JSX.Element;
}

interface CustomTextProps {
  text: string;
}

// Parse <color='...'>text</color> into JSX
function parseColorTags(input: string): (string | JSX.Element)[] {
  const regex = /<color=['"]?(.*?)['"]?>(.*?)<\/color>/gi;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    const [fullMatch, color, text] = match;

    if (match.index > lastIndex) {
      parts.push(input.slice(lastIndex, match.index));
    }

    parts.push(
      <span
        key={parts.length}
        style={{ color, fontWeight: "bold", whiteSpace: "pre" }}
      >
        {text}
      </span>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    parts.push(input.slice(lastIndex));
  }

  return parts;
}


function applyHighlighting(
  parts: (string | JSX.Element)[],
  rules: HighlightRule[]
): (string | JSX.Element)[] {
  let result: (string | JSX.Element)[] = parts;

  for (const { pattern, render } of rules) {
    const newResult: (string | JSX.Element)[] = [];

    result.forEach((part, index) => {
      if (typeof part !== "string") {
        newResult.push(part);
        return;
      }

      let lastIndex = 0;
      let match: RegExpExecArray | null;
      const regex = new RegExp(pattern.source, "gi");

      while ((match = regex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          newResult.push(part.slice(lastIndex, match.index));
        }

        newResult.push(render(...match, `${index}-${match.index}`));
        lastIndex = regex.lastIndex;
      }

      if (lastIndex < part.length) {
        newResult.push(part.slice(lastIndex));
      }
    });

    result = newResult;
  }

  return result;
}

function handleLineBreaks(text: string, highlightRules: HighlightRule[]): JSX.Element[] {

  const lines = text.split('\n');
  return lines.map((line, index) => (
    <React.Fragment key={index}>
      {parseText(line, highlightRules)}
      <br />
    </React.Fragment>
  ));
}

function parseText(
  input: string,
  highlightRules: HighlightRule[]
): (string | JSX.Element)[] {
  const baseParts = parseColorTags(input);
  return applyHighlighting(baseParts, highlightRules);
}

const HightlightText: React.FC<CustomTextProps> = ({ text }) => {
  const highlightRules: HighlightRule[] = [
        {
      // Match `touch <file>`
      pattern: /\btouch\s+/gi,
      render: (_, file, key) => (
        <span key={key} style={{ color: 'tomato' }}>
          touch&nbsp;
        </span>
      ),
    },
    {
      pattern: /\becho\s+/gi,
      render: (_, content, file, key) => (
        <span key={key} style={{ color: 'tomato' }}>
          echo&nbsp;
        </span>
      ),
    },
    {
      pattern: /\bcat\s+/gi,
      render: (_, content, file, key) => (
        <span key={key} style={{ color: 'tomato' }}>
          cat&nbsp;
        </span>
      ),
    },
    {
      pattern: /\brm\s+/gi,
      render: (_, content, file, key) => (
        <span key={key} style={{ color: 'tomato' }}>
          rm&nbsp;
        </span>
      ),
    },
    {
      pattern: /\bls\s+/gi,
      render: (_, content, file, key) => (
        <span key={key} style={{ color: 'tomato' }}>
          ls&nbsp;
        </span>
      ),
    },
    {
      pattern: /\bmkdir\s+/gi,
      render: (_, content, file, key) => (
        <span key={key} style={{ color: 'tomato' }}>
          mkdir&nbsp;
        </span>
      ),
    },
    {
      pattern: /\bcd\s+/gi,
      render: (_, content, file, key) => (
        <span key={key} style={{ color: 'tomato' }}>
          cd&nbsp;
        </span>
      ),
    },
    {
      pattern: /\bcp\s+/gi,
      render: (_, content, file, key) => (
        <span key={key} style={{ color: 'tomato' }}>
          cp&nbsp;
        </span>
      ),
    },
    {
      pattern: /\b(git)\s+([\w-]+)((?:\s+[^-\s][^\s]*)*)/gi,
      render: (full, git, subcommand, args, key) => (
        <span key={key}>
          <span style={{ color: "tomato" }}>{git}</span>{" "}
          <span style={{ color: "lightblue" }}>{subcommand}</span>
          <span style={{ color: "lightgreen" }}>{args}</span>
        </span>
      ),
    },
  ];

  return <div>{handleLineBreaks(text, highlightRules)}</div>;
};

export default HightlightText;
