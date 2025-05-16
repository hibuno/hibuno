/**
 * Utility functions for tracking analytics events
 */

// Check if window is defined (for SSR compatibility)
const isClient = typeof window !== 'undefined';

// Import UmamiTracker type from types file
import type { UmamiTracker } from '../types/umami';

/**
 * Track an event using Umami analytics
 * 
 * @param eventName - The name of the event to track
 * @param eventData - Optional data to include with the event
 */
export function trackEvent(eventName: string, eventData?: Record<string, string | number | boolean | null>) {
  if (!isClient) {
    return;
  }
  
  const w = window as unknown as { umami?: UmamiTracker };
  if (!w.umami) {
    return;
  }
  
  try {
    w.umami.track(eventName, eventData);
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

/**
 * Track a page view using Umami analytics
 * 
 * @param url - The URL to track
 * @param referrer - Optional referrer URL
 */
export function trackPageView(url: string, referrer?: string) {
  if (!isClient) {
    return;
  }
  
  const w = window as unknown as { umami?: UmamiTracker };
  if (!w.umami) {
    return;
  }
  
  try {
    w.umami.trackView(url, referrer);
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}

/**
 * Feature categories for tracking
 */
export enum FeatureCategory {
  TEXT_TOOLS = 'text_tools',
  IMAGE_TOOLS = 'image_tools',
  BACKGROUND_REMOVAL = 'background_removal',
  NAVIGATION = 'navigation',
  HOME = 'home'
}

/**
 * Track feature usage
 * 
 * @param category - The feature category
 * @param action - The action performed (e.g., 'click', 'submit', 'convert')
 * @param name - The specific feature name
 * @param value - Optional value associated with the action
 */
export function trackFeatureUsage(
  category: FeatureCategory,
  action: string,
  name: string,
  value?: string | number
) {
  trackEvent('feature_usage', {
    category,
    action,
    name,
    value: value !== undefined ? value.toString() : null,
    timestamp: new Date().toISOString()
  });
}
