export default function MenuPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Menu Management
          </h1>

          <p className="mt-2 text-gray-400">
            Manage all meals, prices and collections.
          </p>
        </div>

        <button className="rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-black hover:bg-yellow-400 transition">
          + Add Meal
        </button>
      </div>

      <div className="rounded-2xl border border-yellow-500/20 bg-zinc-900 overflow-hidden">
        <table className="w-full">
          <thead className="bg-black">
            <tr>
              <th className="px-6 py-4 text-left text-yellow-400">
                Meal
              </th>

              <th className="px-6 py-4 text-left text-yellow-400">
                Collection
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
            <tr className="border-t border-zinc-800">
              <td className="px-6 py-5 text-white">
                Royal Jollof Feast
              </td>

              <td className="px-6 py-5 text-gray-300">
                Signature Rice
              </td>

              <td className="px-6 py-5 text-yellow-400">
                ₦6,500
              </td>

              <td className="px-6 py-5">
                <span className="rounded-full bg-green-600 px-3 py-1 text-sm text-white">
                  Available
                </span>
              </td>

              <td className="px-6 py-5 text-right">
                <button className="mr-3 text-yellow-400 hover:text-yellow-300">
                  Edit
                </button>

                <button className="text-red-400 hover:text-red-300">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}