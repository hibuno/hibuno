"use client";

import type React from "react";

import { useState } from "react";
import { Link, ArrowRight, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UrlInputProps {
 onUrlSubmit: (url: string) => void;
 placeholder?: string;
 label?: string;
}

export function UrlInput({
 onUrlSubmit,
 placeholder = "Enter URL",
 label = "Or enter a URL",
}: UrlInputProps) {
 const [url, setUrl] = useState("");
 const [error, setError] = useState<string | null>(null);

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  // Basic URL validation
  if (!url.trim()) {
   setError("Please enter a URL");
   return;
  }

  try {
   // Check if it's a valid URL
   new URL(url);
   onUrlSubmit(url);
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
   setError("Please enter a valid URL");
  }
 };

 return (
  <div className="w-full">
   {error && (
    <Alert
     variant="destructive"
     className="mb-4 bg-red-900/20 border-red-800 text-red-300"
    >
     <AlertCircle className="h-4 w-4" />
     <AlertDescription>{error}</AlertDescription>
    </Alert>
   )}

   <div className="mb-2 text-sm text-zinc-400">{label}</div>
   <form onSubmit={handleSubmit} className="flex gap-2">
    <div className="relative flex-1">
     <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
      <Link className="h-4 w-4 text-zinc-500" />
     </div>
     <Input
      type="text"
      value={url}
      onChange={(e) => setUrl(e.target.value)}
      placeholder={placeholder}
      className="pl-9 bg-zinc-800/50 border-zinc-700 focus:border-violet-500"
     />
    </div>
    <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
     <ArrowRight className="h-4 w-4" />
    </Button>
   </form>
  </div>
 );
}
