"use client";

const eventTypes = [
  {
    title: "Wedding",
    icon: "💍",
    description: "Elegant wedding catering",
  },
  {
    title: "Birthday",
    icon: "🎂",
    description: "Celebrate in style",
  },
  {
    title: "Corporate",
    icon: "🏢",
    description: "Meetings & conferences",
  },
  {
    title: "Naming Ceremony",
    icon: "👶",
    description: "Family celebrations",
  },
  {
    title: "Graduation",
    icon: "🎓",
    description: "Celebrate achievements",
  },
  {
    title: "Anniversary",
    icon: "🎉",
    description: "Special moments together",
  },
  {
    title: "Private Dinner",
    icon: "🍷",
    description: "Luxury dining experience",
  },
  {
    title: "Other",
    icon: "✨",
    description: "Tell us your event",
  },
];

interface StepTwoProps {
  selectedEvent: string;
  onSelect: (event: string) => void;
}

export default function StepTwo({
  selectedEvent,
  onSelect,
}: StepTwoProps) {
  return (
    <div className="space-y-8">

      <div>

        <span className="inline-block rounded-full border border-[#D4AF37]/20 bg-[#1A1A1A] px-5 py-2 text-sm uppercase tracking-[0.3em] text-[#D4AF37]">
          Step 2
        </span>

        <h2 className="mt-5 text-4xl font-bold text-white">
          What are we celebrating?
        </h2>

        <p className="mt-4 max-w-2xl text-[#B8B8B8] leading-8">
          Choose the type of event you're planning. This helps us
          tailor recommendations and prepare an accurate quotation.
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        {eventTypes.map((event) => {

          const active = selectedEvent === event.title;

          return (
            <button
              key={event.title}
              type="button"
              onClick={() => onSelect(event.title)}
              className={`rounded-[24px] border p-8 text-left transition duration-300 ${
                active
                  ? "border-[#D4AF37] bg-[#D4AF37]/10"
                  : "border-[#D4AF37]/10 bg-[#171717] hover:border-[#D4AF37]"
              }`}
            >

              <div className="text-5xl">
                {event.icon}
              </div>

              <h3 className="mt-6 text-2xl font-bold text-white">
                {event.title}
              </h3>

              <p className="mt-3 text-[#B8B8B8]">
                {event.description}
              </p>

            </button>
          );
        })}

      </div>

    </div>
  );
}