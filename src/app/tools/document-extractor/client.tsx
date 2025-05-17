"use client";

import { useState } from "react";
import { FileDropzone } from "@/components/file-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
 AlertCircle,
 Download,
 Copy,
 ArrowLeft,
 File as FileIcon,
 FileText,
 FileImage,
 FileSpreadsheet,
 Info,
 Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { processWithAI, uploadBlob } from "@/lib/document";
import { MAX_FILE_SIZE } from "@/lib/constants";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import {
 Tooltip,
 TooltipContent,
 TooltipProvider,
 TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// For PDF processing
// Using type any for pdfjs since it's dynamically imported
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfjs: any = null;

// Function to determine file type
function getFileType(file: File): string {
 const type = file.type.toLowerCase();

 if (type.startsWith("image/")) return "image";
 if (type.includes("pdf")) return "pdf";
 if (type.includes("wordprocessingml.document")) return "docx";
 if (type.includes("spreadsheetml.sheet")) return "xlsx";

 // Try to determine by extension if MIME type is not specific enough
 const name = file.name.toLowerCase();
 if (name.endsWith(".pdf")) return "pdf";
 if (name.endsWith(".docx")) return "docx";
 if (name.endsWith(".xlsx")) return "xlsx";

 throw new Error(`Unsupported file type: ${file.type}`);
}

// Function to extract text from image using Tesseract.js
async function extractFromImage(file: File): Promise<string> {
 try {
  // Dynamically import Tesseract.js
  const { createWorker } = await import("tesseract.js");

  // Initialize worker
  const worker = await createWorker("eng");

  // Recognize text
  const { data } = await worker.recognize(file);

  // Clean up
  await worker.terminate();

  return data.text;
 } catch (error) {
  console.error("Error extracting text from image:", error);
  throw error;
 }
}

// Function to extract text from PDF
async function extractFromPDF(
 file: File,
 onProgress: (progress: number) => void
): Promise<{ text: string; images: string[] }> {
 try {
  // Dynamically import PDF.js if not already loaded
  if (!pdfjs) {
   const pdfJsModule = await import("pdfjs-dist");
   pdfjs = pdfJsModule;

   // Set worker path
   if (
    typeof window !== "undefined" &&
    !pdfJsModule.GlobalWorkerOptions.workerSrc
   ) {
    pdfJsModule.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
   }
  }

  onProgress(20);

  // Load the PDF file
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument(new Uint8Array(arrayBuffer)).promise;

  onProgress(30);

  // Extract text from each page
  const pageTexts: string[] = [];
  const pageImages: string[] = [];
  const numPages = pdf.numPages;

  for (let i = 1; i <= numPages; i++) {
   const page = await pdf.getPage(i);

   // Extract text
   const content = await page.getTextContent();
   const pageText = content.items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => item.str)
    .join(" ");

   pageTexts.push(pageText);

   // Render page to canvas and upload as image
   const viewport = page.getViewport({ scale: 1.5 });
   const canvas = document.createElement("canvas");
   const context = canvas.getContext("2d");

   if (context) {
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
     canvasContext: context,
     viewport: viewport,
    }).promise;

    // Convert canvas to blob and upload
    try {
     const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
       if (blob) resolve(blob);
       else reject(new Error("Failed to create blob"));
      }, "image/png");
     });

     // Create a File object from the Blob
     // Using window.File to avoid naming conflicts with the File icon from lucide-react
     const pageFile = new window.File([blob], `page-${i}.png`, {
      type: "image/png",
     });

     // Upload to Vercel Blob
     const formData = new FormData();
     formData.append("file", pageFile);
     const uploadResult = await uploadBlob(formData);

     if (uploadResult.success && uploadResult.url) {
      pageImages.push(uploadResult.url);
     }
    } catch (err) {
     console.error(`Error creating image for page ${i}:`, err);
    }
   }

   onProgress(30 + Math.floor((i / numPages) * 30));
  }

  // Check if PDF is likely scanned (very little text extracted)
  // More sophisticated detection of scanned PDFs
  const totalTextLength = pageTexts.join("").trim().length;
  const avgCharsPerPage = totalTextLength / numPages;
  const hasMinimalText = avgCharsPerPage < 100;
  const hasUnstructuredText = pageTexts.some((text) => {
   // Check for lack of paragraph structure (common in OCR'd PDFs)
   const lines = text.split("\n").filter((line) => line.trim().length > 0);
   return lines.length > 3 && lines.every((line) => line.length < 20);
  });

  if (hasMinimalText || hasUnstructuredText) {
   console.log(
    `Detected likely scanned PDF (${avgCharsPerPage.toFixed(
     1
    )} chars/page), applying OCR`
   );
   return await processScannedPDF(pageImages, onProgress);
  }

  return {
   text: pageTexts.join("\n\n"),
   images: pageImages,
  };
 } catch (error) {
  console.error("Error extracting text from PDF:", error);
  throw error;
 }
}

// Function to process scanned PDF with OCR
async function processScannedPDF(
 pageImages: string[],
 onProgress: (progress: number) => void
): Promise<{ text: string; images: string[] }> {
 try {
  // Dynamically import Tesseract.js
  const { createWorker } = await import("tesseract.js");

  onProgress(65);

  // Create worker - using type assertion to handle TypeScript compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const worker = (await createWorker("eng")) as any;

  const pageTexts: string[] = [];
  const maxPagesToProcess = Math.min(pageImages.length, 10); // Limit to first 10 pages

  // Process each page sequentially
  for (let i = 0; i < maxPagesToProcess; i++) {
   console.log(`Running OCR on page ${i + 1}/${maxPagesToProcess}`);

   // Download image from URL
   const response = await fetch(pageImages[i]);
   const blob = await response.blob();

   // Run OCR
   const { data } = await worker.recognize(blob);
   console.log(
    `OCR completed for page ${i + 1}, extracted ${data.text.length} characters`
   );

   pageTexts.push(data.text);
   onProgress(85 + Math.floor(((i + 1) / maxPagesToProcess) * 10));
  }

  // Clean up
  await worker.terminate();

  return {
   text: pageTexts.join("\n\n"),
   images: pageImages,
  };
 } catch (error) {
  console.error("Error processing scanned PDF:", error);
  throw error;
 }
}

// Function to extract text from DOCX
async function extractFromDOCX(file: File): Promise<string> {
 try {
  // Dynamically import mammoth
  const mammoth = await import("mammoth");

  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });

  return result.value;
 } catch (error) {
  console.error("Error extracting text from DOCX:", error);
  throw error;
 }
}

// Function to extract text from XLSX
async function extractFromXLSX(file: File): Promise<string> {
 try {
  // Dynamically import xlsx
  const XLSX = await import("xlsx");

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });

  let result = "";

  // Process each sheet
  workbook.SheetNames.forEach((sheetName) => {
   result += `# ${sheetName}\n\n`;

   const worksheet = workbook.Sheets[sheetName];

   // Get the range of the worksheet
   const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1");
   const maxCol = range.e.c;
   const maxRow = range.e.r;

   // Get merged cells information
   const merges = worksheet["!merges"] || [];

   // Create a 2D array to represent the worksheet
   const grid: string[][] = [];
   for (let r = 0; r <= maxRow; r++) {
    grid[r] = [];
    for (let c = 0; c <= maxCol; c++) {
     const cellAddress = XLSX.utils.encode_cell({ r, c });
     const cell = worksheet[cellAddress];
     grid[r][c] = cell ? XLSX.utils.format_cell(cell) : "";
    }
   }

   // Apply merged cells
   for (const merge of merges) {
    const val = grid[merge.s.r][merge.s.c];
    for (let r = merge.s.r; r <= merge.e.r; r++) {
     for (let c = merge.s.c; c <= merge.e.c; c++) {
      grid[r][c] = val;
     }
    }
   }

   // Detect if this is likely a table with headers
   const hasHeaders = detectTableHeaders(grid);

   // Convert to markdown
   if (grid.length > 0) {
    if (hasHeaders) {
     // Format as markdown table with headers
     const headerRow = grid[0];
     result += "| " + headerRow.join(" | ") + " |\n";
     result += "| " + headerRow.map(() => "---").join(" | ") + " |\n";

     for (let r = 1; r < grid.length; r++) {
      const row = grid[r];
      // Skip empty rows
      if (row.every((cell) => cell === "")) continue;
      result += "| " + row.join(" | ") + " |\n";
     }
    } else {
     // Format as markdown table without special header treatment
     for (let r = 0; r < grid.length; r++) {
      const row = grid[r];
      // Skip empty rows
      if (row.every((cell) => cell === "")) continue;
      if (r === 0) {
       result += "| " + row.join(" | ") + " |\n";
       result += "| " + row.map(() => "---").join(" | ") + " |\n";
      } else {
       result += "| " + row.join(" | ") + " |\n";
      }
     }
    }
   }

   result += "\n\n";
  });

  return result;
 } catch (error) {
  console.error("Error extracting text from XLSX:", error);
  throw error;
 }
}

// Helper function to detect if a grid likely has header rows
function detectTableHeaders(grid: string[][]): boolean {
 if (grid.length < 2) return false;

 const firstRow = grid[0];

 // Check if first row has content in most cells
 const firstRowFilled =
  firstRow.filter((cell) => cell.trim() !== "").length > firstRow.length * 0.5;

 // Check if styling or content suggests headers
 // (This is a simple heuristic - in a real app you might check for bold formatting, etc.)
 const hasDistinctiveFirstRow =
  firstRowFilled &&
  firstRow.some((cell) => cell.toUpperCase() === cell && cell.trim() !== "");

 return hasDistinctiveFirstRow;
}

export default function DocumentExtractorClient() {
 const [isProcessing, setIsProcessing] = useState(false);
 const [progress, setProgress] = useState(0);
 const [error, setError] = useState<string | null>(null);
 const [result, setResult] = useState<string | null>(null);
 const [pageImages, setPageImages] = useState<string[]>([]);
 const [copied, setCopied] = useState(false);
 const [downloading, setDownloading] = useState(false);
 const [fileType, setFileType] = useState<string>("");
 const [fileName, setFileName] = useState<string | null>(null);

 // No form ref needed as we're creating FormData directly

 const handleFileAccepted = async (file: File) => {
  try {
   // Check file size
   if (file.size > MAX_FILE_SIZE) {
    setError(
     `File size exceeds the maximum limit of 3MB. Your file is ${(
      file.size /
      (1024 * 1024)
     ).toFixed(2)}MB.`
    );
    return;
   }

   setIsProcessing(true);
   setProgress(0);
   setError(null);
   setResult(null);
   setPageImages([]);

   // Store file information for UI - Important: Get these values first before using them
   const detectedFileType = getFileType(file);
   const detectedFileName = file.name;

   // Set state values after getting them
   setFileType(detectedFileType);
   setFileName(detectedFileName);

   console.log(
    `Starting document extraction for ${detectedFileName} with type ${detectedFileType}`
   );

   // Process the file based on its type
   setProgress(10);

   // Extract text content from the file
   let extractedText = "";
   let pageImageUrls: string[] = [];

   // First upload the original file to Vercel Blob for reference
   try {
    const formData = new FormData();
    formData.append("file", file);
    const uploadResult = await uploadBlob(formData);

    if (uploadResult.success && uploadResult.url) {
     pageImageUrls.push(uploadResult.url);
    }
   } catch (uploadErr) {
    console.error("Error uploading file to blob storage:", uploadErr);
    // Continue without the original file URL
   }

   // Process based on file type
   try {
    if (detectedFileType === "image") {
     try {
      extractedText = await extractFromImage(file);
     } catch (imageErr) {
      console.error("Error extracting text from image:", imageErr);
      // Continue with empty text, will be handled later
     }
    } else if (detectedFileType === "pdf") {
     try {
      const result = await extractFromPDF(file, (progress) => {
       setProgress(10 + Math.floor(progress * 0.4));
      });
      extractedText = result.text;
      pageImageUrls = [...pageImageUrls, ...result.images];

      // If no text was extracted but we have page images, try OCR as a fallback
      if (
       (!extractedText || extractedText.trim().length === 0) &&
       result.images.length > 0
      ) {
       console.log("No text extracted from PDF, trying OCR as fallback...");
       try {
        const ocrResult = await processScannedPDF(result.images, (progress) => {
         setProgress(50 + Math.floor(progress * 0.3));
        });
        extractedText = ocrResult.text;
       } catch (ocrErr) {
        console.error("OCR processing failed:", ocrErr);
        // Continue with empty text, will be handled later
       }
      }
     } catch (pdfErr) {
      console.error("Error extracting text from PDF:", pdfErr);
      // Try to recover by treating it as a scanned PDF if we have the original file URL
      if (pageImageUrls.length > 0) {
       try {
        console.log("Attempting to recover by treating as scanned document...");
        const ocrResult = await processScannedPDF(pageImageUrls, (progress) => {
         setProgress(50 + Math.floor(progress * 0.3));
        });
        extractedText = ocrResult.text;
       } catch (ocrErr) {
        console.error("OCR recovery failed:", ocrErr);
        // Will be handled in the next section
       }
      }
     }
    } else if (detectedFileType === "docx") {
     try {
      extractedText = await extractFromDOCX(file);
     } catch (docxErr) {
      console.error("Error extracting text from DOCX:", docxErr);
      // Continue with empty text, will be handled later
     }
    } else if (detectedFileType === "xlsx") {
     try {
      extractedText = await extractFromXLSX(file);
     } catch (xlsxErr) {
      console.error("Error extracting text from XLSX:", xlsxErr);
      // Continue with empty text, will be handled later
     }
    }
   } catch (extractionErr) {
    console.error("Error during extraction process:", extractionErr);
    // Continue with whatever we have
   }

   // Filter out non-image URLs
   pageImageUrls = pageImageUrls.filter((path) =>
    /\.(png|jpeg|jpg|gif|webp)$/i.test(path)
   );

   setProgress(80);
   console.log(
    `Extracted ${
     extractedText ? extractedText.length : 0
    } characters, processing with AI...`
   );

   // Now process the extracted text with AI
   if (!extractedText || extractedText.trim().length === 0) {
    if (pageImageUrls.length > 0) {
     // If we have images but no text, we can still show the images
     setPageImages(pageImageUrls);
     setError(
      "No text could be extracted from this document, but images were extracted. You can view them in the Pages tab."
     );
    } else {
     setError(
      "No text or images could be extracted from this document. Please try a different file."
     );
    }
    setIsProcessing(false);
    return;
   }

   // Call the server action to process with AI
   try {
    const aiResult = await processWithAI(
     extractedText,
     pageImageUrls,
     detectedFileType
    );
    setProgress(100);

    if (!aiResult.success) {
     console.error("AI processing failed:", aiResult.error);
     setError(aiResult.error || "Failed to process the extracted content");
     // Still show the markdown if available as fallback
     if (aiResult.markdown) {
      setResult(aiResult.markdown);
      setPageImages(pageImageUrls);
     }
    } else if (!aiResult.markdown || aiResult.markdown.trim().length === 0) {
     console.warn("No content was processed by AI");
     setError(
      "AI processing could not format the extracted content. Showing raw extracted text instead."
     );
     setResult(extractedText);
     setPageImages(pageImageUrls);
    } else {
     console.log(
      `AI processing successful, ${aiResult.markdown.length} characters in formatted markdown`
     );
     setResult(aiResult.markdown);
     setPageImages(pageImageUrls);
    }
   } catch (aiErr) {
    console.error("Error during AI processing:", aiErr);
    setError("Error during AI processing. Showing raw extracted text instead.");
    setResult(extractedText);
    setPageImages(pageImageUrls);
   }
  } catch (err) {
   console.error("Document extraction error:", err);
   setError(
    err instanceof Error
     ? err.message
     : "An unknown error occurred during document extraction"
   );
  } finally {
   setIsProcessing(false);
  }
 };

 const copyToClipboard = () => {
  if (result) {
   navigator.clipboard.writeText(result);
   setCopied(true);
   setTimeout(() => setCopied(false), 2000);
  }
 };

 const downloadMarkdown = () => {
  if (!result) return;

  try {
   setDownloading(true);
   const blob = new Blob([result], { type: "text/markdown" });
   const url = URL.createObjectURL(blob);
   const link = document.createElement("a");
   link.href = url;
   link.download = `document-extraction-${new Date()
    .toISOString()
    .slice(0, 10)}.md`;
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
  <div className="min-h-screen bg-zinc-900 text-zinc-200 flex">
   {/* Sidebar */}
   <Sidebar />

   {/* Main Content */}
   <div className="flex-1 flex flex-col min-h-screen md:ml-64 p-6">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
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
       <FileIcon className="h-5 w-5 mr-2 text-zinc-400" />
       Content Extraction
      </h1>
     </div>
    </div>

    <Card className="mb-6 border-zinc-700">
     <CardHeader>
      <CardTitle>Extract Content from Documents</CardTitle>
      <CardDescription>
       Upload a document to extract and format its content using AI. The
       extracted text will be formatted as markdown.
      </CardDescription>
     </CardHeader>
     <CardContent>
      <div className="space-y-4">
       <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
         <TooltipProvider>
          <Tooltip>
           <TooltipTrigger asChild>
            <div className="flex items-center">
             <Info className="h-4 w-4 text-zinc-400" />
            </div>
           </TooltipTrigger>
           <TooltipContent>
            <p>Supported document types</p>
           </TooltipContent>
          </Tooltip>
         </TooltipProvider>
         <div className="flex gap-2">
          <div className="flex items-center gap-1 text-xs bg-zinc-800 px-2 py-1 rounded">
           <FileText className="h-3 w-3 text-blue-400" /> PDF
          </div>
          <div className="flex items-center gap-1 text-xs bg-zinc-800 px-2 py-1 rounded">
           <FileText className="h-3 w-3 text-green-400" /> DOCX
          </div>
          <div className="flex items-center gap-1 text-xs bg-zinc-800 px-2 py-1 rounded">
           <FileSpreadsheet className="h-3 w-3 text-yellow-400" /> XLSX
          </div>
          <div className="flex items-center gap-1 text-xs bg-zinc-800 px-2 py-1 rounded">
           <FileImage className="h-3 w-3 text-purple-400" /> Images
          </div>
         </div>
        </div>
       </div>

       <FileDropzone
        onFileAccepted={handleFileAccepted}
        acceptedFileTypes={[
         "image/*",
         "application/pdf",
         "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ]}
        maxSize={MAX_FILE_SIZE}
        label="Drop your document here"
        description={`Supports images, PDFs, DOCX, and XLSX files up to ${(
         MAX_FILE_SIZE /
         (1024 * 1024)
        ).toFixed(0)}MB`}
       />
      </div>
     </CardContent>
    </Card>

    {isProcessing && (
     <Card className="mb-6">
      <CardContent className="pt-6">
       <div className="space-y-4">
        {fileName && (
         <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm">
           {fileType === "pdf" && (
            <FileText className="h-4 w-4 text-blue-400" />
           )}
           {fileType === "docx" && (
            <FileText className="h-4 w-4 text-green-400" />
           )}
           {fileType === "xlsx" && (
            <FileSpreadsheet className="h-4 w-4 text-yellow-400" />
           )}
           {fileType === "image" && (
            <FileImage className="h-4 w-4 text-purple-400" />
           )}
           <span className="font-medium">{fileName}</span>
          </div>
         </div>
        )}
        <div className="space-y-2">
         <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>
           {progress < 30
            ? "Extracting text..."
            : progress < 60
            ? "Processing document..."
            : progress < 90
            ? "Formatting with AI..."
            : "Finalizing results..."}
          </span>
          <span>{progress}%</span>
         </div>
         <Progress value={progress} className="h-2" />
         <div className="flex justify-center">
          <Loader2
           className={cn(
            "h-5 w-5 text-zinc-400 animate-spin",
            progress >= 100 ? "opacity-0" : "opacity-100"
           )}
          />
         </div>
        </div>
       </div>
      </CardContent>
     </Card>
    )}

    {error && (
     <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
     </Alert>
    )}

    {result && (
     <Card className="bg-zinc-800 border-zinc-700">
      <CardHeader>
       <div className="flex justify-between items-center">
        <CardTitle>Extracted Content</CardTitle>
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
      </CardHeader>
      <CardContent>
       <Tabs defaultValue="preview">
        <TabsList className="grid w-full grid-cols-3">
         <TabsTrigger value="preview">Preview</TabsTrigger>
         <TabsTrigger value="markdown">Markdown</TabsTrigger>
         {pageImages.length > 0 && (
          <TabsTrigger value="pages">Pages ({pageImages.length})</TabsTrigger>
         )}
        </TabsList>

        <TabsContent value="preview" className="mt-4">
         <div className="p-4 border border-zinc-700 rounded-md bg-card prose max-w-none dark:prose-invert overflow-auto">
          {result && (
           <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
          )}
         </div>
        </TabsContent>

        <TabsContent value="markdown" className="mt-4">
         <pre className="p-4 border border-zinc-700 rounded-md bg-muted overflow-auto whitespace-pre-wrap">
          <code>{result || ""}</code>
         </pre>
        </TabsContent>

        {pageImages.length > 0 && (
         <TabsContent value="pages" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {pageImages.map((url, index) => (
            <div key={index} className="border rounded-md p-2 bg-card">
             <p className="text-xs text-muted-foreground mb-2">
              Page {index + 1}
             </p>
             <div className="relative w-full h-[400px]">
              <Image
               src={url}
               alt={`Page ${index + 1}`}
               fill
               sizes="(max-width: 768px) 100vw, 50vw"
               className="object-contain rounded border border-muted"
              />
             </div>
            </div>
           ))}
          </div>
         </TabsContent>
        )}
       </Tabs>
      </CardContent>
     </Card>
    )}
    <Card className="bg-zinc-800 border-zinc-700">
     <CardHeader>
      <CardTitle className="text-lg font-medium">
       About Content Extraction
      </CardTitle>
     </CardHeader>
     <CardContent>
      <div className="space-y-4 text-sm text-zinc-400">
       <p>
        This tool uses advanced algorithms to extract and format content from
        documents, providing comprehensive insights while ensuring your privacy.
       </p>
       <p>
        For best results, upload clear, high-resolution images. The tool works
        with PDFs, DOCX, and XLSX formats and can extract EXIF data, detect
        AI-generated content, analyze color composition, and more. The extracted
        content is formatted as markdown, making it easy to use in designs,
        presentations, e-commerce listings, and more.
       </p>
       <p>
        The tool is designed to be easy to use, with a user-friendly interface
        that requires minimal training. Additionally, all uploads are
        automatically deleted after 3 hours to protect your privacy.
       </p>
      </div>
     </CardContent>
    </Card>
   </div>
  </div>
 );
}
