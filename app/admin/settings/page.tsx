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
    } catch {
      // Keep default 5%
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
    </main>
  );
}