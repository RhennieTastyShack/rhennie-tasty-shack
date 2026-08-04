export default function CustomersPage() {
  const customers = [
    {
      id: 1,
      name: "Adeola Johnson",
      phone: "08031234567",
      email: "adeola@gmail.com",
      orders: 12,
      totalSpent: "₦96,000",
    },
    {
      id: 2,
      name: "Mary Okafor",
      phone: "08123456789",
      email: "mary@gmail.com",
      orders: 8,
      totalSpent: "₦84,500",
    },
    {
      id: 3,
      name: "David Yusuf",
      phone: "09087654321",
      email: "david@gmail.com",
      orders: 5,
      totalSpent: "₦47,000",
    },
    {
      id: 4,
      name: "Grace Bello",
      phone: "07012345678",
      email: "grace@gmail.com",
      orders: 15,
      totalSpent: "₦165,000",
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Customers
        </h1>

        <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-lg">
          Export Customers
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Phone</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Orders</th>
              <th className="text-left p-4">Total Spent</th>
              <th className="text-left p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-4 font-medium">{customer.name}</td>
                <td className="p-4">{customer.phone}</td>
                <td className="p-4">{customer.email}</td>
                <td className="p-4">{customer.orders}</td>
                <td className="p-4 font-semibold">
                  {customer.totalSpent}
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