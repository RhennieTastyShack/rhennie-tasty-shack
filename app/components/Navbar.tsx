"use client";

import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-[#D4AF37]/10">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-4">

          <Image
            src="/images/logo.png"
            alt="Rhennie Tasty Shack"
            width={60}
            height={60}
            priority
          />

          <div>
            <h2 className="text-2xl font-bold text-white">
              Rhennie Tasty Shack
            </h2>

            <p className="text-sm tracking-widest text-[#D4AF37] uppercase">
              Premium Catering
            </p>
          </div>

        </Link>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-10">

          <Link
            href="/"
            className="text-white hover:text-[#D4AF37] transition"
          >
            Home
          </Link>

          <a
            href="#featured"
            className="text-white hover:text-[#D4AF37] transition"
          >
            Our Menu
          </a>

          <a
            href="#foodboxes"
            className="text-white hover:text-[#D4AF37] transition"
          >
            Food Boxes
          </a>

          <a
            href="#catering"
            className="text-white hover:text-[#D4AF37] transition"
          >
            Catering
          </a>

          <a
            href="#reviews"
            className="text-white hover:text-[#D4AF37] transition"
          >
            Reviews
          </a>

          <a
            href="#footer"
            className="text-white hover:text-[#D4AF37] transition"
          >
            Contact
          </a>

        </nav>

        {/* CTA */}
        <a
          href="https://wa.me/2348121577759"
          target="_blank"
          rel="noopener noreferrer"
          className="gold-btn px-7 py-3 hidden md:inline-flex"
        >
          Order Now
        </a>

      </div>
    </header>
  );
}