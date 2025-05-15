export interface AvifEncodeOptions {
	quality?: number;
	effort?: number;
}

export interface JpegEncodeOptions {
	quality?: number;
}

export interface JxlEncodeOptions {
	quality?: number;
}

export interface WebpEncodeOptions {
	quality?: number;
}

export interface ImageFile {
	id: string;
	file: File;
	preview?: string;
	status: 'pending' | 'queued' | 'processing' | 'complete' | 'error';
	error?: string;
	originalSize: number;
	compressedSize?: number;
	outputType?: OutputType;
	blob?: Blob;
}

export type OutputType = 'avif' | 'jpeg' | 'jxl' | 'png' | 'webp';

export interface FormatQualitySettings {
	avif: number;
	jpeg: number;
	jxl: number;
	webp: number;
}

export interface CompressionOptions {
	quality: number;
}