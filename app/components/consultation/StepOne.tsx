"use client";

interface StepOneProps {
  fullName: string;
  email: string;
  phone: string;
  onChange: (
    field: "fullName" | "email" | "phone",
    value: string
  ) => void;
}

export default function StepOne({
  fullName,
  email,
  phone,
  onChange,
}: StepOneProps) {
  return (
    <div className="space-y-8">

      {/* Welcome */}

      <div>

        <span className="inline-block rounded-full border border-[#D4AF37]/20 bg-[#1A1A1A] px-5 py-2 text-sm uppercase tracking-[0.3em] text-[#D4AF37]">
          Step 1
        </span>

        <h2 className="mt-5 text-4xl font-bold text-white">
          Tell us about yourself
        </h2>

        <p className="mt-4 max-w-2xl leading-8 text-[#B8B8B8]">
          We'll use these details to prepare your quotation
          and keep you updated throughout your Event Concierge
          experience.
        </p>

      </div>

      {/* Form */}

      <div className="grid gap-8">

        <div>

          <label className="mb-3 block text-sm font-medium text-[#D4AF37]">
            Full Name
          </label>

          <input
            type="text"
            value={fullName}
            onChange={(e) =>
              onChange("fullName", e.target.value)
            }
            placeholder="Enter your full name"
            className="w-full rounded-2xl border border-[#D4AF37]/15 bg-[#111111] px-6 py-5 text-white outline-none transition focus:border-[#D4AF37]"
          />

        </div>

        <div>

          <label className="mb-3 block text-sm font-medium text-[#D4AF37]">
            Email Address
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              onChange("email", e.target.value)
            }
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-[#D4AF37]/15 bg-[#111111] px-6 py-5 text-white outline-none transition focus:border-[#D4AF37]"
          />

        </div>

        <div>

          <label className="mb-3 block text-sm font-medium text-[#D4AF37]">
            Phone Number
          </label>

          <input
            type="tel"
            value={phone}
            onChange={(e) =>
              onChange("phone", e.target.value)
            }
            placeholder="+234..."
            className="w-full rounded-2xl border border-[#D4AF37]/15 bg-[#111111] px-6 py-5 text-white outline-none transition focus:border-[#D4AF37]"
          />

        </div>

      </div>

    </div>
  );
}