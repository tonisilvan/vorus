import type { Metadata } from "next";
import { Suspense } from "react";
import { DM_Sans, Sora } from "next/font/google";
import "./globals.css";
import "../styles/animations.css";
import { CartProvider } from "@/context/CartContext";
import { GlobalCart } from "@/components/GlobalCart";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { MicrosoftClarity } from "@/components/MicrosoftClarity";
import { PageTracker } from "@/components/PageTracker";

const displayFont = Sora({ variable: "--font-display", subsets: ["latin"], display: "swap" });
const bodyFont = DM_Sans({ variable: "--font-body", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Vorus - Diseño exclusivo y tecnología premium",
    template: "%s | Vorus",
  },
  description: "Tienda online de diseño exclusivo: power banks, auriculares, cargadores inalámbricos y hogar premium. Precios con IVA y envío gratuito a Península y Portugal.",
  keywords: ["diseño exclusivo", "premium", "electrónica", "hogar", "power bank", "auriculares bluetooth", "cargador inalámbrico", "sacacorchos eléctrico", "juego de té", "tienda online", "envío gratuito", "Vorus"],
  authors: [{ name: "Vorus" }],
  creator: "Vorus",
  publisher: "Vorus",
  metadataBase: new URL("https://vorus.es"),
  alternates: {
    canonical: "/",
    languages: { "es-ES": "/" },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: "Vorus",
    title: "Vorus - Diseño exclusivo y tecnología premium",
    description: "Piezas de diseño exclusivo para tu día a día. IVA y envío incluidos a Península y Portugal.",
    images: [{ url: "/images/powerbank-principal-cable.webp", width: 1000, height: 1000, alt: "Vorus" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vorus - Diseño exclusivo y tecnología premium",
    description: "Piezas de diseño exclusivo. IVA y envío incluidos.",
    images: ["/images/powerbank-principal-cable.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GoogleAnalytics />
        <MicrosoftClarity />
        <Suspense fallback={null}>
          <PageTracker />
        </Suspense>
        <CartProvider>
          {children}
          <GlobalCart />
        </CartProvider>
      </body>
    </html>
  );
}
