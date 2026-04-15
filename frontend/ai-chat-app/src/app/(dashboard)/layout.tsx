"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Menu } from "lucide-react";
import { useAuthUser } from "@/hooks/use-auth";
import { useChatStore } from "../store/chatStore";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const createConversation = useChatStore((state) => state.createConversation);
  const setSidebarOpen = useChatStore((state) => state.setSidebarOpen);
  const { data: currentUser, isLoading } = useAuthUser();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace("/sign-in");
    }
  }, [currentUser, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09111d] text-sm text-slate-400">
        Loading workspace...
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#09111d] text-slate-100">
      <Sidebar onNewChat={createConversation} />
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-blue-500/10 via-sky-400/5 to-transparent" />
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute left-4 top-4 z-30 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/70 text-slate-100 shadow-lg shadow-black/20 backdrop-blur-xl transition hover:bg-slate-900 md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <main className="relative flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
