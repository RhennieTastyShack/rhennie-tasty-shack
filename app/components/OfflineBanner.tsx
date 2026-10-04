"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-[9990] border-b border-[#F26A21]/25 bg-[#FFF7F2] px-4 py-3 text-center text-sm text-[#171717] sm:top-[calc(4.5rem+env(safe-area-inset-top,0px))] lg:top-[calc(5.25rem+env(safe-area-inset-top,0px))]"
    >
      <p className="inline-flex items-center justify-center gap-2 font-semibold">
        <WifiOff size={16} className="text-[#F26A21]" />
        You’re currently offline.
      </p>
      <p className="mt-1 text-xs text-black/60">
        Some RTS features require an internet connection. Reconnect and try again.
      </p>
    </div>
  );
}
