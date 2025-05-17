"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import remarkGfm from "remark-gfm";

interface MarkdownDisplayProps {
 markdown: string;
}

export function MarkdownDisplay({ markdown }: MarkdownDisplayProps) {
 const [copied, setCopied] = useState(false);
 const [downloading, setDownloading] = useState(false);

 const copyToClipboard = () => {
  navigator.clipboard.writeText(markdown);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
 };

 const downloadMarkdown = () => {
  try {
   setDownloading(true);
   const blob = new Blob([markdown], { type: "text/markdown" });
   const url = URL.createObjectURL(blob);
   const link = document.createElement("a");
   link.href = url;
   link.download = `document-extraction-${new Date().toISOString().slice(0, 10)}.md`;
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
   URL.revokeObjectURL(url);
  } catch (error) {
   console.error("Error downloading markdown:", error);
  } finally {
   setDownloading(false);
  }
 };

 return (
  <div className="space-y-4">
   <div className="flex justify-between items-center">
    <h3 className="text-lg font-semibold">Extracted Content</h3>
    <div className="flex gap-2">
     <Button
      variant="outline"
      size="sm"
      onClick={downloadMarkdown}
      className="flex items-center gap-1"
      disabled={downloading}
     >
      <Download className="h-3.5 w-3.5" />
      {downloading ? "Downloading..." : "Download"}
     </Button>
     <Button
      variant="outline"
      size="sm"
      onClick={copyToClipboard}
      className="flex items-center gap-1"
     >
      <Copy className="h-3.5 w-3.5" />
      {copied ? "Copied!" : "Copy"}
     </Button>
    </div>
   </div>

   <Tabs defaultValue="preview">
    <TabsList className="grid w-full grid-cols-2">
     <TabsTrigger value="preview">Preview</TabsTrigger>
     <TabsTrigger value="markdown">Markdown</TabsTrigger>
    </TabsList>
    <TabsContent value="preview" className="mt-4">
     <div className="p-4 border rounded-md bg-card prose max-w-none dark:prose-invert overflow-auto">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
     </div>
    </TabsContent>
    <TabsContent value="markdown" className="mt-4">
     <pre className="p-4 border rounded-md bg-muted overflow-auto whitespace-pre-wrap">
      <code>{markdown}</code>
     </pre>
    </TabsContent>
   </Tabs>
  </div>
 );
}
