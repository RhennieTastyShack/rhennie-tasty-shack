import { Suspense } from "react";
import MenuGrid from "@/app/components/menu/MenuGrid";

export const dynamic = "force-dynamic";

function MenuLoading() {
  return (
    <main className="min-h-screen bg-[#F8F6F2]">
      <section className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-[#F26A21]" />

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-black/40">
            Preparing Our Menu
          </p>

          <p className="mt-2 text-sm text-black/50">
            Please wait while we load our latest meals.
          </p>
        </div>
      </section>
    </main>
  );
}

export default function MenuPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F8F6F2]">
      <Suspense fallback={<MenuLoading />}>
        <MenuGrid />
      </Suspense>
    </main>
  );
}