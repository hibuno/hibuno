import React from "react";
import type { OutputType, CompressionOptions } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface CompressionOptionsProps {
 options: CompressionOptions;
 outputType: OutputType;
 onOptionsChange: (options: CompressionOptions) => void;
 onOutputTypeChange: (type: OutputType) => void;
}

export function CompressionOptions({
 options,
 outputType,
 onOptionsChange,
 onOutputTypeChange,
}: CompressionOptionsProps) {
 return (
  <div className="space-y-6">
   <div>
    <label className="block text-sm font-medium text-zinc-300 mb-2">
     Output Format
    </label>
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
     {(["avif", "jpeg", "jxl", "png", "webp"] as const).map((format) => (
      <Button
       key={format}
       variant={outputType === format ? "default" : "outline"}
       className={`px-3 py-1 text-xs font-medium uppercase ${
        outputType === format
         ? "bg-indigo-600 hover:bg-indigo-700 text-white"
         : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700"
       }`}
       onClick={() => onOutputTypeChange(format)}
      >
       {format}
      </Button>
     ))}
    </div>
   </div>

   {outputType !== "png" && (
    <div>
     <div className="flex justify-between items-center mb-2">
      <label className="block text-sm font-medium text-zinc-300">Quality</label>
      <span className="text-sm text-indigo-400 font-medium">
       {options.quality}%
      </span>
     </div>
     <input
      type="range"
      min="1"
      max="100"
      value={options.quality}
      onChange={(e) => onOptionsChange({ quality: Number(e.target.value) })}
      className="w-full accent-indigo-500 bg-zinc-700 h-2 rounded-lg appearance-none cursor-pointer"
     />
     <div className="flex justify-between text-xs text-zinc-500 mt-1">
      <span>Smaller file</span>
      <span>Better quality</span>
     </div>
    </div>
   )}
  </div>
 );
}
