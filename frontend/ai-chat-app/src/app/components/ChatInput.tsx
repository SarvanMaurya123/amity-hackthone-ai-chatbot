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
        className="rounded-[1.35rem] border border-white/8 bg-[linear-gradient(180deg,rgba(2,6,23,0.84),rgba(8,15,28,0.98))] p-2 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:rounded-[1.6rem] sm:p-2.5"
      >
        <div className="mb-2 flex items-center justify-between gap-3 px-2 pt-1">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span className="inline-flex rounded-xl bg-emerald-300/10 p-2 text-emerald-100">
              {isStreaming ? <Brain className="h-4 w-4" /> : <HeartHandshake className="h-4 w-4" />}
            </span>
            <div className="leading-tight">
              <p className="font-medium text-slate-100">
                {isStreaming ? "Preparing a supportive reply..." : "Chat with MindSupport AI"}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                English, Hindi, Hinglish supported
              </p>
            </div>
          </div>
          <span className="hidden rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 sm:inline-flex">
            Enter to send
          </span>
        </div>

        <div className="relative overflow-hidden rounded-[1.15rem] p-[1.5px] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_16px_38px_rgba(0,0,0,0.2)] sm:rounded-[1.35rem]">
          <div className="pointer-events-none absolute inset-0 rounded-[inherit]">
            <motion.div
              animate={{
                rotate: 360,
                filter: [
                  "hue-rotate(0deg) saturate(1)",
                  "hue-rotate(90deg) saturate(1.1)",
                  "hue-rotate(180deg) saturate(1.05)",
                  "hue-rotate(270deg) saturate(1.15)",
                  "hue-rotate(360deg) saturate(1)",
                ],
              }}
              transition={{
                rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                filter: { duration: 8, repeat: Infinity, ease: "linear" },
              }}
              className="absolute left-1/2 top-1/2 h-[245%] w-[245%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,rgba(16,185,129,0.24),rgba(34,211,238,0.92),rgba(96,165,250,0.5),rgba(244,114,182,0.7),rgba(250,204,21,0.36),rgba(16,185,129,0.24))]"
            />
          </div>

          <div className="relative rounded-[calc(1.15rem-1.5px)] bg-[linear-gradient(180deg,rgba(14,21,35,0.96),rgba(9,14,24,0.98))] px-3 py-3 sm:rounded-[calc(1.35rem-1.5px)] sm:px-4 sm:py-3.5">
            <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_42%)]" />

            <div className="relative z-10 flex items-end gap-3">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled || isStreaming}
                placeholder="Share what's on your mind... / Aap jo feel kar rahe ho woh likho..."
                rows={1}
                className="no-scrollbar min-h-[56px] max-h-[132px] flex-1 resize-none bg-transparent text-[15px] leading-7 text-slate-100 outline-none placeholder:text-slate-500 sm:text-base"
              />

              <motion.button
                whileHover={{ scale: disabled || isStreaming ? 1 : 1.04 }}
                whileTap={{ scale: disabled || isStreaming ? 1 : 0.97 }}
                onClick={handleSubmit}
                disabled={!value.trim() || disabled || isStreaming}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center self-end rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 text-white shadow-lg shadow-emerald-950/25 transition-all disabled:cursor-not-allowed disabled:opacity-40 sm:h-12 sm:w-12"
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

            <div className="relative z-10 mt-2 flex items-center justify-between gap-3 px-0.5 text-[11px] text-slate-500">
              <span className="leading-5">
                Calm, supportive replies with multilingual context
              </span>
              <span className="whitespace-nowrap">
                Shift + Enter for a new line
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
