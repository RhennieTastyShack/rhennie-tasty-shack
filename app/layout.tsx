import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Rhennie Tasty Shack",
  description:
    "Luxury meals, catering services, food boxes and meal subscriptions in Lagos, Nigeria.",
  keywords: [
    "Rhennie Tasty Shack",
    "Restaurant",
    "Food Delivery",
    "Catering",
    "Meal Subscription",
    "Food Boxes",
    "Lagos",
    "Nigeria",
  ],
  authors: [
    {
      name: "Rhennie Tasty Shack",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} bg-[#0B0B0B] text-white antialiased`}
      >
        {children}
      </body>
    </html>
  );
}