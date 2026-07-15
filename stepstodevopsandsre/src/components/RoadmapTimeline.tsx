import { roadmapSteps } from "@/data/siteContent";
import { SectionHeading } from "./SectionHeading";

export const RoadmapTimeline = () => (
  <section id="roadmaps" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
    <SectionHeading
      eyebrow="Roadmaps"
      title="Map learning into deliberate stages."
      description="Roadmaps turn ambition into sequence, which makes it easier to prioritize what to learn next and what to practice now."
    />

    <div className="mt-12 grid gap-5 lg:grid-cols-4">
      {roadmapSteps.map((step) => (
        <article
          key={step.stage}
          className="rounded-[1.75rem] border border-border/80 bg-surface/75 p-6 shadow-panel"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">{step.stage}</span>
          <h3 className="mt-4 font-display text-2xl font-semibold text-text">{step.title}</h3>
          <p className="mt-4 text-sm leading-7 text-muted">{step.description}</p>
        </article>
      ))}
    </div>
  </section>
);
