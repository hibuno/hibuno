/**
 * Type definitions for Umami analytics
 */

export interface UmamiTracker {
  track: (eventName: string, eventData?: Record<string, string | number | boolean | null>) => void;
  trackView: (url: string, referrer?: string) => void;
}

declare global {
  interface Window {
    umami?: UmamiTracker;
  }
}
