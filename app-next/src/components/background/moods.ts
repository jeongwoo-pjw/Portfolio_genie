import * as THREE from 'three';

export interface Mood {
  colorA: string;
  colorB: string;
  /** Subtle prism/iridescent accent - a neighboring hue used only in the glass-like
   *  secondary light blobs, never as a large area, to keep the overall look clean. */
  colorC: string;
}

/**
 * All moods stay within the white -> light-tint premium-SaaS range (never dark, never
 * neon) - only the accent tint changes per section, echoing the brand palette used
 * elsewhere on the page (blue/mint/violet/pink). colorB is intentionally saturated
 * enough to read clearly against colorA - too pale and the motion is invisible.
 */
export const MOODS = {
  blue: { colorA: '#ffffff', colorB: '#9dcdff', colorC: '#c9b8ff' },
  mint: { colorA: '#ffffff', colorB: '#8fe8ce', colorC: '#a9e0ff' },
  violet: { colorA: '#ffffff', colorB: '#c6b3ff', colorC: '#ffb8e8' },
  pink: { colorA: '#ffffff', colorB: '#ffb3e6', colorC: '#c6b3ff' },
  warm: { colorA: '#ffffff', colorB: '#ffc2a3', colorC: '#ffb3e6' },
} as const satisfies Record<string, Mood>;

export type MoodName = keyof typeof MOODS;

/** Section id -> mood + blob count (1-3: primary + max 2 secondary) + contrast (1 =
 *  normal, >1 = more saturated/vivid blobs) + blobScale (1 = normal radius, <1 =
 *  smaller). */
export const SECTION_MOODS: { id: string; mood: MoodName; blobCount: number; contrast?: number; blobScale?: number }[] = [
  // Copied exactly from #ux-concept below (same mood/blobCount/blobScale, no contrast
  // override) so the Hero background reads as the identical light, not a boosted
  // variant - blobScale reduced for the same reason as ux-concept: the glass
  // rings/notes floating in front of this section's background need room to read
  // clearly instead of competing with a large, loose light volume behind them.
  { id: 'top', mood: 'blue', blobCount: 2, blobScale: 0.55 },
  { id: 'flow', mood: 'blue', blobCount: 3 },
  { id: 'overview', mood: 'mint', blobCount: 2 },
  { id: 'goal', mood: 'mint', blobCount: 3 },
  { id: 'market-research', mood: 'violet', blobCount: 3 },
  { id: 'trend-analysis', mood: 'violet', blobCount: 2 },
  { id: 'insight', mood: 'pink', blobCount: 2 },
  { id: 'persona', mood: 'pink', blobCount: 3 },
  { id: 'journey', mood: 'mint', blobCount: 1 },
  { id: 'asis', mood: 'warm', blobCount: 3 },
  // Blue (not mint) so this section's background echoes the GlassTorus glass shapes'
  // own blue-leaning color scheme instead of contrasting against it. blobScale is
  // reduced so the background's own floating light volumes stay small/contained
  // instead of competing for space and attention with the glass shapes in front.
  { id: 'ux-concept', mood: 'blue', blobCount: 2, blobScale: 0.55 },
  { id: 'tobe', mood: 'violet', blobCount: 3 },
  { id: 'closing', mood: 'violet', blobCount: 1 },
];

export interface MoodState {
  colorA: THREE.Color;
  colorB: THREE.Color;
  colorC: THREE.Color;
  blobCount: number;
  contrast: number;
  blobScale: number;
}

export function createMoodState(mood: Mood, blobCount: number, contrast = 1, blobScale = 1): MoodState {
  return {
    colorA: new THREE.Color(mood.colorA),
    colorB: new THREE.Color(mood.colorB),
    colorC: new THREE.Color(mood.colorC),
    blobCount,
    contrast,
    blobScale,
  };
}
