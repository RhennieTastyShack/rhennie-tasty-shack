import { Suspense } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import MenuHero from "../components/menu/MenuHero";
import MenuSearch from "../components/menu/MenuSearch";
import CategoryTabs from "../components/menu/CategoryTabs";
import CollectionCard from "../components/menu/CollectionCard";
import MenuGrid from "../components/menu/MenuGrid";

export default function MenuPage() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white">
      <Navbar />

      <MenuHero />

      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-6 py-8 text-center text-[#D4AF37]">
            Loading menu...
          </div>
        }
      >
        <MenuSearch />
        <CategoryTabs />
        <CollectionCard />
        <MenuGrid />
      </Suspense>

      <Footer />
    </main>
  );
}