"use client";

import Link from "next/link";
import {
 FileText,
 Image as ImageIcon,
 Check,
 ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/sidebar";
import { trackFeatureUsage, FeatureCategory } from "@/lib/analytics";
import { useEffect } from "react";

// Tool categories with their features
const toolCategories = [
 {
  id: "text-tools",
  title: "Text Tools",
  description:
   "Powerful text manipulation utilities for all your content needs",
  icon: "📝",
  usage: "12/30 Tools Used",
  color: "bg-violet-100",
  textColor: "text-violet-900",
  link: "/tools/text-tools/lowercase",
 },
 {
  id: "image-tools",
  title: "Image Tools",
  description: "Browser-based image processing with no uploads required",
  icon: "🖼️",
  usage: "5/15 Tools Used",
  color: "bg-emerald-100",
  textColor: "text-emerald-900",
  link: "/tools/image-compression",
 },
 {
  id: "upcoming-tools",
  title: "Coming Soon",
  description: "New tools being developed for your needs",
  icon: "🚀",
  usage: "0/5 Tools Used",
  color: "bg-purple-100",
  textColor: "text-purple-900",
  link: "/blog",
 },
];

// Popular tools list
const popularTools = [
 {
  title: "Text Case Converter",
  description: "Convert text to lowercase, uppercase, title case and more",
  icon: <FileText className="h-5 w-5" />,
  link: "/tools/text-tools/lowercase",
 },
 {
  title: "Image Compression",
  description: "Reduce image file sizes while maintaining quality",
  icon: <ImageIcon className="h-5 w-5" />,
  link: "/tools/image-compression",
 },
 {
  title: "Background Removal",
  description: "Automatically remove backgrounds from images",
  icon: <ImageIcon className="h-5 w-5" />,
  link: "/tools/background-removal",
 },
];

// Recent blog posts
const recentPosts = [
 {
  title: "Introducing New Text Tools",
  date: "May 15, 2025",
  excerpt:
   "We've added new text manipulation features to help with your content needs.",
  link: "/blog/introducing-new-text-tools",
 },
 {
  title: "Image Processing Tips",
  date: "May 10, 2025",
  excerpt:
   "Learn how to optimize your images for the web using our free tools.",
  link: "/blog/image-processing-tips",
 },
];

export default function HomeClient() {
 // Track page view when component mounts
 useEffect(() => {
  // Track home page view
  trackFeatureUsage(FeatureCategory.HOME, "view", "home_page");
 }, []);

 // Function to track tool category clicks
 const trackCategoryClick = (categoryId: string, categoryTitle: string) => {
  trackFeatureUsage(
   FeatureCategory.HOME,
   "click",
   `category_${categoryId}`,
   categoryTitle
  );
 };

 // Function to track popular tool clicks
 const trackToolClick = (toolTitle: string) => {
  trackFeatureUsage(FeatureCategory.HOME, "click", "popular_tool", toolTitle);
 };

 // Function to track blog post clicks
 const trackBlogClick = (postTitle: string) => {
  trackFeatureUsage(FeatureCategory.HOME, "click", "blog_post", postTitle);
 };

 return (
  <div className="min-h-screen bg-zinc-900 text-zinc-200 flex">
   {/* Sidebar */}
   <Sidebar />

   {/* Main Content - Add left padding to prevent overlap with sidebar */}
   <div className="flex-1 flex flex-col min-h-screen md:ml-64">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
     {/* Left Column */}
     <div className="md:col-span-2 space-y-6">
      {/* Hero Section */}
      <div className="bg-violet-900 rounded-xl p-6 flex items-center">
       <div className="flex-1">
        <h1 className="text-2xl font-bold text-white">Welcome to Hibuno!</h1>
        <h2 className="text-2xl font-bold text-white mb-1">
         Free Web Tools Dashboard
        </h2>
        <p className="text-violet-200 mb-4">
         All tools run directly in your browser - your data never leaves your
         device.
        </p>
        <Button
         asChild
         className="bg-white text-violet-900 hover:bg-violet-100"
         onClick={() =>
          trackFeatureUsage(
           FeatureCategory.HOME,
           "click",
           "cta_button",
           "Try Our Tools"
          )
         }
        >
         <Link href="/tools/text-tools/lowercase">Try Our Tools</Link>
        </Button>
       </div>
       <div className="hidden md:block">
        <div className="w-32 h-32 flex items-center justify-center bg-violet-800 rounded-lg">
         <FileText className="w-16 h-16 text-violet-200" />
        </div>
       </div>
      </div>

      {/* Tool Categories */}
      <div>
       <h2 className="text-xl font-bold mb-4">Tool Categories</h2>
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {toolCategories.map((category) => (
         <div
          key={category.id}
          className={`${category.color} rounded-xl p-4 ${category.textColor}`}
         >
          <div className="text-2xl mb-2">{category.icon}</div>
          <div className="text-xs mb-1">{category.usage}</div>
          <div className="font-medium">{category.title}</div>
          <Button
           asChild
           variant="ghost"
           size="sm"
           className="mt-2 p-0 h-auto"
           onClick={() => trackCategoryClick(category.id, category.title)}
          >
           <Link href={category.link} className="flex items-center text-xs">
            Explore <ChevronRight className="h-3 w-3 ml-1" />
           </Link>
          </Button>
         </div>
        ))}
       </div>
      </div>

      {/* Popular Tools */}
      <div>
       <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Popular Tools</h2>
        <Button
         asChild
         variant="ghost"
         size="sm"
         className="text-zinc-400 hover:text-zinc-200"
        >
         <Link href="/tools" className="flex items-center">
          View All <ChevronRight className="h-4 w-4 ml-1" />
         </Link>
        </Button>
       </div>
       <div className="space-y-4">
        {popularTools.map((tool, index) => (
         <Card
          key={index}
          className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700/50 transition-colors"
         >
          <CardContent className="p-4">
           <Link
            href={tool.link}
            className="flex items-start"
            onClick={() => trackToolClick(tool.title)}
           >
            <div className="bg-violet-900/20 p-2 rounded-full mr-4">
             {tool.icon}
            </div>
            <div>
             <h3 className="font-medium text-zinc-200">{tool.title}</h3>
             <p className="text-sm text-zinc-400">{tool.description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-500 ml-auto" />
           </Link>
          </CardContent>
         </Card>
        ))}
       </div>
      </div>

      {/* Recent Blog Posts */}
      <div>
       <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Recent Updates</h2>
        <Button
         asChild
         variant="ghost"
         size="sm"
         className="text-zinc-400 hover:text-zinc-200"
        >
         <Link href="/blog" className="flex items-center">
          View All <ChevronRight className="h-4 w-4 ml-1" />
         </Link>
        </Button>
       </div>
       <div className="space-y-4">
        {recentPosts.map((post, index) => (
         <Card key={index} className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4">
           <div className="text-xs text-zinc-400 mb-1">{post.date}</div>
           <Link href={post.link} onClick={() => trackBlogClick(post.title)}>
            <h3 className="font-medium text-zinc-200 hover:text-white transition-colors">
             {post.title}
            </h3>
           </Link>
           <p className="text-sm text-zinc-400 mt-1">{post.excerpt}</p>
          </CardContent>
         </Card>
        ))}
       </div>
      </div>
     </div>

     {/* Right Column */}
     <div className="space-y-6">
      {/* Quick Access */}
      <Card className="bg-zinc-800 border-zinc-700">
       <CardHeader className="pb-2">
        <CardTitle className="text-lg">Quick Access</CardTitle>
       </CardHeader>
       <CardContent className="space-y-2">
        <Button
         asChild
         variant="outline"
         className="w-full justify-start"
         size="sm"
        >
         <Link href="/tools/text-tools/lowercase" className="flex items-center">
          <FileText className="mr-2 h-4 w-4" />
          Text Case Converter
         </Link>
        </Button>
        <Button
         asChild
         variant="outline"
         className="w-full justify-start"
         size="sm"
        >
         <Link href="/tools/image-compression" className="flex items-center">
          <ImageIcon className="mr-2 h-4 w-4" />
          Image Compression
         </Link>
        </Button>
        <Button
         asChild
         variant="outline"
         className="w-full justify-start"
         size="sm"
        >
         <Link
          href="/tools/text-tools/extract-emails"
          className="flex items-center"
         >
          <FileText className="mr-2 h-4 w-4" />
          Extract Emails
         </Link>
        </Button>
       </CardContent>
      </Card>

      {/* Features Card */}
      <Card className="bg-zinc-800 border-zinc-700">
       <CardHeader className="pb-2">
        <CardTitle className="text-lg">Why Choose Hibuno?</CardTitle>
       </CardHeader>
       <CardContent className="space-y-3">
        <div className="flex items-start">
         <div className="bg-violet-900/20 p-1 rounded-full mr-3">
          <Check className="h-4 w-4 text-violet-400" />
         </div>
         <div>
          <h3 className="text-sm font-medium text-zinc-200">100% Free</h3>
          <p className="text-xs text-zinc-400">
           No hidden fees or subscriptions
          </p>
         </div>
        </div>
        <div className="flex items-start">
         <div className="bg-violet-900/20 p-1 rounded-full mr-3">
          <Check className="h-4 w-4 text-violet-400" />
         </div>
         <div>
          <h3 className="text-sm font-medium text-zinc-200">Privacy First</h3>
          <p className="text-xs text-zinc-400">
           All processing happens in your browser
          </p>
         </div>
        </div>
        <div className="flex items-start">
         <div className="bg-violet-900/20 p-1 rounded-full mr-3">
          <Check className="h-4 w-4 text-violet-400" />
         </div>
         <div>
          <h3 className="text-sm font-medium text-zinc-200">No Installation</h3>
          <p className="text-xs text-zinc-400">Use directly in your browser</p>
         </div>
        </div>
       </CardContent>
      </Card>
     </div>
    </div>
   </div>
  </div>
 );
}
