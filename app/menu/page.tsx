import { Suspense } from "react";
import MenuHero from "@/app/components/menu/MenuHero";
import MenuGrid from "@/app/components/menu/MenuGrid";

export const dynamic = "force-dynamic";

function MenuLoading() {
  // Lightweight Suspense fallback for useSearchParams hydration only.
  // MenuGrid owns the real loading UI and clears it once meals arrive.
  return (
    <section className="overflow-x-hidden bg-[#F8F6F2] px-4 py-10 sm:px-6 lg:px-8" aria-busy="true">
      <div className="mx-auto flex min-h-[40vh] max-w-7xl flex-col items-center justify-center text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-[#F26A21]" />
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-black/40">
          Preparing Our Menu
        </p>
        <p className="mt-2 text-sm text-black/50">
          Please wait while we load our latest meals.
        </p>
      </div>
    </section>
  );
}

export default function MenuPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F8F6F2] [overflow-wrap:anywhere]">
      <MenuHero />

      <Suspense fallback={<MenuLoading />}>
        <MenuGrid />
      </Suspense>
    </main>
  );
}
