"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

const OAUTH_PROVIDERS = [
  { id: "google", label: "Continue with Google", icon: "🔵", color: "bg-white text-stone-900 hover:bg-stone-200" },
  { id: "github", label: "Continue with GitHub", icon: "⚫", color: "bg-stone-800 text-stone-100 hover:bg-stone-700" },
  { id: "discord", label: "Continue with Discord", icon: "🟣", color: "bg-indigo-600 text-white hover:bg-indigo-500" },
];

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
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
      <Link href="/" className="mb-8 self-start text-stone-400 hover:text-stone-200">
        <ArrowLeft size={20} />
      </Link>

      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-2xl font-bold">Welcome to OpenClaw Inspo</h1>
        <p className="mb-8 text-center text-sm text-stone-500">
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
          <div className="h-px flex-1 bg-stone-800" />
          <span className="text-xs text-stone-600">or</span>
          <div className="h-px flex-1 bg-stone-800" />
        </div>

        {/* Magic link */}
        {magicLinkSent ? (
          <div className="rounded-xl bg-amber-500/10 p-4 text-center">
            <p className="text-sm font-medium text-amber-400">Check your email!</p>
            <p className="mt-1 text-xs text-stone-500">We sent a magic link to {email}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm text-stone-100 placeholder:text-stone-600 focus:border-stone-600 focus:outline-none"
            />
            <button
              onClick={handleMagicLink}
              disabled={loading || !email.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-800 py-3 text-sm font-medium text-stone-300 transition-colors hover:bg-stone-700 disabled:opacity-50"
            >
              <Mail size={16} />
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </div>
        )}

        {/* Demo mode */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-stone-800" />
          <span className="text-xs text-stone-600">demo</span>
          <div className="h-px flex-1 bg-stone-800" />
        </div>
        <button
          onClick={() => {
            signIn();
            router.push("/");
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-stone-700 py-3 text-sm font-medium text-stone-300 transition-colors hover:bg-stone-800"
        >
          <Zap size={16} />
          Try Demo Mode
        </button>
        <p className="mt-2 text-center text-xs text-stone-600">
          No account needed — explore all features instantly
        </p>
      </div>
    </div>
  );
}
