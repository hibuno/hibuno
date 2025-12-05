import { ArrowLeft, HomeIcon } from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "@/components/blog/site-header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16 text-center">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-serif text-5xl sm:text-6xl font-bold text-muted-foreground mb-3 sm:mb-4">
            404
          </h1>
          <h2 className="text-xl sm:text-2xl font-semibold mb-2">
            Halaman tidak ditemukan
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Maaf, kami tidak dapat menemukan halaman yang Anda cari.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button asChild>
            <Link href="/" className="gap-2">
              <HomeIcon className="h-4 w-4" />
              Kembali ke beranda
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="javascript:history.back()" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
