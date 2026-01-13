"use client";

import { memo } from "react";
import { useTranslations } from "next-intl";
import { ExternalLink, Code, Palette, Zap } from "lucide-react";
import Link from "next/link";

interface ProductShortcut {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  features?: string[];
}

const ProductCard = memo(({ product }: { product: ProductShortcut }) => {
  const IconComponent = product.icon;

  return (
    <div>
      <Link
        href={product.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group block p-5 rounded-lg border border-border bg-card hover:bg-accent/50 transition-all duration-300 hover:shadow-md hover:border-accent"
      >
        <div className="space-y-3">
          {/* Icon and Title Row */}
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg ${product.bgColor} group-hover:scale-105 transition-transform duration-300`}
            >
              <IconComponent className={`w-5 h-5 ${product.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-foreground group-hover:text-accent-foreground transition-colors">
                  {product.name}
                </h3>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent-foreground transition-colors opacity-0 group-hover:opacity-100" />
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground group-hover:text-accent-foreground/80 transition-colors leading-relaxed">
            {product.description}
          </p>

          {/* Features/Tags */}
          <div className="flex flex-wrap gap-1.5">
            {product.features?.map((feature, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-muted/50 text-muted-foreground rounded-md group-hover:bg-accent/20 group-hover:text-accent-foreground transition-colors"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

export const ProductShortcuts = memo(() => {
  const t = useTranslations("products");

  const products: ProductShortcut[] = [
    {
      name: "Spy",
      description: t("spy.description"),
      href: "https://spy.hibuno.com",
      icon: Zap,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      features: ["Analytics", "Monitoring", "Real-time"],
    },
    {
      name: "Studio",
      description: t("studio.description"),
      href: "https://studio.hibuno.com",
      icon: Palette,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      features: ["Design", "Creative", "Tools"],
    },
    {
      name: "Playground",
      description: t("playground.description"),
      href: "https://playground.hibuno.com",
      icon: Code,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      features: ["Development", "Testing", "Interactive"],
    },
  ];

  return (
    <section className="bg-card/30 border-t border-border relative overflow-hidden">
      {/* Dashed Bottom Fade Grid */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(to right, #e7e5e4 1px, transparent 1px),
                           linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 0",
          maskImage: `repeating-linear-gradient(to right,
                        black 0px,
                        black 3px,
                        transparent 3px,
                        transparent 8px),
                      repeating-linear-gradient(to bottom,
                        black 0px,
                        black 3px,
                        transparent 3px,
                        transparent 8px),
                      radial-gradient(ellipse 100% 80% at 50% 100%, 
                        #000 50%, 
                        transparent 90%)`,
          WebkitMaskImage: `repeating-linear-gradient(to right,
                              black 0px,
                              black 3px,
                              transparent 3px,
                              transparent 8px),
                            repeating-linear-gradient(to bottom,
                              black 0px,
                              black 3px,
                              transparent 3px,
                              transparent 8px),
                            radial-gradient(ellipse 100% 80% at 50% 100%, 
                              #000 50%, 
                              transparent 90%)`,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
      {/* Dark mode version */}
      <div
        className="absolute inset-0 z-0 dark:block hidden"
        style={{
          backgroundImage: `linear-gradient(to right, #404040 1px, transparent 1px),
                           linear-gradient(to bottom, #404040 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 0",
          maskImage: `repeating-linear-gradient(to right,
                        black 0px,
                        black 3px,
                        transparent 3px,
                        transparent 8px),
                      repeating-linear-gradient(to bottom,
                        black 0px,
                        black 3px,
                        transparent 3px,
                        transparent 8px),
                      radial-gradient(ellipse 100% 80% at 50% 100%, 
                        #000 50%, 
                        transparent 90%)`,
          WebkitMaskImage: `repeating-linear-gradient(to right,
                              black 0px,
                              black 3px,
                              transparent 3px,
                              transparent 8px),
                            repeating-linear-gradient(to bottom,
                              black 0px,
                              black 3px,
                              transparent 3px,
                              transparent 8px),
                            radial-gradient(ellipse 100% 80% at 50% 100%, 
                              #000 50%, 
                              transparent 90%)`,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-6">
        {/* Header Section */}
        <div className="text-left mb-6">
          <h2 className="font-serif text-xl font-semibold mb-2 text-foreground">
            {t("title")}
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {t("subtitle")}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
});

ProductShortcuts.displayName = "ProductShortcuts";
