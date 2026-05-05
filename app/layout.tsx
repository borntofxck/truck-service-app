import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { company, semanticCore } from "@/lib/siteContent";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ogImage =
  "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=85";

export const metadata: Metadata = {
  metadataBase: new URL(company.siteUrl),
  applicationName: "Автоком 54",
  title: {
    default:
      "Автоком 54 - ремонт грузовых автомобилей в Новосибирске",
    template: "%s | Автоком 54",
  },
  description:
    "Грузовой автосервис Автоком 54 в Новосибирске: диагностика, ремонт ходовой, тормозной системы, пневматики, двигателя, КПП, электрики, прицепов и спецтехники. Онлайн-заявка и маршрут на картах.",
  keywords: semanticCore,
  authors: [{ name: "Автоком 54" }],
  creator: "Автоком 54",
  publisher: "Автоком 54",
  category: "auto repair",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Автоком 54 - грузовой автосервис в Новосибирске",
    description:
      "Ремонт грузовиков, прицепов и спецтехники на Толмачёвской 25 ст1. Диагностика, ходовая, пневматика, электрика, двигатель и КПП.",
    url: company.siteUrl,
    siteName: "Автоком 54",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 800,
        alt: "Грузовой автомобиль и сервис грузовой техники",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Автоком 54 - ремонт грузовиков в Новосибирске",
    description:
      "Грузовой автосервис: диагностика, ходовая, тормоза, пневматика, двигатель, КПП, электрика и спецтехника.",
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    telephone: true,
    address: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
