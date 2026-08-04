import type Snap from 'lenis/snap';

/**
 * Holds the page's single Lenis Snap instance so sections with their own internal
 * scroll-scrubbed behavior (e.g. Timeline's horizontal card scroll) can pause snapping
 * while the user is scrolling *through* them, and resume it once they've fully exited.
 * Without this, "mandatory" snap fights any section that's artificially tall via a
 * pinned ScrollTrigger, yanking the user back to the section's top mid-gesture.
 */
let activeSnap: Snap | null = null;

export function registerSnap(snap: Snap) {
  activeSnap = snap;
}

export function unregisterSnap(snap: Snap) {
  if (activeSnap === snap) activeSnap = null;
}

export function pauseSnap() {
  activeSnap?.stop();
}

export function resumeSnap() {
  activeSnap?.start();
}
