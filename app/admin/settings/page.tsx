"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type SiteSettings = {
  id: string;
  business_name: string | null;
  tagline: string | null;
  phone_1: string | null;
  phone_2: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  created_at: string;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [commissionPercent, setCommissionPercent] = useState(5);
  const [commissionSaving, setCommissionSaving] = useState(false);
  const [commissionMessage, setCommissionMessage] = useState("");
  const [vehiclePricing, setVehiclePricing] = useState<
    {
      category: string;
      label: string;
      baseFeeNgn: number;
      perKmNgn: number;
      minimumFeeNgn: number;
      largeOrderAdjustmentNgn: number;
      maxDistanceKm: number;
    }[]
  >([]);
  const [vehicleSaving, setVehicleSaving] = useState<string | null>(null);
  const [vehicleMessage, setVehicleMessage] = useState("");
  const [emailTestBusy, setEmailTestBusy] = useState(false);
  const [emailTestMessage, setEmailTestMessage] = useState("");
  const [rideBaseLocation, setRideBaseLocation] = useState(
    "12 Olorunisola Road, Opp. Alowonle Hotel, Ayobo, Lagos, Nigeria"
  );
  const [rideServiceLocations, setRideServiceLocations] = useState(
    [
      "12 Olorunisola Road, Opp. Alowonle Hotel, Ayobo, Lagos, Nigeria",
      "16B Unity Street, Off Kekerejesu, Ikola, Alagbado, Lagos",
    ].join("\n")
  );
  const [rideStartingFee, setRideStartingFee] = useState(800);
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingMessage, setPricingMessage] = useState("");
  const [surge, setSurge] = useState({
    enabled: false,
    multiplier: 1.2,
    reason: "",
    startsAt: "",
    endsAt: "",
    areas: "",
    vehicleCategories: "",
  });
  const [surgeSaving, setSurgeSaving] = useState(false);
  const [surgeMessage, setSurgeMessage] = useState("");
  const [waiting, setWaiting] = useState({
    enabled: true,
    freeWaitingMinutes: 10,
    feePerMinuteNgn: 40,
    maxFeeNgn: 2000,
  });
  const [waitingSaving, setWaitingSaving] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState("");
  const [waitingCharges, setWaitingCharges] = useState<
    {
      id: string;
      delivery_id: string;
      waiting_fee_ngn: number;
      cause: string;
      reason: string;
      status: string;
      chargeable_minutes: number;
      created_at: string;
    }[]
  >([]);
  const [waitingReviewBusy, setWaitingReviewBusy] = useState<string | null>(
    null
  );

  async function loadSettings() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error loading settings:", error);
      setError("Unable to load business settings.");
      setLoading(false);
      return;
    }

    if (!data) {
      setError("Business settings record was not found.");
      setLoading(false);
      return;
    }

    setSettings(data as SiteSettings);
    setLoading(false);
  }

  useEffect(() => {
    loadSettings();
    loadCommission();
  }, []);

  async function loadCommission() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch("/api/admin/ride-settings", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });
      const result = await response.json();
      if (response.ok && Number.isFinite(Number(result?.ride_platform_commission))) {
        setCommissionPercent(Number(result.ride_platform_commission));
      }
      if (response.ok && Array.isArray(result?.vehicle_pricing)) {
        setVehiclePricing(
          result.vehicle_pricing.map(
            (row: {
              category: string;
              label: string;
              baseFeeNgn: number;
              perKmNgn: number;
              minimumFeeNgn: number;
              largeOrderAdjustmentNgn: number;
              maxDistanceKm: number;
            }) => ({
              category: row.category,
              label: row.label,
              baseFeeNgn: row.baseFeeNgn,
              perKmNgn: row.perKmNgn,
              minimumFeeNgn: row.minimumFeeNgn,
              largeOrderAdjustmentNgn: row.largeOrderAdjustmentNgn,
              maxDistanceKm: row.maxDistanceKm,
            })
          )
        );
      }
      if (response.ok) {
        if (result?.ride_base_location) {
          setRideBaseLocation(String(result.ride_base_location));
        }
        if (Array.isArray(result?.ride_service_locations)) {
          setRideServiceLocations(
            result.ride_service_locations
              .map((item: string) => String(item || "").trim())
              .filter(Boolean)
              .join("\n")
          );
        }
        if (Number.isFinite(Number(result?.ride_starting_fee_ngn))) {
          setRideStartingFee(Number(result.ride_starting_fee_ngn));
        }
        if (result?.surge) {
          setSurge({
            enabled: Boolean(result.surge.enabled),
            multiplier: Math.max(1, Number(result.surge.multiplier) || 1),
            reason: String(result.surge.reason || ""),
            startsAt: result.surge.startsAt
              ? String(result.surge.startsAt).slice(0, 16)
              : "",
            endsAt: result.surge.endsAt
              ? String(result.surge.endsAt).slice(0, 16)
              : "",
            areas: String(result.surge.areas || ""),
            vehicleCategories: String(result.surge.vehicleCategories || ""),
          });
        }
        if (result?.waiting) {
          setWaiting({
            enabled: result.waiting.enabled !== false,
            freeWaitingMinutes: Math.max(
              0,
              Number(result.waiting.freeWaitingMinutes) || 0
            ),
            feePerMinuteNgn: Math.max(
              0,
              Number(result.waiting.feePerMinuteNgn) || 0
            ),
            maxFeeNgn: Math.max(0, Number(result.waiting.maxFeeNgn) || 0),
          });
        }
      }

      const waitingRes = await fetch("/api/admin/ride-waiting", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });
      const waitingJson = await waitingRes.json();
      if (waitingRes.ok && Array.isArray(waitingJson?.charges)) {
        setWaitingCharges(waitingJson.charges);
      }
    } catch {
      // Keep defaults
    }
  }

  async function authHeaders() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return null;
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    };
  }

  async function saveBasePricing() {
    setPricingSaving(true);
    setPricingMessage("");
    try {
      const headers = await authHeaders();
      if (!headers) {
        setPricingMessage("Sign in as Rhennie Studio to save.");
        return;
      }
      const locations = rideServiceLocations
        .split(/\n|;/)
        .map((item) => item.trim())
        .filter(Boolean);
      const response = await fetch("/api/admin/ride-settings", {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          ride_base_location: rideBaseLocation,
          ride_service_locations: locations,
          ride_starting_fee_ngn: rideStartingFee,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to save location settings.");
      }
      if (Array.isArray(result.ride_service_locations)) {
        setRideServiceLocations(result.ride_service_locations.join("\n"));
      }
      if (result.ride_base_location) {
        setRideBaseLocation(String(result.ride_base_location));
      }
      setPricingMessage("Operating locations and starting fee saved.");
    } catch (err) {
      setPricingMessage(
        err instanceof Error ? err.message : "Unable to save pricing."
      );
    } finally {
      setPricingSaving(false);
    }
  }

  async function saveSurge() {
    setSurgeSaving(true);
    setSurgeMessage("");
    try {
      const headers = await authHeaders();
      if (!headers) {
        setSurgeMessage("Sign in as Rhennie Studio to save.");
        return;
      }
      const response = await fetch("/api/admin/ride-settings", {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          surge: {
            enabled: surge.enabled,
            multiplier: surge.multiplier,
            reason: surge.reason,
            startsAt: surge.startsAt || null,
            endsAt: surge.endsAt || null,
            areas: surge.areas,
            vehicleCategories: surge.vehicleCategories,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to save surge settings.");
      }
      setSurgeMessage(
        result.surge_active
          ? "Surge settings saved — currently ACTIVE for customers."
          : "Surge settings saved."
      );
    } catch (err) {
      setSurgeMessage(
        err instanceof Error ? err.message : "Unable to save surge settings."
      );
    } finally {
      setSurgeSaving(false);
    }
  }

  async function saveWaiting() {
    setWaitingSaving(true);
    setWaitingMessage("");
    try {
      const headers = await authHeaders();
      if (!headers) {
        setWaitingMessage("Sign in as Rhennie Studio to save.");
        return;
      }
      const response = await fetch("/api/admin/ride-settings", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ waiting }),
      });
      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to save waiting settings.");
      }
      setWaitingMessage("Waiting fee settings saved.");
    } catch (err) {
      setWaitingMessage(
        err instanceof Error ? err.message : "Unable to save waiting settings."
      );
    } finally {
      setWaitingSaving(false);
    }
  }

  async function reviewWaitingCharge(
    chargeId: string,
    status: "applied" | "waived"
  ) {
    setWaitingReviewBusy(chargeId);
    try {
      const headers = await authHeaders();
      if (!headers) return;
      const response = await fetch("/api/admin/ride-waiting", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ charge_id: chargeId, status }),
      });
      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to update waiting charge.");
      }
      setWaitingCharges((current) =>
        current.map((row) =>
          row.id === chargeId ? { ...row, status } : row
        )
      );
    } catch (err) {
      setWaitingMessage(
        err instanceof Error ? err.message : "Unable to update waiting charge."
      );
    } finally {
      setWaitingReviewBusy(null);
    }
  }

  async function saveCommission() {
    setCommissionSaving(true);
    setCommissionMessage("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setCommissionMessage("Sign in as Rhennie Studio to save.");
        return;
      }

      const response = await fetch("/api/admin/ride-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ride_platform_commission: commissionPercent,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to save commission.");
      }
      setCommissionMessage(
        `Ride with 701 platform commission saved at ${commissionPercent}%.`
      );
    } catch (err) {
      setCommissionMessage(
        err instanceof Error ? err.message : "Unable to save commission."
      );
    } finally {
      setCommissionSaving(false);
    }
  }

  async function sendTestEmail() {
    setEmailTestBusy(true);
    setEmailTestMessage("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setEmailTestMessage("Sign in as Rhennie Studio to send a test.");
        return;
      }

      const response = await fetch("/api/admin/email-test", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to send test email.");
      }
      setEmailTestMessage(
        `${result.message}${result.messageId ? ` · ID ${result.messageId}` : ""}`
      );
    } catch (err) {
      setEmailTestMessage(
        err instanceof Error ? err.message : "Unable to send test email."
      );
    } finally {
      setEmailTestBusy(false);
    }
  }

  async function saveVehicleRow(category: string) {
    const row = vehiclePricing.find((item) => item.category === category);
    if (!row) return;

    setVehicleSaving(category);
    setVehicleMessage("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setVehicleMessage("Sign in as Rhennie Studio to save.");
        return;
      }

      const response = await fetch("/api/admin/ride-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          vehicle_pricing: row,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to save vehicle pricing.");
      }
      setVehicleMessage(result.message || `${row.label} pricing saved.`);
    } catch (err) {
      setVehicleMessage(
        err instanceof Error ? err.message : "Unable to save vehicle pricing."
      );
    } finally {
      setVehicleSaving(null);
    }
  }

  function updateField(
    field: keyof SiteSettings,
    value: string
  ) {
    if (!settings) return;

    setSettings({
      ...settings,
      [field]: value,
    });

    setSuccess("");
    setError("");
  }

  async function handleSave(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!settings) return;

    setSaving(true);
    setSuccess("");
    setError("");

    const { error } = await supabase
      .from("site_settings")
      .update({
        business_name: settings.business_name,
        tagline: settings.tagline,
        phone_1: settings.phone_1,
        phone_2: settings.phone_2,
        whatsapp: settings.whatsapp,
        email: settings.email,
        address: settings.address,
        facebook: settings.facebook,
        instagram: settings.instagram,
        tiktok: settings.tiktok,
        hero_title: settings.hero_title,
        hero_subtitle: settings.hero_subtitle,
      })
      .eq("id", settings.id);

    setSaving(false);

    if (error) {
      console.error("Error saving settings:", error);
      setError(`Unable to save settings: ${error.message}`);
      return;
    }

    setSuccess("Business settings saved successfully.");

    await loadSettings();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F5F0] p-6 md:p-10">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-[#C89B3C]" />

            <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-black/40">
              Loading Settings
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!settings) {
    return (
      <main className="min-h-screen bg-[#F7F5F0] p-6 md:p-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
          {error || "Business settings could not be loaded."}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5F0] p-6 md:p-10">
      {/* Header */}
      <div className="mb-8">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.3em] text-[#C89B3C]">
          Rhennie Studio
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-[#171717] md:text-4xl">
          Business Settings
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
          Manage the business information displayed across your Rhennie Tasty
          Shack website.
        </p>
      </div>

      {/* Success */}
      {success && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSave}>
        <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:p-8">

          {/* Business Information */}
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C89B3C]">
              Business Information
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#171717]">
              General Details
            </h2>
          </div>

          <div className="space-y-6">

            {/* Business Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#171717]">
                Business Name
              </label>

              <input
                type="text"
                value={settings.business_name || ""}
                onChange={(e) =>
                  updateField("business_name", e.target.value)
                }
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#C89B3C] focus:ring-2 focus:ring-[#C89B3C]/10"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#171717]">
                Tagline
              </label>

              <input
                type="text"
                value={settings.tagline || ""}
                onChange={(e) =>
                  updateField("tagline", e.target.value)
                }
                placeholder="Premium Taste • Fast Delivery"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#C89B3C] focus:ring-2 focus:ring-[#C89B3C]/10"
              />
            </div>

            {/* Hero Title */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#171717]">
                Website Hero Title
              </label>

              <input
                type="text"
                value={settings.hero_title || ""}
                onChange={(e) =>
                  updateField("hero_title", e.target.value)
                }
                placeholder="Luxury Dining At Your Doorstep"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#C89B3C] focus:ring-2 focus:ring-[#C89B3C]/10"
              />
            </div>

            {/* Hero Subtitle / Description */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#171717]">
                Business Description
              </label>

              <textarea
                rows={4}
                value={settings.hero_subtitle || ""}
                onChange={(e) =>
                  updateField("hero_subtitle", e.target.value)
                }
                placeholder="Premium meals, curated food boxes, meal subscriptions, and bespoke event catering."
                className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#C89B3C] focus:ring-2 focus:ring-[#C89B3C]/10"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="mb-8 mt-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C89B3C]">
              Contact Information
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#171717]">
              Contact Details
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">

            {/* Phone 1 */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#171717]">
                Phone Number
              </label>

              <input
                type="text"
                value={settings.phone_1 || ""}
                onChange={(e) =>
                  updateField("phone_1", e.target.value)
                }
                className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#C89B3C]"
              />
            </div>

            {/* Phone 2 */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#171717]">
                Alternative Phone Number
              </label>

              <input
                type="text"
                value={settings.phone_2 || ""}
                onChange={(e) =>
                  updateField("phone_2", e.target.value)
                }
                placeholder="Optional"
                className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#C89B3C]"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#171717]">
                WhatsApp Number
              </label>

              <input
                type="text"
                value={settings.whatsapp || ""}
                onChange={(e) =>
                  updateField("whatsapp", e.target.value)
                }
                className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#C89B3C]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#171717]">
                Email Address
              </label>

              <input
                type="email"
                value={settings.email || ""}
                onChange={(e) =>
                  updateField("email", e.target.value)
                }
                className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#C89B3C]"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-[#171717]">
                Business Address
              </label>

              <input
                type="text"
                value={settings.address || ""}
                onChange={(e) =>
                  updateField("address", e.target.value)
                }
                className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#C89B3C]"
              />
            </div>
          </div>

          {/* Social Media */}
          <div className="mb-8 mt-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C89B3C]">
              Social Media
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#171717]">
              Social Accounts
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">

            {/* Facebook */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#171717]">
                Facebook
              </label>

              <input
                type="text"
                value={settings.facebook || ""}
                onChange={(e) =>
                  updateField("facebook", e.target.value)
                }
                placeholder="Rhennie Tasty Shack"
                className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#C89B3C]"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#171717]">
                Instagram
              </label>

              <input
                type="text"
                value={settings.instagram || ""}
                onChange={(e) =>
                  updateField("instagram", e.target.value)
                }
                placeholder="@rhennietastyshack"
                className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#C89B3C]"
              />
            </div>

            {/* TikTok */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#171717]">
                TikTok
              </label>

              <input
                type="text"
                value={settings.tiktok || ""}
                onChange={(e) =>
                  updateField("tiktok", e.target.value)
                }
                placeholder="@rhennietastyshack"
                className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#C89B3C]"
              />
            </div>
          </div>

          {/* Save */}
          <div className="mt-10 flex justify-end border-t border-black/5 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#C89B3C] px-7 py-3 text-sm font-bold text-black transition hover:bg-[#B88A2E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </section>
      </form>

      <section className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C89B3C]">
          Ride with 701
        </p>
        <h2 className="mt-1 text-xl font-semibold text-[#171717]">
          Operating locations & starting fee
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
          Primary base plus any additional Ride with 701 operating locations.
          Quotes still vary by distance and vehicle — this is not a flat charge.
        </p>
        <div className="mt-6 grid gap-4">
          <label className="block text-sm font-semibold text-[#171717]">
            Primary base location
            <input
              type="text"
              value={rideBaseLocation}
              onChange={(event) => setRideBaseLocation(event.target.value)}
              className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#C89B3C]"
            />
          </label>
          <label className="block text-sm font-semibold text-[#171717]">
            Service locations (one per line)
            <textarea
              rows={4}
              value={rideServiceLocations}
              onChange={(event) => setRideServiceLocations(event.target.value)}
              className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#C89B3C]"
            />
          </label>
          <label className="block max-w-xs text-sm font-semibold text-[#171717]">
            Starting delivery fee (₦)
            <input
              type="number"
              min={0}
              value={rideStartingFee}
              onChange={(event) =>
                setRideStartingFee(Number(event.target.value) || 0)
              }
              className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#C89B3C]"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={() => void saveBasePricing()}
          disabled={pricingSaving}
          className="mt-5 rounded-xl bg-[#0B0B0B] px-7 py-3 text-sm font-bold text-[#D4AF37] transition hover:bg-[#171717] disabled:opacity-60"
        >
          {pricingSaving ? "Saving..." : "Save base pricing"}
        </button>
        {pricingMessage ? (
          <p className="mt-4 text-sm text-black/60">{pricingMessage}</p>
        ) : null}
      </section>

      <section className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C89B3C]">
          Ride with 701
        </p>
        <h2 className="mt-1 text-xl font-semibold text-[#171717]">
          Surge pricing
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
          When active, surge is shown to customers before they confirm delivery.
          Leave areas/vehicles blank to apply broadly.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-3 text-sm font-semibold text-[#171717]">
            <input
              type="checkbox"
              checked={surge.enabled}
              onChange={(event) =>
                setSurge((current) => ({
                  ...current,
                  enabled: event.target.checked,
                }))
              }
            />
            Enable surge pricing
          </label>
          <label className="block text-sm font-semibold text-[#171717]">
            Multiplier
            <input
              type="number"
              min={1}
              step={0.1}
              value={surge.multiplier}
              onChange={(event) =>
                setSurge((current) => ({
                  ...current,
                  multiplier: Number(event.target.value) || 1,
                }))
              }
              className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#C89B3C]"
            />
          </label>
          <label className="block text-sm font-semibold text-[#171717] md:col-span-2">
            Reason shown to customers
            <input
              type="text"
              value={surge.reason}
              onChange={(event) =>
                setSurge((current) => ({
                  ...current,
                  reason: event.target.value,
                }))
              }
              placeholder="High demand / peak period / weather"
              className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#C89B3C]"
            />
          </label>
          <label className="block text-sm font-semibold text-[#171717]">
            Starts at
            <input
              type="datetime-local"
              value={surge.startsAt}
              onChange={(event) =>
                setSurge((current) => ({
                  ...current,
                  startsAt: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#C89B3C]"
            />
          </label>
          <label className="block text-sm font-semibold text-[#171717]">
            Ends at
            <input
              type="datetime-local"
              value={surge.endsAt}
              onChange={(event) =>
                setSurge((current) => ({
                  ...current,
                  endsAt: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#C89B3C]"
            />
          </label>
          <label className="block text-sm font-semibold text-[#171717]">
            Affected areas (comma-separated)
            <input
              type="text"
              value={surge.areas}
              onChange={(event) =>
                setSurge((current) => ({
                  ...current,
                  areas: event.target.value,
                }))
              }
              placeholder="lekki, ikoyi"
              className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#C89B3C]"
            />
          </label>
          <label className="block text-sm font-semibold text-[#171717]">
            Vehicle categories (comma-separated)
            <input
              type="text"
              value={surge.vehicleCategories}
              onChange={(event) =>
                setSurge((current) => ({
                  ...current,
                  vehicleCategories: event.target.value,
                }))
              }
              placeholder="motorcycle, car, van"
              className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#C89B3C]"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={() => void saveSurge()}
          disabled={surgeSaving}
          className="mt-5 rounded-xl bg-[#0B0B0B] px-7 py-3 text-sm font-bold text-[#D4AF37] transition hover:bg-[#171717] disabled:opacity-60"
        >
          {surgeSaving ? "Saving..." : "Save surge settings"}
        </button>
        {surgeMessage ? (
          <p className="mt-4 text-sm text-black/60">{surgeMessage}</p>
        ) : null}
      </section>

      <section className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C89B3C]">
          Ride with 701
        </p>
        <h2 className="mt-1 text-xl font-semibold text-[#171717]">
          Waiting / delay fees
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
          Only for customer/sender/receiver delays after the free waiting
          period. Never included in the initial delivery quote.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-3 text-sm font-semibold text-[#171717] md:col-span-2">
            <input
              type="checkbox"
              checked={waiting.enabled}
              onChange={(event) =>
                setWaiting((current) => ({
                  ...current,
                  enabled: event.target.checked,
                }))
              }
            />
            Enable waiting fees
          </label>
          <label className="block text-sm font-semibold text-[#171717]">
            Free waiting (minutes)
            <input
              type="number"
              min={0}
              value={waiting.freeWaitingMinutes}
              onChange={(event) =>
                setWaiting((current) => ({
                  ...current,
                  freeWaitingMinutes: Number(event.target.value) || 0,
                }))
              }
              className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#C89B3C]"
            />
          </label>
          <label className="block text-sm font-semibold text-[#171717]">
            Fee per minute (₦)
            <input
              type="number"
              min={0}
              value={waiting.feePerMinuteNgn}
              onChange={(event) =>
                setWaiting((current) => ({
                  ...current,
                  feePerMinuteNgn: Number(event.target.value) || 0,
                }))
              }
              className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#C89B3C]"
            />
          </label>
          <label className="block text-sm font-semibold text-[#171717]">
            Maximum waiting charge (₦)
            <input
              type="number"
              min={0}
              value={waiting.maxFeeNgn}
              onChange={(event) =>
                setWaiting((current) => ({
                  ...current,
                  maxFeeNgn: Number(event.target.value) || 0,
                }))
              }
              className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#C89B3C]"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={() => void saveWaiting()}
          disabled={waitingSaving}
          className="mt-5 rounded-xl bg-[#0B0B0B] px-7 py-3 text-sm font-bold text-[#D4AF37] transition hover:bg-[#171717] disabled:opacity-60"
        >
          {waitingSaving ? "Saving..." : "Save waiting settings"}
        </button>
        {waitingMessage ? (
          <p className="mt-4 text-sm text-black/60">{waitingMessage}</p>
        ) : null}

        <div className="mt-8 border-t border-black/5 pt-6">
          <h3 className="text-sm font-semibold text-[#171717]">
            Recent waiting charges
          </h3>
          {waitingCharges.length === 0 ? (
            <p className="mt-3 text-sm text-black/45">No waiting charges yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {waitingCharges.slice(0, 12).map((charge) => (
                <div
                  key={charge.id}
                  className="rounded-xl border border-black/8 bg-[#F8F6F2] p-4 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-[#171717]">
                      ₦{Number(charge.waiting_fee_ngn || 0).toLocaleString("en-NG")} ·{" "}
                      {charge.cause}
                    </p>
                    <span className="text-[11px] uppercase tracking-wider text-black/45">
                      {charge.status}
                    </span>
                  </div>
                  <p className="mt-1 text-black/55">{charge.reason}</p>
                  <p className="mt-1 text-xs text-black/40">
                    {charge.chargeable_minutes} chargeable min · delivery{" "}
                    {String(charge.delivery_id).slice(0, 8)}
                  </p>
                  {charge.status === "pending" ? (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        disabled={waitingReviewBusy === charge.id}
                        onClick={() =>
                          void reviewWaitingCharge(charge.id, "applied")
                        }
                        className="rounded-full bg-[#0B0B0B] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] disabled:opacity-60"
                      >
                        Apply
                      </button>
                      <button
                        type="button"
                        disabled={waitingReviewBusy === charge.id}
                        onClick={() =>
                          void reviewWaitingCharge(charge.id, "waived")
                        }
                        className="rounded-full border border-black/15 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-black/60 disabled:opacity-60"
                      >
                        Waive
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C89B3C]">
          Ride with 701
        </p>
        <h2 className="mt-1 text-xl font-semibold text-[#171717]">
          Platform commission
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
          Rhennie Tasty Shack keeps this percent of each delivery partner&apos;s
          gross Ride with 701 delivery fee. Customers only see one delivery
          amount — never a separate RTS commission line.
        </p>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="w-full max-w-xs">
            <label className="mb-2 block text-sm font-semibold text-[#171717]">
              Commission percent
            </label>
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={commissionPercent}
              onChange={(event) =>
                setCommissionPercent(Number(event.target.value) || 0)
              }
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#C89B3C] focus:ring-2 focus:ring-[#C89B3C]/10"
            />
          </div>
          <button
            type="button"
            onClick={saveCommission}
            disabled={commissionSaving}
            className="rounded-xl bg-[#0B0B0B] px-7 py-3 text-sm font-bold text-[#D4AF37] transition hover:bg-[#171717] disabled:opacity-60"
          >
            {commissionSaving ? "Saving..." : "Save commission"}
          </button>
        </div>

        {commissionMessage ? (
          <p className="mt-4 text-sm text-black/60">{commissionMessage}</p>
        ) : null}
      </section>

      <section className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C89B3C]">
          Ride with 701
        </p>
        <h2 className="mt-1 text-xl font-semibold text-[#171717]">
          Vehicle delivery rates
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
          Each transportation type has its own base fee and per-kilometre rate.
          Delivery starts from ₦800 and varies by distance and vehicle.
          Customers still see one Ride with 701 Delivery line.
        </p>

        <div className="mt-6 space-y-4">
          {vehiclePricing.map((row) => (
            <div
              key={row.category}
              className="rounded-2xl border border-black/8 bg-[#F8F6F2] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-bold text-[#171717]">{row.label}</p>
                <button
                  type="button"
                  onClick={() => saveVehicleRow(row.category)}
                  disabled={vehicleSaving === row.category}
                  className="rounded-full bg-[#0B0B0B] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#D4AF37] disabled:opacity-60"
                >
                  {vehicleSaving === row.category ? "Saving..." : "Save"}
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {(
                  [
                    ["baseFeeNgn", "Base ₦"],
                    ["perKmNgn", "Per km ₦"],
                    ["minimumFeeNgn", "Minimum ₦"],
                    ["largeOrderAdjustmentNgn", "Large order ₦"],
                    ["maxDistanceKm", "Max km"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="block text-[11px] font-semibold text-black/55">
                    {label}
                    <input
                      type="number"
                      min={0}
                      value={row[key]}
                      onChange={(event) =>
                        setVehiclePricing((current) =>
                          current.map((item) =>
                            item.category === row.category
                              ? {
                                  ...item,
                                  [key]: Number(event.target.value) || 0,
                                }
                              : item
                          )
                        )
                      }
                      className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#C89B3C]"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {vehicleMessage ? (
          <p className="mt-4 text-sm text-black/60">{vehicleMessage}</p>
        ) : null}
      </section>

      <section className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C89B3C]">
          Transactional email
        </p>
        <h2 className="mt-1 text-xl font-semibold text-[#171717]">
          Resend connectivity test
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
          Sends one test message to your signed-in Studio email from
          Rhennie Tasty Shack &lt;noreply@rhennietastyshack.com&gt;. No
          arbitrary recipients. Reply-To is not set until a real inbox exists.
        </p>
        <button
          type="button"
          onClick={() => void sendTestEmail()}
          disabled={emailTestBusy}
          className="mt-5 rounded-xl bg-[#0B0B0B] px-7 py-3 text-sm font-bold text-[#D4AF37] transition hover:bg-[#171717] disabled:opacity-60"
        >
          {emailTestBusy ? "Sending..." : "Send test email to me"}
        </button>
        {emailTestMessage ? (
          <p className="mt-4 text-sm text-black/60">{emailTestMessage}</p>
        ) : null}
      </section>
    </main>
  );
}