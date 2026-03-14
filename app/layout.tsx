import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Survex App",
  title: {
    default: "Survex App – Earn Gift Cards by Completing Surveys",
    template: "Survex - %s",
  },
  openGraph: {
    siteName: "Survex App",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-icon.png",
  },
  verification: {
    other: {
      "websitelaunches-verification": "2420a2c581723599df78560443178c44",
    },
  },
  description:
    "Survex is a rewards platform where users earn gift cards by completing surveys and offerwall tasks. We partner with trusted providers to offer fast payouts, secure tracking, and a seamless earning experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
