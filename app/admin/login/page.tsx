"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PasswordField from "@/app/components/PasswordField";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    setLoading(true);
    setError("");

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      setLoading(false);
      setError(loginError.message);
      return;
    }

    if (!data.user) {
      setLoading(false);
      setError("Unable to verify your account.");
      return;
    }

    // Check whether this user is registered as an admin
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (adminError) {
      console.error("Admin verification error:", adminError);

      await supabase.auth.signOut();

      setLoading(false);
      setError("Unable to verify admin access. Please try again.");
      return;
    }

    if (!adminUser) {
      await supabase.auth.signOut();

      setLoading(false);
      setError(
        "Access denied. This account is not authorized to access Rhennie Studio."
      );

      return;
    }

    router.replace("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B] px-6 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
            Rhennie Studio
          </p>

          <h1 className="mt-3 text-4xl font-bold text-white">
            Admin Login
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/50">
            Sign in to manage Rhennie Tasty Shack.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-[28px] border border-[#D4AF37]/20 bg-[#171717] p-8 shadow-2xl">
          <form onSubmit={handleLogin} autoComplete="on" className="space-y-6">
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#D4AF37]">
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                autoComplete="username"
                required
                className="w-full rounded-xl border border-white/10 bg-[#0F0F0F] px-4 py-4 text-white outline-none transition placeholder:text-white/20 focus:border-[#D4AF37]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#D4AF37]">
                Password
              </label>

              <PasswordField
                id="password"
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-white/10 bg-[#0F0F0F] px-4 py-4 text-white outline-none transition placeholder:text-white/20 focus:border-[#D4AF37]"
              />
            </div>

            <div className="flex justify-end">
              <Link
                href="/admin-forgot-password"
                className="text-sm font-semibold text-[#D4AF37] underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#D4AF37] py-4 text-base font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Verifying Access..." : "Sign In to Rhennie Studio"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/30">
          Authorized staff access only.
        </p>
      </div>
    </main>
  );
}