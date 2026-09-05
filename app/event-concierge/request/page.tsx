"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function EventConciergePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    event_type: "",
    event_date: "",
    event_time: "",
    guest_count: "",
    venue: "",
    budget: "",
    special_request: "",
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const response = await fetch(
        "/api/consultations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to submit your request."
        );
      }

      setSuccess(
        "Your Event Concierge request has been submitted successfully. Our team will contact you shortly."
      );

      setForm({
        full_name: "",
        email: "",
        phone: "",
        event_type: "",
        event_date: "",
        event_time: "",
        guest_count: "",
        venue: "",
        budget: "",
        special_request: "",
      });
    } catch (err) {
      console.error(
        "Event Concierge submission error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f6f1] text-[#111111]">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-[#111111] px-6 py-24 text-white sm:px-10 lg:px-16 lg:py-32">

        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#D4AF37]/10 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">

          <p className="text-[10px] font-bold uppercase tracking-[0.45em] text-[#D4AF37]">
            Rhennie Tasty Shack
          </p>

          <h1 className="mt-5 max-w-4xl font-serif text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
            Event Concierge
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
            Your celebration deserves more than
            ordinary catering. Tell us about your
            event and let our team create a premium
            dining experience tailored to you.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">

            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white/60">
              Premium Catering
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white/60">
              Bespoke Menus
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white/60">
              Event Planning
            </span>

          </div>

        </div>
      </section>

      {/* =====================================================
          INTRO
      ====================================================== */}

      <section className="px-6 py-16 sm:px-10 lg:px-16">

        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
              Let's plan it
            </p>

            <h2 className="mt-4 font-serif text-4xl font-bold leading-tight sm:text-5xl">
              Tell us what you're
              <br />
              celebrating.
            </h2>

            <p className="mt-6 max-w-md text-sm leading-7 text-black/55">
              From intimate birthdays to large
              celebrations, conferences and special
              occasions, our Event Concierge team
              will review your requirements and
              prepare the right catering experience
              for your event.
            </p>

            <div className="mt-8 space-y-4">

              <div className="flex gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111111] text-sm font-bold text-[#D4AF37]">
                  01
                </div>

                <div>
                  <h3 className="font-bold">
                    Share your requirements
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-black/45">
                    Give us the details of your
                    event, guest count and venue.
                  </p>
                </div>

              </div>

              <div className="flex gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111111] text-sm font-bold text-[#D4AF37]">
                  02
                </div>

                <div>
                  <h3 className="font-bold">
                    We review your request
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-black/45">
                    Our team will assess your event
                    and catering requirements.
                  </p>
                </div>

              </div>

              <div className="flex gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111111] text-sm font-bold text-[#D4AF37]">
                  03
                </div>

                <div>
                  <h3 className="font-bold">
                    Receive your proposal
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-black/45">
                    We'll contact you to discuss
                    your quotation and next steps.
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              FORM
          ================================================== */}

          <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_25px_80px_rgba(0,0,0,0.08)] sm:p-8 lg:p-10">

            <div className="mb-8">

              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                Event Enquiry
              </p>

              <h2 className="mt-2 font-serif text-3xl font-bold">
                Plan your event
              </h2>

              <p className="mt-2 text-sm text-black/45">
                Fill in the details below and
                our team will get back to you.
              </p>

            </div>

            {/* SUCCESS */}

            {success && (
              <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5">

                <p className="text-sm font-semibold text-green-700">
                  Request submitted successfully.
                </p>

                <p className="mt-1 text-xs leading-5 text-green-600">
                  {success}
                </p>

                <Link
                  href="/"
                  className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-green-700 underline"
                >
                  Back to Home
                </Link>

              </div>
            )}

            {/* ERROR */}

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">

                <p className="text-sm font-semibold text-red-700">
                  Unable to submit request
                </p>

                <p className="mt-1 text-xs leading-5 text-red-600">
                  {error}
                </p>

              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* NAME + PHONE */}

              <div className="grid gap-5 sm:grid-cols-2">

                <Field
                  label="Full Name"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />

                <Field
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="080..."
                  required
                />

              </div>

              {/* EMAIL */}

              <Field
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />

              {/* EVENT TYPE */}

              <div>

                <label
                  htmlFor="event_type"
                  className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em] text-black/45"
                >
                  Event Type
                </label>

                <select
                  id="event_type"
                  name="event_type"
                  value={form.event_type}
                  onChange={handleChange}
                  required
                  className="min-h-[50px] w-full rounded-xl border border-black/10 bg-[#fafafa] px-4 text-sm text-black outline-none transition focus:border-[#D4AF37]"
                >

                  <option value="">
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

                  <option value="Conference">
                    Conference
                  </option>

                  <option value="Corporate Event">
                    Corporate Event
                  </option>

                  <option value="Dinner">
                    Dinner
                  </option>

                  <option value="Anniversary">
                    Anniversary
                  </option>

                  <option value="Private Celebration">
                    Private Celebration
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

              {/* DATE + TIME */}

              <div className="grid gap-5 sm:grid-cols-2">

                <Field
                  label="Event Date"
                  name="event_date"
                  type="date"
                  value={form.event_date}
                  onChange={handleChange}
                  required
                />

                <Field
                  label="Event Time"
                  name="event_time"
                  type="time"
                  value={form.event_time}
                  onChange={handleChange}
                />

              </div>

              {/* GUESTS */}

              <Field
                label="Number of Guests"
                name="guest_count"
                type="number"
                min="1"
                value={form.guest_count}
                onChange={handleChange}
                placeholder="e.g. 50"
                required
              />

              {/* VENUE */}

              <Field
                label="Venue / Location"
                name="venue"
                value={form.venue}
                onChange={handleChange}
                placeholder="Event venue or area"
                required
              />

              {/* BUDGET */}

              <div>

                <label
                  htmlFor="budget"
                  className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em] text-black/45"
                >
                  Estimated Budget
                </label>

                <select
                  id="budget"
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  className="min-h-[50px] w-full rounded-xl border border-black/10 bg-[#fafafa] px-4 text-sm text-black outline-none transition focus:border-[#D4AF37]"
                >

                  <option value="">
                    Select estimated budget
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

                  <option value="Not sure yet">
                    Not sure yet
                  </option>

                </select>

              </div>

              {/* SPECIAL REQUEST */}

              <div>

                <label
                  htmlFor="special_request"
                  className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em] text-black/45"
                >
                  Tell Us More
                </label>

                <textarea
                  id="special_request"
                  name="special_request"
                  value={form.special_request}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Tell us about your menu preferences, theme, dietary requirements or anything else we should know..."
                  className="w-full resize-none rounded-xl border border-black/10 bg-[#fafafa] px-4 py-3 text-sm text-black outline-none transition focus:border-[#D4AF37]"
                />

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#111111] px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#D4AF37] hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Submitting Request..."
                  : "Request Event Consultation"}
              </button>

              <p className="text-center text-[10px] leading-5 text-black/35">
                By submitting this form, you
                agree for Rhennie Tasty Shack
                to contact you regarding your
                event enquiry.
              </p>

            </form>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER CTA
      ====================================================== */}

      <section className="bg-[#111111] px-6 py-16 text-center text-white sm:px-10">

        <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
          Rhennie Tasty Shack
        </p>

        <h2 className="mx-auto mt-4 max-w-2xl font-serif text-3xl font-bold sm:text-4xl">
          Premium taste for moments
          worth celebrating.
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/45">
          Whether it's an intimate gathering or
          a major celebration, we're ready to
          make your event memorable.
        </p>

        <Link
          href="/"
          className="mt-7 inline-flex rounded-xl border border-white/15 px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
        >
          Back to Home
        </Link>

      </section>

    </main>
  );
}

/* =============================================================
   REUSABLE FIELD
============================================================= */

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  min?: string;
}) {
  return (
    <div>

      <label
        htmlFor={name}
        className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em] text-black/45"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        className="min-h-[50px] w-full rounded-xl border border-black/10 bg-[#fafafa] px-4 text-sm text-black outline-none transition placeholder:text-black/25 focus:border-[#D4AF37]"
      />

    </div>
  );
}