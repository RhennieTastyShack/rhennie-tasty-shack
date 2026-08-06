"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0B0B0B] text-white">
      <p>Verifying your account...</p>
    </main>
  );
}