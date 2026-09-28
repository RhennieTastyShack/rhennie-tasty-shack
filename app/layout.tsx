import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

import Navbar from "@/app/components/Navbar";
import CartDrawer from "@/app/components/cart/CartDrawer";
import WhatsAppButton from "@/app/components/WhatsAppButton";
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
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        {/* Cursor's browser adds data-cursor-ref before hydration. Strip it so the dev overlay stays clear. */}
        <Script id="strip-editor-refs" strategy="beforeInteractive">
          {`(function(){function strip(node){if(!node||node.nodeType!==1)return;if(node.hasAttribute&&node.hasAttribute("data-cursor-ref"))node.removeAttribute("data-cursor-ref");if(node.querySelectorAll)node.querySelectorAll("[data-cursor-ref]").forEach(function(el){el.removeAttribute("data-cursor-ref")})}var orig=Element.prototype.setAttribute;Element.prototype.setAttribute=function(name,value){if(name==="data-cursor-ref")return;return orig.call(this,name,value)};strip(document.documentElement);var observer=new MutationObserver(function(records){for(var i=0;i<records.length;i++){var record=records[i];if(record.type==="attributes"&&record.target&&record.target.removeAttribute)record.target.removeAttribute("data-cursor-ref");var nodes=record.addedNodes||[];for(var j=0;j<nodes.length;j++)strip(nodes[j])}});observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["data-cursor-ref"]});document.addEventListener("DOMContentLoaded",function(){strip(document.documentElement)});setTimeout(function(){observer.disconnect();Element.prototype.setAttribute=orig},4000)})();`}
        </Script>
        <CartProvider>
          <Navbar />

          {children}

          <CartDrawer />
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}