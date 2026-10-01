import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

import Navbar from "@/app/components/Navbar";
import SiteFooter from "@/app/components/SiteFooter";
import CartDrawer from "@/app/components/cart/CartDrawer";
import WhatsAppButton from "@/app/components/WhatsAppButton";
import RideWith701Button from "@/app/components/RideWith701Button";
import { CartProvider } from "@/app/context/CartContext";

export const metadata: Metadata = {
  title: "Rhennie Tasty Shack",
  description:
    "Premium Nigerian and continental cuisine, catering, meal subscriptions and unforgettable dining experiences.",
  applicationName: "Rhennie Tasty Shack",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
};

/** Explicit viewport for Android / iPhone / desktop browsers. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F6F2" },
    { media: "(prefers-color-scheme: dark)", color: "#080808" },
  ],
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="overflow-x-clip">
        {/* Dev-only: strip Cursor editor refs that can cause hydration noise. */}
        {isDev ? (
          <Script id="strip-editor-refs" strategy="afterInteractive">
            {`(function(){function strip(node){if(!node||node.nodeType!==1)return;if(node.hasAttribute&&node.hasAttribute("data-cursor-ref"))node.removeAttribute("data-cursor-ref");if(node.querySelectorAll)node.querySelectorAll("[data-cursor-ref]").forEach(function(el){el.removeAttribute("data-cursor-ref")})}strip(document.documentElement);var observer=new MutationObserver(function(records){for(var i=0;i<records.length;i++){var record=records[i];if(record.type==="attributes"&&record.target&&record.target.removeAttribute)record.target.removeAttribute("data-cursor-ref");var nodes=record.addedNodes||[];for(var j=0;j<nodes.length;j++)strip(nodes[j])}});observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["data-cursor-ref"]});setTimeout(function(){observer.disconnect()},4000)})();`}
          </Script>
        ) : null}
        <CartProvider>
          <Navbar />

          <div className="pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] sm:pb-0">
            {children}
          </div>

          <SiteFooter />
          <CartDrawer />
          <RideWith701Button />
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}