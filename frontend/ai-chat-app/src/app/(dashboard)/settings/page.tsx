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
import { useChatStore } from "@/app/store/chatStore";
import { useLogout } from "@/hooks/use-auth";

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

export default function SettingsPage() {
  const router = useRouter();
  const { conversations, clearConversations } = useChatStore();
  const logout = useLogout();
  const totalMessages = conversations.reduce((acc, conv) => acc + conv.messages.length, 0);

  const settingsSections = [
    {
      title: "Account",
      icon: User,
      description: "Manage collaborators, access, and review ownership across dataset workflows.",
      settings: [
        {
          name: "Workspace Profile",
          description: "Update project identity and the team reviewing mental health support data.",
          icon: User,
          type: "link",
        },
        {
          name: "Primary Contact",
          description: "research-team@example.com",
          icon: Bell,
          type: "info",
          value: "Verified",
        },
        {
          name: "Authentication",
          description: "Strengthen access protection for sensitive training workflows.",
          icon: Lock,
          type: "link",
        },
      ],
    },
    {
      title: "Review Preferences",
      icon: Palette,
      description: "Tune the workspace for long review sessions and clearer dialogue inspection.",
      settings: [
        {
          name: "Calm Theme",
          description: "Use a low-noise interface optimized for long-form conversational review.",
          icon: Moon,
          type: "toggle",
          value: true,
        },
        {
          name: "Annotation Sounds",
          description: "Play subtle sounds for save, export, and review milestones.",
          icon: Volume2,
          type: "toggle",
          value: true,
        },
        {
          name: "Auto-save Review Sessions",
          description: "Keep recent summaries and analysis threads available on return.",
          icon: RotateCw,
          type: "toggle",
          value: true,
        },
      ],
    },
    {
      title: "Privacy & Safety",
      icon: Shield,
      description: "Controls for trusted handling of sensitive support conversations.",
      settings: [
        {
          name: "Protected Session",
          description: "Current review session is encrypted and protected.",
          icon: ShieldCheck,
          type: "info",
          value: "Active",
        },
        {
          name: "Notification Rules",
          description: "Choose which review alerts and safety reminders the team receives.",
          icon: Bell,
          type: "link",
        },
        {
          name: "Sensitive Data Controls",
          description: "Define how mental health conversations are stored, viewed, and exported.",
          icon: Eye,
          type: "link",
        },
      ],
    },
    {
      title: "Dataset Operations",
      icon: Database,
      description: "Monitor scale, exports, and workspace maintenance.",
      settings: [
        {
          name: "Storage Usage",
          description: "2.3 GB of 10 GB used",
          icon: Database,
          type: "info",
          value: "23%",
        },
        {
          name: "Export Review Data",
          description: "Download summaries, prompts, or selected dialogue slices for modeling work.",
          icon: Copy,
          type: "link",
        },
        {
          name: "Clear Local Cache",
          description: "Remove temporary files and refresh the analysis workspace.",
          icon: RotateCw,
          type: "link",
        },
      ],
    },
  ];

  const stats = [
    { label: "Conversations", value: "510k+", icon: HeartHandshake },
    { label: "Saved Sessions", value: conversations.length, icon: MessageSquare },
    { label: "Reviewed Messages", value: totalMessages, icon: Brain },
    { label: "Avg Reply", value: "2.3s", icon: Zap },
  ];

  const resources = [
    { icon: FileText, title: "Annotation Guide", desc: "Standards for labeling support interactions and tone." },
    { icon: HelpCircle, title: "Review FAQ", desc: "Common answers for dataset review and quality checks." },
    { icon: Shield, title: "Safety Policy", desc: "Best practices for sensitive mental health content." },
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
                Configure how your team reviews, protects, and transforms 510k+ support conversations into structured training signals for LLMs.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/8 bg-slate-950/35 p-4"
                  >
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
            {settingsSections.map((section) => {
              const Icon = section.icon;

              return (
                <motion.section
                  key={section.title}
                  variants={itemVariants}
                  className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.14)] sm:p-6"
                >
                  <div className="mb-5 flex items-start gap-3">
                    <div className="rounded-2xl bg-emerald-300/10 p-3 text-emerald-100">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-50">{section.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-400">{section.description}</p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {section.settings.map((setting) => {
                      const SettingIcon = setting.icon;

                      return (
                        <motion.div
                          key={setting.name}
                          whileHover={{ y: -2 }}
                          className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-slate-950/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-white/6 p-3 text-slate-200">
                              <SettingIcon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-50">{setting.name}</p>
                              <p className="mt-1 text-sm leading-6 text-slate-400">{setting.description}</p>
                            </div>
                          </div>

                          {setting.type === "toggle" && (
                            <button className="relative h-8 w-14 rounded-full bg-slate-800/90 shadow-inner shadow-black/20 transition-all">
                              <motion.div
                                initial={{ x: setting.value ? 24 : 4 }}
                                className="absolute left-1 top-1 h-6 w-6 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 shadow-lg"
                                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                              />
                            </button>
                          )}

                          {setting.type === "info" && (
                            <span className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-sm font-medium text-emerald-100">
                              {setting.value}
                            </span>
                          )}

                          {setting.type === "link" && (
                            <button className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-slate-50">
                              Open
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.section>
              );
            })}
          </div>

          <motion.aside variants={itemVariants} className="space-y-6">
            <section className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.14)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Review Resources
              </p>
              <div className="mt-4 space-y-3">
                {resources.map((item) => (
                  <button
                    key={item.title}
                    className="flex w-full items-start gap-3 rounded-2xl border border-white/8 bg-slate-950/30 p-4 text-left transition hover:bg-white/[0.05]"
                  >
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

            <section className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.14)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Dataset Principles
              </p>
              <div className="mt-4 space-y-3">
                {[
                  "Prioritize emotional safety and respectful language in every review flow.",
                  "Preserve context when summarizing support interactions for model training.",
                  "Use exports and sharing controls carefully with sensitive conversations.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/8 bg-slate-950/30 px-4 py-3 text-sm leading-6 text-slate-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-rose-400/15 bg-rose-500/[0.04] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.14)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-rose-300/80">
                Danger Zone
              </p>
              <div className="mt-4 space-y-3">
                <button
                  onClick={clearConversations}
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
              <p className="font-medium text-slate-100">MindSupport AI Dataset Workspace</p>
              <p className="mt-2">
                Built for reviewing and shaping large-scale mental health support conversations into reliable LLM training material.
              </p>
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
