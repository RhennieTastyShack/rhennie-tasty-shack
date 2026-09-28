"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import {
  DELIVERY_STATUS_FLOW,
  DeliveryStatus,
  getDeliveryStatusLabel,
} from "@/lib/delivery";
import { supabase } from "@/lib/supabase";
import { NIGERIAN_BANKS } from "@/lib/banks";

type Rider = {
  id: string;
  full_name: string;
  phone: string;
  status: string;
  is_available: boolean;
  vehicle_type: string | null;
  photo_url?: string | null;
  plate_number?: string | null;
  vehicle_color?: string | null;
  vehicle_model?: string | null;
  bank_name?: string | null;
  bank_account_name?: string | null;
  bank_account_number?: string | null;
};

type DeliveryRow = {
  id: string;
  status: DeliveryStatus;
  tracking_token: string;
  mode: string;
  updated_at: string;
  order_code?: string | null;
  orders?: {
    id: string;
    order_no?: string | null;
    order_number?: string | null;
    customer_name?: string | null;
    customer_phone?: string | null;
    delivery_address?: string | null;
    total?: number | null;
    amount?: number | null;
  } | null;
};

const NEXT_STATUS: Partial<Record<DeliveryStatus, DeliveryStatus>> = {
  ASSIGNED: "PICKED_UP",
  PICKED_UP: "ON_THE_WAY",
  ON_THE_WAY: "DELIVERED",
};

export default function RiderPortalPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [rider, setRider] = useState<Rider | null>(null);
  const [deliveries, setDeliveries] = useState<DeliveryRow[]>([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [bankName, setBankName] = useState("GTBank");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [savingBank, setSavingBank] = useState(false);
  const [plateNumber, setPlateNumber] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [savingBike, setSavingBike] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const profileLoaded = useRef(false);
  const deliveriesRef = useRef(deliveries);
  deliveriesRef.current = deliveries;
  const [locationNote, setLocationNote] = useState("");

  async function getToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  async function loadPortal() {
    const token = await getToken();

    if (!token) {
      router.replace("/login?next=/riders/portal");
      return;
    }

    const profileRes = await fetch("/api/riders?scope=me", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const profileJson = await profileRes.json();

    if (!profileJson?.rider) {
      router.replace("/riders/join");
      return;
    }

    setRider(profileJson.rider);
    if (!profileLoaded.current) {
      profileLoaded.current = true;
      const profile = profileJson.rider as Rider;
      if (profile.bank_name) setBankName(profile.bank_name);
      if (profile.bank_account_name) setAccountName(profile.bank_account_name);
      if (profile.bank_account_number) setAccountNumber(profile.bank_account_number);
      if (profile.plate_number) setPlateNumber(profile.plate_number);
      if (profile.vehicle_color) setVehicleColor(profile.vehicle_color);
      if (profile.vehicle_model) setVehicleModel(profile.vehicle_model);
    }

    if (profileJson.rider.status !== "APPROVED") {
      setChecking(false);
      setDeliveries([]);
      return;
    }

    const deliveriesRes = await fetch("/api/deliveries?scope=mine", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const deliveriesJson = await deliveriesRes.json();

    if (!deliveriesRes.ok || !deliveriesJson?.success) {
      setError(deliveriesJson?.message || "Unable to load deliveries.");
      setDeliveries([]);
    } else {
      setError("");
      setDeliveries(deliveriesJson.deliveries || []);
    }

    setChecking(false);
  }

  useEffect(() => {
    loadPortal();
    const interval = window.setInterval(loadPortal, 20000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const sharingLocation = deliveries.some((delivery) =>
    ["ASSIGNED", "PICKED_UP", "ON_THE_WAY"].includes(delivery.status)
  );

  useEffect(() => {
    if (!sharingLocation) {
      setLocationNote("");
      return;
    }

    if (!navigator.geolocation) {
      setLocationNote("This phone cannot share location.");
      return;
    }

    let lastSent = 0;
    let lastPoint: { lat: number; lng: number } | null = null;
    let stopped = false;

    async function publish(position: GeolocationPosition) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const now = Date.now();
      const moved = !lastPoint
        ? true
        : Math.hypot(lat - lastPoint.lat, lng - lastPoint.lng) * 111000 >= 15;

      if (!moved && now - lastSent < 15000) return;
      if (now - lastSent < 4000) return;

      lastSent = now;
      lastPoint = { lat, lng };

      const token = await getToken();
      if (!token || stopped) return;

      const activeDeliveries = deliveriesRef.current.filter((delivery) =>
        ["ASSIGNED", "PICKED_UP", "ON_THE_WAY"].includes(delivery.status)
      );

      const results = await Promise.all(
        activeDeliveries.map((delivery) =>
          fetch("/api/deliveries", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              delivery_id: delivery.id,
              latitude: lat,
              longitude: lng,
              by: "rider",
            }),
          })
        )
      );

      if (stopped) return;
      if (results.some((response) => response.ok)) {
        setLocationNote("Live location is on. The customer map moves with you.");
      } else {
        setLocationNote("Location could not be saved. Stay signed in as the assigned rider.");
      }
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        void publish(position);
      },
      (geoError) => {
        setLocationNote(
          geoError.code === geoError.PERMISSION_DENIED
            ? "Allow location for this site so customers can follow you."
            : "Waiting for a GPS fix."
        );
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );

    return () => {
      stopped = true;
      navigator.geolocation.clearWatch(watchId);
    };
  }, [sharingLocation]);

  async function toggleAvailability() {
    if (!rider) return;
    setToggling(true);

    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch("/api/riders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_available: !rider.is_available,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to update availability.");
      }

      setRider(result.rider);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update availability."
      );
    } finally {
      setToggling(false);
    }
  }

  async function advanceStatus(delivery: DeliveryRow) {
    const next = NEXT_STATUS[delivery.status];
    if (!next) return;

    setBusyId(delivery.id);

    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch("/api/deliveries", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          delivery_id: delivery.id,
          status: next,
          by: "rider",
          order_code:
            next === "DELIVERED" ? codes[delivery.id] || "" : undefined,
          note: `Marked ${getDeliveryStatusLabel(next).toLowerCase()} by rider`,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to update status.");
      }

      await loadPortal();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update status."
      );
    } finally {
      setBusyId(null);
    }
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B]">
        <Loader2 className="animate-spin text-[#F26A21]" size={36} />
      </main>
    );
  }

  if (!rider) {
    return null;
  }

  if (rider.status !== "APPROVED") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B0B0B] px-4">
        <div className="max-w-md rounded-[28px] border border-white/10 bg-[#141414] p-8 text-center text-white">
          <h1 className="font-serif text-2xl font-bold">
            Portal locked
          </h1>
          <p className="mt-3 text-sm text-white/55">
            Your rider status is {rider.status}. Only approved riders can
            manage deliveries.
          </p>
          <Link
            href="/riders/join"
            className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#F26A21] px-6 text-sm font-bold"
          >
            View application
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0B0B] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-[#F26A21]">
              Rider portal
            </p>
            <h1 className="mt-2 font-serif text-3xl font-bold">
              {rider.full_name}
            </h1>
            <p className="mt-2 text-sm text-white/50">
              {rider.phone}
              {rider.vehicle_type ? ` · ${rider.vehicle_type}` : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={toggleAvailability}
            disabled={toggling}
            className={`inline-flex min-h-[48px] items-center justify-center rounded-full px-6 text-sm font-bold transition ${
              rider.is_available
                ? "bg-green-500 text-black"
                : "border border-white/20 bg-transparent text-white"
            }`}
          >
            {toggling
              ? "Updating..."
              : rider.is_available
                ? "Available"
                : "Go available"}
          </button>
        </div>

        {error && (
          <p className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {locationNote && (
          <p className="mt-6 rounded-2xl border border-[#F26A21]/30 bg-[#F26A21]/10 px-4 py-3 text-sm text-white">
            {locationNote}
          </p>
        )}

        <section className="mt-8 rounded-[24px] border border-white/10 bg-[#141414] p-5">
          <h2 className="font-serif text-xl font-bold">You and your bike</h2>
          <p className="mt-2 text-sm text-white/50">
            Customers see your photo, plate, model, and colour on the tracking map.
          </p>
          {rider.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={rider.photo_url}
              alt={rider.full_name}
              className="mt-4 h-24 w-24 rounded-2xl object-cover"
            />
          )}
          <label className="mt-4 block text-sm text-white/70">
            Upload photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploadingPhoto}
              className="mt-2 block w-full text-sm"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setUploadingPhoto(true);
                setError("");
                try {
                  const token = await getToken();
                  const body = new FormData();
                  body.set("file", file);
                  body.set("kind", "photo");
                  const upload = await fetch("/api/riders/id", {
                    method: "POST",
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    body,
                  });
                  const uploaded = await upload.json();
                  if (!upload.ok || !uploaded?.path) {
                    throw new Error(uploaded?.message || "Unable to upload photo.");
                  }
                  const response = await fetch("/api/riders", {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ photo_path: uploaded.path }),
                  });
                  const result = await response.json();
                  if (!response.ok || !result?.success) {
                    throw new Error(result?.message || "Unable to save photo.");
                  }
                  setRider((current) =>
                    current
                      ? { ...current, ...result.rider, photo_url: current.photo_url }
                      : result.rider
                  );
                  await loadPortal();
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Unable to upload photo.");
                } finally {
                  setUploadingPhoto(false);
                }
              }}
            />
          </label>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              value={plateNumber}
              onChange={(event) => setPlateNumber(event.target.value)}
              placeholder="Plate number"
              className="min-h-[44px] rounded-xl border border-white/15 bg-black px-3 text-sm"
            />
            <input
              value={vehicleModel}
              onChange={(event) => setVehicleModel(event.target.value)}
              placeholder="Model"
              className="min-h-[44px] rounded-xl border border-white/15 bg-black px-3 text-sm"
            />
            <input
              value={vehicleColor}
              onChange={(event) => setVehicleColor(event.target.value)}
              placeholder="Colour"
              className="min-h-[44px] rounded-xl border border-white/15 bg-black px-3 text-sm"
            />
          </div>
          <button
            type="button"
            disabled={savingBike}
            onClick={async () => {
              setSavingBike(true);
              setError("");
              try {
                const token = await getToken();
                const response = await fetch("/api/riders", {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    plate_number: plateNumber,
                    vehicle_model: vehicleModel,
                    vehicle_color: vehicleColor,
                  }),
                });
                const result = await response.json();
                if (!response.ok || !result?.success) {
                  throw new Error(result?.message || "Unable to save bike details.");
                }
                setRider((current) =>
                  current
                    ? { ...current, ...result.rider, photo_url: current.photo_url }
                    : result.rider
                );
              } catch (err) {
                setError(err instanceof Error ? err.message : "Unable to save bike details.");
              } finally {
                setSavingBike(false);
              }
            }}
            className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-white px-5 text-sm font-bold text-black"
          >
            {savingBike ? "Saving..." : uploadingPhoto ? "Uploading photo..." : "Save bike details"}
          </button>
        </section>

        <section className="mt-8 rounded-[24px] border border-white/10 bg-[#141414] p-5">
          <h2 className="font-serif text-xl font-bold">Payout account</h2>
          <p className="mt-2 text-sm text-white/50">
            Rhennie keeps 15% of each delivery fee. The remaining fee and the full tip are sent here after the delivery is completed with the customer’s code.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <select
              value={bankName}
              onChange={(event) => setBankName(event.target.value)}
              className="min-h-[44px] rounded-xl border border-white/15 bg-black px-3 text-sm"
            >
              {NIGERIAN_BANKS.map((bank) => (
                <option key={bank.code} value={bank.name}>
                  {bank.name}
                </option>
              ))}
            </select>
            <input
              value={accountNumber}
              onChange={(event) => setAccountNumber(event.target.value)}
              placeholder="Account number"
              className="min-h-[44px] rounded-xl border border-white/15 bg-black px-3 text-sm"
            />
            <input
              value={accountName}
              onChange={(event) => setAccountName(event.target.value)}
              placeholder="Account name"
              className="min-h-[44px] rounded-xl border border-white/15 bg-black px-3 text-sm sm:col-span-2"
            />
          </div>
          <button
            type="button"
            disabled={savingBank}
            onClick={async () => {
              setSavingBank(true);
              setError("");
              try {
                const token = await getToken();
                const bank = NIGERIAN_BANKS.find((item) => item.name === bankName);
                const response = await fetch("/api/riders", {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    bank_name: bankName,
                    bank_code: bank?.code,
                    bank_account_name: accountName,
                    bank_account_number: accountNumber,
                  }),
                });
                const result = await response.json();
                if (!response.ok || !result?.success) {
                  throw new Error(result?.message || "Unable to save bank details.");
                }
              } catch (err) {
                setError(err instanceof Error ? err.message : "Unable to save bank details.");
              } finally {
                setSavingBank(false);
              }
            }}
            className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-[#F26A21] px-5 text-sm font-bold"
          >
            {savingBank ? "Saving..." : "Save bank details"}
          </button>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-xl font-bold">
            Assigned deliveries
          </h2>

          {deliveries.length === 0 ? (
            <p className="mt-4 text-sm text-white/45">
              No active deliveries assigned to you yet.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {deliveries.map((delivery) => {
                const order = Array.isArray(delivery.orders)
                  ? delivery.orders[0]
                  : delivery.orders;
                const next = NEXT_STATUS[delivery.status];
                const stepIndex = DELIVERY_STATUS_FLOW.indexOf(
                  delivery.status
                );

                return (
                  <div
                    key={delivery.id}
                    className="rounded-[24px] border border-white/10 bg-[#141414] p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[#F26A21]">
                          {order?.order_no ||
                            order?.order_number ||
                            "Order"}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold">
                          {order?.customer_name || "Customer"}
                        </h3>
                        <p className="mt-1 text-sm text-white/50">
                          {order?.delivery_address || "Address on order"}
                        </p>
                        {order?.customer_phone && (
                          <a
                            href={`tel:${order.customer_phone}`}
                            className="mt-2 inline-block text-sm text-[#F26A21]"
                          >
                            Call {order.customer_phone}
                          </a>
                        )}
                      </div>

                      <span className="inline-flex h-fit rounded-full border border-[#F26A21]/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#F26A21]">
                        {getDeliveryStatusLabel(delivery.status)}
                      </span>
                    </div>

                    <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-[#F26A21]"
                        style={{
                          width: `${Math.max(
                            8,
                            ((Math.max(stepIndex, 0) + 1) /
                              DELIVERY_STATUS_FLOW.length) *
                              100
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="mt-5 flex flex-col gap-2">
                      {next === "DELIVERED" && (
                        <input
                          value={codes[delivery.id] || ""}
                          onChange={(event) =>
                            setCodes((current) => ({
                              ...current,
                              [delivery.id]: event.target.value,
                            }))
                          }
                          placeholder="Customer delivery code"
                          className="min-h-[42px] rounded-full border border-white/15 bg-black px-4 text-sm"
                        />
                      )}
                      <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/track/${encodeURIComponent(
                          delivery.tracking_token
                        )}`}
                        className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-white/15 px-4 text-xs font-bold uppercase tracking-wider text-white/70"
                      >
                        Tracking page
                      </Link>

                      {next && (
                        <button
                          type="button"
                          disabled={busyId === delivery.id}
                          onClick={() => advanceStatus(delivery)}
                          className="inline-flex min-h-[42px] items-center justify-center rounded-full bg-[#F26A21] px-4 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-60"
                        >
                          {busyId === delivery.id
                            ? "Updating..."
                            : `Mark ${getDeliveryStatusLabel(next)}`}
                        </button>
                      )}
                    </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
