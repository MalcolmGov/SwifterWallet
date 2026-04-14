import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import InstallPrompt from "./components/pwa/InstallPrompt";
import ServiceWorkerRegistration from "./components/pwa/ServiceWorkerRegistration";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Swifter Wallet",
  description: "Your modern digital wallet — send, receive, and manage your money.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Swifter Wallet",
    startupImage: ["/icons/apple-touch-icon.png"],
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icons/icon-192x192.png",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
        <ServiceWorkerRegistration />
        <InstallPrompt />
      </body>
    </html>
  );
}
