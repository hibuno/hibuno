import { Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export type Post = {
 id: string;
 slug: string;
 title: string;
 subtitle: string | null;
 excerpt: string | null;
 cover_image_url: string | null;
 author_name: string;
 author_avatar_url: string | null;
 reading_time: number | null;
 published_at: string;
};

export function PostCard({ post }: { post: Post }) {
 const date = new Date(post.published_at);
 return (
  <Link href={`/${post.slug}`} passHref>
   <article className="group cursor-pointer">
    <div className="aspect-[16/9] overflow-hidden rounded-lg mb-4">
     <Image
      src={post.cover_image_url || "/placeholder.svg"}
      alt={post.title}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      width={500}
      height={300}
     />
    </div>
    <div className="space-y-3">
     <div className="flex items-center gap-3 text-sm text-gray-600">
      <span className="font-medium text-gray-900">
       {date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
       })}
      </span>
      {post.reading_time && (
       <>
        <span>•</span>
        <div className="flex items-center gap-1">
         <Clock className="w-4 h-4" />
         <span className="text-sm text-gray-700">
          {post.reading_time} min read
         </span>
        </div>
       </>
      )}
     </div>
     <h3 className="text-2xl font-serif font-bold group-hover:text-gray-600 transition-colors leading-tight">
      {post.title}
     </h3>
     <p className="text-gray-600 line-clamp-2">
      {post.excerpt || post.subtitle || ""}
     </p>
     <div className="flex items-center gap-2 pt-2">
      <Image
       src={post.author_avatar_url || "/placeholder.svg"}
       alt={post.author_name || "hibuno"}
       width={32}
       height={32}
       className="w-8 h-8 rounded-full"
      />
      <span className="text-sm text-gray-700">
       {post.author_name || "hibuno"}
      </span>
     </div>
    </div>
   </article>
  </Link>
 );
}
