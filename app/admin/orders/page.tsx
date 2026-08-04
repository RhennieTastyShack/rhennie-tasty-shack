export default function OrdersPage() {
  const orders = [
    {
      id: "#1001",
      customer: "Adeola Johnson",
      phone: "08031234567",
      meal: "Jollof Rice & Turkey",
      amount: "₦8,000",
      status: "Preparing",
    },
    {
      id: "#1002",
      customer: "Mary Okafor",
      phone: "08123456789",
      meal: "Seafood Rice",
      amount: "₦12,500",
      status: "Delivered",
    },
    {
      id: "#1003",
      customer: "David Yusuf",
      phone: "09087654321",
      meal: "Luxury Brunch Box",
      amount: "₦35,000",
      status: "Pending",
    },
    {
      id: "#1004",
      customer: "Grace Bello",
      phone: "07012345678",
      meal: "Amala & Assorted",
      amount: "₦6,000",
      status: "Out for Delivery",
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Orders
        </h1>

        <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-lg">
          Export Orders
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-4">Order ID</th>
              <th className="text-left p-4">Customer</th>
              <th className="text-left p-4">Phone</th>
              <th className="text-left p-4">Meal</th>
              <th className="text-left p-4">Amount</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-4">{order.id}</td>
                <td className="p-4">{order.customer}</td>
                <td className="p-4">{order.phone}</td>
                <td className="p-4">{order.meal}</td>
                <td className="p-4 font-semibold">
                  {order.amount}
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Preparing"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "Out for Delivery"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="p-4">
                  <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
                    View
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