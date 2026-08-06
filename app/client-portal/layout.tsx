import type { ReactNode } from "react";

export default function ClientPortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white">
      {children}
    </main>
  );
}