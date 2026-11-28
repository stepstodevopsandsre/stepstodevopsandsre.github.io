import { AlertCircle, ArrowLeft, Code2, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchPracticeProblemArticle } from "@/lib/api";
import type { PracticeProblemArticle } from "@/types";
import { MotionReveal } from "./MotionReveal";

type PracticeProblemPageProps = { slug: string };
type LoadState =
  | { status: "loading" }
  | { status: "success"; article: PracticeProblemArticle }
  | { status: "error"; message: string };

export const PracticeProblemPage = ({ slug }: PracticeProblemPageProps) => {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetchPracticeProblemArticle(slug)
      .then((article) => {
        if (!cancelled) setState({ status: "success", article });
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ status: "error", message: error.message });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const article = state.status === "success" ? state.article : undefined;

  return (
    <main className="mx-auto max-w-[88rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-5xl">
        <MotionReveal>
          <a href="#" className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface/70 px-4 py-2.5 text-sm font-medium text-muted transition hover:border-accent/30 hover:text-text">
            <ArrowLeft size={16} /> Back to home
          </a>
        </MotionReveal>

        <MotionReveal className="mt-6 rounded-[2rem] border border-border/70 bg-surface/80 p-6 shadow-panel backdrop-blur sm:p-8" delay={0.05}>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            <span className="inline-flex items-center gap-2 rounded-full bg-accentSoft px-3 py-1.5"><Code2 size={14} /> Python practice</span>
            {article?.difficulty && <span className="rounded-full border border-border/70 px-3 py-1.5 text-muted">{article.difficulty}</span>}
          </div>
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-text sm:text-5xl">
            {article?.question ?? (state.status === "error" ? "Practice problem unavailable" : "Loading practice problem")}
          </h1>
          {article && (
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted">
              <span>{article.language}</span>
              {article.topics.map((topic) => <span key={topic} className="rounded-full border border-border/70 px-3 py-1">{topic}</span>)}
            </div>
          )}
        </MotionReveal>

        {state.status === "loading" && (
          <div className="mt-6 flex min-h-[14rem] items-center justify-center rounded-[2rem] border border-border/70 bg-surface/75 p-8 shadow-panel">
            <div className="flex items-center gap-3 text-muted"><LoaderCircle className="animate-spin" size={20} /> Loading problem…</div>
          </div>
        )}

        {state.status === "error" && (
          <div className="mt-6 rounded-[2rem] border border-rose-500/20 bg-rose-500/10 p-8 shadow-panel">
            <div className="flex items-start gap-3"><AlertCircle className="mt-0.5 text-rose-500" size={18} /><div><h2 className="font-display text-2xl font-semibold text-text">Practice problem unavailable</h2><p className="mt-3 text-sm leading-7 text-muted">{state.message}</p></div></div>
          </div>
        )}

        {article && (
          <section className="mt-6 overflow-hidden rounded-[2rem] border border-border/70 bg-surface/80 shadow-panel">
            <article className="article-content prose prose-slate max-w-none overflow-x-hidden p-5 dark:prose-invert sm:p-8" dangerouslySetInnerHTML={{ __html: article.html }} />
            <div className="border-t border-border/70 bg-canvas/35 px-5 py-4 text-sm text-muted sm:px-8">
              The editor will be added in the next layer. This first layer establishes the safe Notion-backed problem route without loading a Python runtime on existing pages.
            </div>
          </section>
        )}
      </div>
    </main>
  );
};
