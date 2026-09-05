"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Order = {
  id: string;
  order_no?: string | null;
  order_number?: string | null;
  title?: string | null;
  total?: number | null;
  quotation_status?: string | null;
  payment_status?: string | null;
  customer_name?: string | null;
  full_name?: string | null;
};

type PaymentOption = "NGN" | "USD" | "CRYPTO" | null;

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [selectedOption, setSelectedOption] =
    useState<PaymentOption>(null);

  const [loading, setLoading] = useState(true);
  const [creatingPayment, setCreatingPayment] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // =====================================================
  // FORMAT NAIRA
  // =====================================================

  const formatNaira = (amount?: number | null) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(Number(amount ?? 0));
  };

  // =====================================================
  // LOAD ORDER
  // =====================================================

  useEffect(() => {
    if (!id) return;

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/orders/${id}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Unable to load order."
          );
        }

        setOrder(data.order);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load order."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  // =====================================================
  // CREATE PAYMENT
  // =====================================================

  const createPayment = async () => {
    if (!order) return;

    if (!selectedOption) {
      setError(
        "Please choose a payment method."
      );
      return;
    }

    if (
      order.quotation_status !== "ACCEPTED"
    ) {
      setError(
        "This quotation must be accepted before payment."
      );
      return;
    }

    try {
      setCreatingPayment(true);
      setError("");
      setMessage("");

      let paymentMethod = "";
      let paymentProvider = "";

      // =================================================
      // PAYMENT OPTION SETTINGS
      // =================================================

      if (selectedOption === "NGN") {
        paymentMethod =
          "CARD_OR_TRANSFER";

        paymentProvider =
          "PAYSTACK";
      }

      if (selectedOption === "USD") {
        paymentMethod =
          "CARD";

        paymentProvider =
          "PAYSTACK";
      }

      if (selectedOption === "CRYPTO") {
        paymentMethod =
          "CRYPTO";

        paymentProvider =
          "CRYPTO_PROVIDER";
      }

      // =================================================
      // CREATE PAYMENT RECORD
      // =================================================

      const response = await fetch(
        "/api/payments",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            order_id: order.id,

            /*
             * IMPORTANT:
             *
             * The quotation is currently stored
             * in NGN.
             *
             * NGN works directly.
             *
             * USD and Crypto conversion will be
             * handled separately before they are
             * enabled for production.
             */

            amount:
              Number(order.total ?? 0),

            currency:
              selectedOption,

            payment_method:
              paymentMethod,

            payment_provider:
              paymentProvider,

            base_currency:
              "NGN",

            base_amount:
              Number(order.total ?? 0),
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Unable to create payment."
        );
      }

      // =================================================
      // NGN / USD -> INITIALIZE PAYSTACK
      // =================================================

      if (
        selectedOption === "NGN" ||
        selectedOption === "USD"
      ) {
        const paystackResponse =
          await fetch(
            "/api/payments/paystack/initialize",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                payment_id:
                  data.payment.id,
              }),
            }
          );

        const paystackData =
          await paystackResponse.json();

        if (
          !paystackResponse.ok ||
          !paystackData.success
        ) {
          throw new Error(
            paystackData.error ||
              "Unable to initialize Paystack payment."
          );
        }

        if (
          !paystackData.authorization_url
        ) {
          throw new Error(
            "Paystack did not return a checkout URL."
          );
        }

        // ===============================================
        // REDIRECT TO PAYSTACK
        // ===============================================

        window.location.href =
          paystackData.authorization_url;

        return;
      }

      // =================================================
      // CRYPTO
      // =================================================

      if (
        selectedOption === "CRYPTO"
      ) {
        setMessage(
          "Crypto payment created successfully. Crypto checkout will be connected next."
        );

        return;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create payment."
      );
    } finally {
      setCreatingPayment(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] px-4 py-16 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm text-neutral-400">
            Loading payment details...
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // ORDER NOT FOUND
  // =====================================================

  if (!order) {
    return (
      <main className="min-h-screen bg-[#080808] px-4 py-16 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6">
            <h1 className="text-xl font-semibold">
              Payment unavailable
            </h1>

            <p className="mt-2 text-sm text-red-200">
              {error ||
                "The order could not be loaded."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const accepted =
    order.quotation_status ===
    "ACCEPTED";

  const customerName =
    order.full_name ||
    order.customer_name ||
    "Customer";

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">
          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="mb-5 text-sm text-neutral-400 transition hover:text-white"
          >
            ← Back
          </button>

          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D6B15E]">
            Rhennie Tasty Shack
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Complete your payment
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400 sm:text-base">
            Hello {customerName}. Choose
            how you would like to pay for
            your confirmed order.
          </p>
        </div>

        {/* =================================================
            ORDER SUMMARY
        ================================================= */}

        <section className="mb-8 rounded-[28px] border border-white/10 bg-[#111111] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
                Order
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                {order.title ||
                  "Rhennie Tasty Shack Order"}
              </h2>

              <p className="mt-2 text-sm text-neutral-400">
                {order.order_number ||
                  order.order_no ||
                  order.id}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
                Amount Due
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#E8CA82]">
                {formatNaira(
                  order.total
                )}
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                Base quotation currency:
                NGN
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="flex flex-wrap gap-3">
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  accepted
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-amber-500/10 text-amber-300"
                }`}
              >
                Quotation{" "}
                {order.quotation_status ||
                  "Pending"}
              </span>

              <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-300">
                Payment{" "}
                {order.payment_status ||
                  "Not Started"}
              </span>
            </div>
          </div>
        </section>

        {/* =================================================
            NOT ACCEPTED
        ================================================= */}

        {!accepted ? (
          <section className="rounded-[28px] border border-amber-500/20 bg-amber-500/5 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-amber-200">
              Payment is not available
              yet
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-amber-100/70">
              You must accept your
              quotation before a payment
              can be initiated for this
              order.
            </p>
          </section>
        ) : (
          <>
            {/* =============================================
                PAYMENT OPTIONS
            ============================================= */}

            <section>
              <div className="mb-5">
                <h2 className="text-xl font-semibold">
                  Choose payment method
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Select the option that
                  works best for you.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {/* =========================================
                    NGN
                ========================================= */}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedOption(
                      "NGN"
                    );

                    setError("");
                    setMessage("");
                  }}
                  className={`rounded-[26px] border p-6 text-left transition ${
                    selectedOption ===
                    "NGN"
                      ? "border-[#D6B15E] bg-[#D6B15E]/10"
                      : "border-white/10 bg-[#111111] hover:border-white/20"
                  }`}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-xl">
                    ₦
                  </div>

                  <h3 className="mt-5 text-lg font-semibold">
                    Pay in Naira
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-neutral-400">
                    Pay securely with
                    your Nigerian card,
                    bank transfer or
                    other available
                    Paystack channels.
                  </p>

                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#D6B15E]">
                    NGN • Paystack
                  </p>
                </button>

                {/* =========================================
                    USD
                ========================================= */}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedOption(
                      "USD"
                    );

                    setError("");
                    setMessage("");
                  }}
                  className={`rounded-[26px] border p-6 text-left transition ${
                    selectedOption ===
                    "USD"
                      ? "border-[#D6B15E] bg-[#D6B15E]/10"
                      : "border-white/10 bg-[#111111] hover:border-white/20"
                  }`}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-xl">
                    $
                  </div>

                  <h3 className="mt-5 text-lg font-semibold">
                    Pay in USD
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-neutral-400">
                    For eligible
                    international
                    payments. Currency
                    conversion will be
                    completed before USD
                    goes live.
                  </p>

                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#D6B15E]">
                    USD • Paystack
                  </p>
                </button>

                {/* =========================================
                    CRYPTO
                ========================================= */}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedOption(
                      "CRYPTO"
                    );

                    setError("");
                    setMessage("");
                  }}
                  className={`rounded-[26px] border p-6 text-left transition ${
                    selectedOption ===
                    "CRYPTO"
                      ? "border-[#D6B15E] bg-[#D6B15E]/10"
                      : "border-white/10 bg-[#111111] hover:border-white/20"
                  }`}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-xl">
                    ₿
                  </div>

                  <h3 className="mt-5 text-lg font-semibold">
                    Pay with Crypto
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-neutral-400">
                    Choose from supported
                    coins and blockchain
                    networks once crypto
                    checkout is enabled.
                  </p>

                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#D6B15E]">
                    Crypto
                  </p>
                </button>
              </div>
            </section>

            {/* =============================================
                ERROR
            ============================================= */}

            {error && (
              <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">
                {error}
              </div>
            )}

            {/* =============================================
                SUCCESS MESSAGE
            ============================================= */}

            {message && (
              <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-200">
                {message}
              </div>
            )}

            {/* =============================================
                CONTINUE BUTTON
            ============================================= */}

            <div className="mt-8 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-[#111111] p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">
                  {selectedOption
                    ? `Selected: ${selectedOption}`
                    : "No payment method selected"}
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  Payment is only marked
                  successful after
                  server-side
                  verification.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  createPayment
                }
                disabled={
                  !selectedOption ||
                  creatingPayment
                }
                className="rounded-2xl bg-[#D6B15E] px-7 py-3.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {creatingPayment
                  ? "Preparing Payment..."
                  : selectedOption ===
                      "NGN"
                    ? "Continue to Paystack"
                    : "Continue to Payment"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}