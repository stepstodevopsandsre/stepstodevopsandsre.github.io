import { ArrowRight, Code2, LoaderCircle, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchPracticeProblemFacets, fetchPublishedPracticeProblems, type PracticeProblemFilters } from "@/lib/api";
import { getPracticeProblemHref } from "@/lib/routes";
import type { PracticeProblem } from "@/types";
import { MotionReveal } from "./MotionReveal";

export const PracticeProblemsPage = () => {
  const [problems, setProblems] = useState<PracticeProblem[]>([]);
  const [filters, setFilters] = useState<PracticeProblemFilters>({ topic: "all", difficulty: "all", search: "" });
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [facetTopics, setFacetTopics] = useState<string[]>([]);
  const [facetDifficulties, setFacetDifficulties] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    fetchPracticeProblemFacets()
      .then((facets) => {
        if (!active) return;
        setFacetTopics(facets.topics);
        setFacetDifficulties(facets.difficulties);
      })
      .catch(() => {
        // The list remains usable. Loaded results provide a local fallback.
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setCursor(null);
    fetchPublishedPracticeProblems(undefined, 10, filters)
      .then((result) => {
        if (!active) return;
        setProblems(result.problems);
        setHasMore(result.hasMore);
        setCursor(result.nextCursor);
      })
      .catch(() => {
        if (active) {
          setProblems([]);
          setHasMore(false);
          setCursor(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filters.topic, filters.difficulty, filters.search]);

  const topics = useMemo(() => [...new Set([...facetTopics, ...problems.flatMap((problem) => problem.topics)])].sort(), [facetTopics, problems]);
  const difficulties = useMemo(() => [...new Set([...facetDifficulties, ...problems.map((problem) => problem.difficulty).filter(Boolean)])].sort(), [facetDifficulties, problems]);

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await fetchPublishedPracticeProblems(cursor, 10, filters);
      setProblems((current) => [...current, ...result.problems.filter((item) => !current.some((existing) => existing.slug === item.slug))]);
      setHasMore(result.hasMore);
      setCursor(result.nextCursor);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <MotionReveal className="max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-accentSoft px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent"><Code2 size={14} /> Python practice</span>
        <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-text sm:text-6xl">Practice by writing code</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">Understand the approach, write the function, and run it against visible test cases. New problems appear here when their Notion status is set to Done.</p>
      </MotionReveal>

      <div className="mt-8 grid gap-3 rounded-[1.5rem] border border-border/70 bg-surface/70 p-4 shadow-panel sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-muted">Search<input value={filters.search || ""} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Find a problem" className="mt-2 w-full rounded-xl border border-border/70 bg-canvas/60 px-3.5 py-2.5 text-sm font-normal normal-case tracking-normal text-text outline-none focus:border-accent/50" /></label>
        <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-muted">Topic<select value={filters.topic || "all"} onChange={(event) => setFilters((current) => ({ ...current, topic: event.target.value }))} className="mt-2 w-full rounded-xl border border-border/70 bg-canvas/60 px-3.5 py-2.5 text-sm font-normal normal-case tracking-normal text-text outline-none focus:border-accent/50"><option value="all">All topics</option>{topics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}</select></label>
        <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-muted">Level<select value={filters.difficulty || "all"} onChange={(event) => setFilters((current) => ({ ...current, difficulty: event.target.value }))} className="mt-2 w-full rounded-xl border border-border/70 bg-canvas/60 px-3.5 py-2.5 text-sm font-normal normal-case tracking-normal text-text outline-none focus:border-accent/50"><option value="all">All levels</option>{difficulties.map((difficulty) => <option key={difficulty} value={difficulty}>{difficulty}</option>)}</select></label>
      </div>

      {loading ? <div className="mt-8 flex min-h-[14rem] items-center justify-center rounded-[1.75rem] border border-border/70 bg-surface/75"><LoaderCircle className="animate-spin text-accent" size={28} /></div> : problems.length === 0 ? <div className="mt-8 rounded-[1.75rem] border border-border/70 bg-surface/75 p-10 text-center text-muted">No published practice problems match these filters.</div> : <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{problems.map((problem, index) => <MotionReveal key={problem.slug} delay={index * 0.04}><article className="flex min-h-[16rem] h-full flex-col rounded-[1.5rem] border border-border/70 bg-surface/75 p-5 shadow-panel backdrop-blur transition hover:-translate-y-1 hover:border-accent/35"><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-accentSoft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{problem.language}</span><span className="text-xs text-muted">{problem.difficulty}</span></div><h2 className="mt-5 font-display text-xl font-semibold leading-tight text-text">{problem.question}</h2><div className="mt-5 flex flex-wrap gap-2">{problem.topics.slice(0, 3).map((topic) => <span key={topic} className="rounded-full border border-border/60 px-2.5 py-1 text-[11px] text-muted">{topic}</span>)}</div><a href={getPracticeProblemHref(problem.slug)} className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-accent">Open problem <ArrowRight size={15} /></a></article></MotionReveal>)}</div>}

      {hasMore && <div className="mt-8 flex justify-center"><button type="button" onClick={loadMore} disabled={loadingMore} className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface/90 px-5 py-3 text-sm font-semibold text-text shadow-panel disabled:opacity-50">{loadingMore && <LoaderCircle className="animate-spin" size={16} />} {loadingMore ? "Loading…" : "Load more problems ↓"}</button></div>}
    </main>
  );
};
