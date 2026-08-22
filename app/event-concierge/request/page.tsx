"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function EventRequestPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const eventType = String(formData.get("eventType") || "").trim();
    const eventDate = String(formData.get("eventDate") || "").trim();
    const guestCount = Number(formData.get("guestCount") || 0);
    const location = String(formData.get("location") || "").trim();
    const budget = String(formData.get("budget") || "").trim();
    const service = String(formData.get("service") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (
      !name ||
      !phone ||
      !eventType ||
      !eventDate ||
      !guestCount ||
      !location ||
      !message
    ) {
      setError("Please complete all required fields.");
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from("event_requests")
        .insert({
          name,
          phone,
          email: email || null,
          event_type: eventType,
          event_date: eventDate,
          guest_count: guestCount,
          location,
          budget: budget || null,
          service: service || null,
          message,
          status: "new",
        });

      if (insertError) {
        console.error("Event request error:", insertError);

        setError(
          insertError.message ||
            "We couldn't submit your request. Please try again."
        );

        setLoading(false);
        return;
      }

      setSubmitted(true);
      form.reset();
    } catch (err) {
      console.error("Unexpected event request error:", err);

      setError(
        "Something went wrong while submitting your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     SUCCESS SCREEN
  ========================= */

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#F8F6F2] px-5 py-20 text-[#171717]">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
          <div className="w-full rounded-[32px] border border-black/[0.06] bg-white px-6 py-14 text-center shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:px-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF0E8] text-2xl font-bold text-[#F26A21]">
              ✓
            </div>

            <p className="mt-7 text-[9px] font-bold uppercase tracking-[0.35em] text-[#F26A21]">
              Request Received
            </p>

            <h1 className="mt-4 font-serif text-3xl font-bold sm:text-4xl">
              Thank You.
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-black/55 sm:text-base">
              We&apos;ve received your event details. Our Event Concierge
              team will review your request and get back to you with the
              next steps.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/event-concierge"
                className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-[#F26A21] px-7 text-sm font-bold text-white transition hover:bg-[#D95512]"
              >
                Back To Event Concierge
              </Link>

              <Link
                href="/menu"
                className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-black/10 px-7 text-sm font-bold text-[#171717] transition hover:border-[#F26A21] hover:text-[#F26A21]"
              >
                Explore Menu
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =========================
     REQUEST FORM
  ========================= */

  return (
    <main className="min-h-screen bg-[#F8F6F2] text-[#171717]">
      {/* HERO */}

      <section className="bg-[#0B0B0B] px-5 py-20 text-white sm:px-8 sm:py-24 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-[#F26A21]" />

            <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#F26A21]">
              Event Concierge
            </span>

            <span className="h-px w-10 bg-[#F26A21]" />
          </div>

          <h1 className="font-serif text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            Let&apos;s Plan Your
            <span className="block text-[#F26A21]">
              Perfect Event.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/60 sm:text-base sm:leading-8">
            Tell us about your event, your guests and what you have in
            mind. We&apos;ll use these details to help create the right
            culinary experience for you.
          </p>
        </div>
      </section>

      {/* FORM */}

      <section className="px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <form
            onSubmit={handleSubmit}
            className="rounded-[32px] border border-black/[0.06] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-10 md:p-12"
          >
            {/* ERROR */}

            {error && (
              <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                <p className="font-bold">Unable to submit request</p>
                <p className="mt-1">{error}</p>
              </div>
            )}

            {/* =========================
                01 CONTACT DETAILS
            ========================= */}

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#F26A21]">
                01 — Your Details
              </p>

              <h2 className="mt-3 font-serif text-2xl font-bold sm:text-3xl">
                Tell Us Who You Are
              </h2>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-xs font-bold"
                  >
                    Full Name *
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Your full name"
                    className="h-12 w-full rounded-xl border border-black/10 bg-[#FAF9F6] px-4 text-sm outline-none transition focus:border-[#F26A21]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-xs font-bold"
                  >
                    Phone Number *
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="080..."
                    className="h-12 w-full rounded-xl border border-black/10 bg-[#FAF9F6] px-4 text-sm outline-none transition focus:border-[#F26A21]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-bold"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-xl border border-black/10 bg-[#FAF9F6] px-4 text-sm outline-none transition focus:border-[#F26A21]"
                  />
                </div>
              </div>
            </div>

            {/* =========================
                02 EVENT DETAILS
            ========================= */}

            <div className="mt-12 border-t border-black/[0.07] pt-10">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#F26A21]">
                02 — Event Details
              </p>

              <h2 className="mt-3 font-serif text-2xl font-bold sm:text-3xl">
                Tell Us About The Occasion
              </h2>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="eventType"
                    className="mb-2 block text-xs font-bold"
                  >
                    Event Type *
                  </label>

                  <select
                    id="eventType"
                    name="eventType"
                    required
                    defaultValue=""
                    className="h-12 w-full rounded-xl border border-black/10 bg-[#FAF9F6] px-4 text-sm outline-none transition focus:border-[#F26A21]"
                  >
                    <option value="" disabled>
                      Select event type
                    </option>

                    <option value="Wedding">Wedding</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Corporate Event">
                      Corporate Event
                    </option>
                    <option value="Conference">Conference</option>
                    <option value="Private Dining">
                      Private Dining
                    </option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Graduation">Graduation</option>
                    <option value="Baby Shower">Baby Shower</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="eventDate"
                    className="mb-2 block text-xs font-bold"
                  >
                    Event Date *
                  </label>

                  <input
                    id="eventDate"
                    name="eventDate"
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className="h-12 w-full rounded-xl border border-black/10 bg-[#FAF9F6] px-4 text-sm outline-none transition focus:border-[#F26A21]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="guestCount"
                    className="mb-2 block text-xs font-bold"
                  >
                    Number of Guests *
                  </label>

                  <input
                    id="guestCount"
                    name="guestCount"
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 50"
                    className="h-12 w-full rounded-xl border border-black/10 bg-[#FAF9F6] px-4 text-sm outline-none transition focus:border-[#F26A21]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="mb-2 block text-xs font-bold"
                  >
                    Event Location *
                  </label>

                  <input
                    id="location"
                    name="location"
                    type="text"
                    required
                    placeholder="Event venue / location"
                    className="h-12 w-full rounded-xl border border-black/10 bg-[#FAF9F6] px-4 text-sm outline-none transition focus:border-[#F26A21]"
                  />
                </div>
              </div>
            </div>

            {/* =========================
                03 BUDGET & SERVICE
            ========================= */}

            <div className="mt-12 border-t border-black/[0.07] pt-10">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#F26A21]">
                03 — Budget & Service
              </p>

              <h2 className="mt-3 font-serif text-2xl font-bold sm:text-3xl">
                Help Us Understand Your Needs
              </h2>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="budget"
                    className="mb-2 block text-xs font-bold"
                  >
                    Estimated Budget
                  </label>

                  <select
                    id="budget"
                    name="budget"
                    defaultValue=""
                    className="h-12 w-full rounded-xl border border-black/10 bg-[#FAF9F6] px-4 text-sm outline-none transition focus:border-[#F26A21]"
                  >
                    <option value="">Select budget range</option>
                    <option value="Below ₦100,000">
                      Below ₦100,000
                    </option>
                    <option value="₦100,000 - ₦250,000">
                      ₦100,000 - ₦250,000
                    </option>
                    <option value="₦250,000 - ₦500,000">
                      ₦250,000 - ₦500,000
                    </option>
                    <option value="₦500,000 - ₦1,000,000">
                      ₦500,000 - ₦1,000,000
                    </option>
                    <option value="₦1,000,000+">
                      ₦1,000,000+
                    </option>
                    <option value="Not Sure">Not Sure</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="service"
                    className="mb-2 block text-xs font-bold"
                  >
                    Service Required
                  </label>

                  <select
                    id="service"
                    name="service"
                    defaultValue=""
                    className="h-12 w-full rounded-xl border border-black/10 bg-[#FAF9F6] px-4 text-sm outline-none transition focus:border-[#F26A21]"
                  >
                    <option value="">Select service</option>
                    <option value="Full Catering">
                      Full Catering
                    </option>
                    <option value="Food Boxes">Food Boxes</option>
                    <option value="Party Orders">
                      Party Orders
                    </option>
                    <option value="Small Chops">Small Chops</option>
                    <option value="Corporate Meals">
                      Corporate Meals
                    </option>
                    <option value="Custom Menu">Custom Menu</option>
                    <option value="Private Dining">
                      Private Dining
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* =========================
                04 MESSAGE
            ========================= */}

            <div className="mt-12 border-t border-black/[0.07] pt-10">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#F26A21]">
                04 — Your Vision
              </p>

              <h2 className="mt-3 font-serif text-2xl font-bold sm:text-3xl">
                Tell Us What You Have In Mind
              </h2>

              <div className="mt-7">
                <label
                  htmlFor="message"
                  className="mb-2 block text-xs font-bold"
                >
                  Event Details *
                </label>

                <textarea
                  id="message"
                  name="message"
                  required
                  rows={7}
                  placeholder="Tell us about your event, preferred meals, special requests, dietary requirements or anything else we should know..."
                  className="w-full resize-none rounded-2xl border border-black/10 bg-[#FAF9F6] p-4 text-sm leading-7 outline-none transition focus:border-[#F26A21]"
                />
              </div>
            </div>

            {/* =========================
                SUBMIT
            ========================= */}

            <div className="mt-10 border-t border-black/[0.07] pt-8">
              <button
                type="submit"
                disabled={loading}
                className="flex min-h-[56px] w-full items-center justify-center rounded-full bg-[#F26A21] px-8 text-sm font-bold text-white shadow-[0_15px_40px_rgba(242,106,33,0.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#D95512] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    Submit Event Request
                    <span className="ml-2">→</span>
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-[11px] leading-5 text-black/40">
                By submitting this request, you are asking Rhennie Tasty
                Shack to contact you regarding your event.
              </p>
            </div>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/event-concierge"
              className="text-xs font-bold uppercase tracking-[0.15em] text-black/40 transition-colors hover:text-[#F26A21]"
            >
              ← Back To Event Concierge
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}