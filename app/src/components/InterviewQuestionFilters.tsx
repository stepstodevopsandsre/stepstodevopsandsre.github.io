type InterviewQuestionFiltersProps = {
  domains: string[];
  companies: string[];
  domainFilter: string;
  companyFilter: string;
  onDomainChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

const selectClassName =
  "rounded-xl border border-border/70 bg-surface/85 px-4 py-2.5 text-sm font-medium text-text shadow-panel transition hover:border-accent/35 focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20";

export const InterviewQuestionFilters = ({
  domains,
  companies,
  domainFilter,
  companyFilter,
  onDomainChange,
  onCompanyChange,
  onClear,
  hasActiveFilters
}: InterviewQuestionFiltersProps) => (
  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-semibold uppercase tracking-[0.18em] text-muted">Tool / Domain</span>
      <select
        className={selectClassName}
        value={domainFilter}
        onChange={(event) => onDomainChange(event.target.value)}
        aria-label="Filter interview questions by tool or domain"
      >
        <option value="all">All Tools</option>
        {domains.map((domain) => (
          <option key={domain} value={domain}>
            {domain}
          </option>
        ))}
      </select>
    </label>

    {companies.length > 0 && (
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-semibold uppercase tracking-[0.18em] text-muted">Company</span>
        <select
          className={selectClassName}
          value={companyFilter}
          onChange={(event) => onCompanyChange(event.target.value)}
          aria-label="Filter interview questions by company"
        >
          <option value="all">All Companies</option>
          {companies.map((company) => (
            <option key={company} value={company}>
              {company}
            </option>
          ))}
        </select>
      </label>
    )}

    {hasActiveFilters && (
      <button
        type="button"
        onClick={onClear}
        className="rounded-xl border border-border/70 bg-canvas/70 px-4 py-2.5 text-sm font-semibold text-text transition hover:border-accent/35 hover:text-accent"
      >
        Clear filters
      </button>
    )}
  </div>
);
