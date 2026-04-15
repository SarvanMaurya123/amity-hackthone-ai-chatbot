"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Brain,
  Database,
  HeartHandshake,
  Lock,
  Menu,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Tags,
} from "lucide-react";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
};

const features = [
  {
    icon: HeartHandshake,
    title: "Empathy-first conversations",
    description:
      "A large-scale collection of support interactions designed around care, calm language, and emotional understanding.",
  },
  {
    icon: Tags,
    title: "Training-ready structure",
    description:
      "Turn dialogue into prompts, summaries, tags, and examples that are easier to use in LLM evaluation and fine-tuning flows.",
  },
  {
    icon: ShieldCheck,
    title: "Safer review workflow",
    description:
      "A cleaner workspace for inspecting sensitive mental health conversations without the noise of a generic chat product.",
  },
];

const stats = [
  { label: "Conversations", value: "510k+", icon: MessageSquareText },
  { label: "Domain", value: "Mental Health", icon: HeartHandshake },
  { label: "Use Case", value: "LLM Training", icon: Brain },
  { label: "Output", value: "Tags and Prompts", icon: Database },
];

const workflow = [
  {
    step: "01",
    title: "Create an account",
    description: "Sign up for a local workspace account and enter the review dashboard.",
  },
  {
    step: "02",
    title: "Open analysis sessions",
    description: "Explore conversation slices, prompts, and summaries in the main review flow.",
  },
  {
    step: "03",
    title: "Prepare LLM-ready outputs",
    description: "Organize empathy patterns, tags, and training examples for downstream model work.",
  },
];

const authCards = [
  {
    title: "Sign in",
    description: "Return to your saved review sessions and continue where you left off.",
    href: "/sign-in",
    action: "Open sign in",
    icon: Lock,
  },
  {
    title: "Create account",
    description: "Set up a workspace for reviewing mental health support conversations.",
    href: "/sign-up",
    action: "Open sign up",
    icon: Sparkles,
  },
];

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-8 text-slate-400">{description}</p>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(56,189,248,0.10),transparent_24%)]" />

      <header className="sticky top-0 z-30 border-b border-white/8 bg-[#08111c]/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                Dataset Workspace
              </p>
              <p className="text-lg font-semibold text-slate-50">MindSupport AI</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            <a href="#features" className="text-sm text-slate-400 transition hover:text-slate-100">
              Features
            </a>
            <a href="#workflow" className="text-sm text-slate-400 transition hover:text-slate-100">
              Workflow
            </a>
            <a href="#auth" className="text-sm text-slate-400 transition hover:text-slate-100">
              Auth
            </a>
            <a href="#footer" className="text-sm text-slate-400 transition hover:text-slate-100">
              Contact
            </a>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              onClick={() => router.push("/sign-in")}
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
            >
              Sign in
            </button>
            <button
              onClick={() => router.push("/sign-up")}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(16,185,129,0.24)] transition hover:scale-[1.01]"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-100 transition hover:bg-white/[0.08] lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/8 px-4 py-4 lg:hidden">
            <div className="flex flex-col gap-3">
              <a href="#features" className="text-sm text-slate-300" onClick={() => setMobileMenuOpen(false)}>
                Features
              </a>
              <a href="#workflow" className="text-sm text-slate-300" onClick={() => setMobileMenuOpen(false)}>
                Workflow
              </a>
              <a href="#auth" className="text-sm text-slate-300" onClick={() => setMobileMenuOpen(false)}>
                Auth
              </a>
              <div className="mt-2 flex gap-3">
                <button
                  onClick={() => router.push("/sign-in")}
                  className="flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-100"
                >
                  Sign in
                </button>
                <button
                  onClick={() => router.push("/sign-up")}
                  className="flex-1 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Sign up
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid min-h-[calc(100vh-84px)] w-full max-w-7xl items-center gap-10 px-4 pb-14 pt-8 sm:px-6 lg:grid-cols-[minmax(0,1.08fr)_460px] lg:px-8 lg:pb-20">
          <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-3xl">
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Mental Health Conversational AI Training Dataset
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-6 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-slate-50 sm:text-5xl lg:text-6xl"
            >
              Review mental health support conversations in a focused, calmer workspace
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-5 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg"
            >
              Explore 510k+ support dialogues, inspect empathy patterns, and prepare high-quality training data for LLM workflows with a landing page and dashboard that feel like the same product.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => router.push("/sign-up")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(16,185,129,0.24)] transition hover:scale-[1.01]"
              >
                Create account
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => router.push("/sign-in")}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]"
              >
                Sign in
              </button>
            </motion.div>

            <motion.div variants={stagger} className="mt-10 grid gap-3 sm:grid-cols-2">
              {[
                "Review empathy patterns across support dialogues",
                "Generate prompt-completion examples for model training",
                "Inspect tone, intent, and response quality in one workspace",
                "Organize sensitive conversations into research-friendly slices",
              ].map((item) => (
                <motion.div
                  key={item}
                  variants={fadeUp}
                  className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-slate-300"
                >
                  {item}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute -inset-6 rounded-[2.5rem] bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_45%)] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,15,28,0.96),rgba(9,17,29,0.84))] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.32)] sm:p-6">
              <div className="flex items-center justify-between border-b border-white/8 pb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Workspace Preview
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-50">MindSupport Review Console</p>
                </div>
                <div className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-medium text-emerald-100">
                  510k+ records
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-emerald-300/10 p-2.5 text-emerald-100">
                      <HeartHandshake className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-100">Review dialogue quality and empathy</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        Analyze support intent, tone consistency, and safety markers without extra UI clutter.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <div className="mb-3 inline-flex rounded-xl bg-white/[0.05] p-2 text-emerald-100">
                        <stat.icon className="h-4 w-4" />
                      </div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{stat.label}</p>
                      <p className="mt-2 text-lg font-semibold text-slate-50">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl border border-white/8 bg-slate-950/50 p-4">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-200" />
                    Example Prompt
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-7 text-slate-300">
                    Group these conversations by support intent and flag replies that feel less emotionally safe.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="features" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <SectionHeader
            eyebrow="Features"
            title="Built to match the dashboard, not fight it"
            description="The landing page now shares the same calmer tone, tighter spacing, and dataset-first language as the review workspace."
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-10 grid gap-4 md:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-5 shadow-[0_14px_40px_rgba(0,0,0,0.14)]"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-emerald-300/10 p-3 text-emerald-100">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold text-slate-50">{feature.title}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section id="workflow" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <SectionHeader
            eyebrow="Workflow"
            title="A proper scroll-based landing flow"
            description="Visitors can now move from overview to workflow to auth without abrupt jumps or generic marketing sections."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {workflow.map((item) => (
              <div
                key={item.step}
                className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-5"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-100">
                  {item.step}
                </p>
                <h3 className="mt-4 text-xl font-semibold text-slate-50">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="auth" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <SectionHeader
            eyebrow="Auth"
            title="Simple auth flow connected to the dashboard"
            description="This app now includes a lightweight local auth system so sign-in, sign-up, and dashboard access work together."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {authCards.map((card) => (
              <div
                key={card.title}
                className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(8,15,28,0.96),rgba(9,17,29,0.84))] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
              >
                <div className="inline-flex rounded-2xl bg-emerald-300/10 p-3 text-emerald-100">
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-slate-50">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{card.description}</p>
                <button
                  onClick={() => router.push(card.href)}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/[0.08]"
                >
                  {card.action}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer id="footer" className="relative z-10 border-t border-white/8 bg-[#07111d]/70">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.8fr_0.8fr] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-50">MindSupport AI</p>
                <p className="text-sm text-slate-500">Mental health dataset workspace</p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
              A calmer product surface for reviewing support conversations, organizing empathy patterns, and preparing LLM-ready training examples.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Navigation</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
              <a href="#features" className="transition hover:text-slate-100">Features</a>
              <a href="#workflow" className="transition hover:text-slate-100">Workflow</a>
              <a href="#auth" className="transition hover:text-slate-100">Auth</a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Access</p>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <Link href="/sign-in" className="text-slate-400 transition hover:text-slate-100">
                Sign in
              </Link>
              <Link href="/sign-up" className="text-slate-400 transition hover:text-slate-100">
                Create account
              </Link>
              <Link href="/chat" className="text-slate-400 transition hover:text-slate-100">
                Open workspace
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
