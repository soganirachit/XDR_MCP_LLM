import React, { useState } from 'react';
import { User, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

// Function to clean duplicate content from message
// The LLM sometimes returns formatted markdown AND a raw text summary at the end
const cleanDuplicateContent = (text: string): string => {
  if (!text) return '';

  const lines = text.split('\n');
  const cleanedLines: string[] = [];
  const seenContent = new Set<string>();

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines at the start
    if (cleanedLines.length === 0 && trimmedLine === '') {
      continue;
    }

    // Normalize the line for duplicate detection (remove markdown formatting)
    const normalizedLine = trimmedLine
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .replace(/^#+\s*/, '')
      .replace(/^[-*+]\s*/, '')
      .replace(/^\d+\.\s*/, '')
      .trim()
      .toLowerCase();

    // Skip if we've already seen similar content (longer than 50 chars to avoid false positives)
    if (normalizedLine.length > 50 && seenContent.has(normalizedLine)) {
      continue;
    }

    // Skip lines that look like raw inline summaries (multiple **field**: patterns in one line)
    if (trimmedLine.includes(' - **') && trimmedLine.match(/\*\*[^*]+\*\*:/g)) {
      const inlinePatterns = trimmedLine.match(/\*\*[^*]+\*\*:/g);
      if (inlinePatterns && inlinePatterns.length >= 2) {
        continue;
      }
    }

    // Skip lines that start with common duplicate patterns and have inline markdown
    if (trimmedLine.match(/^(Here is|Here's|Below is|The following)/i)) {
      const boldPatternMatches = trimmedLine.match(/\*\*[^*]+\*\*/g);
      if (boldPatternMatches && boldPatternMatches.length > 2) {
        continue;
      }
    }

    // Track normalized content for duplicate detection
    if (normalizedLine.length > 50) {
      seenContent.add(normalizedLine);
    }

    cleanedLines.push(line);
  }

  // Remove trailing empty lines
  while (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1].trim() === '') {
    cleanedLines.pop();
  }

  return cleanedLines.join('\n');
};

// Simple markdown renderer for common patterns
const renderMarkdown = (text: string): React.ReactNode => {
  if (!text) return null;

  // Clean any duplicate content first
  const cleanedText = cleanDuplicateContent(text);

  const lines = cleanedText.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLang = '';
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (listItems.length > 0 && listType) {
      const ListTag = listType === 'ol' ? 'ol' : 'ul';
      elements.push(
        <ListTag
          key={`list-${elements.length}`}
          className={`my-3 ${listType === 'ol' ? 'list-decimal' : 'list-disc'} list-inside space-y-1`}
        >
          {listItems.map((item, idx) => (
            <li key={idx} className="text-text-primary">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ListTag>
      );
      listItems = [];
      listType = null;
    }
  };

  const renderInlineMarkdown = (line: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let keyIndex = 0;

    while (remaining.length > 0) {
      // Bold: **text** or __text__
      const boldMatch = remaining.match(/^(.*?)(\*\*|__)(.+?)\2(.*)$/s);
      if (boldMatch) {
        if (boldMatch[1]) parts.push(boldMatch[1]);
        parts.push(<strong key={keyIndex++} className="font-semibold">{boldMatch[3]}</strong>);
        remaining = boldMatch[4];
        continue;
      }

      // Italic: *text*
      const italicMatch = remaining.match(/^(.*?)\*([^*]+)\*(.*)$/s);
      if (italicMatch && !italicMatch[1].endsWith('*')) {
        if (italicMatch[1]) parts.push(italicMatch[1]);
        parts.push(<em key={keyIndex++} className="italic">{italicMatch[2]}</em>);
        remaining = italicMatch[3];
        continue;
      }

      // Inline code: `code`
      const codeMatch = remaining.match(/^(.*?)`([^`]+)`(.*)$/s);
      if (codeMatch) {
        if (codeMatch[1]) parts.push(codeMatch[1]);
        parts.push(
          <code key={keyIndex++} className="px-1.5 py-0.5 bg-background-tertiary text-primary-700 rounded text-sm font-mono">
            {codeMatch[2]}
          </code>
        );
        remaining = codeMatch[3];
        continue;
      }

      // Links: [text](url)
      const linkMatch = remaining.match(/^(.*?)\[([^\]]+)\]\(([^)]+)\)(.*)$/s);
      if (linkMatch) {
        if (linkMatch[1]) parts.push(linkMatch[1]);
        parts.push(
          <a
            key={keyIndex++}
            href={linkMatch[3]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-600 underline"
          >
            {linkMatch[2]}
          </a>
        );
        remaining = linkMatch[4];
        continue;
      }

      parts.push(remaining);
      break;
    }

    return parts.length === 1 ? parts[0] : parts;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block start/end
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        flushList();
        inCodeBlock = true;
        codeBlockLang = line.slice(3).trim();
        codeBlockContent = [];
      } else {
        elements.push(
          <div key={`code-${elements.length}`} className="my-3 rounded-lg overflow-hidden">
            {codeBlockLang && (
              <div className="bg-slate-800 text-slate-400 text-xs px-4 py-1 border-b border-slate-700">
                {codeBlockLang}
              </div>
            )}
            <pre className="bg-slate-800 p-4 overflow-x-auto">
              <code className="text-sm text-slate-100 font-mono">
                {codeBlockContent.join('\n')}
              </code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBlockLang = '';
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      flushList();
      const level = headerMatch[1].length;
      const text = headerMatch[2];
      const headerClasses: { [key: number]: string } = {
        1: 'text-xl font-bold mt-4 mb-2',
        2: 'text-lg font-semibold mt-3 mb-2',
        3: 'text-base font-semibold mt-3 mb-1',
        4: 'text-sm font-semibold mt-2 mb-1',
        5: 'text-sm font-medium mt-2 mb-1',
        6: 'text-xs font-medium mt-2 mb-1',
      };
      elements.push(
        <div
          key={`header-${elements.length}`}
          className={`${headerClasses[level]} text-text-primary`}
        >
          {renderInlineMarkdown(text)}
        </div>
      );
      continue;
    }

    // Unordered list items
    const ulMatch = line.match(/^[\s]*[-*+]\s+(.+)$/);
    if (ulMatch) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listItems.push(ulMatch[1]);
      continue;
    }

    // Ordered list items
    const olMatch = line.match(/^[\s]*\d+\.\s+(.+)$/);
    if (olMatch) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listItems.push(olMatch[1]);
      continue;
    }

    // Horizontal rule
    if (line.match(/^[-*_]{3,}$/)) {
      flushList();
      elements.push(<hr key={`hr-${elements.length}`} className="my-4 border-sidebar-border" />);
      continue;
    }

    // Blockquote
    const quoteMatch = line.match(/^>\s*(.*)$/);
    if (quoteMatch) {
      flushList();
      elements.push(
        <blockquote
          key={`quote-${elements.length}`}
          className="border-l-4 border-primary pl-4 my-2 text-text-secondary italic"
        >
          {renderInlineMarkdown(quoteMatch[1])}
        </blockquote>
      );
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      flushList();
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${elements.length}`} className="text-text-primary mb-2 leading-relaxed">
        {renderInlineMarkdown(line)}
      </p>
    );
  }

  flushList();
  return elements;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (isUser) {
    // User message - simple right-aligned bubble
    return (
      <div className="flex justify-end mb-4">
        <div className="flex items-start gap-3 max-w-2xl">
          <div className="bg-primary text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>
    );
  }

  // Assistant message - full width with markdown rendering
  return (
    <div className="mb-6">
      <div className="flex items-start gap-3">
        {/* Assistant Avatar - using a styled icon instead of image */}
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">W</span>
        </div>

        {/* Message content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-text-primary">Wazuh Assistant</span>
            <span className="text-xs text-text-muted">
              {format(message.timestamp, 'HH:mm')}
            </span>
          </div>

          {/* Markdown content only - no Thesys components */}
          <div className="prose prose-slate max-w-none">
            {renderMarkdown(message.content)}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-primary" />
                  <span className="text-primary">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
