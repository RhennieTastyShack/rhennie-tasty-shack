"use client";

import { useState } from "react";

const steps = [
  "About You",
  "Your Event",
  "Guests",
  "Menu",
  "Services",
  "Review",
];

export default function StartConsultationPage() {
  const [step, setStep] = useState(1);

  return (
    <main className="mx-auto max-w-5xl space-y-10">

      {/* Header */}

      <section className="rounded-[32px] border border-[#D4AF37]/20 bg-gradient-to-r from-[#171717] to-[#101010] p-10">

        <span className="uppercase tracking-[0.3em] text-sm text-[#D4AF37]">
          Event Concierge
        </span>

        <h1 className="mt-5 text-5xl font-bold text-white">
          Luxury Consultation
        </h1>

        <p className="mt-5 text-lg text-[#B8B8B8]">
          We'll guide you through a few simple steps to create the perfect catering experience.
        </p>

      </section>

      {/* Progress */}

      <section>

        <div className="mb-6 flex justify-between text-sm text-[#B8B8B8]">

          {steps.map((title, index) => (

            <div
              key={title}
              className={`text-center ${
                step >= index + 1
                  ? "text-[#D4AF37]"
                  : ""
              }`}
            >
              {title}
            </div>

          ))}

        </div>

        <div className="h-2 overflow-hidden rounded-full bg-[#222]">

          <div
            className="h-full bg-[#D4AF37] transition-all duration-500"
            style={{
              width: `${(step / steps.length) * 100}%`,
            }}
          />

        </div>

      </section>

      {/* Step Card */}

      <section className="rounded-[32px] border border-[#D4AF37]/10 bg-[#171717] p-10">

        <h2 className="text-3xl font-bold text-white">
          Step {step}
        </h2>

        <p className="mt-3 text-[#B8B8B8]">
          {steps[step - 1]}
        </p>

        <div className="mt-10">

          {step === 1 && (

            <div className="space-y-6">

              <input
                type="text"
                placeholder="Full Name"
                className="w-full rounded-xl border border-[#D4AF37]/20 bg-[#111111] px-5 py-4 text-white outline-none"
              />

              <input
                type="email"
                placeholder="Email Address"
                className="w-full rounded-xl border border-[#D4AF37]/20 bg-[#111111] px-5 py-4 text-white outline-none"
              />

              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full rounded-xl border border-[#D4AF37]/20 bg-[#111111] px-5 py-4 text-white outline-none"
              />

            </div>

          )}

          {step > 1 && (

            <div className="rounded-2xl bg-[#111111] p-10 text-center text-[#B8B8B8]">
              Step {step} content will be added next.
            </div>

          )}

        </div>

      </section>

      {/* Buttons */}

      <section className="flex justify-between">

        <button
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="rounded-full border border-[#D4AF37] px-8 py-3 text-[#D4AF37]"
        >
          Previous
        </button>

        <button
          onClick={() => setStep((s) => Math.min(6, s + 1))}
          className="rounded-full bg-[#D4AF37] px-8 py-3 font-semibold text-black"
        >
          {step === 6 ? "Finish" : "Next"}
        </button>

      </section>

    </main>
  );
}