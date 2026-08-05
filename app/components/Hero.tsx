"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const videos = [
  "/videos/hero1.mp4",
  "/videos/hero2.mp4",
  "/videos/hero3.mp4",
];

export default function Hero() {
  const [currentVideo, setCurrentVideo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % videos.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden">

      {/* Background Videos */}
      {videos.map((video, index) => (
        <video
          key={index}
          autoPlay
          muted
          loop
          playsInline
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ${
            currentVideo === index
              ? "opacity-100 scale-105"
              : "opacity-0 scale-100"
          }`}
        >
          <source src={video} type="video/mp4" />
        </video>
      ))}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Hero Content */}
      <div className="relative z-20 flex h-full items-center justify-center px-6">
        <div className="max-w-4xl text-center text-white animate-fadeIn">

          <h1 className="mb-6 text-5xl font-extrabold leading-tight md:text-7xl">
            Crafted for
            <span className="block text-yellow-400">
              Exceptional Taste
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-200 md:text-xl">
            Freshly prepared meals made with premium ingredients,
            unforgettable flavors, and exceptional service delivered
            straight to your doorstep.
          </p>

          {/* Premium Action Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row">

            <Link
              href="/menu"
              className="flex h-14 w-full max-w-xs items-center justify-center rounded-xl bg-yellow-500 text-lg font-bold text-black shadow-lg transition-all duration-300 hover:scale-105 hover:bg-yellow-400 sm:w-56"
            >
              Order Now
            </Link>

            <Link
              href="/menu"
              className="flex h-14 w-full max-w-xs items-center justify-center rounded-xl border-2 border-white text-lg font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-white hover:text-black sm:w-56"
            >
              View Menu
            </Link>

          </div>

          {/* Navigation Dots */}
          <div className="mt-10 flex justify-center gap-3">
            {videos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentVideo(index)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  currentVideo === index
                    ? "w-8 bg-yellow-400"
                    : "w-3 bg-white/50 hover:bg-white"
                }`}
                aria-label={`Go to video ${index + 1}`}
              />
            ))}
          </div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2 animate-bounce">
        <div className="flex h-10 w-6 justify-center rounded-full border-2 border-white">
          <div className="mt-2 h-2 w-2 rounded-full bg-yellow-400"></div>
        </div>
      </div>

    </section>
  );
}