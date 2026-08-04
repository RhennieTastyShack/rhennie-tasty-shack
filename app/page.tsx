import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import FeaturedMeals from "./components/FeaturedMeals";
import ChefSpecial from "./components/ChefSpecial";
import FoodBoxes from "./components/FoodBoxes";
import FoodByLitre from "./components/FoodByLitre";
import Catering from "./components/Catering";
import WhyChoose from "./components/WhyChoose";
import Subscription from "./components/Subscription";
import Reviews from "./components/Reviews";
import Gallery from "./components/Gallery";
import FAQ from "./components/FAQ";
import WhatsAppButton from "./components/WhatsAppButton";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white">
      <Navbar />

      <Hero />

      <Stats />

      <FeaturedMeals />

      <ChefSpecial />

      <FoodBoxes />

      <FoodByLitre />

      <Catering />

      <WhyChoose />

      <Subscription />

      <Reviews />

      <Gallery />

      <FAQ />

      <WhatsAppButton />

      <Footer />
    </main>
  );
}