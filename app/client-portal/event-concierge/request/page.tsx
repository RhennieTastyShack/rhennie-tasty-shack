"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function EventConciergeRequestPage() {
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

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          event_type: form.event_type,
          event_date: form.event_date,
          event_time: form.event_time,
          guest_count: Number(form.guest_count),
          venue: form.venue,
          budget: form.budget,
          special_request: form.special_request,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to submit your request."
        );
      }

      setMessage(
        "Your event request has been submitted successfully. Our team will review your request and prepare your quotation."
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
      console.error("Event request error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your event request."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f6f1] text-[#171717]">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#111111] px-6 py-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(231,164,33,0.18),transparent_40%)]" />

        <div className="relative mx-auto max-w-6xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#e7b52f]">
            Rhennie Tasty Shack
          </p>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            Event Concierge
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 md:text-lg">
            Tell us about your event and let our team create a
            premium catering experience tailored to your occasion.
          </p>
        </div>
      </section>

      {/* FORM */}
      <section className="px-5 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b68a16]">
              Event Request
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Tell us what you need
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Submit your event details below. Your request will be
              reviewed by our team before a quotation is prepared.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-black/10 bg-white p-6 shadow-xl md:p-10"
          >
            {/* CUSTOMER INFORMATION */}
            <div className="mb-10">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b68a16]">
                  01
                </p>

                <h3 className="mt-1 text-xl font-bold">
                  Your Information
                </h3>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Full Name"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />

                <Field
                  label="Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />

                <Field
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="07012345678"
                  required
                />
              </div>
            </div>

            {/* EVENT INFORMATION */}
            <div className="mb-10">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b68a16]">
                  02
                </p>

                <h3 className="mt-1 text-xl font-bold">
                  Event Information
                </h3>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="event_type"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Event Type
                  </label>

                  <select
                    id="event_type"
                    name="event_type"
                    value={form.event_type}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-[#d6a72c] focus:ring-2 focus:ring-[#d6a72c]/20"
                  >
                    <option value="">Select event type</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Naming Ceremony">
                      Naming Ceremony
                    </option>
                    <option value="Private Celebration">
                      Private Celebration
                    </option>
                    <option value="Corporate Event">
                      Corporate Event
                    </option>
                    <option value="Conference">Conference</option>
                    <option value="Dinner">Private Dinner</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

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

                <Field
                  label="Venue"
                  name="venue"
                  value={form.venue}
                  onChange={handleChange}
                  placeholder="Event location"
                  required
                />
              </div>
            </div>

            {/* BUDGET */}
            <div className="mb-10">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b68a16]">
                  03
                </p>

                <h3 className="mt-1 text-xl font-bold">
                  Budget & Requirements
                </h3>
              </div>

              <div className="grid gap-5">
                <Field
                  label="Estimated Budget"
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  placeholder="e.g. ₦500,000 or ₦250,000 - ₦500,000"
                />

                <div>
                  <label
                    htmlFor="special_request"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Special Requests
                  </label>

                  <textarea
                    id="special_request"
                    name="special_request"
                    value={form.special_request}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Tell us about your menu preferences, drinks, desserts, décor, dietary requirements, service style or anything else we should know..."
                    className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-[#d6a72c] focus:ring-2 focus:ring-[#d6a72c]/20"
                  />
                </div>
              </div>
            </div>

            {/* SUCCESS */}
            {message && (
              <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800">
                {message}
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                {error}
              </div>
            )}

            {/* SUBMIT */}
            <div className="flex flex-col gap-4 border-t border-gray-200 pt-7 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">
                  Ready to plan your event?
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Our team will review your request before sending
                  your quotation.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-[#d6a72c] px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-black transition hover:bg-[#e7b52f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Submitting..."
                  : "Submit Event Request"}
              </button>
            </div>
          </form>

          {/* BACK */}
          <div className="mt-8 text-center">
            <Link
              href="/client-portal/event-concierge"
              className="text-sm font-semibold text-gray-600 transition hover:text-[#b68a16]"
            >
              ← Back to Event Concierge
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* =====================================================
   REUSABLE INPUT
===================================================== */

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  placeholder?: string;
  required?: boolean;
  min?: string;
};

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  min,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold"
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
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-[#d6a72c] focus:ring-2 focus:ring-[#d6a72c]/20"
      />
    </div>
  );
}