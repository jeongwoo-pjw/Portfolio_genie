'use client';

import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import Snap from 'lenis/snap';
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap';
import { registerSnap, unregisterSnap } from './scrollSnap';

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // "mandatory": every scroll gesture always resolves to the nearest section's top,
    // regardless of where inside it the scroll stopped. Snap decides "the user has
    // stopped" via its own debounce timer on Lenis's virtual-scroll event - that timer
    // must run LONGER than Lenis's own `duration` (1.1s) easing for a wheel gesture,
    // otherwise the debounced re-snap fires while Lenis's own momentum is still
    // animating, correcting toward a stale mid-flight scroll position. Right at a
    // pinned section's entry boundary (see MarketResearch/TrendAnalysis/Persona's
    // pauseSnap/resumeSnap) that stale correction can cross back over the pin's start
    // and re-trigger onEnter/onEnterBack, which reads as a visible bounce.
    const snap = new Snap(lenis, {
      type: 'mandatory',
      duration: 0.9,
      debounce: 1300,
    });
    // #asis (Analysis) and #tobe both opt out of snap: their content is long-form and
    // reading through it shouldn't get yanked back to the section top mid-scroll.
    const NO_SNAP_IDS = new Set(['asis', 'tobe']);
    const sections = Array.from(document.querySelectorAll<HTMLElement>('section[id]')).filter(
      (el) => !NO_SNAP_IDS.has(el.id)
    );
    const removeSnapElements = sections.map((el) => snap.addElement(el, { align: ['start'] }));
    registerSnap(snap);

    // Sections later in the page (e.g. InsightSolution) create their own ScrollTriggers
    // in their own useLayoutEffect, each measuring positions as of that moment - but
    // earlier pinned sections' spacer heights aren't guaranteed final yet at that point,
    // so a later trigger's start point can be computed against a not-yet-settled layout
    // and never fire correctly. One refresh after everything has mounted (and fonts/
    // images have had a frame to affect layout) re-measures every trigger against the
    // final DOM.
    const refreshId = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(refreshId);
      unregisterSnap(snap);
      removeSnapElements.forEach((remove) => remove());
      snap.destroy();
      lenis.destroy();
      gsap.ticker.remove(update);
    };
  }, []);

  return <>{children}</>;
}
