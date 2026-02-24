import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BitLabs",
};

export default function BitLabsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
