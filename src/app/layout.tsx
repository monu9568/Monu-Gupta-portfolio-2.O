import type { Metadata, Viewport } from "next";
import { Outfit, Space_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/ui/SmoothScroll";
import CustomCursor from "@/components/ui/CustomCursor";
import Preloader from "@/components/ui/Preloader";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  fallback: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
  adjustFontFallback: false,
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
  fallback: ["monospace", "Courier New"],
  adjustFontFallback: false,
});

export const viewport: Viewport = {
  themeColor: "#06070a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://monugupta.design"),
  title: "Monu Gupta — Full-Stack Developer & Data Analyst",
  description:
    "Portfolio of Monu Gupta — Full-Stack Developer, Data Analyst & AI/ML Specialist. Building modern web applications, interactive dashboards, and intelligent software.",
  keywords: [
    "Full Stack Developer",
    "Data Analyst",
    "Python Developer",
    "Next.js Developer",
    "Three.js Portfolio",
    "Machine Learning",
    "Modern Web Design",
    "Monu Gupta",
    "React Developer",
    "WebGL",
  ],
  authors: [{ name: "Monu Gupta", url: "https://monugupta.design" }],
  creator: "Monu Gupta",
  publisher: "Monu Gupta",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://monugupta.design",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://monugupta.design",
    title: "Monu Gupta — Full-Stack Developer & Data Analyst",
    description:
      "Full-Stack Developer, Data Analyst & AI/ML Specialist. Building modern web applications and intelligent data solutions.",
    siteName: "Monu Gupta Portfolio",
    images: [
      {
        url: "/images/personal/cube-front.webp",
        width: 1200,
        height: 630,
        alt: "Monu Gupta Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Monu Gupta — Full-Stack Developer & Data Analyst",
    description:
      "Full-Stack Developer, Data Analyst & AI/ML Specialist. Building modern web applications and intelligent data solutions.",
    images: ["/images/personal/cube-front.webp"],
    creator: "@monugupta",
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
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://monugupta.design/#person",
        name: "Monu Gupta",
        jobTitle: "Full-Stack Developer & Data Analyst",
        url: "https://monugupta.design",
        sameAs: [
          "https://github.com/monu9568",
          "https://www.linkedin.com/in/monu-gupta-109e/",
        ],
        knowsAbout: [
          "React",
          "Next.js",
          "TypeScript",
          "Python",
          "Data Analytics",
          "Machine Learning",
          "Three.js",
          "WebGL",
          "SQL",
          "Power BI",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://monugupta.design/#website",
        url: "https://monugupta.design",
        name: "Monu Gupta Portfolio",
        publisher: {
          "@id": "https://monugupta.design/#person",
        },
      },
    ],
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${spaceMono.variable} dark scroll-smooth`}
      style={{ backgroundColor: "#06070a", color: "#f8fafc" }}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: `html,body{background-color:#06070a;color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;}` }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        style={{ backgroundColor: "#06070a", color: "#f8fafc" }}
        className="bg-[#06070a] text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-cyan-500/30 selection:text-white"
      >
        <Preloader />
        <CustomCursor />
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}

