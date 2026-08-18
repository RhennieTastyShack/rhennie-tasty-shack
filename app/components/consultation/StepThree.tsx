"use client";

import { StepProps } from "./types";

export default function StepThree({
  data,
  updateField,
}: StepProps) {
  return (
    <div className="space-y-10">

      <div>

        <span className="inline-block rounded-full border border-[#D4AF37]/20 bg-[#171717] px-5 py-2 text-sm uppercase tracking-[0.3em] text-[#D4AF37]">
          Step 3
        </span>

        <h2 className="mt-5 text-4xl font-bold text-white">
          Event Details
        </h2>

        <p className="mt-4 max-w-2xl leading-8 text-[#B8B8B8]">
          Tell us when and where your event will take place so we can
          plan everything perfectly.
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <div>

          <label className="mb-3 block text-sm font-medium text-[#D4AF37]">
            Event Date
          </label>

          <input
            type="date"
            value={data.eventDate}
            onChange={(e) =>
              updateField("eventDate", e.target.value)
            }
            className="w-full rounded-2xl border border-[#D4AF37]/15 bg-[#111111] px-6 py-4 text-white outline-none focus:border-[#D4AF37]"
          />

        </div>

        <div>

          <label className="mb-3 block text-sm font-medium text-[#D4AF37]">
            Event Time
          </label>

          <input
            type="time"
            value={data.eventTime}
            onChange={(e) =>
              updateField("eventTime", e.target.value)
            }
            className="w-full rounded-2xl border border-[#D4AF37]/15 bg-[#111111] px-6 py-4 text-white outline-none focus:border-[#D4AF37]"
          />

        </div>

        <div>

          <label className="mb-3 block text-sm font-medium text-[#D4AF37]">
            Number of Guests
          </label>

          <input
            type="number"
            value={data.guestCount}
            onChange={(e) =>
              updateField("guestCount", e.target.value)
            }
            placeholder="e.g. 150"
            className="w-full rounded-2xl border border-[#D4AF37]/15 bg-[#111111] px-6 py-4 text-white outline-none focus:border-[#D4AF37]"
          />

        </div>

        <div>

          <label className="mb-3 block text-sm font-medium text-[#D4AF37]">
            Budget
          </label>

          <input
            type="text"
            value={data.budget}
            onChange={(e) =>
              updateField("budget", e.target.value)
            }
            placeholder="₦500,000"
            className="w-full rounded-2xl border border-[#D4AF37]/15 bg-[#111111] px-6 py-4 text-white outline-none focus:border-[#D4AF37]"
          />

        </div>

        <div className="md:col-span-2">

          <label className="mb-3 block text-sm font-medium text-[#D4AF37]">
            Event Venue
          </label>

          <input
            type="text"
            value={data.venue}
            onChange={(e) =>
              updateField("venue", e.target.value)
            }
            placeholder="Enter the event location"
            className="w-full rounded-2xl border border-[#D4AF37]/15 bg-[#111111] px-6 py-4 text-white outline-none focus:border-[#D4AF37]"
          />

        </div>

      </div>

    </div>
  );
}