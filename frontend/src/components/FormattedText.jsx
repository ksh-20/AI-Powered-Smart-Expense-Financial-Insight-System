import React from "react";

export default function FormattedText({ text, className = "" }) {
  if (!text) return null;

  // Split text by lines
  const lines = text.split("\n");
  const elements = [];
  let currentList = [];
  let listType = null; // 'ul' | 'ol'

  const renderInline = (str) => {
    if (!str) return null;

    // First, strip any stray leading/trailing quotes or backticks if needed
    let cleaned = str;

    // Parse **bold** into <strong>
    const parts = [];
    const regex = /\*\*(.*?)\*\*/g;
    let lastIdx = 0;
    let match;

    while ((match = regex.exec(cleaned)) !== null) {
      if (match.index > lastIdx) {
        parts.push(cleaned.substring(lastIdx, match.index));
      }
      parts.push(
        <strong key={match.index} className="font-bold text-white">
          {match[1]}
        </strong>
      );
      lastIdx = regex.lastIndex;
    }

    if (lastIdx < cleaned.length) {
      parts.push(cleaned.substring(lastIdx));
    }

    return parts.length > 0 ? parts : cleaned;
  };

  const flushList = () => {
    if (currentList.length > 0) {
      if (listType === "ol") {
        elements.push(
          <ol key={`ol-${elements.length}`} className="space-y-2 my-2.5 pl-1">
            {currentList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-slate-200">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5 border border-indigo-500/30">
                  {idx + 1}
                </span>
                <span className="leading-relaxed flex-1">{renderInline(item)}</span>
              </li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="space-y-2 my-2.5 pl-1">
            {currentList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 mt-2" />
                <span className="leading-relaxed flex-1">{renderInline(item)}</span>
              </li>
            ))}
          </ul>
        );
      }
      currentList = [];
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();

    if (!rawLine) {
      flushList();
      continue;
    }

    // Markdown Headings (e.g. ### Header or ## Header or # Header)
    if (rawLine.startsWith("#")) {
      flushList();
      const headingText = rawLine.replace(/^#+\s*/, "");
      elements.push(
        <h4
          key={`h-${i}`}
          className="text-sm font-bold text-white tracking-tight mt-3.5 mb-1.5"
        >
          {renderInline(headingText)}
        </h4>
      );
      continue;
    }

    // Numbered List Items (e.g. 1. Item or 1) Item)
    const numMatch = rawLine.match(/^\d+[\.\)]\s+(.*)/);
    if (numMatch) {
      if (listType !== "ol") {
        flushList();
        listType = "ol";
      }
      currentList.push(numMatch[1]);
      continue;
    }

    // Bullet List Items (e.g. * Item, - Item, • Item)
    const bulletMatch = rawLine.match(/^[\*\-\•]\s+(.*)/);
    if (bulletMatch) {
      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }
      currentList.push(bulletMatch[1]);
      continue;
    }

    // Standard Paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="text-slate-200 leading-relaxed my-1.5">
        {renderInline(rawLine)}
      </p>
    );
  }

  flushList();

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
}
