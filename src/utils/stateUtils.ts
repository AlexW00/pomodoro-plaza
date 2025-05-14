import { TimerState } from '@/types/timer';

/**
 * Gets the formatted date string for the current day (YYYY-MM-DD)
 */
export function getFormattedDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Compresses the state object for URL sharing
 */
export function compressState(state: TimerState): string {
  try {
    const stateStr = JSON.stringify(state);
    return btoa(encodeURIComponent(stateStr));
  } catch (error) {
    console.error('Error compressing state:', error);
    return '';
  }
}

/**
 * Decompresses the state from URL parameter
 */
export function decompressState(compressed: string): TimerState | null {
  try {
    const stateStr = decodeURIComponent(atob(compressed));
    return JSON.parse(stateStr) as TimerState;
  } catch (error) {
    console.error('Error decompressing state:', error);
    return null;
  }
}

/**
 * Generates a shareable URL with the current state
 */
export function generateShareableUrl(state: TimerState): string {
  const compressed = compressState(state);
  const url = new URL(window.location.href);
  url.searchParams.set('state', compressed);
  return url.toString();
}