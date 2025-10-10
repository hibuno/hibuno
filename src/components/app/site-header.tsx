import Link from "next/link";
import { memo } from "react";
import { cn } from "@/lib/utils";

interface SocialLink {
  readonly name: string;
  readonly href: string;
  readonly label: string;
}

interface SiteHeaderProps {
  className?: string;
}

// Memoize the social links array to prevent recreation on each render
const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    name: "Beranda",
    href: "/",
    label: "Beranda",
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@hibuno_id",
    label: "Kanal YouTube",
  },
  {
    name: "TikTok",
    href: "https://tiktok.com/@hibuno_id",
    label: "Kanal TikTok",
  },
] as const;

// Memoized navigation link component for better performance
const NavigationLink = memo(({ link }: { link: SocialLink }) => {
  const isExternal = link.href.startsWith("http");
  
  return (
    <Link
      key={link.name}
      href={link.href}
      className="inline-flex items-center gap-2 hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm transition-colors"
      {...(isExternal && {
        target: "_blank",
        rel: "noopener noreferrer",
      })}
    >
      <span className="sr-only">{link.label}</span>
      <span aria-hidden="true">{link.name}</span>
    </Link>
  );
});

NavigationLink.displayName = "NavigationLink";

// Main component with memoization for better performance
export const SiteHeader = memo(({ className }: SiteHeaderProps) => {
  return (
    <header
      className={cn(
        "relative bg-white border-b border-border z-50",
        className
      )}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight transition-colors hover:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
        >
          <span className="font-serif">hibuno</span>
        </Link>
        <nav
          className="flex items-center gap-4 text-sm"
          aria-label="Main navigation"
        >
          {SOCIAL_LINKS.map((link) => (
            <NavigationLink key={link.name} link={link} />
          ))}
        </nav>
      </div>
    </header>
  );
});

SiteHeader.displayName = "SiteHeader";
