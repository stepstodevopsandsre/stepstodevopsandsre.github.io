import { categories } from "@/data/siteContent";
import { SectionHeading } from "./SectionHeading";

export const FeaturedCategories = () => (
  <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
    <SectionHeading
      eyebrow="Categories"
      title="Everything you publish lives in a system, not a pile."
      description="These categories are designed to support both short-form publishing and long-term structured learning."
    />

    <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {categories.map((category) => {
        const Icon = category.icon;

        return (
          <a
            key={category.title}
            href={category.href}
            className="group rounded-[1.75rem] border border-border/80 bg-surface/70 p-6 shadow-panel transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-elevated"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accentSoft text-accent">
              <Icon size={20} />
            </div>
            <h3 className="mt-5 font-display text-xl font-semibold text-text">{category.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted">{category.description}</p>
          </a>
        );
      })}
    </div>
  </section>
);
