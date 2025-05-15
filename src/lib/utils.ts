import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ImageFile, FormatQualitySettings, OutputType, CompressionOptions } from './types';
interface ResizeOptions {
	width?: number;
	height?: number;
	maintainAspectRatio?: boolean;
}

export function calculateDimensions(
	originalWidth: number,
	originalHeight: number,
	options: ResizeOptions
): { width: number; height: number } {
	const { width: targetWidth = 0, height: targetHeight = 0, maintainAspectRatio = true } = options;

	if (!targetWidth && !targetHeight) {
		return { width: originalWidth, height: originalHeight };
	}

	let finalWidth = targetWidth || originalWidth;
	let finalHeight = targetHeight || originalHeight;

	if (maintainAspectRatio) {
		const aspectRatio = originalWidth / originalHeight;

		if (targetWidth && !targetHeight) {
			finalWidth = targetWidth;
			finalHeight = Math.round(targetWidth / aspectRatio);
		} else if (!targetWidth && targetHeight) {
			finalHeight = targetHeight;
			finalWidth = Math.round(targetHeight * aspectRatio);
		} else {
			const widthRatio = targetWidth / originalWidth;
			const heightRatio = targetHeight / originalHeight;
			const ratio = Math.min(widthRatio, heightRatio);

			finalWidth = Math.round(originalWidth * ratio);
			finalHeight = Math.round(originalHeight * ratio);
		}
	}

	return {
		width: Math.max(1, finalWidth),
		height: Math.max(1, finalHeight),
	};
}

export function resizeImage(imageData: ImageData, options: ResizeOptions): ImageData {
	const sourceCanvas = imageDataToCanvas(imageData);

	const { width, height } = calculateDimensions(
		imageData.width,
		imageData.height,
		options
	);

	const destCanvas = createCanvas(width, height);
	const ctx = destCanvas.getContext('2d')!;

	// Use better image scaling algorithm
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = 'high';

	ctx.drawImage(sourceCanvas, 0, 0, width, height);

	return ctx.getImageData(0, 0, width, height);
}
// Cache for loaded modules
const moduleCache: Record<string, unknown> = {};

// Lazy load modules only when needed
async function getModule(format: OutputType): Promise<unknown> {
	if (moduleCache[format]) {
		return moduleCache[format];
	}

	try {
		let moduleInstance;
		switch (format) {
			case 'avif':
				moduleInstance = await import('@jsquash/avif');
				break;
			case 'jpeg':
				moduleInstance = await import('@jsquash/jpeg');
				break;
			case 'jxl':
				moduleInstance = await import('@jsquash/jxl');
				break;
			case 'png':
				moduleInstance = await import('@jsquash/png');
				break;
			case 'webp':
				moduleInstance = await import('@jsquash/webp');
				break;
			default:
				throw new Error(`Unsupported format: ${format}`);
		}
		moduleCache[format] = moduleInstance;
		return moduleInstance;
	} catch (error) {
		console.error(`Failed to load module for ${format}:`, error);
		throw new Error(`Failed to initialize ${format} support`);
	}
}

export async function decode(sourceType: string, fileBuffer: ArrayBuffer): Promise<ImageData | null> {
	try {
		const normalizedType = sourceType.toLowerCase();
		let format: OutputType;

		// Map source type to format
		if (normalizedType === 'jpg' || normalizedType === 'jpeg') {
			format = 'jpeg';
		} else if (['avif', 'png', 'webp', 'jxl'].includes(normalizedType)) {
			format = normalizedType as OutputType;
		} else {
			throw new Error(`Unsupported source type: ${sourceType}`);
		}

		// Load the module dynamically
		const moduleInstance = await getModule(format);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const typedModule = moduleInstance as any;
		return await typedModule.decode(fileBuffer);
	} catch (error) {
		console.error(`Failed to decode ${sourceType} image:`, error);
		throw new Error(`Failed to decode ${sourceType} image`);
	}
}

export async function encode(outputType: OutputType, imageData: ImageData, options: CompressionOptions): Promise<ArrayBuffer> {
	try {
		// Load the module dynamically
		const moduleInstance = await getModule(outputType);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const typedModule = moduleInstance as any;

		switch (outputType) {
			case 'avif': {
				const avifOptions = {
					quality: options.quality,
					effort: 4 // Medium encoding effort
				};

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				return await (typedModule as any).encode(imageData, avifOptions);
			}
			case 'jpeg': {
				const jpegOptions = {
					quality: options.quality
				};

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				return await (typedModule as any).encode(imageData, jpegOptions);
			}
			case 'jxl': {
				const jxlOptions = {
					quality: options.quality
				};

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				return await (typedModule as any).encode(imageData, jxlOptions);
			}
			case 'png':

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				return await (typedModule as any).encode(imageData);
			case 'webp': {
				const webpOptions = {
					quality: options.quality
				};

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				return await (typedModule as any).encode(imageData, webpOptions);
			}
			default:
				throw new Error(`Unsupported output type: ${outputType}`);
		}
	} catch (error) {
		console.error(`Failed to encode to ${outputType}:`, error);
		throw new Error(`Failed to encode to ${outputType}`);
	}
}

export function getFileType(file: File): string {
	if (file.name.toLowerCase().endsWith('jxl')) return 'jxl';
	const type = file.type.split('/')[1];
	return type === 'jpeg' ? 'jpg' : type;
}

export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export const DEFAULT_QUALITY_SETTINGS: FormatQualitySettings = {
	avif: 50,
	jpeg: 75,
	jxl: 75,
	webp: 75,
};

export function getDefaultQualityForFormat(format: keyof FormatQualitySettings): number {
	return DEFAULT_QUALITY_SETTINGS[format];
}
export function downloadImage(image: ImageFile) {
	if (!image.blob || !image.outputType) return;

	const link = document.createElement('a');
	link.href = URL.createObjectURL(image.blob);
	link.download = `${image.file.name.split('.')[0]}.${image.outputType}`;
	link.click();
	URL.revokeObjectURL(link.href);
}

export function downloadAllImages(images: ImageFile[]) {
	images
		.filter(image => image.status === 'complete' && image.blob)
		.forEach(downloadImage);
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}
// Canvas utility functions
export function createCanvas(width: number, height: number): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	return canvas;
}

export function imageDataToCanvas(imageData: ImageData): HTMLCanvasElement {
	const canvas = createCanvas(imageData.width, imageData.height);
	const ctx = canvas.getContext('2d')!;
	ctx.putImageData(imageData, 0, 0);
	return canvas;
}

export function canvasToImageData(canvas: HTMLCanvasElement): ImageData {
	const ctx = canvas.getContext('2d')!;
	return ctx.getImageData(0, 0, canvas.width, canvas.height);
}