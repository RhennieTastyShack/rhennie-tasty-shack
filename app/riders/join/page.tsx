"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { supabase } from "@/lib/supabase";
import {
  DEFAULT_PLATFORM_COMMISSION_PERCENT,
  RIDE_BRAND,
  VEHICLE_OPTIONS,
} from "@/lib/ride-with-701";

type RiderProfile = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  id_type: string | null;
  id_number: string | null;
  id_document_path: string | null;
  vehicle_type: string | null;
  status: string;
};

const ID_TYPES = [
  { value: "NIN", label: "National ID (NIN)" },
  { value: "DRIVERS_LICENSE", label: "Driver's licence" },
  { value: "VOTERS_CARD", label: "Voter's card" },
  { value: "PASSPORT", label: "International passport" },
];

const JOIN_VEHICLES = VEHICLE_OPTIONS.filter(
  (option, index, list) =>
    list.findIndex((item) => item.category === option.category) === index
);

function BikeHeroIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="5.5" cy="17.5" r="3" />
      <circle cx="18.5" cy="17.5" r="3" />
      <path d="M5.5 17.5 9 9h3l2 4h3.5" />
      <path d="M12 9V6.5h2.5" />
      <path d="m9 9 3 4" />
    </svg>
  );
}

export default function RiderJoinPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [existing, setExisting] = useState<RiderProfile | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [vehicleType, setVehicleType] = useState("bike");
  const [plateNumber, setPlateNumber] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [photoPath, setPhotoPath] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [idType, setIdType] = useState("NIN");
  const [idNumber, setIdNumber] = useState("");
  const [idPath, setIdPath] = useState("");
  const [idFileName, setIdFileName] = useState("");

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [acceptedFee, setAcceptedFee] = useState(false);
  const [commissionPercent, setCommissionPercent] = useState(
    DEFAULT_PLATFORM_COMMISSION_PERCENT
  );
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function fillForm(rider: RiderProfile, fallbackEmail: string) {
    setFullName(rider.full_name || "");
    setEmail(rider.email || fallbackEmail);
    setPhone(rider.phone || "");
    setAddress(rider.address || "");
    setCity(rider.city || "");
    setVehicleType(rider.vehicle_type || "bike");
    setIdType(rider.id_type || "NIN");
    setIdNumber(rider.id_number || "");
    setIdPath(rider.id_document_path || "");
    setIdFileName(rider.id_document_path ? "Identity card uploaded" : "");
  }

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.replace("/login?next=/riders/join");
        return;
      }

      if (!active) return;

      const accountEmail = session.user.email || "";
      setEmail(accountEmail);

      const response = await fetch("/api/riders?scope=me", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!active) return;

      if (result?.rider) {
        setExisting(result.rider);
        fillForm(result.rider, accountEmail);
      }

      const settingsRes = await fetch("/api/admin/ride-settings", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });
      const settingsJson = await settingsRes.json().catch(() => ({}));
      if (
        settingsRes.ok &&
        Number.isFinite(Number(settingsJson?.ride_platform_commission))
      ) {
        setCommissionPercent(Number(settingsJson.ride_platform_commission));
      }

      setChecking(false);
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, [router]);

  async function getToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  async function handleIdFile(file: File | null) {
    if (!file) return;
    setError("");
    setUploading(true);

    try {
      const token = await getToken();
      if (!token) {
        router.replace("/login?next=/riders/join");
        return;
      }

      const form = new FormData();
      form.append("file", file);

      const response = await fetch("/api/riders/id", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to upload identity card.");
      }

      setIdPath(result.path);
      setIdFileName(file.name);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to upload identity card."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        router.replace("/login?next=/riders/join");
        return;
      }

      if (!acceptedFee) {
        throw new Error(
          `Accept the ${RIDE_BRAND.partnerLabel.toLowerCase()} terms, including the ${commissionPercent}% platform commission, before submitting.`
        );
      }

      if (!photoPath) {
        throw new Error("Upload a photo of yourself.");
      }

      if (
        vehicleType !== "bicycle" &&
        vehicleType !== "electric_bicycle" &&
        !plateNumber.trim()
      ) {
        throw new Error("Enter the plate number for motorised vehicles.");
      }

      const payload = {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        vehicle_type: vehicleType,
        plate_number: plateNumber.trim(),
        vehicle_color: vehicleColor.trim(),
        vehicle_model: vehicleModel.trim(),
        photo_path: photoPath,
        id_type: idType,
        id_number: idNumber.trim(),
        id_document_path: idPath,
        platform_fee_accepted: true,
        platform_fee_percent: commissionPercent,
      };

      const response = await fetch("/api/riders", {
        method: existing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message || "Unable to save rider application."
        );
      }

      setExisting(result.rider);
      setMessage(
        existing
          ? "Rider profile updated. Admin will review your details."
          : "Application submitted. Rhennie will review your identity and approve you."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save application."
      );
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login?next=/riders/join");
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B]">
        <Loader2 className="animate-spin text-[#F26A21]" size={36} />
      </main>
    );
  }

  const locked = existing?.status === "APPROVED";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#2A160C,_#0B0B0B_50%)] px-4 py-12 text-white sm:px-6">
      <div className="mx-auto max-w-xl">
        <div className="rounded-[32px] border border-white/10 bg-[#141414] p-7 shadow-2xl sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
                {RIDE_BRAND.name}
              </p>
              <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
                {RIDE_BRAND.tagline}
              </h1>
              <p className="mt-3 text-sm leading-6 text-white/55">
                {RIDE_BRAND.supportCopy}
              </p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#0B0B0B] text-[#D4AF37] motion-safe:animate-ride-float">
              <BikeHeroIcon className="h-8 w-8" />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/login?next=/riders/join"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/20 px-5 text-xs font-bold uppercase tracking-[0.16em] text-white"
            >
              Login
            </Link>
            <a
              href="#partner-register"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#D4AF37] px-5 text-xs font-bold uppercase tracking-[0.16em] text-black"
            >
              Register
            </a>
          </div>

          {existing && (
            <div className="mt-6 rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 p-4">
              <p className="text-sm font-semibold text-[#D4AF37]">
                Application status: {existing.status}
              </p>
              <p className="mt-1 text-sm text-white/60">
                {existing.status === "APPROVED"
                  ? "You are approved. Open the delivery partner portal to manage deliveries."
                  : existing.status === "PENDING"
                    ? "Pending review. You can still add or correct your address and ID."
                    : "Your delivery partner account is suspended. Contact Rhennie Studio."}
              </p>
            </div>
          )}

          <form
            id="partner-register"
            onSubmit={handleSubmit}
            className="mt-6 space-y-4"
          >
            <Field label="Full name">
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={locked}
                className={inputClass}
                placeholder="Your full name"
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={locked}
                className={inputClass}
                placeholder="you@example.com"
              />
            </Field>

            <Field label="Phone">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                type="tel"
                disabled={locked}
                className={inputClass}
                placeholder="08012345678"
              />
            </Field>

            <Field label="Home address">
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                disabled={locked}
                rows={3}
                className={inputClass}
                placeholder="Street, area, landmark"
              />
            </Field>

            <Field label="City">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                disabled={locked}
                className={inputClass}
                placeholder="Lagos"
              />
            </Field>

            <Field label="Transportation">
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                disabled={locked}
                className={inputClass}
              >
                {JOIN_VEHICLES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Your photo">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={locked || uploading}
                className={inputClass}
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  setError("");
                  try {
                    const token = await getToken();
                    const body = new FormData();
                    body.set("file", file);
                    body.set("kind", "photo");
                    const response = await fetch("/api/riders/id", {
                      method: "POST",
                      headers: token ? { Authorization: `Bearer ${token}` } : {},
                      body,
                    });
                    const result = await response.json();
                    if (!response.ok || !result?.path) {
                      throw new Error(result?.message || "Unable to upload photo.");
                    }
                    setPhotoPath(result.path);
                    setPhotoName(file.name);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Unable to upload photo.");
                  } finally {
                    setUploading(false);
                  }
                }}
              />
              {photoName && (
                <p className="mt-2 text-xs text-white/50">{photoName}</p>
              )}
            </Field>

            <Field label="Plate number">
              <input
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                disabled={locked}
                className={inputClass}
                placeholder="ABC-123DE"
              />
            </Field>

            <Field label="Vehicle model">
              <input
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                disabled={locked}
                className={inputClass}
                placeholder="Bajaj Boxer, Corolla, etc."
              />
            </Field>

            <Field label="Vehicle colour">
              <input
                value={vehicleColor}
                onChange={(e) => setVehicleColor(e.target.value)}
                disabled={locked}
                className={inputClass}
                placeholder="Black"
              />
            </Field>

            <Field label="Identity card type">
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                disabled={locked}
                className={inputClass}
              >
                {ID_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Identity number">
              <input
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                required
                disabled={locked}
                className={inputClass}
                placeholder="ID number on the card"
              />
            </Field>

            <Field label="Identity card photo or PDF">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                disabled={locked || uploading}
                onChange={(e) => handleIdFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-[#F26A21] file:px-4 file:py-2 file:text-xs file:font-bold file:text-white"
              />
              <p className="mt-2 text-xs text-white/40">
                {uploading
                  ? "Uploading..."
                  : idFileName || "JPG, PNG, or PDF. Max 4MB."}
              </p>
            </Field>

            <section className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-white/70">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                {RIDE_BRAND.partnerLabel} terms
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  Rhennie Tasty Shack keeps {commissionPercent}% of every Ride
                  with 701 delivery fee as platform commission.
                </li>
                <li>
                  The {commissionPercent}% is deducted after the delivery is
                  completed with the customer&apos;s delivery code. Customers do
                  not pay this as a separate charge.
                </li>
                <li>
                  You receive the remaining {100 - commissionPercent}% of the
                  delivery fee. The customer tip is yours in full.
                </li>
                <li>
                  Payouts go to the bank account you save in the delivery partner
                  portal.
                </li>
              </ul>
            </section>

            <label className="flex items-start gap-3 text-sm leading-6 text-white/70">
              <input
                type="checkbox"
                checked={acceptedFee}
                onChange={(event) => setAcceptedFee(event.target.checked)}
                required
                disabled={locked}
                className="mt-1"
              />
              <span>
                I have read and accept the {RIDE_BRAND.partnerLabel.toLowerCase()}{" "}
                terms, including Rhennie&apos;s {commissionPercent}% platform
                commission on each delivery fee.
              </span>
            </label>

            {error && <p className="text-sm text-red-400">{error}</p>}
            {message && <p className="text-sm text-green-400">{message}</p>}

            {!locked && (
              <button
                type="submit"
                disabled={loading || uploading}
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#F26A21] text-sm font-bold text-white transition hover:bg-[#D95512] disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : existing ? (
                  "Update application"
                ) : (
                  "Submit delivery partner application"
                )}
              </button>
            )}
          </form>

          <div className="mt-8 flex flex-wrap gap-4 text-sm">
            {existing?.status === "APPROVED" && (
              <Link href="/riders/portal" className="text-[#D4AF37]">
                Delivery partner portal
              </Link>
            )}
            <Link href="/forgot-password" className="text-[#F26A21]">
              Forgot password
            </Link>
            <button type="button" onClick={signOut} className="text-white/50">
              Sign out
            </button>
            <Link href="/menu" className="text-white/40">
              Back to menu
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-[#F26A21] disabled:opacity-60";

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-white/70">
        {label}
      </label>
      {children}
    </div>
  );
}
