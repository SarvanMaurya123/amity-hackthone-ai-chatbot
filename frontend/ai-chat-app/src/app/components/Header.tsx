"use client";

import { motion } from "framer-motion";
import {
  Command,
  Menu,
  PanelLeftOpen,
  Search,
  Settings2,
  Sparkles,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useConversations } from "@/hooks/use-conversations";
import { useChatStore } from "../store/chatStore";

const pageMeta = {
  "/chat": {
    eyebrow: "AI Workspace",
    title: "Luminous Chat",
    description: "Start a conversation, revisit recent threads, and keep your work moving.",
  },
  "/settings": {
    eyebrow: "Preferences",
    title: "Settings",
    description: "Manage your workspace, privacy controls, and interface preferences.",
  },
} as const;

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const toggleSidebar = useChatStore((state) => state.toggleSidebar);
  const { data: conversations = [] } = useConversations(true);

  const meta = pageMeta[pathname as keyof typeof pageMeta] ?? pageMeta["/chat"];

  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300 md:inline-flex">
            <Sparkles className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              {meta.eyebrow}
            </p>
            <div className="flex min-w-0 items-center gap-3">
              <h1 className="truncate text-lg font-semibold text-slate-50 sm:text-xl">
                {meta.title}
              </h1>
              <span className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 sm:inline-flex">
                {conversations.length} saved chats
              </span>
            </div>
            <p className="hidden truncate text-sm text-slate-400 lg:block">
              {meta.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 lg:flex">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations"
              className="w-52 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
            />
            <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-400">
              <Command className="h-3 w-3" />
              K
            </span>
          </div>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/chat")}
            className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 sm:inline-flex"
          >
            <PanelLeftOpen className="h-4 w-4" />
            Workspace
          </motion.button>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/settings")}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-sky-400/10 px-4 py-2.5 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20"
          >
            <Settings2 className="h-4 w-4" />
            Settings
          </motion.button>
        </div>
      </div>
    </header>
  );
}
