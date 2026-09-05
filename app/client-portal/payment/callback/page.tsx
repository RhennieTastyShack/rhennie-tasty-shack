"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

type VerifyResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  order_id?: string;
  reference?: string;
  channel?: string;
  paid_at?: string;
};

function PaymentCallbackContent() {
  const searchParams =
    useSearchParams();

  const reference =
    searchParams.get("reference") ||
    searchParams.get("trxref");

  const [loading, setLoading] =
    useState(true);

  const [success, setSuccess] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [orderId, setOrderId] =
    useState<string | null>(null);

  const [paymentReference, setPaymentReference] =
    useState<string | null>(reference);

  const [channel, setChannel] =
    useState<string | null>(null);

  useEffect(() => {
    async function verifyPayment() {
      if (!reference) {
        setSuccess(false);
        setMessage(
          "Payment reference was not found."
        );
        setLoading(false);
        return;
      }

      try {
        const response =
          await fetch(
            `/api/payments/paystack/verify?reference=${encodeURIComponent(
              reference
            )}`,
            {
              method: "GET",
              cache: "no-store",
            }
          );

        const data: VerifyResponse =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.error ||
              "Payment could not be verified."
          );
        }

        setSuccess(true);

        setMessage(
          data.message ||
            "Your payment has been securely verified and your order payment record has been updated successfully."
        );

        setOrderId(
          data.order_id || null
        );

        setPaymentReference(
          data.reference ||
            reference
        );

        setChannel(
          data.channel || null
        );
      } catch (error) {
        console.error(
          "Payment verification error:",
          error
        );

        setSuccess(false);

        setMessage(
          error instanceof Error
            ? error.message
            : "Payment could not be verified."
        );
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [reference]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[75vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-[32px] border border-white/10 bg-[#111111] px-6 py-14 text-center shadow-2xl sm:px-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F26A21]/10 text-[#F26A21]">
              <Loader2
                size={34}
                className="animate-spin"
              />
            </div>

            <p className="mt-7 text-[9px] font-bold uppercase tracking-[0.35em] text-[#F0C75E]">
              Rhennie Tasty Shack
            </p>

            <h1 className="mt-3 font-serif text-3xl font-bold">
              Verifying your payment
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/50">
              Please wait while we confirm
              your payment securely with
              Paystack.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[75vh] max-w-2xl items-center justify-center">
        <div
          className={`w-full overflow-hidden rounded-[32px] border bg-[#111111] shadow-2xl ${
            success
              ? "border-emerald-500/25"
              : "border-red-500/25"
          }`}
        >
          <div
            className={`h-2 w-full ${
              success
                ? "bg-emerald-500"
                : "bg-red-500"
            }`}
          />

          <div className="px-6 py-12 text-center sm:px-10 sm:py-16">
            <div
              className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${
                success
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {success ? (
                <CheckCircle2
                  size={52}
                  strokeWidth={1.8}
                />
              ) : (
                <XCircle
                  size={52}
                  strokeWidth={1.8}
                />
              )}
            </div>

            <p className="mt-8 text-[9px] font-bold uppercase tracking-[0.35em] text-[#F0C75E]">
              Rhennie Tasty Shack
            </p>

            <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
              {success
                ? "Payment successful"
                : "Payment not confirmed"}
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/55">
              {message}
            </p>

            {(paymentReference ||
              channel) && (
              <div className="mx-auto mt-8 max-w-md overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04]">
                {paymentReference && (
                  <div className="px-5 py-4">
                    <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-white/35">
                      Payment Reference
                    </p>

                    <p className="mt-1 break-all text-xs font-bold text-white/85">
                      {
                        paymentReference
                      }
                    </p>
                  </div>
                )}

                {channel && (
                  <div className="border-t border-white/10 px-5 py-4">
                    <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-white/35">
                      Payment Channel
                    </p>

                    <p className="mt-1 text-sm font-bold capitalize text-white/85">
                      {channel}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {success &&
                orderId && (
                  <Link
                    href={`/client-portal/payment/${orderId}`}
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#F0C75E] px-7 text-sm font-bold text-black transition-all hover:-translate-y-1"
                  >
                    View Payment
                  </Link>
                )}

              <Link
                href="/client-portal"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-7 text-sm font-bold text-white transition-all hover:border-[#F0C75E]/40 hover:text-[#F0C75E]"
              >
                Client Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function PaymentCallbackLoading() {
  return (
    <main className="min-h-screen bg-[#050505] px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[75vh] max-w-2xl items-center justify-center">
        <div className="w-full rounded-[32px] border border-white/10 bg-[#111111] px-6 py-14 text-center shadow-2xl sm:px-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F26A21]/10 text-[#F26A21]">
            <Loader2
              size={34}
              className="animate-spin"
            />
          </div>

          <p className="mt-7 text-[9px] font-bold uppercase tracking-[0.35em] text-[#F0C75E]">
            Rhennie Tasty Shack
          </p>

          <h1 className="mt-3 font-serif text-3xl font-bold">
            Loading payment
          </h1>
        </div>
      </div>
    </main>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <PaymentCallbackLoading />
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}