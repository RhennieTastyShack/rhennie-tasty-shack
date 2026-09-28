"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { supabase } from "@/lib/supabase";

type Rider = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  id_type: string | null;
  id_number: string | null;
  id_document_url?: string | null;
  photo_url?: string | null;
  vehicle_type: string | null;
  plate_number?: string | null;
  vehicle_model?: string | null;
  vehicle_color?: string | null;
  bank_name?: string | null;
  bank_account_name?: string | null;
  bank_account_number?: string | null;
  status: string;
  is_available: boolean;
  created_at: string;
  notes: string | null;
};

export default function AdminRidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function getAuthHeaders() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    return headers;
  }

  async function loadRiders() {
    try {
      setLoading(true);
      setError("");

      const headers = await getAuthHeaders();
      const response = await fetch("/api/riders?scope=all", {
        headers,
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to load riders.");
      }

      setRiders(result.riders || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load riders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRiders();
  }, []);

  async function updateRider(
    riderId: string,
    patch: { status?: string; is_available?: boolean }
  ) {
    setBusyId(riderId);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch("/api/riders", {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          rider_id: riderId,
          ...patch,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to update rider.");
      }

      setRiders((prev) =>
        prev.map((rider) =>
          rider.id === riderId ? { ...rider, ...result.rider } : rider
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update rider."
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Riders</h1>
          <p className="mt-2 text-sm text-gray-500">
            Approve platform riders and manage availability.
          </p>
        </div>

        <button
          type="button"
          onClick={loadRiders}
          className="rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-black hover:bg-yellow-600"
        >
          Refresh
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-yellow-500" size={32} />
        </div>
      ) : riders.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center shadow-lg">
          <p className="text-gray-500">No rider applications yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-lg">
          <table className="w-full min-w-[1180px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Contact</th>
                <th className="p-4 text-left">Address</th>
                <th className="p-4 text-left">Identity</th>
                <th className="p-4 text-left">Bike</th>
                <th className="p-4 text-left">Payout account</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Available</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {riders.map((rider) => (
                <tr key={rider.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">
                    <div className="flex items-center gap-3">
                      {rider.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={rider.photo_url}
                          alt=""
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-400">
                          No photo
                        </div>
                      )}
                      <span>{rider.full_name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    <div>{rider.phone}</div>
                    <div className="text-gray-400">{rider.email || "—"}</div>
                  </td>
                  <td className="p-4 text-sm">
                    <div>{rider.address || "—"}</div>
                    <div className="text-gray-400">{rider.city || ""}</div>
                  </td>
                  <td className="p-4 text-sm">
                    <div>{rider.id_type || "—"}</div>
                    <div className="text-gray-400">{rider.id_number || ""}</div>
                    {rider.id_document_url && (
                      <a
                        href={rider.id_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-yellow-700 underline"
                      >
                        View ID
                      </a>
                    )}
                  </td>
                  <td className="p-4 text-sm">
                    <div className="capitalize">{rider.vehicle_type || "—"}</div>
                    <div>{rider.plate_number || "No plate"}</div>
                    <div className="text-gray-400">
                      {[rider.vehicle_model, rider.vehicle_color]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    <div>{rider.bank_name || "No bank yet"}</div>
                    <div className="text-gray-400">
                      {rider.bank_account_number || ""}
                    </div>
                    <div className="text-gray-400">
                      {rider.bank_account_name || ""}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                        rider.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : rider.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {rider.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {rider.is_available ? "Yes" : "No"}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {rider.status !== "APPROVED" && (
                        <button
                          type="button"
                          disabled={busyId === rider.id}
                          onClick={() =>
                            updateRider(rider.id, {
                              status: "APPROVED",
                              is_available: true,
                            })
                          }
                          className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                      {rider.status !== "SUSPENDED" && (
                        <button
                          type="button"
                          disabled={busyId === rider.id}
                          onClick={() =>
                            updateRider(rider.id, {
                              status: "SUSPENDED",
                              is_available: false,
                            })
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Suspend
                        </button>
                      )}
                      {rider.status === "APPROVED" && (
                        <button
                          type="button"
                          disabled={busyId === rider.id}
                          onClick={() =>
                            updateRider(rider.id, {
                              is_available: !rider.is_available,
                            })
                          }
                          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        >
                          {rider.is_available
                            ? "Set offline"
                            : "Set available"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
