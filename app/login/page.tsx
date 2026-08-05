"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Login successful!");

    window.location.href = "/admin";
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl shadow-2xl p-8 border border-yellow-500">
        <h1 className="text-4xl font-bold text-yellow-400 text-center">
          Admin Login
        </h1>

        <p className="text-gray-400 text-center mt-2 mb-8">
          Rhennie Tasty Shack Dashboard
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-white mb-2">Email</label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-zinc-800 border border-gray-700 px-4 py-3 text-white focus:border-yellow-500 focus:outline-none"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-white mb-2">Password</label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-zinc-800 border border-gray-700 px-4 py-3 text-white focus:border-yellow-500 focus:outline-none"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
