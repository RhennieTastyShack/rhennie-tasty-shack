"use client";

import Link from "next/link";
import Image from "next/image";
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
    <footer className="bg-black text-white pt-16 pb-8 border-t border-yellow-500">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10">

          {/* Logo & About */}
          <div>
            <Image
              src="/images/logo.png"
              alt="Rhennie Tasty Shack"
              width={80}
              height={80}
              className="rounded-full mb-4"
            />

            <h2 className="text-2xl font-bold text-yellow-400">
              Rhennie Tasty Shack
            </h2>

            <p className="text-gray-300 mt-4 leading-7">
              Luxury meals crafted with passion. From everyday lunches to
              premium catering for birthdays, weddings, conferences and
              corporate events, we serve unforgettable flavors.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold text-yellow-400 mb-5">
              Quick Links
            </h3>

            <ul className="space-y-3">
              <li>
                <Link href="/" className="hover:text-yellow-400 transition">
                  Home
                </Link>
              </li>

              <li>
                <Link href="/menu" className="hover:text-yellow-400 transition">
                  Menu
                </Link>
              </li>

              <li>
                <Link
                  href="/subscription"
                  className="hover:text-yellow-400 transition"
                >
                  Meal Plans
                </Link>
              </li>

              <li>
                <Link
                  href="/orders"
                  className="hover:text-yellow-400 transition"
                >
                  Orders
                </Link>
              </li>

              <li>
                <Link
                  href="/profile"
                  className="hover:text-yellow-400 transition"
                >
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-semibold text-yellow-400 mb-5">
              Contact
            </h3>

            <div className="space-y-4">

              <div className="flex items-center gap-3">
                <FaPhone className="text-yellow-400" />
                <span>07049180363</span>
              </div>

              <div className="flex items-center gap-3">
                <FaWhatsapp className="text-green-500" />
                <span>08121577759</span>
              </div>

              <div className="flex items-center gap-3">
                <FaEnvelope className="text-yellow-400" />
                <span>mohrhennie567@gmail.com</span>
              </div>

              <div className="flex items-start gap-3">
                <FaLocationDot className="text-yellow-400 mt-1" />
                <span>Alimosho, Lagos, Nigeria</span>
              </div>

            </div>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-xl font-semibold text-yellow-400 mb-5">
              Follow Us
            </h3>

            <div className="flex gap-4">

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-yellow-500 hover:bg-yellow-400 text-black p-3 rounded-full transition"
              >
                <FaFacebookF />
              </a>

              <a
                href="https://instagram.com/rhennietastyshack"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-yellow-500 hover:bg-yellow-400 text-black p-3 rounded-full transition"
              >
                <FaInstagram />
              </a>

              <a
                href="https://tiktok.com/@rhennietastyshack"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-yellow-500 hover:bg-yellow-400 text-black p-3 rounded-full transition"
              >
                <FaTiktok />
              </a>

              <a
                href="https://wa.me/2348121577759"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-400 text-white p-3 rounded-full transition"
              >
                <FaWhatsapp />
              </a>

            </div>

            <p className="text-gray-400 mt-6">
              Follow us for new meals, offers, and catering updates.
            </p>

          </div>

        </div>

        <hr className="border-gray-700 my-10" />

        <div className="text-center text-gray-400">
          © {new Date().getFullYear()} Rhennie Tasty Shack. All Rights Reserved.
        </div>

      </div>
    </footer>
  );
}