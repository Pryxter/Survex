import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TheoremReach",
};

export default function TheoremReachLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
