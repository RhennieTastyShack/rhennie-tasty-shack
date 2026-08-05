import { supabase } from "@/lib/supabase";

export default async function MenuPage() {
  const { data: meals, error } = await supabase
    .from("meals")
    .select("*")
    .order("name");

  if (error) {
    return (
      <div className="p-8 text-red-500">
        <h2 className="text-2xl font-bold">Error Loading Meals</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Menu Management
          </h1>

          <p className="mt-2 text-gray-400">
            Manage all meals, prices and availability.
          </p>
        </div>

        <button className="rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-black hover:bg-yellow-400 transition">
          + Add Meal
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-yellow-500/20 bg-zinc-900">

        <table className="w-full">

          <thead className="bg-black">

            <tr>

              <th className="px-6 py-4 text-left text-yellow-400">
                Meal
              </th>

              <th className="px-6 py-4 text-left text-yellow-400">
                Category
              </th>

              <th className="px-6 py-4 text-left text-yellow-400">
                Price
              </th>

              <th className="px-6 py-4 text-left text-yellow-400">
                Status
              </th>

              <th className="px-6 py-4 text-right text-yellow-400">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {meals && meals.length > 0 ? (

              meals.map((meal) => (

                <tr
                  key={meal.id}
                  className="border-t border-zinc-800 hover:bg-zinc-800 transition"
                >

                  <td className="px-6 py-5 text-white font-medium">
                    {meal.name}
                  </td>

                  <td className="px-6 py-5 text-gray-300">
                    {meal.category}
                  </td>

                  <td className="px-6 py-5 text-yellow-400 font-semibold">
                    ₦{Number(meal.price).toLocaleString()}
                  </td>

                  <td className="px-6 py-5">

                    {meal.available ? (

                      <span className="rounded-full bg-green-600 px-3 py-1 text-sm text-white">
                        Available
                      </span>

                    ) : (

                      <span className="rounded-full bg-red-600 px-3 py-1 text-sm text-white">
                        Unavailable
                      </span>

                    )}

                  </td>

                  <td className="px-6 py-5 text-right">

                    <button className="mr-4 text-yellow-400 hover:text-yellow-300">
                      Edit
                    </button>

                    <button className="text-red-400 hover:text-red-300">
                      Delete
                    </button>

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan={5}
                  className="py-12 text-center text-gray-400"
                >
                  No meals found.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}