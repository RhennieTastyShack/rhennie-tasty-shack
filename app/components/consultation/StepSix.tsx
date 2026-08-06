"use client";

interface StepSixProps {
  fullName: string;
  email: string;
  phone: string;
  selectedEvent: string;
  eventDate: string;
  eventTime: string;
  guestCount: string;
  venue: string;
  budget: string;
  selectedCategories: string[];
  selectedServices: string[];
  specialRequest: string;
}

export default function StepSix({
  fullName,
  email,
  phone,
  selectedEvent,
  eventDate,
  eventTime,
  guestCount,
  venue,
  budget,
  selectedCategories,
  selectedServices,
  specialRequest,
}: StepSixProps) {
  return (
    <div className="space-y-10">

      <div>

        <span className="inline-block rounded-full border border-[#D4AF37]/20 bg-[#1A1A1A] px-5 py-2 text-sm uppercase tracking-[0.3em] text-[#D4AF37]">
          Step 6
        </span>

        <h2 className="mt-5 text-4xl font-bold text-white">
          Review Your Consultation
        </h2>

        <p className="mt-4 max-w-3xl leading-8 text-[#B8B8B8]">
          Please review your details before submitting. Our Event Concierge
          team will prepare a personalised quotation based on this information.
        </p>

      </div>

      <div className="grid gap-8 lg:grid-cols-2">

        <div className="rounded-[24px] border border-[#D4AF37]/10 bg-[#171717] p-8">

          <h3 className="text-2xl font-bold text-white">
            Contact Details
          </h3>

          <div className="mt-6 space-y-4 text-[#B8B8B8]">

            <p><strong className="text-white">Name:</strong> {fullName}</p>

            <p><strong className="text-white">Email:</strong> {email}</p>

            <p><strong className="text-white">Phone:</strong> {phone}</p>

          </div>

        </div>

        <div className="rounded-[24px] border border-[#D4AF37]/10 bg-[#171717] p-8">

          <h3 className="text-2xl font-bold text-white">
            Event Details
          </h3>

          <div className="mt-6 space-y-4 text-[#B8B8B8]">

            <p><strong className="text-white">Event:</strong> {selectedEvent}</p>

            <p><strong className="text-white">Date:</strong> {eventDate}</p>

            <p><strong className="text-white">Time:</strong> {eventTime}</p>

            <p><strong className="text-white">Guests:</strong> {guestCount}</p>

            <p><strong className="text-white">Venue:</strong> {venue}</p>

            <p><strong className="text-white">Budget:</strong> {budget}</p>

          </div>

        </div>

      </div>

      <div className="rounded-[24px] border border-[#D4AF37]/10 bg-[#171717] p-8">

        <h3 className="text-2xl font-bold text-white">
          Menu Categories
        </h3>

        <div className="mt-6 flex flex-wrap gap-3">

          {selectedCategories.length > 0 ? (
            selectedCategories.map((category) => (
              <span
                key={category}
                className="rounded-full bg-[#D4AF37]/10 px-5 py-2 text-[#D4AF37]"
              >
                {category}
              </span>
            ))
          ) : (
            <p className="text-[#888]">
              No categories selected.
            </p>
          )}

        </div>

      </div>

      <div className="rounded-[24px] border border-[#D4AF37]/10 bg-[#171717] p-8">

        <h3 className="text-2xl font-bold text-white">
          Additional Services
        </h3>

        <div className="mt-6 flex flex-wrap gap-3">

          {selectedServices.length > 0 ? (
            selectedServices.map((service) => (
              <span
                key={service}
                className="rounded-full bg-[#D4AF37]/10 px-5 py-2 text-[#D4AF37]"
              >
                {service}
              </span>
            ))
          ) : (
            <p className="text-[#888]">
              No additional services selected.
            </p>
          )}

        </div>

      </div>

      <div className="rounded-[24px] border border-[#D4AF37]/10 bg-[#171717] p-8">

        <h3 className="text-2xl font-bold text-white">
          Special Requests
        </h3>

        <p className="mt-6 whitespace-pre-wrap leading-8 text-[#B8B8B8]">
          {specialRequest || "No special requests provided."}
        </p>

      </div>

      <div className="rounded-[24px] border border-[#D4AF37]/20 bg-[#111111] p-8">

        <p className="leading-8 text-[#B8B8B8]">
          By submitting this consultation, our Event Concierge team will
          review your request and prepare a personalised quotation. You'll
          be able to track its progress directly from your Client Portal.
        </p>

      </div>

    </div>
  );
}