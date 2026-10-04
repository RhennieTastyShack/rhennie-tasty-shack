import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Rhennie Tasty Shack",
    short_name: "RTS",
    description:
      "Premium Nigerian and continental cuisine, catering, meal subscriptions and unforgettable dining experiences.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#F8F6F2",
    theme_color: "#F26A21",
    categories: ["food", "lifestyle", "shopping"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Menu",
        short_name: "Menu",
        url: "/menu",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "My Orders",
        short_name: "Orders",
        url: "/client-portal/orders",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Notifications",
        short_name: "Alerts",
        url: "/client-portal/notifications",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
