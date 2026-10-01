"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to send the reset email.");
      }

      setMessage(result.message);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send the reset email."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B] px-6 py-20">
      <div className="w-full max-w-md rounded-[32px] border border-[#F26A21]/20 bg-[#171717] p-10 shadow-2xl">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-[#F26A21]">
          Rhennie Tasty Shack
        </p>
        <h1 className="mt-4 text-center text-3xl font-bold text-white">
          Forgot password
        </h1>
        <p className="mt-3 text-center text-sm leading-6 text-[#B8B8B8]">
          Enter the email on your account. We will send a link to choose a new password.
        </p>

        <form onSubmit={handleReset} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm text-[#F26A21]">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[#F26A21]/20 bg-[#111111] px-4 py-4 text-white outline-none focus:border-[#F26A21]"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-green-400">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#F26A21] py-4 font-semibold text-black disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#B8B8B8]">
          <Link href="/login" className="text-[#F26A21]">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
