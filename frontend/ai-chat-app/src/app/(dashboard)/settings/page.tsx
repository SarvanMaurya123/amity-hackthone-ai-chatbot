"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  Brain,
  ChevronRight,
  Copy,
  Database,
  Eye,
  FileText,
  HeartHandshake,
  HelpCircle,
  Lock,
  LogOut,
  MessageSquare,
  Moon,
  Palette,
  RotateCw,
  Shield,
  ShieldCheck,
  User,
  Volume2,
  Zap,
} from "lucide-react";
import { useClearConversations } from "@/hooks/use-conversations";
import { useLogout } from "@/hooks/use-auth";
import { useUpdateWorkspacePreferences, useUpdateWorkspaceProfile, useWorkspace } from "@/hooks/use-workspace";
import { useChatStore } from "@/app/store/chatStore";
import type { WorkspaceInfoItem } from "@/types/workspace";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

function InfoRow({ item, icon: Icon }: { item: WorkspaceInfoItem; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-slate-950/30 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-white/6 p-3 text-slate-200">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-slate-50">{item.label}</p>
          <p className="mt-1 text-sm leading-6 text-slate-400">{item.description}</p>
        </div>
      </div>
      <span className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-sm font-medium text-emerald-100">
        {item.value}
      </span>
    </motion.div>
  );
}

function ToggleRow({
  name,
  description,
  icon: Icon,
  enabled,
  onClick,
}: {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-slate-950/30 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-white/6 p-3 text-slate-200">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-slate-50">{name}</p>
          <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
        </div>
      </div>

      <button
        onClick={onClick}
        className={`relative h-8 w-14 rounded-full shadow-inner shadow-black/20 transition-all ${
          enabled ? "bg-emerald-500/30" : "bg-slate-800/90"
        }`}
      >
        <motion.div
          animate={{ x: enabled ? 24 : 4 }}
          className="absolute left-1 top-1 h-6 w-6 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 shadow-lg"
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
        />
      </button>
    </motion.div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const logout = useLogout();
  const clearConversations = useClearConversations();
  const clearActiveConversation = useChatStore((state) => state.clearActiveConversation);
  const updatePreferences = useUpdateWorkspacePreferences();
  const updateProfile = useUpdateWorkspaceProfile();
  const { data: workspace, isLoading } = useWorkspace(true);

  if (isLoading || !workspace) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        Loading workspace settings...
      </div>
    );
  }

  const stats = [
    { label: "Conversations", value: "510k+", icon: HeartHandshake },
    { label: "Saved Sessions", value: workspace.stats.saved_sessions, icon: MessageSquare },
    { label: "Reviewed Messages", value: workspace.stats.reviewed_messages, icon: Brain },
    { label: "Pinned Sessions", value: workspace.stats.pinned_sessions, icon: Zap },
  ];

  const resources = [
    { icon: FileText, title: workspace.resources[0]?.title ?? "Annotation Guide", desc: workspace.resources[0]?.description ?? "Standards for labeling support interactions and tone." },
    { icon: HelpCircle, title: workspace.resources[1]?.title ?? "Review FAQ", desc: workspace.resources[1]?.description ?? "Common answers for dataset review and quality checks." },
    { icon: Shield, title: workspace.resources[2]?.title ?? "Safety Policy", desc: workspace.resources[2]?.description ?? "Best practices for sensitive mental health content." },
  ];

  return (
    <div className="custom-scrollbar h-full overflow-y-auto">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-3 pb-8 pt-16 sm:px-6 sm:pb-10 sm:pt-8 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(135deg,rgba(16,185,129,0.14),rgba(56,189,248,0.08),rgba(15,23,42,0.2))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.18)] sm:rounded-[2rem] sm:p-7"
        >
          <div className="flex flex-col gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-2xl bg-emerald-300/10 p-3 text-emerald-100">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                Mental Health Conversational AI Training Dataset
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
                Settings for a safer, clearer mental health data workspace
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Configure how your team reviews, protects, and transforms saved sessions into structured training signals for LLMs.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-2xl border border-white/8 bg-slate-950/35 p-4">
                    <div className="mb-3 inline-flex rounded-xl bg-white/6 p-2 text-emerald-100">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-50">{stat.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
        >
          <div className="space-y-6">
            <motion.section variants={itemVariants} className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.14)] sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-300/10 p-3 text-emerald-100">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-50">Account</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">Manage collaborators, access, and review ownership across dataset workflows.</p>
                </div>
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const formData = new FormData(event.currentTarget);
                  updateProfile.mutate({
                    full_name: String(formData.get("full_name") ?? workspace.profile.full_name),
                    organization: String(formData.get("organization") ?? workspace.profile.organization ?? "") || null,
                  });
                }}
                key={`${workspace.profile.full_name}-${workspace.profile.organization ?? ""}`}
                className="mb-4 grid gap-3 sm:grid-cols-2"
              >
                <input
                  name="full_name"
                  defaultValue={workspace.profile.full_name}
                  className="rounded-2xl border border-white/8 bg-slate-950/30 px-4 py-3 text-slate-100 outline-none"
                  placeholder="Full name"
                />
                <input
                  name="organization"
                  defaultValue={workspace.profile.organization ?? ""}
                  className="rounded-2xl border border-white/8 bg-slate-950/30 px-4 py-3 text-slate-100 outline-none"
                  placeholder="Organization"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 px-4 py-3 text-sm font-semibold text-white sm:col-span-2"
                >
                  Save profile
                </button>
              </form>
              <div className="grid gap-3">
                <InfoRow item={workspace.account_items[0]} icon={User} />
                <InfoRow item={workspace.account_items[1]} icon={Bell} />
                <InfoRow item={workspace.account_items[2]} icon={Lock} />
              </div>
            </motion.section>

            <motion.section variants={itemVariants} className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.14)] sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-300/10 p-3 text-emerald-100">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-50">Review Preferences</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">Tune the workspace for long review sessions and clearer dialogue inspection.</p>
                </div>
              </div>
              <div className="grid gap-3">
                <ToggleRow
                  name="Calm Theme"
                  description="Use a low-noise interface optimized for long-form conversational review."
                  icon={Moon}
                  enabled={workspace.preferences.calm_theme}
                  onClick={() => updatePreferences.mutate({ calm_theme: !workspace.preferences.calm_theme })}
                />
                <ToggleRow
                  name="Annotation Sounds"
                  description="Play subtle sounds for save, export, and review milestones."
                  icon={Volume2}
                  enabled={workspace.preferences.annotation_sounds}
                  onClick={() => updatePreferences.mutate({ annotation_sounds: !workspace.preferences.annotation_sounds })}
                />
                <ToggleRow
                  name="Auto-save Review Sessions"
                  description="Keep recent summaries and analysis threads available on return."
                  icon={RotateCw}
                  enabled={workspace.preferences.auto_save_review_sessions}
                  onClick={() =>
                    updatePreferences.mutate({
                      auto_save_review_sessions: !workspace.preferences.auto_save_review_sessions,
                    })
                  }
                />
              </div>
            </motion.section>

            <motion.section variants={itemVariants} className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.14)] sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-300/10 p-3 text-emerald-100">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-50">Privacy & Safety</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">Controls for trusted handling of sensitive support conversations.</p>
                </div>
              </div>
              <div className="grid gap-3">
                <InfoRow item={workspace.privacy_items[0]} icon={ShieldCheck} />
                <InfoRow item={workspace.privacy_items[1]} icon={Bell} />
                <InfoRow item={workspace.privacy_items[2]} icon={Eye} />
              </div>
            </motion.section>

            <motion.section variants={itemVariants} className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.14)] sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-300/10 p-3 text-emerald-100">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-50">Dataset Operations</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">Monitor scale, exports, and workspace maintenance.</p>
                </div>
              </div>
              <div className="grid gap-3">
                <InfoRow item={workspace.dataset_items[0]} icon={Database} />
                <InfoRow item={workspace.dataset_items[1]} icon={Copy} />
                <InfoRow item={workspace.dataset_items[2]} icon={RotateCw} />
              </div>
            </motion.section>
          </div>

          <motion.aside variants={itemVariants} className="space-y-6">
            <section className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.14)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Review Resources</p>
              <div className="mt-4 space-y-3">
                {resources.map((item) => (
                  <button key={item.title} className="flex w-full items-start gap-3 rounded-2xl border border-white/8 bg-slate-950/30 p-4 text-left transition hover:bg-white/[0.05]">
                    <div className="rounded-xl bg-emerald-300/10 p-3 text-emerald-100">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-50">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">{item.desc}</p>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-slate-500" />
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-rose-400/15 bg-rose-500/[0.04] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.14)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-rose-300/80">Danger Zone</p>
              <div className="mt-4 space-y-3">
                <button
                  onClick={() => {
                    clearActiveConversation();
                    clearConversations.mutate();
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-rose-400/15 bg-slate-950/30 px-4 py-4 text-left transition hover:bg-rose-500/[0.08]"
                >
                  <div className="flex items-center gap-3">
                    <Copy className="h-5 w-5 text-rose-300" />
                    <span className="font-medium text-rose-200">Clear all review sessions</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-rose-300" />
                </button>
                <button
                  onClick={() => {
                    logout();
                    router.push("/sign-in");
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-rose-400/15 bg-slate-950/30 px-4 py-4 text-left transition hover:bg-rose-500/[0.08]"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="h-5 w-5 text-rose-300" />
                    <span className="font-medium text-rose-200">Logout</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-rose-300" />
                </button>
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-5 text-sm leading-7 text-slate-400 shadow-[0_16px_40px_rgba(0,0,0,0.14)]">
              <p className="font-medium text-slate-100">{workspace.profile.full_name}</p>
              <p className="mt-2">{workspace.profile.email}</p>
              <p className="mt-1">{workspace.profile.organization || "Independent workspace"}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-emerald-100">
                <Link href="#">Contact Support</Link>
                <Link href="#">Privacy Policy</Link>
                <Link href="#">Terms of Use</Link>
              </div>
            </section>
          </motion.aside>
        </motion.div>
      </div>
    </div>
  );
}
