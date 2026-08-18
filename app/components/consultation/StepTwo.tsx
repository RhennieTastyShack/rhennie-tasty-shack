"use client";

import { StepProps } from "./types";
import { EVENT_TYPES } from "./constants";

export default function StepTwo({
  data,
  updateField,
}: StepProps) {
  return (
    <div className="space-y-10">

      <div>

        <span className="inline-block rounded-full border border-[#D4AF37]/20 bg-[#171717] px-5 py-2 text-sm uppercase tracking-[0.3em] text-[#D4AF37]">
          Step 2
        </span>

        <h2 className="mt-5 text-4xl font-bold text-white">
          What type of event are you planning?
        </h2>

        <p className="mt-4 max-w-2xl leading-8 text-[#B8B8B8]">
          Choose the event that best describes your occasion.
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        {EVENT_TYPES.map((event) => {
          const selected = data.eventType === event;

          return (
            <button
              key={event}
              type="button"
              onClick={() => updateField("eventType", event)}
              className={`rounded-3xl border p-8 text-left transition ${
                selected
                  ? "border-[#D4AF37] bg-[#D4AF37]/10"
                  : "border-[#D4AF37]/10 bg-[#171717] hover:border-[#D4AF37]"
              }`}
            >
              <div className="flex items-center justify-between">

                <h3 className="text-xl font-semibold text-white">
                  {event}
                </h3>

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