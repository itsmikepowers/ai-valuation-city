import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "AI CITY — The private AI economy, built to scale",
  description:
    "Explore the private AI economy as a living voxel city. Fly between companies, compare skylines, and rewind time.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
