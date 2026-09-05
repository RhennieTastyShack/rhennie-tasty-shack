"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Unable to sign in.");
      setLoading(false);
      return;
    }

    router.push("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B] px-6 py-20">
      <div className="w-full max-w-md rounded-[32px] border border-[#D4AF37]/20 bg-[#171717] p-8 shadow-2xl md:p-10">

        {/* Header */}
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full border border-[#D4AF37]/20 bg-[#1F1F1F] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
            Rhennie Studio
          </span>

          <h1 className="mt-6 text-4xl font-bold text-white">
            Admin Login
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#B8B8B8]">
            Sign in to manage Rhennie Tasty Shack.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#D4AF37]"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-4 text-white outline-none transition placeholder:text-white/20 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
            />
          </div>

          {/* Password */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#D4AF37]"
              >
                Password
              </label>

              <Link
                href="/admin-forgot-password"
                className="text-xs text-[#D4AF37] transition hover:text-white hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-4 text-white outline-none transition placeholder:text-white/20 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-6 text-red-400">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#D4AF37] py-4 text-lg font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 border-t border-white/5 pt-6 text-center">
          <Link
            href="/"
            className="text-sm text-[#B8B8B8] transition hover:text-[#D4AF37]"
          >
            ← Back to Rhennie Tasty Shack
          </Link>
        </div>

      </div>
    </main>
  );
}