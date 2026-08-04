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

/**
 * Registers an explicit snap point at a raw scroll value (see Snap.add - distinct from
 * snap.addElement, which tracks an element's own position). Used to give #tobe/#closing
 * - both excluded from the normal per-section registration since they're long-form - a
 * real "nearest point" of their own right at the true end of the page. Without this,
 * the last *registered* point anywhere below #ux-concept is #ux-concept itself, so if
 * mandatory snap's pause state is ever wrong for any reason while genuinely inside
 * #tobe/#closing (a pause/resume race, a future regression, etc.), it has nothing
 * nearby to resolve to and jumps all the way back up - this caps that fallback to a
 * harmless, invisible correction to the page's own bottom instead.
 */
export function addEndSnap(value: number) {
  return activeSnap?.add(value);
}
