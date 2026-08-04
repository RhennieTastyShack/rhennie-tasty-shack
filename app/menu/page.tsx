import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import MenuHero from "../components/menu/MenuHero";
import MenuSearch from "../components/menu/MenuSearch";
import CategoryTabs from "../components/menu/CategoryTabs";
import CollectionCard from "../components/menu/CollectionCard";

export default function MenuPage() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white">
      
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <MenuHero />

      {/* Search */}
      <MenuSearch />

      {/* Category Tabs */}
      <CategoryTabs />

      {/* Menu Collections */}
      <CollectionCard />

      {/* Footer */}
      <Footer />

    </main>
  );
}