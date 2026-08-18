"use client";

import { useEffect, useState } from "react";

interface MenuItem {
  id: string;
  name: string;
  collection: string;
  description: string | null;
  price: number;
  image_url: string | null;
  available: boolean;
  created_at: string;
}

export default function MenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadMenu() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/menu", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error || "Unable to load menu."
        );
      }

      setMenu(result);
    } catch (err) {
      console.error("Menu loading error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load menu."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMenu();
  }, []);

  function formatAmount(price: number) {
    return `₦${Number(price || 0).toLocaleString(
      "en-NG"
    )}`;
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] p-6 md:p-8">

      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
            Rhennie Tasty Shack
          </p>

          <h1 className="mt-2 text-4xl font-bold text-white">
            Menu Management
          </h1>

          <p className="mt-2 text-gray-400">
            Manage all meals, prices and collections.
          </p>
        </div>

        <button
          className="rounded-xl bg-[#D4AF37] px-6 py-3 font-semibold text-black transition hover:bg-[#c19b2f]"
          onClick={() =>
            alert(
              "Add Meal will be connected next."
            )
          }
        >
          + Add Meal
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#111111] p-10 text-center">
          <p className="text-gray-400">
            Loading menu...
          </p>
        </div>
      ) : menu.length === 0 ? (
        <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#111111] p-10 text-center">
          <h2 className="text-xl font-semibold text-white">
            No meals found
          </h2>

          <p className="mt-2 text-gray-400">
            Add a meal to begin building your menu.
          </p>
        </div>
      ) : (
        /* MENU TABLE */
        <div className="overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-[#111111] shadow-xl">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead className="bg-black">

                <tr>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#D4AF37]">
                    Meal
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#D4AF37]">
                    Collection
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#D4AF37]">
                    Price
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#D4AF37]">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-sm font-semibold text-[#D4AF37]">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {menu.map((item) => (

                  <tr
                    key={item.id}
                    className="border-t border-zinc-800 transition hover:bg-zinc-900"
                  >

                    {/* MEAL */}
                    <td className="px-6 py-5">

                      <div className="font-semibold text-white">
                        {item.name}
                      </div>

                      {item.description && (
                        <div className="mt-1 max-w-md text-xs text-gray-500">
                          {item.description}
                        </div>
                      )}

                    </td>

                    {/* COLLECTION */}
                    <td className="px-6 py-5 text-gray-300">
                      {item.collection}
                    </td>

                    {/* PRICE */}
                    <td className="px-6 py-5 font-semibold text-[#D4AF37]">
                      {formatAmount(item.price)}
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-5">

                      {item.available ? (
                        <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                          Available
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                          Unavailable
                        </span>
                      )}

                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-5 text-right">

                      <button
                        onClick={() =>
                          alert(
                            `Edit ${item.name} will be connected next.`
                          )
                        }
                        className="mr-4 text-sm font-medium text-[#D4AF37] transition hover:text-[#E5C65A]"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          alert(
                            `Delete ${item.name} will be connected next.`
                          )
                        }
                        className="text-sm font-medium text-red-400 transition hover:text-red-300"
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>
      )}

      {/* SUMMARY */}
      {!loading && menu.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-400">

          <span>
            Total meals:{" "}
            <strong className="text-white">
              {menu.length}
            </strong>
          </span>

          <span>
            Available:{" "}
            <strong className="text-green-400">
              {menu.filter((item) => item.available).length}
            </strong>
          </span>

          <span>
            Unavailable:{" "}
            <strong className="text-red-400">
              {menu.filter((item) => !item.available).length}
            </strong>
          </span>

        </div>
      )}

    </div>
  );
}