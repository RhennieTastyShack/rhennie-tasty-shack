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

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = getSafeNextPath(
    searchParams.get("next")
  );

  const loginHref = `/login?next=${encodeURIComponent(nextPath)}`;

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

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedName = fullName.trim();

      /* ===============================================
         CREATE SUPABASE AUTH ACCOUNT
      =============================================== */

      const {
        data,
        error: signupError,
      } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo:
            `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
          data: {
            full_name: normalizedName,
          },
        },
      });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      const user = data.user;

      if (!user?.id) {
        setError(
          "Your account could not be created. Please try again."
        );
        return;
      }

      /* ===============================================
         CREATE / LINK CLIENT PROFILE
      =============================================== */

      const profileResponse = await fetch(
        "/api/client-profile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            auth_user_id: user.id,
            full_name: normalizedName,
            email: normalizedEmail,
          }),
        }
      );

      const profileResult =
        await profileResponse.json();

      if (
        !profileResponse.ok ||
        !profileResult?.success
      ) {
        console.error(
          "Client profile setup failed:",
          profileResult
        );

        /*
         * The Auth account already exists at this point.
         * Don't tell the customer signup completely failed.
         */
        setSuccess(
          "Your account was created. Please verify your email to continue."
        );

        setTimeout(() => {
          router.push(loginHref);
        }, 2500);

        return;
      }

      /* ===============================================
         SUCCESS
      =============================================== */

      const customerCode =
        profileResult?.profile?.customer_code;

      if (customerCode) {
        setSuccess(
          `Account created successfully! Your Client ID is ${customerCode}. Please check your email to verify your account.`
        );
      } else {
        setSuccess(
          "Account created successfully! Please check your email to verify your account."
        );
      }

      setTimeout(() => {
        router.push(loginHref);
      }, 3000);
    } catch (err) {
      console.error("Signup error:", err);

      setError(
        "Something went wrong while creating your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B] px-5 py-20 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-[32px] border border-[#D4AF37]/20 bg-[#171717] p-6 shadow-2xl sm:p-8 lg:p-10">

        <div className="text-center">
          <span className="inline-block rounded-full border border-[#D4AF37]/20 bg-[#1F1F1F] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
            Client Portal
          </span>

          <h1 className="mt-6 text-4xl font-bold text-white">
            Create Account
          </h1>

          <p className="mt-3 leading-6 text-[#B8B8B8]">
            Join Rhennie Tasty Shack and manage your
            orders, quotations, meal plans and celebrations
            in one place.
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
              onChange={(e) =>
                setFullName(e.target.value)
              }
              placeholder="Your full name"
              autoComplete="name"
              required
              className="min-h-[50px] w-full rounded-xl border border-[#D4AF37]/20 bg-[#111111] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[#D4AF37]">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="min-h-[50px] w-full rounded-xl border border-[#D4AF37]/20 bg-[#111111] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[#D4AF37]">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Create a password"
              autoComplete="new-password"
              required
              minLength={6}
              className="min-h-[50px] w-full rounded-xl border border-[#D4AF37]/20 bg-[#111111] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm leading-6 text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm leading-6 text-green-400">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex min-h-[50px] w-full items-center justify-center rounded-full bg-[#D4AF37] px-5 text-base font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center text-[#B8B8B8]">
          Already have an account?{" "}

          <Link
            href={loginHref}
            className="font-semibold text-[#D4AF37] hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B] text-white">
          <p>Loading sign up...</p>
        </main>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
