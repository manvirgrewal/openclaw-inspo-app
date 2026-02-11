"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { X, Camera, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { CATEGORIES } from "@/config/categories";
import type { LocalProfile } from "@/hooks/use-profile";

const PLATFORMS = ["OpenClaw", "Claude", "GPT", "Custom", "Other"];
const ROLES = ["Developer", "Marketer", "Student", "Entrepreneur", "Creative", "Other"];

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: LocalProfile;
  onSave: (patch: Partial<LocalProfile>) => void;
}

export function EditProfileModal({ open, onClose, profile, onSave }: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [agentPlatform, setAgentPlatform] = useState("");
  const [role, setRole] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [setupDescription, setSetupDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Sync form state when modal opens
  useEffect(() => {
    if (open) {
      setDisplayName(profile.display_name ?? "");
      setUsername(profile.username ?? "");
      setBio(profile.bio ?? "");
      setAgentPlatform(profile.agent_platform ?? "");
      setRole(profile.onboarding_role ?? "");
      setInterests(profile.interests ?? []);
      setSetupDescription(profile.setup_description ?? "");
    }
  }, [open, profile]);

  if (!open) return null;

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const patch: Partial<LocalProfile> = {
      display_name: displayName.trim() || undefined,
      username: username.trim() || undefined,
      bio: bio.trim() || undefined,
      agent_platform: agentPlatform || undefined,
      onboarding_role: role || undefined,
      interests: interests.length > 0 ? interests : [],
      setup_description: setupDescription.trim() || undefined,
    };

    // Also hit the API route (for future Supabase compat)
    try {
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    } catch {}

    onSave(patch);
    setSaving(false);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
    >
      <div className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-zinc-900 sm:rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/95 px-4 py-3 backdrop-blur-sm">
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
            <X size={20} />
          </button>
          <h2 className="text-sm font-semibold text-zinc-200">Edit Profile</h2>
          <button
            onClick={(e) => handleSubmit(e as unknown as FormEvent)}
            disabled={saving}
            className="flex items-center gap-1 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-900 transition-colors hover:bg-white disabled:opacity-50"
          >
            {saving ? (
              <div className="h-3 w-3 animate-spin rounded-full border border-zinc-600 border-t-zinc-900" />
            ) : (
              <Check size={14} />
            )}
            Save
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-4">
          {/* Avatar placeholder */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800 text-2xl font-bold text-zinc-400">
                {displayName?.[0]?.toUpperCase() ?? username?.[0]?.toUpperCase() ?? "?"}
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-700 text-zinc-300 shadow-lg hover:bg-zinc-600"
                title="Change avatar (coming soon)"
              >
                <Camera size={14} />
              </button>
            </div>
          </div>

          {/* Display name */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={40}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-500"
              placeholder="Your name"
            />
          </div>

          {/* Username */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Username</label>
            <div className="flex items-center rounded-lg border border-zinc-700 bg-zinc-800 transition-colors focus-within:border-zinc-500">
              <span className="pl-3 text-sm text-zinc-600">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                maxLength={24}
                className="w-full bg-transparent px-1 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                placeholder="username"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              rows={3}
              className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-500"
              placeholder="Tell people about yourself..."
            />
            <p className="mt-1 text-right text-xs text-zinc-600">{bio.length}/160</p>
          </div>

          {/* Role */}
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">Role</label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(role === r ? "" : r)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    role === r
                      ? "border-zinc-400 bg-zinc-700 text-zinc-100"
                      : "border-zinc-700 bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Agent Platform */}
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">Agent Platform</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAgentPlatform(agentPlatform === p ? "" : p)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    agentPlatform === p
                      ? "border-zinc-400 bg-zinc-700 text-zinc-100"
                      : "border-zinc-700 bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">Interests</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleInterest(cat.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    interests.includes(cat.id)
                      ? cat.color + " border-current"
                      : "border-zinc-700 bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Setup Description */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Agent Setup</label>
            <textarea
              value={setupDescription}
              onChange={(e) => setSetupDescription(e.target.value)}
              maxLength={280}
              rows={3}
              className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-500"
              placeholder="Describe your agent setup (tools, workflows, what you've built)..."
            />
            <p className="mt-1 text-right text-xs text-zinc-600">{setupDescription.length}/280</p>
          </div>

          {/* Bottom padding for mobile safe area */}
          <div className="h-4" />
        </form>
      </div>
    </div>
  );
}
