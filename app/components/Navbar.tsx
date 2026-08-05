"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

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
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Rhennie Tasty Shack
            </h2>

            <p className="text-xs md:text-sm tracking-widest text-[#D4AF37] uppercase">
              Premium Catering
            </p>
          </div>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-10">
          <Link href="/" className="text-white hover:text-[#D4AF37]">
            Home
          </Link>

          <a href="#featured" className="text-white hover:text-[#D4AF37]">
            Our Menu
          </a>

          <a href="#foodboxes" className="text-white hover:text-[#D4AF37]">
            Food Boxes
          </a>

          <a href="#catering" className="text-white hover:text-[#D4AF37]">
            Catering
          </a>

          <a href="#reviews" className="text-white hover:text-[#D4AF37]">
            Reviews
          </a>

          <a href="#footer" className="text-white hover:text-[#D4AF37]">
            Contact
          </a>
        </nav>

        {/* Desktop Button */}
        <a
          href="https://wa.me/2348121577759"
          target="_blank"
          rel="noopener noreferrer"
          className="gold-btn px-7 py-3 hidden lg:inline-flex"
        >
          Order Now
        </a>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden text-white"
        >
          {open ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden bg-black/95 border-t border-[#D4AF37]/20">
          <nav className="flex flex-col p-6 space-y-5">

            <Link href="/" onClick={() => setOpen(false)} className="text-white">
              Home
            </Link>

            <a href="#featured" onClick={() => setOpen(false)} className="text-white">
              Our Menu
            </a>

            <a href="#foodboxes" onClick={() => setOpen(false)} className="text-white">
              Food Boxes
            </a>

            <a href="#catering" onClick={() => setOpen(false)} className="text-white">
              Catering
            </a>

            <a href="#reviews" onClick={() => setOpen(false)} className="text-white">
              Reviews
            </a>

            <a href="#footer" onClick={() => setOpen(false)} className="text-white">
              Contact
            </a>

            <a
              href="https://wa.me/2348121577759"
              target="_blank"
              rel="noopener noreferrer"
              className="gold-btn text-center py-3"
            >
              Order Now
            </a>

          </nav>
        </div>
      )}
    </header>
  );
}