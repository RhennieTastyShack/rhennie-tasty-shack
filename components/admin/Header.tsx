"use client";

export default function Header() {
  return (
    <header className="h-20 bg-black border-b border-yellow-500/20 flex items-center justify-between px-8">
      <div>
        <h2 className="text-2xl font-bold text-white">
          Dashboard
        </h2>

        <p className="text-sm text-gray-400">
          Welcome back to Rhennie Tasty Shack Admin
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-white font-semibold">
            Administrator
          </p>

          <p className="text-sm text-gray-400">
            Rhennie Tasty Shack
          </p>
        </div>

        <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold text-lg">
          A
        </div>
      </div>
    </header>
  );
}