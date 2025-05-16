import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Urbanist } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const urbanist = Urbanist({
 subsets: ["latin"],
 weight: ["400", "500", "600", "700", "800", "900"],
 variable: "--font-sans",
});

export const metadata: Metadata = {
 title: {
  default: "Hibuno - AI-Powered Tools & Learning Platform",
  template: "%s | Hibuno",
 },
 description:
  "Hibuno offers AI-powered tools for image processing, text manipulation, and an immersive learning platform with courses on various subjects.",
 keywords: [
  "hibuno",
  "AI tools",
  "learning platform",
  "image processing",
  "text tools",
  "online courses",
 ],
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
  description:
   "Hibuno offers AI-powered tools for image processing, text manipulation, and an immersive learning platform with courses on various subjects.",
  images: [
   {
    url: "/og-default.jpg",
    width: 1200,
    height: 630,
    alt: "Hibuno Platform",
   },
  ],
 },
 twitter: {
  card: "summary_large_image",
  title: "Hibuno - AI-Powered Tools & Learning Platform",
  description:
   "Hibuno offers AI-powered tools for image processing, text manipulation, and an immersive learning platform with courses on various subjects.",
  images: [
   {
    url: "/og-default.jpg",
    alt: "Hibuno Platform",
   },
  ],
  creator: "@hibuno",
 },
 robots: {
  index: true,
  follow: true,
  googleBot: {
   index: true,
   follow: true,
   "max-image-preview": "large",
   "max-snippet": -1,
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
   <body className={`${urbanist.variable} antialiased font-sans pt-16 md:pt-0`}>
    <ThemeProvider
     attribute="class"
     defaultTheme="dark"
     enableSystem
     disableTransitionOnChange
    >
     {children}
    </ThemeProvider>
    {process.env.NEXT_ENV === "production" && (
     <>
      <script
       defer
       src="https://cloud.umami.is/script.js"
       data-website-id="ec4cffd4-b6b3-4560-baa5-99ada5122ed1"
      ></script>
      <SpeedInsights />
      <Analytics />
     </>
    )}
   </body>
  </html>
 );
}
