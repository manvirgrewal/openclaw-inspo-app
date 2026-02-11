"use client";

import { useState, useEffect, useCallback } from "react";
import type { ProfileUpdateInput } from "@/modules/users/users.types";

const PROFILE_KEY = "inspo-user-profile";

export interface LocalProfile extends ProfileUpdateInput {
  username?: string;
}

const DEFAULTS: LocalProfile = {
  display_name: "Demo User",
  username: "demo_user",
  bio: "",
  agent_platform: "",
  active_skills: [],
  setup_description: "",
  onboarding_role: "",
  interests: [],
};

function load(): LocalProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

function save(profile: LocalProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {}
}

export function useProfile() {
  const [profile, setProfile] = useState<LocalProfile>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProfile(load());
    setLoaded(true);
  }, []);

  const updateProfile = useCallback((patch: Partial<LocalProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      save(next);
      return next;
    });
  }, []);

  return { profile, updateProfile, loaded };
}
