import { roadmapSteps } from "@/data/siteContent";
import { MotionReveal } from "./MotionReveal";
import { SectionHeading } from "./SectionHeading";

export const RoadmapTimeline = () => (
  <section id="roadmaps" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
    <SectionHeading
      eyebrow="Roadmaps"
      title="Progress from fundamentals to operational judgment."
      description="The roadmap frame keeps learning practical: build core intuition first, then operate, scale, and publish what you learn."
    />

    <div className="mt-12 grid gap-5 lg:grid-cols-4">
      {roadmapSteps.map((step, index) => (
        <MotionReveal key={step.stage} delay={0.05 * index}>
          <article className="relative h-full overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface/75 p-6 shadow-panel backdrop-blur">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-rose-400 to-transparent opacity-80" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">{step.stage}</span>
            <h3 className="mt-4 font-display text-2xl font-semibold text-text">{step.title}</h3>
            <p className="mt-4 text-sm leading-7 text-muted">{step.description}</p>
          </article>
        </MotionReveal>
      ))}
    </div>
  </section>
);
