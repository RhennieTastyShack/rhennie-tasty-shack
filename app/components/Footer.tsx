"use client";

import Image from "next/image";
import Link from "next/link";
import {
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
      className="relative overflow-hidden border-t border-[#F26A21]/15 bg-[#080808] text-white"
    >
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-[#F26A21]/8 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-[#F26A21]/8 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-8 pt-16 sm:px-6 md:pt-20 lg:px-12 xl:px-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:pr-6">
            <Link href="/" className="inline-block">
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
              Rhennie Tasty <span className="text-[#F26A21]">Shack</span>
            </h2>

            <p className="mt-3 text-[12px] font-medium italic text-[#F26A21]/90">
              A Taste Above the Ordinary.
            </p>

            <p className="mt-5 text-sm leading-7 text-gray-400">
              Premium meals and event catering for everyday dining and
              unforgettable occasions.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#F26A21]">
              Explore
            </p>
            <h3 className="mt-3 text-xl font-bold">Quick Links</h3>
            <ul className="mt-6 space-y-4">
              <li>
                <Link
                  href="/menu"
                  className="text-sm text-gray-400 transition-colors hover:text-[#F26A21]"
                >
                  Menu
                </Link>
              </li>
              <li>
                <Link
                  href="/event-concierge"
                  className="text-sm text-gray-400 transition-colors hover:text-[#F26A21]"
                >
                  Event Concierge
                </Link>
              </li>
              <li>
                <Link
                  href="/customer-care"
                  className="text-sm text-gray-400 transition-colors hover:text-[#F26A21]"
                >
                  Customer Support
                </Link>
              </li>
              <li>
                <Link
                  href="/subscription"
                  className="text-sm text-gray-400 transition-colors hover:text-[#F26A21]"
                >
                  Meal Plans
                </Link>
              </li>
              <li>
                <Link
                  href="/client-portal"
                  className="text-sm text-gray-400 transition-colors hover:text-[#F26A21]"
                >
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#F26A21]">
              Get In Touch
            </p>
            <h3 className="mt-3 text-xl font-bold">Contact Us</h3>

            <div className="mt-6 space-y-5">
              <a href="tel:07049180363" className="group flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#F26A21]/20 bg-[#111111] text-[#F26A21] transition-colors group-hover:border-[#F26A21]">
                  <FaPhone className="text-sm" />
                </span>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
                    Phone
                  </p>
                  <p className="mt-1 text-sm text-gray-300 transition-colors group-hover:text-[#F26A21]">
                    07049180363
                  </p>
                </div>
              </a>

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

              <a
                href="mailto:mohrhennie567@gmail.com"
                className="group flex items-start gap-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#F26A21]/20 bg-[#111111] text-[#F26A21] transition-colors group-hover:border-[#F26A21]">
                  <FaEnvelope className="text-sm" />
                </span>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
                    Email
                  </p>
                  <p className="mt-1 break-all text-sm text-gray-300 transition-colors group-hover:text-[#F26A21]">
                    mohrhennie567@gmail.com
                  </p>
                </div>
              </a>

              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#F26A21]/20 bg-[#111111] text-[#F26A21]">
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

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#F26A21]">
              Stay Connected
            </p>
            <h3 className="mt-3 text-xl font-bold">Follow Us</h3>
            <p className="mt-5 text-sm leading-7 text-gray-400">
              New meals, offers and catering updates from Rhennie Tasty Shack.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="https://instagram.com/rhennietastyshack"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#111111] text-white transition-all duration-300 hover:border-[#F26A21] hover:bg-[#F26A21] hover:text-white"
              >
                <FaInstagram />
              </a>
              <a
                href="https://tiktok.com/@rhennietastyshack"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#111111] text-white transition-all duration-300 hover:border-[#F26A21] hover:bg-[#F26A21] hover:text-white"
              >
                <FaTiktok />
              </a>
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

            <Link
              href="/customer-care"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#F26A21] px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-[#D95512]"
            >
              Customer Support
              <span>→</span>
            </Link>
          </div>
        </div>

        <div className="my-12 flex items-center gap-4">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#F26A21]/30" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#F26A21]" />
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#F26A21]/30" />
        </div>

        <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Rhennie Tasty Shack. All Rights
            Reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500 md:justify-end">
            <Link href="/customer-care" className="transition-colors hover:text-[#F26A21]">
              Support
            </Link>
            <span className="text-gray-700">•</span>
            <span>Premium Taste • Fast Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
