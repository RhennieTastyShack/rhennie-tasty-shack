export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Business Settings
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <form className="space-y-6">

          <div>
            <label className="block font-semibold mb-2">
              Business Name
            </label>
            <input
              type="text"
              defaultValue="Rhennie Tasty Shack"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Business Description
            </label>
            <textarea
              rows={4}
              defaultValue="Luxury meals, catering services, food boxes, subscriptions and event catering."
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="block font-semibold mb-2">
                Phone Number
              </label>
              <input
                type="text"
                defaultValue="07049180363"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                WhatsApp Number
              </label>
              <input
                type="text"
                defaultValue="08121577759"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="block font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                defaultValue="mohrhennie567@gmail.com"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Business Address
              </label>
              <input
                type="text"
                defaultValue="Alimosho, Lagos, Nigeria"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

          </div>

          <div className="grid md:grid-cols-3 gap-6">

            <div>
              <label className="block font-semibold mb-2">
                Facebook
              </label>
              <input
                type="text"
                defaultValue="Rhennie Tasty Shack"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Instagram
              </label>
              <input
                type="text"
                defaultValue="@rhennietastyshack"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">
                TikTok
              </label>
              <input
                type="text"
                defaultValue="@rhennietastyshack"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

          </div>

          <div>
            <label className="block font-semibold mb-2">
              Upload Logo
            </label>
            <input
              type="file"
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3 rounded-lg transition"
          >
            Save Changes
          </button>

        </form>
      </div>
    </div>
  );
}