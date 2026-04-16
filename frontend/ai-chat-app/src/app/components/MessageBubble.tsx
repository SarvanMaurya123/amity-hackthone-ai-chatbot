"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Bot, Check, Copy } from "lucide-react";
import type { Components } from "react-markdown";
import type { MessageMetadata } from "@/types/conversation";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp: Date | string;
  isStreaming?: boolean;
  metadata?: MessageMetadata | null;
}

function CopyButton({ text, invert = false }: { text: string; invert?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const base =
    "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold tracking-[0.08em] uppercase transition-all duration-150 border";
  const light = "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200 bg-white/[0.03]";
  const dark = "border-white/15 text-white/50 hover:border-white/30 hover:text-white/90 bg-white/5";

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleCopy}
      className={`${base} ${invert ? dark : light}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="ok"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="flex items-center gap-1"
          >
            <Check className="h-2.5 w-2.5" /> Copied
          </motion.span>
        ) : (
          <motion.span
            key="cp"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="flex items-center gap-1"
          >
            <Copy className="h-2.5 w-2.5" /> Copy
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

const markdownComponents: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const codeString = String(children).replace(/\n$/, "");
    const isBlock = Boolean(codeString.includes("\n") || match);
    const lang = match?.[1] || "text";

    if (isBlock) {
      return (
        <div className="my-4 overflow-hidden rounded-2xl bg-[#0b1220]">
          <div className="flex items-center justify-between bg-white/[0.03] px-3.5 py-2.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              {lang}
            </span>
            <CopyButton text={codeString} />
          </div>
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={lang}
            PreTag="div"
            showLineNumbers
            lineNumberStyle={{
              color: "#4b5563",
              minWidth: "2.5rem",
              userSelect: "none",
              fontSize: "0.75rem",
            }}
            customStyle={{
              margin: 0,
              padding: "0.9rem 1rem",
              fontSize: "0.82rem",
              background: "transparent",
              maxHeight: "400px",
              overflow: "auto",
            }}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      );
    }

    return (
      <code
        className="rounded-md border border-emerald-300/15 bg-emerald-300/[0.08] px-1.5 py-0.5 font-mono text-[0.82em] text-emerald-100"
        {...props}
      >
        {children}
      </code>
    );
  },
  h1: ({ children }) => (
    <h1 className="mb-2 mt-4 text-lg font-bold tracking-tight text-slate-50">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-1.5 mt-3 text-base font-semibold tracking-tight text-slate-100">{children}</h2>
  ),
  h3: ({ children }) => <h3 className="mb-1 mt-2.5 text-sm font-semibold text-slate-200">{children}</h3>,
  p: ({ children }) => <p className="my-1.5 text-[0.95rem] leading-7 text-slate-200">{children}</p>,
  ul: ({ children }) => <ul className="my-2 list-none space-y-1 pl-0">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-none space-y-1 pl-0">{children}</ol>,
  li: ({ children }) => (
    <li className="flex items-start gap-2 text-[0.92rem] leading-relaxed text-slate-200">
      <span className="mt-[0.48rem] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-300/70" />
      <span>{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-[3px] border-emerald-300/50 pl-3.5 text-sm italic text-slate-400">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sky-300 underline decoration-sky-400/40 underline-offset-2 transition-colors hover:text-sky-200"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-2xl border border-white/8">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-white/8 bg-white/[0.03] px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-white/[0.06] px-3 py-2 text-slate-200 last:border-0">{children}</td>
  ),
};

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.25, 1, 0.25], scale: [0.85, 1, 0.85] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
          className="h-1.5 w-1.5 rounded-full bg-emerald-200"
        />
      ))}
    </div>
  );
}

function AIAvatar() {
  return (
    <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-2xl border border-emerald-300/20 bg-gradient-to-br from-emerald-300/10 to-sky-500/10">
      <Bot className="h-4 w-4 text-emerald-100" strokeWidth={1.6} />
      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-[#0b1320] bg-emerald-300" />
    </div>
  );
}

function UserAvatar({ initials = "U" }: { initials?: string }) {
  return (
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-xs font-bold tracking-wider text-white">
      {initials}
    </div>
  );
}

function MetadataBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
      {label}
    </span>
  );
}

export function MessageBubble({
  role,
  content,
  timestamp,
  isStreaming,
  metadata,
}: MessageBubbleProps) {
  const time = new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const isUser = role === "user";
  const sourceLabel = metadata?.source ? metadata.source.replace("_", " ") : null;
  const languageLabel = metadata?.detected_language || null;
  const styleLabel = metadata?.language_style || null;

  return (
    <div className="mb-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className={`flex items-end gap-3 ${isUser ? "justify-end" : "justify-start"}`}
      >
        {!isUser && <AIAvatar />}

        <div className={`flex max-w-[88%] flex-col gap-2 sm:max-w-[74%] ${isUser ? "items-end" : "items-start"}`}>
          {isUser ? (
            <div className="relative w-full rounded-[1.5rem] rounded-br-md bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 px-4 py-3 text-white shadow-[0_12px_30px_rgba(37,99,235,0.28)]">
              <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <p className="whitespace-pre-wrap break-words text-[0.95rem] leading-7 text-white">{content}</p>
            </div>
          ) : (
            <div className="relative w-full rounded-[1.5rem] rounded-bl-md border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] px-4 py-3.5 shadow-[0_10px_28px_rgba(0,0,0,0.12)]">
              {isStreaming ? (
                <TypingIndicator />
              ) : (
                <div className="prose max-w-none text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}

          <div className={`flex flex-wrap items-center gap-2 px-1 ${isUser ? "justify-end" : "justify-start"}`}>
            <span className="text-[10px] tabular-nums text-slate-500">{time}</span>
            {!isUser && !isStreaming && sourceLabel && <MetadataBadge label={sourceLabel} />}
            {!isUser && !isStreaming && languageLabel && <MetadataBadge label={languageLabel} />}
            {!isUser && !isStreaming && styleLabel && <MetadataBadge label={styleLabel} />}
            {!isUser && !isStreaming && <CopyButton text={content} />}
          </div>
        </div>

        {isUser && <UserAvatar />}
      </motion.div>
    </div>
  );
}

export { TypingIndicator };
