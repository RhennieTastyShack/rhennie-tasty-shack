"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  ShoppingBag,
  XCircle,
} from "lucide-react";

import { useCart } from "@/app/context/CartContext";
import { thankYouNote } from "@/lib/thank-you-notes";

type VerifyState =
  | "loading"
  | "success"
  | "failed"
  | "missing";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const orderId = searchParams.get("order");
  const reference = searchParams.get("reference");
  const trackingToken = searchParams.get("tracking");
  const deliveryCode = searchParams.get("code");

  const canShowOrder = Boolean(orderId || trackingToken);

  const [status, setStatus] = useState<VerifyState>(
    canShowOrder ? "success" : reference ? "loading" : "missing"
  );

  const [message, setMessage] = useState("");
  const [verifyNote, setVerifyNote] = useState("");
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [siteOrigin, setSiteOrigin] = useState("");
  const [trackingFromPayment, setTrackingFromPayment] = useState("");
  const clearCartRef = useRef(clearCart);
  clearCartRef.current = clearCart;

  useEffect(() => {
    setSiteOrigin(window.location.origin);
  }, []);

  const resolvedTracking =
    trackingToken || trackingFromPayment;

  const trackingPath = resolvedTracking
    ? `/track/${encodeURIComponent(resolvedTracking)}`
    : null;

  const trackingUrl =
    trackingPath && siteOrigin
      ? `${siteOrigin}${trackingPath}`
      : trackingPath;

  useEffect(() => {
    let cancelled = false;

    async function verifyPayment() {
      if (!reference) {
        if (orderId) {
          clearCartRef.current();
          setStatus("success");
        } else {
          setStatus("missing");
        }
        return;
      }

      try {
        const response = await fetch(
          `/api/payments/paystack/verify?reference=${encodeURIComponent(
            reference
          )}`,
          {
            cache: "no-store",
            signal: AbortSignal.timeout(12000),
          }
        );

        const result = await response.json();

        if (cancelled) {
          return;
        }

        if (!response.ok || !result?.success) {
          if (orderId || trackingToken) {
            setVerifyNote(
              "Paystack is still confirming this payment. Your order and tracking link are ready."
            );
            clearCartRef.current();
            setStatus("success");
            return;
          }

          setStatus("failed");
          setMessage(
            result?.error ||
              result?.message ||
              "We could not confirm this payment yet."
          );
          return;
        }

        if (result.tracking_token) {
          setTrackingFromPayment(String(result.tracking_token));
        }

        clearCartRef.current();
        setStatus("success");
        setMessage(
          result.message ||
            "Payment verified successfully."
        );
      } catch (error) {
        console.error(
          "Checkout verify error:",
          error
        );

        if (!cancelled) {
          if (orderId || trackingToken) {
            setVerifyNote(
              "Paystack is still confirming this payment. Your order and tracking link are ready."
            );
            clearCartRef.current();
            setStatus("success");
            return;
          }

          setStatus("failed");
          setMessage(
            "Something went wrong while verifying your payment."
          );
        }
      }
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [reference, orderId]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] px-4">
        <div className="w-full max-w-md rounded-[32px] border border-black/[0.08] bg-white px-8 py-14 text-center shadow-sm">
          <Loader2
            className="mx-auto animate-spin text-[#F26A21]"
            size={36}
          />
          <p className="mt-6 text-sm font-semibold text-[#171717]">
            Confirming your payment...
          </p>
          <p className="mt-2 text-sm text-black/45">
            Please wait while we verify your Paystack payment.
          </p>
        </div>
      </main>
    );
  }

  if (status === "missing" || status === "failed") {
    return (
      <main className="min-h-screen bg-[#F8F6F2] px-4 py-12 text-[#171717] sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[75vh] max-w-2xl items-center justify-center">
          <div className="w-full overflow-hidden rounded-[32px] border border-black/[0.08] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.08)]">
            <div className="h-2 w-full bg-red-500" />

            <div className="px-6 py-12 text-center sm:px-10 sm:py-16">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-red-500">
                <XCircle size={52} strokeWidth={1.8} />
              </div>

              <p className="mt-8 text-[9px] font-bold uppercase tracking-[0.35em] text-[#F26A21]">
                Rhennie Tasty Shack
              </p>

              <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                Payment Not Confirmed
              </h1>

              <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-black/50">
                {message ||
                  "We could not confirm your payment. If money left your account, contact us with your payment reference."}
              </p>

              {(orderId || reference) && (
                <div className="mx-auto mt-8 max-w-md rounded-[22px] border border-black/[0.07] bg-[#FAF9F7] p-5 text-left">
                  {orderId && (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-black/40">
                        Order ID
                      </span>
                      <span className="max-w-[65%] truncate text-xs font-bold text-black/70">
                        {orderId}
                      </span>
                    </div>
                  )}

                  {reference && (
                    <div className={`flex items-center justify-between gap-4 ${orderId ? "mt-4 border-t border-black/[0.06] pt-4" : ""}`}>
                      <span className="text-xs text-black/40">
                        Payment Reference
                      </span>
                      <span className="max-w-[65%] truncate text-xs font-bold text-black/70">
                        {reference}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/checkout"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#F26A21] px-7 text-sm font-bold text-white transition-all hover:-translate-y-1 hover:bg-[#D95512]"
                >
                  Try Checkout Again
                </Link>

                <a
                  href="https://wa.me/2348121577759?text=Hello%20Rhennie%20Tasty%20Shack,%20I%20need%20help%20with%20a%20payment."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-black/10 bg-white px-7 text-sm font-bold text-black/60 transition-all hover:border-[#F26A21]/40 hover:text-[#F26A21]"
                >
                  Chat With Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F6F2] px-4 py-12 text-[#171717] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[75vh] max-w-2xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-[32px] border border-black/[0.08] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.08)]">
          <div className="h-2 w-full bg-[#F26A21]" />

          <div className="px-6 py-12 text-center sm:px-10 sm:py-16">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-50 text-green-600">
              <CheckCircle2 size={52} strokeWidth={1.8} />
            </div>

            <p className="mt-8 text-[9px] font-bold uppercase tracking-[0.35em] text-[#F26A21]">
              Rhennie Tasty Shack
            </p>

            <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl">
              Order Confirmed!
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-black/50">
              {thankYouNote()} Your payment was received and your order is now being processed.
            </p>

            <div className="mx-auto mt-8 max-w-md rounded-[22px] border border-black/[0.07] bg-[#FAF9F7] p-5 text-left">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-black/40">
                  Order ID
                </span>
                <span className="max-w-[65%] truncate text-xs font-bold text-black/70">
                  {orderId || "—"}
                </span>
              </div>

              {reference && (
                <div className="mt-4 flex items-center justify-between gap-4 border-t border-black/[0.06] pt-4">
                  <span className="text-xs text-black/40">
                    Payment Reference
                  </span>
                  <span className="max-w-[65%] truncate text-xs font-bold text-black/70">
                    {reference}
                  </span>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between gap-4 border-t border-black/[0.06] pt-4">
                <span className="text-xs text-black/40">
                  Payment Status
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Successful
                </span>
              </div>
            </div>

            {verifyNote && (
              <div className="mx-auto mt-5 max-w-md rounded-2xl bg-[#FFF7F2] px-5 py-4">
                <p className="text-xs leading-6 text-black/55">
                  {verifyNote}
                </p>
              </div>
            )}

            <div className="mx-auto mt-7 max-w-md rounded-2xl bg-[#FFF7F2] px-5 py-4">
              <p className="text-xs leading-6 text-black/55">
                We will contact you using the phone number
                provided during checkout with updates about your
                order and delivery.
              </p>
            </div>

            {deliveryCode && (
              <div className="mx-auto mt-5 max-w-md rounded-2xl border border-[#F26A21]/25 bg-[#FFF7F2] px-5 py-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#F26A21]">
                  Delivery code
                </p>
                <p className="mt-2 text-3xl font-bold tracking-[0.25em] text-[#1A120B]">
                  {deliveryCode}
                </p>
                <p className="mt-2 text-xs leading-5 text-black/50">
                  Give this code to the rider when your order arrives.
                </p>
              </div>
            )}

            {trackingPath && (
              <div className="mx-auto mt-5 max-w-md rounded-2xl border border-[#F26A21]/25 bg-white px-5 py-4 text-left">
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#F26A21]">
                  Track delivery
                </p>
                <p className="mt-2 text-xs leading-5 text-black/50">
                  Share this link to follow your delivery status.
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Link
                    href={trackingPath}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-[#F26A21] px-5 text-xs font-bold text-white transition hover:bg-[#D95512]"
                  >
                    Open tracking page
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!trackingUrl) return;
                      try {
                        await navigator.clipboard.writeText(
                          trackingUrl.startsWith("http")
                            ? trackingUrl
                            : `${window.location.origin}${trackingPath}`
                        );
                        setCopiedTracking(true);
                        window.setTimeout(
                          () => setCopiedTracking(false),
                          2000
                        );
                      } catch {
                        /* ignore */
                      }
                    }}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-black/10 px-5 text-xs font-bold text-black/60 transition hover:border-[#F26A21]/40 hover:text-[#F26A21]"
                  >
                    {copiedTracking ? "Copied!" : "Copy tracking link"}
                  </button>
                </div>
                {trackingUrl?.startsWith("http") && (
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Track my Rhennie Tasty Shack delivery: ${trackingUrl}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex w-full min-h-[44px] items-center justify-center rounded-full border border-black/10 px-5 text-xs font-bold text-black/60 transition hover:border-[#F26A21]/40 hover:text-[#F26A21]"
                  >
                    Share on WhatsApp
                  </a>
                )}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/menu"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#F26A21] px-7 text-sm font-bold text-white shadow-[0_12px_30px_rgba(242,106,33,0.2)] transition-all hover:-translate-y-1 hover:bg-[#D95512]"
              >
                <ShoppingBag size={17} className="mr-2" />
                Continue Shopping
              </Link>

              <Link
                href="/orders"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-black/10 bg-white px-7 text-sm font-bold text-black/60 transition-all hover:border-[#F26A21]/40 hover:text-[#F26A21]"
              >
                View My Orders
              </Link>
            </div>

            <p className="mt-10 text-[8px] font-bold uppercase tracking-[0.3em] text-black/25">
              Premium Taste
              <span className="mx-3 text-[#F26A21]">•</span>
              Fast Delivery
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#F8F6F2] text-[#171717]">
          <Loader2
            className="animate-spin text-[#F26A21]"
            size={36}
          />
        </main>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
