"use client";

import { StepProps } from "./types";

export default function StepSix({
  data,
}: StepProps) {
  return (
    <div className="space-y-10">

      <div>

        <span className="inline-block rounded-full border border-[#F26A21]/20 bg-[#171717] px-5 py-2 text-sm uppercase tracking-[0.3em] text-[#F26A21]">
          Step 6
        </span>

        <h2 className="mt-5 text-4xl font-bold text-white">
          Review Your Consultation
        </h2>

        <p className="mt-4 max-w-2xl leading-8 text-[#B8B8B8]">
          Please review your details before submitting your consultation.
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <SummaryCard
          title="Personal Information"
          items={[
            ["Full Name", data.fullName],
            ["Email", data.email],
            ["Phone", data.phone],
          ]}
        />

        <SummaryCard
          title="Event"
          items={[
            ["Type", data.eventType],
            ["Date", data.eventDate],
            ["Time", data.eventTime],
          ]}
        />

        <SummaryCard
          title="Event Details"
          items={[
            ["Guests", data.guestCount],
            ["Venue", data.venue],
            ["Budget", data.budget],
          ]}
        />

        <SummaryCard
          title="Menu"
          items={[
            [
              "Categories",
              data.selectedCategories.length
                ? data.selectedCategories.join(", ")
                : "None selected",
            ],
          ]}
        />

        <SummaryCard
          title="Services"
          items={[
            [
              "Selected",
              data.selectedServices.length
                ? data.selectedServices.join(", ")
                : "None selected",
            ],
          ]}
        />

      </div>

      <div className="rounded-3xl border border-[#F26A21]/10 bg-[#171717] p-8">

        <h3 className="mb-4 text-2xl font-semibold text-white">
          Special Requests
        </h3>

        <p className="leading-8 text-[#B8B8B8]">
          {data.specialRequest || "No special requests provided."}
        </p>

      </div>

    </div>
  );
}

interface SummaryCardProps {
  title: string;
  items: [string, string][];
}

function SummaryCard({
  title,
  items,
}: SummaryCardProps) {
  return (
    <div className="rounded-3xl border border-[#F26A21]/10 bg-[#171717] p-8">

      <h3 className="mb-6 text-2xl font-semibold text-white">
        {title}
      </h3>

      <div className="space-y-4">

        {items.map(([label, value]) => (
          <div
            key={label}
            className="flex items-start justify-between gap-4 border-b border-[#2A2A2A] pb-3"
          >
            <span className="text-[#888]">
              {label}
            </span>

            <span className="text-right text-white">
              {value || "-"}
            </span>
          </div>
        ))}

      </div>

    </div>
  );
}