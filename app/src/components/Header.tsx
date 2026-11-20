import { AlignRight, ArrowUpRight, Github, X } from "lucide-react";
import { type CSSProperties, useEffect, useState } from "react";
import { navigation, site } from "@/data/siteContent";
import { ThemeToggle } from "./ThemeToggle";

type HeaderProps = {
  compactOnScroll?: boolean;
};

export const Header = ({ compactOnScroll = true }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    let frame = 0;

    const updateScrollProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
        setScrollProgress(Math.min(100, Math.max(0, progress)));

        const compactViewport = window.matchMedia("(min-width: 1024px)").matches;

        // Hysteresis keeps the header from flickering around the transition point.
        setIsCompact((current) => {
          if (!compactOnScroll || !compactViewport) return false;
          if (current && window.scrollY < 16) return false;
          if (!current && window.scrollY > 72) return true;
          return current;
        });
      });
    };

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, [compactOnScroll]);

  const progressStyle = {
    "--scroll-progress": `${scrollProgress}%`
  } as CSSProperties;

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-out ${
        isCompact
          ? "border-b border-transparent bg-transparent shadow-none backdrop-blur-0"
          : "border-b border-border/50 bg-canvas/70 backdrop-blur-2xl"
      }`}
      data-header-compact={isCompact}
    >
      <div
        className={`flex w-full items-center justify-between transition-[padding,max-width] duration-300 ease-out ${
          isCompact
            ? "max-w-none px-4 py-2 sm:px-4 lg:px-4"
            : "mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8"
        }`}
      >
        <a href="#home" className={`flex items-center transition-[gap] duration-300 ${isCompact ? "gap-2" : "gap-3"}`}>
          <span
            className={`scroll-progress-ring inline-flex items-center justify-center p-[2px] font-bold text-canvas shadow-glow transition-[height,width,border-radius,font-size] duration-300 ${
              isCompact ? "h-8 w-8 rounded-xl text-xs" : "h-11 w-11 rounded-2xl text-sm"
            }`}
            style={progressStyle}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(scrollProgress)}
            aria-label={`Reading progress: ${Math.round(scrollProgress)} percent`}
            title={`Reading progress: ${Math.round(scrollProgress)}%`}
          >
            <span className={`inline-flex h-full w-full items-center justify-center bg-text transition-[border-radius] duration-300 ${isCompact ? "rounded-[0.6rem]" : "rounded-[0.85rem]"}`}>
              SR
            </span>
          </span>
          <div className="leading-none">
            <p className={`font-display font-semibold tracking-tight text-text transition-[font-size] duration-300 ${isCompact ? "text-sm" : "text-base"}`}>{site.name}</p>
            <p className={`overflow-hidden text-sm text-muted transition-[max-height,opacity,margin] duration-300 ${isCompact ? "max-h-0 opacity-0" : "mt-1 max-h-6 opacity-100"}`}>{site.tagline}</p>
          </div>
        </a>

        <nav className={`items-center gap-7 transition-[opacity,transform] duration-300 ${isCompact ? "pointer-events-none hidden -translate-y-1 opacity-0 lg:hidden" : "hidden opacity-100 lg:flex"}`}>
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

        {/*<div className="hidden items-center gap-3 lg:flex">
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
        </div>*/}

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
