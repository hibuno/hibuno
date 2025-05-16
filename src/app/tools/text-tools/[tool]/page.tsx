import { Suspense } from "react";
import { Metadata } from "next";
import TextToolsClient from "./text-tools-client";
import Link from "next/link";
import { ArrowLeft, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
 title: "Text Tools - Hibuno | Free Online Text Manipulation",
 description:
  "Free online text manipulation tools. Transform case, clean text, sort lines, extract data, and more with our powerful, browser-based text utilities. No installation required.",
 keywords: [
  "text tools",
  "case converter",
  "lowercase converter",
  "uppercase converter",
  "title case converter",
  "random case generator",
  "invert case",
  "capitalize text",
  "reverse text",
  "trim text",
  "sort lines",
  "reverse lines",
  "shuffle lines",
  "number lines",
  "remove empty lines",
  "remove duplicate lines",
  "remove whitespace",
  "remove duplicate spaces",
  "remove punctuation",
  "strip HTML",
  "extract emails",
  "extract URLs",
  "extract numbers",
  "text manipulation",
  "text formatting",
  "text processing",
  "online text tools",
  "hibuno",
 ],
 authors: [{ name: "Hibuno Team" }],
 openGraph: {
  title: "Text Tools - Hibuno | Free Online Text Manipulation",
  description:
   "Free online text manipulation tools. Transform case, clean text, sort lines, extract data, and more with our powerful, browser-based text utilities. No installation required.",
  type: "website",
  siteName: "Hibuno",
  images: [
   {
    url: "/og-tools-text.jpg",
    width: 1200,
    height: 630,
    alt: "Hibuno Text Tools",
   },
  ],
 },
 twitter: {
  card: "summary_large_image",
  title: "Text Tools - Hibuno | Free Online Text Manipulation",
  description:
   "Free online text manipulation tools. Transform case, clean text, sort lines, extract data, and more with our powerful, browser-based text utilities. No installation required.",
  images: [
   {
    url: "/og-tools-text.jpg",
    alt: "Hibuno Text Tools",
   },
  ],
 },
};

export default async function TextToolsPage({
 params,
}: {
 params: Promise<{ tool: string }>;
}) {
 const tool = (await params).tool;
 const tools: Record<string, { title: string; description: string }> = {
  // Case transformation tools
  lowercase: {
   title: "Lowercase Converter | Text Case Changer",
   description:
    "Convert text to lowercase instantly with our free online lowercase converter tool. Transform uppercase or mixed case to all lowercase letters for consistency, data normalization, programming needs, or casual styling. Ideal for CSS formatting, database entries, usernames, and email addresses. No registration required - simple, fast text transformation for all your lowercase conversion needs.",
  },
  uppercase: {
   title: "Uppercase Converter | ALL CAPS Text Generator",
   description:
    "Transform text to UPPERCASE with our free ALL CAPS converter tool. Instantly convert lowercase text to capital letters for headlines, emphasis, acronyms, logos, design projects, or code constants. Perfect for creating attention-grabbing social media posts, standardizing data formats, or emphasizing important information in documents. Easy to use with no installation or sign-up required.",
  },
  randomcase: {
   title: "Random Case Generator | MiXeD cAsE TeXt Creator",
   description:
    "Create eye-catching mIxEd CaSe text with our free Random Case Generator. This tool randomly alternates between uppercase and lowercase letters, perfect for meme text, sarcastic tone, creative typography, social media attention, or stylized branding. Popular for creating Spongebob mocking text, funky usernames, or adding visual interest to digital content. Generate unique text patterns instantly.",
  },
  titlecase: {
   title: "Title Case Converter | Professional Headline Formatter",
   description:
    "Convert text to Title Case with our professional headline formatter. This free tool intelligently capitalizes the first letter of each significant word following standard AP, APA, Chicago, and MLA style guidelines. Perfect for book titles, article headlines, email subjects, blog posts, academic papers, and professional content creation. Ensure consistent, professional-looking titles instantly.",
  },
  invertcase: {
   title: "Invert Case Tool | Text Case Flipper",
   description:
    "Flip text capitalization with our free Invert Case Tool. This utility reverses the case of each letter - uppercase becomes lowercase and vice versa (e.g., 'Hello World' → 'hELLO wORLD'). Ideal for creating visual contrast, creative typography, coding projects, or quickly transforming text without manual editing. Perfect for designers, developers, and content creators seeking unique text effects.",
  },
  capitalize: {
   title: "Text Capitalizer | Sentence Case Formatter",
   description:
    "Automatically format text to Sentence case with our free online Text Capitalizer. This tool intelligently capitalizes the first letter of each sentence while converting the rest to lowercase, ensuring grammatically correct capitalization throughout your essays, emails, articles, and professional documents. Ideal for proofreading, formal writing, and fixing text copied from various sources.",
  },

  // Text transformation tools
  reverse: {
   title: "Text Reverser | Backward Text Generator",
   description:
    "Reverse any text character by character with our free Text Reverser tool. This utility flips your content from end to beginning (e.g., 'Hello' → 'olleH'), useful for creative writing, puzzle creation, palindrome analysis, mirror text effects, or hidden messages. Popular for social media fun, educational activities, and coding challenges. Reverse entire paragraphs or individual words instantly.",
  },
  trim: {
   title: "Text Trimmer | Whitespace Cleaner",
   description:
    "Clean text with our free Text Trimmer that removes leading and trailing whitespace. This essential text processing tool ensures clean, properly formatted content for programming, data entry, and publishing. Prevents spacing errors in code, databases, and documents while preserving internal formatting. Essential for web developers, data analysts, and content editors working with pasted or imported text.",
  },

  // Line operation tools
  "sort-lines": {
   title: "Line Sorter | Alphabetical Text Organizer",
   description:
    "Organize text lines alphabetically with our free Line Sorter tool. Sort content in ascending (A-Z) or descending (Z-A) order with additional options for case sensitivity and numeric sorting. Perfect for organizing lists, bibliography entries, product catalogs, code declarations, data tables, and directories. Essential for programmers, researchers, writers, and data managers who need structured, alphabetized content.",
  },
  "reverse-lines": {
   title: "Line Reverser | Text Order Inverter",
   description:
    "Reverse the order of text lines with our free Line Reverser tool. This utility flips the sequence of lines from bottom to top while maintaining each line's content. Ideal for reversing chronological order, chat logs, log files, poem stanzas, or preparing data for specific processing requirements. Perfect for data analysts, programmers, and content editors needing to invert line sequences quickly.",
  },
  "shuffle-lines": {
   title: "Line Shuffler | Random Text Line Generator",
   description:
    "Randomize text line order with our free Line Shuffler tool. This randomization utility instantly creates unique arrangements of your content lines, perfect for creating varied test data, randomized quiz questions, creative writing exercises, music playlists, or study flashcards. Ideal for teachers, developers, content creators, and researchers needing controlled text randomization for various applications.",
  },
  "number-lines": {
   title: "Line Numbering Tool | Text Line Counter",
   description:
    "Add sequential numbers to text lines with our free Line Numbering Tool. This utility automatically prepends customizable line numbers to your content with options for starting values and intervals. Essential for code examples, legal documents, scripture references, poem verses, collaborative editing, and any text requiring precise line identification or referencing capabilities.",
  },
  "delete-empty-lines": {
   title: "Empty Line Remover | Blank Line Cleaner",
   description:
    "Remove all empty lines from your text with our free Blank Line Cleaner. This optimization tool eliminates unnecessary vertical spacing and blank lines, creating more compact, readable content. Perfect for cleaning programming code, CSV data, copied content from websites, formatted documents, or preparing text for analysis. Streamline your content while preserving all meaningful information.",
  },
  "delete-duplicate-lines": {
   title: "Duplicate Line Remover | Unique Line Extractor",
   description:
    "Eliminate repeated lines with our free Duplicate Line Remover. This data cleaning tool identifies and removes redundant text lines while preserving one instance of each unique line. Essential for cleaning messy data sets, removing copy-paste errors, filtering log files, consolidating lists, or preparing text for analysis. Option to maintain original order or sort results for maximum usability.",
  },

  // Text cleaning tools
  "remove-whitespace": {
   title: "Whitespace Remover | Space Eliminator",
   description:
    "Strip all whitespace characters with our free Whitespace Remover tool. Remove spaces, tabs, line breaks, and invisible formatting characters to create compact text with no separations. Essential for minifying code, creating single-line strings, optimizing character counts, preparing data for specific systems, or cleaning text for technical requirements. Keep your content dense and space-free.",
  },
  "remove-duplicate-spaces": {
   title: "Duplicate Space Remover | Extra Space Cleaner",
   description:
    "Fix inconsistent spacing with our free Multiple Space Remover. This formatting tool converts consecutive spaces into single spaces, ensuring professional, consistent text layout. Perfect for cleaning copy-pasted content from various sources, fixing formatting in documents, preparing content for publishing, or standardizing spacing in code. Maintain clean, professional-looking text with proper spacing.",
  },
  "remove-punctuation": {
   title: "Punctuation Remover | Symbol Stripper",
   description:
    "Strip all punctuation marks from text with our free Punctuation Remover. This specialized cleaner eliminates periods, commas, semicolons, question marks, exclamation points, and all other punctuation symbols. Ideal for natural language processing, keyword extraction, word cloud generation, data analysis, and preparing plain text for systems that can't handle special characters.",
  },
  "strip-html": {
   title: "HTML Tag Stripper | HTML to Plain Text Converter",
   description:
    "Extract clean text from HTML with our free HTML Tag Stripper tool. This converter removes all HTML tags, elements, and attributes while preserving the actual content and its structure. Perfect for converting web content to plain text, cleaning CMS exports, preparing email content, extracting visible text from web pages, or cleaning text for analysis without markup interference.",
  },

  // Text extraction tools
  "extract-emails": {
   title: "Email Extractor | Email Address Finder",
   description:
    "Find and extract all email addresses from text with our free Email Extractor tool. This intelligent utility identifies standard email patterns (name@domain.com) and compiles them into a clean, sorted list. Perfect for contact harvesting, building mailing lists, data mining, transferring contacts between systems, or organizing communication information from documents and web content.",
  },
  "extract-urls": {
   title: "URL Extractor | Link Finder Tool",
   description:
    "Automatically extract all URLs from text with our free URL Extractor. This web link finder identifies and compiles all website addresses (http://, https://, ftp://, etc.) into a clean, clickable list. Perfect for SEO analysis, link collection, website auditing, research organization, or extracting resources from documents, articles, and online content. Save time finding embedded links.",
  },
  "extract-numbers": {
   title: "Number Extractor | Numeric Value Finder",
   description:
    "Extract all numbers from text with our free Number Extractor tool. This numeric utility identifies and compiles integers, decimals, percentages, and numerical values with or without formatting. Ideal for financial analysis, data processing, statistical work, extracting measurements, prices, dates, phone numbers, or any quantitative information from documents, reports, or web content.",
  },
  
  // New tools
  "word-frequency": {
   title: "Word Frequency Counter | Word Usage Analyzer",
   description:
    "Analyze word usage patterns with our free Word Frequency Counter. This tool counts and ranks all words in your text by frequency of occurrence, helping you identify the most common terms and language patterns. Perfect for content analysis, SEO keyword research, linguistic studies, readability assessment, and identifying overused words in your writing. Get instant insights into your text's vocabulary distribution.",
  },
  "base64-encode": {
   title: "Base64 Encoder | Text to Base64 Converter",
   description:
    "Convert plain text to Base64 with our free online encoder. This tool transforms any text into Base64 format, commonly used for encoding binary data within HTML, CSS, JSON, XML, and email attachments. Useful for developers working with APIs, embedding images in CSS, or safely transmitting data that might contain special characters across systems with different character encoding requirements.",
  },
  "base64-decode": {
   title: "Base64 Decoder | Base64 to Text Converter",
   description:
    "Convert Base64 encoded strings back to readable text with our free online decoder. This tool decodes Base64 formatted data commonly used in web applications, emails, and data transfer protocols. Essential for developers debugging encoded data, extracting information from APIs, or working with encoded content in HTML, CSS, or JavaScript files. Simply paste your Base64 string to reveal the original text.",
  },
  "compare-texts": {
   title: "Text Comparison Tool | Text Diff Analyzer",
   description:
    "Compare two texts and highlight differences with our free Text Comparison Tool. This diff analyzer identifies line-by-line variations between documents, showing additions, deletions, and modifications with color-coded highlighting. Perfect for comparing document versions, code changes, contract revisions, or any situation where you need to identify what changed between two text samples. Get clear, visual results instantly.",
  },
 };

 return (
  <Suspense
   fallback={<div className="p-12 text-center">Loading text tools...</div>}
  >
   <div className="min-h-screen bg-zinc-900 text-zinc-200 flex">
    {/* Sidebar */}
    <Sidebar />

    {/* Main Content */}
    <div className="flex-1 flex flex-col min-h-screen md:ml-64 p-4">
     {/* Header */}
     <div className="flex items-center justify-between mb-4">
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
        <Type className="h-5 w-5 mr-2 text-zinc-400" />
        Text Tools
       </h1>
      </div>
     </div>

     <div className="space-y-4">
      <Card className="bg-zinc-800 border-zinc-700 mt-6">
       <CardHeader>
        <CardTitle className="text-lg font-medium">
         About {tools[tool].title}
        </CardTitle>
       </CardHeader>
       <CardContent>
        <div className="space-y-4 text-sm text-zinc-400">
         <p>{tools[tool].description}</p>
        </div>
       </CardContent>
      </Card>
      <TextToolsClient tool={tool} />
     </div>
    </div>
   </div>
  </Suspense>
 );
}
