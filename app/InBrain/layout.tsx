import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "InBrain.ai",
};

export default function InBrainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
