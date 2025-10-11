"use client";

import {
 Calculator,
 Plus,
 Minus,
 Divide,
 Equal,
 // Star,
 ChevronRight,
 ChevronLeft,
 // ArrowRight,
 // ArrowLeft,
 // Square,
 // ChevronsLeft,
 // ChevronsRight,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import katex from "katex";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface ToolbarLaTeXDialogProps {
 open: boolean;
 onClose: () => void;
 onInsert: (latex: string, inline?: boolean) => void;
 initialData?: {
  latex?: string;
  inline?: boolean;
 };
}

export default function ToolbarLaTeXDialog({
 open,
 onClose,
 onInsert,
 initialData,
}: ToolbarLaTeXDialogProps) {
 const [latex, setLatex] = useState(initialData?.latex || "");
 const [inline, setInline] = useState(initialData?.inline || false);

 const handleInsert = () => {
  if (latex.trim()) {
   onInsert(latex.trim(), inline);
   setLatex("");
   setInline(false);
   onClose();
  }
 };

 const handleClose = () => {
  setLatex("");
  setInline(false);
  onClose();
 };

 const insertSymbol = (symbol: string) => {
  const input = document.getElementById("latex-input") as HTMLInputElement;
  if (input) {
   const start = input.selectionStart || 0;
   const end = input.selectionEnd || 0;
   const newLatex = latex.substring(0, start) + symbol + latex.substring(end);
   setLatex(newLatex);

   // Focus back to input and set cursor position
   setTimeout(() => {
    input.focus();
    input.setSelectionRange(start + symbol.length, start + symbol.length);
   }, 0);
  } else {
   setLatex(latex + symbol);
  }
 };

 const insertTemplate = (template: string) => {
  const input = document.getElementById("latex-input") as HTMLInputElement;
  if (input) {
   const start = input.selectionStart || 0;
   const end = input.selectionEnd || 0;
   const newLatex = latex.substring(0, start) + template + latex.substring(end);
   setLatex(newLatex);

   // Focus back to input
   setTimeout(() => {
    input.focus();
   }, 0);
  } else {
   setLatex(latex + template);
  }
 };

 const latexSymbols = [
  { symbol: "+", label: "Plus", icon: Plus },
  { symbol: "-", label: "Minus", icon: Minus },
  { symbol: "\\times", label: "Multiply" },
  { symbol: "\\div", label: "Divide", icon: Divide },
  { symbol: "=", label: "Equal", icon: Equal },
  { symbol: "\\pm", label: "Plus/Minus" },
  { symbol: "\\neq", label: "Not Equal" },
  { symbol: "<", label: "Less Than", icon: ChevronLeft },
  { symbol: ">", label: "Greater Than", icon: ChevronRight },
  { symbol: "\\leq", label: "Less Equal" },
  { symbol: "\\geq", label: "Greater Equal" },
  { symbol: "\\infty", label: "Infinity" },
 ];

 const latexStructures = [
  { template: "\\frac{}{}", label: "Fraction" },
  { template: "{}^{}", label: "Superscript" },
  { template: "_{}", label: "Subscript" },
  { template: "\\sqrt{}", label: "Square Root" },
  { template: "\\sum_{}^{}", label: "Summation" },
  { template: "\\int_{}^{}", label: "Integral" },
  { template: "\\alpha", label: "Alpha (α)" },
  { template: "\\beta", label: "Beta (β)" },
  { template: "\\gamma", label: "Gamma (γ)" },
  { template: "\\delta", label: "Delta (δ)" },
  { template: "\\theta", label: "Theta (θ)" },
  { template: "\\pi", label: "Pi (π)" },
 ];

 return (
  <Dialog open={open} onOpenChange={handleClose}>
   <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
    <DialogHeader>
     <DialogTitle className="flex items-center gap-2">
      <Calculator size={20} />
      Insert Math Formula
     </DialogTitle>
     <DialogDescription>
      Enter a LaTeX formula. Use standard LaTeX syntax like \\frac{"{a}"}
      {"{b}"} or x^2.
     </DialogDescription>
    </DialogHeader>

    <div className="space-y-4">
     <div className="space-y-2">
      <Label htmlFor="latex-input">LaTeX Formula</Label>
      <Input
       id="latex-input"
       value={latex}
       onChange={(e) => setLatex(e.target.value)}
       placeholder="E = mc^2&#10;&#10;Or for multiline:&#10;a = b + c&#10;x = y^2 + z"
       className="font-mono"
      />
     </div>

     <div className="flex items-center space-x-2">
      <input
       type="checkbox"
       id="inline-checkbox"
       checked={inline}
       onChange={(e) => setInline(e.target.checked)}
       className="rounded"
      />
      <Label htmlFor="inline-checkbox" className="text-sm">
       Inline formula (within text)
      </Label>
     </div>

     {/* LaTeX Toolbar */}
     <div className="space-y-3">
      <Label className="text-sm font-medium">Quick Symbols</Label>
      <div className="flex flex-wrap gap-1">
       {latexSymbols.map((item) => {
        const IconComponent = item.icon;
        return (
         <button
          key={item.symbol}
          onClick={() => insertSymbol(item.symbol)}
          className="p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          title={item.label}
         >
          {IconComponent ? <IconComponent size={14} /> : item.symbol}
         </button>
        );
       })}
      </div>
     </div>

     <div className="space-y-3">
      <Label className="text-sm font-medium">Common Structures</Label>
      <div className="flex flex-wrap gap-1">
       {latexStructures.map((item) => (
        <button
         key={item.template}
         onClick={() => insertTemplate(item.template)}
         className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors"
         title={item.label}
        >
         {item.label}
        </button>
       ))}
      </div>
     </div>

     {latex && (
      <div className="space-y-2">
       <Label>Preview:</Label>
       <div
        className={`p-4 bg-gray-50 rounded border ${
         !inline ? "min-h-[80px]" : "min-h-[60px]"
        } flex ${inline ? "items-center" : "items-start"} justify-center`}
       >
        <span
         className="math-latex-preview w-full"
         dangerouslySetInnerHTML={{
          __html: (() => {
           try {
            return katex.renderToString(latex, {
             displayMode: !inline,
             throwOnError: false,
             errorColor: "#cc0000",
             strict: "warn" as const,
            });
           } catch (err) {
            // For multiline, show each line separately if it fails
            const lines = latex.split("\n").filter((line) => line.trim());
            if (lines.length > 1 && !inline) {
             return lines
              .map((line) => {
               try {
                return katex.renderToString(line, {
                 displayMode: true,
                 throwOnError: false,
                 errorColor: "#cc0000",
                 strict: "warn" as const,
                });
               } catch {
                return `<div class="text-red-500">$${line}$</div>`;
               }
              })
              .join("<br>");
            }

            return `<span class="text-red-500">${
             inline ? `$${latex}$` : `$$${latex}$$`
            }</span>`;
           }
          })() as string,
         }}
        />
       </div>
      </div>
     )}
    </div>

    <DialogFooter>
     <Button variant="outline" onClick={handleClose}>
      Cancel
     </Button>
     <Button onClick={handleInsert} disabled={!latex.trim()}>
      Insert Formula
     </Button>
    </DialogFooter>
   </DialogContent>
  </Dialog>
 );
}
