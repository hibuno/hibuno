import "./index.css";
import { Composition, staticFile } from "remotion";
import { Audiogram } from "./Audiogram/Main";
import { audiogramSchema } from "./Audiogram/schema";
import { getSubtitles } from "./helpers/fetch-captions";
import { FPS } from "./helpers/ms-to-frame";
import { parseMedia } from "@remotion/media-parser";
import { getRandomBackgroundSound } from "./helpers/background-sound";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ShortsVideo"
        component={Audiogram}
        width={1080}
        height={1920}
        schema={audiogramSchema}
        defaultProps={{
          // mode settings
          mode: "shorts" as const,
          // audio settings
          audioOffsetInSeconds: 0,
          audioFileUrl: staticFile("audio.wav"),
          // background sound settings
          backgroundSoundUrl: getRandomBackgroundSound(),
          backgroundSoundVolume: 0.15,
          // media settings for shorts mode
          mediaUrls: [
            staticFile("sample-image-1.svg"),
            staticFile("sample-image-2.svg"),
            staticFile("sample-image-3.svg"),
          ],
          // visual settings
          backgroundColor: "#0a0a0a",
          titleText: "Professional Content Creation",
          titleColor: "#FFFFFF",
          titleFontSize: 52,
          // captions settings
          captionsFileName: staticFile("captions.json"),
          captionsTextColor: "#F8F9FA",
          onlyDisplayCurrentSentence: true,
          // animation settings
          transitionDurationInSeconds: 0.8,
          mediaFitMode: "cover" as const,
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
              (slowDurationInSeconds - props.audioOffsetInSeconds) * FPS,
            ),
            props: {
              ...props,
              captions,
            },
            fps: FPS,
          };
        }}
      />
    </>
  );
};
