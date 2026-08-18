"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function EventConciergePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      full_name: formData.get("full_name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      event_type: formData.get("event_type"),
      event_date: formData.get("event_date"),
      event_time: formData.get("event_time"),
      guest_count: formData.get("guest_count"),
      venue: formData.get("venue"),
      budget: formData.get("budget"),
      special_request: formData.get("special_request"),
    };

    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to submit your request."
        );
      }

      setSuccess(
        `Your event request has been submitted successfully. Your order number is ${data.order.order_no}.`
      );

      form.reset();
    } catch (submitError) {
      console.error("Event submission error:", submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit your event request."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080808] px-5 py-12 text-white md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mx-auto max-w-3xl text-center">

          <span className="inline-block rounded-full border border-[#D4AF37]/30 bg-[#111111] px-5 py-2 text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
            Event Concierge
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">
            Let&apos;s Create Something
            <span className="block text-[#D4AF37]">
              Exceptional.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#A8A8A8] md:text-base">
            Tell us about your event and our team will help
            create a premium catering experience tailored to
            your needs.
          </p>

          <Link
            href="/client-portal"
            className="mt-6 inline-block text-sm font-semibold text-[#D4AF37] hover:underline"
          >
            ← Back to Client Portal
          </Link>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="mt-12 space-y-8"
        >

          {/* PERSONAL DETAILS */}
          <section className="rounded-[30px] border border-white/10 bg-[#111111] p-6 md:p-10">

            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                Your Details
              </span>

              <h2 className="mt-3 text-2xl font-bold md:text-3xl">
                Tell us who you are
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm text-[#D0D0D0]">
                  Full Name
                </label>

                <input
                  name="full_name"
                  type="text"
                  required
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-[#D0D0D0]">
                  Email Address
                </label>

                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-[#D0D0D0]">
                  Phone Number
                </label>

                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="0800 000 0000"
                  className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none transition focus:border-[#D4AF37]"
                />
              </div>

            </div>

          </section>

          {/* EVENT DETAILS */}
          <section className="rounded-[30px] border border-white/10 bg-[#111111] p-6 md:p-10">

            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                Event Details
              </span>

              <h2 className="mt-3 text-2xl font-bold md:text-3xl">
                Tell us about your event
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">

              {/* EVENT TYPE */}
              <div>
                <label className="mb-2 block text-sm text-[#D0D0D0]">
                  Event Type
                </label>

                <select
                  name="event_type"
                  required
                  defaultValue=""
                  className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
                >
                  <option value="" disabled>
                    Select event type
                  </option>

                  <option value="Birthday">
                    Birthday
                  </option>

                  <option value="Wedding">
                    Wedding
                  </option>

                  <option value="Naming Ceremony">
                    Naming Ceremony
                  </option>

                  <option value="Corporate Event">
                    Corporate Event
                  </option>

                  <option value="Conference">
                    Conference
                  </option>

                  <option value="Private Dinner">
                    Private Dinner
                  </option>

                  <option value="Funeral">
                    Funeral
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              {/* GUEST COUNT */}
              <div>
                <label className="mb-2 block text-sm text-[#D0D0D0]">
                  Number of Guests
                </label>

                <input
                  name="guest_count"
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 50"
                  className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* DATE */}
              <div>
                <label className="mb-2 block text-sm text-[#D0D0D0]">
                  Event Date
                </label>

                <input
                  name="event_date"
                  type="date"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* TIME */}
              <div>
                <label className="mb-2 block text-sm text-[#D0D0D0]">
                  Event Time
                </label>

                <input
                  name="event_time"
                  type="time"
                  className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* VENUE */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-[#D0D0D0]">
                  Venue / Location
                </label>

                <input
                  name="venue"
                  type="text"
                  required
                  placeholder="Event venue or location"
                  className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* BUDGET */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-[#D0D0D0]">
                  Estimated Budget
                </label>

                <input
                  name="budget"
                  type="text"
                  placeholder="e.g. ₦500,000"
                  className="w-full rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* SPECIAL REQUEST */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-[#D0D0D0]">
                  Special Requests
                </label>

                <textarea
                  name="special_request"
                  rows={6}
                  placeholder="Tell us about your menu preferences, dietary requirements, theme, service expectations or anything else we should know..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#171717] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
                />
              </div>

            </div>

          </section>

          {/* SUCCESS */}
          {success && (
            <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-5 text-center text-green-300">
              <p className="font-semibold">
                Request Submitted Successfully
              </p>

              <p className="mt-2 text-sm">
                {success}
              </p>

              <Link
                href="/orders"
                className="mt-4 inline-block rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-bold text-black hover:bg-[#E5C65A]"
              >
                View My Order →
              </Link>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-center text-red-300">
              {error}
            </div>
          )}

          {/* SUBMIT */}
          <div className="text-center">

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-[#D4AF37] px-10 py-4 text-sm font-bold text-black transition hover:bg-[#E5C65A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Submitting Request..."
                : "Submit Event Request →"}
            </button>

            <p className="mt-4 text-xs text-[#666666]">
              Our team will review your request and contact you
              to discuss your event and quotation.
            </p>

          </div>

        </form>

      </div>
    </main>
  );
}