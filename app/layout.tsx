import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./brand.css";
import "./shop-clarity.css";

export const metadata: Metadata = {
  title: "Craftique Yard | A little material. A lot of possibility.",
  description: "Premium craft supplies, ribbons, chenille stems and bouquet essentials in Bangladesh. Importing quality, creating beauty.",
  icons: {
    icon: "/images/logo.jpg",
    shortcut: "/images/logo.jpg",
  },
};

export const viewport: Viewport = {
  themeColor: "#98412d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
