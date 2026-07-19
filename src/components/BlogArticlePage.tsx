import { AlertCircle, ArrowLeft, Clock3, ExternalLink, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { latestBlogs } from "@/data/siteContent";
import { fetchBlogArticle } from "@/lib/api";
import { getBlogHref } from "@/lib/routes";
import type { BlogArticle } from "@/types";
import { MotionReveal } from "./MotionReveal";

type BlogArticlePageProps = {
  slug: string;
};

type LoadState =
  | { status: "idle" | "loading" }
  | { status: "success"; article: BlogArticle }
  | { status: "error"; message: string };

const formatDate = (value?: string) => {
  if (!value) {
    return "Recently updated";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
};

export const BlogArticlePage = ({ slug }: BlogArticlePageProps) => {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const fallback = latestBlogs.find((post) => post.slug === slug);

  useEffect(() => {
    let cancelled = false;

    setState({ status: "loading" });

    fetchBlogArticle(slug)
      .then((article) => {
        if (!cancelled) {
          setState({ status: "success", article });
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: error.message
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <MotionReveal>
        <a
          href="#home"
          className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface/70 px-4 py-2 text-sm font-medium text-muted transition hover:border-accent/30 hover:text-text"
        >
          <ArrowLeft size={16} />
          Back to home
        </a>
      </MotionReveal>

      <MotionReveal className="mt-8 rounded-[2rem] border border-border/70 bg-surface/80 p-6 shadow-panel backdrop-blur sm:p-8" delay={0.05}>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <span className="rounded-full border border-accent/20 bg-accentSoft px-3 py-1 font-semibold uppercase tracking-[0.18em] text-accent">
            Notion-backed article
          </span>
          {fallback ? <span>{fallback.tag}</span> : null}
          {state.status === "success" ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={14} />
              {state.article.readingTimeMinutes} min read
            </span>
          ) : null}
          {state.status === "success" ? <span>Updated {formatDate(state.article.lastEditedTime)}</span> : null}
        </div>

        <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          {state.status === "success" ? state.article.title : fallback?.title ?? "Loading article"}
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
          {state.status === "success"
            ? state.article.excerpt
            : fallback?.summary ?? "Loading the latest Notion content through the secure Netlify bridge."}
        </p>

        {state.status === "success" && state.article.url ? (
          <a
            href={state.article.url}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent"
          >
            Open original Notion page
            <ExternalLink size={15} />
          </a>
        ) : null}
      </MotionReveal>

      {state.status === "loading" ? (
        <MotionReveal className="mt-8 flex min-h-[18rem] items-center justify-center rounded-[2rem] border border-border/70 bg-surface/75 p-8 shadow-panel" delay={0.1}>
          <div className="flex items-center gap-3 text-muted">
            <LoaderCircle className="animate-spin" size={20} />
            Loading secure Notion content...
          </div>
        </MotionReveal>
      ) : null}

      {state.status === "error" ? (
        <MotionReveal className="mt-8 rounded-[2rem] border border-rose-500/20 bg-rose-500/10 p-8 shadow-panel" delay={0.1}>
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 text-rose-500" size={18} />
            <div>
              <h2 className="font-display text-2xl font-semibold text-text">Article unavailable</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{state.message}</p>
              <p className="mt-3 text-sm leading-7 text-muted">
                For local development, run the frontend with Netlify so the browser can reach the function endpoint.
              </p>
            </div>
          </div>
        </MotionReveal>
      ) : null}

      {state.status === "success" ? (
        <MotionReveal className="mt-8 rounded-[2rem] border border-border/70 bg-surface/80 p-6 shadow-panel sm:p-8" delay={0.1}>
          <article
            className="prose prose-slate max-w-none prose-headings:font-display prose-headings:tracking-tight prose-a:text-accent dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: state.article.html }}
          />
        </MotionReveal>
      ) : null}

      <MotionReveal className="mt-10 rounded-[2rem] border border-border/70 bg-canvas/70 p-6 sm:p-8" delay={0.15}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">More content paths</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-text">Continue through the knowledge hub</h2>
          </div>
          <a
            href={fallback ? getBlogHref(fallback.slug) : "#blogs"}
            className="inline-flex items-center justify-center rounded-full border border-border/70 bg-surface px-5 py-3 text-sm font-semibold text-text transition hover:border-accent/35"
          >
            Refresh this article
          </a>
        </div>
      </MotionReveal>
    </main>
  );
};
