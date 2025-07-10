import React from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import hcl from 'react-syntax-highlighter/dist/esm/languages/prism/hcl';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';

// Register languages with the syntax highlighter
SyntaxHighlighter.registerLanguage('hcl', hcl);
SyntaxHighlighter.registerLanguage('terraform', hcl);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('yaml', yaml);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('json', json);

interface CodeBlock {
  type: 'text' | 'code';
  content: string;
  language?: string;
}

// Language aliases for better syntax highlighting
const languageAliases: Record<string, string> = {
  'terraform': 'hcl',
  'tf': 'hcl',
  'hcl': 'hcl',
  'yml': 'yaml',
  'py': 'python',
  'js': 'javascript',
  'ts': 'typescript',
  'sh': 'bash',
  'shell': 'bash'
};

/**
 * Normalizes language name for syntax highlighting
 */
function normalizeLanguage(lang: string): string {
  const normalized = lang.toLowerCase();
  return languageAliases[normalized] || normalized;
}

/**
 * Parses content that may contain markdown-style code blocks
 * and returns an array of text and code segments
 */
export function parseCodeBlocks(content: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const textContent = content.slice(lastIndex, match.index).trim();
      if (textContent) {
        blocks.push({
          type: 'text',
          content: textContent
        });
      }
    }

    // Add code block
    const language = match[1] ? normalizeLanguage(match[1]) : 'text';
    const code = match[2].trim();

    if (code) { // Only add non-empty code blocks
      blocks.push({
        type: 'code',
        content: code,
        language: language
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    const remainingText = content.slice(lastIndex).trim();
    if (remainingText) {
      blocks.push({
        type: 'text',
        content: remainingText
      });
    }
  }

  // If no code blocks found, return the entire content as text
  if (blocks.length === 0) {
    blocks.push({
      type: 'text',
      content: content
    });
  }

  return blocks;
}

/**
 * Renders parsed content blocks with syntax highlighting for code
 */
export function renderContentWithCodeBlocks(content: string): React.ReactElement {
  const blocks = parseCodeBlocks(content);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => {
        if (block.type === 'code') {
          return (
            <div key={index} className="relative group">
              <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                <span className="text-xs text-gray-400 bg-gray-800/80 px-2 py-1 rounded backdrop-blur-sm">
                  {block.language}
                </span>
                <button
                  onClick={() => copyToClipboard(block.content)}
                  className="text-xs text-gray-400 bg-gray-800/80 px-2 py-1 rounded backdrop-blur-sm hover:text-gray-200 hover:bg-gray-700/80 transition-colors opacity-0 group-hover:opacity-100"
                  title="Copy code"
                >
                  Copy
                </button>
              </div>
              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <SyntaxHighlighter
                  language={block.language}
                  style={oneDark}
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    padding: '1rem',
                    paddingTop: '2.5rem', // Make space for language label
                    background: 'rgb(40, 44, 52)' // Ensure consistent dark background
                  }}
                  showLineNumbers={false}
                  wrapLines={true}
                  wrapLongLines={true}
                >
                  {block.content}
                </SyntaxHighlighter>
              </div>
            </div>
          );
        } else {
          // Render text content, preserving line breaks
          return (
            <div key={index} className="whitespace-pre-wrap">
              {block.content}
            </div>
          );
        }
      })}
    </div>
  );
}
