import React from 'react';
import { MathFormula } from '../MathFormula';

interface ChatFormattedTextProps {
  content: string;
}

/**
 * Enhanced markdown and LaTeX math renderer for ECE Board Exam chat messages.
 * Gracefully parses $$...$$ display math, $...$ inline math, ``` code blocks,
 * bold/italic text, lists, and callout boxes.
 */
export const ChatFormattedText: React.FC<ChatFormattedTextProps> = ({ content }) => {
  if (!content) return null;

  // Split by code blocks first
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.slice(lastIndex, match.index);
    if (textBefore) {
      parts.push(renderTextAndMath(textBefore, `text-${lastIndex}`));
    }

    const lang = match[1] || '';
    const code = match[2];
    parts.push(
      <div key={`code-${match.index}`} className="my-2.5 rounded-xl overflow-hidden border border-slate-700/60 bg-[#0d1525] text-slate-100 text-xs">
        {lang && (
          <div className="px-3 py-1 bg-slate-800/80 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-700/60">
            {lang}
          </div>
        )}
        <pre className="p-3 overflow-x-auto font-mono text-xs leading-relaxed text-blue-200">
          <code>{code}</code>
        </pre>
      </div>
    );

    lastIndex = match.index + match[0].length;
  }

  const remaining = content.slice(lastIndex);
  if (remaining) {
    parts.push(renderTextAndMath(remaining, `text-${lastIndex}`));
  }

  return <div className="space-y-2 text-sm leading-relaxed">{parts}</div>;
};

/**
 * Parses markdown paragraphs, bullet points, headers, and display/inline math ($$ and $)
 */
function renderTextAndMath(text: string, keyPrefix: string): React.ReactNode {
  // Split into lines/paragraphs
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = (idx: number) => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`${keyPrefix}-list-${idx}`} className="space-y-1 my-2 pl-4 list-disc marker:text-blue-500">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Check for display math $$...$$
    if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length >= 4) {
      flushList(idx);
      const mathStr = trimmed.slice(2, -2).trim();
      elements.push(
        <div key={`${keyPrefix}-math-block-${idx}`} className="my-2.5 p-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-center">
          <MathFormula formula={mathStr} block />
        </div>
      );
      return;
    }

    // Check for headers (###, ##, #)
    if (trimmed.startsWith('### ')) {
      flushList(idx);
      elements.push(
        <h4 key={`${keyPrefix}-h4-${idx}`} className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-3 mb-1.5 flex items-center gap-1.5">
          {renderInlineMathAndBold(trimmed.slice(4))}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushList(idx);
      elements.push(
        <h3 key={`${keyPrefix}-h3-${idx}`} className="text-base font-bold text-slate-900 dark:text-slate-100 mt-3.5 mb-1.5">
          {renderInlineMathAndBold(trimmed.slice(3))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('# ')) {
      flushList(idx);
      elements.push(
        <h2 key={`${keyPrefix}-h2-${idx}`} className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2">
          {renderInlineMathAndBold(trimmed.slice(2))}
        </h2>
      );
      return;
    }

    // Check for unordered list item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(
        <li key={`${keyPrefix}-li-${idx}`} className="text-slate-700 dark:text-slate-300">
          {renderInlineMathAndBold(trimmed.slice(2))}
        </li>
      );
      return;
    }

    // Check for ordered list item (e.g. "1. ")
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      flushList(idx);
      elements.push(
        <div key={`${keyPrefix}-num-${idx}`} className="flex items-start gap-2 my-1 text-slate-700 dark:text-slate-300">
          <span className="shrink-0 font-bold text-blue-600 dark:text-blue-400 font-mono text-xs mt-0.5">
            {numMatch[1]}.
          </span>
          <div className="flex-1">{renderInlineMathAndBold(numMatch[2])}</div>
        </div>
      );
      return;
    }

    // Normal empty line
    if (!trimmed) {
      flushList(idx);
      return;
    }

    // Normal paragraph line
    flushList(idx);
    elements.push(
      <p key={`${keyPrefix}-p-${idx}`} className="text-slate-700 dark:text-slate-300 my-1">
        {renderInlineMathAndBold(trimmed)}
      </p>
    );
  });

  flushList(lines.length);

  return <React.Fragment key={keyPrefix}>{elements}</React.Fragment>;
}

/**
 * Handles bolding **text**, italics *text*, and inline math $formula$
 */
function renderInlineMathAndBold(text: string): React.ReactNode {
  // Regex to match inline math $...$, bold **...**, and inline code `...`
  const tokenRegex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$|\*\*[^*]+?\*\*|`[^`]+?`)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `token-${match.index}`;

    if (token.startsWith('$$') && token.endsWith('$$')) {
      parts.push(<MathFormula key={key} formula={token.slice(2, -2)} block />);
    } else if (token.startsWith('$') && token.endsWith('$')) {
      parts.push(<MathFormula key={key} formula={token.slice(1, -1)} inline />);
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={key} className="font-semibold text-slate-900 dark:text-slate-100">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={key} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 rounded font-mono text-xs">
          {token.slice(1, -1)}
        </code>
      );
    } else {
      parts.push(token);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
