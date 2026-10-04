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

export default function OrdersPage() {
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
            `/login?next=${encodeURIComponent("/orders")}`
          );
          return;
        }

        const response = await fetch("/api/orders", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        });

        if (response.status === 401) {
          await supabase.auth.signOut();
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load orders.");
        }

        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
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
    <main className="min-h-screen bg-[#F8F6F2] px-4 py-12 text-[#171717] sm:px-6">
      <div className="mx-auto max-w-4xl">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#F26A21]">
          Rhennie Tasty Shack
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold">My Orders</h1>
        <p className="mt-3 text-sm text-black/55">
          Track kitchen progress and Ride with 701 delivery updates in one place.
        </p>
        <Link
          href="/client-portal"
          className="mt-4 inline-block text-sm font-semibold text-[#F26A21]"
        >
          ← Client portal
        </Link>

        {loading ? (
          <div className="mt-10 space-y-4">
            {[1, 2].map((key) => (
              <div
                key={key}
                className="h-44 animate-pulse rounded-[28px] border border-black/5 bg-white"
              />
            ))}
            <p className="flex items-center justify-center gap-2 text-sm text-[#F26A21]">
              <Loader2 className="animate-spin" size={16} />
              Loading your orders…
            </p>
          </div>
        ) : null}

        {!loading && error ? (
          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-red-700">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void loadOrders()}
              className="mt-4 rounded-full bg-[#F26A21] px-5 py-2 text-sm font-bold text-white"
            >
              Try again
            </button>
          </div>
        ) : null}

        {!loading && !error && orders.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="No orders yet"
              description="Browse the menu to place your first order. Your live status will appear here."
              actionHref="/menu"
              actionLabel="Browse the menu"
              icon={<ShoppingBag size={22} />}
            />
          </div>
        ) : null}

        {!loading && !error && orders.length > 0 ? (
          <div className="mt-10 grid gap-5">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} tone="light" />
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
