"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Loader2,
  MapPin,
  ShoppingBag,
} from "lucide-react";

import { useCart } from "@/app/context/CartContext";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}

type DeliveryType = "delivery" | "pickup";

export default function CheckoutPage() {
  const router = useRouter();

  const {
    items,
    subtotal,
    totalItems,
    clearCart,
  } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [deliveryType, setDeliveryType] =
    useState<DeliveryType>("delivery");

  const [deliveryAddress, setDeliveryAddress] =
    useState("");

  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * Delivery fee will be connected to the
   * business delivery rules later.
   *
   * For now:
   * Delivery fee = ₦0
   */
  const deliveryFee = 0;

  const total = useMemo(() => {
    return subtotal + deliveryFee;
  }, [subtotal, deliveryFee]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (items.length === 0) {
      setError(
        "Your cart is empty. Please add a meal before checkout."
      );

      return;
    }

    if (!customerName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!customerEmail.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!customerPhone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (
      deliveryType === "delivery" &&
      !deliveryAddress.trim()
    ) {
      setError("Please enter your delivery address.");
      return;
    }

    try {
      setLoading(true);

      const {
        data: { session },
      } = await (
        await import("@/lib/supabase")
      ).supabase.auth.getSession();

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch(
        "/api/orders/initialize-payment",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            customerName: customerName.trim(),

            customerEmail: customerEmail.trim(),

            customerPhone: customerPhone.trim(),

            deliveryType,

            deliveryAddress:
              deliveryType === "delivery"
                ? deliveryAddress.trim()
                : "",

            notes: notes.trim(),

            /*
             * Send the cart price as well.
             */
            items: items.map((item) => ({
              id: item.id,

              name: item.name,

              collection: item.collection,

              quantity: item.quantity,

              price: item.price,

              selectedSize:
                item.selectedSize || null,
            })),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to initialize payment."
        );
      }

      /*
       * Paystack authorization URL
       */
      if (data.authorizationUrl) {
        window.location.href =
          data.authorizationUrl;

        return;
      }

      /*
       * Fallback if the server returns an order
       * without a Paystack URL.
       */
      if (data.orderId) {
        clearCart();

        router.push(
          `/checkout/success?order=${encodeURIComponent(
            data.orderId
          )}`
        );

        return;
      }

      throw new Error(
        "Payment could not be started."
      );
    } catch (submitError) {
      console.error(
        "Checkout error:",
        submitError
      );

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again."
      );

      setLoading(false);
    }
  }

  /*
   * EMPTY CART
   */
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#F8F6F2] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-[32px] border border-black/[0.08] bg-white px-6 py-14 text-center shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:px-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF1E9] text-[#F26A21]">
              <ShoppingBag size={32} />
            </div>

            <p className="mt-7 text-[9px] font-bold uppercase tracking-[0.3em] text-[#F26A21]">
              Rhennie Tasty Shack
            </p>

            <h1 className="mt-2 font-serif text-3xl font-bold text-[#171717] sm:text-4xl">
              Your cart is empty
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-black/50">
              Add something delicious from our
              menu before continuing to checkout.
            </p>

            <Link
              href="/menu"
              className="mt-7 inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#F26A21] px-8 text-sm font-bold text-white shadow-[0_12px_30px_rgba(242,106,33,0.2)] transition-all hover:-translate-y-1 hover:bg-[#D95512]"
            >
              Explore Our Menu
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F6F2] text-[#171717]">

      {/* =====================================================
          TOP BAR
      ====================================================== */}

      <div className="border-b border-black/[0.07] bg-white">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-xs font-bold text-black/55 transition-colors hover:text-[#F26A21]"
          >
            <ArrowLeft size={16} />
            Back to Menu
          </Link>

          <div className="text-right">
            <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-[#F26A21]">
              Secure Checkout
            </p>

            <p className="mt-1 text-xs font-semibold text-black/40">
              {totalItems}{" "}
              {totalItems === 1
                ? "item"
                : "items"}
            </p>
          </div>

        </div>
      </div>

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <section className="px-4 pb-8 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#F26A21]">
            Rhennie Tasty Shack
          </p>

          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl lg:text-5xl">
            Complete Your Order
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-7 text-black/50">
            Tell us where to deliver your meal
            and complete your payment securely
            with Paystack.
          </p>

        </div>
      </section>

      {/* =====================================================
          CHECKOUT
      ====================================================== */}

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <form
            onSubmit={handleSubmit}
            className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start"
          >

            {/* =================================================
                LEFT — CUSTOMER DETAILS
            ================================================== */}

            <div className="space-y-6">

              {/* CUSTOMER INFORMATION */}

              <section className="rounded-[28px] border border-black/[0.08] bg-white p-5 shadow-sm sm:p-7">

                <div className="mb-6">
                  <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#F26A21]">
                    Step 01
                  </p>

                  <h2 className="mt-1 font-serif text-2xl font-bold">
                    Your Information
                  </h2>

                  <p className="mt-2 text-xs leading-6 text-black/45">
                    We need these details to process
                    and deliver your order.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="customerName"
                      className="mb-2 block text-xs font-bold text-black/65"
                    >
                      Full Name
                    </label>

                    <input
                      id="customerName"
                      type="text"
                      value={customerName}
                      onChange={(event) =>
                        setCustomerName(
                          event.target.value
                        )
                      }
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className="min-h-[52px] w-full rounded-2xl border border-black/10 bg-[#F8F6F2] px-4 text-sm outline-none transition-all placeholder:text-black/30 focus:border-[#F26A21] focus:bg-white focus:ring-4 focus:ring-[#F26A21]/10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="customerEmail"
                      className="mb-2 block text-xs font-bold text-black/65"
                    >
                      Email Address
                    </label>

                    <input
                      id="customerEmail"
                      type="email"
                      value={customerEmail}
                      onChange={(event) =>
                        setCustomerEmail(
                          event.target.value
                        )
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="min-h-[52px] w-full rounded-2xl border border-black/10 bg-[#F8F6F2] px-4 text-sm outline-none transition-all placeholder:text-black/30 focus:border-[#F26A21] focus:bg-white focus:ring-4 focus:ring-[#F26A21]/10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="customerPhone"
                      className="mb-2 block text-xs font-bold text-black/65"
                    >
                      Phone Number
                    </label>

                    <input
                      id="customerPhone"
                      type="tel"
                      value={customerPhone}
                      onChange={(event) =>
                        setCustomerPhone(
                          event.target.value
                        )
                      }
                      placeholder="08012345678"
                      autoComplete="tel"
                      className="min-h-[52px] w-full rounded-2xl border border-black/10 bg-[#F8F6F2] px-4 text-sm outline-none transition-all placeholder:text-black/30 focus:border-[#F26A21] focus:bg-white focus:ring-4 focus:ring-[#F26A21]/10"
                    />
                  </div>

                </div>
              </section>

              {/* =================================================
                  DELIVERY
              ================================================== */}

              <section className="rounded-[28px] border border-black/[0.08] bg-white p-5 shadow-sm sm:p-7">

                <div className="mb-6">
                  <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#F26A21]">
                    Step 02
                  </p>

                  <h2 className="mt-1 font-serif text-2xl font-bold">
                    Delivery Details
                  </h2>

                  <p className="mt-2 text-xs leading-6 text-black/45">
                    Choose how you would like to
                    receive your order.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">

                  {/* DELIVERY */}

                  <button
                    type="button"
                    onClick={() =>
                      setDeliveryType("delivery")
                    }
                    className={`rounded-[22px] border p-5 text-left transition-all ${
                      deliveryType === "delivery"
                        ? "border-[#F26A21] bg-[#FFF7F2] shadow-[0_10px_30px_rgba(242,106,33,0.08)]"
                        : "border-black/10 bg-white hover:border-[#F26A21]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">

                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF1E9] text-[#F26A21]">
                        <MapPin size={20} />
                      </div>

                      {deliveryType ===
                        "delivery" && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F26A21] text-white">
                          <Check size={14} />
                        </span>
                      )}

                    </div>

                    <h3 className="mt-4 text-sm font-bold">
                      Home Delivery
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-black/45">
                      Have your order delivered
                      to your location.
                    </p>
                  </button>

                  {/* PICKUP */}

                  <button
                    type="button"
                    onClick={() =>
                      setDeliveryType("pickup")
                    }
                    className={`rounded-[22px] border p-5 text-left transition-all ${
                      deliveryType === "pickup"
                        ? "border-[#F26A21] bg-[#FFF7F2] shadow-[0_10px_30px_rgba(242,106,33,0.08)]"
                        : "border-black/10 bg-white hover:border-[#F26A21]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">

                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF1E9] text-[#F26A21]">
                        <ShoppingBag size={20} />
                      </div>

                      {deliveryType ===
                        "pickup" && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F26A21] text-white">
                          <Check size={14} />
                        </span>
                      )}

                    </div>

                    <h3 className="mt-4 text-sm font-bold">
                      Pickup
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-black/45">
                      Pick up your order from
                      Rhennie Tasty Shack.
                    </p>
                  </button>

                </div>

                {/* ADDRESS */}

                {deliveryType ===
                  "delivery" && (
                  <div className="mt-5">

                    <label
                      htmlFor="deliveryAddress"
                      className="mb-2 block text-xs font-bold text-black/65"
                    >
                      Delivery Address
                    </label>

                    <textarea
                      id="deliveryAddress"
                      value={deliveryAddress}
                      onChange={(event) =>
                        setDeliveryAddress(
                          event.target.value
                        )
                      }
                      placeholder="Enter your complete delivery address"
                      rows={4}
                      autoComplete="street-address"
                      className="w-full resize-none rounded-2xl border border-black/10 bg-[#F8F6F2] px-4 py-3 text-sm outline-none transition-all placeholder:text-black/30 focus:border-[#F26A21] focus:bg-white focus:ring-4 focus:ring-[#F26A21]/10"
                    />
                  </div>
                )}

                {/* NOTES */}

                <div className="mt-5">

                  <label
                    htmlFor="notes"
                    className="mb-2 block text-xs font-bold text-black/65"
                  >
                    Order Notes

                    <span className="ml-1 font-normal text-black/35">
                      (Optional)
                    </span>
                  </label>

                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(event) =>
                      setNotes(
                        event.target.value
                      )
                    }
                    placeholder="Any special instructions for your order?"
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-black/10 bg-[#F8F6F2] px-4 py-3 text-sm outline-none transition-all placeholder:text-black/30 focus:border-[#F26A21] focus:bg-white focus:ring-4 focus:ring-[#F26A21]/10"
                  />
                </div>

              </section>

            </div>

            {/* =================================================
                RIGHT — ORDER SUMMARY
            ================================================== */}

            <aside className="lg:sticky lg:top-6">

              <div className="overflow-hidden rounded-[28px] border border-black/[0.08] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.07)]">

                {/* HEADER */}

                <div className="border-b border-black/[0.07] bg-[#171717] px-5 py-5 text-white sm:px-6">

                  <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-[#F26A21]">
                    Your Order
                  </p>

                  <div className="mt-1 flex items-end justify-between gap-3">

                    <h2 className="font-serif text-2xl font-bold">
                      Order Summary
                    </h2>

                    <span className="text-xs text-white/45">
                      {totalItems}{" "}
                      {totalItems === 1
                        ? "item"
                        : "items"}
                    </span>

                  </div>
                </div>

                {/* ITEMS */}

                <div className="max-h-[390px] overflow-y-auto px-5 py-5 sm:px-6">

                  <div className="space-y-4">

                    {items.map((item) => (
                      <div
                        key={`${item.id}-${item.selectedSize || "standard"}`}
                        className="border-b border-black/[0.06] pb-4 last:border-0 last:pb-0"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div className="min-w-0">

                            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#F26A21]">
                              {item.collection}
                            </p>

                            <h3 className="mt-1 font-serif text-base font-bold leading-tight">
                              {item.name}
                            </h3>

                            {item.selectedSize && (
                              <p className="mt-1 text-[11px] text-black/40">
                                Size:{" "}
                                <span className="font-semibold text-[#F26A21]">
                                  {item.selectedSize}
                                </span>
                              </p>
                            )}

                            <p className="mt-1 text-[11px] text-black/40">
                              Qty:{" "}
                              <span className="font-semibold text-black/60">
                                {item.quantity}
                              </span>
                            </p>

                          </div>

                          <p className="shrink-0 text-sm font-extrabold text-[#171717]">
                            {formatPrice(
                              item.price *
                                item.quantity
                            )}
                          </p>

                        </div>

                      </div>
                    ))}

                  </div>
                </div>

                {/* TOTALS */}

                <div className="border-t border-black/[0.07] bg-[#FAF9F7] px-5 py-5 sm:px-6">

                  <div className="flex items-center justify-between text-sm">

                    <span className="text-black/45">
                      Subtotal
                    </span>

                    <span className="font-bold">
                      {formatPrice(subtotal)}
                    </span>

                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">

                    <span className="text-black/45">
                      Delivery Fee
                    </span>

                    <span className="font-bold">
                      {deliveryFee === 0
                        ? "Free"
                        : formatPrice(
                            deliveryFee
                          )}
                    </span>

                  </div>

                  <div className="my-5 h-px bg-black/[0.08]" />

                  <div className="flex items-end justify-between gap-4">

                    <div>

                      <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-black/35">
                        Total
                      </p>

                      <p className="mt-1 text-xs text-black/40">
                        Pay securely with Paystack
                      </p>

                    </div>

                    <p className="text-2xl font-extrabold tracking-tight text-[#F26A21] sm:text-3xl">
                      {formatPrice(total)}
                    </p>

                  </div>

                </div>

                {/* ERROR */}

                {error && (
                  <div className="mx-5 mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600 sm:mx-6">
                    {error}
                  </div>
                )}

                {/* PAYMENT */}

                <div className="px-5 pb-6 pt-5 sm:px-6">

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex min-h-[56px] w-full items-center justify-center rounded-full bg-[#F26A21] px-5 text-sm font-bold text-white shadow-[0_15px_35px_rgba(242,106,33,0.22)] transition-all hover:-translate-y-1 hover:bg-[#D95512] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <>
                        <Loader2
                          size={19}
                          className="mr-2 animate-spin"
                        />

                        Preparing Payment...
                      </>
                    ) : (
                      <>
                        Pay{" "}
                        {formatPrice(total)}

                        <span className="ml-2 text-lg">
                          →
                        </span>
                      </>
                    )}
                  </button>

                  <p className="mt-4 text-center text-[10px] leading-5 text-black/35">
                    Your payment will be processed
                    securely by Paystack. We never
                    receive or store your card
                    details.
                  </p>

                </div>

              </div>
            </aside>

          </form>
        </div>
      </section>

      {/* =====================================================
          BRAND FOOTER
      ====================================================== */}

      <div className="border-t border-black/[0.06] bg-white px-4 py-7 text-center">

        <p className="text-[8px] font-bold uppercase tracking-[0.35em] text-black/30">
          Premium Taste

          <span className="mx-3 text-[#F26A21]">
            •
          </span>

          Fast Delivery
        </p>

      </div>

    </main>
  );
}