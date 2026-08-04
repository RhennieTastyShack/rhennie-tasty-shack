const collections = [
  {
    icon: "👑",
    title: "Signature Feast Collection",
    description: "Chef-curated premium meals for every craving.",
    meals: "10 Premium Meals",
  },
  {
    icon: "🍽️",
    title: "Build Your Plate",
    description: "Create your own perfect meal.",
    meals: "Unlimited Combinations",
  },
  {
    icon: "🍱",
    title: "Executive Lunch Collection",
    description: "Premium lunch packs for work and business.",
    meals: "8 Lunch Specials",
  },
  {
    icon: "🌅",
    title: "Sunrise Collection",
    description: "Delicious breakfast served fresh every morning.",
    meals: "Breakfast Menu",
  },
  {
    icon: "🌯",
    title: "Street Kitchen",
    description: "Shawarma, wraps and quick bites.",
    meals: "Quick Meals",
  },
  {
    icon: "🔥",
    title: "Grill House",
    description: "Freshly grilled chicken and seafood.",
    meals: "Grilled Specials",
  },
  {
    icon: "🍲",
    title: "Grand Pot Collection",
    description: "Family pots perfect for sharing and celebrations.",
    meals: "1L & 2.5L Pots",
  },
  {
    icon: "🎁",
    title: "Luxury Food Boxes",
    description: "Beautifully packaged premium food boxes.",
    meals: "Luxury Packages",
  },
];

export default function CollectionCard() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

          {collections.map((collection) => (
            <div
              key={collection.title}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-yellow-500 transition duration-300 hover:-translate-y-2"
            >
              <div className="text-5xl mb-6">{collection.icon}</div>

              <h3 className="text-2xl font-bold mb-3">
                {collection.title}
              </h3>

              <p className="text-gray-400 mb-6">
                {collection.description}
              </p>

              <span className="inline-block text-yellow-500 font-semibold mb-6">
                {collection.meals}
              </span>

              <button className="w-full bg-yellow-500 text-black py-3 rounded-xl font-bold hover:bg-yellow-400 transition">
                Explore Collection
              </button>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}