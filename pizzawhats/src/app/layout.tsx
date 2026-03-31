import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Pizza Capriccio | La Mejor Pizza Artesanal",
  description: "Ordena la mejor pizza artesanal en 3 clicks. Ingredientes premium, orilla de queso y envío directo por WhatsApp con Capriccio. ¡Pide ahora!",
  keywords: ["pizza", "domicilio", "artesanal", "pizza capriccio", "whatsapp pizza"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Capriccio",
  },
  icons: {
    apple: "/img/capriccio-logo.png",
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={`${outfit.variable} ${playfair.variable} antialiased selection:bg-yellow-200 selection:text-black`}
      >
        {children}
      </body>
    </html>
  );
}
