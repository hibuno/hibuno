"use client";

import Link from "next/link";
import { memo } from "react";
import { useTranslations } from "next-intl";
import { siYoutube, siTiktok, siInstagram } from "simple-icons";

const getSocialLinks = () =>
  [
    {
      name: "YouTube",
      href: "https://youtube.com/@hibuno_id",
      icon: siYoutube.path,
    },
    {
      name: "TikTok",
      href: "https://tiktok.com/@hibuno_id",
      icon: siTiktok.path,
    },
    {
      name: "Instagram",
      href: "https://instagram.com/hibuno_id",
      icon: siInstagram.path,
    },
  ] as const;

const FooterSection = memo(
  ({
    title,
    links,
  }: {
    title: string;
    links: readonly { name: string; href: string; icon?: string }[];
  }) => (
    <div>
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => {
          const isExternal = link.href.startsWith("http");
          return (
            <li key={link.name}>
              <Link
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                {...(isExternal && {
                  target: "_blank",
                  rel: "noopener noreferrer",
                })}
              >
                {link.icon && (
                  <svg
                    role="img"
                    viewBox="0 0 24 24"
                    className="w-3.5 h-3.5 fill-current"
                    aria-hidden="true"
                  >
                    <path d={link.icon} />
                  </svg>
                )}
                <span>{link.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  )
);

FooterSection.displayName = "FooterSection";

export const SiteFooter = memo(() => {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");
  const currentYear = new Date().getFullYear();

  const navigationLinks = [
    { name: tCommon("home"), href: "/" },
    { name: tCommon("codes"), href: "/codes" },
    { name: t("sitemap"), href: "/sitemap.xml" },
  ];

  const socialLinks = getSocialLinks();

  return (
    <footer className="border-t border-border bg-card/30 mt-16">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link
              href="/"
              className="text-xl font-serif font-semibold mb-3 inline-block"
            >
              hibuno
            </Link>
            <p className="text-sm text-muted-foreground">{t("tagline")}</p>
          </div>

          {/* Navigation */}
          <FooterSection title={t("navigation")} links={navigationLinks} />

          {/* Social */}
          <FooterSection title={t("socialMedia")} links={socialLinks} />
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            © {currentYear} hibuno. {t("allRightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  );
});

SiteFooter.displayName = "SiteFooter";
