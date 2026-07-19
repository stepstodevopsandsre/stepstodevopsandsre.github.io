import { AlignRight, ArrowUpRight, Github, X } from "lucide-react";
import { useState } from "react";
import { navigation, site } from "@/data/siteContent";
import { ThemeToggle } from "./ThemeToggle";

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-canvas/70 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#home" className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 bg-text text-sm font-bold text-canvas shadow-glow">
            SR
          </span>
          <div>
            <p className="font-display text-base font-semibold tracking-tight text-text">{site.name}</p>
            <p className="text-sm text-muted">{site.tagline}</p>
          </div>
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {navigation.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noreferrer" : undefined}
              className="text-sm font-medium text-muted transition hover:text-text"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <a
            href={site.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-text/10 bg-text px-5 py-3 text-sm font-semibold text-canvas transition hover:-translate-y-0.5 hover:opacity-90"
          >
            <Github size={16} />
            View Repository
          </a>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-surface/85 text-text"
          >
            {menuOpen ? <X size={18} /> : <AlignRight size={18} />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-border/50 bg-canvas/95 px-4 py-4 lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-2">
            {navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
                className="flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-muted transition hover:border-border hover:bg-surface hover:text-text"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
                {item.external ? <ArrowUpRight size={16} /> : null}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
};
