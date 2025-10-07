import {
 createSmoothSvgPath,
 visualizeAudio,
 visualizeAudioWaveform,
} from "@remotion/media-utils";
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { useWindowedAudioDataIfPossible } from "../helpers/use-windowed-audio-data-if-possible";
import { BASE_SIZE } from "../helpers/constants";

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
  []
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

// Bar component for spectrum visualizer
const Bar: React.FC<{ height: number; color: string }> = ({
 height,
 color,
}) => {
 const barStyle: React.CSSProperties = {
  borderRadius: `${BASE_SIZE * 0.25}px`,
  width: `${BASE_SIZE * 0.5}px`,
  height: `${height}px`,
  backgroundColor: color,
 };

 return <div style={barStyle} />;
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

// Spectrum visualizer component
export const Spectrum: React.FC<{
 readonly barColor: string;
 readonly numberOfSamples: number;
 readonly freqRangeStartIndex: number;
 readonly waveLinesToDisplay: number;
 readonly mirrorWave: boolean;
 readonly audioSrc: string;
}> = ({
 barColor,
 numberOfSamples,
 freqRangeStartIndex,
 waveLinesToDisplay,
 mirrorWave,
 audioSrc,
}) => {
 const frame = useCurrentFrame();
 const { fps } = useVideoConfig();

 const { audioData, dataOffsetInSeconds } = useWindowedAudioDataIfPossible({
  src: audioSrc,
  fps,
  frame,
  windowInSeconds: 10,
 });

 if (!audioData) {
  return <AudioVizContainer />;
 }

 const frequencyData = visualizeAudio({
  fps,
  frame,
  audioData,
  numberOfSamples,
  optimizeFor: "speed",
  dataOffsetInSeconds,
 });

 // Pick the low values because they look nicer than high values
 const frequencyDataSubset = frequencyData.slice(
  freqRangeStartIndex,
  freqRangeStartIndex +
   (mirrorWave ? Math.round(waveLinesToDisplay / 2) : waveLinesToDisplay)
 );

 const frequenciesToDisplay = mirrorWave
  ? [...frequencyDataSubset.slice(1).reverse(), ...frequencyDataSubset]
  : frequencyDataSubset;

 return (
  <AudioVizContainer>
   {frequenciesToDisplay.map((v, i) => {
    return <Bar key={i} height={300 * Math.sqrt(v)} color={barColor} />;
   })}
  </AudioVizContainer>
 );
};
