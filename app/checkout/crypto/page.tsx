"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useCart } from "@/app/context/CartContext";

function CryptoCheckoutContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const orderId = searchParams.get("order");
  const reference = searchParams.get("reference");
  const usdt = searchParams.get("usdt");
  const ngn = searchParams.get("ngn");
  const wallet = searchParams.get("wallet");
  const network = searchParams.get("network") || "TRC20";
  const tracking = searchParams.get("tracking");
  const deliveryCode = searchParams.get("code");
  const [copied, setCopied] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
    } catch {
      setCopied("");
    }
  }

  const nairaLabel = ngn
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }).format(Number(ngn))
    : "";

  const whatsappText = encodeURIComponent(
    `I have sent ${usdt || ""} USDT for order ${reference || orderId || ""}.`
  );

  async function markSent() {
    if (!reference || !orderId || sending) return;

    try {
      setSending(true);
      setSendError("");

      const response = await fetch("/api/payments/crypto/sent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference,
          order_id: orderId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to record the USDT transfer."
        );
      }

      clearCart();
      setSent(true);
    } catch (error) {
      setSendError(
        error instanceof Error
          ? error.message
          : "Unable to record the USDT transfer."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F6F2] px-4 py-12 text-[#171717] sm:px-6">
      <div className="mx-auto max-w-lg rounded-[32px] border border-black/[0.08] bg-white px-6 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:px-10">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#F26A21]">
          Rhennie Tasty Shack
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold">
          Pay with crypto
        </h1>
        <p className="mt-3 text-sm leading-6 text-black/50">
          Send the exact USDT amount on {network}. We confirm the transfer before the kitchen starts the order.
        </p>

        <div className="mt-8 rounded-2xl bg-[#FAF9F7] px-5 py-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/35">
            Amount
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[#F26A21]">
            {usdt || "—"} USDT
          </p>
          {nairaLabel && (
            <p className="mt-1 text-sm text-black/45">{nairaLabel}</p>
          )}
        </div>

        <div className="mt-5 rounded-2xl border border-[#F26A21]/30 bg-[#FFF7F2] px-5 py-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F26A21]">
            Payment reference
          </p>
          <p className="mt-2 break-all text-2xl font-extrabold tracking-tight">
            {reference || "—"}
          </p>
          <p className="mt-2 text-sm leading-6 text-black/55">
            This reference stays on your order. Include it with the USDT transfer.
          </p>
          {reference && (
            <button
              type="button"
              onClick={() => copy(reference, "reference")}
              className="mt-3 text-xs font-bold text-[#F26A21]"
            >
              {copied === "reference" ? "Copied" : "Copy payment reference"}
            </button>
          )}
        </div>

        {wallet ? (
          <div className="mt-5">
            <p className="text-xs font-bold text-black/65">
              {network} wallet
            </p>
            <p className="mt-2 break-all rounded-2xl border border-black/10 bg-[#F8F6F2] px-4 py-3 text-sm">
              {wallet}
            </p>
            <button
              type="button"
              onClick={() => copy(wallet, "wallet")}
              className="mt-3 text-xs font-bold text-[#F26A21]"
            >
              {copied === "wallet" ? "Copied" : "Copy wallet address"}
            </button>
          </div>
        ) : (
          <p className="mt-5 text-sm leading-6 text-black/55">
            Send the exact USDT amount. Keep the payment reference above on this page so the transfer can be matched.
          </p>
        )}

        {deliveryCode && (
          <div className="mt-5 rounded-2xl border border-[#F26A21]/25 bg-[#FFF7F2] px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F26A21]">
              Delivery code
            </p>
            <p className="mt-1 text-3xl font-extrabold tracking-[0.2em]">
              {deliveryCode}
            </p>
            <p className="mt-1 text-xs text-black/50">
              Give this code to the rider when your order arrives.
            </p>
          </div>
        )}

        {sent ? (
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
            Rhennie has your transfer notice for {usdt || "the"} USDT.
            The booking is marked paid after the USDT arrives in the shop wallet.
          </div>
        ) : (
          <button
            type="button"
            onClick={markSent}
            disabled={sending || !reference}
            className="mt-8 flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#F26A21] px-6 text-sm font-bold text-white disabled:opacity-60"
          >
            {sending ? "Saving..." : "I have sent the USDT"}
          </button>
        )}

        {sendError && (
          <p className="mt-3 text-sm text-red-600">{sendError}</p>
        )}

        <a
          href={`https://wa.me/2348121577759?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block text-center text-sm font-bold text-black/55"
        >
          Send the receipt on WhatsApp
        </a>

        {tracking && (
          <Link
            href={`/track/${encodeURIComponent(tracking)}`}
            className="mt-4 block text-center text-sm font-bold text-black/55"
          >
            Track this order
          </Link>
        )}
      </div>
    </main>
  );
}

export default function CryptoCheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F8F6F2]" />
      }
    >
      <CryptoCheckoutContent />
    </Suspense>
  );
}
