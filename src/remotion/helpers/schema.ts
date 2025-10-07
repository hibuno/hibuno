import type { Caption } from "@remotion/captions";
import { zColor } from "@remotion/zod-types";
import { z } from "zod";

const baseVisualizerSchema = z.object({
	color: zColor(),
	numberOfSamples: z.enum(["32", "64", "128", "256", "512"]),
});

const spectrumVisualizerSchema = baseVisualizerSchema.extend({
	type: z.literal("spectrum"),
	linesToDisplay: z.number().int().min(0).default(65),
	freqRangeStartIndex: z.number().int().min(0).default(0),
	mirrorWave: z.boolean(),
});

const oscilloscopeVisualizerSchema = baseVisualizerSchema.extend({
	type: z.literal("oscilloscope"),
	windowInSeconds: z.number().min(0.1).default(0.1),
	posterization: z.number().int().min(0.1).default(3),
	amplitude: z.number().int().min(0.1).default(4),
	padding: z.number().int().min(0).default(50),
});

const visualizerSchema = z.discriminatedUnion("type", [
	spectrumVisualizerSchema,
	oscilloscopeVisualizerSchema,
]);

export const videoSchema = z.object({
	// mode selection (keeping for backward compatibility but defaulting to video)
	mode: z.enum(["video"]).default("video"),

	// visualizer settings (for video mode - optional for backward compatibility)
	visualizer: visualizerSchema.optional(),

	// media content
	coverImageUrl: z.string().optional(), // for backward compatibility
	mediaUrls: z.array(z.string()).default([]), // for video mode - images/videos

	// text settings
	titleText: z.string(),
	titleColor: zColor(),
	titleFontSize: z.number().min(20).max(100).default(48),

	// layout settings
	backgroundColor: zColor().default("#000000"),

	// captions settings
	captionsFileName: z.string().optional(),
	captionsTextColor: zColor(),
	onlyDisplayCurrentSentence: z.boolean(),

	// animation settings
	transitionDurationInSeconds: z.number().min(0.1).max(2).default(0.5),
	mediaFitMode: z.enum(["cover", "contain", "fill"]).default("cover"),

	// audio settings
	audioFileUrl: z.string(),
	audioOffsetInSeconds: z.number().min(0),

	// background sound settings
	backgroundSoundUrl: z.string().optional(),
	backgroundSoundVolume: z.number().min(0).max(1).default(0.15),
});

export type VideoCompositionSchemaType = z.infer<typeof videoSchema> & {
	captions?: Caption[] | null;
};
