"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PasswordField from "@/app/components/PasswordField";
import { loginNote } from "@/lib/thank-you-notes";
import { supabase } from "@/lib/supabase";

function getSafeNextPath(next: string | null) {
  if (!next) {
    return "/client-portal";
  }

  if (!next.startsWith("/") || next.startsWith("//")) {
    return "/client-portal";
  }

  return next;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = getSafeNextPath(
    searchParams.get("next")
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setLoading(false);
      setError("Unable to start your session. Please try again.");
      return;
    }

    try {
      const response = await fetch("/api/auth/verification-status", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });
      const result = await response.json();

      setLoading(false);

      if (!result?.fully_verified) {
        router.push(
          `/verify-phone?next=${encodeURIComponent(nextPath)}`
        );
        return;
      }

      router.push(nextPath);
    } catch {
      setLoading(false);
      router.push(nextPath);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B] px-6 py-20">
      <div className="w-full max-w-md rounded-[32px] border border-[#F26A21]/20 bg-[#171717] p-10 shadow-2xl">
        <div className="text-center">
          <span className="inline-block rounded-full border border-[#F26A21]/20 bg-[#1F1F1F] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#F26A21]">
            Client Portal
          </span>

          <h1 className="mt-6 text-4xl font-bold text-white">
            Welcome Back
          </h1>

          <p className="mt-3 text-[#B8B8B8]">
            Sign in to manage your orders, quotations and meal plans.
          </p>

          <p className="mt-4 text-sm leading-6 text-[#F26A21]">
            {loginNote()}
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          autoComplete="on"
          className="mt-10 space-y-6"
        >
          <div>
            <label className="mb-2 block text-sm text-[#F26A21]">
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="username"
              required
              className="w-full rounded-xl border border-[#F26A21]/20 bg-[#111111] px-4 py-4 text-white outline-none transition focus:border-[#F26A21]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[#F26A21]">
              Password
            </label>

            <PasswordField
              id="password"
              name="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-[#F26A21]/20 bg-[#111111] px-4 py-4 text-white outline-none transition focus:border-[#F26A21]"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#F26A21] py-4 text-lg font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div className="text-center">
            <Link
              href={`/forgot-password?next=${encodeURIComponent(nextPath)}`}
              className="text-sm font-semibold text-[#F26A21] underline"
            >
              Forgot password?
            </Link>
          </div>
        </form>

        <div className="mt-8 text-center text-[#B8B8B8]">
          Don&apos;t have an account?{" "}
          <Link
            href={`/signup?next=${encodeURIComponent(nextPath)}`}
            className="font-semibold text-[#F26A21] hover:underline"
          >
            Create one
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B] text-white">
          <p>Loading sign in...</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
