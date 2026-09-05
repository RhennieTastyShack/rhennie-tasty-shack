import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/app/components/Navbar";
import CartDrawer from "@/app/components/cart/CartDrawer";
import { CartProvider } from "@/app/context/CartContext";

export const metadata: Metadata = {
  title: "Rhennie Tasty Shack",
  description:
    "Premium Nigerian and continental cuisine, catering, meal subscriptions and unforgettable dining experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
    >
      <body>
        <CartProvider>
          <Navbar />

          {children}

          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}