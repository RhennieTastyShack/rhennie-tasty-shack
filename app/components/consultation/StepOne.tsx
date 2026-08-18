"use client";

import { StepProps } from "./types";

export default function StepOne({
  data,
  updateField,
}: StepProps) {
  return (
    <div className="space-y-10">

      <div>

        <span className="inline-block rounded-full border border-[#D4AF37]/20 bg-[#171717] px-5 py-2 text-sm uppercase tracking-[0.3em] text-[#D4AF37]">
          Step 1
        </span>

        <h2 className="mt-5 text-4xl font-bold text-white">
          Tell us about yourself
        </h2>

        <p className="mt-4 max-w-2xl leading-8 text-[#B8B8B8]">
          We need your contact details so our Event Concierge can
          reach you regarding your consultation.
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <div className="md:col-span-2">

          <label className="mb-3 block text-sm font-medium text-[#D4AF37]">
            Full Name
          </label>

          <input
            type="text"
            value={data.fullName}
            onChange={(e) =>
              updateField("fullName", e.target.value)
            }
            placeholder="Enter your full name"
            className="w-full rounded-2xl border border-[#D4AF37]/15 bg-[#111111] px-6 py-4 text-white outline-none focus:border-[#D4AF37]"
          />

        </div>

        <div>

          <label className="mb-3 block text-sm font-medium text-[#D4AF37]">
            Email Address
          </label>

          <input
            type="email"
            value={data.email}
            onChange={(e) =>
              updateField("email", e.target.value)
            }
            placeholder="example@email.com"
            className="w-full rounded-2xl border border-[#D4AF37]/15 bg-[#111111] px-6 py-4 text-white outline-none focus:border-[#D4AF37]"
          />

        </div>

        <div>

          <label className="mb-3 block text-sm font-medium text-[#D4AF37]">
            Phone Number
          </label>

          <input
            type="tel"
            value={data.phone}
            onChange={(e) =>
              updateField("phone", e.target.value)
            }
            placeholder="+234..."
            className="w-full rounded-2xl border border-[#D4AF37]/15 bg-[#111111] px-6 py-4 text-white outline-none focus:border-[#D4AF37]"
          />

        </div>

      </div>

    </div>
  );
}