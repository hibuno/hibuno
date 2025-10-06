import React, { useMemo, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { Caption } from "@remotion/captions";
import { Easing, interpolate } from "remotion";
import { msToFrame } from "../helpers/ms-to-frame";
import { fillTextBox } from "@remotion/layout-utils";
import { CAPTIONS_FONT_SIZE, LINES_PER_PAGE } from "./constants";
import { FONT_FAMILY } from "./FontManager";

// Word component for individual caption words
export const Word: React.FC<{
  readonly item: Caption;
  readonly frame: number;
  readonly transcriptionColor: string;
}> = ({ item, frame, transcriptionColor }) => {
  const opacity = interpolate(
    frame,
    [msToFrame(item.startMs), msToFrame(item.startMs) + 15],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const translateY = interpolate(
    frame,
    [msToFrame(item.startMs), msToFrame(item.startMs) + 10],
    [0.25, 0],
    {
      easing: Easing.out(Easing.quad),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const style: React.CSSProperties = useMemo(() => {
    return {
      display: "inline-block",
      whiteSpace: "pre",
      opacity,
      translate: `0 ${translateY}em`,
      color: transcriptionColor,
    };
  }, [opacity, transcriptionColor, translateY]);

  return <span style={style}>{item.text}</span>;
};

// Helper function to get sentence to display
export const getSentenceToDisplay = ({
  windowedFrameSubs,
  onlyDisplayCurrentSentence,
  frame,
}: {
  windowedFrameSubs: Caption[];
  onlyDisplayCurrentSentence: boolean;
  frame: number;
}) => {
  // If we don't want to only display the current sentence, return all the words
  if (!onlyDisplayCurrentSentence) return windowedFrameSubs;

  const indexOfCurrentSentence =
    windowedFrameSubs.findLastIndex((w, i) => {
      const nextWord = windowedFrameSubs[i + 1];

      return (
        nextWord &&
        (w.text.endsWith("?") ||
          w.text.endsWith(".") ||
          w.text.endsWith("!")) &&
        msToFrame(nextWord.startMs) < frame
      );
    }) + 1;

  return windowedFrameSubs.slice(indexOfCurrentSentence);
};

// Helper function for text layout
export const layoutText = ({
  captions,
  textBoxWidth,
  fontFamily,
  fontSize,
}: {
  captions: Caption[];
  textBoxWidth: number;
  fontFamily: string;
  fontSize: number;
}) => {
  const box = fillTextBox({
    maxBoxWidth: textBoxWidth,
    maxLines: 1_000,
  });

  const lines: Caption[][] = [[]];

  for (const caption of captions) {
    const isFirstCaption = captions.indexOf(caption) === 0;
    const { newLine } = box.add({
      text: isFirstCaption ? caption.text.trimStart() : caption.text,
      fontFamily,
      fontSize,
    });

    if (newLine) {
      lines.push([]);
    }

    const newCaption = { ...caption };
    if (newLine || isFirstCaption) {
      newCaption.text = newCaption.text.trimStart();
      box.add({
        text: " ".repeat(caption.text.length - newCaption.text.length),
        fontFamily,
        fontSize,
      });
    }

    lines[lines.length - 1].push(newCaption);
  }

  return lines;
};

// Helper function to filter currently displayed lines
export const filterCurrentlyDisplayedLines = ({
  lines,
  frame,
}: {
  lines: Caption[][];
  frame: number;
}) => {
  const currentlyActiveLines = lines.filter((line) => {
    return line.some((item) => {
      return msToFrame(item.startMs) < frame;
    });
  });

  // Return the last 4 lines
  return currentlyActiveLines.slice(-LINES_PER_PAGE);
};

// Helper function for windowed frame captions
const useWindowedFrameCaptions = ({
  captions,
  windowStart,
  windowEnd,
}: {
  captions: Caption[];
  windowStart: number;
  windowEnd: number;
}) => {
  return useMemo(() => {
    return captions.filter(({ startMs, endMs }) => {
      return msToFrame(startMs) >= windowStart && msToFrame(endMs) <= windowEnd;
    });
  }, [captions, windowEnd, windowStart]);
};

// Main PaginatedCaptions component
export const PaginatedCaptions: React.FC<{
  readonly captions: Caption[];
  readonly startFrame: number;
  readonly endFrame: number;
  readonly linesPerPage: number;
  readonly subtitlesTextColor: string;
  readonly onlyDisplayCurrentSentence: boolean;
  readonly textBoxWidth: number;
}> = ({
  startFrame,
  endFrame,
  captions,
  subtitlesTextColor: transcriptionColor,
  onlyDisplayCurrentSentence,
  textBoxWidth,
}) => {
  const frame = useCurrentFrame();
  const windowRef = useRef<HTMLDivElement>(null);
  const windowedFrameSubs = useWindowedFrameCaptions({
    captions,
    windowStart: startFrame,
    windowEnd: endFrame,
  });

  const currentSentence = useMemo(() => {
    return getSentenceToDisplay({
      frame,
      onlyDisplayCurrentSentence,
      windowedFrameSubs,
    });
  }, [frame, onlyDisplayCurrentSentence, windowedFrameSubs]);

  const lines = useMemo(() => {
    return layoutText({
      captions: currentSentence,
      textBoxWidth,
      fontFamily: FONT_FAMILY,
      fontSize: CAPTIONS_FONT_SIZE,
    });
  }, [currentSentence, textBoxWidth]);

  const currentlyShownLines = filterCurrentlyDisplayedLines({
    lines,
    frame,
  });

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        paddingBottom: "20px",
      }}
    >
      <div ref={windowRef}>
        {currentlyShownLines.map((line) => (
          <div key={line.map((item) => item.text).join(" ")}>
            {line.map((item) => (
              <span
                key={item.startMs + item.endMs}
                id={String(item.startMs + item.endMs)}
              >
                <Word
                  frame={frame}
                  item={item}
                  transcriptionColor={transcriptionColor}
                />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
