const tabs = [
  "👑 Signature Feast",
  "🍽️ Build Your Plate",
  "🍱 Executive Lunch",
  "🌅 Breakfast",
  "🌯 Street Kitchen",
  "🔥 Grill House",
  "🍲 Grand Pot Collection",
  "🎁 Food Boxes",
];

export default function CategoryTabs() {
  return (
    <section className="py-8">

      <div className="max-w-7xl mx-auto px-6 flex gap-4 overflow-x-auto">

        {tabs.map((tab) => (

          <button
            key={tab}
            className="whitespace-nowrap rounded-full border border-yellow-500 px-6 py-3 hover:bg-yellow-500 hover:text-black transition"
          >
            {tab}
          </button>

        ))}

      </div>

    </section>
  );
}