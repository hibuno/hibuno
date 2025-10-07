import "./index.css";
import { parseMedia } from "@remotion/media-parser";
import { Composition, staticFile } from "remotion";
import { Video } from "./Video/Main";
import { videoSchema } from "./helpers/schema";
import { getRandomBackgroundSound } from "./helpers/background-sound";
import { getSubtitles } from "./helpers/fetch-captions";
import { FPS } from "./helpers/ms-to-frame";

export interface RemotionRootProps {
 mode?: "video";
 audioFileUrl?: string;
 backgroundSoundUrl?: string;
 backgroundSoundVolume?: number;
 mediaUrls?: string[];
 backgroundColor?: string;
 titleText?: string;
 titleColor?: string;
 titleFontSize?: number;
 captionsTextColor?: string;
 onlyDisplayCurrentSentence?: boolean;
 transitionDurationInSeconds?: number;
 mediaFitMode?: "cover" | "contain" | "fill";
 audioOffsetInSeconds?: number;
}

export const RemotionRoot: React.FC<RemotionRootProps> = (props) => {
 const {
  mode = "video",
  audioFileUrl = staticFile("audio.wav"),
  backgroundSoundUrl = getRandomBackgroundSound(),
  backgroundSoundVolume = 0.15,
  mediaUrls = [
   staticFile("sample-image-1.svg"),
   staticFile("sample-image-2.svg"),
   staticFile("sample-image-3.svg"),
  ],
  backgroundColor = "#0a0a0a",
  titleText = "Professional Content Creation",
  titleColor = "#FFFFFF",
  titleFontSize = 52,
  captionsTextColor = "#F8F9FA",
  onlyDisplayCurrentSentence = true,
  transitionDurationInSeconds = 0.8,
  mediaFitMode = "cover",
  audioOffsetInSeconds = 0,
 } = props;

 return (
  <Composition
   id="Video"
   component={Video}
   width={1080}
   height={1920}
   schema={videoSchema}
   defaultProps={{
    // mode settings
    mode: mode as "video",
    // audio settings
    audioOffsetInSeconds,
    audioFileUrl,
    // background sound settings
    backgroundSoundUrl,
    backgroundSoundVolume,
    // media settings for video mode
    mediaUrls,
    // visual settings
    backgroundColor,
    titleText,
    titleColor,
    titleFontSize,
    // captions settings
    captionsFileName: staticFile("captions.json"),
    captionsTextColor,
    onlyDisplayCurrentSentence,
    // animation settings
    transitionDurationInSeconds,
    mediaFitMode: mediaFitMode as "cover" | "contain" | "fill",
   }}
   // Determine the length of the video based on the duration of the audio file
   calculateMetadata={async ({ props }) => {
    let captions = null;
    if (props.captionsFileName) {
     captions = await getSubtitles(props.captionsFileName);
    }

    const { slowDurationInSeconds } = await parseMedia({
     src: props.audioFileUrl,
     acknowledgeRemotionLicense: true,
     fields: {
      slowDurationInSeconds: true,
     },
    });

    return {
     durationInFrames: Math.floor(
      (slowDurationInSeconds - props.audioOffsetInSeconds) * FPS
     ),
     props: {
      ...props,
      captions,
     },
     fps: FPS,
    };
   }}
  />
 );
};
