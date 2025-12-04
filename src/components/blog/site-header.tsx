import Link from "next/link";
import { memo } from "react";
import { cn } from "@/lib/content-utils";

interface SocialLink {
  readonly name: string;
  readonly href: string;
  readonly label: string;
}

interface SiteHeaderProps {
  className?: string;
}

const SOCIAL_LINKS: readonly SocialLink[] = [
  { name: "Beranda", href: "/", label: "Beranda" },
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

const NavigationLink = memo(({ link }: { link: SocialLink }) => {
  const isExternal = link.href.startsWith("http");
  return (
    <Link
      href={link.href}
      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
      {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
    >
      <span className="sr-only">{link.label}</span>
      <span aria-hidden="true">{link.name}</span>
    </Link>
  );
});

NavigationLink.displayName = "NavigationLink";

export const SiteHeader = memo(({ className }: SiteHeaderProps) => {
  return (
    <header className={cn("bg-card border-b border-border", className)}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight transition-colors hover:text-muted-foreground"
        >
          <span className="font-serif">hibuno</span>
        </Link>
        <nav className="flex items-center gap-4" aria-label="Main navigation">
          {SOCIAL_LINKS.map((link) => (
            <NavigationLink key={link.name} link={link} />
          ))}
        </nav>
      </div>
    </header>
  );
});

SiteHeader.displayName = "SiteHeader";
