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
  metadataBase: new URL("https://swifter-wallet.vercel.app"),
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
      { url: "/icons/favicon-16x16.png", sizes: "16x16",   type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32",   type: "image/png" },
      { url: "/icons/icon-192x192.png",  sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png",  sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icons/favicon-32x32.png",
  },
  openGraph: {
    type: "website",
    url: "https://swifter-wallet.vercel.app",
    title: "Swifter Wallet",
    description: "Your modern digital wallet — send, receive, and manage your money.",
    siteName: "Swifter Wallet",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Swifter Wallet — modern digital wallet",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Swifter Wallet",
    description: "Your modern digital wallet — send, receive, and manage your money.",
    images: ["/og-image.png"],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
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
