"use client";

import React, { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RoleSelector } from "@/components/auth/RoleSelector";
import type { UserRole } from "@/types/auth";

export function LoginCard() {
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>("kitchen");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter both your username and password.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await login({
        username: username.trim(),
        password,
        role,
        rememberMe,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please verify your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] rounded-2xl bg-[#DDD2BC] px-6 py-8 sm:px-9 sm:py-10 shadow-2xl border border-[#C9B99A]/40">
      <div className="text-center">
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#18352B]">
          Welcome back
        </h1>
        <p className="mt-1.5 text-xs text-[#18352B]/70">
          Your workspace for exceptional hospitality.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <Input
          label="Username"
          surface="white"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />

        <Input
          label="Password"
          surface="white"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-[#18352B]/55 hover:text-[#18352B] cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>
          }
        />

        <div className="flex items-center justify-between text-xs pt-0.5">
          <label className="inline-flex items-center gap-2 text-[#18352B]/75 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-[#18352B]/30 accent-[#641E2A]"
            />
            Remember me
          </label>
          <button
            type="button"
            onClick={() =>
              setError("Contact your Layah Catering administrator to reset your password.")
            }
            className="font-medium text-[#641E2A] hover:underline cursor-pointer"
          >
            Forgot password?
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-[#F3E4E6] border border-[#641E2A]/30 px-3 py-2 text-xs text-[#641E2A]">
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="burgundy"
          size="lg"
          fullWidth
          disabled={isSubmitting}
          className="mt-2"
        >
          <ArrowRight className="h-4 w-4" />
          {isSubmitting ? "Signing in..." : "Login"}
        </Button>

        <div className="pt-3">
          <RoleSelector value={role} onChange={setRole} />
        </div>
      </form>

      <p className="mt-6 text-center text-[11px] text-[#18352B]/70">
        Need access?{" "}
        <a
          href="mailto:admin@layah.id"
          className="font-semibold text-[#641E2A] hover:underline"
        >
          Contact your administrator
        </a>
      </p>
    </div>
  );
}
