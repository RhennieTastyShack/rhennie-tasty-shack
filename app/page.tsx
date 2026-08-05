import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FoodBoxes from "./components/FoodBoxes";
import FoodByLitre from "./components/FoodByLitre";
import Gallery from "./components/Gallery";
import Footer from "./components/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white">
      <Navbar />

      <Hero />

      <FoodBoxes />

      <FoodByLitre />

      <Gallery />

      <Footer />
    </main>
  );
}