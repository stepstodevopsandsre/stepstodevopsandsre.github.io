export const AboutSection = () => (
  <section id="about" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
    <div className="grid gap-8 rounded-[2rem] border border-border/80 bg-surface/80 p-8 shadow-panel lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
      <div>
        <span className="inline-flex rounded-full border border-accent/20 bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          About
        </span>
        <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-text sm:text-4xl">
          A durable public notebook for serious builders.
        </h2>
      </div>

      <div className="space-y-5 text-base leading-8 text-muted">
        <p>
          This platform is designed to help developers turn everyday learning into lasting assets: thoughtful blog posts, cleaner interview prep, sharper project case studies, and reusable reference material.
        </p>
        <p>
          The codebase is intentionally modular so you can expand it section by section, connect real content sources later, and keep the publishing experience lightweight enough for GitHub Pages.
        </p>
      </div>
    </div>
  </section>
);
