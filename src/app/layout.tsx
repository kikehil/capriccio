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

const BASE_URL = "https://capricciopizzeria.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Capriccio Pizzería – Pánuco, Veracruz | Pizzas a Domicilio",
    template: "%s | Capriccio Pizzería Pánuco",
  },
  description: "Pizzería artesanal en Pánuco, Veracruz. Pizzas a domicilio y para llevar con ingredientes premium. Pide en línea fácil y rápido. Lun-Dom 10am-10pm. Tel: 846-123-4567.",
  keywords: [
    "pizza pánuco", "pizzería pánuco veracruz", "pizza a domicilio pánuco",
    "pizza artesanal veracruz", "capriccio pizzería", "pizza panuco ver",
    "pedir pizza en línea pánuco", "delivery pizza veracruz norte",
  ],
  authors: [{ name: "Capriccio Pizzería" }],
  creator: "Capriccio Pizzería",
  publisher: "Capriccio Pizzería",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: BASE_URL,
    siteName: "Capriccio Pizzería",
    title: "Capriccio Pizzería – Pánuco, Veracruz",
    description: "Las mejores pizzas artesanales de Pánuco. Pide en línea o llámanos al 846-123-4567. Domicilio y para llevar.",
    images: [
      {
        url: "/logohd.png",
        width: 1709,
        height: 1119,
        alt: "Capriccio Pizzería – Pánuco, Veracruz",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Capriccio Pizzería – Pánuco, Veracruz",
    description: "Las mejores pizzas artesanales de Pánuco. Pide en línea fácil y rápido.",
    images: ["/logohd.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Capriccio",
  },
  icons: {
    apple: "/logohd.png",
  },
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Capriccio Pizzería",
    description: "Pizzería artesanal en Pánuco, Veracruz. Pizzas a domicilio y para llevar.",
    url: "https://capricciopizzeria.com",
    telephone: "+528461234567",
    image: "https://capricciopizzeria.com/logohd.png",
    logo: "https://capricciopizzeria.com/logohd.png",
    servesCuisine: "Pizza",
    priceRange: "$$",
    currenciesAccepted: "MXN",
    paymentAccepted: "Cash, Credit Card",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Pánuco",
      addressLocality: "Pánuco",
      addressRegion: "Veracruz",
      postalCode: "93990",
      addressCountry: "MX",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 22.0167,
      longitude: -98.1833,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        opens: "10:00",
        closes: "22:00",
      },
    ],
    hasMenu: "https://capricciopizzeria.com/#menu",
    acceptsReservations: false,
    orderAction: {
      "@type": "OrderAction",
      target: "https://capricciopizzeria.com",
    },
  };

  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${outfit.variable} ${playfair.variable} antialiased selection:bg-yellow-200 selection:text-black`}
      >
        {children}
      </body>
    </html>
  );
}
