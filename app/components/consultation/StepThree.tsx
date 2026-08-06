"use client";

interface StepThreeProps {
  eventDate: string;
  eventTime: string;
  guestCount: string;
  venue: string;
  budget: string;
  onChange: (
    field:
      | "eventDate"
      | "eventTime"
      | "guestCount"
      | "venue"
      | "budget",
    value: string
  ) => void;
}

const budgets = [
  "Below ₦250,000",
  "₦250,000 - ₦500,000",
  "₦500,000 - ₦1,000,000",
  "₦1,000,000 - ₦2,500,000",
  "Above ₦2,500,000",
];

export default function StepThree({
  eventDate,
  eventTime,
  guestCount,
  venue,
  budget,
  onChange,
}: StepThreeProps) {
  return (
    <div className="space-y-8">

      <div>

        <span className="inline-block rounded-full border border-[#D4AF37]/20 bg-[#1A1A1A] px-5 py-2 text-sm uppercase tracking-[0.3em] text-[#D4AF37]">
          Step 3
        </span>

        <h2 className="mt-5 text-4xl font-bold text-white">
          Tell us about your event
        </h2>

        <p className="mt-4 max-w-2xl leading-8 text-[#B8B8B8]">
          These details help us prepare a personalised catering proposal
          and recommend the right menu for your event.
        </p>

      </div>

      <div className="grid gap-8 md:grid-cols-2">

        <div>

          <label className="mb-3 block text-sm font-medium text-[#D4AF37]">
            Event Date
          </label>

          <input
            type="date"
            value={eventDate}
            onChange={(e) =>
              onChange("eventDate", e.target.value)
            }
            className="w-full rounded-2xl border border-[#D4AF37]/15 bg-[#111111] px-6 py-5 text-white outline-none focus:border-[#D4AF37]"
          />

        </div>

        <div>

          <label className="mb-3 block text-sm font-medium text-[#D4AF37]">
            Preferred Time
          </label>

          <input
            type="time"
            value={eventTime}
            onChange={(e) =>
              onChange("eventTime", e.target.value)
            }
            className="w-full rounded-2xl border border-[#D4AF37]/15 bg-[#111111] px-6 py-5 text-white outline-none focus:border-[#D4AF37]"
          />

        </div>

        <div>

          <label className="mb-3 block text-sm font-medium text-[#D4AF37]">
            Number of Guests
          </label>

          <input
            type="number"
            min="1"
            value={guestCount}
            onChange={(e) =>
              onChange("guestCount", e.target.value)
            }
            placeholder="e.g. 150"
            className="w-full rounded-2xl border border-[#D4AF37]/15 bg-[#111111] px-6 py-5 text-white outline-none focus:border-[#D4AF37]"
          />

        </div>

        <div>

          <label className="mb-3 block text-sm font-medium text-[#D4AF37]">
            Venue
          </label>

          <input
            type="text"
            value={venue}
            onChange={(e) =>
              onChange("venue", e.target.value)
            }
            placeholder="Event location"
            className="w-full rounded-2xl border border-[#D4AF37]/15 bg-[#111111] px-6 py-5 text-white outline-none focus:border-[#D4AF37]"
          />

        </div>

      </div>

      <div>

        <label className="mb-4 block text-sm font-medium text-[#D4AF37]">
          Estimated Budget
        </label>

        <div className="grid gap-4 md:grid-cols-2">

          {budgets.map((item) => {

            const selected = budget === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => onChange("budget", item)}
                className={`rounded-2xl border px-6 py-5 text-left transition ${
                  selected
                    ? "border-[#D4AF37] bg-[#D4AF37]/10"
                    : "border-[#D4AF37]/10 bg-[#171717] hover:border-[#D4AF37]"
                }`}
              >
                {item}
              </button>
            );
          })}

        </div>

      </div>

    </div>
  );
}