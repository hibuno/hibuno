/**
 * File validation and sanitization utilities
 */

// Allowed MIME types for file uploads
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
] as const;

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/x-tar',
  'application/gzip',
  'text/csv',
  'application/json',
  'application/xml',
  'text/xml',
] as const;

export const ALLOWED_FILE_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES] as const;

// File size limits (in bytes)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

// File extension to MIME type mapping
const EXTENSION_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
  zip: 'application/zip',
  rar: 'application/x-rar-compressed',
  '7z': 'application/x-7z-compressed',
  tar: 'application/x-tar',
  gz: 'application/gzip',
  csv: 'text/csv',
  json: 'application/json',
  xml: 'application/xml',
};

/**
 * Sanitizes a filename by removing potentially dangerous characters
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and null bytes
  let sanitized = filename.replace(/[\/\\:\0]/g, '');
  
  // Remove leading dots to prevent hidden files
  sanitized = sanitized.replace(/^\.+/, '');
  
  // Replace spaces with hyphens
  sanitized = sanitized.replace(/\s+/g, '-');
  
  // Remove any characters that aren't alphanumeric, hyphens, underscores, or dots
  sanitized = sanitized.replace(/[^a-zA-Z0-9\-_.]/g, '');
  
  // Limit length to 255 characters
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop() || '';
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
    sanitized = nameWithoutExt.substring(0, 255 - ext.length - 1) + '.' + ext;
  }
  
  // Ensure filename is not empty
  if (!sanitized || sanitized === '.') {
    sanitized = 'file';
  }
  
  return sanitized;
}

/**
 * Validates file type based on MIME type and extension
 */
export function validateFileType(file: File): { valid: boolean; error?: string } {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  const extension = fileName.split('.').pop() || '';
  
  // Check if MIME type is allowed
  const isMimeAllowed = ALLOWED_FILE_TYPES.includes(fileType as any);
  
  // Check if extension matches MIME type
  const expectedMime = EXTENSION_TO_MIME[extension];
  const isExtensionValid = expectedMime && (expectedMime === fileType || fileType === '');
  
  if (!isMimeAllowed && !isExtensionValid) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: images (JPEG, PNG, GIF, WebP, SVG) and documents (PDF, DOCX, XLSX, etc.)`,
    };
  }
  
  // Additional check: if MIME type is empty but extension is valid, it's suspicious
  if (!fileType && !isExtensionValid) {
    return {
      valid: false,
      error: 'Unable to determine file type',
    };
  }
  
  return { valid: true };
}

/**
 * Validates file size
 */
export function validateFileSize(file: File, maxSize: number = MAX_FILE_SIZE): { valid: boolean; error?: string } {
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
    };
  }
  
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty',
    };
  }
  
  return { valid: true };
}

/**
 * Comprehensive file validation
 */
export function validateFile(file: File, maxSize: number = MAX_FILE_SIZE): { valid: boolean; error?: string } {
  // Validate file type
  const typeValidation = validateFileType(file);
  if (!typeValidation.valid) {
    return typeValidation;
  }
  
  // Validate file size
  const sizeValidation = validateFileSize(file, maxSize);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }
  
  return { valid: true };
}

/**
 * Checks if a file is an image
 */
export function isImageFile(file: File): boolean {
  return ALLOWED_IMAGE_TYPES.includes(file.type as any);
}

/**
 * Gets a safe file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length > 1) {
    return parts.pop()?.toLowerCase() || '';
  }
  return '';
}

/**
 * Generates a unique filename with timestamp
 */
export function generateUniqueFilename(originalFilename: string, prefix: string = ''): string {
  const sanitized = sanitizeFilename(originalFilename);
  const extension = getFileExtension(sanitized);
  const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.')) || sanitized;
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  const prefixPart = prefix ? `${prefix}-` : '';
  return `${prefixPart}${nameWithoutExt}-${timestamp}-${random}.${extension}`;
}
