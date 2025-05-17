"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
 Search,
 Bell,
 Home,
 Newspaper,
 Menu,
 X,
 ImageIcon,
 FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { textTools } from "@/lib/text-tools";

// Define image tools data structure similar to textTools for consistency
const imageTools = {
 "image-analysis": {
  title: "AI Image Validator",
  path: "/tools/image-analysis",
 },
 "background-removal": {
  title: "Background Removal",
  path: "/tools/background-removal",
 },
 "image-compression": {
  title: "Image Compression",
  path: "/tools/image-compression",
 },
};

// Define document tools
const documentTools = {
 "document-extractor": {
  title: "Content Extraction",
  path: "/tools/document-extractor",
  isNew: true,
 },
};

// Common navigation links component that works for both mobile and desktop
const NavigationLinks = ({
 isMobile = false,
 onMobileItemClick = () => {},
 searchQuery = "",
}) => {
 // Filter image tools based on search query
 const filteredImageTools = useMemo(() => {
  if (!searchQuery) return Object.entries(imageTools);
  const query = searchQuery.toLowerCase();
  return Object.entries(imageTools).filter(([, tool]) =>
   tool.title.toLowerCase().includes(query)
  );
 }, [searchQuery]);

 // Filter document tools based on search query
 const filteredDocumentTools = useMemo(() => {
  if (!searchQuery) return Object.entries(documentTools);
  const query = searchQuery.toLowerCase();
  return Object.entries(documentTools).filter(([, tool]) =>
   tool.title.toLowerCase().includes(query)
  );
 }, [searchQuery]);

 // Filter text tools based on search query
 const filteredTextTools = useMemo(() => {
  if (!searchQuery) return Object.entries(textTools);
  const query = searchQuery.toLowerCase();
  return Object.entries(textTools).filter(([, tool]) => {
   const title = tool.title.replace(/\|.+/, "").trim();
   return title.toLowerCase().includes(query);
  });
 }, [searchQuery]);

 // Determine if we should show sections based on filtered results
 const showImageSection = filteredImageTools.length > 0;
 const showDocumentSection = filteredDocumentTools.length > 0;
 const showTextSection = filteredTextTools.length > 0;

 return (
  <nav className="space-y-1">
   <Link href="/" onClick={isMobile ? onMobileItemClick : undefined}>
    <Button
     variant="ghost"
     className="w-full justify-start gap-2 text-zinc-400 hover:text-white group"
    >
     <Home
      className={`h-4 w-4 ${
       !isMobile ? "group-hover:text-violet-400 transition-colors" : ""
      }`}
     />
     <span>Dashboard</span>
    </Button>
   </Link>
   <Link href="/blog" onClick={isMobile ? onMobileItemClick : undefined}>
    <Button
     variant="ghost"
     className="w-full justify-start gap-2 text-zinc-400 hover:text-white group"
    >
     <Newspaper
      className={`h-4 w-4 ${
       !isMobile ? "group-hover:text-violet-400 transition-colors" : ""
      }`}
     />
     <span>Blog</span>
    </Button>
   </Link>

   {/* Document Section */}
   {showDocumentSection && (
    <>
     <div className="pt-2 pb-1">
      <div className="text-xs text-zinc-500 px-3 py-1">Documents</div>
     </div>

     {filteredDocumentTools.map(([key, tool]) => (
      <Link
       key={key}
       href={tool.path}
       onClick={isMobile ? onMobileItemClick : undefined}
      >
       <Button
        variant="ghost"
        className="w-full justify-start gap-2 text-zinc-400 hover:text-white group"
       >
        <FileText
         className={`h-4 w-4 ${
          !isMobile ? "group-hover:text-violet-400 transition-colors" : ""
         }`}
        />
        <span>{tool.title}</span>
        {tool.isNew && !isMobile && (
         <Badge className="ml-auto text-xs bg-violet-500 text-white">New</Badge>
        )}
       </Button>
      </Link>
     ))}
    </>
   )}

   {/* Image Section */}
   {showImageSection && (
    <>
     <div className="pt-2 pb-1">
      <div className="text-xs text-zinc-500 px-3 py-1">Image</div>
     </div>

     {filteredImageTools.map(([key, tool]) => (
      <Link
       key={key}
       href={tool.path}
       onClick={isMobile ? onMobileItemClick : undefined}
      >
       <Button
        variant="ghost"
        className="w-full justify-start gap-2 text-zinc-400 hover:text-white group"
       >
        <ImageIcon
         className={`h-4 w-4 ${
          !isMobile ? "group-hover:text-violet-400 transition-colors" : ""
         }`}
        />
        <span>{tool.title}</span>
       </Button>
      </Link>
     ))}
    </>
   )}

   {/* Text Section */}
   {showTextSection && (
    <>
     <div className="pt-2 pb-1">
      <div className="text-xs text-zinc-500 px-3 py-1">Text Utilities</div>
     </div>

     {filteredTextTools.map(([tool, details]) => (
      <Link
       key={tool}
       href={`/tools/text-tools/${tool}`}
       onClick={isMobile ? onMobileItemClick : undefined}
      >
       <Button
        variant="ghost"
        className="w-full justify-start gap-2 text-zinc-400 hover:text-white group"
       >
        <FileText
         className={`h-4 w-4 ${
          !isMobile ? "group-hover:text-violet-400 transition-colors" : ""
         }`}
        />
        <span>{(details.title || "").replace(/\|.+/, "")}</span>
       </Button>
      </Link>
     ))}
    </>
   )}

   {filteredImageTools.length === 0 &&
    filteredTextTools.length === 0 &&
    searchQuery && (
     <div className="text-zinc-400 text-center text-xs p-4 border border-zinc-700	rounded-lg mt-4">
      No tools found matching &quot;{searchQuery}&quot;
     </div>
    )}
  </nav>
 );
};

export function Sidebar() {
 const [showMobileNav, setShowMobileNav] = useState(false);
 const [searchQuery, setSearchQuery] = useState("");

 // Mobile Header (always rendered but only visible on mobile)
 const mobileHeader = (
  <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-b border-zinc-700 p-3 flex items-center justify-between fixed top-0 left-0 right-0 z-50 md:hidden">
   <div className="flex items-center gap-1 text-white font-bold">
    <Image src="/logo.svg" alt="Logo" width={86} height={24} />
   </div>
   <div className="flex items-center gap-2">
    <Button
     variant="ghost"
     size="icon"
     className="text-zinc-400 hover:text-white"
    >
     <Search className="h-5 w-5" />
    </Button>
    <Button
     variant="ghost"
     size="icon"
     className="text-zinc-400 hover:text-white"
    >
     <Bell className="h-5 w-5" />
    </Button>
    <Button
     variant="ghost"
     size="icon"
     className="text-zinc-400 hover:text-white"
     onClick={() => setShowMobileNav(!showMobileNav)}
    >
     <Menu className="h-5 w-5" />
    </Button>
   </div>
  </div>
 );

 // Mobile Navigation Overlay
 const mobileNav = showMobileNav && (
  <div className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm md:hidden">
   <div className="bg-zinc-900 h-full w-4/5 max-w-xs p-4 border-r border-zinc-700 animate-in slide-in-from-left">
    <div className="flex justify-between items-center mb-6">
     <div className="flex items-center gap-1 text-white font-bold">
      <Image src="/logo.svg" alt="Logo" width={86} height={24} />
     </div>
     <Button
      variant="ghost"
      size="icon"
      className="text-zinc-400 hover:text-white"
      onClick={() => setShowMobileNav(false)}
     >
      <X className="h-5 w-5" />
     </Button>
    </div>

    {/* Mobile Navigation Content */}
    <div className="space-y-6">
     <div className="relative mb-4">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
      <Input
       type="text"
       placeholder="Search tools..."
       className="pl-9 bg-zinc-800/50 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
       value={searchQuery}
       onChange={(e) => setSearchQuery(e.target.value)}
      />
     </div>

     <NavigationLinks
      isMobile={true}
      onMobileItemClick={() => setShowMobileNav(false)}
      searchQuery={searchQuery}
     />
    </div>
   </div>
  </div>
 );

 return (
  <>
   {/* Mobile header and navigation */}
   {mobileHeader}
   {mobileNav}

   {/* Desktop Sidebar - Hidden on mobile */}
   <div className="hidden md:block w-64 border-r border-zinc-700 bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-800 overflow-y-auto hide-scrollbar fixed h-screen z-30">
    <div className="p-4">
     <div className="flex items-center mb-6">
      <div className="flex items-center gap-1 text-white font-bold">
       <Image src="/logo.svg" alt="Logo" width={92} height={24} />
      </div>
      <div className="flex ml-auto gap-1">
       <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-zinc-400 hover:text-white"
       >
        <Bell className="h-4 w-4" />
       </Button>
      </div>
     </div>

     <div className="relative mb-6">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
      <Input
       type="text"
       placeholder="Search tools..."
       className="pl-9 bg-zinc-800/50 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
       value={searchQuery}
       onChange={(e) => setSearchQuery(e.target.value)}
      />
     </div>

     <div className="space-y-6">
      <NavigationLinks searchQuery={searchQuery} />
     </div>
    </div>
   </div>
  </>
 );
}
