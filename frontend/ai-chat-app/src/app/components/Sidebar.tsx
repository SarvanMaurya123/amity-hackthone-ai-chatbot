"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HeartHandshake,
  ChevronRight,
  LogOut,
  Menu,
  MessageSquare,
  MessageSquarePlus,
  MoreHorizontal,
  Pin,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthUser, useLogout } from "@/hooks/use-auth";
import { useChatStore } from "../store/chatStore";

interface SidebarProps {
  onNewChat: () => void;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

export default function Sidebar({ onNewChat }: SidebarProps) {
  const router = useRouter();
  const { data: currentUser } = useAuthUser();
  const signOut = useLogout();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const {
    conversations,
    activeConversationId,
    sidebarOpen,
    setSidebarOpen,
    setActiveConversation,
    deleteConversation,
    togglePin,
  } = useChatStore();

  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    router.push("/chat");
    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    onNewChat();
    router.push("/chat");
    setSidebarOpen(false);
  };

  useEffect(() => {
    const closeMenu = () => {
      setOpenMenuId(null);
      setProfileMenuOpen(false);
    };

    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={`fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-[19rem] flex-col border-r border-white/8 bg-[linear-gradient(180deg,rgba(7,17,29,0.98),rgba(9,18,31,0.95))] shadow-[18px_0_50px_rgba(0,0,0,0.24)] backdrop-blur-2xl transition-[transform,width] duration-200 md:relative md:z-0 md:translate-x-0 ${
          desktopCollapsed ? "md:w-[78px]" : "md:w-[19rem]"
        } ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className={`border-b border-white/8 ${desktopCollapsed ? "px-3 py-3" : "px-4 py-3.5"}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className={`flex items-center ${desktopCollapsed ? "justify-center" : "gap-2.5"}`}>
                <div className={`flex items-center justify-center border border-emerald-300/20 bg-emerald-300/10 text-emerald-100 ${desktopCollapsed ? "h-11 w-11 rounded-[1.1rem]" : "h-10 w-10 rounded-2xl"}`}>
                  <HeartHandshake className="h-4.5 w-4.5" />
                </div>
                {!desktopCollapsed && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Workspace
                    </p>
                    <h2 className="mt-1 text-lg font-semibold leading-none text-slate-50">
                      MindSupport AI
                    </h2>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={(event) => {
                event.stopPropagation();
                setDesktopCollapsed((current) => !current);
                setOpenMenuId(null);
                setProfileMenuOpen(false);
              }}
              className={`hidden text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100 md:inline-flex ${desktopCollapsed ? "rounded-[1rem] p-2.5" : "rounded-xl p-2"}`}
              aria-label={desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu className="h-5 w-5" />
            </button>

            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100 md:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className={`border-b border-white/8 ${desktopCollapsed ? "px-3 py-3.5" : "px-4 py-3"}`}>
          <button
            onClick={handleNewChat}
            className={`flex w-full items-center justify-center bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 text-sm font-semibold text-white shadow-lg shadow-emerald-950/30 transition-transform hover:scale-[1.01] ${
              desktopCollapsed
                ? "h-12 rounded-[1.2rem] px-0"
                : "gap-2 rounded-2xl px-4 py-2.5"
            }`}
            title="New Review Session"
          >
            <MessageSquarePlus className="h-4 w-4" />
            {!desktopCollapsed && "New Review Session"}
          </button>
        </div>

        <div className={`custom-scrollbar flex-1 overflow-y-auto ${desktopCollapsed ? "px-2 py-3" : "px-2.5 py-2.5"}`}>
          {!desktopCollapsed && (
            <div className="mb-2 flex items-center justify-between px-1.5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Recent Analysis Sessions
              </div>
              <div className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-0.5 text-[10px] text-slate-400">
                {sortedConversations.length}
              </div>
            </div>
          )}

          <div className={desktopCollapsed ? "space-y-2" : "space-y-1.5"}>
            {sortedConversations.length === 0 ? (
              desktopCollapsed ? null : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-5 text-center text-sm leading-6 text-slate-400">
                  Start a session to review, summarize, or inspect mental health dialogue samples.
                </div>
              )
            ) : (
              sortedConversations.map((conversation) => {
                const isActive = conversation.id === activeConversationId;

                return (
                  <div
                    key={conversation.id}
                    className={`group rounded-[1.05rem] border transition-colors ${
                      isActive
                        ? "border-emerald-300/20 bg-emerald-300/[0.06] shadow-[0_10px_26px_rgba(16,185,129,0.08)]"
                        : "border-white/6 bg-white/[0.025] hover:border-white/12 hover:bg-white/[0.04]"
                    } ${desktopCollapsed ? "overflow-hidden" : ""}`}
                    title={conversation.title || "New Review Session"}
                  >
                    <div className={`relative flex ${desktopCollapsed ? "items-center justify-center px-0 py-0" : "items-start gap-2 px-3 py-2"}`}>
                      <button
                        onClick={() => handleSelectConversation(conversation.id)}
                        className={`flex min-w-0 text-left ${desktopCollapsed ? "h-14 w-full items-center justify-center" : "flex-1 items-start gap-2"}`}
                      >
                        <div
                          className={`text-slate-300 ${desktopCollapsed
                            ? isActive
                              ? "rounded-2xl bg-emerald-300/12 p-3 text-emerald-100"
                              : "rounded-2xl bg-white/[0.04] p-3"
                            : "mt-0.5 rounded-xl bg-white/6 p-1.5"}`}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </div>

                        {!desktopCollapsed && (
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate text-[12.5px] font-medium text-slate-100">
                                {conversation.title || "New Review Session"}
                              </p>
                              {conversation.pinned && (
                                <Pin className="h-3 w-3 fill-current text-amber-400" />
                              )}
                            </div>
                            <p className="mt-0.5 text-[10.5px] text-slate-500">
                              {conversation.messages.length} turns | {formatDate(conversation.updatedAt)}
                            </p>
                          </div>
                        )}
                        {!desktopCollapsed && (
                          <ChevronRight className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-600 transition-colors group-hover:text-slate-400" />
                        )}
                      </button>

                      {!desktopCollapsed && (
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenMenuId((current) =>
                              current === conversation.id ? null : conversation.id
                            );
                          }}
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/6 hover:text-slate-200"
                          aria-label="Conversation actions"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {openMenuId === conversation.id && (
                        <div
                          onClick={(event) => event.stopPropagation()}
                          className="absolute right-2 top-10 z-20 min-w-32 rounded-xl border border-white/10 bg-[#0d1726]/95 p-1 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
                        >
                          <button
                            onClick={() => {
                              togglePin(conversation.id);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] text-slate-300 transition hover:bg-white/6 hover:text-amber-300"
                          >
                            <Pin className={`h-3.5 w-3.5 ${conversation.pinned ? "fill-current" : ""}`} />
                            {conversation.pinned ? "Unpin" : "Pin"}
                          </button>
                          <button
                            onClick={() => {
                              deleteConversation(conversation.id);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] text-slate-300 transition hover:bg-white/6 hover:text-rose-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className={`border-t border-white/8 ${desktopCollapsed ? "p-2.5" : "p-3"}`}>
          {currentUser ? (
            <div className="relative">
              <div className={`flex items-center rounded-2xl border border-white/8 bg-white/[0.03] ${desktopCollapsed ? "justify-center px-0 py-2.5" : "gap-2 px-2.5 py-2"}`}>
                <div className={`flex flex-shrink-0 items-center justify-center bg-gradient-to-br from-emerald-400/25 via-teal-400/15 to-sky-400/20 text-sm font-semibold text-emerald-100 ${desktopCollapsed ? "h-11 w-11 rounded-[1.1rem]" : "h-10 w-10 rounded-2xl"}`}>
                  {currentUser.full_name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join("") || "U"}
                </div>

                {!desktopCollapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-slate-100">
                      {currentUser.full_name}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">{currentUser.email}</p>
                  </div>
                )}

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setProfileMenuOpen((current) => !current);
                  }}
                  className={`text-slate-500 transition-colors hover:bg-white/6 hover:text-slate-200 ${desktopCollapsed ? "absolute -top-1 -right-1 rounded-full border border-white/8 bg-[#0d1726] p-1.5" : "rounded-xl p-2"}`}
                  aria-label="Profile actions"
                  title="Profile actions"
                >
                  <MoreHorizontal className={desktopCollapsed ? "h-3.5 w-3.5" : "h-4 w-4"} />
                </button>
              </div>

              {profileMenuOpen && (
                <div
                  onClick={(event) => event.stopPropagation()}
                  className="absolute bottom-14 right-0 z-20 min-w-40 rounded-xl border border-white/10 bg-[#0d1726]/95 p-1 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
                >
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setSidebarOpen(false);
                      router.push("/settings");
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] text-slate-300 transition hover:bg-white/6 hover:text-slate-100"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      signOut();
                      setSidebarOpen(false);
                      router.push("/sign-in");
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] text-slate-300 transition hover:bg-white/6 hover:text-rose-300"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                setSidebarOpen(false);
                router.push("/sign-in");
              }}
              className="flex w-full items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] px-3.5 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/6 hover:text-slate-100"
            >
              Sign In
            </button>
          )}
        </div>
      </motion.aside>
    </>
  );
}
