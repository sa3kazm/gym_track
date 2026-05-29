import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gym Track",
  description: "Трекер тренувань та харчування",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk" className="dark">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
