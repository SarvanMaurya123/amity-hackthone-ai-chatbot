"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Tags,
} from "lucide-react";
import type { Conversation } from "@/types/conversation";
import { MessageBubble, TypingIndicator } from "./MessageBubble";

interface ChatAreaProps {
  conversation: Conversation | null;
  onSelectPrompt: (prompt: string) => void;
  showTypingIndicator: boolean;
}

const starterPrompts = [
  "Group these conversations by support intent and emotional tone.",
  "Create training prompts from mental health support dialogues.",
  "Summarize common empathy patterns across this dataset.",
  "Flag responses that sound less supportive or emotionally safe.",
];

function PromptChip({
  onClick,
  text,
}: {
  onClick: () => void;
  text: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-slate-100"
    >
      <span className="line-clamp-2">{text}</span>
      <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-500 transition group-hover:text-emerald-200" />
    </button>
  );
}

function WelcomeScreen({ onSelectPrompt }: { onSelectPrompt: (prompt: string) => void }) {
  const highlights = [
    {
      icon: HeartHandshake,
      title: "Empathetic dialogue focus",
      description: "Review support interactions built around care, calm language, and emotional safety.",
    },
    {
      icon: Brain,
      title: "Training-ready structure",
      description: "Turn large conversation sets into summaries, tags, prompts, and model-ready examples.",
    },
    {
      icon: ShieldCheck,
      title: "Safer evaluation workflow",
      description: "Inspect conversational quality with a clearer workspace built for sensitive domains.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="relative flex h-full flex-col justify-center overflow-hidden px-4 py-8 text-center sm:px-6 sm:py-9 lg:px-8"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.08),transparent_24%)]" />

      <div className="relative mx-auto max-w-5xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-emerald-300/20 bg-gradient-to-br from-emerald-400/20 to-sky-500/20 text-emerald-100 shadow-[0_20px_50px_rgba(16,185,129,0.18)] sm:h-16 sm:w-16 sm:rounded-[1.5rem]">
          <HeartHandshake className="h-8 w-8 sm:h-10 sm:w-10" />
        </div>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-slate-300">
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          Mental Health Conversational AI Training Dataset
        </div>

        <h1 className="mx-auto max-w-4xl text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl lg:text-[2.6rem]">
          Explore 510k+ mental health conversations in a calmer analysis workspace
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-400 sm:text-[15px] sm:leading-7 lg:text-base">
          Review support dialogues, identify empathetic response patterns, and shape high-quality training data for LLMs with a more focused, trustworthy interface.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          {highlights.map((item) => (
            <motion.div
              key={item.title}
              whileHover={{ y: -4 }}
              className="rounded-[1.3rem] border border-white/8 bg-white/[0.04] p-4 text-left shadow-[0_12px_30px_rgba(0,0,0,0.12)] sm:rounded-[1.5rem] sm:p-4.5"
            >
              <div className="mb-4 inline-flex rounded-xl bg-emerald-300/10 p-3 text-emerald-200 sm:rounded-2xl">
                <item.icon className="h-5 w-5" />
              </div>
              <p className="text-lg font-medium text-slate-100">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1.35fr_0.95fr]">
          <div className="rounded-[1.3rem] border border-white/8 bg-slate-950/40 p-4 text-left sm:rounded-[1.5rem] sm:p-4.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              <Tags className="h-3.5 w-3.5" />
              Try one of these analysis prompts
            </div>
            <div className="mt-4 grid gap-3">
              {starterPrompts.map((suggestion) => (
                <PromptChip
                  key={suggestion}
                  text={suggestion}
                  onClick={() => onSelectPrompt(suggestion)}
                />
              ))}
            </div>
          </div>

          <div className="rounded-[1.3rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.86),rgba(12,18,31,0.76))] p-4 text-left sm:rounded-[1.5rem] sm:p-4.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              <Sparkles className="h-3.5 w-3.5" />
              Dataset Snapshot
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Conversations</p>
                <p className="mt-2 text-2xl font-semibold text-slate-50">510k+</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Domain</p>
                <p className="mt-2 text-2xl font-semibold text-slate-50">Mental Health</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Use Case</p>
                <p className="mt-2 text-lg font-semibold text-slate-50">Support LLM Training</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Strength</p>
                <p className="mt-2 text-lg font-semibold text-slate-50">Empathy Patterns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ChatArea({
  conversation,
  onSelectPrompt,
  showTypingIndicator,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [conversation?.messages, showTypingIndicator]);

  if (!conversation) {
    return (
      <div className="no-scrollbar flex-1 overflow-y-auto">
        <WelcomeScreen onSelectPrompt={onSelectPrompt} />
      </div>
    );
  }

  return (
    <div className="no-scrollbar flex h-full flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[56rem] flex-1 flex-col px-3 py-4 sm:px-4 sm:py-5 lg:px-5">
        {conversation.messages.length === 0 ? (
          <WelcomeScreen onSelectPrompt={onSelectPrompt} />
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-1">
              {conversation.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                  isStreaming={message.is_streaming}
                  metadata={message.metadata}
                />
              ))}

              {showTypingIndicator && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key="typing-indicator"
                  className="flex items-end gap-3 sm:gap-4"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-100 sm:h-10 sm:w-10 sm:rounded-2xl">
                    <HeartHandshake className="h-5 w-5" />
                  </div>
                  <div className="rounded-[1.5rem] rounded-bl-md border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] px-4 py-3 text-slate-100 shadow-[0_10px_28px_rgba(0,0,0,0.12)]">
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}
            </div>
          </AnimatePresence>
        )}

        <div ref={messagesEndRef} className="pt-3" />
      </div>
    </div>
  );
}
