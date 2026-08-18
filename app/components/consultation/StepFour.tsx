"use client";

import { StepProps } from "./types";
import { MENU_CATEGORIES } from "./constants";

export default function StepFour({
  data,
  updateField,
}: StepProps) {
  function toggleCategory(category: string) {
    const updated = data.selectedCategories.includes(category)
      ? data.selectedCategories.filter((item) => item !== category)
      : [...data.selectedCategories, category];

    updateField("selectedCategories", updated);
  }

  return (
    <div className="space-y-10">

      <div>

        <span className="inline-block rounded-full border border-[#D4AF37]/20 bg-[#171717] px-5 py-2 text-sm uppercase tracking-[0.3em] text-[#D4AF37]">
          Step 4
        </span>

        <h2 className="mt-5 text-4xl font-bold text-white">
          Preferred Menu Categories
        </h2>

        <p className="mt-4 max-w-2xl leading-8 text-[#B8B8B8]">
          Select the food categories you're interested in.
          You can choose multiple options.
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        {MENU_CATEGORIES.map((category) => {

          const selected =
            data.selectedCategories.includes(category);

          return (

            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              className={`rounded-3xl border p-8 text-left transition-all duration-300 ${
                selected
                  ? "border-[#D4AF37] bg-[#D4AF37]/10"
                  : "border-[#D4AF37]/10 bg-[#171717] hover:border-[#D4AF37]"
              }`}
            >

              <div className="flex items-center justify-between">

                <h3 className="text-xl font-semibold text-white">
                  {category}
                </h3>

                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    selected
                      ? "bg-[#D4AF37] text-black"
                      : "border border-[#555] text-[#777]"
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