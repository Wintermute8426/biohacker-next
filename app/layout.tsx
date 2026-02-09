import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Biohacker - Peptide Protocol Tracker",
  description: "Track and manage your peptide cycles with precision",
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
