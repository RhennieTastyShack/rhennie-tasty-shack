"use client";

const services = [
  {
    title: "Professional Servers",
    description: "Experienced servers for a seamless dining experience.",
  },
  {
    title: "Buffet Setup",
    description: "Complete buffet arrangement and presentation.",
  },
  {
    title: "Live Cooking Station",
    description: "Interactive live cooking by our chefs.",
  },
  {
    title: "Drinks Service",
    description: "Cocktails, mocktails and beverage service.",
  },
  {
    title: "Dessert Table",
    description: "Luxury dessert display for your guests.",
  },
  {
    title: "Cake & Celebration Package",
    description: "Birthday, anniversary and celebration cakes.",
  },
];

interface StepFiveProps {
  selectedServices: string[];
  specialRequest: string;
  onToggle: (service: string) => void;
  onRequestChange: (value: string) => void;
}

export default function StepFive({
  selectedServices,
  specialRequest,
  onToggle,
  onRequestChange,
}: StepFiveProps) {
  return (
    <div className="space-y-10">

      <div>

        <span className="inline-block rounded-full border border-[#D4AF37]/20 bg-[#1A1A1A] px-5 py-2 text-sm uppercase tracking-[0.3em] text-[#D4AF37]">
          Step 5
        </span>

        <h2 className="mt-5 text-4xl font-bold text-white">
          Additional Services
        </h2>

        <p className="mt-4 max-w-2xl leading-8 text-[#B8B8B8]">
          Select any additional services you'd like us to include with
          your event. You can also tell us about any special requests.
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        {services.map((service) => {
          const selected = selectedServices.includes(service.title);

          return (
            <button
              key={service.title}
              type="button"
              onClick={() => onToggle(service.title)}
              className={`rounded-[24px] border p-8 text-left transition ${
                selected
                  ? "border-[#D4AF37] bg-[#D4AF37]/10"
                  : "border-[#D4AF37]/10 bg-[#171717] hover:border-[#D4AF37]"
              }`}
            >
              <div className="flex justify-between">

                <div>

                  <h3 className="text-2xl font-bold text-white">
                    {service.title}
                  </h3>

                  <p className="mt-4 leading-7 text-[#B8B8B8]">
                    {service.description}
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

      <div>

        <label className="mb-3 block text-sm font-medium text-[#D4AF37]">
          Special Requests
        </label>

        <textarea
          rows={6}
          value={specialRequest}
          onChange={(e) => onRequestChange(e.target.value)}
          placeholder="Tell us anything else you'd like us to know..."
          className="w-full rounded-2xl border border-[#D4AF37]/15 bg-[#111111] px-6 py-5 text-white outline-none focus:border-[#D4AF37]"
        />

      </div>

    </div>
  );
}