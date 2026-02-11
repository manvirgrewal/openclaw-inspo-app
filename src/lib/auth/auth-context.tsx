"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: () => void;
  signOut: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: () => {},
  signOut: () => {},
  refreshUser: () => {},
});

const DEMO_USER: User = {
  id: "demo-user-1",
  username: "demo_user",
  display_name: "Demo User",
  avatar_url: null,
};

const AUTH_KEY = "inspo-demo-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem(AUTH_KEY) === "true") {
        // Merge profile data (avatar, display name) if available
        const profile = JSON.parse(localStorage.getItem("inspo-user-profile") || "{}");
        setUser({
          ...DEMO_USER,
          display_name: profile.display_name || DEMO_USER.display_name,
          avatar_url: profile.avatar_url || DEMO_USER.avatar_url,
        });
      }
    } catch {}
    setIsLoading(false);
  }, []);

  const signIn = useCallback(() => {
    setUser(DEMO_USER);
    try { localStorage.setItem(AUTH_KEY, "true"); } catch {}
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    try { localStorage.removeItem(AUTH_KEY); } catch {}
  }, []);

  const refreshUser = useCallback(() => {
    try {
      const profile = JSON.parse(localStorage.getItem("inspo-user-profile") || "{}");
      setUser((prev) => prev ? {
        ...prev,
        display_name: profile.display_name || DEMO_USER.display_name,
        avatar_url: profile.avatar_url || DEMO_USER.avatar_url,
      } : prev);
    } catch {}
  }, []);

  // Auto-refresh when profile is updated anywhere
  useEffect(() => {
    const handler = () => refreshUser();
    window.addEventListener("inspo-profile-updated", handler);
    return () => window.removeEventListener("inspo-profile-updated", handler);
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
