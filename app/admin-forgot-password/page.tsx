"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    const result = await response.json();

    setLoading(false);

    if (!response.ok || !result?.success) {
      setError(result?.message || "Unable to send the reset email.");
      return;
    }

    setMessage(result.message);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B] px-6">
      <div className="w-full max-w-md rounded-3xl border border-[#D4AF37]/20 bg-[#171717] p-8 shadow-2xl">

        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
            Rhennie Studio
          </p>

          <h1 className="mt-4 text-3xl font-bold text-white">
            Reset Password
          </h1>

          <p className="mt-2 text-sm text-white/50">
            Enter your admin email and we'll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-5">

          <div>
            <label className="mb-2 block text-sm text-[#D4AF37]">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-4 text-white outline-none focus:border-[#D4AF37]"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#D4AF37] py-4 font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

        </form>

        <div className="mt-6 text-center">
          <Link
            href="/admin-login"
            className="text-sm text-[#D4AF37] hover:underline"
          >
            ← Back to Admin Login
          </Link>
        </div>

      </div>
    </main>
  );
}