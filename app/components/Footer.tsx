"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
  FaPhone,
  FaEnvelope,
  FaLocationDot,
} from "react-icons/fa6";

export default function Footer() {
  return (
    <footer
      id="footer"
      className="relative overflow-hidden border-t border-[#F97316]/20 bg-[#080808] text-white"
    >
      {/* Decorative orange glow */}
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-[#F97316]/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-[#F97316]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 pb-8 pt-16 sm:px-6 md:pt-20">
        {/* ================= MAIN FOOTER ================= */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* ================= BRAND ================= */}
          <div className="lg:pr-6">
            <Link href="/" className="inline-block">
              {/* Logo */}
              <div className="relative mb-5 h-20 w-20 sm:h-24 sm:w-24">
                <Image
                  src="/images/logo.png"
                  alt="Rhennie Tasty Shack"
                  fill
                  sizes="96px"
                  className="object-contain"
                />
              </div>
            </Link>

            <h2 className="font-serif text-2xl font-bold text-white">
              Rhennie Tasty{" "}
              <span className="text-[#F97316]">Shack</span>
            </h2>

            <div className="mt-3 flex items-center gap-3">
              <span className="h-px w-8 bg-[#F97316]" />

              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#F97316]">
                Luxury Dining At Your Doorstep
              </span>
            </div>

            <p className="mt-5 text-sm leading-7 text-gray-400">
              Luxury meals crafted with passion. From everyday lunches to
              premium catering for birthdays, weddings, conferences and
              corporate events, we create unforgettable dining experiences.
            </p>
          </div>

          {/* ================= QUICK LINKS ================= */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#F97316]">
              Explore
            </p>

            <h3 className="mt-3 text-xl font-bold">Quick Links</h3>

            <ul className="mt-6 space-y-4">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-400 transition-colors hover:text-[#F97316]"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/menu"
                  className="text-sm text-gray-400 transition-colors hover:text-[#F97316]"
                >
                  Our Menu
                </Link>
              </li>

              <li>
                <Link
                  href="/#foodboxes"
                  className="text-sm text-gray-400 transition-colors hover:text-[#F97316]"
                >
                  Food Boxes
                </Link>
              </li>

              <li>
                <Link
                  href="/#litre"
                  className="text-sm text-gray-400 transition-colors hover:text-[#F97316]"
                >
                  Party Orders
                </Link>
              </li>

              <li>
                <Link
                  href="/subscription"
                  className="text-sm text-gray-400 transition-colors hover:text-[#F97316]"
                >
                  Meal Plans
                </Link>
              </li>

              <li>
                <Link
                  href="/orders"
                  className="text-sm text-gray-400 transition-colors hover:text-[#F97316]"
                >
                  Orders
                </Link>
              </li>

              <li>
                <Link
                  href="/client-portal/event-concierge"
                  className="text-sm text-gray-400 transition-colors hover:text-[#F97316]"
                >
                  Event Concierge
                </Link>
              </li>
            </ul>
          </div>

          {/* ================= CONTACT ================= */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#F97316]">
              Get In Touch
            </p>

            <h3 className="mt-3 text-xl font-bold">Contact Us</h3>

            <div className="mt-6 space-y-5">
              {/* Phone */}
              <a
                href="tel:07049180363"
                className="group flex items-start gap-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#F97316]/20 bg-[#111111] text-[#F97316] transition-colors group-hover:border-[#F97316]">
                  <FaPhone className="text-sm" />
                </span>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
                    Phone
                  </p>

                  <p className="mt-1 text-sm text-gray-300 transition-colors group-hover:text-[#F97316]">
                    07049180363
                  </p>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/2348121577759"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-green-500/20 bg-[#111111] text-green-500 transition-colors group-hover:border-green-500">
                  <FaWhatsapp className="text-sm" />
                </span>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
                    WhatsApp
                  </p>

                  <p className="mt-1 text-sm text-gray-300 transition-colors group-hover:text-green-500">
                    08121577759
                  </p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:mohrhennie567@gmail.com"
                className="group flex items-start gap-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#F97316]/20 bg-[#111111] text-[#F97316] transition-colors group-hover:border-[#F97316]">
                  <FaEnvelope className="text-sm" />
                </span>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
                    Email
                  </p>

                  <p className="mt-1 break-all text-sm text-gray-300 transition-colors group-hover:text-[#F97316]">
                    mohrhennie567@gmail.com
                  </p>
                </div>
              </a>

              {/* Location */}
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#F97316]/20 bg-[#111111] text-[#F97316]">
                  <FaLocationDot className="text-sm" />
                </span>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
                    Location
                  </p>

                  <p className="mt-1 text-sm text-gray-300">
                    Alimosho, Lagos, Nigeria
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= SOCIALS ================= */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#F97316]">
              Stay Connected
            </p>

            <h3 className="mt-3 text-xl font-bold">Follow Us</h3>

            <p className="mt-5 text-sm leading-7 text-gray-400">
              Follow Rhennie Tasty Shack for new meals, special offers,
              behind-the-scenes moments and catering updates.
            </p>

            {/* Social icons */}
            <div className="mt-7 flex flex-wrap gap-3">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#111111] text-gray-300 transition-all duration-300 hover:border-[#F97316] hover:bg-[#F97316] hover:text-black"
              >
                <FaFacebookF />
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/rhennietastyshack"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#111111] text-gray-300 transition-all duration-300 hover:border-[#F97316] hover:bg-[#F97316] hover:text-black"
              >
                <FaInstagram />
              </a>

              {/* TikTok */}
              <a
                href="https://tiktok.com/@rhennietastyshack"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#111111] text-gray-300 transition-all duration-300 hover:border-[#F97316] hover:bg-[#F97316] hover:text-black"
              >
                <FaTiktok />
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/2348121577759"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-green-500/20 bg-[#111111] text-green-500 transition-all duration-300 hover:border-green-500 hover:bg-green-500 hover:text-white"
              >
                <FaWhatsapp />
              </a>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/2348121577759"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#F97316] px-6 py-3 text-sm font-bold text-black transition-all duration-300 hover:bg-[#fb923c] hover:shadow-lg hover:shadow-orange-500/20"
            >
              Chat With Us
              <span>→</span>
            </a>
          </div>
        </div>

        {/* ================= DIVIDER ================= */}
        <div className="my-12 flex items-center gap-4">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#F97316]/30" />

          <span className="h-1.5 w-1.5 rounded-full bg-[#F97316]" />

          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#F97316]/30" />
        </div>

        {/* ================= BOTTOM ================= */}
        <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Rhennie Tasty Shack. All Rights
            Reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500 md:justify-end">
            <Link
              href="/"
              className="transition-colors hover:text-[#F97316]"
            >
              Privacy
            </Link>

            <span className="text-gray-700">•</span>

            <Link
              href="/"
              className="transition-colors hover:text-[#F97316]"
            >
              Terms
            </Link>

            <span className="text-gray-700">•</span>

            <span>Premium Taste • Fast Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}