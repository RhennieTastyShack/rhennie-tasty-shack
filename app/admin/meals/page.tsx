export default function MealsPage() {
  const meals = [
    {
      id: 1,
      name: "Jollof Rice & Turkey",
      category: "Rice",
      price: "₦8,000",
      status: "Available",
    },
    {
      id: 2,
      name: "Seafood Rice",
      category: "Rice",
      price: "₦12,500",
      status: "Available",
    },
    {
      id: 3,
      name: "Amala & Assorted",
      category: "Swallow",
      price: "₦6,000",
      status: "Available",
    },
    {
      id: 4,
      name: "Luxury Brunch Box",
      category: "Food Box",
      price: "₦35,000",
      status: "Available",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Meals Management
        </h1>

        <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-lg transition">
          + Add Meal
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-4">Meal</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">Price</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {meals.map((meal) => (
              <tr
                key={meal.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-4 font-medium">{meal.name}</td>

                <td className="p-4">{meal.category}</td>

                <td className="p-4">{meal.price}</td>

                <td className="p-4">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    {meal.status}
                  </span>
                </td>

                <td className="p-4 space-x-2">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                    Edit
                  </button>

                  <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}