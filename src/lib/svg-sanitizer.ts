/**
 * SVG sanitization utilities using DOMPurify
 */

import * as DOMPurifyModule from "dompurify";

// Handle both ESM and CommonJS imports
const DOMPurify =
  typeof DOMPurifyModule === "function"
    ? DOMPurifyModule
    : (DOMPurifyModule as any).default || DOMPurifyModule;

/**
 * Configuration for DOMPurify when sanitizing SVG content
 */
const SVG_SANITIZE_CONFIG = {
  USE_PROFILES: { svg: true, svgFilters: true },
  ADD_TAGS: ["use"], // Allow <use> tag for SVG sprites
  ADD_ATTR: ["target"], // Allow target attribute for links
  FORBID_TAGS: [
    "script",
    "iframe",
    "object",
    "embed",
    "link",
    "style",
    "form",
    "input",
    "textarea",
    "button",
  ],
  FORBID_ATTR: [
    "onerror",
    "onload",
    "onclick",
    "onmouseover",
    "onmouseout",
    "onmousemove",
    "onmouseenter",
    "onmouseleave",
    "onfocus",
    "onblur",
    "onchange",
    "oninput",
    "onsubmit",
    "onreset",
    "onselect",
    "onkeydown",
    "onkeyup",
    "onkeypress",
  ],
  ALLOW_DATA_ATTR: false, // Disallow data-* attributes that could contain scripts
  ALLOW_UNKNOWN_PROTOCOLS: false, // Only allow known safe protocols
  SAFE_FOR_TEMPLATES: true, // Escape template literals
};

/**
 * Sanitizes SVG content to remove potentially malicious code
 * @param svgContent - The SVG content as a string
 * @returns Sanitized SVG content
 */
export function sanitizeSVG(svgContent: string): string {
  if (!svgContent || typeof svgContent !== "string") {
    return "";
  }

  try {
    // Sanitize the SVG content
    const sanitized = DOMPurify.sanitize(svgContent, SVG_SANITIZE_CONFIG);

    // Additional check: ensure the result is still valid SVG
    if (!sanitized || !sanitized.includes("<svg")) {
      console.warn("SVG sanitization resulted in invalid SVG");
      return "";
    }

    return sanitized;
  } catch (error) {
    console.error("Error sanitizing SVG:", error);
    return "";
  }
}

/**
 * Validates that a string contains valid SVG content
 * @param svgContent - The SVG content to validate
 * @returns True if valid SVG, false otherwise
 */
export function isValidSVG(svgContent: string): boolean {
  if (!svgContent || typeof svgContent !== "string") {
    return false;
  }

  try {
    // Check if it contains SVG tags
    if (!svgContent.includes("<svg")) {
      return false;
    }

    // Try to parse as XML
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");

    // Check for parsing errors
    const parserError = doc.querySelector("parsererror");
    if (parserError) {
      return false;
    }

    // Check if root element is SVG
    const svgElement = doc.querySelector("svg");
    if (!svgElement) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitizes and validates SVG content
 * @param svgContent - The SVG content to sanitize and validate
 * @returns Object with sanitized content and validation status
 */
export function sanitizeAndValidateSVG(svgContent: string): {
  sanitized: string;
  isValid: boolean;
  error?: string;
} {
  if (!svgContent) {
    return {
      sanitized: "",
      isValid: false,
      error: "SVG content is empty",
    };
  }

  // First validate the structure
  if (!isValidSVG(svgContent)) {
    return {
      sanitized: "",
      isValid: false,
      error: "Invalid SVG structure",
    };
  }

  // Then sanitize
  const sanitized = sanitizeSVG(svgContent);

  if (!sanitized) {
    return {
      sanitized: "",
      isValid: false,
      error: "SVG sanitization failed",
    };
  }

  return {
    sanitized,
    isValid: true,
  };
}

/**
 * Extracts dimensions from SVG content
 * @param svgContent - The SVG content
 * @returns Width and height if found
 */
export function extractSVGDimensions(svgContent: string): {
  width?: number;
  height?: number;
  viewBox?: string;
} {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgElement = doc.querySelector("svg");

    if (!svgElement) {
      return {};
    }

    const width = svgElement.getAttribute("width");
    const height = svgElement.getAttribute("height");
    const viewBox = svgElement.getAttribute("viewBox");

    const result: {
      width?: number;
      height?: number;
      viewBox?: string;
    } = {};

    if (width) {
      result.width = Number.parseFloat(width);
    }
    if (height) {
      result.height = Number.parseFloat(height);
    }
    if (viewBox) {
      result.viewBox = viewBox;
    }

    return result;
  } catch {
    return {};
  }
}

/**
 * Sanitizes SVG for use in data URLs
 * @param svgContent - The SVG content
 * @returns Sanitized SVG suitable for data URL
 */
export function sanitizeSVGForDataURL(svgContent: string): string {
  const sanitized = sanitizeSVG(svgContent);
  if (!sanitized) {
    return "";
  }

  // Encode for use in data URL
  return encodeURIComponent(sanitized)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
}

/**
 * Creates a safe data URL from SVG content
 * @param svgContent - The SVG content
 * @returns Data URL or empty string if sanitization fails
 */
export function createSafeSVGDataURL(svgContent: string): string {
  const sanitized = sanitizeSVGForDataURL(svgContent);
  if (!sanitized) {
    return "";
  }

  return `data:image/svg+xml,${sanitized}`;
}
