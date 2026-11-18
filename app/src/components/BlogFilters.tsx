import { useEffect, useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import type { BlogFilters as ArticleFilters } from "@/lib/api";

type BlogFiltersProps = {
  categories: string[];
  domains: string[];
  filters: ArticleFilters;
  onChange: (filters: ArticleFilters) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

const selectClassName = "min-w-0 rounded-xl border border-border/70 bg-surface/85 px-4 py-2.5 text-sm font-medium text-text shadow-panel transition hover:border-accent/35 focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20";

export const BlogFilters = ({ categories, domains, filters, onChange, onClear, hasActiveFilters }: BlogFiltersProps) => {
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => setSearchValue(filters.search || ""), [filters.search]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchValue !== (filters.search || "")) onChange({ ...filters, search: searchValue });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [filters, onChange, searchValue]);

  const activeFilterCount = [
    filters.category && filters.category !== "all",
    filters.domain && filters.domain !== "all",
    Boolean(filters.search)
  ].filter(Boolean).length;

  const filterFields = <>
    <label className="flex min-w-0 flex-col gap-2 text-sm">
      <span className="font-semibold uppercase tracking-[0.18em] text-muted">Category</span>
      <select className={selectClassName} value={filters.category || "all"} onChange={(event) => onChange({ ...filters, category: event.target.value })} aria-label="Filter articles by category">
        <option value="all">All categories</option>
        {categories.map((category) => <option key={category} value={category}>{category}</option>)}
      </select>
    </label>
    <label className="flex min-w-0 flex-col gap-2 text-sm">
      <span className="font-semibold uppercase tracking-[0.18em] text-muted">Domain</span>
      <select className={selectClassName} value={filters.domain || "all"} onChange={(event) => onChange({ ...filters, domain: event.target.value })} aria-label="Filter articles by domain">
        <option value="all">All domains</option>
        {domains.map((domain) => <option key={domain} value={domain}>{domain}</option>)}
      </select>
    </label>
  </>;

  const searchField = <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm">
    <span className="font-semibold uppercase tracking-[0.18em] text-muted">Search</span>
    <input className={`${selectClassName} placeholder:text-muted/70`} value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Find an article" aria-label="Search articles" />
  </label>;

  const clearButton = hasActiveFilters ? <button type="button" onClick={onClear} className="shrink-0 rounded-xl border border-border/70 bg-canvas/70 px-4 py-2.5 text-sm font-semibold text-text transition hover:border-accent/35 hover:text-accent">Clear</button> : null;

  return <div className="mt-6">
    <button type="button" onClick={() => setIsMobileOpen((open) => !open)} className="flex w-full items-center justify-between rounded-xl border border-border/70 bg-surface/85 px-4 py-3 text-sm font-semibold text-text shadow-panel sm:hidden" aria-expanded={isMobileOpen} aria-controls="mobile-article-filters">
      <span className="inline-flex items-center gap-2"><SlidersHorizontal size={16} className="text-accent" />Filter articles{activeFilterCount > 0 && <span className="rounded-full bg-accentSoft px-2 py-0.5 text-xs text-accent">{activeFilterCount}</span>}</span>
      <ChevronDown size={17} className={`transition-transform ${isMobileOpen ? "rotate-180" : ""}`} />
    </button>
    <div id="mobile-article-filters" className={`${isMobileOpen ? "mt-3 grid" : "hidden"} grid-cols-2 gap-3 rounded-2xl border border-border/70 bg-surface/60 p-3 sm:hidden`}>
      {filterFields}
      <div className="col-span-2 flex items-end gap-3">{searchField}{clearButton}</div>
    </div>
    <div className="mt-8 hidden gap-4 sm:grid sm:grid-cols-3 sm:items-end">{filterFields}<div className="flex items-end gap-3">{searchField}{clearButton}</div></div>
  </div>;
};
