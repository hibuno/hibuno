"use client";

import Link from "next/link";
import { memo, useState, useCallback, useEffect } from "react";
import { Menu, X, Search, ArrowRight, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/content-utils";
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useTranslations, useLocale } from "next-intl";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import type { Locale } from "@/i18n/config";

interface NavLink {
  readonly name: string;
  readonly href: string;
  readonly label: string;
  readonly icon?: string;
}

interface SiteHeaderProps {
  className?: string;
}

const getNavLinks = (t: any): readonly NavLink[] =>
  [
    { name: t("common.home"), href: "/", label: t("common.home") },
    { name: t("common.codes"), href: "/codes", label: t("common.codes") },
  ] as const;

const SearchBar = memo(({ onClose }: { onClose?: () => void }) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  const handleClick = () => {
    setOpen(true);
    if (onClose) onClose();
  };

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="relative w-full px-3 py-1.5 pl-9 pr-16 text-sm bg-muted/50 border border-border rounded-md hover:bg-muted transition-all text-left text-muted-foreground group"
        aria-label="Search articles"
      >
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <span>{t("common.search")}</span>
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 group-hover:opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <SearchDialog open={open} onOpenChange={setOpen} />
    </>
  );
});

SearchBar.displayName = "SearchBar";

const NavigationLink = memo(
  ({ link, onClick }: { link: NavLink; onClick?: () => void }) => {
    const isExternal = link.href.startsWith("http");

    const handleClick = (_e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onClick) {
        onClick();
      }
    };

    return (
      <Link
        href={link.href}
        className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1.5"
        onClick={handleClick}
        {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
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
    );
  }
);

NavigationLink.displayName = "NavigationLink";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
}

const RECENT_SEARCHES_KEY = "hibuno_recent_searches";
const MAX_RECENT_SEARCHES = 5;

const SearchDialog = memo(
  ({
    open,
    onOpenChange,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [popularPosts, setPopularPosts] = useState<SearchResult[]>([]);
    const router = useRouter();
    const t = useTranslations();

    // Load recent searches and popular posts on mount
    useEffect(() => {
      if (open) {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
          try {
            setRecentSearches(JSON.parse(stored));
          } catch (e) {
            console.error("Failed to parse recent searches", e);
          }
        }

        // Fetch popular posts
        const fetchPopularPosts = async () => {
          try {
            const response = await fetch("/api/posts/popular");
            if (response.ok) {
              const data = await response.json();
              setPopularPosts(data.posts || []);
            }
          } catch (error) {
            console.error("Failed to fetch popular posts", error);
          }
        };

        fetchPopularPosts();
      }
    }, [open]);

    // Search effect
    useEffect(() => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      const searchPosts = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `/api/search?q=${encodeURIComponent(query.trim())}`
          );
          if (response.ok) {
            const data = await response.json();
            setResults(data.results || []);
          }
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setLoading(false);
        }
      };

      const debounce = setTimeout(searchPosts, 300);
      return () => clearTimeout(debounce);
    }, [query]);

    const saveRecentSearch = useCallback((searchQuery: string) => {
      const trimmed = searchQuery.trim();
      if (!trimmed) return;

      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      let recent: string[] = [];
      if (stored) {
        try {
          recent = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse recent searches", e);
        }
      }

      // Remove if exists, add to front
      recent = [trimmed, ...recent.filter((s) => s !== trimmed)].slice(
        0,
        MAX_RECENT_SEARCHES
      );
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
      setRecentSearches(recent);
    }, []);

    const handleSelect = useCallback(
      (slug: string) => {
        saveRecentSearch(query);
        onOpenChange(false);
        router.push(`/${slug}`);
        setQuery("");
      },
      [router, onOpenChange, query, saveRecentSearch]
    );

    const handleRecentSearch = useCallback((searchQuery: string) => {
      setQuery(searchQuery);
    }, []);

    const handleViewAll = useCallback(() => {
      saveRecentSearch(query);
      onOpenChange(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }, [router, onOpenChange, query, saveRecentSearch]);

    const clearRecentSearches = useCallback(() => {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
      setRecentSearches([]);
    }, []);

    const showEmptyState = !loading && !query;
    const showRecentSearches = !loading && !query && recentSearches.length > 0;
    const showPopularPosts = !loading && !query && popularPosts.length > 0;

    return (
      <CommandDialog
        open={open}
        onOpenChange={onOpenChange}
        title={t("common.search")}
        description={t("common.searchPlaceholder")}
      >
        <CommandInput
          placeholder={t("common.searchPlaceholder")}
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="w-full max-w-2xl">
          {/* Loading State */}
          {loading && (
            <div className="py-8 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                {t("common.searching")}
              </div>
            </div>
          )}

          {/* Empty State - Show Shortcuts and Suggestions */}
          {showEmptyState && (
            <>
              {/* Recent Searches */}
              {showRecentSearches && (
                <CommandGroup heading={t("common.recentSearches")}>
                  {recentSearches.map((search, index) => (
                    <CommandItem
                      key={index}
                      value={search}
                      onSelect={() => handleRecentSearch(search)}
                    >
                      <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{search}</span>
                    </CommandItem>
                  ))}
                  <CommandItem
                    onSelect={clearRecentSearches}
                    className="justify-center text-xs text-muted-foreground"
                  >
                    {t("common.clearHistory")}
                  </CommandItem>
                </CommandGroup>
              )}

              {/* Popular Posts */}
              {showPopularPosts && (
                <CommandGroup heading={t("common.popularArticles")}>
                  {popularPosts.slice(0, 5).map((post) => (
                    <CommandItem
                      key={post.id}
                      value={post.slug}
                      onSelect={() => handleSelect(post.slug)}
                    >
                      <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <div className="text-sm truncate">{post.title}</div>
                        {post.excerpt && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {post.excerpt}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Keyboard Shortcuts Help */}
              <CommandGroup heading={t("common.keyboardShortcuts")}>
                <div className="px-2 py-2 text-xs text-muted-foreground space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span>{t("common.openSearch")}</span>
                    <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium">
                      <span className="text-xs">⌘</span>K
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t("common.goHome")}</span>
                    <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium">
                      G H
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t("common.goCodes")}</span>
                    <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium">
                      G C
                    </kbd>
                  </div>
                </div>
              </CommandGroup>

              {/* Help Text */}
              {!showRecentSearches && !showPopularPosts && (
                <div className="py-4 px-4 text-center border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    {t("common.startTyping")}
                  </p>
                </div>
              )}
            </>
          )}

          {/* No Results */}
          {!loading && query && results.length === 0 && (
            <div className="py-8 px-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">
                {t("common.noResults", { query })}
              </p>
              <p className="text-xs text-muted-foreground/70">
                {t("common.tryDifferent")}
              </p>
            </div>
          )}

          {/* Search Results */}
          {!loading && results.length > 0 && (
            <>
              <CommandGroup
                heading={t("common.articlesFound", { count: results.length })}
              >
                {results.slice(0, 5).map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.slug}
                    onSelect={() => handleSelect(result.slug)}
                  >
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="font-medium truncate">{result.title}</div>
                      {result.excerpt && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {result.excerpt}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              {results.length > 5 && (
                <div className="border-t border-border">
                  <CommandItem
                    onSelect={handleViewAll}
                    className="justify-center py-3 text-sm font-medium"
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    <span>
                      {t("common.viewAll", { count: results.length })}
                    </span>
                  </CommandItem>
                </div>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    );
  }
);

SearchDialog.displayName = "SearchDialog";

export const SiteHeader = memo(({ className }: SiteHeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const NAV_LINKS = getNavLinks(t);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // G + H: Go to Home
      if (e.key === "h" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

        const lastKey = (window as any).__lastKey;
        if (lastKey === "g") {
          e.preventDefault();
          router.push("/");
          (window as any).__lastKey = null;
          return;
        }
      }

      // G + C: Go to Codes
      if (e.key === "c" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

        const lastKey = (window as any).__lastKey;
        if (lastKey === "g") {
          e.preventDefault();
          router.push("/codes");
          (window as any).__lastKey = null;
          return;
        }
      }

      // Track 'g' key for shortcuts
      if (e.key === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

        (window as any).__lastKey = "g";
        setTimeout(() => {
          (window as any).__lastKey = null;
        }, 1000);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <header
      className={cn(
        "bg-card/60 backdrop-blur-xl border-b sticky top-0 border-border z-50",
        className
      )}
    >
      <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight transition-colors hover:text-muted-foreground font-serif shrink-0"
        >
          hibuno
        </Link>

        {/* Search - Desktop */}
        <div className="hidden md:block flex-1">
          <SearchBar />
        </div>

        {/* Navigation - Desktop */}
        <nav
          className="hidden md:flex items-center gap-6 shrink-0"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => (
            <NavigationLink key={link.name} link={link} />
          ))}
          <LanguageSwitcher currentLocale={locale} />
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden ml-auto p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
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
          className="md:hidden border-t border-border bg-card animate-in slide-in-from-top-2 duration-200"
          aria-label="Mobile navigation"
        >
          <div className="px-4 py-3 space-y-3">
            <SearchBar onClose={() => setMobileMenuOpen(false)} />
            {NAV_LINKS.map((link) => (
              <div key={link.name}>
                <NavigationLink
                  link={link}
                  onClick={() => setMobileMenuOpen(false)}
                />
              </div>
            ))}
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Language</span>
              <LanguageSwitcher currentLocale={locale} />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
});

SiteHeader.displayName = "SiteHeader";
