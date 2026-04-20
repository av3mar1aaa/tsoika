import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Цойка — домашняя кондитерская",
  description: "Авторские десерты и рецепты",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-rose-200 bg-rose-50 py-6 text-center text-sm text-rose-800/70">
          © {new Date().getFullYear()} Цойка · Сделано с любовью
        </footer>
      </body>
    </html>
  );
}
