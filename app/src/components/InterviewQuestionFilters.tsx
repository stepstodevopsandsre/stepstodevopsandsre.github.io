type InterviewQuestionFiltersProps = {
  difficultyFilter: string;
  onDifficultyChange: (value: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

const selectClassName =
  "rounded-xl border border-border/70 bg-surface/85 px-4 py-2.5 text-sm font-medium text-text shadow-panel transition hover:border-accent/35 focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20";

export const InterviewQuestionFilters = ({
  difficultyFilter,
  onDifficultyChange,
  onClear,
  hasActiveFilters
}: InterviewQuestionFiltersProps) => (
  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-semibold uppercase tracking-[0.18em] text-muted">Filter</span>
      <select
        className={selectClassName}
        value={difficultyFilter}
        onChange={(event) => onDifficultyChange(event.target.value)}
        aria-label="Filter interview questions by difficulty"
      >
        <option value="all">All Topics</option>
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>
      </select>
    </label>

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
