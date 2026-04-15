"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Brain, HeartHandshake } from "lucide-react";
import { useChatStore } from "../store/chatStore";

interface ChatInputProps {
  onSend: (message: string) => void;
  onValueChange: (value: string) => void;
  value: string;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  onValueChange,
  value,
  disabled,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isStreaming } = useChatStore();

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 132)}px`;
  }, [value]);

  useEffect(() => {
    if (!disabled) {
      textareaRef.current?.focus();
    }
  }, [disabled]);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSend(trimmed);
    onValueChange("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, isStreaming, disabled, onSend, onValueChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="mx-auto w-full max-w-[54rem]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[1.35rem] border border-white/8 bg-[linear-gradient(180deg,rgba(2,6,23,0.82),rgba(8,15,28,0.96))] p-2 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:rounded-[1.6rem] sm:p-2.5"
      >
        <div className="mb-1.5 flex items-center gap-2 px-2 pt-0.5 text-sm text-slate-300">
          <span className="inline-flex rounded-xl bg-emerald-300/10 p-2 text-emerald-100">
            {isStreaming ? <Brain className="h-4 w-4" /> : <HeartHandshake className="h-4 w-4" />}
          </span>
          <span>{isStreaming ? "Analyzing..." : "Message the dataset workspace"}</span>
        </div>

        <div className="relative flex items-end gap-3 overflow-hidden rounded-[1.1rem] px-3 py-2 sm:rounded-[1.35rem] sm:px-4 sm:py-2.5">
          <div className="pointer-events-none absolute inset-0 rounded-[inherit]">
            <motion.div
              animate={{
                rotate: 360,
                filter: [
                  "hue-rotate(0deg) saturate(1)",
                  "hue-rotate(90deg) saturate(1.15)",
                  "hue-rotate(180deg) saturate(1.05)",
                  "hue-rotate(270deg) saturate(1.2)",
                  "hue-rotate(360deg) saturate(1)",
                ],
              }}
              transition={{
                rotate: { duration: 7, repeat: Infinity, ease: "linear" },
                filter: { duration: 10, repeat: Infinity, ease: "linear" },
              }}
              className="absolute left-1/2 top-1/2 h-[220%] w-[220%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,rgba(16,185,129,0.1),rgba(34,211,238,0.85),rgba(96,165,250,0.2),rgba(244,114,182,0.78),rgba(250,204,21,0.35),rgba(16,185,129,0.1))]"
            />
            <div className="absolute inset-px rounded-[calc(1.1rem-1px)] bg-[rgba(12,18,31,0.96)] sm:rounded-[calc(1.35rem-1px)]" />
            <div className="absolute inset-[1px] rounded-[calc(1.1rem-1px)] border border-white/8 sm:rounded-[calc(1.35rem-1px)]" />
          </div>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isStreaming}
            placeholder="Ask about support patterns or summarize a conversation..."
            rows={1}
            className="no-scrollbar relative z-10 min-h-[24px] max-h-[132px] flex-1 resize-none bg-transparent text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500 sm:text-[15px]"
          />

          <motion.button
            whileHover={{ scale: disabled || isStreaming ? 1 : 1.04 }}
            whileTap={{ scale: disabled || isStreaming ? 1 : 0.97 }}
            onClick={handleSubmit}
            disabled={!value.trim() || disabled || isStreaming}
            className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 text-white shadow-lg shadow-emerald-950/25 transition-all disabled:cursor-not-allowed disabled:opacity-40 sm:h-12 sm:w-12 sm:rounded-2xl"
            title="Send message"
          >
            {isStreaming ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-5 w-5 rounded-full border-2 border-white/25 border-t-white"
              />
            ) : (
              <ArrowUp className="h-5 w-5" />
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
