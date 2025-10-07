import type { Caption } from "@remotion/captions";
import { zColor } from "@remotion/zod-types";
import { z } from "zod";

const baseVisualizerSchema = z.object({
	color: zColor(),
	numberOfSamples: z.enum(["32", "64", "128", "256", "512"]),
});

const oscilloscopeVisualizerSchema = baseVisualizerSchema.extend({
	windowInSeconds: z.number().min(0.1).default(0.1),
	posterization: z.number().int().min(0.1).default(3),
	amplitude: z.number().int().min(0.1).default(4),
	padding: z.number().int().min(0).default(50),
});

export const videoSchema = z.object({
	// visualizer settings
	visualizer: oscilloscopeVisualizerSchema,

	// media content
	coverImageUrl: z.string(), // for backward compatibility
	mediaUrls: z.array(z.string()).default([]), // images/videos

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
});

export type VideoCompositionSchemaType = z.infer<typeof videoSchema> & {
	captions?: Caption[] | null;
};
