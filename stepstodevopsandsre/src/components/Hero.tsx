import { ArrowRight, Sparkles } from "lucide-react";
import { heroStats, site } from "@/data/siteContent";

export const Hero = () => (
  <section id="home" className="relative overflow-hidden">
    <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(34,197,94,0.16),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.04),_transparent_50%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(163,230,53,0.14),_transparent_22%),linear-gradient(180deg,_rgba(8,15,31,0.45),_transparent_55%)]" />
    <div className="absolute inset-0 -z-10 bg-grid bg-[size:44px_44px] [mask-image:linear-gradient(to_bottom,white_35%,transparent)]" />

    <div className="mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-28">
      <div className="max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accentSoft px-4 py-2 text-sm font-semibold text-accent">
          <Sparkles size={16} />
          GitHub Pages-ready developer publishing platform
        </span>
        <h1 className="mt-8 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-text sm:text-6xl lg:text-7xl">
          Build a home for your ideas, notes, and developer credibility.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
          {site.description}
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="#blogs"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-text px-6 py-3.5 text-sm font-semibold text-canvas transition hover:-translate-y-0.5 hover:opacity-90"
          >
            Explore Content
            <ArrowRight size={16} />
          </a>
          <a
            href={site.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-6 py-3.5 text-sm font-semibold text-text transition hover:-translate-y-0.5 hover:border-accent/40 hover:bg-elevated"
          >
            View Repository
          </a>
        </div>

        <dl className="mt-14 grid gap-4 sm:grid-cols-3">
          {heroStats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-border/80 bg-surface/75 p-5 shadow-panel">
              <dt className="text-sm text-muted">{stat.label}</dt>
              <dd className="mt-2 font-display text-2xl font-semibold text-text">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative">
        <div className="absolute -left-6 top-10 hidden h-24 w-24 rounded-full bg-accent/20 blur-3xl sm:block" />
        <div className="absolute bottom-6 right-4 hidden h-24 w-24 rounded-full bg-success/20 blur-3xl sm:block" />
        <div className="relative rounded-[2rem] border border-border/80 bg-surface/85 p-6 shadow-panel backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-accent">Publishing System</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-text">Content that compounds</h2>
            </div>
            <span className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-success">
              Live structure
            </span>
          </div>

          <div className="mt-8 space-y-4">
            {[
              "Write blogs that teach through real implementation details.",
              "Organize interview prep into reusable topic clusters.",
              "Package notes, roadmaps, and cheat sheets into long-term assets."
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-border/70 bg-canvas/70 p-4">
                <p className="text-sm leading-7 text-muted">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-border/80 bg-gradient-to-br from-accentSoft to-transparent p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Why this works</p>
            <p className="mt-3 text-sm leading-7 text-muted">
              A focused landing page gives you a strong public front door now, while the component-driven codebase keeps future sections easy to add.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);
