"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type VerifyResponse = {
  success?: boolean;
  message?: string;

  subscription?: {
    id?: string;
    customer_code?: string | null;
    plan_name?: string;
    amount?: number | null;
    currency?: string | null;
    status?: string;
    payment_status?: string;
  };

  transaction?: {
    channel?: string;
    reference?: string;
  };
};

function formatMoney(
  amount?: number | null,
  currency?: string | null
) {
  if (amount === null || amount === undefined) {
    return "—";
  }

  const safeCurrency = currency || "NGN";

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: safeCurrency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${safeCurrency} ${amount.toLocaleString()}`;
  }
}

function CallbackContent() {
  const searchParams = useSearchParams();

  const reference =
    searchParams.get("reference") ||
    searchParams.get("trxref") ||
    "";

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [result, setResult] =
    useState<VerifyResponse | null>(null);

  useEffect(() => {
    let mounted = true;

    async function verifyPayment() {
      if (!reference) {
        setErrorMessage(
          "Payment reference is missing."
        );

        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/subscriptions/paystack/verify?reference=${encodeURIComponent(
            reference
          )}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as VerifyResponse;

        if (!mounted) {
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to verify payment."
          );
        }

        setResult(data);
      } catch (error) {
        if (!mounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to verify payment."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    verifyPayment();

    return () => {
      mounted = false;
    };
  }, [reference]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] px-5">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-black/10 border-t-[#F26A21]" />

          <h1 className="mt-6 font-serif text-2xl font-bold">
            Verifying Payment
          </h1>

          <p className="mt-2 text-sm text-black/50">
            Please wait while we confirm your
            subscription payment.
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] px-5 py-20">
        <div className="w-full max-w-xl rounded-[30px] border border-red-200 bg-white px-6 py-10 text-center shadow-sm sm:px-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl font-bold text-red-600">
            !
          </div>

          <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.3em] text-[#F26A21]">
            Rhennie Tasty Shack
          </p>

          <h1 className="mt-3 font-serif text-3xl font-bold">
            Payment Verification Failed
          </h1>

          <p className="mt-3 text-sm leading-6 text-black/55">
            {errorMessage}
          </p>

          {reference && (
            <div className="mt-5 rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-wide text-black/35">
                Payment Reference
              </p>

              <p className="mt-1 break-all font-mono text-xs text-black/55">
                {reference}
              </p>
            </div>
          )}

          <Link
            href="/client-portal/my-subscriptions"
            className="mt-7 inline-flex min-h-[48px] items-center justify-center rounded-full bg-black px-7 text-sm font-bold text-white"
          >
            Back To My Subscriptions
          </Link>
        </div>
      </main>
    );
  }

  const subscription =
    result?.subscription;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] px-5 py-20">
      <div className="w-full max-w-2xl overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.08)]">
        <div className="h-1.5 w-full bg-[#F26A21]" />

        <div className="px-6 py-10 text-center sm:px-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-700">
            ✓
          </div>

          <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.3em] text-[#F26A21]">
            Payment Confirmed
          </p>

          <h1 className="mt-3 font-serif text-4xl font-bold">
            Subscription Active
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-black/55">
            Your payment has been verified
            successfully and your meal subscription
            is now active.
          </p>

          <div className="mt-8 rounded-[22px] bg-[#F8F6F2] px-5 py-5 text-left">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wide text-black/35">
                  Customer ID
                </p>

                <p className="mt-1 font-bold text-[#F26A21]">
                  {subscription?.customer_code ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-wide text-black/35">
                  Plan
                </p>

                <p className="mt-1 font-bold">
                  {subscription?.plan_name ||
                    "Meal Subscription"}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-wide text-black/35">
                  Amount Paid
                </p>

                <p className="mt-1 font-bold">
                  {formatMoney(
                    subscription?.amount,
                    subscription?.currency
                  )}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-wide text-black/35">
                  Subscription Status
                </p>

                <p className="mt-1 font-bold text-green-700">
                  {subscription?.status ||
                    "ACTIVE"}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-wide text-black/35">
                  Payment Status
                </p>

                <p className="mt-1 font-bold text-green-700">
                  {subscription?.payment_status ||
                    "PAID"}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-wide text-black/35">
                  Payment Channel
                </p>

                <p className="mt-1 font-bold capitalize">
                  {result?.transaction?.channel ||
                    "Paystack"}
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-black/10 pt-4">
              <p className="text-[9px] font-bold uppercase tracking-wide text-black/35">
                Payment Reference
              </p>

              <p className="mt-1 break-all font-mono text-xs text-black/60">
                {reference}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/client-portal/my-subscriptions"
              className="flex min-h-[50px] flex-1 items-center justify-center rounded-full bg-[#F26A21] px-6 text-sm font-bold text-white"
            >
              View My Subscription
            </Link>

            <Link
              href="/client-portal"
              className="flex min-h-[50px] flex-1 items-center justify-center rounded-full border border-black/10 px-6 text-sm font-semibold"
            >
              Client Portal
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function CallbackLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] px-5">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-[#F26A21]" />

        <p className="mt-4 text-sm text-black/50">
          Loading payment...
        </p>
      </div>
    </main>
  );
}

export default function SubscriptionPayCallbackPage() {
  return (
    <Suspense fallback={<CallbackLoading />}>
      <CallbackContent />
    </Suspense>
  );
}