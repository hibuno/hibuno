"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ColorPaletteProps {
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 colorInfo: any;
}

export function ColorPalette({ colorInfo }: ColorPaletteProps) {
 const { toast } = useToast();
 const [copiedColor, setCopiedColor] = useState<string | null>(null);

 if (!colorInfo) {
  return (
   <div className="p-6 text-center">
    <p className="text-muted-foreground">No color information available</p>
   </div>
  );
 }

 const copyToClipboard = (hex: string) => {
  navigator.clipboard.writeText(hex);
  setCopiedColor(hex);

  toast({
   title: "Color copied",
   description: `${hex} has been copied to clipboard`,
  });

  setTimeout(() => setCopiedColor(null), 2000);
 };

 const renderColorSwatch = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  color: any,
  label: string,
  size: "sm" | "md" | "lg" = "md"
 ) => {
  if (!color) return null;

  const hex = color.hex;
  const sizeClasses = {
   sm: "h-8 w-8",
   md: "h-12 w-12",
   lg: "h-16 w-16",
  };

  return (
   <div key={hex} className="flex flex-col items-center">
    <button
     className={`${sizeClasses[size]} rounded-md border-2 border-black relative group cursor-pointer`}
     style={{ backgroundColor: hex }}
     onClick={() => copyToClipboard(hex)}
     title={`Copy ${hex}`}
    >
     {copiedColor === hex ? (
      <div className="absolute inset-0 flex items-center justify-center rounded-md">
       <Check className="text-white h-4 w-4" />
      </div>
     ) : (
      <div className="absolute inset-0 flex items-center justify-center group-hover:bg-opacity-20 rounded-md transition-all">
       <Copy className="text-white opacity-0 group-hover:opacity-100 h-4 w-4" />
      </div>
     )}
    </button>
    <span className="text-xs mt-1">{label}</span>
    <span className="text-xs font-mono">{hex}</span>
   </div>
  );
 };

 return (
  <div className="space-y-6">
   <div>
    <h3 className="text-lg font-bold mb-4">Dominant Color</h3>
    <div className="flex justify-center">
     {renderColorSwatch(colorInfo.dominant, "Dominant", "lg")}
    </div>
   </div>

   {colorInfo.accent && colorInfo.accent.length > 0 && (
    <div>
     <h3 className="text-lg font-bold mb-4">Accent Colors</h3>
     <div className="flex justify-center gap-4">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {colorInfo.accent.map((color: any, index: number) =>
       renderColorSwatch(color, `Accent ${index + 1}`, "md")
      )}
     </div>
    </div>
   )}

   {colorInfo.other && colorInfo.other.length > 0 && (
    <div>
     <h3 className="text-lg font-bold mb-4">Other Colors</h3>
     <div className="flex flex-wrap justify-center gap-4">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {colorInfo.other.map((color: any, index: number) =>
       renderColorSwatch(color, `Color ${index + 1}`, "sm")
      )}
     </div>
    </div>
   )}

   <div className="text-center text-sm text-muted-foreground mt-4">
    <p>Click on any color to copy its hex code to clipboard</p>
   </div>
  </div>
 );
}
