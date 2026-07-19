import { socialLinks, site } from "@/data/siteContent";

export const Footer = () => (
  <footer className="border-t border-border/60 bg-surface/35">
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
      <div>
        <p className="font-display text-lg font-semibold text-text">{site.name}</p>
        <p className="mt-2 max-w-xl text-sm text-muted">
          A GitHub Pages knowledge hub backed by a secure Netlify function for live Notion blog delivery.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        {socialLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-muted transition hover:text-text"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  </footer>
);
