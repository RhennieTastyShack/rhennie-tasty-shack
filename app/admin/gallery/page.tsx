export default function GalleryPage() {
  const gallery = [
    {
      id: 1,
      image: "/images/jollof-chicken.jpeg",
      title: "Jollof Rice & Chicken",
    },
    {
      id: 2,
      image: "/images/seafood-rice.jpg",
      title: "Seafood Rice",
    },
    {
      id: 3,
      image: "/images/amala.jpeg",
      title: "Amala & Assorted",
    },
    {
      id: 4,
      image: "/images/smallchops.jpeg",
      title: "Small Chops",
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Gallery
        </h1>

        <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-lg">
          + Upload Image
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {gallery.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-52 object-cover"
            />

            <div className="p-4">
              <h3 className="font-semibold text-lg">
                {item.title}
              </h3>

              <button className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}