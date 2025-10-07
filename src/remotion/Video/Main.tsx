import type React from "react";
import {
 AbsoluteFill,
 Audio,
 Easing,
 Img,
 interpolate,
 Sequence,
 useCurrentFrame,
 useVideoConfig,
 Video as RemotionVideo,
} from "remotion";
import { Oscilloscope } from "./Visualizers";
import { PaginatedCaptions } from "./Captions";
import {
 BASE_SIZE,
 CAPTIONS_FONT_SIZE,
 CAPTIONS_FONT_WEIGHT,
 LINE_HEIGHT,
 LINES_PER_PAGE,
} from "../helpers/constants";
import { FONT_FAMILY, WaitForFonts } from "./Font";
import type { VideoCompositionSchemaType } from "../helpers/schema";

// Component for rendering media (image or video) with sliding animations
interface MediaSlideProps {
 src: string;
 startFrame: number;
 endFrame: number;
 transitionFrames: number;
 mediaFitMode: "cover" | "contain" | "fill";
 isVideo?: boolean;
}

const MediaSlide: React.FC<MediaSlideProps> = ({
 src,
 startFrame,
 endFrame,
 transitionFrames,
 mediaFitMode,
 isVideo = false,
}) => {
 const frame = useCurrentFrame();
 const { height } = useVideoConfig();

 // Calculate animation progress
 const fadeInProgress = interpolate(
  frame,
  [startFrame, startFrame + transitionFrames],
  [0, 1],
  {
   extrapolateLeft: "clamp",
   extrapolateRight: "clamp",
   easing: Easing.out(Easing.cubic),
  }
 );

 const fadeOutProgress = interpolate(
  frame,
  [endFrame - transitionFrames, endFrame],
  [1, 0],
  {
   extrapolateLeft: "clamp",
   extrapolateRight: "clamp",
   easing: Easing.in(Easing.cubic),
  }
 );

 // Sophisticated slide animation with scale effect
 const slideInY = interpolate(
  frame,
  [startFrame, startFrame + transitionFrames],
  [height * 0.05, 0],
  {
   extrapolateLeft: "clamp",
   extrapolateRight: "clamp",
   easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // Professional easing curve
  }
 );

 const slideOutY = interpolate(
  frame,
  [endFrame - transitionFrames, endFrame],
  [0, -height * 0.05],
  {
   extrapolateLeft: "clamp",
   extrapolateRight: "clamp",
   easing: Easing.bezier(0.55, 0.06, 0.68, 0.19), // Smooth exit
  }
 );

 // Subtle scale animation for elegance
 const scaleIn = interpolate(
  frame,
  [startFrame, startFrame + transitionFrames],
  [1.02, 1],
  {
   extrapolateLeft: "clamp",
   extrapolateRight: "clamp",
   easing: Easing.out(Easing.quad),
  }
 );

 const scaleOut = interpolate(
  frame,
  [endFrame - transitionFrames, endFrame],
  [1, 0.98],
  {
   extrapolateLeft: "clamp",
   extrapolateRight: "clamp",
   easing: Easing.in(Easing.quad),
  }
 );

 // Combine effects
 const opacity = Math.min(fadeInProgress, fadeOutProgress);
 const translateY = frame < endFrame - transitionFrames ? slideInY : slideOutY;
 const scale = frame < endFrame - transitionFrames ? scaleIn : scaleOut;

 if (frame < startFrame || frame > endFrame) {
  return null;
 }

 return (
  <div
   style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity,
    transform: `translateY(${translateY}px) scale(${scale})`,
   }}
  >
   {isVideo ? (
    <RemotionVideo
     src={src}
     style={{
      width: "100%",
      height: "100%",
      objectFit: mediaFitMode,
     }}
     startFrom={startFrame}
    />
   ) : (
    <Img
     src={src}
     style={{
      width: "100%",
      height: "100%",
      objectFit: mediaFitMode,
     }}
    />
   )}
  </div>
 );
};

// Component for the thumbnail frame (first frame)
interface ThumbnailFrameProps {
 mediaUrl: string;
 titleText: string;
 titleColor: string;
 titleFontSize: number;
 backgroundColor: string;
 isVideo?: boolean;
}

const ThumbnailFrame: React.FC<ThumbnailFrameProps> = ({
 mediaUrl,
 titleText,
 titleColor,
 titleFontSize,
 backgroundColor,
 isVideo = false,
}) => {
 const frame = useCurrentFrame();

 // Only show on first frame
 if (frame !== 0) {
  return null;
 }

 return (
  <AbsoluteFill>
   {/* Background */}
   <div
    style={{
     position: "absolute",
     top: 0,
     left: 0,
     width: "100%",
     height: "100%",
     backgroundColor,
    }}
   />

   {/* Media with subtle overlay */}
   <div
    style={{
     position: "absolute",
     top: 0,
     left: 0,
     width: "100%",
     height: "100%",
    }}
   >
    {isVideo ? (
     <RemotionVideo
      src={mediaUrl}
      style={{
       width: "100%",
       height: "100%",
       objectFit: "cover",
      }}
      startFrom={0}
      endAt={1}
     />
    ) : (
     <Img
      src={mediaUrl}
      style={{
       width: "100%",
       height: "100%",
       objectFit: "cover",
      }}
     />
    )}
    {/* Elegant overlay gradient */}
    <div
     style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background:
       "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.6) 100%)",
     }}
    />
   </div>

   {/* Professional title overlay */}
   <div
    style={{
     position: "absolute",
     bottom: "25%",
     left: 0,
     right: 0,
     textAlign: "center",
     padding: "0 60px",
     zIndex: 10,
    }}
   >
    <WaitForFonts>
     <div
      style={{
       background:
        "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
       backdropFilter: "blur(20px)",
       border: "1px solid rgba(255,255,255,0.2)",
       borderRadius: "24px",
       padding: "32px 40px",
       boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
      }}
     >
      <h1
       style={{
        color: titleColor,
        fontSize: Math.max(titleFontSize * 0.9, 36),
        fontFamily: FONT_FAMILY,
        fontWeight: 700,
        letterSpacing: "-0.02em",
        lineHeight: 1.1,
        margin: 0,
        textShadow: "0 2px 20px rgba(0,0,0,0.5)",
       }}
      >
       {titleText}
      </h1>
      {/* Subtle accent line */}
      <div
       style={{
        width: "60px",
        height: "3px",
        background:
         "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)",
        margin: "16px auto 0",
        borderRadius: "2px",
       }}
      />
     </div>
    </WaitForFonts>
   </div>
  </AbsoluteFill>
 );
};

export const Video: React.FC<VideoCompositionSchemaType> = ({
 visualizer,
 audioFileUrl,
 coverImageUrl,
 mediaUrls,
 titleText,
 titleColor,
 titleFontSize = 48,
 backgroundColor = "#000000",
 captionsTextColor,
 onlyDisplayCurrentSentence,
 audioOffsetInSeconds,
 transitionDurationInSeconds = 0.5,
 mediaFitMode = "cover",
 backgroundSoundUrl,
 captions,
}) => {
 const { durationInFrames, fps, width, height } = useVideoConfig();
 const currentFrame = useCurrentFrame();

 const audioOffsetInFrames = Math.round(audioOffsetInSeconds * fps);
 const transitionFrames = Math.round(transitionDurationInSeconds * fps);
 const baseNumberOfSamples = Number(visualizer.numberOfSamples);
 const textBoxWidth = width - BASE_SIZE * 2;

 // Render video
 if (!mediaUrls || mediaUrls.length === 0) {
  throw new Error("Video mode requires at least one media URL");
 }

 // Calculate timing for each media item (starting from frame 1, frame 0 is thumbnail)
 const totalMedia = mediaUrls.length;
 const availableFrames = durationInFrames - 1; // Subtract 1 for thumbnail frame
 const framesPerMedia = Math.floor(availableFrames / totalMedia);

 const mediaTimings = mediaUrls.map((_, index) => ({
  startFrame: 1 + index * framesPerMedia, // Start from frame 1
  endFrame: Math.min(1 + (index + 1) * framesPerMedia, durationInFrames),
 }));

 // Check if media is video (simple check by extension)
 const isVideoFile = (url: string) => {
  const videoExtensions = [".mp4", ".mov", ".avi", ".webm", ".mkv"];
  return videoExtensions.some((ext) => url.toLowerCase().includes(ext));
 };

 return (
  <AbsoluteFill>
   <Sequence from={-audioOffsetInFrames}>
    <Audio pauseWhenBuffering src={audioFileUrl} />
    {/* Background sound with sophisticated volume curve */}
    {backgroundSoundUrl && (
     <Audio
      pauseWhenBuffering
      src={backgroundSoundUrl}
      volume={(f) => {
       const startFadeOutFrame = 60;
       const endFadeInFrame = durationInFrames - 60;

       // Start at normal volume, fade to 30% after 60 frames
       if (f <= startFadeOutFrame) {
        return interpolate(f, [0, startFadeOutFrame], [1, 0.3], {
         extrapolateLeft: "clamp",
         extrapolateRight: "clamp",
         easing: Easing.out(Easing.quad),
        });
       }

       // Stay at 30% until last 60 frames
       if (f < endFadeInFrame) {
        return 0.3;
       }

       // Fade back to normal volume in last 60 frames
       return interpolate(f, [endFadeInFrame, durationInFrames], [0.3, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.in(Easing.quad),
       });
      }}
     />
    )}

    {/* Background */}
    <div
     style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor,
     }}
    />

    {/* Thumbnail frame (frame 0) */}
    <ThumbnailFrame
     mediaUrl={coverImageUrl}
     titleText={titleText || ""}
     titleColor={titleColor}
     titleFontSize={titleFontSize}
     backgroundColor={backgroundColor}
     isVideo={isVideoFile(coverImageUrl)}
    />

    {/* Media slides (starting from frame 1) */}
    {mediaUrls.map((mediaUrl, index) => (
     <MediaSlide
      key={index}
      src={mediaUrl}
      startFrame={mediaTimings[index]?.startFrame || 0}
      endFrame={mediaTimings[index]?.endFrame || durationInFrames}
      transitionFrames={transitionFrames}
      mediaFitMode={mediaFitMode}
      isVideo={isVideoFile(mediaUrl)}
     />
    ))}

    {/* Professional captions overlay */}
    {captions && (
     <div
      style={{
       position: "absolute",
       bottom: height > 1080 ? "12%" : "8%",
       left: 0,
       right: 0,
       padding: "0 50px",
       zIndex: 10,
      }}
     >
      <WaitForFonts>
       <div
        style={{
         lineHeight: `${LINE_HEIGHT}px`,
         width: textBoxWidth,
         fontWeight: CAPTIONS_FONT_WEIGHT,
         fontSize: CAPTIONS_FONT_SIZE,
         marginTop: BASE_SIZE * 0.5,
        }}
       >
        <PaginatedCaptions
         captions={captions}
         startFrame={audioOffsetInFrames}
         endFrame={audioOffsetInFrames + durationInFrames}
         linesPerPage={LINES_PER_PAGE}
         subtitlesTextColor={captionsTextColor}
         onlyDisplayCurrentSentence={onlyDisplayCurrentSentence}
         textBoxWidth={textBoxWidth}
        />
       </div>
      </WaitForFonts>
      {currentFrame > 0 && (
       <Oscilloscope
        waveColor={visualizer.color}
        padding={visualizer.padding}
        audioSrc={audioFileUrl}
        numberOfSamples={baseNumberOfSamples}
        windowInSeconds={visualizer.windowInSeconds}
        posterization={visualizer.posterization}
        amplitude={visualizer.amplitude}
       />
      )}
     </div>
    )}
   </Sequence>
  </AbsoluteFill>
 );
};
