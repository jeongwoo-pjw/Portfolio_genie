import { Hero } from '@/components/hero/Hero';
import { Timeline } from '@/components/timeline/Timeline';
import { Overview } from '@/components/overview/Overview';
import { ProjectGoal } from '@/components/overview/ProjectGoal';
import { MarketResearch } from '@/components/research/MarketResearch';
import { TrendAnalysis } from '@/components/research/TrendAnalysis';
import { InsightSolution } from '@/components/insight/InsightSolution';
import { Persona } from '@/components/persona/Persona';
import { JourneyMap } from '@/components/journey/JourneyMap';
import { AsIsProblems } from '@/components/asis/AsIsProblems';
import { ToBeSection } from '@/components/tobe/ToBeSection';
import { Closing } from '@/components/closing/Closing';
import { FloatingDock } from '@/components/nav/FloatingDock';
import { SmoothScroll } from '@/lib/SmoothScroll';

export default function Home() {
  return (
    <SmoothScroll>
      <Hero />
      <Timeline />
      <Overview />
      <ProjectGoal />
      <MarketResearch />
      <TrendAnalysis />
      <InsightSolution />
      <AsIsProblems />
      <Persona />
      <JourneyMap />
      <ToBeSection />
      <Closing />
      <FloatingDock />
    </SmoothScroll>
  );
}
