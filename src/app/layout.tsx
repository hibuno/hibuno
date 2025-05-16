import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Playfair_Display, Lora, Montserrat } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
 variable: "--font-playfair",
 subsets: ["latin"],
});

const lora = Lora({
 variable: "--font-lora",
 subsets: ["latin"],
});

const montserrat = Montserrat({
 variable: "--font-montserrat",
 subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Hibuno - AI-Powered Tools & Learning Platform",
    template: "%s | Hibuno"
  },
  description: "Hibuno offers AI-powered tools for image processing, text manipulation, and an immersive learning platform with courses on various subjects.",
  keywords: ["hibuno", "AI tools", "learning platform", "image processing", "text tools", "online courses"],
  authors: [{ name: "Hibuno Team" }],
  creator: "Hibuno",
  publisher: "Hibuno",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  metadataBase: new URL("https://hibuno.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Hibuno",
    title: "Hibuno - AI-Powered Tools & Learning Platform",
    description: "Hibuno offers AI-powered tools for image processing, text manipulation, and an immersive learning platform with courses on various subjects.",
    images: [{
      url: "/og-default.jpg",
      width: 1200,
      height: 630,
      alt: "Hibuno Platform"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Hibuno - AI-Powered Tools & Learning Platform",
    description: "Hibuno offers AI-powered tools for image processing, text manipulation, and an immersive learning platform with courses on various subjects.",
    images: [{
      url: "/og-default.jpg",
      alt: "Hibuno Platform"
    }],
    creator: "@hibuno"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
  <html lang="en" suppressHydrationWarning>
   <body
    className={`${playfair.variable} ${lora.variable} ${montserrat.variable} antialiased`}
   >
    <ThemeProvider
     attribute="class"
     defaultTheme="dark"
     enableSystem
     disableTransitionOnChange
    >
     {children}
    </ThemeProvider>
		<script defer src="https://cloud.umami.is/script.js" data-website-id="ec4cffd4-b6b3-4560-baa5-99ada5122ed1"></script>
   </body>
  </html>
 );
}
