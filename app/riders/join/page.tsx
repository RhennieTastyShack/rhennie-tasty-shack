"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { supabase } from "@/lib/supabase";
import {
  DEFAULT_PLATFORM_COMMISSION_PERCENT,
  normalizeVehicleCategory,
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
  state?: string | null;
  date_of_birth?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  id_type: string | null;
  id_number: string | null;
  id_document_path: string | null;
  vehicle_type: string | null;
  vehicle_make?: string | null;
  vehicle_model?: string | null;
  vehicle_year?: string | null;
  vehicle_color?: string | null;
  plate_number?: string | null;
  photo_path?: string | null;
  status: string;
};

const STEPS = [
  { id: 1, label: "Personal" },
  { id: 2, label: "Vehicle" },
  { id: 3, label: "Identity" },
] as const;

const JOIN_VEHICLES = VEHICLE_OPTIONS.filter(
  (option, index, list) =>
    list.findIndex((item) => item.category === option.category) === index
);

function needsPlate(vehicleType: string) {
  const category = normalizeVehicleCategory(vehicleType);
  return category !== "bicycle" && category !== "electric_bicycle";
}

function needsDriversLicence(vehicleType: string) {
  const category = normalizeVehicleCategory(vehicleType);
  return (
    category === "motorcycle" ||
    category === "tricycle" ||
    category === "car" ||
    category === "mini_van" ||
    category === "van"
  );
}

function idTypesForVehicle(vehicleType: string) {
  const base = [
    { value: "NIN", label: "National ID (NIN)" },
    { value: "VOTERS_CARD", label: "Voter's card" },
    { value: "PASSPORT", label: "International passport" },
  ];
  if (needsDriversLicence(vehicleType)) {
    return [
      { value: "DRIVERS_LICENSE", label: "Driver's licence" },
      ...base,
    ];
  }
  return base;
}

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
  const [step, setStep] = useState(1);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  const [vehicleType, setVehicleType] = useState("bike");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");

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

  const idOptions = useMemo(
    () => idTypesForVehicle(vehicleType),
    [vehicleType]
  );
  const motorised = needsPlate(vehicleType);
  const licenceRequired = needsDriversLicence(vehicleType);

  useEffect(() => {
    if (!idOptions.some((option) => option.value === idType)) {
      setIdType(idOptions[0]?.value || "NIN");
    }
  }, [idOptions, idType]);

  function fillForm(rider: RiderProfile, fallbackEmail: string) {
    setFullName(rider.full_name || "");
    setEmail(rider.email || fallbackEmail);
    setPhone(rider.phone || "");
    setDateOfBirth(rider.date_of_birth || "");
    setAddress(rider.address || "");
    setCity(rider.city || "");
    setStateName(rider.state || "");
    setEmergencyName(rider.emergency_contact_name || "");
    setEmergencyPhone(rider.emergency_contact_phone || "");
    setVehicleType(rider.vehicle_type || "bike");
    setVehicleMake(rider.vehicle_make || "");
    setVehicleModel(rider.vehicle_model || "");
    setVehicleYear(rider.vehicle_year || "");
    setVehicleColor(rider.vehicle_color || "");
    setPlateNumber(rider.plate_number || "");
    setIdType(rider.id_type || "NIN");
    setIdNumber(rider.id_number || "");
    setIdPath(rider.id_document_path || "");
    setIdFileName(rider.id_document_path ? "Identity card uploaded" : "");
    setPhotoPath(rider.photo_path || "");
    setPhotoName(rider.photo_path ? "Profile photo on file" : "");
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

  async function uploadFile(file: File, kind: "photo" | "id") {
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
      if (kind === "photo") form.set("kind", "photo");

      const response = await fetch("/api/riders/id", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const result = await response.json();

      if (!response.ok || !result?.success || !result?.path) {
        throw new Error(
          result?.message ||
            (kind === "photo"
              ? "Unable to upload photo."
              : "Unable to upload identity card.")
        );
      }

      if (kind === "photo") {
        setPhotoPath(result.path);
        setPhotoName(file.name);
      } else {
        setIdPath(result.path);
        setIdFileName(file.name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function validateStep(current: number) {
    if (current === 1) {
      if (!fullName.trim()) return "Enter your full legal name.";
      if (!email.trim() || !email.includes("@")) return "Enter a valid email.";
      if (phone.replace(/\D/g, "").length < 10) {
        return "Enter a valid phone number.";
      }
      if (!dateOfBirth) return "Enter your date of birth.";
      if (address.trim().length < 8) return "Enter your residential address.";
      if (!city.trim()) return "Enter your city.";
      if (!stateName.trim()) return "Enter your state.";
      if (!emergencyName.trim() || emergencyPhone.replace(/\D/g, "").length < 10) {
        return "Enter emergency contact name and phone.";
      }
    }

    if (current === 2) {
      if (!vehicleType) return "Select your transportation type.";
      if (motorised && !plateNumber.trim()) {
        return "Enter the plate / registration number.";
      }
      if (!vehicleModel.trim() && !vehicleMake.trim()) {
        return "Enter vehicle make or model.";
      }
    }

    if (current === 3) {
      if (!photoPath) return "Upload a clear photo of your face.";
      if (!idPath || idNumber.trim().length < 5) {
        return "Upload a government ID and enter the ID number.";
      }
      if (licenceRequired && idType !== "DRIVERS_LICENSE") {
        return "Motorised partners must use a driver's licence as the primary ID.";
      }
      if (!acceptedFee) {
        return `Accept the ${RIDE_BRAND.partnerLabel.toLowerCase()} terms before submitting.`;
      }
    }

    return "";
  }

  function goNext() {
    const problem = validateStep(step);
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setStep((value) => Math.min(3, value + 1));
  }

  function goBack() {
    setError("");
    setStep((value) => Math.max(1, value - 1));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const problem = validateStep(3);
    if (problem) {
      setError(problem);
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        router.replace("/login?next=/riders/join");
        return;
      }

      const payload = {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        date_of_birth: dateOfBirth,
        address: address.trim(),
        city: city.trim(),
        state: stateName.trim(),
        emergency_contact_name: emergencyName.trim(),
        emergency_contact_phone: emergencyPhone.trim(),
        vehicle_type: vehicleType,
        vehicle_make: vehicleMake.trim(),
        vehicle_model: vehicleModel.trim(),
        vehicle_year: vehicleYear.trim(),
        plate_number: plateNumber.trim(),
        vehicle_color: vehicleColor.trim(),
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
          ? "Application updated. Rhennie Studio will review your details."
          : "Application submitted. Rhennie Studio will review your identity and approve you."
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
        <Loader2 className="animate-spin text-[#D4AF37]" size={36} />
      </main>
    );
  }

  const locked = existing?.status === "APPROVED";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1A1408,_#0B0B0B_52%)] px-4 py-12 text-white sm:px-6">
      <div className="mx-auto max-w-xl">
        <div className="rounded-[28px] border border-white/10 bg-[#121212] p-7 shadow-2xl sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
                {RIDE_BRAND.name}
              </p>
              <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
                {RIDE_BRAND.partnerHeadline}
              </h1>
              <p className="mt-3 text-sm leading-6 text-white/55">
                {RIDE_BRAND.supportCopy} Complete each step. Bank payout details
                stay private in your portal after approval.
              </p>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#0B0B0B] text-[#D4AF37]">
              <BikeHeroIcon className="h-7 w-7" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {STEPS.map((item) => {
              const active = step === item.id;
              const done = step > item.id;
              return (
                <div key={item.id} className="text-center">
                  <div
                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      active || done
                        ? "bg-[#D4AF37] text-black"
                        : "bg-white/10 text-white/40"
                    }`}
                  >
                    {item.id}
                  </div>
                  <p
                    className={`mt-2 text-[10px] font-semibold uppercase tracking-wider ${
                      active ? "text-[#D4AF37]" : "text-white/35"
                    }`}
                  >
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>

          {existing && (
            <div className="mt-6 rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 p-4">
              <p className="text-sm font-semibold text-[#D4AF37]">
                Application status: {existing.status}
              </p>
              <p className="mt-1 text-sm text-white/60">
                {existing.status === "APPROVED"
                  ? "You are approved. Open the partner portal to go online."
                  : existing.status === "PENDING"
                    ? "Under review. You can still correct details below."
                    : "Your partner account cannot receive jobs right now."}
              </p>
            </div>
          )}

          <form
            id="partner-register"
            onSubmit={handleSubmit}
            className="mt-6 space-y-4"
          >
            {step === 1 && (
              <>
                <Field label="Full legal name">
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={locked}
                    className={inputClass}
                    autoComplete="name"
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
                    autoComplete="email"
                    inputMode="email"
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
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </Field>
                <Field label="Date of birth">
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    disabled={locked}
                    className={inputClass}
                  />
                </Field>
                <Field label="Residential address">
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    disabled={locked}
                    rows={3}
                    className={inputClass}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="City">
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      disabled={locked}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="State">
                    <input
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      required
                      disabled={locked}
                      className={inputClass}
                      placeholder="Lagos"
                    />
                  </Field>
                </div>
                <Field label="Emergency contact name">
                  <input
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    required
                    disabled={locked}
                    className={inputClass}
                  />
                </Field>
                <Field label="Emergency contact number">
                  <input
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    required
                    type="tel"
                    disabled={locked}
                    className={inputClass}
                    inputMode="tel"
                  />
                </Field>
              </>
            )}

            {step === 2 && (
              <>
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Vehicle make">
                    <input
                      value={vehicleMake}
                      onChange={(e) => setVehicleMake(e.target.value)}
                      disabled={locked}
                      className={inputClass}
                      placeholder="Bajaj, Toyota…"
                    />
                  </Field>
                  <Field label="Vehicle model">
                    <input
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      disabled={locked}
                      className={inputClass}
                      placeholder="Boxer, Corolla…"
                    />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Vehicle year">
                    <input
                      value={vehicleYear}
                      onChange={(e) => setVehicleYear(e.target.value)}
                      disabled={locked}
                      className={inputClass}
                      inputMode="numeric"
                      placeholder="2020"
                    />
                  </Field>
                  <Field label="Vehicle colour">
                    <input
                      value={vehicleColor}
                      onChange={(e) => setVehicleColor(e.target.value)}
                      disabled={locked}
                      className={inputClass}
                    />
                  </Field>
                </div>
                {motorised ? (
                  <Field label="Plate / registration number">
                    <input
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      required
                      disabled={locked}
                      className={inputClass}
                      placeholder="ABC-123DE"
                    />
                  </Field>
                ) : (
                  <p className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/55">
                    Bicycle partners do not need a plate number or motor-vehicle
                    documents.
                  </p>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <Field label="Live / clear face photo">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="user"
                    disabled={locked || uploading}
                    className={inputClass}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadFile(file, "photo");
                    }}
                  />
                  <p className="mt-2 text-xs text-white/45">
                    Position your face clearly inside the frame. Prefer the
                    camera on your phone over an old gallery photo.
                  </p>
                  {photoName ? (
                    <p className="mt-2 text-xs text-[#D4AF37]">{photoName}</p>
                  ) : null}
                </Field>

                <Field label="Government-issued ID type">
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    disabled={locked}
                    className={inputClass}
                  >
                    {idOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  {licenceRequired ? (
                    <p className="mt-2 text-xs text-white/45">
                      Driver&apos;s licence is required for this vehicle type.
                    </p>
                  ) : null}
                </Field>

                <Field label="ID number">
                  <input
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    required
                    disabled={locked}
                    className={inputClass}
                  />
                </Field>

                <Field label="ID document photo or PDF">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    disabled={locked || uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void uploadFile(file, "id");
                    }}
                    className="block w-full text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-[#D4AF37] file:px-4 file:py-2 file:text-xs file:font-bold file:text-black"
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
                      Customers do not pay the commission as a separate charge.
                    </li>
                    <li>
                      You receive {100 - commissionPercent}% of the delivery fee.
                      Tips are yours in full.
                    </li>
                    <li>
                      Bank payout details are collected privately in the partner
                      portal — never shown to customers.
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
                    I accept the {RIDE_BRAND.partnerLabel.toLowerCase()} terms,
                    including the {commissionPercent}% platform commission.
                  </span>
                </label>
              </>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}
            {message && <p className="text-sm text-green-400">{message}</p>}

            {!locked && (
              <div className="flex flex-col gap-3 sm:flex-row">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-full border border-white/20 text-sm font-bold text-white"
                  >
                    Back
                  </button>
                ) : null}
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-full bg-[#D4AF37] text-sm font-bold text-black"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || uploading}
                    className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-full bg-[#D4AF37] text-sm font-bold text-black disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : existing ? (
                      "Update application"
                    ) : (
                      "Submit application"
                    )}
                  </button>
                )}
              </div>
            )}
          </form>

          <div className="mt-8 flex flex-wrap gap-4 text-sm">
            {existing?.status === "APPROVED" && (
              <Link href="/riders/portal" className="text-[#D4AF37]">
                Partner portal
              </Link>
            )}
            <Link href="/forgot-password" className="text-[#D4AF37]/80">
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
  "w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-[#D4AF37] disabled:opacity-60";

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
