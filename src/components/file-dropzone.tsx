"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, AlertCircle, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileDropzoneProps {
 onFileAccepted: (file: File) => void;
 onFilesAccepted?: (files: File[]) => void;
 acceptedFileTypes?: string[];
 maxSize?: number;
 label?: string;
 description?: string;
 multiple?: boolean;
}

export function FileDropzone({
 onFileAccepted,
 onFilesAccepted,
 acceptedFileTypes = ["image/*", "application/pdf", "text/plain"],
 maxSize = 1024 * 1024, // 1MB default
 label = "Drop your file here",
 description = "or click to browse",
 multiple = false,
}: FileDropzoneProps) {
 const [error, setError] = useState<string | null>(null);
 const [files, setFiles] = useState<File[]>([]);

 const onDrop = useCallback(
  (acceptedFiles: File[]) => {
   setError(null);
   if (acceptedFiles.length > 0) {
    // If we're handling multiple files
    if (multiple && onFilesAccepted) {
     setFiles(acceptedFiles);
     onFilesAccepted(acceptedFiles);
    } else {
     // Backward compatibility for single file handling
     const selectedFile = acceptedFiles[0];
     setFiles([selectedFile]);
     onFileAccepted(selectedFile);
    }
   }
  },
  [onFileAccepted, onFilesAccepted, multiple]
 );

 const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop,
  accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
  maxSize,
  multiple,
  onDropRejected: (fileRejections) => {
   const rejection = fileRejections[0];
   if (rejection.errors[0].code === "file-too-large") {
    setError(`File is too large. Max size is ${maxSize / 1024 / 1024}MB.`);
   } else if (rejection.errors[0].code === "file-invalid-type") {
    setError("Invalid file type. Please upload a supported file.");
   } else {
    setError(rejection.errors[0].message);
   }
  },
 });

 const removeFile = (fileToRemove?: File) => {
  if (fileToRemove) {
   setFiles(files.filter((file) => file !== fileToRemove));
  } else {
   setFiles([]);
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

   {files.length === 0 ? (
    <div
     {...getRootProps()}
     className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
      isDragActive
       ? "border-violet-500 bg-violet-500/10"
       : "border-zinc-700 bg-zinc-800/50 hover:border-violet-500/50 hover:bg-violet-500/5"
     }`}
    >
     <input {...getInputProps()} />
     <Upload className="h-10 w-10 mx-auto mb-4 text-zinc-400" />
     <p className="text-lg font-medium text-zinc-300">{label}</p>
     <p className="text-sm text-zinc-500 mt-1">{description}</p>
     <p className="text-xs text-zinc-500 mt-4">
      Max file size: {maxSize / 1024 / 1024}MB
     </p>
    </div>
   ) : (
    <div className="border rounded-lg p-4 bg-zinc-800/50 border-zinc-700">
     <div className="flex justify-between items-center mb-2">
      <p className="text-sm font-medium text-zinc-300">
       {files.length} {files.length === 1 ? "file" : "files"} selected
      </p>
      <Button
       variant="ghost"
       size="sm"
       className="text-zinc-400 hover:text-white hover:bg-red-500/10"
       onClick={() => removeFile()}
      >
       Clear All
      </Button>
     </div>

     <div className="space-y-2 max-h-48 overflow-y-auto">
      {files.map((file, index) => (
       <div
        key={index}
        className="flex items-center justify-between bg-zinc-800 rounded p-2"
       >
        <div className="flex items-center">
         <div className="p-2 rounded-md bg-violet-500/20 mr-3">
          <FileIcon className="h-4 w-4 text-violet-400" />
         </div>
         <div>
          <p className="text-sm font-medium text-zinc-300 truncate max-w-[200px]">
           {file.name}
          </p>
          <p className="text-xs text-zinc-500">
           {(file.size / 1024).toFixed(1)} KB
          </p>
         </div>
        </div>
        <Button
         variant="ghost"
         size="icon"
         className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-red-500/10"
         onClick={() => removeFile(file)}
        >
         <X className="h-4 w-4" />
        </Button>
       </div>
      ))}
     </div>

     {multiple && (
      <div
       {...getRootProps()}
       className="mt-2 border border-dashed rounded-lg p-2 text-center cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5"
      >
       <input {...getInputProps()} />
       <p className="text-xs text-zinc-500">
        Drop more files or click to browse
       </p>
      </div>
     )}
    </div>
   )}
  </div>
 );
}
