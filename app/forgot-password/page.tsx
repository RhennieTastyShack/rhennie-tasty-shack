"use client";

import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md rounded-[32px] border border-[#D4AF37]/20 bg-[#171717] p-10 shadow-2xl">

        <div className="text-center">

          <span className="inline-block rounded-full border border-[#D4AF37]/20 bg-[#1F1F1F] px-5 py-2 text-xs tracking-[0.3em] uppercase text-[#D4AF37]">
            Client Portal
          </span>

          <h1 className="mt-6 text-4xl font-bold text-white">
            Reset Password
          </h1>

          <p className="mt-3 text-[#B8B8B8]">
            Enter your email address and we'll send you a password reset link.
          </p>

        </div>

        <form className="mt-10 space-y-6">

          <div>
            <label className="mb-2 block text-sm text-[#D4AF37]">
              Email Address
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[#D4AF37]/20 bg-[#111111] px-4 py-4 text-white outline-none transition focus:border-[#D4AF37]"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-[#D4AF37] py-4 text-lg font-semibold text-black transition hover:opacity-90"
          >
            Send Reset Link
          </button>

        </form>

        <div className="mt-8 text-center">

          <Link
            href="/login"
            className="text-[#D4AF37] hover:underline"
          >
            ← Back to Sign In
          </Link>

        </div>

      </div>
    </main>
  );
}