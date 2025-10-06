import "server-only";
import Image from "next/image";
import Link from "next/link";
import { getServerSupabase } from "@/db/server";

export default async function SimilarPosts({
  currentSlug,
  tags,
}: {
  currentSlug: string;
  tags?: string[] | null;
}) {
  const supabase = getServerSupabase();
  try {
    let query = supabase
      .from("posts")
      .select("slug,title,excerpt,cover_image_url,published_at")
      .neq("slug", currentSlug)
      .limit(4);
    if (tags?.length) {
      // Try tag overlap; if column missing or error—fallback happens in catch
      query = query.contains("tags", tags);
    }
    const { data, error } = await query.order("published_at", {
      ascending: false,
    });
    if (error) throw error;
    if (!data?.length) return null;

    return (
      <section aria-label="Similar posts" className="mt-12">
        <h3 className="mb-4 text-lg font-semibold">Similar posts</h3>
        <ul className="grid gap-6 sm:grid-cols-2">
          {data.map((p) => (
            <li key={p.slug} className="group">
              <Link href={`/${p.slug}`} className="flex gap-3">
                {p.cover_image_url ? (
                  <Image
                    src={p.cover_image_url || "/placeholder.svg"}
                    alt=""
                    width={128}
                    height={80}
                    className="h-20 w-32 rounded-md object-cover ring-1 ring-border"
                  />
                ) : (
                  <div className="h-20 w-32 rounded-md bg-muted" />
                )}
                <div>
                  <div className="line-clamp-2 font-medium group-hover:underline">
                    {p.title}
                  </div>
                  {p.excerpt && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {p.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  } catch {
    // Fallback to latest excluding current
    try {
      const { data } = await supabase
        .from("posts")
        .select("slug,title,excerpt,cover_image_url,published_at")
        .neq("slug", currentSlug)
        .order("published_at", { ascending: false })
        .limit(4);
      if (!data?.length) return null;
      return (
        <section aria-label="Similar posts" className="mt-12">
          <h3 className="mb-4 text-lg font-semibold">Similar posts</h3>
          <ul className="grid gap-6 sm:grid-cols-2">
            {data.map((p) => (
              <li key={p.slug} className="group">
                <Link href={`/${p.slug}`} className="flex gap-3">
                  {p.cover_image_url ? (
                    <Image
                      src={p.cover_image_url || "/placeholder.svg"}
                      alt=""
                      width={128}
                      height={80}
                      className="h-20 w-32 rounded-md object-cover ring-1 ring-border"
                    />
                  ) : (
                    <div className="h-20 w-32 rounded-md bg-muted" />
                  )}
                  <div>
                    <div className="line-clamp-2 font-medium group-hover:underline">
                      {p.title}
                    </div>
                    {p.excerpt && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {p.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      );
    } catch {
      return null;
    }
  }
}
