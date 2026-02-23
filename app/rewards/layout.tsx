import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rewards",
};

export default function RewardsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
