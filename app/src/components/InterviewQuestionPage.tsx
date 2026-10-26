import { AlertCircle, ArrowLeft, Clock3, LoaderCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { latestInterviewQuestions } from "@/data/siteContent";
import { fetchInterviewQuestionArticle } from "@/lib/api";
import type { InterviewQuestion, InterviewQuestionArticle } from "@/types";
import { MotionReveal } from "./MotionReveal";

type InterviewQuestionPageProps = {
  slug: string;
  allQuestions: InterviewQuestion[];
};

type LoadState =
  | { status: "idle" | "loading" }
  | { status: "success"; article: InterviewQuestionArticle }
  | { status: "error"; message: string };

const formatDate = (value?: string) => {
  if (!value) return "Recently updated";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
};

export const InterviewQuestionPage = ({ slug, allQuestions }: InterviewQuestionPageProps) => {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const allKnown = [...allQuestions, ...latestInterviewQuestions];
  const fallback = allKnown.find((question) => question.slug === slug);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    fetchInterviewQuestionArticle(slug)
      .then((article) => {
        if (!cancelled) {
          setState({ status: "success", article });
        }
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ status: "error", message: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (state.status !== "success") return;

    const initMermaid = () => {
      if (typeof window.mermaid === "undefined") return;
      try {
        window.mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            background: "#0b0f19",
            primaryColor: "#1e293b",
            primaryTextColor: "#e2e8f0",
            lineColor: "#94a3b8",
            edgeLabelBackground: "#1e293b"
          }
        });
        window.mermaid.run({ querySelector: ".mermaid" });
      } catch {
        /* Mermaid should never block question rendering */
      }
    };

    if (!window.__mermaidLoaded) {
      window.__mermaidLoaded = true;
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
      script.async = true;
      script.onload = initMermaid;
      document.head.appendChild(script);
    } else {
      initMermaid();
    }
  }, [state.status]);

  const questionTitle = state.status === "success" ? state.article.question : fallback?.question ?? "Loading question";
  const domain = state.status === "success" ? state.article.domain : fallback?.domain;
  const difficulty = state.status === "success" ? state.article.difficulty : fallback?.difficulty;
  const keywords = state.status === "success" ? state.article.keywords : fallback?.keywords ?? [];
  const companies = state.status === "success" ? state.article.companies : fallback?.companies ?? [];

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <MotionReveal>
        <a
          href="#interview-questions"
          className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface/70 px-4 py-2.5 text-sm font-medium text-muted transition hover:border-accent/30 hover:text-text"
        >
          <ArrowLeft size={16} />
          Back to questions
        </a>
      </MotionReveal>

      <MotionReveal
        className="mt-8 rounded-[2rem] border border-border/70 bg-surface/80 p-6 shadow-panel backdrop-blur sm:p-8"
        delay={0.05}
      >
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          {domain && (
            <span className="rounded-full border border-accent/20 bg-accentSoft px-3 py-1 font-semibold uppercase tracking-[0.18em] text-accent">
              {domain}
            </span>
          )}
          {difficulty && (
            <span className="rounded-full border border-border/70 px-3 py-1 font-semibold text-muted">
              {difficulty}
            </span>
          )}
          {state.status === "success" && (
            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={14} />
              {state.article.readingTimeMinutes} min read
            </span>
          )}
          {state.status === "success" && (
            <span>Updated {formatDate(state.article.lastEditedTime)}</span>
          )}
        </div>
        <h1 className="mt-6 max-w-4xl font-display text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          {questionTitle}
        </h1>
        {(keywords.length > 0 || companies.length > 0) && (
          <div className="mt-6 flex flex-wrap gap-2">
            {keywords.map((keyword) => (
              <span key={keyword} className="rounded-full border border-border/70 bg-canvas/70 px-3 py-1 text-xs font-semibold text-muted">
                {keyword}
              </span>
            ))}
            {companies.map((company) => (
              <span key={company} className="rounded-full border border-accent/25 bg-accentSoft px-3 py-1 text-xs font-semibold text-accent">
                {company}
              </span>
            ))}
          </div>
        )}
      </MotionReveal>

      {state.status === "loading" && (
        <div className="mt-8 flex min-h-[18rem] items-center justify-center rounded-[2rem] border border-border/70 bg-surface/75 p-8 shadow-panel">
          <div className="flex items-center gap-3 text-muted">
            <LoaderCircle className="animate-spin" size={20} />
            Loading interview answer…
          </div>
        </div>
      )}

      {state.status === "error" && (
        <div className="mt-8 rounded-[2rem] border border-rose-500/20 bg-rose-500/10 p-8 shadow-panel">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 text-rose-500" size={18} />
            <div>
              <h2 className="font-display text-2xl font-semibold text-text">Question unavailable</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{state.message}</p>
            </div>
          </div>
        </div>
      )}

      {state.status === "success" && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-8 overflow-x-hidden rounded-[2rem] border border-border/70 bg-surface/80 p-4 shadow-panel sm:p-8"
        >
          <article
            className="prose prose-slate max-w-none overflow-x-hidden prose-headings:font-display prose-headings:tracking-tight prose-a:text-accent dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: state.article.html }}
          />
        </motion.section>
      )}
    </main>
  );
};
