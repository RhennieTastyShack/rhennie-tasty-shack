import Hero from "@/app/components/Hero";
import FeaturedMeals from "@/app/components/FeaturedMeals";
import ChefSpecial from "@/app/components/ChefSpecial";
import FoodBoxes from "@/app/components/FoodBoxes";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      {/* Hero */}
      <Hero />

      {/* Featured Meals */}
      <FeaturedMeals />

      {/* Chef's Special */}
      <ChefSpecial />

      {/* Signature Food Boxes */}
      <FoodBoxes />
    </main>
  );
}
