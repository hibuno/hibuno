"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
 FileText,
 Loader2,
 SlidersHorizontal,
 Eraser,
 Shuffle,
 RotateCw,
 Filter,
 Search,
 Type,
 Lock,
 Unlock,
 DiffIcon,
 Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

// Text statistics interface
interface TextStats {
 totalChars: number;
 charsExcludingSpaces: number;
 words: number;
 sentences: number;
 paragraphs: number;
 lines: number;
 wordFrequency?: Record<string, number>;
}

export default function TextToolsClient({ tool }: { tool: string }) {
 // Unified state management
 const [inputText, setInputText] = useState<string>("");
 const [outputText, setOutputText] = useState<string>("");
 const [isProcessing, setIsProcessing] = useState(false);
 const [secondaryInputText, setSecondaryInputText] = useState<string>("");
 const [showSecondaryInput, setShowSecondaryInput] = useState(false);
 const [diffHighlightedOutput, setDiffHighlightedOutput] = useState<React.ReactNode>(null);

 // Calculate text statistics
 const calculateStats = useCallback((text: string, includeWordFrequency: boolean = false): TextStats => {
  const totalChars = text.length;
  const charsExcludingSpaces = text.replace(/\s/g, "").length;
  const words = text.trim()
   ? text.trim().split(/\s+/).filter(Boolean).length
   : 0;
  const sentences = text.trim()
   ? text.split(/[.!?]+\s*/).filter(Boolean).length
   : 0;
  const paragraphs = text.trim()
   ? text.split(/\n\s*\n/).filter(Boolean).length
   : 0;
  const lines = text.trim() ? text.split(/\n/).length : 0;

  const stats: TextStats = {
   totalChars,
   charsExcludingSpaces,
   words,
   sentences,
   paragraphs,
   lines,
  };

  // Calculate word frequency if requested
  if (includeWordFrequency && text.trim()) {
   const wordFrequency: Record<string, number> = {};
   const wordArray = text.toLowerCase().trim().split(/\s+/).filter(Boolean);
   
   wordArray.forEach(word => {
    // Remove punctuation from words
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    if (cleanWord) {
     wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
    }
   });
   
   stats.wordFrequency = wordFrequency;
  }

  return stats;
 }, []);

 const stats = calculateStats(inputText);

 // Define interfaces for the text transformation functions
 interface CaseTransformations {
  lowercase: (input: string) => string;
  uppercase: (input: string) => string;
  randomcase: (input: string) => string;
  titlecase: (input: string) => string;
  invertcase: (input: string) => string;
  capitalize: (input: string) => string;
  sentence: (input: string) => string;
  alternating: (input: string) => string;
  [key: string]: (input: string) => string;
 }

 interface ManipulationTransformations {
  reverse: (input: string) => string;
  trim: (input: string) => string;
 }

 interface LineTransformations {
  sort: (input: string) => string;
  reverse: (input: string) => string;
  shuffle: (input: string) => string;
  number: (input: string) => string;
  deleteEmpty: (input: string) => string;
  deleteDuplicates: (input: string) => string;
 }

 interface CleaningTransformations {
  removeWhitespace: (input: string) => string;
  removeDuplicateSpaces: (input: string) => string;
  removePunctuation: (input: string) => string;
  stripHtml: (input: string) => string;
  clean: (
   input: string,
   options: {
    removeExtraSpaces: boolean;
    removeExtraLines: boolean;
    trimLines: boolean;
   }
  ) => string;
 }

 interface ExtractionTransformations {
  emails: (input: string) => string;
  urls: (input: string) => string;
  numbers: (input: string) => string;
  wordFrequency: (input: string) => string;
 }

 interface AdvancedTransformations {
  base64Encode: (input: string) => string;
  base64Decode: (input: string) => string;
  compareTexts: (input: string, secondInput: string) => string;
 }

 interface TextTransformations {
  case: CaseTransformations;
  manipulation: ManipulationTransformations;
  lines: LineTransformations;
  cleaning: CleaningTransformations;
  extraction: ExtractionTransformations;
  advanced: AdvancedTransformations;
 }

 // Text transformation functions - organized by category
 const textTransformations: TextTransformations = {
  // Case transformations
  case: {
   lowercase: (input: string) => input.toLowerCase(),
   uppercase: (input: string) => input.toUpperCase(),
   randomcase: (input: string) =>
    input
     .split("")
     .map((char) =>
      Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()
     )
     .join(""),
   titlecase: (input: string) =>
    input.replace(
     /\b\w+/g,
     (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ),
   invertcase: (input: string) =>
    input
     .split("")
     .map((char) =>
      char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
     )
     .join(""),
   capitalize: (input: string) =>
    input.replace(/\b\w/g, (char) => char.toUpperCase()),
   sentence: (input: string) =>
    input
     .toLowerCase()
     .replace(/(^\s*\w|[.!?]\s*\w)/g, (match) => match.toUpperCase()),
   alternating: (input: string) =>
    input
     .split("")
     .map((char, i) => (i % 2 === 0 ? char.toUpperCase() : char.toLowerCase()))
     .join(""),
  },

  // Text manipulation
  manipulation: {
   reverse: (input: string) => input.split("").reverse().join(""),
   trim: (input: string) => input.trim(),
  },

  // Line operations
  lines: {
   sort: (input: string) => input.split("\n").sort().join("\n"),
   reverse: (input: string) => input.split("\n").reverse().join("\n"),
   shuffle: (input: string) => {
    const lines = input.split("\n");
    for (let i = lines.length - 1; i > 0; i--) {
     const j = Math.floor(Math.random() * (i + 1));
     [lines[i], lines[j]] = [lines[j], lines[i]];
    }
    return lines.join("\n");
   },
   number: (input: string) =>
    input
     .split("\n")
     .map((line, index) => `${index + 1}. ${line}`)
     .join("\n"),
   deleteEmpty: (input: string) =>
    input
     .split("\n")
     .filter((line) => line.trim() !== "")
     .join("\n"),
   deleteDuplicates: (input: string) =>
    [...new Set(input.split("\n"))].join("\n"),
  },

  // Text cleaning
  cleaning: {
   removeWhitespace: (input: string) => input.replace(/\s+/g, ""),
   removeDuplicateSpaces: (input: string) => input.replace(/\s+/g, " "),
   removePunctuation: (input: string) =>
    input.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""),
   stripHtml: (input: string) => input.replace(/<[^>]*>/g, ""),
   clean: (
    input: string,
    options: {
     removeExtraSpaces: boolean;
     removeExtraLines: boolean;
     trimLines: boolean;
    }
   ) => {
    let result = input;

    if (options.removeExtraSpaces) {
     result = result.replace(/[ \t]+/g, " ");
    }

    if (options.trimLines) {
     result = result
      .split("\n")
      .map((line) => line.trim())
      .join("\n");
    }

    if (options.removeExtraLines) {
     result = result.replace(/\n{3,}/g, "\n\n");
    }

    return result;
   },
  },

  // Text extraction
  extraction: {
   emails: (input: string) => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = input.match(emailRegex) || [];
    return emails.join("\n");
   },
   urls: (input: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = input.match(urlRegex) || [];
    return urls.join("\n");
   },
   numbers: (input: string) => {
    const numberRegex = /\d+(\.\d+)?/g;
    const numbers = input.match(numberRegex) || [];
    return numbers.join("\n");
   },
   wordFrequency: (input: string) => {
    const stats = calculateStats(input, true);
    if (!stats.wordFrequency) return "No words found";
    
    // Sort words by frequency (highest first)
    const sortedWords = Object.entries(stats.wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(([word, count]) => `${word}: ${count}`)
      .join("\n");
    
    return sortedWords;
   },
  },
  
  // Advanced transformations
  advanced: {
   base64Encode: (input: string) => {
    try {
     return btoa(input);
    } catch {
     return "Error encoding to Base64. Make sure your text contains only valid characters.";
    }
   },
   base64Decode: (input: string) => {
    try {
     return atob(input);
    } catch {
     return "Error decoding from Base64. Make sure your input is valid Base64 encoded text.";
    }
   },
   compareTexts: (input: string, secondInput: string) => {
    // Simple diff implementation - returns a description of differences
    const lines1 = input.split('\n');
    const lines2 = secondInput.split('\n');
    
    let result = '';
    const maxLines = Math.max(lines1.length, lines2.length);
    
    for (let i = 0; i < maxLines; i++) {
     const line1 = i < lines1.length ? lines1[i] : '';
     const line2 = i < lines2.length ? lines2[i] : '';
     
     if (line1 !== line2) {
      result += `Line ${i+1}:\n- ${line1}\n+ ${line2}\n\n`;
     }
    }
    
    return result || 'The texts are identical';
   },
  },

 };

 // Transform text based on transformation type
 const transformText = (transformType: string) => {
  if (!inputText.trim()) {
   return;
  }

  setIsProcessing(true);

  // Simulate processing delay for better UX
  setTimeout(() => {
   try {
    let transformed = inputText;

    // Map the transformation type to the appropriate function
    switch (transformType) {
     // Case transformations
     case "lowercase":
      transformed = textTransformations.case.lowercase(inputText);
      break;
     case "uppercase":
      transformed = textTransformations.case.uppercase(inputText);
      break;
     case "randomcase":
      transformed = textTransformations.case.randomcase(inputText);
      break;
     case "titlecase":
      transformed = textTransformations.case.titlecase(inputText);
      break;
     case "invertcase":
      transformed = textTransformations.case.invertcase(inputText);
      break;
     case "capitalize":
      transformed = textTransformations.case.capitalize(inputText);
      break;

     // Text manipulation
     case "reverse":
      transformed = textTransformations.manipulation.reverse(inputText);
      break;
     case "trim":
      transformed = textTransformations.manipulation.trim(inputText);
      break;

     // Line operations
     case "sort-lines":
      transformed = textTransformations.lines.sort(inputText);
      break;
     case "reverse-lines":
      transformed = textTransformations.lines.reverse(inputText);
      break;
     case "shuffle-lines":
      transformed = textTransformations.lines.shuffle(inputText);
      break;
     case "number-lines":
      transformed = textTransformations.lines.number(inputText);
      break;
     case "delete-empty-lines":
      transformed = textTransformations.lines.deleteEmpty(inputText);
      break;
     case "delete-duplicate-lines":
      transformed = textTransformations.lines.deleteDuplicates(inputText);
      break;

     // Text cleaning
     case "remove-whitespace":
      transformed = textTransformations.cleaning.removeWhitespace(inputText);
      break;
     case "remove-duplicate-spaces":
      transformed =
       textTransformations.cleaning.removeDuplicateSpaces(inputText);
      break;
     case "remove-punctuation":
      transformed = textTransformations.cleaning.removePunctuation(inputText);
      break;
     case "strip-html":
      transformed = textTransformations.cleaning.stripHtml(inputText);
      break;

     // Text extraction
     case "extract-emails":
      transformed = textTransformations.extraction.emails(inputText);
      break;
     case "extract-urls":
      transformed = textTransformations.extraction.urls(inputText);
      break;
     case "extract-numbers":
      transformed = textTransformations.extraction.numbers(inputText);
      break;
     case "word-frequency":
      transformed = textTransformations.extraction.wordFrequency(inputText);
      break;
      
     // Advanced transformations
     case "base64-encode":
      transformed = textTransformations.advanced.base64Encode(inputText);
      break;
     case "base64-decode":
      transformed = textTransformations.advanced.base64Decode(inputText);
      break;
     case "compare-texts":
      transformed = textTransformations.advanced.compareTexts(inputText, secondaryInputText);
      
      // Create highlighted diff view
      const lines1 = inputText.split('\n');
      const lines2 = secondaryInputText.split('\n');
      const maxLines = Math.max(lines1.length, lines2.length);
      
      const diffElements = [];
      for (let i = 0; i < maxLines; i++) {
       const line1 = i < lines1.length ? lines1[i] : '';
       const line2 = i < lines2.length ? lines2[i] : '';
       
       if (line1 !== line2) {
        diffElements.push(
         <div key={`diff-${i}`} className="mb-2 p-2 bg-zinc-800 rounded-md">
          <div className="text-xs text-zinc-400 mb-1">Line {i+1}:</div>
          <div className="bg-red-900/20 p-1 rounded mb-1 text-red-200">- {line1}</div>
          <div className="bg-green-900/20 p-1 rounded text-green-200">+ {line2}</div>
         </div>
        );
       }
      }
      
      setDiffHighlightedOutput(
       diffElements.length > 0 ? 
       <div className="space-y-1">{diffElements}</div> : 
       <div className="text-green-400 p-2">The texts are identical</div>
      );
      break;
    }

    setOutputText(transformed);
   } catch (err) {
    console.error(err);
   } finally {
    setIsProcessing(false);
   }
  }, 300);
 };

 // Effect to show/hide secondary input based on tool type
 useEffect(() => {
  setShowSecondaryInput(tool === 'compare-texts');
  setDiffHighlightedOutput(null);
 }, [tool]);

 return (
  <>
   <Card className="bg-zinc-800 border-zinc-700 shadow-md">
    <CardHeader>
     <CardTitle className="text-sm font-medium flex items-center">
      <FileText className="h-4 w-4 mr-2 text-zinc-400" />
      {showSecondaryInput ? 'First Text' : 'Input Text'}
     </CardTitle>
    </CardHeader>
    <CardContent>
     <Textarea
      placeholder="Enter or paste your text here..."
      className="min-h-[180px] bg-zinc-900 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 text-sm"
      value={inputText}
      onChange={(e) => setInputText(e.target.value)}
     />
    </CardContent>
   </Card>
   
   {showSecondaryInput && (
    <Card className="bg-zinc-800 border-zinc-700 shadow-md mt-4">
     <CardHeader>
      <CardTitle className="text-sm font-medium flex items-center">
       <FileText className="h-4 w-4 mr-2 text-zinc-400" />
       Second Text
      </CardTitle>
     </CardHeader>
     <CardContent>
      <Textarea
       placeholder="Enter or paste your second text here for comparison..."
       className="min-h-[180px] bg-zinc-900 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 text-sm"
       value={secondaryInputText}
       onChange={(e) => setSecondaryInputText(e.target.value)}
      />
     </CardContent>
    </Card>
   )}

   <div className="flex flex-wrap items-center bg-zinc-800/80 border border-zinc-700 rounded-md shadow-sm p-2 text-xs text-zinc-400 justify-between">
    <Button onClick={() => transformText(tool)}>
     Run{" "}
     {tool
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")}
    </Button>
    <div className="flex items-center gap-1">
     <div className="flex gap-3">
      <div className="flex items-center gap-1">
       <span className="text-zinc-500">Chars:</span>
       <span className="text-violet-400 font-medium">{stats.totalChars}</span>
      </div>
      <div className="flex items-center gap-1">
       <span className="text-zinc-500">No Spaces:</span>
       <span className="text-violet-400 font-medium">
        {stats.charsExcludingSpaces}
       </span>
      </div>
      <div className="flex items-center gap-1">
       <span className="text-zinc-500">Words:</span>
       <span className="text-violet-400 font-medium">{stats.words}</span>
      </div>
      <div className="flex items-center gap-1">
       <span className="text-zinc-500">Sentences:</span>
       <span className="text-violet-400 font-medium">{stats.sentences}</span>
      </div>
      <div className="flex items-center gap-1">
       <span className="text-zinc-500">Paragraphs:</span>
       <span className="text-violet-400 font-medium">{stats.paragraphs}</span>
      </div>
     </div>
    </div>
   </div>
   <Card className="bg-zinc-800 border-zinc-700 shadow-md">
    <CardHeader>
     <CardTitle className="text-sm font-medium flex items-center">
      <FileText className="h-4 w-4 mr-2 text-zinc-400" />
      Result
     </CardTitle>
    </CardHeader>
    <CardContent>
     {isProcessing ? (
      <div className="flex justify-center py-6">
       <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
      </div>
     ) : tool === 'compare-texts' && diffHighlightedOutput ? (
      <div className="min-h-[180px] bg-zinc-900 border border-zinc-700 rounded-md p-3 text-zinc-200 text-sm overflow-auto">
       {diffHighlightedOutput}
      </div>
     ) : (
      <Textarea
       className="min-h-[180px] bg-zinc-900 border-zinc-700 text-zinc-200 text-sm"
       value={outputText}
       readOnly
      />
     )}
    </CardContent>
   </Card>

   <Card className="bg-zinc-800 border-zinc-700 shadow-md">
    <CardHeader>
     <CardTitle className="text-sm font-medium flex items-center">
      <Type className="h-4 w-4 mr-2 text-zinc-400" />
      Quick Text Transformations
     </CardTitle>
    </CardHeader>
    <CardContent className="px-4 pt-2 pb-4">
     <div className="flex flex-wrap gap-2">
      <Link href={`/tools/text-tools/lowercase`}>
       <Button
        variant="ghost"
        size="sm"
        className="h-9 border border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-700 text-xs justify-start px-2"
       >
        <Type className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> Lowercase Text
       </Button>
      </Link>
      <Link href={`/tools/text-tools/uppercase`}>
       <Button
        variant="ghost"
        size="sm"
        className="h-9 border border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-700 text-xs justify-start px-2"
       >
        <Type className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> Uppercase Text
       </Button>
      </Link>
      <Link href={`/tools/text-tools/randomcase`}>
       <Button
        variant="ghost"
        size="sm"
        className="h-9 border border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-700 text-xs justify-start px-2"
       >
        <Shuffle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> Random Case
       </Button>
      </Link>
      <Link href={`/tools/text-tools/titlecase`}>
       <Button
        variant="ghost"
        size="sm"
        className="h-9 border border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-700 text-xs justify-start px-2"
       >
        <Type className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> Title Case
       </Button>
      </Link>
      <Link href={`/tools/text-tools/invertcase`}>
       <Button
        variant="ghost"
        size="sm"
        className="h-9 border border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-700 text-xs justify-start px-2"
       >
        <Type className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> Invert Case
       </Button>
      </Link>
      <Link href={`/tools/text-tools/capitalize`}>
       <Button
        variant="ghost"
        size="sm"
        className="h-9 border border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-700 text-xs justify-start px-2"
       >
        <Type className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> Capitalize Text
       </Button>
      </Link>
      <Link href={`/tools/text-tools/sort-lines`}>
       <Button
        variant="ghost"
        size="sm"
        className="h-9 border border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-700 text-xs justify-start px-2"
       >
        <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> Sort
        Lines
       </Button>
      </Link>
      <Link href={`/tools/text-tools/reverse-lines`}>
       <Button
        variant="ghost"
        size="sm"
        className="h-9 border border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-700 text-xs justify-start px-2"
       >
        <RotateCw className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> Reverse Text
       </Button>
      </Link>
      <Link href={`/tools/text-tools/shuffle-lines`}>
       <Button
        variant="ghost"
        size="sm"
        className="h-9 border border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-700 text-xs justify-start px-2"
       >
        <Shuffle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> Shuffle Lines
       </Button>
      </Link>
      <Link href={`/tools/text-tools/number-lines`}>
       <Button
        variant="ghost"
        size="sm"
        className="h-9 border border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-700 text-xs justify-start px-2"
       >
        <FileText className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> Number Lines
       </Button>
      </Link>
      <Link href={`/tools/text-tools/delete-empty-lines`}>
       <Button
        variant="ghost"
        size="sm"
        className="h-9 border border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-700 text-xs justify-start px-2"
       >
        <Eraser className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> Delete Empty
        Lines
       </Button>
      </Link>
      <Link href={`/tools/text-tools/delete-duplicate-lines`}>
       <Button
        variant="ghost"
        size="sm"
        className="h-9 border border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-700 text-xs justify-start px-2"
       >
        <Filter className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> Delete Duplicate
        Lines
       </Button>
      </Link>
      <Link href={`/tools/text-tools/extract-emails`}>
       <Button
        variant="ghost"
        size="sm"
        className="h-9 border border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-700 text-xs justify-start px-2"
       >
        <Search className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> Extract Emails
       </Button>
      </Link>
      <Link href={`/tools/text-tools/extract-urls`}>
       <Button
        variant="ghost"
        size="sm"
        className="h-9 border border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-700 text-xs justify-start px-2"
       >
        <Search className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> Extract URLs
       </Button>
      </Link>
      <Link href={`/tools/text-tools/extract-numbers`}>
       <Button
        variant="ghost"
        size="sm"
        className="h-9 border border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-700 text-xs justify-start px-2"
       >
        <Search className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> Extract Numbers
       </Button>
      </Link>
      <Link href={`/tools/text-tools/strip-html`}>
       <Button
        variant="ghost"
        size="sm"
        className="h-9 border border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-700 text-xs justify-start px-2"
       >
        <Eraser className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> Strip HTML Tags
       </Button>
      </Link>
      <Link href={`/tools/text-tools/remove-duplicate-spaces`}>
       <Button
        variant="ghost"
        size="sm"
        className="h-9 border border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-700 text-xs justify-start px-2"
       >
        <Eraser className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> Remove Extra
        Spaces
       </Button>
      </Link>
      <Link href={`/tools/text-tools/remove-whitespace`}>
       <Button
        variant="ghost"
        size="sm"
        className="h-9 border border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-700 text-xs justify-start px-2"
       >
        <Eraser className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> Remove All
        Spaces
       </Button>
      </Link>
      <Link href={`/tools/text-tools/remove-punctuation`}>
       <Button
        variant="ghost"
        size="sm"
        className="h-9 border border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-700 text-xs justify-start px-2"
       >
        <Eraser className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> Remove
        Punctuation
       </Button>
      </Link>
      <Link href={`/tools/text-tools/word-frequency`}>
       <Button
        variant="ghost"
        size="sm"
        className="h-9 border border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-700 text-xs justify-start px-2"
       >
        <Hash className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> Word Frequency
       </Button>
      </Link>
      <Link href={`/tools/text-tools/base64-encode`}>
       <Button
        variant="ghost"
        size="sm"
        className="h-9 border border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-700 text-xs justify-start px-2"
       >
        <Lock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> Base64 Encode
       </Button>
      </Link>
      <Link href={`/tools/text-tools/base64-decode`}>
       <Button
        variant="ghost"
        size="sm"
        className="h-9 border border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-700 text-xs justify-start px-2"
       >
        <Unlock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> Base64 Decode
       </Button>
      </Link>
      <Link href={`/tools/text-tools/compare-texts`}>
       <Button
        variant="ghost"
        size="sm"
        className="h-9 border border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-700 text-xs justify-start px-2"
       >
        <DiffIcon className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> Compare Texts
       </Button>
      </Link>
     </div>
    </CardContent>
   </Card>
  </>
 );
}
