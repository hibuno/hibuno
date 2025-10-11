import {
  createSmoothSvgPath,
  visualizeAudioWaveform,
} from "@remotion/media-utils";
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { BASE_SIZE } from "../helpers/constants";
import { useWindowedAudioDataIfPossible } from "../helpers/use-windowed-audio-data-if-possible";

// AudioVizContainer component
export const AudioVizContainer: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const containerStyle: React.CSSProperties = React.useMemo(
    () => ({
      display: "flex",
      flexDirection: "row",
      height: `${BASE_SIZE * 4}px`,
      alignItems: "center",
      justifyContent: "center",
      gap: `${BASE_SIZE * 0.25}px`,
      marginTop: `${BASE_SIZE}px`,
    }),
    [],
  );

  return <div style={containerStyle}>{children}</div>;
};

// OscilloscopeContainer component
const OscilloscopeContainer: React.FC<{
  children?: React.ReactNode;
  padding: number;
}> = ({ children, padding }) => {
  const { width } = useVideoConfig();

  return (
    <svg
      viewBox={`0 0 ${width} ${120}`}
      style={{
        overflow: "visible",
        height: 120,
        marginTop: 40,
        marginBottom: 40,
      }}
      width={width - padding * 2}
      height={120}
    >
      {children}
    </svg>
  );
};

// Oscilloscope visualizer component
export const Oscilloscope: React.FC<{
  audioSrc: string;
  padding: number;
  numberOfSamples: number;
  windowInSeconds: number;
  posterization: number;
  amplitude: number;
  waveColor: string;
}> = ({
  padding,
  numberOfSamples,
  windowInSeconds,
  posterization,
  amplitude,
  audioSrc,
  waveColor,
}) => {
  const { width, fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const posterized = Math.round(frame / posterization) * posterization;

  const { audioData, dataOffsetInSeconds } = useWindowedAudioDataIfPossible({
    fps,
    frame,
    src: audioSrc,
    windowInSeconds: 10,
  });

  if (!audioData) {
    return <OscilloscopeContainer padding={padding} />;
  }

  const waveform = visualizeAudioWaveform({
    fps,
    frame: posterized,
    audioData: audioData,
    numberOfSamples,
    windowInSeconds: windowInSeconds,
    channel: 0,
    dataOffsetInSeconds: dataOffsetInSeconds,
  });

  const p = createSmoothSvgPath({
    points: waveform.map((y, i) => {
      return {
        x: (i / (waveform.length - 1)) * width,
        y: 60 + y * 60 * amplitude,
      };
    }),
  });

  return (
    <OscilloscopeContainer padding={padding}>
      <path
        strokeLinecap="round"
        fill="none"
        stroke={waveColor}
        strokeWidth={10}
        d={p}
      />
    </OscilloscopeContainer>
  );
};
