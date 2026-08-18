import Hero from "./components/Hero";
import FoodBoxes from "./components/FoodBoxes";
import FoodByLitre from "./components/FoodByLitre";
import Gallery from "./components/Gallery";
import Footer from "./components/Footer";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <FoodBoxes />
      <FoodByLitre />
      <Gallery />
      <Footer />
    </main>
  );
}