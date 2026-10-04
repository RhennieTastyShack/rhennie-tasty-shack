"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import OrderCard, {
  CustomerOrder,
} from "@/app/components/orders/OrderCard";
import EmptyState from "@/app/components/states/EmptyState";

export default function ClientPortalOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(
    async (opts?: { silent?: boolean }) => {
      try {
        if (!opts?.silent) setLoading(true);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          router.replace(
            `/login?next=${encodeURIComponent("/client-portal/orders")}`
          );
          return;
        }

        const response = await fetch("/api/orders", {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unable to load orders");
        }

        const data = await response.json();
        setOrders(Array.isArray(data) ? data : data?.orders || []);
        setError("");
      } catch (loadError) {
        console.error("Orders loading error:", loadError);
        if (!opts?.silent) {
          setError(
            "We couldn’t load your orders. Check your connection and try again."
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    void loadOrders();

    const pollId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadOrders({ silent: true });
      }
    }, 18000);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void loadOrders({ silent: true });
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(pollId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [loadOrders]);

  return (
    <main className="min-h-screen bg-[#080808] px-6 py-12 text-white md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <span className="inline-block rounded-full border border-[#D4AF37]/30 bg-[#111111] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[#D4AF37]">
            Client Portal
          </span>
          <h1 className="mt-5 text-4xl font-bold md:text-5xl">My Orders</h1>
          <p className="mt-3 text-[#B8B8B8]">
            View and track your current and previous orders with Rhennie Tasty
            Shack.
          </p>
          <Link
            href="/client-portal"
            className="mt-5 inline-block text-sm text-[#D4AF37] hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((key) => (
              <div
                key={key}
                className="h-48 animate-pulse rounded-[28px] border border-white/10 bg-[#111111]"
              />
            ))}
            <p className="flex items-center justify-center gap-2 text-sm text-[#D4AF37]">
              <Loader2 className="animate-spin" size={16} />
              Loading your orders…
            </p>
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-center text-red-200">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void loadOrders()}
              className="mt-4 rounded-full bg-[#D4AF37] px-5 py-2 text-sm font-bold text-black"
            >
              Try again
            </button>
          </div>
        ) : null}

        {!loading && !error && orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="When you place an order, you’ll see the status and tracking details here."
            actionHref="/menu"
            actionLabel="Browse the menu"
            icon={<ShoppingBag size={22} />}
          />
        ) : null}

        {!loading && !error && orders.length > 0 ? (
          <div className="grid gap-5">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} tone="dark" />
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
