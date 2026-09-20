"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(nextPath);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B] px-6 py-20">
      <div className="w-full max-w-md rounded-[32px] border border-[#D4AF37]/20 bg-[#171717] p-10 shadow-2xl">
        <div className="text-center">
          <span className="inline-block rounded-full border border-[#D4AF37]/20 bg-[#1F1F1F] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
            Client Portal
          </span>

          <h1 className="mt-6 text-4xl font-bold text-white">
            Welcome Back
          </h1>

          <p className="mt-3 text-[#B8B8B8]">
            Sign in to manage your orders, quotations and meal plans.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="mt-10 space-y-6"
        >
          <div>
            <label className="mb-2 block text-sm text-[#D4AF37]">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border border-[#D4AF37]/20 bg-[#111111] px-4 py-4 text-white outline-none transition focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[#D4AF37]">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-[#D4AF37]/20 bg-[#111111] px-4 py-4 text-white outline-none transition focus:border-[#D4AF37]"
            />
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/forgot-password"
              className="text-sm text-[#D4AF37] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#D4AF37] py-4 text-lg font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center text-[#B8B8B8]">
          Don&apos;t have an account?{" "}
          <Link
            href={`/signup?next=${encodeURIComponent(nextPath)}`}
            className="font-semibold text-[#D4AF37] hover:underline"
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
