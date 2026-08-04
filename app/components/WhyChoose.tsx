import {
  Clock,
  ChefHat,
  Truck,
  Star,
  UtensilsCrossed,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: ChefHat,
    title: "Expert Chefs",
    description:
      "Every meal is carefully prepared by experienced chefs using premium ingredients.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description:
      "Hot, fresh meals delivered quickly to your home, office, or event.",
  },
  {
    icon: UtensilsCrossed,
    title: "Freshly Made",
    description:
      "Every order is prepared fresh to ensure maximum taste and quality.",
  },
  {
    icon: Clock,
    title: "Always On Time",
    description:
      "We value your time and ensure prompt preparation and delivery.",
  },
  {
    icon: Star,
    title: "Premium Experience",
    description:
      "Luxury presentation, exceptional taste, and outstanding customer service.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Quality",
    description:
      "Hygienic preparation, quality ingredients, and consistent excellence every time.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-black py-24 text-white">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold">
            Why Choose
            <span className="text-yellow-400"> Rhennie Tasty Shack</span>
          </h2>

          <p className="mt-5 text-gray-300 max-w-3xl mx-auto">
            We don't just prepare meals—we create memorable dining experiences
            with premium ingredients, excellent service, and unmatched quality.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-3xl border border-yellow-500/20 bg-white/5 p-8 transition duration-500 hover:-translate-y-2 hover:border-yellow-500 hover:bg-white/10"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500 text-black">
                  <Icon size={32} />
                </div>

                <h3 className="mb-4 text-2xl font-semibold">
                  {feature.title}
                </h3>

                <p className="text-gray-300 leading-7">
                  {feature.description}
                </p>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}