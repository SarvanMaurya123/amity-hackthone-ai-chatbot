"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, HeartHandshake, ShieldCheck } from "lucide-react";
import { useAuthUser, useLogin } from "@/hooks/use-auth";
import { validatePassword } from "@/lib/auth/password";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: currentUser } = useAuthUser();
  const loginMutation = useLogin();
  const initialEmail = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const registered = searchParams.get("registered") === "1";

  useEffect(() => {
    if (currentUser) {
      router.replace("/chat");
    }
  }, [currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setFormError(passwordError);
      return;
    }

    await loginMutation.mutateAsync({ email, password });
    router.push("/chat");
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_30%),radial-gradient(circle_at_80%_18%,rgba(56,189,248,0.10),transparent_24%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="hidden rounded-[2rem] border border-white/8 bg-white/[0.04] p-8 lg:block">
            <div className="inline-flex rounded-2xl bg-emerald-300/10 p-3 text-emerald-100">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              Sign In
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-50">
              Return to your dataset workspace
            </h1>
            <p className="mt-4 text-base leading-8 text-slate-400">
              Continue reviewing mental health conversations, empathy patterns, and LLM training examples from your dashboard.
            </p>
            <div className="mt-8 rounded-3xl border border-white/8 bg-slate-950/40 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-white/[0.05] p-3 text-emerald-100">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-50">JWT-backed auth flow</p>
                  <p className="mt-2 text-sm leading-7 text-slate-400">
                    Sign in through the Python JWT API and continue your review work with a persistent authenticated session.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(8,15,28,0.96),rgba(9,17,29,0.84))] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.32)] sm:p-8"
          >
            <div className="mb-8">
              <Link href="/" className="text-sm text-slate-400 transition hover:text-slate-200">
                Back to landing
              </Link>
              <h2 className="mt-4 text-3xl font-semibold text-slate-50">Sign in</h2>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                Access your review sessions and continue working in the dashboard.
              </p>
              {registered && (
                <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
                  Account created successfully. Please sign in to continue.
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="research@example.com"
                  className="w-full rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-300/30"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-300/30"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(16,185,129,0.24)] transition hover:scale-[1.01]"
              >
                {loginMutation.isPending ? "Signing In..." : "Sign In"}
                <ArrowRight className="h-4 w-4" />
              </button>

              {loginMutation.error && (
                <p className="text-sm text-rose-300">{loginMutation.error.message}</p>
              )}

              {formError && (
                <p className="text-sm text-rose-300">{formError}</p>
              )}
            </form>

            <p className="mt-6 text-sm text-slate-400">
              No account yet?{" "}
              <Link href="/sign-up" className="font-medium text-emerald-100 hover:text-emerald-200">
                Create one
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
