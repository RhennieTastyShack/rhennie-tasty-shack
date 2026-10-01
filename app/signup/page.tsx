"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PasswordField from "@/app/components/PasswordField";
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
    const form = new FormData(e.currentTarget);
    const normalizedEmail = String(form.get("email") || "")
      .trim()
      .toLowerCase();
    const normalizedName = String(form.get("fullName") || "").trim();
    const normalizedPhone = String(form.get("phone") || "").trim();
    const password = String(form.get("password") || "");

      if (!normalizedPhone || normalizedPhone.replace(/\D/g, "").length < 10) {
        setError("Please enter a valid Nigerian phone number.");
        return;
      }

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
            `${window.location.origin}/auth/callback?next=${encodeURIComponent("/verify-phone")}`,
          data: {
            full_name: normalizedName,
            phone: normalizedPhone,
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

      if (
        Array.isArray(user.identities) &&
        user.identities.length === 0
      ) {
        setError(
          "This email already has an account. Sign in instead."
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
            ...(data.session?.access_token
              ? { Authorization: `Bearer ${data.session.access_token}` }
              : {}),
          },
          body: JSON.stringify({
            auth_user_id: user.id,
            full_name: normalizedName,
            email: normalizedEmail,
            phone: normalizedPhone,
          }),
        }
      );

      const profileResult =
        await profileResponse.json().catch(() => ({}));

      if (
        !profileResponse.ok ||
        !profileResult?.success
      ) {
        setError(
          profileResult?.message ||
            "Your login was created, but the client profile could not be saved."
        );
        return;
      }

      const customerCode =
        profileResult?.profile?.customer_code;

      if (!data.session?.access_token) {
        setSuccess(
          customerCode
            ? `Account created. Your Client ID is ${customerCode}. We emailed your verification code.`
            : "Account created. We emailed your verification code."
        );

        setTimeout(() => {
          router.push(
            `/login?next=${encodeURIComponent("/verify-phone")}`
          );
        }, 2200);

        return;
      }

      /* ===============================================
         SEND PHONE OTP
      =============================================== */

      await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session.access_token}`,
        },
        body: JSON.stringify({
          phone: normalizedPhone,
          purpose: "SIGNUP",
        }),
      });

      setSuccess(
        customerCode
          ? `Account created! Your Client ID is ${customerCode}. Check your email, then enter the verification code.`
          : "Account created! Check your email for the confirmation link and your verification code."
      );

      setTimeout(() => {
        router.push(
          `/verify-phone?next=${encodeURIComponent(nextPath)}`
        );
      }, 1800);
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
      <div className="w-full max-w-md rounded-[32px] border border-[#F26A21]/20 bg-[#171717] p-6 shadow-2xl sm:p-8 lg:p-10">

        <div className="text-center">
          <span className="inline-block rounded-full border border-[#F26A21]/20 bg-[#1F1F1F] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#F26A21]">
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
          autoComplete="on"
          className="mt-10 space-y-6"
        >
          <div>
            <label className="mb-2 block text-sm text-[#F26A21]">
              Full Name
            </label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Your full name"
              autoComplete="name"
              required
              className="min-h-[50px] w-full rounded-xl border border-[#F26A21]/20 bg-[#111111] px-4 py-3 text-white outline-none transition focus:border-[#F26A21]"
            />
          </div>

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
              className="min-h-[50px] w-full rounded-xl border border-[#F26A21]/20 bg-[#111111] px-4 py-3 text-white outline-none transition focus:border-[#F26A21]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[#F26A21]">
              Phone Number
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="08012345678"
              autoComplete="tel"
              required
              className="min-h-[50px] w-full rounded-xl border border-[#F26A21]/20 bg-[#111111] px-4 py-3 text-white outline-none transition focus:border-[#F26A21]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[#F26A21]">
              Password
            </label>

            <PasswordField
              id="password"
              name="password"
              placeholder="Create a password"
              autoComplete="new-password"
              required
              minLength={6}
              className="min-h-[50px] w-full rounded-xl border border-[#F26A21]/20 bg-[#111111] px-4 py-3 text-white outline-none transition focus:border-[#F26A21]"
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
            className="flex min-h-[50px] w-full items-center justify-center rounded-full bg-[#F26A21] px-5 text-base font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
            className="font-semibold text-[#F26A21] hover:underline"
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
