"use client";

import {
 AlertCircle,
 ArrowLeft,
 CheckCircle,
 Clock,
 Download,
 ExternalLink,
 FileText,
 FileVideo,
 Image,
 Info,
 Loader2,
 Mic,
 Play,
 Settings,
 Video,
 Volume2,
 Wand2,
} from "lucide-react";
import { use, useEffect, useState } from "react";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
 Tabs,
 TabsContent,
 TabsList,
 TabsTrigger,
} from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";

// Asset extraction from article content
function extractAssetsFromContent(content: string) {
 const images = (content.match(/!\[([^\]]*)\]\([^)]+\)/g) || []).map(
  (match) => {
   const urlMatch = match.match(/!\[([^\]]*)\]\(([^)]+)\)/);
   return {
    type: "image",
    url: urlMatch?.[2] || "",
    alt: urlMatch?.[1] || "",
   };
  }
 );

 const videos = (content.match(/<video[^>]*src="([^"]*)"[^>]*>/g) || []).map(
  (match) => {
   const urlMatch = match.match(/src="([^"]*)"/);
   return {
    type: "video",
    url: urlMatch?.[1] || "",
   };
  }
 );

 return [...images, ...videos];
}

// Generate narration prompt for OpenRouter
function _generateNarrationPrompt(content: string, style: string = "engaging") {
 const plainText = content
  .replace(/#{1,6}\s/g, "")
  .replace(/\*\*([^*]+)\*\*/g, "$1")
  .replace(/\*([^*]+)\*/g, "$1")
  .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
  .replace(/```[\s\S]*?```/g, "")
  .replace(/`([^`]+)`/g, "$1")
  .replace(/<[^>]*>/g, "")
  .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
  .trim();

 const wordCount = plainText.split(/\s+/).length;
 const targetWords = Math.floor(wordCount * 0.15); // Aim for 15% of original content

 return `Convert this article content into an engaging ${targetWords}-word narration script for a 1.5-minute video. Use a ${style} storytelling style with natural pauses and emphasis points. Make it conversational and compelling:

${plainText.substring(0, 2000)}...`;
}

export type VideoGeneratorPageProps = {
 params: Promise<{ slug: string }>;
};

export default function VideoGeneratorPage({
 params,
}: VideoGeneratorPageProps) {
 const { slug } = use(params);
 const [post, setPost] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [generating, setGenerating] = useState(false);
 const [formData, setFormData] = useState<any>({
  videoTitle: "",
  narrationStyle: "engaging",
  voiceSettings: {
   voiceId: "21m00Tcm4TlvDq8ikWAM", // Default ElevenLabs voice
   model: "eleven_monolingual_v1",
   voiceSettings: {
    stability: 0.5,
    similarity_boost: 0.5,
    style: 0.0,
    use_speaker_boost: true,
   },
  },
  assets: [],
  narration: "",
  audioUrl: "",
  videoUrl: "",
 });

 const [currentStep, setCurrentStep] = useState(1);
 const [errors, setErrors] = useState<Record<string, string>>({});

 // Form validation
 const validateForm = () => {
  const newErrors: Record<string, string> = {};

  if (!formData.videoTitle?.trim()) {
   newErrors.videoTitle = "Video title is required";
  } else if (formData.videoTitle.length < 5) {
   newErrors.videoTitle = "Video title must be at least 5 characters";
  } else if (formData.videoTitle.length > 100) {
   newErrors.videoTitle = "Video title must be less than 100 characters";
  }

  if (currentStep >= 2 && !formData.narration?.trim()) {
   newErrors.narration = "Narration is required for audio generation";
  }

  if (currentStep >= 3 && !formData.audioUrl) {
   newErrors.audio = "Audio generation is required before creating video";
  }

  if (currentStep >= 4 && formData.assets.length === 0) {
   newErrors.assets = "At least one asset (image or video) is required";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
 };

 useEffect(() => {
  const fetchPost = async () => {
   try {
    const response = await fetch(`/api/admin/posts/${slug}`);
    if (!response.ok) throw new Error("Post not found");
    const postData = await response.json();
    setPost(postData);

    // Auto-populate form data
    const assets = extractAssetsFromContent(postData.content || "");
    setFormData((prev: any) => ({
     ...prev,
     videoTitle: postData.title ? `${postData.title} - Video Summary` : "",
     assets: assets,
    }));
   } catch (error) {
    console.error("Error:", error);
   } finally {
    setLoading(false);
   }
  };

  fetchPost();
 }, [slug]);

 const handleInputChange = (field: string, value: any) => {
  setFormData((prev: any) => ({
   ...prev,
   [field]: value,
  }));
 };

 const generateNarration = async () => {
  if (!post?.content) {
   setErrors((prev) => ({
    ...prev,
    narration: "No article content available",
   }));
   return;
  }

  // Validate current step requirements
  if (!validateForm()) return;

  setGenerating(true);
  setErrors({});

  try {
   const response = await fetch("/api/admin/video/generate-narration", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     content: post.content,
     style: formData.narrationStyle,
    }),
   });

   if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate narration");
   }

   const data = await response.json();
   setFormData((prev: any) => ({
    ...prev,
    narration: data.narration,
   }));
   setCurrentStep(2);
  } catch (error: any) {
   console.error("Error generating narration:", error);
   setErrors((prev) => ({
    ...prev,
    narration:
     error.message || "Failed to generate narration. Please try again.",
   }));
  } finally {
   setGenerating(false);
  }
 };

 const generateAudio = async () => {
  if (!formData.narration?.trim()) {
   setErrors((prev) => ({
    ...prev,
    audio: "Narration text is required",
   }));
   return;
  }

  // Validate current step requirements
  if (!validateForm()) return;

  setGenerating(true);
  setErrors({});

  try {
   const response = await fetch("/api/admin/video/generate-audio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     text: formData.narration,
     voiceSettings: formData.voiceSettings,
    }),
   });

   if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate audio");
   }

   const data = await response.json();
   setFormData((prev: any) => ({
    ...prev,
    audioUrl: data.audioUrl,
   }));
   setCurrentStep(3);
  } catch (error: any) {
   console.error("Error generating audio:", error);
   setErrors((prev) => ({
    ...prev,
    audio: error.message || "Failed to generate audio. Please try again.",
   }));
  } finally {
   setGenerating(false);
  }
 };

 const generateVideo = async () => {
  if (!formData.audioUrl) {
   setErrors((prev) => ({
    ...prev,
    video: "Audio generation is required",
   }));
   return;
  }

  if (!formData.assets?.length) {
   setErrors((prev) => ({
    ...prev,
    video: "No assets available for video generation",
   }));
   return;
  }

  // Validate current step requirements
  if (!validateForm()) return;

  setGenerating(true);
  setErrors({});

  try {
   const response = await fetch("/api/admin/video/generate-video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     title: formData.videoTitle,
     audioUrl: formData.audioUrl,
     assets: formData.assets,
     postSlug: slug,
    }),
   });

   if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate video");
   }

   const data = await response.json();
   setFormData((prev: any) => ({
    ...prev,
    videoUrl: data.videoUrl,
   }));
   setCurrentStep(4);
  } catch (error: any) {
   console.error("Error generating video:", error);
   setErrors((prev) => ({
    ...prev,
    video: error.message || "Failed to generate video. Please try again.",
   }));
  } finally {
   setGenerating(false);
  }
 };

 if (loading) {
  return (
   <div className="container mx-auto px-4 py-8">
    <div className="animate-pulse space-y-6">
     <div className="h-8 bg-gray-200 rounded w-1/3"></div>
     <div className="h-96 bg-gray-200 rounded"></div>
    </div>
   </div>
  );
 }

 if (!post) {
  return (
   <div className="container mx-auto px-4 py-8 text-center">
    <h1 className="text-2xl font-bold mb-4">Post not found</h1>
   </div>
  );
 }

 return (
  <div className="container mx-auto px-4 py-8 max-w-6xl">
   {/* Header */}
   <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-white to-gray-50 rounded-lg border">
    <Button
     variant="outline"
     size="sm"
     onClick={() => (window.location.href = `/${slug}`)}
     className="shrink-0"
    >
     <ArrowLeft className="w-4 h-4 mr-2" />
     Back to Post
    </Button>

    <div className="flex-1 min-w-0">
     <div className="flex items-center gap-3 mb-2">
      <h1 className="text-3xl font-bold text-gray-900">Video Generator</h1>
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
       <Video className="w-3 h-3 mr-1" />
       AI-Powered
      </Badge>
     </div>
     <div className="flex items-center gap-6 text-sm text-gray-600">
      <span className="flex items-center gap-1">
       <FileText className="w-4 h-4" />
       {post.wordCount || 0} words
      </span>
      <span className="flex items-center gap-1">
       <Clock className="w-4 h-4" />
       {post.readingTime || 0} min read
      </span>
      <span className="flex items-center gap-1">
       <Image className="w-4 h-4" />
       {formData.assets.length} assets
      </span>
     </div>
    </div>
   </div>

   {/* Progress Steps */}
   <div className="mb-8">
    <div className="flex items-center justify-between">
     {[1, 2, 3, 4].map((step) => (
      <div key={step} className="flex items-center">
       <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
         step <= currentStep
          ? "bg-blue-600 text-white"
          : "bg-gray-200 text-gray-600"
        }`}
       >
        {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
       </div>
       {step < 4 && (
        <div
         className={`w-16 h-1 mx-2 ${
          step < currentStep ? "bg-blue-600" : "bg-gray-200"
         }`}
        />
       )}
      </div>
     ))}
    </div>
    <div className="flex justify-between mt-2 text-xs text-gray-500">
     <span>Setup</span>
     <span>Narration</span>
     <span>Audio</span>
     <span>Video</span>
    </div>
   </div>

   {/* Error Alerts */}
   {Object.keys(errors).length > 0 && (
    <Alert className="mb-6 border-red-200 bg-red-50">
     <AlertCircle className="h-4 w-4 text-red-600" />
     <AlertDescription className="text-red-800">
      Please fix the following errors: {Object.values(errors).join(", ")}
     </AlertDescription>
    </Alert>
   )}

   <Tabs defaultValue="setup" className="space-y-6">
    <TabsList className="grid w-full grid-cols-4">
     <TabsTrigger value="setup" className="flex items-center gap-2">
      <Settings className="w-4 h-4" />
      Setup
     </TabsTrigger>
     <TabsTrigger value="narration" className="flex items-center gap-2">
      <Mic className="w-4 h-4" />
      Narration
     </TabsTrigger>
     <TabsTrigger value="audio" className="flex items-center gap-2">
      <Volume2 className="w-4 h-4" />
      Audio
     </TabsTrigger>
     <TabsTrigger value="video" className="flex items-center gap-2">
      <FileVideo className="w-4 h-4" />
      Video
     </TabsTrigger>
    </TabsList>

    <TabsContent value="setup" className="space-y-6">
     <Card>
      <CardHeader>
       <CardTitle className="flex items-center gap-2">
        <Video className="w-5 h-5" />
        Video Configuration
       </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
       <div>
        <Label htmlFor="videoTitle" className="flex items-center gap-2">
         Video Title
         {errors.videoTitle && (
          <Badge variant="destructive" className="text-xs">
           Error
          </Badge>
         )}
        </Label>
        <Input
         id="videoTitle"
         value={formData.videoTitle}
         onChange={(e) => handleInputChange("videoTitle", e.target.value)}
         placeholder="Enter video title..."
         className={`mt-1 ${errors.videoTitle ? "border-red-500" : ""}`}
        />
        {errors.videoTitle && (
         <p className="text-xs text-red-600 mt-1">{errors.videoTitle}</p>
        )}
       </div>

       <div>
        <Label htmlFor="narrationStyle">Narration Style</Label>
        <select
         id="narrationStyle"
         value={formData.narrationStyle}
         onChange={(e) => handleInputChange("narrationStyle", e.target.value)}
         className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
         <option value="engaging">Engaging</option>
         <option value="professional">Professional</option>
         <option value="casual">Casual</option>
         <option value="dramatic">Dramatic</option>
         <option value="educational">Educational</option>
        </select>
       </div>
      </CardContent>
     </Card>

     <Card>
      <CardHeader>
       <CardTitle className="flex items-center gap-2">
        <Image className="w-5 h-5" />
        Assets from Article ({formData.assets.length} found)
       </CardTitle>
      </CardHeader>
      <CardContent>
       {formData.assets.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
         {formData.assets.map((asset: any, index: number) => (
          <div key={index} className="relative group">
           {asset.type === "image" ? (
            <img
             src={asset.url}
             alt={asset.alt}
             className="w-full h-24 object-cover rounded-lg border"
            />
           ) : (
            <div className="w-full h-24 bg-gray-100 rounded-lg border flex items-center justify-center">
             <Video className="w-8 h-8 text-gray-400" />
            </div>
           )}
           <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Badge variant="secondary" className="text-xs">
             {asset.type}
            </Badge>
           </div>
          </div>
         ))}
        </div>
       ) : (
        <p className="text-gray-500 text-center py-8">
         No assets found in the article content. Images and videos will be added
         during video generation.
        </p>
       )}
      </CardContent>
     </Card>
    </TabsContent>

    <TabsContent value="narration" className="space-y-6">
     <Card>
      <CardHeader>
       <CardTitle className="flex items-center gap-2">
        <Wand2 className="w-5 h-5" />
        AI Narration Generation
       </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
       <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
         We'll use OpenRouter to convert your article into an engaging
         1.5-minute narration script. The narration will be optimized for video
         with natural pacing and storytelling elements.
        </p>
       </div>

       <div className="flex gap-3">
        <Button
         onClick={generateNarration}
         disabled={generating || !post?.content}
         className="flex-1"
        >
         {generating ? (
          <>
           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
           Generating Narration...
          </>
         ) : (
          <>
           <Wand2 className="w-4 h-4 mr-2" />
           Generate Narration
          </>
         )}
        </Button>
       </div>

       {errors.narration && (
        <Alert className="border-red-200 bg-red-50">
         <AlertCircle className="h-4 w-4 text-red-600" />
         <AlertDescription className="text-red-800">
          {errors.narration}
         </AlertDescription>
        </Alert>
       )}

       {formData.narration && (
        <div className="p-4 bg-green-50 rounded-lg">
         <Label className="text-sm font-medium text-green-800 mb-2 block">
          Generated Narration:
         </Label>
         <Textarea
          value={formData.narration}
          onChange={(e) => handleInputChange("narration", e.target.value)}
          rows={6}
          className="mt-1"
         />
         <p className="text-xs text-green-600 mt-2">
          Word count: {formData.narration.split(/\s+/).length} (Target: ~150
          words for 1.5 minutes)
         </p>
        </div>
       )}
      </CardContent>
     </Card>
    </TabsContent>

    <TabsContent value="audio" className="space-y-6">
     <Card>
      <CardHeader>
       <CardTitle className="flex items-center gap-2">
        <Volume2 className="w-5 h-5" />
        Text-to-Speech Generation
       </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
       <div className="p-4 bg-purple-50 rounded-lg">
        <p className="text-sm text-purple-800">
         We'll use ElevenLabs API to convert your narration into high-quality
         speech. Choose your preferred voice and settings below.
        </p>
       </div>

       <div className="grid grid-cols-2 gap-4">
        <div>
         <Label>Voice</Label>
         <select
          value={formData.voiceSettings.voiceId}
          onChange={(e) =>
           handleInputChange("voiceSettings", {
            ...formData.voiceSettings,
            voiceId: e.target.value,
           })
          }
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
         >
          <option value="21m00Tcm4TlvDq8ikWAM">Rachel (Default)</option>
          <option value="AZnzlk1XvdvUeBnXmlld">Domi</option>
          <option value="EXAVITQu4vr4xnSDxMaL">Bella</option>
          <option value="ErXwobaYiN019PkySvjV">Antoni</option>
          <option value="VR6AewLTigWG4xSOukaG">Arnold</option>
          <option value="pNInz6obpgDQGcFmaJgB">Adam</option>
          <option value="yoZ06aMxZJJ28mfd3POQ">Sam</option>
         </select>
        </div>

        <div>
         <Label>Model</Label>
         <select
          value={formData.voiceSettings.model}
          onChange={(e) =>
           handleInputChange("voiceSettings", {
            ...formData.voiceSettings,
            model: e.target.value,
           })
          }
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
         >
          <option value="eleven_monolingual_v1">Eleven Monolingual v1</option>
          <option value="eleven_multilingual_v2">Eleven Multilingual v2</option>
          <option value="eleven_turbo_v2">Eleven Turbo v2</option>
         </select>
        </div>
       </div>

       <div className="flex gap-3">
        <Button
         onClick={generateAudio}
         disabled={generating || !formData.narration}
         className="flex-1"
        >
         {generating ? (
          <>
           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
           Generating Audio...
          </>
         ) : (
          <>
           <Volume2 className="w-4 h-4 mr-2" />
           Generate Audio
          </>
         )}
        </Button>
       </div>

       {errors.audio && (
        <Alert className="border-red-200 bg-red-50">
         <AlertCircle className="h-4 w-4 text-red-600" />
         <AlertDescription className="text-red-800">
          {errors.audio}
         </AlertDescription>
        </Alert>
       )}

       {formData.audioUrl && (
        <div className="p-4 bg-green-50 rounded-lg">
         <div className="flex items-center gap-3 mb-3">
          <Volume2 className="w-5 h-5 text-green-600" />
          <Label className="text-sm font-medium text-green-800">
           Audio Generated Successfully!
          </Label>
         </div>
         <audio controls className="w-full">
          <source src={formData.audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
         </audio>
        </div>
       )}
      </CardContent>
     </Card>
    </TabsContent>

    <TabsContent value="video" className="space-y-6">
     <Card>
      <CardHeader>
       <CardTitle className="flex items-center gap-2">
        <FileVideo className="w-5 h-5" />
        Video Generation
       </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
       <div className="p-4 bg-orange-50 rounded-lg">
        <p className="text-sm text-orange-800">
         We'll run an external video generation program on the server to create
         your video. This process combines your audio with the article assets
         and creates a professional video.
        </p>
       </div>

       <div className="flex gap-3">
        <Button
         onClick={generateVideo}
         disabled={generating || !formData.audioUrl}
         className="flex-1"
        >
         {generating ? (
          <>
           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
           Generating Video...
          </>
         ) : (
          <>
           <Play className="w-4 h-4 mr-2" />
           Generate Video
          </>
         )}
        </Button>
       </div>

       {errors.video && (
        <Alert className="border-red-200 bg-red-50">
         <AlertCircle className="h-4 w-4 text-red-600" />
         <AlertDescription className="text-red-800">
          {errors.video}
         </AlertDescription>
        </Alert>
       )}

       {formData.videoUrl && (
        <div className="p-4 bg-green-50 rounded-lg">
         <div className="flex items-center gap-3 mb-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <Label className="text-sm font-medium text-green-800">
           Video Generated Successfully!
          </Label>
         </div>

         {/* Video Preview */}
         <div className="mb-4">
          <video
           controls
           className="w-full max-h-96 bg-black rounded-lg"
           preload="metadata"
          >
           <source src={formData.videoUrl} type="video/mp4" />
           Your browser does not support the video element.
          </video>
         </div>

         {/* Video Info */}
         <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-white/50 rounded-lg">
          <div>
           <p className="text-xs text-green-700 font-medium">Title</p>
           <p className="text-sm text-green-800 truncate">
            {formData.videoTitle}
           </p>
          </div>
          <div>
           <p className="text-xs text-green-700 font-medium">Narration Style</p>
           <p className="text-sm text-green-800 capitalize">
            {formData.narrationStyle}
           </p>
          </div>
          <div>
           <p className="text-xs text-green-700 font-medium">Assets</p>
           <p className="text-sm text-green-800">
            {formData.assets.length} media files
           </p>
          </div>
          <div>
           <p className="text-xs text-green-700 font-medium">Voice</p>
           <p className="text-sm text-green-800">
            {formData.voiceSettings.voiceId}
           </p>
          </div>
         </div>

         {/* Action Buttons */}
         <div className="flex gap-3">
          <Button
           className="flex-1"
           onClick={() => {
            const link = document.createElement("a");
            link.href = formData.videoUrl;
            link.download = `${formData.videoTitle}.mp4`;
            link.click();
           }}
          >
           <Download className="w-4 h-4 mr-2" />
           Download Video
          </Button>
          <Button
           variant="outline"
           className="flex-1"
           onClick={() => window.open(formData.videoUrl, "_blank")}
          >
           <ExternalLink className="w-4 h-4 mr-2" />
           Open in New Tab
          </Button>
         </div>

         {/* Share Options */}
         <div className="mt-3 pt-3 border-t border-green-200">
          <p className="text-xs text-green-700 font-medium mb-2">
           Share Video:
          </p>
          <div className="flex gap-2">
           <Button
            size="sm"
            variant="outline"
            onClick={() => {
             if (navigator.share) {
              navigator.share({
               title: formData.videoTitle,
               url: `${window.location.origin}${formData.videoUrl}`,
              });
             }
            }}
           >
            Share
           </Button>
           <Button
            size="sm"
            variant="outline"
            onClick={() => {
             navigator.clipboard.writeText(
              `${window.location.origin}${formData.videoUrl}`
             );
             // You could add a toast notification here
            }}
           >
            Copy Link
           </Button>
          </div>
         </div>
        </div>
       )}
      </CardContent>
     </Card>
    </TabsContent>
   </Tabs>

   {/* Action Buttons */}
   <div className="flex justify-between items-center mt-8 p-6 bg-gradient-to-r from-gray-50 to-white rounded-lg border shadow-sm">
    <div className="flex items-center gap-4 text-sm">
     <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border">
      <Info className="w-4 h-4 text-blue-600" />
      <span className="text-blue-700 font-medium">Step {currentStep} of 4</span>
     </div>
    </div>

    <div className="flex gap-3">
     <Button
      variant="outline"
      onClick={() => (window.location.href = `/${slug}`)}
      className="px-6"
     >
      Cancel
     </Button>
     {currentStep === 4 && formData.videoUrl && (
      <Button
       onClick={() => window.open(formData.videoUrl, "_blank")}
       className="px-6"
      >
       <ExternalLink className="w-4 h-4 mr-2" />
       View Video
      </Button>
     )}
    </div>
   </div>
  </div>
 );
}
