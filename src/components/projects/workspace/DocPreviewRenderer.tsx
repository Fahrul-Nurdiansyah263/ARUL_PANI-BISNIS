"use client";

import React, { useMemo } from "react";
import { CheckSquare, Square, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocPreviewRendererProps {
  content: string;
  onToggleChecklist?: (lineIndex: number, checked: boolean) => void;
  className?: string;
}

export default function DocPreviewRenderer({
  content,
  onToggleChecklist,
  className,
}: DocPreviewRendererProps) {
  // Parse markdown & basic HTML into structured blocks
  const renderedElements = useMemo(() => {
    if (!content) return null;

    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let index = 0;

    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLang = "";

    let inTable = false;
    let tableLines: string[] = [];

    const flushCodeBlock = (key: string) => {
      if (codeBlockContent.length > 0) {
        elements.push(
          <div
            key={key}
            className="my-3 rounded-xl bg-muted/80 dark:bg-black/40 border border-border p-4 font-mono text-xs overflow-x-auto relative group"
          >
            {codeBlockLang && (
              <span className="absolute top-2 right-3 text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                {codeBlockLang}
              </span>
            )}
            <pre className="text-foreground leading-relaxed">
              <code>{codeBlockContent.join("\n")}</code>
            </pre>
          </div>
        );
        codeBlockContent = [];
        codeBlockLang = "";
      }
      inCodeBlock = false;
    };

    const flushTable = (key: string) => {
      if (tableLines.length >= 2) {
        const headerLine = tableLines[0];
        const rows = tableLines.slice(2); // skip separator line (index 1)

        const parseRowCells = (line: string) => {
          return line
            .replace(/^\|/, "")
            .replace(/\|$/, "")
            .split("|")
            .map((c) => c.trim());
        };

        const headers = parseRowCells(headerLine);

        elements.push(
          <div
            key={key}
            className="my-4 overflow-x-auto rounded-xl border border-border/80 shadow-2xs bg-card"
          >
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-muted/60 text-muted-foreground font-semibold">
                  {headers.map((h, hIdx) => (
                    <th
                      key={hIdx}
                      className="px-4 py-2.5 font-semibold text-foreground border-r last:border-r-0 border-border/60"
                    >
                      {renderInlineFormatting(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rows.map((r, rIdx) => {
                  const cells = parseRowCells(r);
                  return (
                    <tr
                      key={rIdx}
                      className="hover:bg-accent/40 transition-colors even:bg-muted/15"
                    >
                      {cells.map((c, cIdx) => (
                        <td
                          key={cIdx}
                          className="px-4 py-2.5 text-card-foreground border-r last:border-r-0 border-border/60"
                        >
                          {renderInlineFormatting(c || "-")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
      tableLines = [];
      inTable = false;
    };

    while (index < lines.length) {
      const line = lines[index];
      const trimmed = line.trim();

      // Handle Code Block ```
      if (trimmed.startsWith("```")) {
        if (inCodeBlock) {
          flushCodeBlock(`code-${index}`);
        } else {
          if (inTable) flushTable(`table-${index}`);
          inCodeBlock = true;
          codeBlockLang = trimmed.slice(3).trim();
        }
        index++;
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        index++;
        continue;
      }

      // Handle Table Lines (| col1 | col2 |)
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        inTable = true;
        tableLines.push(trimmed);
        index++;
        continue;
      } else if (inTable) {
        flushTable(`table-${index}`);
      }

      // Handle Empty Line
      if (trimmed === "") {
        elements.push(<div key={`empty-${index}`} className="h-3" />);
        index++;
        continue;
      }

      // Handle Horizontal Rule
      if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
        elements.push(
          <hr key={`hr-${index}`} className="my-5 border-border/80" />
        );
        index++;
        continue;
      }

      // Handle Headings (#, ##, ###, ####, #####)
      if (trimmed.startsWith("# ")) {
        elements.push(
          <h1
            key={`h1-${index}`}
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-6 mb-2 border-b border-border/50 pb-1.5"
          >
            {renderInlineFormatting(trimmed.slice(2))}
          </h1>
        );
        index++;
        continue;
      }
      if (trimmed.startsWith("## ")) {
        elements.push(
          <h2
            key={`h2-${index}`}
            className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-5 mb-2"
          >
            {renderInlineFormatting(trimmed.slice(3))}
          </h2>
        );
        index++;
        continue;
      }
      if (trimmed.startsWith("### ")) {
        elements.push(
          <h3
            key={`h3-${index}`}
            className="text-lg font-semibold tracking-tight text-foreground mt-4 mb-1.5"
          >
            {renderInlineFormatting(trimmed.slice(4))}
          </h3>
        );
        index++;
        continue;
      }
      if (trimmed.startsWith("#### ")) {
        elements.push(
          <h4
            key={`h4-${index}`}
            className="text-base font-semibold text-foreground mt-3 mb-1"
          >
            {renderInlineFormatting(trimmed.slice(5))}
          </h4>
        );
        index++;
        continue;
      }

      // Handle Blockquotes (> )
      if (trimmed.startsWith("> ")) {
        elements.push(
          <blockquote
            key={`quote-${index}`}
            className="my-3 border-l-4 border-primary/70 bg-primary/5 pl-4 py-2 rounded-r-lg text-xs italic text-muted-foreground"
          >
            {renderInlineFormatting(trimmed.slice(2))}
          </blockquote>
        );
        index++;
        continue;
      }

      // Handle Checklist (- [ ] or - [x])
      const checklistMatch = trimmed.match(/^-\s*\[([ xX])\]\s*(.*)$/);
      if (checklistMatch) {
        const isChecked = checklistMatch[1].toLowerCase() === "x";
        const text = checklistMatch[2];
        const lineIdx = index;

        elements.push(
          <div
            key={`check-${index}`}
            className="flex items-start gap-2.5 my-1 text-xs text-foreground group"
          >
            <button
              type="button"
              onClick={() => onToggleChecklist?.(lineIdx, !isChecked)}
              className="mt-0.5 text-primary hover:scale-110 transition-transform shrink-0"
              title={isChecked ? "Tandai belum selesai" : "Tandai selesai"}
            >
              {isChecked ? (
                <CheckSquare size={15} className="text-primary" />
              ) : (
                <Square size={15} className="text-muted-foreground/70" />
              )}
            </button>
            <span
              className={cn(
                "leading-relaxed transition-colors",
                isChecked && "line-through text-muted-foreground/70"
              )}
            >
              {renderInlineFormatting(text)}
            </span>
          </div>
        );
        index++;
        continue;
      }

      // Handle Numbered List (1. , 2. )
      const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numberedMatch) {
        const num = numberedMatch[1];
        const text = numberedMatch[2];
        elements.push(
          <div
            key={`num-${index}`}
            className="flex items-start gap-2.5 my-1 text-xs text-foreground"
          >
            <span className="font-semibold text-primary/80 shrink-0 min-w-[20px] text-right">
              {num}.
            </span>
            <span className="leading-relaxed flex-1">
              {renderInlineFormatting(text)}
            </span>
          </div>
        );
        index++;
        continue;
      }

      // Handle Bullet List (- or *)
      const bulletMatch = trimmed.match(/^[-*+]\s+(.*)$/);
      if (bulletMatch) {
        const text = bulletMatch[1];
        elements.push(
          <div
            key={`bullet-${index}`}
            className="flex items-start gap-2.5 my-1 text-xs text-foreground"
          >
            <span className="text-primary font-black shrink-0 mt-0.5">•</span>
            <span className="leading-relaxed flex-1">
              {renderInlineFormatting(text)}
            </span>
          </div>
        );
        index++;
        continue;
      }

      // Handle Images (![alt](url))
      const imageMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imageMatch) {
        const alt = imageMatch[1];
        const src = imageMatch[2];
        elements.push(
          <figure key={`img-${index}`} className="my-4 space-y-1.5">
            <div className="rounded-xl overflow-hidden border border-border/80 bg-muted/20 max-h-[480px] flex items-center justify-center">
              <img
                src={src}
                alt={alt || "Gambar Dokumen"}
                className="max-h-[480px] w-auto object-contain rounded-lg"
              />
            </div>
            {alt && (
              <figcaption className="text-center text-[11px] text-muted-foreground italic">
                {alt}
              </figcaption>
            )}
          </figure>
        );
        index++;
        continue;
      }

      // Standard Paragraph
      elements.push(
        <p
          key={`p-${index}`}
          className="my-1.5 text-xs text-foreground leading-relaxed"
        >
          {renderInlineFormatting(line)}
        </p>
      );
      index++;
    }

    if (inCodeBlock) flushCodeBlock("code-end");
    if (inTable) flushTable("table-end");

    return elements;
  }, [content, onToggleChecklist]);

  return (
    <div className={cn("space-y-1 text-xs text-foreground", className)}>
      {renderedElements}
    </div>
  );
}

/**
 * Render inline markdown elements:
 * - <span style="font-size: ...">...</span>
 * - **bold**
 * - *italic*
 * - `code`
 * - [link](url)
 */
function renderInlineFormatting(text: string): React.ReactNode {
  if (!text) return null;

  const elements: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  const tokenRegex =
    /(<span\s+style=["']font-size:\s*([^"';]+);?["']>([\s\S]*?)<\/span>|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/i;

  while (remaining.length > 0) {
    const match = remaining.match(tokenRegex);
    if (!match || match.index === undefined) {
      elements.push(<React.Fragment key={key++}>{remaining}</React.Fragment>);
      break;
    }

    if (match.index > 0) {
      elements.push(
        <React.Fragment key={key++}>
          {remaining.substring(0, match.index)}
        </React.Fragment>
      );
    }

    const fullMatch = match[0];

    // 1. Font size span
    if (match[2] && match[3] !== undefined) {
      const fontSize = match[2].trim();
      const innerText = match[3];
      elements.push(
        <span
          key={key++}
          style={{ fontSize }}
          className="font-medium tracking-tight"
        >
          {renderInlineFormatting(innerText)}
        </span>
      );
    }
    // 2. Bold **text**
    else if (match[4]) {
      elements.push(
        <strong key={key++} className="font-bold text-foreground">
          {match[4]}
        </strong>
      );
    }
    // 3. Italic *text*
    else if (match[5]) {
      elements.push(
        <em key={key++} className="italic text-foreground">
          {match[5]}
        </em>
      );
    }
    // 4. Code `text`
    else if (match[6]) {
      elements.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 rounded bg-muted font-mono text-[11px] text-primary border border-border/60"
        >
          {match[6]}
        </code>
      );
    }
    // 5. Link [text](url)
    else if (match[7] && match[8]) {
      elements.push(
        <a
          key={key++}
          href={match[8]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:opacity-80 inline-flex items-center gap-0.5"
        >
          {match[7]}
          <ExternalLink size={10} className="inline" />
        </a>
      );
    }

    remaining = remaining.substring(match.index + fullMatch.length);
  }

  return elements;
}
