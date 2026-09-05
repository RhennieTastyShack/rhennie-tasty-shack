"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/app/context/CartContext";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}

type CheckoutForm = {
  name: string;
  phone: string;
  deliveryType: "delivery" | "pickup";
  address: string;
  notes: string;
};

export default function CartDrawer() {
  const {
    items,
    subtotal,
    totalItems,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [checkoutOpen, setCheckoutOpen] =
    useState(false);

  const [form, setForm] =
    useState<CheckoutForm>({
      name: "",
      phone: "",
      deliveryType: "delivery",
      address: "",
      notes: "",
    });

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  /* =========================================================
     WHATSAPP MESSAGE
  ========================================================= */

  const whatsappMessage = useMemo(() => {
    const orderLines = items
      .map((item) => {
        const size = item.selectedSize
          ? ` (${item.selectedSize})`
          : "";

        const total =
          item.price * item.quantity;

        return `• ${item.name}${size} x${item.quantity} — ${formatPrice(
          total
        )}`;
      })
      .join("\n");

    return `Hello Rhennie Tasty Shack,

I would like to place an order.

CUSTOMER DETAILS
Name: ${form.name}
Phone: ${form.phone}

ORDER TYPE
${form.deliveryType === "delivery" ? "Delivery" : "Pickup"}

${
  form.deliveryType === "delivery"
    ? `DELIVERY ADDRESS
${form.address}`
    : ""
}

ORDER DETAILS
${orderLines}

SUBTOTAL
${formatPrice(subtotal)}

${
  form.notes
    ? `SPECIAL NOTES
${form.notes}`
    : ""
}

Please confirm my order, delivery fee and final total.

Thank you.`;
  }, [
    items,
    subtotal,
    form,
  ]);

  /* =========================================================
     CHECKOUT
  ========================================================= */

  function openCheckout() {
    setError("");
    setCheckoutOpen(true);
  }

  function closeCheckout() {
    setError("");
    setCheckoutOpen(false);
  }

  /* =========================================================
     FORM UPDATE
  ========================================================= */

  function updateForm(
    field: keyof CheckoutForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  }

  /* =========================================================
     SUBMIT CHECKOUT
  ========================================================= */

  function handleCheckout(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (
      form.phone.replace(/\D/g, "").length < 10
    ) {
      setError(
        "Please enter a valid phone number."
      );
      return;
    }

    if (
      form.deliveryType === "delivery" &&
      !form.address.trim()
    ) {
      setError(
        "Please enter your delivery address."
      );
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);

    const whatsappLink =
      `https://wa.me/2348121577759?text=${encodeURIComponent(
        whatsappMessage
      )}`;

    window.open(
      whatsappLink,
      "_blank",
      "noopener,noreferrer"
    );

    setSubmitting(false);
  }

  if (!isCartOpen) {
    return null;
  }

  return (
    <>
      {/* =====================================================
          BACKDROP
      ====================================================== */}

      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
      />

      {/* =====================================================
          CART DRAWER
      ====================================================== */}

      <aside
        aria-label="Shopping cart"
        className="
          fixed
          right-0
          top-0
          z-[100]
          flex
          h-[100dvh]
          w-full
          max-w-md
          flex-col
          overflow-hidden
          bg-[#F8F6F2]
          shadow-[-20px_0_60px_rgba(0,0,0,0.18)]
        "
      >
        {/* ===================================================
            HEADER
        ==================================================== */}

        <div className="flex shrink-0 items-center justify-between border-b border-black/[0.08] bg-white px-5 py-5 sm:px-7">

          <div className="min-w-0">

            <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#F26A21]">
              Rhennie Tasty Shack
            </p>

            <h2 className="mt-1 font-serif text-2xl font-bold text-[#171717]">
              {checkoutOpen
                ? "Checkout"
                : "Your Cart"}
            </h2>

            <p className="mt-1 text-xs text-black/45">
              {checkoutOpen
                ? "Complete your order details"
                : `${totalItems} ${
                    totalItems === 1
                      ? "item"
                      : "items"
                  } selected`}
            </p>

          </div>

          <button
            type="button"
            onClick={
              checkoutOpen
                ? closeCheckout
                : closeCart
            }
            aria-label={
              checkoutOpen
                ? "Back to cart"
                : "Close cart"
            }
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-black/10
              bg-white
              text-xl
              text-black/50
              transition-all
              hover:border-[#F26A21]
              hover:bg-[#F26A21]
              hover:text-white
            "
          >
            {checkoutOpen ? "←" : "×"}
          </button>

        </div>

        {/* ===================================================
            CHECKOUT VIEW
        ==================================================== */}

        {checkoutOpen ? (
          <form
            onSubmit={handleCheckout}
            className="flex min-h-0 flex-1 flex-col"
          >

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">

              {/* Intro */}

              <div className="mb-6 rounded-[20px] border border-[#F26A21]/15 bg-[#FFF1E9] p-4">

                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#F26A21]">
                  Almost There
                </p>

                <p className="mt-2 text-sm leading-6 text-black/60">
                  Enter your details below. We'll
                  send your order directly to
                  Rhennie Tasty Shack on WhatsApp
                  for confirmation.
                </p>

              </div>

              {/* Customer Information */}

              <div className="space-y-5">

                <div>
                  <label
                    htmlFor="checkout-name"
                    className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-black/45"
                  >
                    Full Name
                  </label>

                  <input
                    id="checkout-name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      updateForm(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Enter your full name"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-black/10
                      bg-white
                      px-4
                      text-sm
                      text-[#171717]
                      outline-none
                      transition-all
                      placeholder:text-black/30
                      focus:border-[#F26A21]
                      focus:ring-4
                      focus:ring-[#F26A21]/10
                    "
                  />
                </div>

                <div>
                  <label
                    htmlFor="checkout-phone"
                    className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-black/45"
                  >
                    Phone Number
                  </label>

                  <input
                    id="checkout-phone"
                    type="tel"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(event) =>
                      updateForm(
                        "phone",
                        event.target.value
                      )
                    }
                    placeholder="080XXXXXXXX"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-black/10
                      bg-white
                      px-4
                      text-sm
                      text-[#171717]
                      outline-none
                      transition-all
                      placeholder:text-black/30
                      focus:border-[#F26A21]
                      focus:ring-4
                      focus:ring-[#F26A21]/10
                    "
                  />
                </div>

                {/* Order Type */}

                <div>

                  <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-black/45">
                    Order Type
                  </label>

                  <div className="grid grid-cols-2 gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        updateForm(
                          "deliveryType",
                          "delivery"
                        )
                      }
                      className={`
                        min-h-[52px]
                        rounded-xl
                        border
                        px-3
                        text-xs
                        font-bold
                        transition-all
                        ${
                          form.deliveryType ===
                          "delivery"
                            ? "border-[#F26A21] bg-[#FFF1E9] text-[#F26A21]"
                            : "border-black/10 bg-white text-black/50 hover:border-[#F26A21]/40"
                        }
                      `}
                    >
                      🚚 Delivery
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateForm(
                          "deliveryType",
                          "pickup"
                        )
                      }
                      className={`
                        min-h-[52px]
                        rounded-xl
                        border
                        px-3
                        text-xs
                        font-bold
                        transition-all
                        ${
                          form.deliveryType ===
                          "pickup"
                            ? "border-[#F26A21] bg-[#FFF1E9] text-[#F26A21]"
                            : "border-black/10 bg-white text-black/50 hover:border-[#F26A21]/40"
                        }
                      `}
                    >
                      📦 Pickup
                    </button>

                  </div>

                </div>

                {/* Address */}

                {form.deliveryType ===
                  "delivery" && (
                  <div>
                    <label
                      htmlFor="checkout-address"
                      className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-black/45"
                    >
                      Delivery Address
                    </label>

                    <textarea
                      id="checkout-address"
                      value={form.address}
                      onChange={(event) =>
                        updateForm(
                          "address",
                          event.target.value
                        )
                      }
                      placeholder="Enter your full delivery address"
                      rows={3}
                      className="
                        w-full
                        resize-none
                        rounded-xl
                        border
                        border-black/10
                        bg-white
                        px-4
                        py-3
                        text-sm
                        leading-6
                        text-[#171717]
                        outline-none
                        transition-all
                        placeholder:text-black/30
                        focus:border-[#F26A21]
                        focus:ring-4
                        focus:ring-[#F26A21]/10
                      "
                    />
                  </div>
                )}

                {/* Notes */}

                <div>

                  <label
                    htmlFor="checkout-notes"
                    className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-black/45"
                  >
                    Order Notes{" "}
                    <span className="normal-case tracking-normal text-black/25">
                      (Optional)
                    </span>
                  </label>

                  <textarea
                    id="checkout-notes"
                    value={form.notes}
                    onChange={(event) =>
                      updateForm(
                        "notes",
                        event.target.value
                      )
                    }
                    placeholder="Any special instructions?"
                    rows={3}
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-black/10
                      bg-white
                      px-4
                      py-3
                      text-sm
                      leading-6
                      text-[#171717]
                      outline-none
                      transition-all
                      placeholder:text-black/30
                      focus:border-[#F26A21]
                      focus:ring-4
                      focus:ring-[#F26A21]/10
                    "
                  />

                </div>

              </div>

              {/* Error */}

              {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                  <p className="text-xs font-semibold leading-5 text-red-600">
                    {error}
                  </p>

                </div>
              )}

              {/* Order Summary */}

              <div className="mt-7 rounded-[20px] border border-black/[0.08] bg-white p-4">

                <div className="flex items-center justify-between">

                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
                    Order Summary
                  </span>

                  <span className="text-xs font-bold text-black/40">
                    {totalItems}{" "}
                    {totalItems === 1
                      ? "item"
                      : "items"}
                  </span>

                </div>

                <div className="mt-4 space-y-3">

                  {items.map((item) => (
                    <div
                      key={`${item.id}-${item.selectedSize || "standard"}`}
                      className="flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-[#171717]">
                          {item.name}
                        </p>

                        <p className="mt-0.5 text-[11px] text-black/40">
                          x{item.quantity}
                          {item.selectedSize
                            ? ` • ${item.selectedSize}`
                            : ""}
                        </p>

                      </div>

                      <p className="shrink-0 text-sm font-bold text-[#171717]">
                        {formatPrice(
                          item.price *
                            item.quantity
                        )}
                      </p>

                    </div>
                  ))}

                </div>

                <div className="mt-4 flex items-center justify-between border-t border-black/[0.06] pt-4">

                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-black/40">
                    Subtotal
                  </span>

                  <span className="text-xl font-extrabold text-[#F26A21]">
                    {formatPrice(subtotal)}
                  </span>

                </div>

              </div>

            </div>

            {/* Checkout Footer */}

            <div className="shrink-0 border-t border-black/[0.08] bg-white px-5 py-5 sm:px-7">

              <p className="mb-4 text-center text-[10px] leading-5 text-black/40">
                Delivery fee and final total will
                be confirmed by Rhennie Tasty Shack
                before payment.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="
                  flex
                  min-h-[54px]
                  w-full
                  items-center
                  justify-center
                  rounded-full
                  bg-[#F26A21]
                  px-5
                  text-sm
                  font-bold
                  text-white
                  shadow-[0_10px_25px_rgba(242,106,33,0.18)]
                  transition-all
                  hover:-translate-y-1
                  hover:bg-[#D95512]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {submitting
                  ? "Opening WhatsApp..."
                  : "Send Order on WhatsApp"}

                {!submitting && (
                  <span className="ml-2 text-lg">
                    →
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={closeCheckout}
                className="mt-2 w-full py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-black/35 transition-colors hover:text-[#F26A21]"
              >
                Back to Cart
              </button>

            </div>

          </form>
        ) : (
          /* =================================================
             CART VIEW
          ================================================= */

          <>
            {/* Items */}

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">

              {items.length === 0 ? (
                <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">

                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF1E9] text-3xl">
                    🛒
                  </div>

                  <h3 className="mt-6 font-serif text-2xl font-bold text-[#171717]">
                    Your cart is empty
                  </h3>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-black/50">
                    Explore our menu and add
                    something delicious to your
                    order.
                  </p>

                  <button
                    type="button"
                    onClick={closeCart}
                    className="
                      mt-6
                      rounded-full
                      bg-[#F26A21]
                      px-7
                      py-3
                      text-sm
                      font-bold
                      text-white
                      transition-all
                      hover:-translate-y-0.5
                      hover:bg-[#D95512]
                    "
                  >
                    Explore Menu
                  </button>

                </div>
              ) : (
                <div className="space-y-4">

                  {items.map((item) => (
                    <div
                      key={`${item.id}-${item.selectedSize || "standard"}`}
                      className="
                        rounded-[22px]
                        border
                        border-black/[0.08]
                        bg-white
                        p-4
                        shadow-sm
                      "
                    >

                      {/* Item information */}

                      <div className="flex items-start justify-between gap-4">

                        <div className="min-w-0">

                          <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#F26A21]">
                            {item.collection}
                          </p>

                          <h3 className="mt-1 font-serif text-lg font-bold leading-tight text-[#171717]">
                            {item.name}
                          </h3>

                          {item.selectedSize && (
                            <p className="mt-1 text-xs font-semibold text-black/45">
                              Size:{" "}
                              <span className="text-[#F26A21]">
                                {item.selectedSize}
                              </span>
                            </p>
                          )}

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(
                              item.id,
                              item.selectedSize
                            )
                          }
                          className="
                            shrink-0
                            text-xs
                            font-bold
                            uppercase
                            tracking-wider
                            text-black/30
                            transition-colors
                            hover:text-red-500
                          "
                        >
                          Remove
                        </button>

                      </div>

                      {/* Price and quantity */}

                      <div className="mt-4 flex items-center justify-between border-t border-black/[0.06] pt-4">

                        <div>

                          <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-black/30">
                            Unit Price
                          </p>

                          <p className="mt-1 text-base font-extrabold text-[#F26A21]">
                            {formatPrice(item.price)}
                          </p>

                        </div>

                        <div className="flex items-center rounded-full border border-black/10 bg-[#F8F6F2] p-1">

                          <button
                            type="button"
                            aria-label={`Decrease ${item.name} quantity`}
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity - 1,
                                item.selectedSize
                              )
                            }
                            className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-full
                              text-lg
                              font-bold
                              text-black/60
                              transition-all
                              hover:bg-[#F26A21]
                              hover:text-white
                            "
                          >
                            −
                          </button>

                          <span className="flex min-w-[32px] justify-center text-sm font-extrabold text-[#171717]">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            aria-label={`Increase ${item.name} quantity`}
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity + 1,
                                item.selectedSize
                              )
                            }
                            className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-full
                              text-lg
                              font-bold
                              text-black/60
                              transition-all
                              hover:bg-[#F26A21]
                              hover:text-white
                            "
                          >
                            +
                          </button>

                        </div>

                      </div>

                      {/* Item total */}

                      <div className="mt-3 flex justify-end">

                        <p className="text-sm font-extrabold text-[#171717]">
                          {formatPrice(
                            item.price *
                              item.quantity
                          )}
                        </p>

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </div>

            {/* =================================================
                CART FOOTER
            ================================================== */}

            {items.length > 0 && (
              <div className="shrink-0 border-t border-black/[0.08] bg-white px-5 py-5 sm:px-7">

                <div className="flex items-center justify-between">

                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-black/40">
                    Subtotal
                  </span>

                  <span className="text-2xl font-extrabold tracking-tight text-[#F26A21]">
                    {formatPrice(subtotal)}
                  </span>

                </div>

                <p className="mt-2 text-[11px] leading-5 text-black/40">
                  Delivery fee and final order
                  details will be confirmed at
                  checkout.
                </p>

                <button
                  type="button"
                  onClick={openCheckout}
                  className="
                    mt-5
                    flex
                    min-h-[52px]
                    w-full
                    items-center
                    justify-center
                    rounded-full
                    bg-[#F26A21]
                    px-5
                    text-sm
                    font-bold
                    text-white
                    shadow-[0_10px_25px_rgba(242,106,33,0.18)]
                    transition-all
                    hover:-translate-y-1
                    hover:bg-[#D95512]
                  "
                >
                  Proceed to Checkout

                  <span className="ml-2">
                    →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={clearCart}
                  className="
                    mt-3
                    w-full
                    py-2
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-black/35
                    transition-colors
                    hover:text-red-500
                  "
                >
                  Clear Cart
                </button>

              </div>
            )}

          </>
        )}
      </aside>
    </>
  );
}