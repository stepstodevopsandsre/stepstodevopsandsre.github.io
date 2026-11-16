import { useEffect, useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import type { InterviewQuestionFilters as QuestionFilters } from "@/lib/api";

type InterviewQuestionFiltersProps = {
  filters: QuestionFilters;
  onChange: (filters: QuestionFilters) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

const selectClassName =
  "rounded-xl border border-border/70 bg-surface/85 px-4 py-2.5 text-sm font-medium text-text shadow-panel transition hover:border-accent/35 focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20";

export const InterviewQuestionFilters = ({
  filters,
  onChange,
  onClear,
  hasActiveFilters
}: InterviewQuestionFiltersProps) => {
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const topicOptions = ["Docker", "Linux", "Kubernetes", "Jenkins", "Terraform", "Git", "Ansible", "AWS", "EKS", "DevOps", "SRE"];
  const keywordOptions = ["Docker", "Linux", "Kubernetes", "Jenkins", "Terraform", "Git", "Ansible", "AWS", "EKS", "Secrets", "ConfigMap", "IAM", "Traffic Flow", "Lifecycle"];
  const companyOptions = ["Amazon", "Google", "Microsoft", "Meta", "Netflix", "Generic"];

  useEffect(() => {
    setSearchValue(filters.search || "");
  }, [filters.search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchValue !== (filters.search || "")) {
        onChange({ ...filters, search: searchValue });
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [filters, onChange, searchValue]);

  const activeFilterCount = [
    filters.domain && filters.domain !== "all",
    Boolean(filters.keyword),
    filters.company && filters.company !== "all",
    filters.difficulty && filters.difficulty !== "all",
    Boolean(filters.search)
  ].filter(Boolean).length;

  const filterFields = (
    <>
      <label className="flex min-w-0 flex-col gap-2 text-sm">
        <span className="font-semibold uppercase tracking-[0.18em] text-muted">Topic</span>
        <select
          className={selectClassName}
          value={filters.domain || "all"}
          onChange={(event) => onChange({ ...filters, domain: event.target.value })}
          aria-label="Filter interview questions by topic"
        >
          <option value="all">All topics</option>
          {topicOptions.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
        </select>
      </label>

      <label className="flex min-w-0 flex-col gap-2 text-sm">
        <span className="font-semibold uppercase tracking-[0.18em] text-muted">Keyword</span>
        <select
          className={selectClassName}
          value={filters.keyword || ""}
          onChange={(event) => onChange({ ...filters, keyword: event.target.value })}
          aria-label="Filter interview questions by keyword"
        >
          <option value="">All keywords</option>
          {keywordOptions.map((keyword) => <option key={keyword} value={keyword}>{keyword}</option>)}
        </select>
      </label>

      <label className="flex min-w-0 flex-col gap-2 text-sm">
        <span className="font-semibold uppercase tracking-[0.18em] text-muted">Company</span>
        <select
          className={selectClassName}
          value={filters.company || "all"}
          onChange={(event) => onChange({ ...filters, company: event.target.value })}
          aria-label="Filter interview questions by company"
        >
          <option value="all">All companies</option>
          {companyOptions.map((company) => <option key={company} value={company}>{company}</option>)}
        </select>
      </label>

      <label className="flex min-w-0 flex-col gap-2 text-sm">
        <span className="font-semibold uppercase tracking-[0.18em] text-muted">Level</span>
        <select
          className={selectClassName}
          value={filters.difficulty || "all"}
          onChange={(event) => onChange({ ...filters, difficulty: event.target.value })}
          aria-label="Filter interview questions by difficulty"
        >
          <option value="all">All levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </label>
    </>
  );

  const searchField = (
    <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm">
      <span className="font-semibold uppercase tracking-[0.18em] text-muted">Search</span>
      <input
        className={`${selectClassName} min-w-0 placeholder:text-muted/70`}
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        placeholder="Find a question"
        aria-label="Search interview questions"
      />
    </label>
  );

  const clearButton = hasActiveFilters ? (
    <button
      type="button"
      onClick={onClear}
      className="shrink-0 rounded-xl border border-border/70 bg-canvas/70 px-4 py-2.5 text-sm font-semibold text-text transition hover:border-accent/35 hover:text-accent"
    >
      Clear
    </button>
  ) : null;

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setIsMobileOpen((open) => !open)}
        className="flex w-full items-center justify-between rounded-xl border border-border/70 bg-surface/85 px-4 py-3 text-sm font-semibold text-text shadow-panel sm:hidden"
        aria-expanded={isMobileOpen}
        aria-controls="mobile-interview-filters"
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-accent" />
          Filter questions
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-accentSoft px-2 py-0.5 text-xs text-accent">{activeFilterCount}</span>
          )}
        </span>
        <ChevronDown size={17} className={`transition-transform ${isMobileOpen ? "rotate-180" : ""}`} />
      </button>

      <div
        id="mobile-interview-filters"
        className={`${isMobileOpen ? "mt-3 grid" : "hidden"} grid-cols-2 gap-3 rounded-2xl border border-border/70 bg-surface/60 p-3 sm:hidden`}
      >
        {filterFields}
        <div className="col-span-2 flex items-end gap-3">
          {searchField}
          {clearButton}
        </div>
      </div>

      <div className="mt-8 hidden gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-5 xl:items-end">
        {filterFields}
        <div className="flex items-end gap-3">
          {searchField}
          {clearButton}
        </div>
      </div>
    </div>
  );
};
