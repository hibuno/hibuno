import Link from "next/link";
import type React from "react";

interface SocialLink {
 name: string;
 href: string;
 label: string;
}

interface SiteHeaderProps {
 className?: string;
}

const socialLinks: SocialLink[] = [
 {
  name: "Home",
  href: "/",
  label: "Home",
 },
 {
  name: "YouTube",
  href: "https://youtube.com/@hibuno_id",
  label: "YouTube channel",
 },
 {
  name: "TikTok",
  href: "https://tiktok.com/@hibuno_id",
  label: "TikTok channel",
 },
];

export function SiteHeader({ className }: SiteHeaderProps) {
 return (
  <header
   className={`relative bg-white border-b border-border z-50 ${
    className || ""
   }`}
  >
   <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
    <Link
     href="/"
     className="text-2xl font-bold tracking-tight transition-colors hover:text-muted-foreground"
    >
     <span className="font-serif">hibuno</span>
    </Link>
    <nav
     className="flex items-center gap-4 text-sm"
     aria-label="Main navigation"
    >
     {socialLinks.map((link) => {
      return (
       <Link
        key={link.name}
        href={link.href}
        className="inline-flex items-center gap-2 hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
        {...(link.href.startsWith("http") && {
         target: "_blank",
         rel: "noopener noreferrer",
        })}
       >
        <span className="sr-only">{link.label}</span>
        <span aria-hidden="true">{link.name}</span>
       </Link>
      );
     })}
    </nav>
   </div>
  </header>
 );
}
