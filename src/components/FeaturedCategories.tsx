import { categories } from "@/data/siteContent";
import { MotionReveal } from "./MotionReveal";
import { SectionHeading } from "./SectionHeading";

export const FeaturedCategories = () => (
  <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
    <SectionHeading
      eyebrow="Categories"
      title="A single hub for high-signal engineering material."
      description="The information architecture stays simple, but each section is ready to grow into a richer publishing surface over time."
    />

    <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {categories.map((category, index) => {
        const Icon = category.icon;

        return (
          <MotionReveal key={category.title} delay={0.04 * index}>
            <a
              href={category.href}
              className="group block rounded-[1.75rem] border border-border/70 bg-surface/72 p-6 shadow-panel backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-accent/35 hover:bg-elevated"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accentSoft text-accent transition duration-300 group-hover:scale-105">
                <Icon size={20} />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-text">{category.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{category.description}</p>
            </a>
          </MotionReveal>
        );
      })}
    </div>
  </section>
);
