import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { CONTACTS, telegramProfileUrl } from "@/lib/contacts";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tsoika.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tsoika — кулинарное волшебство",
    template: "%s — Tsoika",
  },
  description:
    "Авторские торты, макарон, эклеры и пирожные на заказ. Нежные десерты ручной работы.",
  openGraph: {
    type: "website",
    siteName: "Tsoika",
    title: "Tsoika — кулинарное волшебство",
    description:
      "Авторские торты, макарон, эклеры и пирожные на заказ. Нежные десерты ручной работы.",
    images: [{ url: "/hero.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tsoika — кулинарное волшебство",
    description: "Авторские торты, макарон, эклеры и пирожные на заказ.",
    images: ["/hero.png"],
  },
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
        <footer className="border-t border-rose-200 bg-rose-50 py-8 text-sm text-rose-800/80">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 sm:flex-row sm:justify-between">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <a
                href={`tel:${CONTACTS.phone}`}
                className="font-medium text-rose-800 hover:text-rose-600"
              >
                {CONTACTS.phoneDisplay}
              </a>
              <a
                href={telegramProfileUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-rose-800 hover:text-rose-600"
              >
                Telegram: @{CONTACTS.telegramUsername}
              </a>
            </div>
            <div className="text-rose-800/60">
              © {new Date().getFullYear()} Цойка · Сделано с любовью
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
