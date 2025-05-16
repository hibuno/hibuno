"use client";

import { useState } from "react";
import {
 Camera,
 ImageIcon,
 MapPin,
 Calendar,
 Sparkles,
 Info,
 Palette,
 Sliders,
 Aperture,
 Zap,
 Layers,
} from "lucide-react";
import { ColorPalette } from "./color-palette";

interface ResultsDisplayProps {
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 analysis: any; // In a real app, you would define a proper type
}

export function ResultsDisplay({ analysis }: ResultsDisplayProps) {
 const [activeTab, setActiveTab] = useState("summary");

 // Ensure we have valid data or provide defaults
 const safeAnalysis = {
  ...analysis,
  exifData: analysis.exifData || {
   camera: { make: "Unknown", model: "Unknown", software: "Unknown" },
   image: { width: 0, height: 0, orientation: 1, colorSpace: "Unknown" },
   exif: {
    exposureTime: "Unknown",
    fNumber: 0,
    iso: 0,
    focalLength: "Unknown",
    flash: "Unknown",
    dateTimeOriginal: new Date().toISOString(),
    shutterSpeedValue: 0,
    apertureValue: 0,
    brightnessValue: 0,
    exposureCompensation: 0,
    maxApertureValue: 0,
    subjectDistance: 0,
    focalLengthIn35mmFormat: 0,
    componentConfiguration: null,
    exifVersion: "Unknown",
    flashpixVersion: "Unknown",
    colorSpace: 0,
    sensingMethod: "Unknown",
    sceneType: "Unknown",
    customRendered: "Unknown",
   },
   gps: {
    latitude: null,
    longitude: null,
    altitude: null,
    latitudeRef: null,
    longitudeRef: null,
    altitudeRef: null,
    timeStamp: null,
    dateStamp: null,
    processingMethod: null,
    versionID: null,
    DOP: null,
   },
   advanced: {
    lensModel: "Unknown",
    lensInfo: "Unknown",
    meteringMode: "Unknown",
    whiteBalance: "Unknown",
    exposureProgram: "Unknown",
    exposureMode: "Unknown",
    sceneCaptureType: "Unknown",
    digitalZoomRatio: 0,
    contrast: "Unknown",
    saturation: "Unknown",
    sharpness: "Unknown",
    subjectDistance: "Unknown",
   },
   // Additional data sections
   thumbnail: null,
   icc: null,
   xmp: null,
   iptc: null,
   jfif: null,
   ihdr: null,
   makerNote: null,
   userComment: null,
   rawExif: null, // Store the complete raw exif data
  },
  aiDetection: analysis.aiDetection || {
   isAiGenerated: false,
   confidence: 0,
   details: {
    modelPrediction: "Unknown",
    patternAnalysis: "Unknown",
    inconsistencies: [],
   },
  },
  colorInfo: analysis.colorInfo || null,
  imageProperties: analysis.imageProperties || null,
 };

 const tabs = [
  { id: "summary", label: "Summary" },
  { id: "camera", label: "Camera" },
  { id: "exif", label: "EXIF Data" },
  { id: "advanced", label: "Advanced" },
  { id: "icc", label: "ICC Profile", hidden: !safeAnalysis.exifData.icc },
  { id: "xmp", label: "XMP", hidden: !safeAnalysis.exifData.xmp },
  { id: "iptc", label: "IPTC", hidden: !safeAnalysis.exifData.iptc },
  { id: "jfif", label: "JFIF", hidden: !safeAnalysis.exifData.jfif },
  { id: "ai", label: "AI Analysis" },
  { id: "colors", label: "Colors", hidden: !safeAnalysis.colorInfo },
 ].filter((tab) => !tab.hidden);

 return (
  <div className="space-y-6">
   <div className="bg-zinc-800 border-zinc-700 rounded-md overflow-hidden">
    <div className="border-b border-zinc-700">
     <div className="flex overflow-x-auto">
      {tabs.map((tab) => (
       <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`py-3 px-6 font-medium text-sm whitespace-nowrap ${
         activeTab === tab.id
          ? "bg-background text-muted-foreground"
          : "text-zinc-400 hover:bg-zinc-700 hover:text-muted-foreground"
        } ${
         tab.id !== tabs[tabs.length - 1].id ? "border-r border-zinc-700" : ""
        }`}
       >
        {tab.label}
       </button>
      ))}
     </div>
    </div>

    <div className="p-6 animate-fade-in bg-zinc-800">
     {activeTab === "summary" && (
      <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-md bg-zinc-700 overflow-hidden border border-zinc-600">
         <div className="p-4 border-b border-zinc-600">
          <h3 className="text-lg font-bold flex items-center">
           <Camera className="h-5 w-5 mr-2" />
           Camera Information
          </h3>
         </div>
         <div className="p-4">
          <div className="space-y-4">
           <div className="flex justify-between items-center">
            <span className="font-medium">Make</span>
            <span className="font-bold">
             {safeAnalysis.exifData.camera.make}
            </span>
           </div>
           <div className="flex justify-between items-center">
            <span className="font-medium">Model</span>
            <span className="font-bold">
             {safeAnalysis.exifData.camera.model}
            </span>
           </div>
           {safeAnalysis.exifData.advanced?.lensModel !== "Unknown" && (
            <div className="flex justify-between items-center">
             <span className="font-medium">Lens</span>
             <span className="font-bold">
              {safeAnalysis.exifData.advanced.lensModel}
             </span>
            </div>
           )}
           <div className="flex justify-between items-center">
            <span className="font-medium">Software</span>
            <span className="font-bold">
             {safeAnalysis.exifData.camera.software}
            </span>
           </div>
          </div>
         </div>
        </div>

        <div className="exifee-card bg-[hsl(var(--purple))]">
         <div className="p-4">
          <h3 className="text-lg font-bold flex items-center">
           <Calendar className="h-5 w-5 mr-2" />
           Capture Settings
          </h3>
         </div>
         <div className="p-4">
          <div className="space-y-4">
           <div className="flex justify-between items-center">
            <span className="font-medium">Date Taken</span>
            <span className="font-bold">
             {new Date(
              safeAnalysis.exifData.exif.dateTimeOriginal
             ).toLocaleDateString()}
            </span>
           </div>
           <div className="flex justify-between items-center">
            <span className="font-medium">Exposure</span>
            <span className="font-bold">
             {safeAnalysis.exifData.exif.exposureTime} sec
            </span>
           </div>
           <div className="flex justify-between items-center">
            <span className="font-medium">Aperture</span>
            <span className="font-bold">
             f/{safeAnalysis.exifData.exif.fNumber}
            </span>
           </div>
           <div className="flex justify-between items-center">
            <span className="font-medium">ISO</span>
            <span className="font-bold">{safeAnalysis.exifData.exif.iso}</span>
           </div>
          </div>
         </div>
        </div>
       </div>

       {safeAnalysis.imageProperties && (
        <div className="exifee-card bg-[hsl(var(--mint))]">
         <div className="p-4">
          <h3 className="text-lg font-bold flex items-center">
           <Sliders className="h-5 w-5 mr-2" />
           Image Properties
          </h3>
         </div>
         <div className="p-4">
          <div className="grid grid-cols-3 gap-4">
           <div className="bg-background rounded-lg p-4">
            <div className="text-center">
             <div className="text-lg font-bold">
              {(safeAnalysis.imageProperties.sharpness * 100).toFixed(0)}%
             </div>
             <div className="text-sm">Sharpness</div>
            </div>
           </div>
           <div className="bg-background rounded-lg p-4">
            <div className="text-center">
             <div className="text-lg font-bold">
              {(safeAnalysis.imageProperties.brightness * 100).toFixed(0)}%
             </div>
             <div className="text-sm">Brightness</div>
            </div>
           </div>
           <div className="bg-background rounded-lg p-4">
            <div className="text-center">
             <div className="text-lg font-bold">
              {(safeAnalysis.imageProperties.contrast * 100).toFixed(0)}%
             </div>
             <div className="text-sm">Contrast</div>
            </div>
           </div>
          </div>
         </div>
        </div>
       )}

       <div className="exifee-card bg-[hsl(var(--teal))]">
        <div className="p-4">
         <h3 className="text-lg font-bold flex items-center">
          <Info className="h-5 w-5 mr-2" />
          Key Findings
         </h3>
        </div>
        <div className="p-4">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-800 rounded-md p-4 border border-zinc-700">
           <div className="flex items-center mb-2">
            <div className="rounded-full bg-violet-900/50 p-2 mr-3">
             <Camera className="h-5 w-5 text-violet-400" />
            </div>
            <h4 className="font-medium text-zinc-200">Camera</h4>
           </div>
           <p className="text-zinc-300">{safeAnalysis.exifData.camera.model}</p>
          </div>

          <div className="bg-zinc-800 rounded-md p-4 border border-zinc-700">
           <div className="flex items-center mb-2">
            <div className="rounded-full bg-violet-900/50 p-2 mr-3">
             <Calendar className="h-5 w-5 text-violet-400" />
            </div>
            <h4 className="font-medium text-zinc-200">Date Taken</h4>
           </div>
           <p className="text-zinc-300">
            {new Date(
             safeAnalysis.exifData.exif.dateTimeOriginal
            ).toLocaleDateString()}
           </p>
          </div>

          <div className="bg-zinc-800 rounded-md p-4 border border-zinc-700">
           <div className="flex items-center mb-2">
            <div className="rounded-full bg-violet-900/50 p-2 mr-3">
             <Sparkles className="h-5 w-5 text-violet-400" />
            </div>
            <h4 className="font-medium text-zinc-200">AI Detection</h4>
           </div>
           <p className="text-zinc-300">
            {safeAnalysis.aiDetection.isAiGenerated ? (
             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-200">
              AI Generated
             </span>
            ) : (
             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
              Human Created
             </span>
            )}
           </p>
          </div>
         </div>
        </div>
       </div>

       {safeAnalysis.colorInfo && safeAnalysis.colorInfo.dominant && (
        <div className="rounded-md bg-zinc-700 overflow-hidden border border-zinc-600">
         <div className="p-4 border-b border-zinc-600">
          <h3 className="text-lg font-medium flex items-center">
           <Palette className="h-5 w-5 mr-2 text-zinc-400" />
           Color Palette
          </h3>
         </div>
         <div className="p-4">
          <div className="flex flex-wrap justify-center gap-4">
           <div
            className="h-12 w-12 rounded-md border shadow-md"
            style={{ backgroundColor: safeAnalysis.colorInfo.dominant.hex }}
            title={safeAnalysis.colorInfo.dominant.hex}
           ></div>
           {safeAnalysis.colorInfo.accent &&
            //  eslint-disable-next-line @typescript-eslint/no-explicit-any
            safeAnalysis.colorInfo.accent.map((color: any, index: number) => (
             <div
              key={`accent-${index}`}
              className="h-10 w-10 rounded-md border shadow-md"
              style={{ backgroundColor: color.hex }}
              title={color.hex}
             ></div>
            ))}
           {safeAnalysis.colorInfo.other &&
            safeAnalysis.colorInfo.other
             .slice(0, 3)
             //  eslint-disable-next-line @typescript-eslint/no-explicit-any
             .map((color: any, index: number) => (
              <div
               key={`other-${index}`}
               className="h-8 w-8 rounded-md border shadow-md"
               style={{ backgroundColor: color.hex }}
               title={color.hex}
              ></div>
             ))}
          </div>
          <div className="text-center mt-4">
           <button
            onClick={() => setActiveTab("colors")}
            className="text-sm font-medium underline"
           >
            View full color palette
           </button>
          </div>
         </div>
        </div>
       )}
      </div>
     )}

     {activeTab === "camera" && (
      <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="exifee-card bg-[hsl(var(--orange))]">
         <div className="p-4">
          <h3 className="text-lg font-bold flex items-center">
           <Camera className="h-5 w-5 mr-2" />
           Camera Details
          </h3>
         </div>
         <div className="p-4">
          <div className="space-y-4">
           <div className="flex justify-between items-center">
            <span className="font-medium">Make</span>
            <span className="font-bold">
             {safeAnalysis.exifData.camera.make}
            </span>
           </div>
           <div className="flex justify-between items-center">
            <span className="font-medium">Model</span>
            <span className="font-bold">
             {safeAnalysis.exifData.camera.model}
            </span>
           </div>
           <div className="flex justify-between items-center">
            <span className="font-medium">Software</span>
            <span className="font-bold">
             {safeAnalysis.exifData.camera.software}
            </span>
           </div>
           {safeAnalysis.exifData.advanced?.lensModel !== "Unknown" && (
            <div className="flex justify-between items-center">
             <span className="font-medium">Lens Model</span>
             <span className="font-bold">
              {safeAnalysis.exifData.advanced.lensModel}
             </span>
            </div>
           )}
           {safeAnalysis.exifData.advanced?.lensInfo !== "Unknown" && (
            <div className="flex justify-between items-center">
             <span className="font-medium">Lens Info</span>
             <span className="font-bold">
              {safeAnalysis.exifData.advanced.lensInfo}
             </span>
            </div>
           )}
          </div>
         </div>
        </div>

        <div className="rounded-md bg-zinc-700 overflow-hidden border border-zinc-600">
         <div className="p-4 border-b border-zinc-600">
          <h3 className="text-lg font-bold flex items-center">
           <ImageIcon className="h-5 w-5 mr-2" />
           Image Details
          </h3>
         </div>
         <div className="p-4">
          <div className="space-y-4">
           <div className="flex justify-between items-center">
            <span className="font-medium">Dimensions</span>
            <span className="font-bold">
             {safeAnalysis.exifData.image.width} ×{" "}
             {safeAnalysis.exifData.image.height}
            </span>
           </div>
           <div className="flex justify-between items-center">
            <span className="font-medium">Orientation</span>
            <span className="font-bold">
             {safeAnalysis.exifData.image.orientation}
            </span>
           </div>
           <div className="flex justify-between items-center">
            <span className="font-medium">Color Space</span>
            <span className="font-bold">
             {safeAnalysis.exifData.image.colorSpace}
            </span>
           </div>
           <div className="flex justify-between items-center">
            <span className="font-medium">Has Thumbnail</span>
            <span className="font-bold">
             {safeAnalysis.exifData.image.hasThumbnail ? "Yes" : "No"}
            </span>
           </div>
          </div>
         </div>
        </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="exifee-card bg-[hsl(var(--purple))]">
         <div className="p-4">
          <h3 className="text-lg font-bold flex items-center">
           <Calendar className="h-5 w-5 mr-2" />
           Capture Settings
          </h3>
         </div>
         <div className="p-4">
          <div className="space-y-4">
           <div className="flex justify-between items-center">
            <span className="font-medium">Exposure Time</span>
            <span className="font-bold">
             {safeAnalysis.exifData.exif.exposureTime} sec
            </span>
           </div>
           <div className="flex justify-between items-center">
            <span className="font-medium">Aperture</span>
            <span className="font-bold">
             f/{safeAnalysis.exifData.exif.fNumber}
            </span>
           </div>
           <div className="flex justify-between items-center">
            <span className="font-medium">ISO</span>
            <span className="font-bold">{safeAnalysis.exifData.exif.iso}</span>
           </div>
           <div className="flex justify-between items-center">
            <span className="font-medium">Focal Length</span>
            <span className="font-bold">
             {safeAnalysis.exifData.exif.focalLength}
            </span>
           </div>
           <div className="flex justify-between items-center">
            <span className="font-medium">Flash</span>
            <span className="font-bold">
             {safeAnalysis.exifData.exif.flash}
            </span>
           </div>
          </div>
         </div>
        </div>

        <div className="exifee-card bg-[hsl(var(--mint))]">
         <div className="p-4">
          <h3 className="text-lg font-bold flex items-center">
           <MapPin className="h-5 w-5 mr-2" />
           Location Data
          </h3>
         </div>
         <div className="p-4">
          {safeAnalysis.exifData.gps.latitude ? (
           <div className="space-y-4">
            <div className="flex justify-between items-center">
             <span className="font-medium">Latitude</span>
             <span className="font-bold">
              {safeAnalysis.exifData.gps.latitude}
             </span>
            </div>
            <div className="flex justify-between items-center">
             <span className="font-medium">Longitude</span>
             <span className="font-bold">
              {safeAnalysis.exifData.gps.longitude}
             </span>
            </div>
            <div className="flex justify-between items-center">
             <span className="font-medium">Altitude</span>
             <span className="font-bold">
              {safeAnalysis.exifData.gps.altitude
               ? `${safeAnalysis.exifData.gps.altitude}m`
               : "N/A"}
             </span>
            </div>
           </div>
          ) : (
           <div className="flex items-center justify-center h-32 font-medium">
            No location data available
           </div>
          )}
         </div>
        </div>
       </div>

       {safeAnalysis.imageProperties && (
        <div className="exifee-card bg-[hsl(var(--coral))]">
         <div className="p-4">
          <h3 className="text-lg font-bold flex items-center">
           <Sliders className="h-5 w-5 mr-2" />
           Image Properties
          </h3>
         </div>
         <div className="p-4">
          <div className="space-y-4">
           <div className="flex justify-between items-center">
            <span className="font-medium">Sharpness</span>
            <div className="w-1/2 bg-gray-200 rounded-full h-4 border border-black overflow-hidden">
             <div
              className="bg-[hsl(var(--teal))] h-full"
              style={{
               width: `${safeAnalysis.imageProperties.sharpness * 100}%`,
              }}
             ></div>
            </div>
            <span className="font-bold">
             {(safeAnalysis.imageProperties.sharpness * 100).toFixed(0)}%
            </span>
           </div>
           <div className="flex justify-between items-center">
            <span className="font-medium">Brightness</span>
            <div className="w-1/2 bg-gray-200 rounded-full h-4 border border-black overflow-hidden">
             <div
              className="bg-[hsl(var(--orange))] h-full"
              style={{
               width: `${safeAnalysis.imageProperties.brightness * 100}%`,
              }}
             ></div>
            </div>
            <span className="font-bold">
             {(safeAnalysis.imageProperties.brightness * 100).toFixed(0)}%
            </span>
           </div>
           <div className="flex justify-between items-center">
            <span className="font-medium">Contrast</span>
            <div className="w-1/2 bg-gray-200 rounded-full h-4 border border-black overflow-hidden">
             <div
              className="bg-[hsl(var(--purple))] h-full"
              style={{
               width: `${safeAnalysis.imageProperties.contrast * 100}%`,
              }}
             ></div>
            </div>
            <span className="font-bold">
             {(safeAnalysis.imageProperties.contrast * 100).toFixed(0)}%
            </span>
           </div>
          </div>
         </div>
        </div>
       )}
      </div>
     )}

     {activeTab === "advanced" && (
      <div className="space-y-6">
       <div className="exifee-card bg-[hsl(var(--teal))]">
        <div className="p-4">
         <h3 className="text-lg font-bold flex items-center">
          <Aperture className="h-5 w-5 mr-2" />
          Advanced Camera Settings
         </h3>
        </div>
        <div className="p-4">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="exifee-card bg-background/30">
           <div className="p-4">
            <h4 className="font-bold">Exposure Settings</h4>
           </div>
           <div className="p-4">
            <div className="space-y-3">
             <div className="flex justify-between items-center">
              <span className="font-medium">Exposure Program</span>
              <span className="font-bold">
               {safeAnalysis.exifData.advanced.exposureProgram}
              </span>
             </div>
             <div className="flex justify-between items-center">
              <span className="font-medium">Exposure Mode</span>
              <span className="font-bold">
               {safeAnalysis.exifData.advanced.exposureMode}
              </span>
             </div>
             <div className="flex justify-between items-center">
              <span className="font-medium">Metering Mode</span>
              <span className="font-bold">
               {safeAnalysis.exifData.advanced.meteringMode}
              </span>
             </div>
             <div className="flex justify-between items-center">
              <span className="font-medium">Scene Type</span>
              <span className="font-bold">
               {safeAnalysis.exifData.advanced.sceneCaptureType}
              </span>
             </div>
            </div>
           </div>
          </div>

          <div className="exifee-card bg-background/30">
           <div className="p-4">
            <h4 className="font-bold">Image Adjustments</h4>
           </div>
           <div className="p-4">
            <div className="space-y-3">
             <div className="flex justify-between items-center">
              <span className="font-medium">White Balance</span>
              <span className="font-bold">
               {safeAnalysis.exifData.advanced.whiteBalance}
              </span>
             </div>
             <div className="flex justify-between items-center">
              <span className="font-medium">Contrast</span>
              <span className="font-bold">
               {safeAnalysis.exifData.advanced.contrast}
              </span>
             </div>
             <div className="flex justify-between items-center">
              <span className="font-medium">Saturation</span>
              <span className="font-bold">
               {safeAnalysis.exifData.advanced.saturation}
              </span>
             </div>
             <div className="flex justify-between items-center">
              <span className="font-medium">Sharpness</span>
              <span className="font-bold">
               {safeAnalysis.exifData.advanced.sharpness}
              </span>
             </div>
            </div>
           </div>
          </div>
         </div>
        </div>
       </div>

       <div className="exifee-card bg-[hsl(var(--orange))]">
        <div className="p-4">
         <h3 className="text-lg font-bold flex items-center">
          <Zap className="h-5 w-5 mr-2" />
          Additional Information
         </h3>
        </div>
        <div className="p-4">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="exifee-card bg-background/30">
           <div className="p-4">
            <h4 className="font-bold">Lens Information</h4>
           </div>
           <div className="p-4">
            <div className="space-y-3">
             <div className="flex justify-between items-center">
              <span className="font-medium">Lens Model</span>
              <span className="font-bold">
               {safeAnalysis.exifData.advanced.lensModel}
              </span>
             </div>
             <div className="flex justify-between items-center">
              <span className="font-medium">Lens Info</span>
              <span className="font-bold">
               {safeAnalysis.exifData.advanced.lensInfo}
              </span>
             </div>
             <div className="flex justify-between items-center">
              <span className="font-medium">Digital Zoom</span>
              <span className="font-bold">
               {safeAnalysis.exifData.advanced.digitalZoomRatio > 0
                ? `${safeAnalysis.exifData.advanced.digitalZoomRatio}x`
                : "None"}
              </span>
             </div>
             <div className="flex justify-between items-center">
              <span className="font-medium">Subject Distance</span>
              <span className="font-bold">
               {safeAnalysis.exifData.advanced.subjectDistance}
              </span>
             </div>
            </div>
           </div>
          </div>

          {safeAnalysis.exifData.raw && (
           <div className="exifee-card bg-background/30">
            <div className="p-4">
             <h4 className="font-bold">Raw Data Sample</h4>
            </div>
            <div className="p-4">
             <p className="text-sm text-muted-foreground mb-2">
              This is a sample of the raw EXIF data extracted from the image.
             </p>
             <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-auto max-h-40 text-xs font-mono">
              {JSON.stringify(safeAnalysis.exifData.raw, null, 2)}
             </div>
            </div>
           </div>
          )}
         </div>
        </div>
       </div>

       <div className="bg-background text-muted-foreground p-4 rounded-lg font-medium">
        Advanced EXIF data provides deeper insights into how the image was
        captured. This information is extracted using the exifr library, which
        can read a wide range of metadata from various image formats.
       </div>
      </div>
     )}

     {activeTab === "exif" && (
      <div className="space-y-6">
       <div className="exifee-card bg-[hsl(var(--orange))]">
        <div className="p-4">
         <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center">
           <Info className="h-5 w-5 mr-2" />
           EXIF Data
          </h3>
         </div>
        </div>
        <div className="p-4">
         <div className="space-y-4">
          <div className="exifee-card bg-background/30">
           <div className="p-4">
            <div className="flex items-center">
             <Camera className="h-4 w-4 mr-2" />
             <span className="font-bold">Camera Information</span>
            </div>
           </div>
           <div className="p-4">
            <div className="space-y-2">
             {Object.entries(safeAnalysis.exifData.camera).map(
              ([key, value]) => (
               <div
                key={key}
                className="flex justify-between py-2 border-b border-dashed border-black"
               >
                <span className="capitalize font-medium">{key}:</span>
                <span className="font-bold">{String(value)}</span>
               </div>
              )
             )}
            </div>
           </div>
          </div>

          <div className="exifee-card bg-background/30">
           <div className="p-4">
            <div className="flex items-center">
             <ImageIcon className="h-4 w-4 mr-2" />
             <span className="font-bold">Image Information</span>
            </div>
           </div>
           <div className="p-4">
            <div className="space-y-2">
             {Object.entries(safeAnalysis.exifData.image).map(
              ([key, value]) => (
               <div
                key={key}
                className="flex justify-between py-2 border-b border-dashed border-black"
               >
                <span className="capitalize font-medium">{key}:</span>
                <span className="font-bold">{String(value)}</span>
               </div>
              )
             )}
            </div>
           </div>
          </div>

          <div className="exifee-card bg-background/30">
           <div className="p-4">
            <div className="flex items-center">
             <Info className="h-4 w-4 mr-2" />
             <span className="font-bold">EXIF Details</span>
            </div>
           </div>
           <div className="p-4">
            <div className="space-y-2">
             {Object.entries(safeAnalysis.exifData.exif).map(([key, value]) => (
              <div
               key={key}
               className="flex justify-between py-2 border-b border-dashed border-black"
              >
               <span className="capitalize font-medium">{key}:</span>
               <span className="font-bold">
                {key === "dateTimeOriginal"
                 ? new Date(value as string).toLocaleString()
                 : String(value)}
               </span>
              </div>
             ))}
            </div>
           </div>
          </div>

          <div className="exifee-card bg-background/30">
           <div className="p-4">
            <div className="flex items-center">
             <MapPin className="h-4 w-4 mr-2" />
             <span className="font-bold">GPS Information</span>
            </div>
           </div>
           <div className="p-4">
            {safeAnalysis.exifData.gps.latitude ? (
             <div className="space-y-2">
              {Object.entries(safeAnalysis.exifData.gps).map(([key, value]) => (
               <div
                key={key}
                className="flex justify-between py-2 border-b border-dashed border-black"
               >
                <span className="capitalize font-medium">{key}:</span>
                <span className="font-bold">{String(value)}</span>
               </div>
              ))}
             </div>
            ) : (
             <p className="font-medium">No GPS data available in this image.</p>
            )}
           </div>
          </div>

          <div className="exifee-card bg-background/30">
           <div className="p-4">
            <div className="flex items-center">
             <Layers className="h-4 w-4 mr-2" />
             <span className="font-bold">Advanced Settings</span>
            </div>
           </div>
           <div className="p-4">
            <div className="space-y-2">
             {Object.entries(safeAnalysis.exifData.advanced).map(
              ([key, value]) => (
               <div
                key={key}
                className="flex justify-between py-2 border-b border-dashed border-black"
               >
                <span className="capitalize font-medium">{key}:</span>
                <span className="font-bold">{String(value)}</span>
               </div>
              )
             )}
            </div>
           </div>
          </div>
         </div>
        </div>
       </div>

       <div className="bg-background text-muted-foreground p-4 rounded-lg font-medium">
        EXIF data is metadata embedded in image files by digital cameras and
        editing software. This data can include camera settings, date and time
        information, location data, and more. We use the exifr library to
        extract this information accurately.
       </div>
      </div>
     )}

     {activeTab === "ai" && (
      <div className="space-y-6">
       <div className="exifee-card bg-[hsl(var(--teal))]">
        <div className="p-4">
         <h3 className="text-lg font-bold flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          AI Detection Results
         </h3>
        </div>
        <div className="p-4">
         <div className="space-y-6">
          <div className="exifee-card bg-background p-6">
           <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
             <h3 className="text-2xl font-bold mb-1">
              {safeAnalysis.aiDetection.isAiGenerated ? (
               <span className="text-red-500">AI Generated</span>
              ) : (
               <span className="text-green-500">Human Created</span>
              )}
             </h3>
             <p className="font-medium">
              Our algorithms have determined this image was most likely
              {safeAnalysis.aiDetection.isAiGenerated
               ? " created by AI"
               : " captured by a human"}
             </p>
            </div>
            <div className="mt-4 md:mt-0 text-center">
             <div className="text-3xl font-bold">
              {safeAnalysis.aiDetection.confidence.toFixed(0)}%
             </div>
             <div className="text-sm">Confidence</div>
            </div>
           </div>
          </div>

          <div>
           <h3 className="text-lg font-bold mb-4">Confidence Score</h3>
           <div className="w-full bg-background rounded-full h-6 mb-2 border-black overflow-hidden">
            <div
             className={`h-full ${
              safeAnalysis.aiDetection.isAiGenerated
               ? "bg-red-500"
               : "bg-green-500"
             } transition-all duration-1000 ease-in-out`}
             style={{ width: `${safeAnalysis.aiDetection.confidence}%` }}
            ></div>
           </div>
           <div className="flex justify-between mt-1 text-sm font-medium">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
           </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
           <div className="exifee-card bg-background/30">
            <div className="p-4">
             <h4 className="font-bold">Model Prediction</h4>
            </div>
            <div className="p-4">
             <p>{safeAnalysis.aiDetection.details.modelPrediction}</p>
            </div>
           </div>

           <div className="exifee-card bg-background/30">
            <div className="p-4">
             <h4 className="font-bold">Pattern Analysis</h4>
            </div>
            <div className="p-4">
             <p>{safeAnalysis.aiDetection.details.patternAnalysis}</p>
            </div>
           </div>
          </div>

          <div className="exifee-card bg-background/30">
           <div className="p-4">
            <h4 className="font-bold">Detected Inconsistencies</h4>
           </div>
           <div className="p-4">
            {safeAnalysis.aiDetection.details.inconsistencies.length > 0 ? (
             <ul className="space-y-2">
              {safeAnalysis.aiDetection.details.inconsistencies.map(
               (item: string, index: number) => (
                <li key={index} className="flex items-start">
                 <span className="mr-2">•</span>
                 <span>{item}</span>
                </li>
               )
              )}
             </ul>
            ) : (
             <p>No inconsistencies detected.</p>
            )}
           </div>
          </div>
         </div>
        </div>
       </div>

       <div className="bg-background text-muted-foreground p-4 rounded-lg font-medium">
        Our AI detection is powered by Sightengine and based on pattern
        recognition and analysis of image characteristics. While highly
        accurate, it may not be 100% reliable in all cases as AI generation
        technology continues to evolve.
       </div>
      </div>
     )}

     {activeTab === "colors" && (
      <div className="space-y-6">
       <div className="exifee-card bg-[hsl(var(--coral))]">
        <div className="p-4">
         <h3 className="text-lg font-bold flex items-center">
          <Palette className="h-5 w-5 mr-2" />
          Color Palette
         </h3>
        </div>
        <div className="p-4">
         <ColorPalette colorInfo={safeAnalysis.colorInfo} />
        </div>
       </div>

       <div className="bg-background text-muted-foreground p-4 rounded-lg font-medium">
        The color palette is extracted using Sightengine&apos;s image analysis.
        It identifies the dominant color, accent colors, and other significant
        colors in the image. You can click on any color to copy its hex code.
       </div>
      </div>
     )}
    </div>
   </div>
  </div>
 );
}
