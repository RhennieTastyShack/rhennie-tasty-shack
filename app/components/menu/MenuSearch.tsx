export default function MenuSearch() {
  return (
    <section className="bg-[#0B0B0B] py-10">

      <div className="max-w-7xl mx-auto px-6">

        <input
          type="text"
          placeholder="Search meals..."
          className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-5 text-white placeholder:text-gray-500 focus:outline-none focus:border-yellow-500"
        />

      </div>

    </section>
  );
}