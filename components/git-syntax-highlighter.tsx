import React from 'react';

type TokenType =
  | 'git'
  | 'subcommand'
  | 'option'
  | 'string'
  | 'arg'
  | 'space'
  | 'commit';

function tokenize(input: string): { text: string; type: TokenType }[] {
  const result: { text: string; type: TokenType }[] = [];

  const regex = /(".*?"|\S+|\s+)/g;
  const matches = input.match(regex);
  if (!matches) return [];

  matches.forEach((word, index) => {
    const trimmed = word.trim();
    const unwrapped = trimmed.replace(/^\(|\)$/g, '');

    if (trimmed === '') {
      result.push({ text: word, type: 'space' });

    } else if (index === 0 && trimmed === 'git') {
      result.push({ text: word, type: 'git' });

    } else if (index === 1 && trimmed !== 'git') {
      result.push({ text: word, type: 'subcommand' });

    } else if (/^-[a-zA-Z]/.test(trimmed)) {
      result.push({ text: word, type: 'option' });

    } else if (/^".*"$/.test(trimmed)) {
      result.push({ text: word, type: 'string' });

    } else if (/^[0-9a-f]{7,40}$/i.test(unwrapped)) {
      result.push({ text: word, type: 'commit' });

    } else {
      result.push({ text: word, type: 'arg' });
    }
  });

  return result;
}


function getColor(type: TokenType): string {
  switch (type) {
    case 'git':
      return 'tomato';
    case 'subcommand':
      return 'lightblue';
    case 'option':
      return 'orange';
    case 'string':
      return 'green';
    case 'commit':
      return 'peachpuff';
    case 'arg':
      return 'gray';
    case 'space':
      return 'inherit'; // don't color spaces
    default:
      return 'inherit';
  }
}


type Props = {
  command: string;
};

const GitSyntaxHighlighter: React.FC<Props> = ({ command }) => {
  const tokens = tokenize(command);

  return (
    <span>
      {tokens.map((token, i) => (
        <span key={i} style={{ color: getColor(token.type), fontWeight: 'bold', whiteSpace: 'pre' }}>
          {token.text}
        </span>
      ))}
    </span>
  );
};

export default GitSyntaxHighlighter;
