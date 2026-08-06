"use client";

const categories = [
  {
    title: "Signature Meals",
    description: "Our premium à la carte meals and chef specials.",
  },
  {
    title: "Food Boxes",
    description: "Luxury food trays and curated food boxes.",
  },
  {
    title: "Party by the Litre",
    description: "Perfect for weddings, birthdays and large gatherings.",
  },
  {
    title: "Celebration Packages",
    description: "Complete catering for birthdays, anniversaries and more.",
  },
  {
    title: "Small Chops & Cocktails",
    description: "Finger foods, mocktails and cocktail service.",
  },
  {
    title: "Desserts & Drinks",
    description: "Cakes, desserts, beverages and refreshments.",
  },
];

interface StepFourProps {
  selectedCategories: string[];
  onToggle: (category: string) => void;
}

export default function StepFour({
  selectedCategories,
  onToggle,
}: StepFourProps) {
  return (
    <div className="space-y-8">

      <div>

        <span className="inline-block rounded-full border border-[#D4AF37]/20 bg-[#1A1A1A] px-5 py-2 text-sm uppercase tracking-[0.3em] text-[#D4AF37]">
          Step 4
        </span>

        <h2 className="mt-5 text-4xl font-bold text-white">
          What would you like us to prepare?
        </h2>

        <p className="mt-4 max-w-2xl leading-8 text-[#B8B8B8]">
          Select one or more categories. Our culinary team will recommend
          suitable menu options and prepare a personalised quotation.
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        {categories.map((category) => {
          const selected = selectedCategories.includes(category.title);

          return (
            <button
              key={category.title}
              type="button"
              onClick={() => onToggle(category.title)}
              className={`rounded-[24px] border p-8 text-left transition duration-300 ${
                selected
                  ? "border-[#D4AF37] bg-[#D4AF37]/10"
                  : "border-[#D4AF37]/10 bg-[#171717] hover:border-[#D4AF37]"
              }`}
            >
              <div className="flex items-start justify-between">

                <div>

                  <h3 className="text-2xl font-bold text-white">
                    {category.title}
                  </h3>

                  <p className="mt-4 leading-7 text-[#B8B8B8]">
                    {category.description}
                  </p>

                </div>

                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    selected
                      ? "bg-[#D4AF37] text-black"
                      : "border border-[#555] text-[#888]"
                  }`}
                >
                  {selected ? "✓" : "+"}
                </div>

              </div>

            </button>
          );
        })}

      </div>

    </div>
  );
}