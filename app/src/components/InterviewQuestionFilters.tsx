import { useEffect, useState } from "react";
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

  return (
  <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5 xl:items-end">
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

    <div className="flex items-end gap-3">
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
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mb-0.5 shrink-0 rounded-xl border border-border/70 bg-canvas/70 px-4 py-2.5 text-sm font-semibold text-text transition hover:border-accent/35 hover:text-accent"
        >
          Clear
        </button>
      )}
    </div>
  </div>
  );
};
