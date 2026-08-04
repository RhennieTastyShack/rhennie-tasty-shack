export default function ReviewsPage() {
  const reviews = [
    {
      id: 1,
      customer: "Feyishola Bakare",
      rating: 5,
      review: "Absolutely delicious! The jollof rice and turkey were amazing.",
      status: "Published",
    },
    {
      id: 2,
      customer: "Sinmiloluwa A.",
      rating: 5,
      review: "Excellent customer service and premium food quality.",
      status: "Published",
    },
    {
      id: 3,
      customer: "Samad Faronbi",
      rating: 5,
      review: "Highly recommended. The food box exceeded my expectations.",
      status: "Pending",
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Customer Reviews
        </h1>

        <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-lg">
          Add Review
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-4">Customer</th>
              <th className="text-left p-4">Rating</th>
              <th className="text-left p-4">Review</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {reviews.map((review) => (
              <tr
                key={review.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-4 font-medium">
                  {review.customer}
                </td>

                <td className="p-4">
                  {"⭐".repeat(review.rating)}
                </td>

                <td className="p-4 max-w-md">
                  {review.review}
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      review.status === "Published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {review.status}
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
