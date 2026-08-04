export default function SubscriptionsPage() {
  const subscriptions = [
    {
      id: 1,
      customer: "Adeola Johnson",
      plan: "Lunch Plan",
      duration: "Monthly",
      amount: "₦80,000",
      status: "Active",
    },
    {
      id: 2,
      customer: "Mary Okafor",
      plan: "Dinner Plan",
      duration: "Weekly",
      amount: "₦25,000",
      status: "Active",
    },
    {
      id: 3,
      customer: "David Yusuf",
      plan: "Family Plan",
      duration: "Monthly",
      amount: "₦150,000",
      status: "Paused",
    },
    {
      id: 4,
      customer: "Grace Bello",
      plan: "Office Lunch",
      duration: "Monthly",
      amount: "₦120,000",
      status: "Expired",
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Meal Subscriptions
        </h1>

        <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-lg">
          + New Subscription
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-4">Customer</th>
              <th className="text-left p-4">Plan</th>
              <th className="text-left p-4">Duration</th>
              <th className="text-left p-4">Amount</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {subscriptions.map((subscription) => (
              <tr
                key={subscription.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-4 font-medium">
                  {subscription.customer}
                </td>

                <td className="p-4">{subscription.plan}</td>

                <td className="p-4">{subscription.duration}</td>

                <td className="p-4 font-semibold">
                  {subscription.amount}
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      subscription.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : subscription.status === "Paused"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {subscription.status}
                  </span>
                </td>

                <td className="p-4">
                  <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
                    Manage
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