import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CPX Research",
};

export default function CpxLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
