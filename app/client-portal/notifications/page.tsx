"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { supabase } from "@/lib/supabase";

type NotificationRow = {
  id: string;
  title: string;
  message: string;
  type: string | null;
  event: string | null;
  is_read: boolean | null;
  created_at: string;
};

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function getToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  async function load() {
    const token = await getToken();

    if (!token) {
      router.replace(
        `/login?next=${encodeURIComponent("/client-portal/notifications")}`
      );
      return;
    }

    const statusRes = await fetch("/api/auth/verification-status", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const statusJson = await statusRes.json();

    if (!statusJson?.fully_verified) {
      router.replace(
        `/verify-phone?next=${encodeURIComponent("/client-portal/notifications")}`
      );
      return;
    }

    const response = await fetch("/api/notifications", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const result = await response.json();

    if (!response.ok || !result?.success) {
      setError(result?.message || "Unable to load notifications.");
      setItems([]);
    } else {
      setError("");
      setItems(result.notifications || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function markRead(id: string) {
    const token = await getToken();
    if (!token) return;

    await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ notification_id: id }),
    });

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_read: true } : item
      )
    );
  }

  async function markAllRead() {
    setBusy(true);
    const token = await getToken();
    if (!token) {
      setBusy(false);
      return;
    }

    await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ mark_all_read: true }),
    });

    setItems((prev) => prev.map((item) => ({ ...item, is_read: true })));
    setBusy(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B]">
        <Loader2 className="animate-spin text-[#D4AF37]" size={36} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0B0B] px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
              Client portal
            </p>
            <h1 className="mt-2 text-4xl font-bold">Notifications</h1>
            <p className="mt-2 text-sm text-white/50">
              Order, delivery, and account updates in one place.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={markAllRead}
              disabled={busy || items.every((i) => i.is_read)}
              className="rounded-full border border-[#D4AF37]/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#D4AF37] disabled:opacity-40"
            >
              Mark all read
            </button>
            <Link
              href="/client-portal"
              className="rounded-full bg-[#D4AF37] px-4 py-2 text-xs font-bold uppercase tracking-wider text-black"
            >
              Portal home
            </Link>
          </div>
        </div>

        {error && (
          <p className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {items.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-[#111111] p-10 text-center">
            <p className="text-white/50">No notifications yet.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (!item.is_read) void markRead(item.id);
                }}
                className={`w-full rounded-2xl border p-5 text-left transition ${
                  item.is_read
                    ? "border-white/10 bg-[#111111]"
                    : "border-[#D4AF37]/35 bg-[#D4AF37]/5"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/55">
                      {item.message}
                    </p>
                    <p className="mt-3 text-[11px] uppercase tracking-wider text-white/30">
                      {formatWhen(item.created_at)}
                      {item.event ? ` · ${item.event}` : ""}
                    </p>
                  </div>
                  {!item.is_read && (
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#D4AF37]" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
