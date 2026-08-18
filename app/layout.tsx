import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}