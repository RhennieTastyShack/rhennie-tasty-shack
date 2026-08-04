"use client";

export default function Subscription() {
  return (
    <section className="bg-[#0B0B0B] py-28">
      <div className="max-w-7xl mx-auto px-6">

        <div className="rounded-[40px] overflow-hidden border border-[#D4AF37]/20 bg-gradient-to-br from-[#171717] to-[#0B0B0B]">

          <div className="grid lg:grid-cols-2 gap-12 items-center p-12 lg:p-20">

            {/* Left */}

            <div>

              <span className="inline-block rounded-full border border-[#D4AF37]/20 bg-[#1A1A1A] px-6 py-2 text-sm tracking-[0.3em] text-[#D4AF37]">
                MEAL SUBSCRIPTION
              </span>

              <h2 className="mt-8 text-6xl font-bold text-white leading-tight">
                Eat Better,
                <br />
                Every Day.
              </h2>

              <p className="mt-8 text-[#B8B8B8] leading-8">
                Enjoy freshly prepared meals delivered to your home,
                office or workplace. Choose a plan that fits your
                schedule and let us handle your daily meals.
              </p>

              <div className="mt-10 space-y-4">

                <div className="flex items-center gap-4">
                  ✅ Daily Lunch Plans
                </div>

                <div className="flex items-center gap-4">
                  ✅ Weekly Meal Plans
                </div>

                <div className="flex items-center gap-4">
                  ✅ Corporate Meal Packages
                </div>

                <div className="flex items-center gap-4">
                  ✅ Flexible Delivery Schedule
                </div>

              </div>

              <a
                href="https://wa.me/2348121577759?text=Hello%20Rhennie%20Tasty%20Shack,%20I'm%20interested%20in%20your%20meal%20subscription."
                target="_blank"
                rel="noopener noreferrer"
                className="gold-btn inline-block mt-10 px-10 py-4"
              >
                Subscribe Today
              </a>

            </div>

            {/* Right */}

            <div>

              <div className="rounded-[35px] border border-[#D4AF37]/20 bg-[#171717] p-10">

                <h3 className="text-3xl font-bold text-white">
                  Why Subscribe?
                </h3>

                <div className="mt-8 space-y-8">

                  <div>
                    <h4 className="text-[#D4AF37] font-bold">
                      Fresh Meals
                    </h4>

                    <p className="text-[#B8B8B8] mt-2">
                      Freshly cooked meals prepared daily.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[#D4AF37] font-bold">
                      Save Time
                    </h4>

                    <p className="text-[#B8B8B8] mt-2">
                      No cooking or meal planning stress.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[#D4AF37] font-bold">
                      Reliable Delivery
                    </h4>

                    <p className="text-[#B8B8B8] mt-2">
                      Delivered straight to your doorstep.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[#D4AF37] font-bold">
                      Flexible Plans
                    </h4>

                    <p className="text-[#B8B8B8] mt-2">
                      Daily, weekly or customised meal plans.
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}