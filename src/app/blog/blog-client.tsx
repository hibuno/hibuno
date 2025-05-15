"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
 Search,
 Clock,
 Filter,
 ChevronDown,
 ArrowLeft,
 Newspaper,
 X,
 SortAsc,
 SortDesc,
 Calendar,
 Tag,
} from "lucide-react";
import { PostMeta } from "@/lib/mdx";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuGroup,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

interface BlogClientProps {
 initialPosts: PostMeta[];
}

type SortOption = "newest" | "oldest" | "a-z" | "z-a";

export default function BlogClient({ initialPosts }: BlogClientProps) {
 const [searchQuery, setSearchQuery] = useState("");
 const [isFilterOpen, setIsFilterOpen] = useState(false);
 const [sortOption, setSortOption] = useState<SortOption>("newest");
 const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
 const [availableCategories, setAvailableCategories] = useState<string[]>([]);

 // Extract all unique categories from posts
 useEffect(() => {
  const categories = initialPosts
   .map((post) => post.category || "Uncategorized")
   .filter((category, index, self) => self.indexOf(category) === index)
   .sort();
  setAvailableCategories(categories);
 }, [initialPosts]);

 // Handle category selection
 const toggleCategory = (category: string) => {
  setSelectedCategories((prev) =>
   prev.includes(category)
    ? prev.filter((c) => c !== category)
    : [...prev, category]
  );
 };

 // Clear all filters
 const clearFilters = () => {
  setSearchQuery("");
  setSelectedCategories([]);
  setSortOption("newest");
 };

 // Apply filters and sorting
 const filteredPosts = initialPosts
  .filter((post) => {
   // Text search filter
   const matchesSearch =
    searchQuery === "" ||
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.author?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

   // Category filter
   const matchesCategory =
    selectedCategories.length === 0 ||
    selectedCategories.includes(post.category || "Uncategorized");

   return matchesSearch && matchesCategory;
  })
  .sort((a, b) => {
   // Apply sorting
   switch (sortOption) {
    case "newest":
     return new Date(b.date).getTime() - new Date(a.date).getTime();
    case "oldest":
     return new Date(a.date).getTime() - new Date(b.date).getTime();
    case "a-z":
     return a.title.localeCompare(b.title);
    case "z-a":
     return b.title.localeCompare(a.title);
    default:
     return 0;
   }
  });

 const featuredPosts = filteredPosts.filter((post) => post.featured);
 const regularPosts = filteredPosts.filter((post) => !post.featured);

 return (
  <div className="min-h-screen bg-zinc-900 text-zinc-200 flex">
   {/* Sidebar */}
   <Sidebar />

   {/* Main Content - Add left padding to prevent overlap with sidebar */}
   <div className="flex-1 flex flex-col min-h-screen md:ml-64 p-6">
    {/* Header */}
    <header className="flex items-center justify-between mb-6">
     <div className="flex items-center">
      <Link href="/">
       <Button
        variant="ghost"
        size="icon"
        className="mr-2 text-zinc-400 hover:text-white"
       >
        <ArrowLeft className="h-5 w-5" />
       </Button>
      </Link>
      <h1 className="text-xl font-bold flex items-center">
       <Newspaper className="h-5 w-5 mr-2 text-zinc-400" />
       Blog
      </h1>
     </div>
     <div className="flex items-center gap-3">
      <div className="relative hidden md:block w-64">
       <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
       <Input
        type="text"
        placeholder="Search articles..."
        className="pl-9 bg-zinc-800/50 border-zinc-700 focus:border-blue-500"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
       />
       {searchQuery && (
        <button
         className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
         onClick={() => setSearchQuery("")}
        >
         <X className="h-4 w-4" />
        </button>
       )}
      </div>
      <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
       <DropdownMenuTrigger asChild>
        <Button
         variant="outline"
         className="gap-2 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"
        >
         <Filter className="h-4 w-4" />
         <span className="hidden md:inline">Filter</span>
         <ChevronDown className="h-4 w-4" />
        </Button>
       </DropdownMenuTrigger>
       <DropdownMenuContent className="w-56 bg-zinc-800 border-zinc-700 text-zinc-200">
        <DropdownMenuLabel className="flex items-center justify-between">
         <span>Filters</span>
         <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-zinc-400 hover:text-white"
          onClick={clearFilters}
         >
          Clear All
         </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-700" />
        <DropdownMenuGroup>
         <DropdownMenuLabel className="flex items-center gap-2">
          <SortAsc className="h-4 w-4 text-zinc-400" /> Sort By
         </DropdownMenuLabel>
         <DropdownMenuItem
          className={`${sortOption === "newest" ? "bg-zinc-700" : ""}`}
          onClick={() => setSortOption("newest")}
         >
          <Calendar className="h-4 w-4 mr-2 text-zinc-400" />
          Newest First
         </DropdownMenuItem>
         <DropdownMenuItem
          className={`${sortOption === "oldest" ? "bg-zinc-700" : ""}`}
          onClick={() => setSortOption("oldest")}
         >
          <Calendar className="h-4 w-4 mr-2 text-zinc-400" />
          Oldest First
         </DropdownMenuItem>
         <DropdownMenuItem
          className={`${sortOption === "a-z" ? "bg-zinc-700" : ""}`}
          onClick={() => setSortOption("a-z")}
         >
          <SortAsc className="h-4 w-4 mr-2 text-zinc-400" />
          A-Z
         </DropdownMenuItem>
         <DropdownMenuItem
          className={`${sortOption === "z-a" ? "bg-zinc-700" : ""}`}
          onClick={() => setSortOption("z-a")}
         >
          <SortDesc className="h-4 w-4 mr-2 text-zinc-400" />
          Z-A
         </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-zinc-700" />
        <DropdownMenuGroup>
         <DropdownMenuLabel className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-zinc-400" /> Categories
         </DropdownMenuLabel>
         <div className="max-h-48 overflow-y-auto py-1 px-1">
          {availableCategories.map((category) => (
           <div
            key={category}
            className="flex items-center space-x-2 p-2 hover:bg-zinc-700 rounded-md cursor-pointer"
            onClick={() => toggleCategory(category)}
           >
            <Checkbox
             id={`category-${category}`}
             checked={selectedCategories.includes(category)}
             className="border-zinc-600 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
            />
            <label
             htmlFor={`category-${category}`}
             className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
             {category}
            </label>
           </div>
          ))}
         </div>
        </DropdownMenuGroup>
       </DropdownMenuContent>
      </DropdownMenu>
     </div>
    </header>

    {/* Blog Content */}
    {/* Search and active filters */}
    <div className="mb-6 space-y-3">
     {/* Search for mobile */}
     <div className="relative md:hidden">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
      <Input
       type="text"
       placeholder="Search articles..."
       className="pl-9 bg-zinc-800/50 border-zinc-700 focus:border-blue-500"
       value={searchQuery}
       onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery && (
       <button
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
        onClick={() => setSearchQuery("")}
       >
        <X className="h-4 w-4" />
       </button>
      )}
     </div>
     
     {/* Active filters display */}
     {(selectedCategories.length > 0 || sortOption !== "newest" || searchQuery) && (
      <div className="flex flex-wrap gap-2 items-center">
       <span className="text-xs text-zinc-400">Active filters:</span>
       
       {searchQuery && (
        <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700 flex items-center gap-1 text-xs py-1">
         <Search className="h-3 w-3" />
         {searchQuery}
         <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-white">
          <X className="h-3 w-3" />
         </button>
        </Badge>
       )}
       
       {sortOption !== "newest" && (
        <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700 flex items-center gap-1 text-xs py-1">
         {sortOption === "oldest" && <Calendar className="h-3 w-3" />}
         {sortOption === "a-z" && <SortAsc className="h-3 w-3" />}
         {sortOption === "z-a" && <SortDesc className="h-3 w-3" />}
         {sortOption === "oldest" && "Oldest First"}
         {sortOption === "a-z" && "A-Z"}
         {sortOption === "z-a" && "Z-A"}
         <button onClick={() => setSortOption("newest")} className="ml-1 hover:text-white">
          <X className="h-3 w-3" />
         </button>
        </Badge>
       )}
       
       {selectedCategories.map(category => (
        <Badge key={category} variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700 flex items-center gap-1 text-xs py-1">
         <Tag className="h-3 w-3" />
         {category}
         <button 
          onClick={() => toggleCategory(category)} 
          className="ml-1 hover:text-white"
         >
          <X className="h-3 w-3" />
         </button>
        </Badge>
       ))}
       
       <Button 
        variant="ghost" 
        size="sm" 
        className="text-xs text-zinc-400 hover:text-white py-1 h-auto"
        onClick={clearFilters}
       >
        Clear all
       </Button>
      </div>
     )}
    </div>

    {/* Featured Posts */}
    {featuredPosts.length > 0 && (
     <section className="mb-12">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
       <span className="bg-indigo-400 bg-clip-text text-transparent">
        Featured Articles
       </span>
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
       {featuredPosts.map((post) => (
        <Link href={`/blog/${post.slug}`} key={post.slug}>
         <article className="rounded-xl overflow-hidden border border-zinc-700 bg-gradient-to-b from-zinc-800 to-zinc-800/70 hover:border-blue-700/50 transition-all duration-300 h-full flex flex-col group">
          <div className="relative h-48 overflow-hidden">
           <Image
            src={post.featuredImage || "/placeholder.svg"}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-60"></div>
           <Badge className="absolute top-3 left-3 bg-indigo-500 text-white border-0">
            {post.category}
           </Badge>
          </div>
          <div className="p-5 flex-1 flex flex-col">
           <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors">
            {post.title}
           </h3>
           <p className="text-zinc-400 text-sm mb-4 flex-1">{post.excerpt}</p>
           <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
             {post.author && (
              <>
               <Avatar className="h-8 w-8 border border-zinc-700">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback className="bg-zinc-800 text-zinc-400">
                 {post.author.name.charAt(0)}
                </AvatarFallback>
               </Avatar>
               <div className="text-xs">
                <p className="text-zinc-300">{post.author.name}</p>
                <p className="text-zinc-500">{post.author.role}</p>
               </div>
              </>
             )}
            </div>
            <div className="flex items-center text-zinc-500 text-xs gap-1">
             <Clock className="h-3 w-3" />
             <span>
              {post.readingTime ? `${post.readingTime} min read` : "5 min read"}
             </span>
            </div>
           </div>
          </div>
         </article>
        </Link>
       ))}
      </div>
     </section>
    )}

    {/* Regular Posts */}
    {regularPosts.length > 0 && (
     <section>
      <h2 className="text-xl font-semibold mb-6">
       <span className="bg-indigo-400 bg-clip-text text-transparent">
        All Articles
       </span>
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
       {regularPosts.map((post) => (
        <Link href={`/blog/${post.slug}`} key={post.slug}>
         <article className="rounded-lg overflow-hidden border border-zinc-700 bg-gradient-to-b from-zinc-800 to-zinc-800/70 hover:border-blue-700/50 transition-all duration-300 h-full flex flex-col group">
          <div className="relative h-40 overflow-hidden">
           <Image
            src={post.featuredImage || "/placeholder.svg"}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-60"></div>
           <Badge className="absolute top-3 left-3 bg-zinc-700 text-zinc-300 border-0">
            {post.category}
           </Badge>
          </div>
          <div className="p-4 flex-1 flex flex-col">
           <h3 className="text-base font-semibold mb-2 group-hover:text-blue-400 transition-colors">
            {post.title}
           </h3>
           <p className="text-zinc-400 text-xs mb-3 flex-1 line-clamp-2">
            {post.excerpt}
           </p>
           <div className="flex items-center justify-between mt-auto">
            {post.author && (
             <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 border border-zinc-700">
               <AvatarImage src={post.author.avatar} alt={post.author.name} />
               <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">
                {post.author.name.charAt(0)}
               </AvatarFallback>
              </Avatar>
              <span className="text-zinc-400 text-xs">{post.author.name}</span>
             </div>
            )}
            <div className="flex items-center text-zinc-500 text-xs gap-1">
             <Clock className="h-3 w-3" />
             <span>
              {post.readingTime ? `${post.readingTime} min read` : "5 min read"}
             </span>
            </div>
           </div>
          </div>
         </article>
        </Link>
       ))}
      </div>
     </section>
    )}

    {filteredPosts.length === 0 && (
     <div className="text-center py-12">
      <h3 className="text-xl font-semibold mb-2">No articles found</h3>
      <p className="text-zinc-400 mb-4">Try adjusting your search criteria or filters</p>
      <Button 
       variant="outline" 
       onClick={clearFilters}
       className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"
      >
       Clear all filters
      </Button>
     </div>
    )}

    {/* Footer */}
    <footer className="border-t border-zinc-800 py-6">
     <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
       <div className="text-zinc-400 text-sm">
        © 2025 hibuno. All rights reserved.
       </div>
       <div className="flex gap-4">
        <Link
         href="/privacy-policy"
         className="text-zinc-400 hover:text-white text-sm"
        >
         Privacy Policy
        </Link>
        <Link
         href="/terms-of-service"
         className="text-zinc-400 hover:text-white text-sm"
        >
         Terms of Service
        </Link>
       </div>
      </div>
     </div>
    </footer>
   </div>
  </div>
 );
}
