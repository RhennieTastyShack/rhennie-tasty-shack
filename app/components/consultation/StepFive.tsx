"use client";

import { StepProps } from "./types";
import { EXTRA_SERVICES } from "./constants";

export default function StepFive({
  data,
  updateField,
}: StepProps) {
  function toggleService(service: string) {
    const updated = data.selectedServices.includes(service)
      ? data.selectedServices.filter((item) => item !== service)
      : [...data.selectedServices, service];

    updateField("selectedServices", updated);
  }

  return (
    <div className="space-y-10">

      <div>

        <span className="inline-block rounded-full border border-[#D4AF37]/20 bg-[#171717] px-5 py-2 text-sm uppercase tracking-[0.3em] text-[#D4AF37]">
          Step 5
        </span>

        <h2 className="mt-5 text-4xl font-bold text-white">
          Additional Services
        </h2>

        <p className="mt-4 max-w-2xl leading-8 text-[#B8B8B8]">
          Choose any extra services you'd like us to provide during your
          event.
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        {EXTRA_SERVICES.map((service) => {

          const selected =
            data.selectedServices.includes(service);

          return (

            <button
              key={service}
              type="button"
              onClick={() => toggleService(service)}
              className={`rounded-3xl border p-8 text-left transition-all duration-300 ${
                selected
                  ? "border-[#D4AF37] bg-[#D4AF37]/10"
                  : "border-[#D4AF37]/10 bg-[#171717] hover:border-[#D4AF37]"
              }`}
            >

              <div className="flex items-center justify-between">

                <h3 className="text-xl font-semibold text-white">
                  {service}
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

      <div>

        <label className="mb-3 block text-sm font-medium text-[#D4AF37]">
          Special Requests
        </label>

        <textarea
          rows={6}
          value={data.specialRequest}
          onChange={(e) =>
            updateField("specialRequest", e.target.value)
          }
          placeholder="Tell us about dietary requirements, theme, colours, timing or anything else..."
          className="w-full rounded-2xl border border-[#D4AF37]/15 bg-[#111111] px-6 py-5 text-white outline-none focus:border-[#D4AF37]"
        />

      </div>

    </div>
  );
}