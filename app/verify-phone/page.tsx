"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { supabase } from "@/lib/supabase";

function getSafeNextPath(next: string | null) {
  if (!next) return "/client-portal";
  if (!next.startsWith("/") || next.startsWith("//")) {
    return "/client-portal";
  }
  return next;
}

function VerifyPhoneForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeNextPath(searchParams.get("next"));

  const [checking, setChecking] = useState(true);
  const [code, setCode] = useState("");
  const [emailHint, setEmailHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function getToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const token = await getToken();

      if (!token) {
        router.replace(
          `/login?next=${encodeURIComponent("/verify-phone")}`
        );
        return;
      }

      const response = await fetch("/api/auth/verification-status", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const result = await response.json();

      if (!active) return;

      if (result?.fully_verified) {
        router.replace(nextPath);
        return;
      }

      if (result?.phone_verified && !result?.email_confirmed) {
        setMessage(
          "Code accepted. Please confirm your email using the link we sent, then sign in again."
        );
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const accountEmail = (user?.email || result?.email || "").toLowerCase();
      if (accountEmail.includes("@")) {
        setEmailHint(accountEmail);
      }

      if (!result?.phone_verified) {
        const sendResponse = await fetch("/api/auth/otp/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ purpose: "SIGNUP" }),
        });
        const sendResult = await sendResponse.json().catch(() => ({}));

        if (!active) return;

        if (sendResult?.email) {
          setEmailHint(sendResult.email);
        } else if (sendResult?.email_hint) {
          setEmailHint(sendResult.email_hint);
        }

        if (sendResult?.retry_after_seconds) {
          setSecondsLeft(Number(sendResult.retry_after_seconds) || 60);
        }

        if (sendResponse.ok && sendResult?.success) {
          setMessage(
            sendResult.message ||
              "Verification code sent to your primary email."
          );
        } else if (sendResponse.status === 429) {
          setMessage(
            sendResult?.message ||
              "A code was already sent to your primary email."
          );
        } else if (sendResult?.message) {
          setError(sendResult.message);
        }
      }

      if (!active) return;
      setChecking(false);
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, [router, nextPath]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  async function handleVerify(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        router.replace("/login?next=/verify-phone");
        return;
      }

      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: code.trim(),
          purpose: "SIGNUP",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to verify code.");
      }

      if (result.fully_verified) {
        setMessage("You are fully verified. Redirecting...");
        router.push(nextPath);
        return;
      }

      setMessage(
        "Code accepted. Please confirm your email, then open the client portal."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError("");
    setMessage("");

    try {
      const token = await getToken();
      if (!token) {
        router.replace("/login?next=/verify-phone");
        return;
      }

      const response = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ purpose: "SIGNUP" }),
      });

      const result = await response.json();

      if (result?.email) {
        setEmailHint(result.email);
      } else if (result?.email_hint) {
        setEmailHint(result.email_hint);
      }

      if (result?.retry_after_seconds) {
        setSecondsLeft(Number(result.retry_after_seconds) || 60);
      }

      if (!response.ok || !result?.success) {
        if (response.status === 429) {
          setMessage(result?.message || "Please wait before requesting another code.");
          return;
        }
        throw new Error(result?.message || "Unable to resend code.");
      }

      setMessage(
        result?.message || "A new code was sent to your primary email."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resend code.");
    } finally {
      setResending(false);
    }
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B]">
        <Loader2 className="animate-spin text-[#D4AF37]" size={36} />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B] px-5 py-20">
      <div className="w-full max-w-md rounded-[32px] border border-[#D4AF37]/20 bg-[#171717] p-8 shadow-2xl">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
          Email verification
        </p>
        <h1 className="mt-4 text-center text-3xl font-bold text-white">
          Enter your code
        </h1>
        <p className="mt-3 text-center text-sm leading-6 text-[#B8B8B8]">
          We emailed a 6-digit code to your primary email
          {emailHint ? ` (${emailHint})` : ""}. It expires in 10 minutes.
        </p>

        <form onSubmit={handleVerify} className="mt-8 space-y-5">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            required
            className="w-full rounded-xl border border-[#D4AF37]/20 bg-[#111111] px-4 py-4 text-center text-2xl tracking-[0.4em] text-white outline-none focus:border-[#D4AF37]"
          />

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          {message && (
            <p className="text-sm text-green-400">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="flex min-h-[50px] w-full items-center justify-center rounded-full bg-[#D4AF37] text-base font-semibold text-black disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify email"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm leading-6 text-[#B8B8B8]">
          Didn&apos;t get the email in time?
        </p>
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || secondsLeft > 0}
          className="mt-3 flex min-h-[48px] w-full items-center justify-center rounded-full border border-[#D4AF37]/40 text-sm font-semibold text-[#D4AF37] disabled:opacity-60"
        >
          {resending
            ? "Sending..."
            : secondsLeft > 0
              ? `Resend code in ${secondsLeft}s`
              : "Resend code"}
        </button>

        <p className="mt-8 text-center text-sm text-[#B8B8B8]">
          <Link href="/login" className="text-[#D4AF37]">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function VerifyPhonePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B]">
          <Loader2 className="animate-spin text-[#D4AF37]" size={36} />
        </main>
      }
    >
      <VerifyPhoneForm />
    </Suspense>
  );
}
