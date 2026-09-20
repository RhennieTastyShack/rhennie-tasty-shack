"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [message, setMessage] = useState(
    "Verifying your account..."
  );

  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function handleCallback() {
      try {
        const code = searchParams.get("code");

        /* ===============================================
           PKCE / CODE CALLBACK
        =============================================== */

        if (code) {
          const {
            error: exchangeError,
          } =
            await supabase.auth.exchangeCodeForSession(
              code
            );

          if (exchangeError) {
            throw exchangeError;
          }
        }

        /* ===============================================
           CHECK SESSION
        =============================================== */

        const {
          data: sessionData,
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        /*
         * Some Supabase verification links may restore
         * the session from the URL/hash asynchronously.
         */
        if (!sessionData.session) {
          await new Promise((resolve) =>
            window.setTimeout(resolve, 800)
          );

          const {
            data: retryData,
            error: retryError,
          } = await supabase.auth.getSession();

          if (retryError) {
            throw retryError;
          }

          if (!retryData.session) {
            /*
             * Email verification may still have succeeded
             * even when no persistent browser session is
             * available. The customer can now sign in.
             */
            if (active) {
              setMessage(
                "Email verification complete. Redirecting you to sign in..."
              );
            }

            const next = searchParams.get("next");
            const loginPath = next
              ? `/login?next=${encodeURIComponent(next)}`
              : "/login";

            window.setTimeout(() => {
              router.replace(loginPath);
            }, 1500);

            return;
          }
        }

        if (!active) {
          return;
        }

        setMessage(
          "Your email has been verified successfully. Redirecting..."
        );

        const nextParam = searchParams.get("next");
        const destination =
          nextParam &&
          nextParam.startsWith("/") &&
          !nextParam.startsWith("//")
            ? nextParam
            : "/client-portal";

        window.setTimeout(() => {
          router.replace(destination);
        }, 1500);
      } catch (err) {
        console.error(
          "Auth callback error:",
          err
        );

        if (!active) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "We could not verify your account."
        );
      }
    }

    handleCallback();

    return () => {
      active = false;
    };
  }, [router, searchParams]);

  /* ===============================================
     ERROR SCREEN
  =============================================== */

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B] px-5 py-20">
        <div className="w-full max-w-md rounded-[32px] border border-red-500/20 bg-[#171717] p-6 text-center shadow-2xl sm:p-8 lg:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl">
            !
          </div>

          <h1 className="mt-6 text-2xl font-bold text-white">
            Verification Issue
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#B8B8B8]">
            {error}
          </p>

          <Link
            href="/login"
            className="mt-8 flex min-h-[48px] w-full items-center justify-center rounded-full bg-[#D4AF37] px-5 font-semibold text-black transition hover:opacity-90"
          >
            Go to Sign In
          </Link>
        </div>
      </main>
    );
  }

  /* ===============================================
     VERIFYING SCREEN
  =============================================== */

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B] px-5 py-20">
      <div className="w-full max-w-md rounded-[32px] border border-[#D4AF37]/20 bg-[#171717] p-6 text-center shadow-2xl sm:p-8 lg:p-10">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37]" />

        <p className="mt-6 text-lg font-semibold text-white">
          {message}
        </p>

        <p className="mt-2 text-sm text-[#B8B8B8]">
          Rhennie Tasty Shack Client Portal
        </p>
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B] text-white">
          <p>Verifying your account...</p>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}