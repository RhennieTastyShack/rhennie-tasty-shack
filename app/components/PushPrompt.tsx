"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { supabase } from "@/lib/supabase";

const DISMISS_KEY = "rts-push-prompt-dismissed";
const PROMPT_PATHS = [
  "/checkout/success",
  "/client-portal/orders",
  "/client-portal/notifications",
  "/orders",
];

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export default function PushPrompt() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSignedIn(Boolean(data.session));
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!signedIn) {
      setVisible(false);
      return;
    }
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      return;
    }
    if (Notification.permission === "granted") return;
    if (Notification.permission === "denied") return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;
    if (!PROMPT_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
      return;
    }
    // Soft delay so we never interrupt first paint / first site visit landing.
    const timer = window.setTimeout(() => setVisible(true), 1200);
    return () => window.clearTimeout(timer);
  }, [pathname, signedIn]);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  async function enable() {
    if (busy) return;
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        dismiss();
        return;
      }

      const keyRes = await fetch("/api/push/subscribe", { cache: "no-store" });
      const keyJson = await keyRes.json();
      if (!keyRes.ok || !keyJson?.publicKey) {
        dismiss();
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyJson.publicKey),
      });

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        dismiss();
        return;
      }

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(subscription.toJSON()),
      });

      dismiss();
    } catch {
      dismiss();
    } finally {
      setBusy(false);
    }
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Turn on order notifications"
      className="fixed inset-x-3 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] z-[80] mx-auto max-w-md rounded-2xl border border-black/10 bg-white p-4 shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:left-auto"
    >
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFF7F2] text-[#F26A21]">
          <Bell size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#171717]">Stay updated on your order</p>
          <p className="mt-1 text-xs leading-5 text-black/60">
            Turn on notifications to receive order and delivery updates.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void enable()}
              className="rounded-full bg-[#F26A21] px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
            >
              {busy ? "Enabling…" : "Turn On Notifications"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={dismiss}
              className="rounded-full border border-black/15 px-4 py-2 text-xs font-medium text-black/65"
            >
              Not Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
