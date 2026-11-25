"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMeApi, loginApi, logoutApi } from "@/lib/api/auth";
import { ROLE_HOME_ROUTES } from "@/lib/constants/navigation";
import type { LoginPayload, User } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const USER_STORAGE_KEY = "layah_user_session";

function setCookie(name: string, value: string, days = 7) {
  const maxAge = days * 24 * 60 * 60;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

function hasCookie(name: string): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((row) => row.startsWith(`${name}=`));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const hydrate = async () => {
      if (!hasCookie("layah_token")) {
        localStorage.removeItem(USER_STORAGE_KEY);
        if (active) setIsLoading(false);
        return;
      }

      try {
        const cached = localStorage.getItem(USER_STORAGE_KEY);
        if (cached && active) {
          setUser(JSON.parse(cached) as User);
        }
        const liveUser = await getMeApi();
        if (active) {
          setUser(liveUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(liveUser));
        }
      } catch {
        clearCookie("layah_token");
        clearCookie("layah_role");
        localStorage.removeItem(USER_STORAGE_KEY);
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    hydrate();
    return () => {
      active = false;
    };
  }, []);

  const login = async (payload: LoginPayload) => {
    const res = await loginApi(payload);
    const cookieDays = payload.rememberMe ? 30 : 1;
    setCookie("layah_token", res.token, cookieDays);
    setCookie("layah_role", res.user.role, cookieDays);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
    setUser(res.user);
    router.push(ROLE_HOME_ROUTES[res.user.role]);
    router.refresh();
  };

  const logout = async () => {
    await logoutApi();
    clearCookie("layah_token");
    clearCookie("layah_role");
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
