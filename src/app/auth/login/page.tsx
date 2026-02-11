"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

const OAUTH_PROVIDERS = [
  { id: "google", label: "Continue with Google", icon: "🔵", color: "bg-white text-zinc-900 hover:bg-zinc-200" },
  { id: "github", label: "Continue with GitHub", icon: "⚫", color: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700" },
  { id: "discord", label: "Continue with Discord", icon: "🟣", color: "bg-indigo-600 text-white hover:bg-indigo-500" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOAuth = (provider: string) => {
    // TODO: Integrate with Supabase Auth
    console.log("OAuth:", provider);
  };

  const handleMagicLink = async () => {
    if (!email.trim()) return;
    setLoading(true);
    // TODO: Supabase magic link
    setTimeout(() => {
      setMagicLinkSent(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-[80dvh] flex-col items-center justify-center px-4">
      <Link href="/" className="mb-8 self-start text-zinc-400 hover:text-zinc-200">
        <ArrowLeft size={20} />
      </Link>

      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-2xl font-bold">Welcome to OpenClaw Inspo</h1>
        <p className="mb-8 text-center text-sm text-zinc-500">
          Sign in to save ideas, submit your own, and join the community
        </p>

        {/* OAuth */}
        <div className="mb-6 space-y-3">
          {OAUTH_PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleOAuth(p.id)}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors ${p.color}`}
            >
              <span>{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-xs text-zinc-600">or</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        {/* Magic link */}
        {magicLinkSent ? (
          <div className="rounded-xl bg-emerald-500/10 p-4 text-center">
            <p className="text-sm font-medium text-emerald-400">Check your email!</p>
            <p className="mt-1 text-xs text-zinc-500">We sent a magic link to {email}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
            />
            <button
              onClick={handleMagicLink}
              disabled={loading || !email.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-800 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 disabled:opacity-50"
            >
              <Mail size={16} />
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
