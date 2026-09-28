"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PasswordField from "@/app/components/PasswordField";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password") || "");
    setLoading(true);
    setError("");

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Password updated. You can sign in now.");
    setTimeout(() => router.push("/login"), 1200);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B] px-6 py-20">
      <div className="w-full max-w-md rounded-[32px] border border-[#D4AF37]/20 bg-[#171717] p-10 shadow-2xl">
        <h1 className="text-center text-3xl font-bold text-white">
          Choose a new password
        </h1>
        <p className="mt-3 text-center text-sm text-[#B8B8B8]">
          Open this page from the reset link in your email.
        </p>

        {!ready ? (
          <p className="mt-8 text-center text-sm text-white/50">
            Waiting for the reset link session...
          </p>
        ) : (
          <form onSubmit={handleSubmit} autoComplete="on" className="mt-8 space-y-5">
            <PasswordField
              id="password"
              name="password"
              minLength={6}
              required
              placeholder="New password"
              autoComplete="new-password"
              className="w-full rounded-xl border border-[#D4AF37]/20 bg-[#111111] px-4 py-4 text-white outline-none focus:border-[#D4AF37]"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            {message && <p className="text-sm text-green-400">{message}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#D4AF37] py-4 font-semibold text-black disabled:opacity-60"
            >
              {loading ? "Saving..." : "Update password"}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm">
          <Link href="/forgot-password" className="text-[#D4AF37]">
            Send a new link
          </Link>
        </p>
      </div>
    </main>
  );
}
