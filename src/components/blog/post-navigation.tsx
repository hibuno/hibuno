import "server-only";
import Link from "next/link";
import { getAdjacentPosts } from "@/db/server";

export default async function PostNavigation({
  published_at,
}: {
  published_at: string | null;
}) {
  try {
    const { newer, older } = getAdjacentPosts(published_at);

    if (!newer && !older) return null;

    return (
      <div className="mt-8 grid gap-4 border-t pt-6 md:grid-cols-2">
        <div>
          {older && (
            <Link
              href={`/${older.slug}`}
              className="block rounded-lg bg-muted/40 p-4 hover:bg-muted"
            >
              <div className="text-xs text-muted-foreground">Previous</div>
              <div className="line-clamp-2 font-medium">{older.title}</div>
            </Link>
          )}
        </div>
        <div className="md:ml-auto md:text-right">
          {newer && (
            <Link
              href={`/${newer.slug}`}
              className="block rounded-lg bg-muted/40 p-4 hover:bg-muted"
            >
              <div className="text-xs text-muted-foreground">Next</div>
              <div className="line-clamp-2 font-medium">{newer.title}</div>
            </Link>
          )}
        </div>
      </div>
    );
  } catch {
    return null;
  }
}
