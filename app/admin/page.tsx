export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <h3 className="text-gray-500">Today's Orders</h3>
          <p className="text-4xl font-bold mt-2">24</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <h3 className="text-gray-500">Revenue</h3>
          <p className="text-4xl font-bold mt-2">₦245,000</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <h3 className="text-gray-500">Customers</h3>
          <p className="text-4xl font-bold mt-2">158</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <h3 className="text-gray-500">Active Subscriptions</h3>
          <p className="text-4xl font-bold mt-2">36</p>
        </div>

      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-lg mt-10 p-6">

        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          Recent Orders
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Customer</th>
                <th className="text-left py-3">Meal</th>
                <th className="text-left py-3">Amount</th>
                <th className="text-left py-3">Status</th>
              </tr>
            </thead>

            <tbody>

              <tr className="border-b">
                <td className="py-4">Adeola Johnson</td>
                <td>Jollof Rice & Turkey</td>
                <td>₦8,000</td>
                <td>
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                    Preparing
                  </span>
                </td>
              </tr>

              <tr className="border-b">
                <td className="py-4">Mary Okafor</td>
                <td>Seafood Rice</td>
                <td>₦12,500</td>
                <td>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    Delivered
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-4">David Yusuf</td>
                <td>Luxury Food Box</td>
                <td>₦35,000</td>
                <td>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    Out for Delivery
                  </span>
                </td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>
    </div>
  );
}