import Link from "next/link";
import {
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    order?: string;
    reference?: string;
  }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const params = await searchParams;

  const orderId =
    params.order || null;

  const reference =
    params.reference || null;

  return (
    <main className="min-h-screen bg-[#F8F6F2] px-4 py-12 text-[#171717] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[75vh] max-w-2xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-[32px] border border-black/[0.08] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.08)]">
          {/* Top accent */}
          <div className="h-2 w-full bg-[#F26A21]" />

          <div className="px-6 py-12 text-center sm:px-10 sm:py-16">
            {/* Success icon */}

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-50 text-green-600">
              <CheckCircle2
                size={52}
                strokeWidth={1.8}
              />
            </div>

            {/* Brand */}

            <p className="mt-8 text-[9px] font-bold uppercase tracking-[0.35em] text-[#F26A21]">
              Rhennie Tasty Shack
            </p>

            {/* Heading */}

            <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl">
              Order Confirmed!
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-black/50">
              Thank you for ordering from
              Rhennie Tasty Shack. Your
              payment was received
              successfully and your order is
              now being processed.
            </p>

            {/* Order details */}

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

            {/* Customer message */}

            <div className="mx-auto mt-7 max-w-md rounded-2xl bg-[#FFF7F2] px-5 py-4">
              <p className="text-xs leading-6 text-black/55">
                We will contact you using the
                phone number provided during
                checkout with updates about
                your order and delivery.
              </p>
            </div>

            {/* Actions */}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/menu"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#F26A21] px-7 text-sm font-bold text-white shadow-[0_12px_30px_rgba(242,106,33,0.2)] transition-all hover:-translate-y-1 hover:bg-[#D95512]"
              >
                <ShoppingBag
                  size={17}
                  className="mr-2"
                />

                Continue Shopping
              </Link>

              <Link
                href="/"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-black/10 bg-white px-7 text-sm font-bold text-black/60 transition-all hover:border-[#F26A21]/40 hover:text-[#F26A21]"
              >
                Back to Home
              </Link>
            </div>

            {/* Footer */}

            <p className="mt-10 text-[8px] font-bold uppercase tracking-[0.3em] text-black/25">
              Premium Taste

              <span className="mx-3 text-[#F26A21]">
                •
              </span>

              Fast Delivery
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}