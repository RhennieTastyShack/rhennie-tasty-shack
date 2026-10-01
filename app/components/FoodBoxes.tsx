import Image from "next/image";
import Link from "next/link";

const boxes = [
  {
    number: "01",
    title: "Jollof & Pasta Feast Box",
    price: "₦32,000",
    image: "/images/Luxury Brunch Box.png",
    description:
      "A luxurious three-meal experience featuring jollof rice, fried rice and pasta, served with four generous pieces of seasoned chicken.",
  },
  {
    number: "02",
    title: "Luxury Brunch Box",
    price: "₦35,000",
    image: "/images/Luxury Brunch Box.png",
    popular: true,
    description:
      "A luxurious three-meal experience featuring jollof rice, fried rice and pasta, served with four generous pieces of seasoned chicken.",
  },
  {
    number: "03",
    title: "Weekend Treat Box",
    price: "₦40,000",
    image: "/images/box-45-turkey.jpg",
    description:
      "Fried rice, stir fry pasta, 2 pieces of peppered turkey, 1 mini bottled water, 1 fruit juice, 5 samosa, 5 spring rolls, 10 puff-puff, 2 chocolates and 2 McVitie's.",
  },
  {
    number: "04",
    title: "Peppered Turkey Box",
    price: "₦45,000",
    image: "/images/box-45-turkey.jpg",
    description:
      "Fried rice, stir fry pasta, 2 pieces of peppered turkey, 1 mini bottled water, 1 fruit juice, 5 samosa, 5 spring rolls, 10 puff-puff, 2 chocolates and 2 McVitie's.",
  },
  {
    number: "05",
    title: "Family Feast Box",
    price: "₦50,000",
    image: "/images/box-50-family.jpg",
    description:
      "2 apples, 2 pieces of peppered turkey, 10 pieces of peppered beef, 10 samosa, 10 spring rolls, 15 puff-puff, 1 fruit juice, fried rice and jollof rice.",
  },
  {
    number: "06",
    title: "Plantain Feast Box",
    price: "₦50,000",
    image: "/images/box-50-plantain.jpg",
    description:
      "2 pieces of peppered turkey, stir fry pasta, fried rice, fried plantain, 10 puff-puff, 5 samosa, 5 spring rolls, 1 fruit juice, 1 Pringles, 1 Vitamilk and 3 McVitie's.",
  },
  {
    number: "07",
    title: "Bento Celebration Box",
    price: "₦55,000",
    image: "/images/box-55-bento.jpg",
    description:
      "A bento cake, 2 pieces of peppered turkey, stir fry pasta, fried rice, 5 samosa, 5 spring rolls, 10 puff-puff, 2 cookies, 2 chocolates, 1 fruit juice and 1 mini bottled water.",
  },
  {
    number: "08",
    title: "Heritage Feast Box",
    price: "₦60,000",
    image: "/images/box-60-waffles.jpg",
    description:
      "Stir fry pasta, fried rice, 5 waffles, 4 pieces of peppered turkey, 2 fruit juices, 2 chocolates, 2 cookies, 5 samosa, 5 spring rolls, 10 puff-puff and 1 Pringles.",
  },
  {
    number: "09",
    title: "Ultimate Brunch Box",
    price: "₦70,000",
    image: "/images/Ultimate Brunch Box.png",
    description:
      "A premium brunch spread featuring sandwiches, waffles, pancakes, turkey, bento cake, jollof rice, fried rice, chocolates, fruit and drinks.",
  },
  {
    number: "10",
    title: "Grand Celebration Box",
    price: "₦80,000",
    image: "/images/Grand Celebration Box.png",
    description:
      "Our grand celebration spread with sausages, waffles, pancakes, small chops, turkey, scrambled eggs, jollof rice, fried rice, bento cake, chocolates, fruits and drinks.",
  },
];

const platters = [
  {
    title: "Chicken & Small Chops Platter",
    price: "₦9,000",
    image: "/images/Chicken & Small Chops Platter.png",
    description:
      "Tender seasoned chicken served with a generous selection of freshly prepared small chops.",
  },
  {
    title: "Turkey & Small Chops Platter",
    price: "₦10,000",
    image: "/images/Turkey & Small Chops Platter.png",
    description:
      "Two pieces of premium turkey paired with a generous selection of delicious small chops.",
  },
];

export default function FoodBoxes() {
  return (
    <section
      id="foodboxes"
      className="relative overflow-hidden bg-[#080808] py-20 text-white md:py-24"
    >
      {/* Decorative gold glow */}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">

        {/* HEADER */}
        <div className="mx-auto mb-14 max-w-4xl text-center">

          <div className="mb-5 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-yellow-500" />

            <span className="text-xs font-bold uppercase tracking-[0.35em] text-yellow-500">
              Signature Collection
            </span>

            <span className="h-px w-12 bg-yellow-500" />
          </div>

          <h2 className="font-serif text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            Signature{" "}
            <span className="text-yellow-500">
              Food Boxes
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
            Thoughtfully curated food experiences for celebrations,
            intimate gatherings, gifting, brunches and unforgettable moments.
          </p>

        </div>

        {/* FOOD BOXES */}
        <div className="grid items-stretch gap-7 md:grid-cols-2 xl:grid-cols-6">

          {boxes.map((box) => (
            <article
              key={box.title}
              className={`group flex h-[500px] w-full flex-col overflow-hidden rounded-[28px] border bg-[#0d0d0d] transition-all duration-500 hover:-translate-y-2 ${
                box.number === "07"
                  ? "xl:col-span-2 xl:col-start-3"
                  : "xl:col-span-2"
              } ${
                box.popular
                  ? "border-yellow-500 bg-[#15130c] shadow-[0_25px_70px_rgba(234,179,8,0.14)]"
                  : "border-white/10 hover:border-yellow-500/50"
              }`}
            >

              {/* IMAGE */}
              <div className="relative h-[250px] w-full shrink-0 overflow-hidden">

                <Image
                  src={box.image}
                  alt={box.title}
                  fill
                  priority={box.number === "01"}
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                {/* NUMBER */}
                <div className="absolute left-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-yellow-500 bg-black/80 text-xs font-bold text-yellow-500">
                  {box.number}
                </div>

                {/* MOST POPULAR */}
                {box.popular && (
                  <div className="absolute right-5 top-5 rounded-full bg-yellow-500 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-black shadow-lg">
                    Most Popular
                  </div>
                )}

              </div>

              {/* CONTENT */}
              <div className="flex flex-1 flex-col p-6">

                <h3 className="min-h-[54px] text-[22px] font-bold leading-tight text-white sm:text-2xl">
                  {box.title}
                </h3>

                <p className="mt-3 h-[72px] overflow-hidden text-sm leading-6 text-gray-400">
                  {box.description}
                </p>

                {/* PRICE + BUTTON */}
                <div className="mt-auto flex items-end justify-between gap-4 border-t border-white/10 pt-5">

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-gray-500">
                      Starting from
                    </p>

                    <p className="mt-1 text-[25px] font-extrabold tracking-tight text-yellow-500">
                      {box.price}
                    </p>
                  </div>

                  <Link
                    href="/menu"
                    className="flex items-center gap-2 rounded-full border border-yellow-500/60 px-5 py-2.5 text-xs font-bold text-yellow-500 transition-all duration-300 hover:bg-yellow-500 hover:text-black"
                  >
                    View Box
                    <span>→</span>
                  </Link>

                </div>

              </div>

            </article>
          ))}

        </div>

        {/* PLATTER COLLECTION */}
        <div className="mt-24">

          <div className="mx-auto mb-10 max-w-3xl text-center">

            <span className="text-xs font-bold uppercase tracking-[0.35em] text-yellow-500">
              Platter Collection
            </span>

            <h3 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
              Perfect for{" "}
              <span className="text-yellow-500">
                Sharing
              </span>
            </h3>

            <p className="mt-4 text-sm leading-7 text-gray-400">
              Deliciously prepared platters made for intimate gatherings,
              casual celebrations and sharing.
            </p>

          </div>

          {/* PLATTERS */}
          <div className="mx-auto grid max-w-5xl items-stretch gap-7 md:grid-cols-2">

            {platters.map((platter) => (
              <article
                key={platter.title}
                className="group flex h-[450px] w-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0d0d0d] transition-all duration-500 hover:-translate-y-2 hover:border-yellow-500/50"
              >

                <div className="relative h-[240px] w-full shrink-0 overflow-hidden">

                  <Image
                    src={platter.image}
                    alt={platter.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                </div>

                <div className="flex flex-1 flex-col p-7">

                  <h4 className="min-h-[55px] text-2xl font-bold">
                    {platter.title}
                  </h4>

                  <p className="mt-3 h-[60px] overflow-hidden text-sm leading-6 text-gray-400">
                    {platter.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-4 border-t border-white/10 pt-5">

                    <span className="text-2xl font-extrabold text-yellow-500">
                      {platter.price}
                    </span>

                    <Link
                      href="/menu"
                      className="flex items-center gap-2 rounded-full border border-yellow-500/60 px-5 py-2.5 text-xs font-bold text-yellow-500 transition-all duration-300 hover:bg-yellow-500 hover:text-black"
                    >
                      View Platter
                      <span>→</span>
                    </Link>

                  </div>

                </div>

              </article>
            ))}

          </div>

        </div>

        {/* CUSTOM ORDER CTA */}
        <div className="mt-16 rounded-[28px] border border-yellow-500/20 bg-[#101010] p-7 md:p-9">

          <div className="flex flex-col items-center justify-between gap-7 text-center md:flex-row md:text-left">

            <div>

              <p className="text-xl font-bold md:text-2xl">
                Planning something special?
              </p>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
                Need a custom food box for your celebration, event or
                corporate gathering? We can create something specially
                curated for you.
              </p>

            </div>

            <Link
              href="/menu?category=food-boxes"
              className="shrink-0 rounded-full bg-[#D4AF37] px-7 py-3.5 text-sm font-bold text-black transition-all hover:bg-[#E5C65A]"
            >
              Browse Food Boxes →
            </Link>

          </div>

        </div>

      </div>
    </section>
  );
}