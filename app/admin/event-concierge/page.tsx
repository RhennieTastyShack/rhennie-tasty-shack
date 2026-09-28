"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type EventRequest = {
  id: string;
  created_at: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  event_type: string | null;
  event_date: string | null;
  guest_count: number | null;
  location: string | null;
  budget: string | null;
  message: string | null;
  status: string | null;
};

const statuses = [
  "new",
  "contacted",
  "quoted",
  "confirmed",
  "completed",
  "cancelled",
];

export default function EventConciergePage() {
  const [requests, setRequests] = useState<EventRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<EventRequest | null>(null);
  const [updating, setUpdating] = useState(false);
  const [search, setSearch] = useState("");

  async function loadRequests() {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const response = await fetch("/api/consultations", {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      setRequests([]);
    } else {
      setRequests((result.requests as EventRequest[]) || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function updateStatus(id: string, status: string) {
    setUpdating(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch("/api/consultations", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session?.access_token || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, status }),
    });

    if (!response.ok) {
      console.error("Error updating status:", await response.json());
      alert("Unable to update request status.");
      setUpdating(false);
      return;
    }

    setRequests((current) =>
      current.map((request) =>
        request.id === id ? { ...request, status } : request
      )
    );

    if (selectedRequest?.id === id) {
      setSelectedRequest({
        ...selectedRequest,
        status,
      });
    }

    setUpdating(false);
  }

  const filteredRequests = requests.filter((request) => {
    const searchText = search.toLowerCase();

    return (
      request.name?.toLowerCase().includes(searchText) ||
      request.email?.toLowerCase().includes(searchText) ||
      request.phone?.toLowerCase().includes(searchText) ||
      request.event_type?.toLowerCase().includes(searchText) ||
      request.location?.toLowerCase().includes(searchText)
    );
  });

  const newRequests = requests.filter(
    (request) => request.status === "new" || !request.status
  ).length;

  const contactedRequests = requests.filter(
    (request) => request.status === "contacted"
  ).length;

  const quotedRequests = requests.filter(
    (request) => request.status === "quoted"
  ).length;

  const confirmedRequests = requests.filter(
    (request) => request.status === "confirmed"
  ).length;

  function formatDate(date: string | null) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(date: string) {
    return new Date(date).toLocaleString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function statusClass(status: string | null) {
    switch (status) {
      case "new":
        return "bg-orange-100 text-orange-700";
      case "contacted":
        return "bg-blue-100 text-blue-700";
      case "quoted":
        return "bg-purple-100 text-purple-700";
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-black/5 text-black/50";
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F5F0] px-4 py-6 md:px-8 lg:px-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.3em] text-[#C89B3C]">
            Rhennie Studio
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-[#171717] md:text-4xl">
            Event Concierge
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
            Manage premium event enquiries, quotations, client requests and
            confirmed celebrations from one place.
          </p>
        </div>

        <button
          onClick={loadRequests}
          disabled={loading}
          className="w-fit rounded-xl border border-black/10 bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.15em] text-black transition hover:border-[#C89B3C] hover:text-[#C89B3C] disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh Requests"}
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="New Requests"
          value={newRequests}
          accent="text-orange-600"
        />

        <StatCard
          label="Contacted"
          value={contactedRequests}
          accent="text-blue-600"
        />

        <StatCard
          label="Quoted"
          value={quotedRequests}
          accent="text-purple-600"
        />

        <StatCard
          label="Confirmed"
          value={confirmedRequests}
          accent="text-green-600"
        />
      </div>

      {/* Main Card */}
      <section className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-black/5 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#171717]">
              Event Requests
            </h2>

            <p className="mt-1 text-xs text-black/40">
              {requests.length} total{" "}
              {requests.length === 1 ? "request" : "requests"}
            </p>
          </div>

          <div className="relative w-full md:max-w-sm">
            <input
              type="text"
              placeholder="Search requests..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-black/10 bg-[#FAFAF8] px-4 py-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[#C89B3C]"
            />
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-black/10 border-t-[#C89B3C]" />

              <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-black/40">
                Loading Requests
              </p>
            </div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center px-6">
            <div className="max-w-sm text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F7F5F0] text-2xl">
                ✦
              </div>

              <h3 className="mt-5 text-lg font-semibold text-[#171717]">
                No event requests
              </h3>

              <p className="mt-2 text-sm leading-6 text-black/40">
                New Event Concierge enquiries will appear here when customers
                submit their event requirements.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-black/5 bg-[#FAFAF8] text-left">
                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-black/40">
                      Client
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-black/40">
                      Event
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-black/40">
                      Date
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-black/40">
                      Guests
                    </th>

                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-black/40">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-black/40">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-black/5 transition hover:bg-[#FCFBF8]"
                    >
                      <td className="px-5 py-5">
                        <p className="font-semibold text-[#171717]">
                          {request.name || "Unnamed Client"}
                        </p>

                        <p className="mt-1 text-xs text-black/40">
                          {request.email || request.phone || "No contact"}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="text-sm font-medium text-[#171717]">
                          {request.event_type || "Event"}
                        </p>

                        <p className="mt-1 max-w-[180px] truncate text-xs text-black/40">
                          {request.location || "Location not provided"}
                        </p>
                      </td>

                      <td className="px-5 py-5 text-sm text-black/60">
                        {formatDate(request.event_date)}
                      </td>

                      <td className="px-5 py-5 text-sm text-black/60">
                        {request.guest_count || "—"}
                      </td>

                      <td className="px-5 py-5">
                        <select
                          value={request.status || "new"}
                          disabled={updating}
                          onChange={(event) =>
                            updateStatus(request.id, event.target.value)
                          }
                          className={`rounded-full border-0 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] outline-none ${statusClass(
                            request.status
                          )}`}
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-5 py-5 text-right">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold text-black/60 transition hover:border-[#C89B3C] hover:text-[#C89B3C]"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-black/5 lg:hidden">
              {filteredRequests.map((request) => (
                <div key={request.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#171717]">
                        {request.name || "Unnamed Client"}
                      </p>

                      <p className="mt-1 text-xs text-black/40">
                        {request.event_type || "Event"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${statusClass(
                        request.status
                      )}`}
                    >
                      {request.status || "new"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/30">
                        Date
                      </p>
                      <p className="mt-1 text-sm text-black/60">
                        {formatDate(request.event_date)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/30">
                        Guests
                      </p>
                      <p className="mt-1 text-sm text-black/60">
                        {request.guest_count || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="flex-1 rounded-xl border border-black/10 px-4 py-3 text-xs font-semibold"
                    >
                      View Request
                    </button>

                    <select
                      value={request.status || "new"}
                      disabled={updating}
                      onChange={(event) =>
                        updateStatus(request.id, event.target.value)
                      }
                      className={`rounded-xl border-0 px-3 text-[10px] font-bold uppercase ${statusClass(
                        request.status
                      )}`}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-black/5 bg-white px-6 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C89B3C]">
                  Event Concierge
                </p>

                <h2 className="mt-1 text-xl font-semibold text-[#171717]">
                  {selectedRequest.name || "Event Request"}
                </h2>
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-lg text-black/50 transition hover:bg-black/10"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Detail
                  label="Client"
                  value={selectedRequest.name || "—"}
                />

                <Detail
                  label="Email"
                  value={selectedRequest.email || "—"}
                />

                <Detail
                  label="Phone"
                  value={selectedRequest.phone || "—"}
                />

                <Detail
                  label="Event Type"
                  value={selectedRequest.event_type || "—"}
                />

                <Detail
                  label="Event Date"
                  value={formatDate(selectedRequest.event_date)}
                />

                <Detail
                  label="Guest Count"
                  value={
                    selectedRequest.guest_count
                      ? String(selectedRequest.guest_count)
                      : "—"
                  }
                />

                <Detail
                  label="Location"
                  value={selectedRequest.location || "—"}
                />

                <Detail
                  label="Budget"
                  value={selectedRequest.budget || "—"}
                />
              </div>

              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-black/30">
                  Client Message
                </p>

                <div className="rounded-xl bg-[#F7F5F0] p-4 text-sm leading-7 text-black/60">
                  {selectedRequest.message || "No additional message."}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-black/30">
                  Request Status
                </p>

                <select
                  value={selectedRequest.status || "new"}
                  disabled={updating}
                  onChange={(event) =>
                    updateStatus(selectedRequest.id, event.target.value)
                  }
                  className={`w-full rounded-xl border-0 px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] outline-none ${statusClass(
                    selectedRequest.status
                  )}`}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t border-black/5 pt-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/30">
                  Submitted
                </p>

                <p className="mt-1 text-xs text-black/50">
                  {formatDateTime(selectedRequest.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35">
        {label}
      </p>

      <p className={`mt-3 text-3xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#FAFAF8] p-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/30">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-medium text-[#171717]">
        {value}
      </p>
    </div>
  );
}