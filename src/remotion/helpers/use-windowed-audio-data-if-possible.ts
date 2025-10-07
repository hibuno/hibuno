import {
	type UseWindowedAudioDataReturnValue,
	useAudioData,
	useWindowedAudioData,
} from "@remotion/media-utils";
import { useState } from "react";

export const useWindowedAudioDataIfPossible = ({
	src,
	frame,
	fps,
	windowInSeconds,
}: {
	src: string;
	frame: number;
	fps: number;
	windowInSeconds: number;
}): UseWindowedAudioDataReturnValue => {
	const [initialSrc] = useState(src);
	if (initialSrc !== src) {
		throw new Error(
			"`src` cannot be changed dynamically - re-mount the component instead by setting a `key={src}`",
		);
	}

	// Call hooks unconditionally at the top level
	const windowedData = useWindowedAudioData({
		src,
		frame,
		fps,
		windowInSeconds,
	});
	const audioData = useAudioData(src);

	// Return based on file type
	if (src.endsWith(".wav")) {
		return windowedData;
	}

	return { audioData, dataOffsetInSeconds: 0 };
};
