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
