"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ArrowLeft } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
}

export function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
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

    searchPosts();
  }, [query]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
        <h1 className="text-2xl sm:text-3xl font-serif font-semibold mb-2">
          Hasil Pencarian
        </h1>
        {query && (
          <p className="text-muted-foreground">
            Menampilkan hasil untuk "{query}"
          </p>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border rounded-lg p-4">
              <div className="h-6 w-3/4 bg-muted rounded animate-pulse mb-2" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !query && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">Mulai pencarian</h2>
          <p className="text-muted-foreground">
            Gunakan kotak pencarian untuk menemukan artikel
          </p>
        </div>
      )}

      {/* No Results */}
      {!loading && query && results.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">Tidak ada hasil</h2>
          <p className="text-muted-foreground">
            Coba gunakan kata kunci yang berbeda
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Ditemukan {results.length} artikel
          </p>
          {results.map((result) => (
            <Link
              key={result.id}
              href={`/${result.slug}`}
              className="block border border-border rounded-lg p-4 hover:border-foreground/20 hover:bg-muted/50 transition-all"
            >
              <h3 className="font-serif font-semibold text-lg mb-2 hover:text-muted-foreground transition-colors">
                {result.title}
              </h3>
              {result.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {result.excerpt}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
