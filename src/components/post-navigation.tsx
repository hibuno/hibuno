import "server-only";
import Link from "next/link";
import { getServerSupabase } from "@/db/server";

export default async function PostNavigation({
  published_at,
}: {
  published_at: string | null;
}) {
  const supabase = getServerSupabase();
  // Guard: if table is missing, show nothing
  try {
    const [{ data: newer }, { data: older }] = await Promise.all([
      supabase
        .from("posts")
        .select("title,slug")
        .gt("published_at", published_at ?? "")
        .order("published_at", { ascending: true })
        .limit(1),
      supabase
        .from("posts")
        .select("title,slug")
        .lt("published_at", published_at ?? "")
        .order("published_at", { ascending: false })
        .limit(1),
    ]);

    if (!newer?.length && !older?.length) return null;

    return (
      <div className="mt-8 grid gap-4 border-t pt-6 md:grid-cols-2">
        <div>
          {older?.[0] && (
            <Link
              href={`/${older[0].slug}`}
              className="block rounded-lg bg-muted/40 p-4 hover:bg-muted"
            >
              <div className="text-xs text-muted-foreground">Previous</div>
              <div className="line-clamp-2 font-medium">{older[0].title}</div>
            </Link>
          )}
        </div>
        <div className="md:ml-auto md:text-right">
          {newer?.[0] && (
            <Link
              href={`/${newer[0].slug}`}
              className="block rounded-lg bg-muted/40 p-4 hover:bg-muted"
            >
              <div className="text-xs text-muted-foreground">Next</div>
              <div className="line-clamp-2 font-medium">{newer[0].title}</div>
            </Link>
          )}
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
