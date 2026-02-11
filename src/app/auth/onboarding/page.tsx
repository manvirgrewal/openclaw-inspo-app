"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { CATEGORIES } from "@/config/categories";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

const ROLES = ["Developer", "Marketer", "Student", "Entrepreneur", "Creative", "Other"];
const PLATFORMS = ["OpenClaw", "Claude", "GPT", "Custom", "Just exploring"];

const STEPS = [
  { title: "Pick a username", required: true },
  { title: "What's your role?", required: false },
  { title: "What interests you?", required: false },
  { title: "What agent platform?", required: false },
];

export default function OnboardingPageWrapper() {
  return (
    <Suspense fallback={<div className="flex min-h-[80dvh] items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" /></div>}>
      <OnboardingPage />
    </Suspense>
  );
}

function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [role, setRole] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [platform, setPlatform] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const canProceed = step === 0 ? username.trim().length >= 3 : true;

  const handleNext = () => {
    if (step === 0 && username.trim().length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return;
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          onboarding_role: role || undefined,
          interests: interests.length > 0 ? interests : undefined,
          agent_platform: platform || undefined,
        }),
      });
    } catch {}
    router.push(next);
  };

  return (
    <div className="flex min-h-[80dvh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Progress */}
        <div className="mb-8 flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-zinc-100" : "bg-zinc-800"
              )}
            />
          ))}
        </div>

        {/* Step indicator */}
        <p className="mb-1 text-xs text-zinc-600">Step {step + 1} of {STEPS.length}</p>
        <h2 className="mb-6 text-xl font-bold">{STEPS[step].title}</h2>

        {/* Step 0: Username */}
        {step === 0 && (
          <div>
            <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900">
              <span className="pl-4 text-sm text-zinc-600">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
                  setUsernameError("");
                }}
                placeholder="username"
                autoFocus
                className="flex-1 bg-transparent px-1 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
              />
            </div>
            {usernameError && <p className="mt-1 text-xs text-red-400">{usernameError}</p>}
            <p className="mt-1 text-xs text-zinc-600">Letters, numbers, and underscores only</p>
          </div>
        )}

        {/* Step 1: Role */}
        {step === 1 && (
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => setRole(role === r ? "" : r)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-colors",
                  role === r
                    ? "border-zinc-400 bg-zinc-800 text-zinc-100"
                    : "border-zinc-800 text-zinc-500 hover:border-zinc-700"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleInterest(cat.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-colors",
                  interests.includes(cat.id)
                    ? cat.color
                    : "border-zinc-800 text-zinc-500 hover:border-zinc-700"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Platform */}
        {step === 3 && (
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(platform === p ? "" : p)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-colors",
                  platform === p
                    ? "border-zinc-400 bg-zinc-800 text-zinc-100"
                    : "border-zinc-800 text-zinc-500 hover:border-zinc-700"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300"
            >
              <ArrowLeft size={14} /> Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            {!STEPS[step].required && (
              <button
                onClick={handleSkip}
                className="text-sm text-zinc-600 hover:text-zinc-400"
              >
                Skip
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed || saving}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-white disabled:opacity-50"
            >
              {step === STEPS.length - 1 ? (
                <>{saving ? "Saving..." : "Finish"} <Check size={14} /></>
              ) : (
                <>Next <ArrowRight size={14} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
