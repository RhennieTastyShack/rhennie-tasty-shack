"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:3000/auth/callback",
        data: {
          full_name: fullName,
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(
      "Account created successfully! Please check your email to verify your account."
    );

    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-[#0B0B0B] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md rounded-[32px] border border-[#D4AF37]/20 bg-[#171717] p-10 shadow-2xl">

        {/* Heading */}
        <div className="text-center">

          <span className="inline-block rounded-full border border-[#D4AF37]/20 bg-[#1F1F1F] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
            Client Portal
          </span>

          <h1 className="mt-6 text-4xl font-bold text-white">
            Create Account
          </h1>

          <p className="mt-3 text-[#B8B8B8]">
            Join Rhennie Tasty Shack and manage your orders,
            quotations and celebrations in one place.
          </p>

        </div>

        <form
          onSubmit={handleSignup}
          className="mt-10 space-y-6"
        >

          <div>
            <label className="mb-2 block text-sm text-[#D4AF37]">
              Full Name
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              required
              className="w-full rounded-xl border border-[#D4AF37]/20 bg-[#111111] px-4 py-4 text-white outline-none transition focus:border-[#D4AF37]"
            />
          </div>

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
              placeholder="Create a password"
              required
              minLength={6}
              className="w-full rounded-xl border border-[#D4AF37]/20 bg-[#111111] px-4 py-4 text-white outline-none transition focus:border-[#D4AF37]"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#D4AF37] py-4 text-lg font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        <div className="mt-8 text-center text-[#B8B8B8]">

          Already have an account?{" "}

          <Link
            href="/login"
            className="font-semibold text-[#D4AF37] hover:underline"
          >
            Sign In
          </Link>

        </div>

      </div>
    </main>
  );
}