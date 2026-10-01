import { ChefHat, Truck, UtensilsCrossed, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: ChefHat,
    title: "Expert chefs",
    description:
      "Meals prepared with premium ingredients and careful attention.",
  },
  {
    icon: UtensilsCrossed,
    title: "Freshly made",
    description: "Orders prepared fresh for flavour, quality and presentation.",
  },
  {
    icon: Truck,
    title: "Reliable delivery",
    description: "Hot meals delivered to your home, office or event.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted quality",
    description: "Consistent excellence from everyday meals to catering.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
            Why Rhennie
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-[#171717] sm:text-4xl">
            Why choose Rhennie Tasty Shack
          </h2>
          <p className="mt-4 text-sm leading-7 text-black/55">
            Premium ingredients, thoughtful service and food that feels
            special — every time.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="rounded-[24px] border border-black/6 bg-[#FAF8F4] p-7"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#0B0B0B] text-[#D4AF37]">
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-semibold text-[#171717]">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-black/55">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
