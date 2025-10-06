import React from "react";
import { 
  AbsoluteFill, 
  Audio, 
  Img, 
  Video,
  Sequence, 
  useVideoConfig, 
  useCurrentFrame,
  interpolate,
  Easing 
} from "remotion";

import { PaginatedCaptions } from "./CaptionsManager";
import { Spectrum, Oscilloscope } from "./AudioVisualizers";
import {
  BASE_SIZE,
  CAPTIONS_FONT_SIZE,
  CAPTIONS_FONT_WEIGHT,
  LINE_HEIGHT,
  LINES_PER_PAGE,
} from "./constants";
import { FONT_FAMILY } from "./FontManager";
import { WaitForFonts } from "./FontManager";
import { AudiogramCompositionSchemaType } from "./schema";

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
        <Video
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
          <Video
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
            background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.6) 100%)",
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
              background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
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
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)",
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

export const Audiogram: React.FC<AudiogramCompositionSchemaType> = ({
  mode = "audiogram",
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
  backgroundSoundVolume = 0.15,
  captions,
}) => {
  const { durationInFrames, fps, width, height } = useVideoConfig();

  const audioOffsetInFrames = Math.round(audioOffsetInSeconds * fps);
  const transitionFrames = Math.round(transitionDurationInSeconds * fps);

  // Render original audiogram mode
  if (mode === "audiogram") {
    if (!visualizer || !coverImageUrl) {
      throw new Error("Audiogram mode requires visualizer and coverImageUrl");
    }

    if (!captions) {
      throw new Error("Subtitles should have been provided through calculateMetadata");
    }

    const baseNumberOfSamples = Number(visualizer.numberOfSamples);
    const textBoxWidth = width - BASE_SIZE * 2;

    return (
      <AbsoluteFill>
        <Sequence from={-audioOffsetInFrames}>
          <Audio pauseWhenBuffering src={audioFileUrl} />
          {/* Background sound with reduced volume */}
          {backgroundSoundUrl && (
            <Audio 
              pauseWhenBuffering 
              src={backgroundSoundUrl} 
              volume={backgroundSoundVolume}
            />
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
              color: "white",
              padding: "48px",
              backgroundColor,
              fontFamily: FONT_FAMILY,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Img
                style={{
                  borderRadius: "6px",
                  maxHeight: "250px",
                }}
                src={coverImageUrl}
              />
              <div
                style={{
                  marginLeft: "48px",
                  lineHeight: "1.25",
                  fontWeight: 800,
                  color: titleColor,
                  fontSize: `${titleFontSize}px`,
                }}
              >
                {titleText}
              </div>
            </div>
            <div>
              {visualizer.type === "oscilloscope" ? (
                <Oscilloscope
                  waveColor={visualizer.color}
                  padding={visualizer.padding}
                  audioSrc={audioFileUrl}
                  numberOfSamples={baseNumberOfSamples}
                  windowInSeconds={visualizer.windowInSeconds}
                  posterization={visualizer.posterization}
                  amplitude={visualizer.amplitude}
                />
              ) : visualizer.type === "spectrum" ? (
                <Spectrum
                  barColor={visualizer.color}
                  audioSrc={audioFileUrl}
                  mirrorWave={visualizer.mirrorWave}
                  numberOfSamples={baseNumberOfSamples * 4}
                  freqRangeStartIndex={visualizer.freqRangeStartIndex}
                  waveLinesToDisplay={visualizer.linesToDisplay}
                />
              ) : null}
            </div>
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
          </div>
        </Sequence>
      </AbsoluteFill>
    );
  }

  // Render shorts video mode
  if (mode === "shorts") {
    if (!mediaUrls || mediaUrls.length === 0) {
      throw new Error("Shorts mode requires at least one media URL");
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
      const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv'];
      return videoExtensions.some(ext => url.toLowerCase().includes(ext));
    };

    return (
      <AbsoluteFill>
        <Sequence from={-audioOffsetInFrames}>
        <Audio pauseWhenBuffering src={audioFileUrl} />
        {/* Background sound with reduced volume */}
        {backgroundSoundUrl && (
          <Audio 
            pauseWhenBuffering 
            src={backgroundSoundUrl} 
            volume={backgroundSoundVolume}
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
            mediaUrl={mediaUrls[0]}
            titleText={titleText}
            titleColor={titleColor}
            titleFontSize={titleFontSize}
            backgroundColor={backgroundColor}
            isVideo={isVideoFile(mediaUrls[0])}
          />

          {/* Media slides (starting from frame 1) */}
          {mediaUrls.map((mediaUrl, index) => (
            <MediaSlide
              key={index}
              src={mediaUrl}
              startFrame={mediaTimings[index].startFrame}
              endFrame={mediaTimings[index].endFrame}
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
                    background: "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)",
                    backdropFilter: "blur(15px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "20px",
                    padding: "24px 32px",
                    textAlign: "center",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      letterSpacing: "0.01em",
                      lineHeight: 1.4,
                    }}
                  >
                    <PaginatedCaptions
                      captions={captions}
                      startFrame={audioOffsetInFrames}
                      endFrame={audioOffsetInFrames + durationInFrames}
                      linesPerPage={2}
                      subtitlesTextColor={captionsTextColor}
                      onlyDisplayCurrentSentence={onlyDisplayCurrentSentence}
                      textBoxWidth={width - 100}
                    />
                  </div>
                </div>
              </WaitForFonts>
            </div>
          )}
        </Sequence>
      </AbsoluteFill>
    );
  }

  return null;
};
