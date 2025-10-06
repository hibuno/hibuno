import "server-only";
import GithubSlugger from "github-slugger";
import type { Heading, Text } from "mdast";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";

type TocItem = { depth: number; text: string; id: string };

export async function extractHeadings(markdown: string): Promise<TocItem[]> {
 const tree = unified()
  .use(remarkParse)
  .parse(markdown || "");
 const items: TocItem[] = [];
 const slugger = new GithubSlugger();
 visit(tree, "heading", (node: Heading) => {
  const depth = node.depth;
  if (depth > 3) return;
  let text = "";
  node.children?.forEach((c) => {
   if (
    c &&
    typeof c === "object" &&
    "type" in c &&
    c.type === "text" &&
    "value" in c
   ) {
    text += (c as Text).value;
   }
  });
  const id = slugger.slug(text);
  if (text) items.push({ depth, text, id });
 });
 return items;
}

export default async function PostTOC({ markdown }: { markdown: string }) {
 const toc = await extractHeadings(markdown);
 if (!toc.length) return null;
 return (
  <nav aria-label="In this article">
   <div className="rounded-xl border bg-background/40 p-4 prose-custom prose max-w-none">
    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
     In this article
    </h3>
    <ol className="space-y-2">
     {toc.map((item) => (
      <li key={item.id} className="text-sm">
       <a href={`#${item.id}`}>{item.text}</a>
      </li>
     ))}
    </ol>
   </div>
  </nav>
 );
}
