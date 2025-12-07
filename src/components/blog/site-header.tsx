"use client";

import Link from "next/link";
import { memo, useState } from "react";
import { Menu, X } from "lucide-react";
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
  { name: "Codes", href: "/codes", label: "Video & Social Media" },
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

const NavigationLink = memo(
  ({ link, onClick }: { link: SocialLink; onClick?: () => void }) => {
    const isExternal = link.href.startsWith("http");

    const handleClick = (_e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onClick) {
        onClick();
      }
    };

    return (
      <Link
        href={link.href}
        className="text-muted-foreground hover:text-foreground transition-colors text-sm"
        onClick={handleClick}
        {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
      >
        <span className="sr-only">{link.label}</span>
        <span aria-hidden="true">{link.name}</span>
      </Link>
    );
  }
);

NavigationLink.displayName = "NavigationLink";

export const SiteHeader = memo(({ className }: SiteHeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        "bg-card/60 backdrop-blur-xl border-b sticky top-0 border-border z-50",
        className
      )}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight transition-colors hover:text-muted-foreground"
        >
          <span className="font-serif">hibuno</span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden sm:flex items-center gap-4"
          aria-label="Main navigation"
        >
          {SOCIAL_LINKS.map((link) => (
            <NavigationLink key={link.name} link={link} />
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="sm:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav
          className="sm:hidden border-t border-border bg-card animate-in slide-in-from-top-2 duration-200"
          aria-label="Mobile navigation"
        >
          <div className="px-4 py-3 space-y-3">
            {SOCIAL_LINKS.map((link) => (
              <div key={link.name}>
                <NavigationLink
                  link={link}
                  onClick={() => setMobileMenuOpen(false)}
                />
              </div>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
});

SiteHeader.displayName = "SiteHeader";
