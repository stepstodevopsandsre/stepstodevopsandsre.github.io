import { AlertTriangle, ArrowRight, BookOpen, ChevronDown, EyeOff, History, Minus, Plus, RotateCcw, Sparkles, X } from "lucide-react";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import type { BlogPost, InterviewQuestion } from "@/types";
import {
  getLastRead,
  readLearningProfile,
  recordCodeCopied,
  recordContentOpened,
  recordReadingProgress,
  clearLearningHistory,
  setPersonalisedSuggestionsEnabled,
  setMascotScale,
  setCompanionEnabled,
  type LearningContent,
  type LearningProfile
} from "@/lib/learningProfile";
import { getRecommendation, getRecommendationReason } from "@/lib/recommendations";
import { getBlogHref, getInterviewQuestionHref, type AppRoute } from "@/lib/routes";
import { Mascot } from "./Mascot";

type CompanionProps = { route: AppRoute; blogs: BlogPost[]; questions: InterviewQuestion[] };
type CompanionMood = "idle" | "welcome" | "focused" | "success" | "completed" | "encouraging" | "error";

const getContent = (route: AppRoute, blogs: BlogPost[], questions: InterviewQuestion[]): LearningContent | undefined => {
  if (route.name === "home") return undefined;
  if (route.name === "practiceList" || route.name === "practiceProblem") return undefined;
  if (route.name === "blog") {
    const post = blogs.find((item) => item.slug === route.slug);
    if (!post) return { type: "blog", slug: route.slug, title: "Article unavailable", href: getBlogHref(route.slug), topics: [] };
    return { type: "blog", slug: post.slug, title: post.title, href: post.href, topics: [post.domain ?? "", post.module ?? "", post.tag].filter(Boolean) };
  }
  const question = questions.find((item) => item.slug === route.slug);
  if (!question) return { type: "interview", slug: route.slug, title: "Interview answer unavailable", href: getInterviewQuestionHref(route.slug), topics: [] };
  return { type: "interview", slug: question.slug, title: question.question, href: question.href, topics: [question.domain, ...question.keywords] };
};

export const Companion = ({ route, blogs, questions }: CompanionProps) => {
  const content = useMemo(() => getContent(route, blogs, questions), [route, blogs, questions]);
  const [profile, setProfile] = useState<LearningProfile>(() => readLearningProfile());
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState<CompanionMood>("idle");
  const [errorType, setErrorType] = useState<LearningContent["type"] | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [progress, setProgress] = useState(0);
  const lastProgress = useRef(0);
  const scrollTimer = useRef<number | undefined>(undefined);
  const progressFrame = useRef<number>(0);
  const recommendation = useMemo(
    () => profile.personalisedSuggestionsEnabled ? getRecommendation(profile, content, blogs, questions) : undefined,
    [profile, content, blogs, questions]
  );
  const recommendationReason = useMemo(() => getRecommendationReason(profile, recommendation), [profile, recommendation]);
  const lastRead = getLastRead(profile);
  const isReturning = Date.now() - new Date(profile.lastActiveAt).getTime() > 24 * 60 * 60 * 1000;

  useEffect(() => {
    if (!content) {
      setMood("idle");
      setErrorType(null);
      setProgress(0);
      lastProgress.current = 0;
      return;
    }
    recordContentOpened(content);
    setProfile(readLearningProfile());
    setMood(isReturning ? "welcome" : "focused");
    setErrorType(null);
    const previous = readLearningProfile().reads.find((item) => item.slug === content.slug && item.type === content.type);
    const previousProgress = previous?.progress ?? 0;
    lastProgress.current = Math.floor(previousProgress / 25) * 25;
    setProgress(previousProgress >= 90 ? 100 : previousProgress);
  }, [content]);

  useEffect(() => {
    const handleContentError = (event: Event) => {
      const detail = (event as CustomEvent<{ type?: LearningContent["type"]; slug?: string }>).detail;
      if (!content || detail?.slug !== content.slug) return;
      setErrorType(detail.type ?? content.type);
      setMood("error");
      setOpen(false);
    };
    window.addEventListener("sr:content-error", handleContentError);
    return () => window.removeEventListener("sr:content-error", handleContentError);
  }, [content]);

  useEffect(() => {
    const handleContentRetry = (event: Event) => {
      const detail = (event as CustomEvent<{ type?: LearningContent["type"]; slug?: string }>).detail;
      if (!content || detail?.slug !== content.slug) return;
      setErrorType(null);
      setMood("focused");
    };
    window.addEventListener("sr:content-retry", handleContentRetry);
    return () => window.removeEventListener("sr:content-retry", handleContentRetry);
  }, [content]);

  useEffect(() => {
    if (mood === "idle" || mood === "focused") return;
    if (mood === "error") return;
    const duration = mood === "completed" ? 5200 : 2800;
    const timer = window.setTimeout(() => setMood(content ? "focused" : "idle"), duration);
    return () => window.clearTimeout(timer);
  }, [mood, content]);

  useEffect(() => {
    const handleCodeCopied = () => {
      recordCodeCopied();
      setProfile(readLearningProfile());
      setMood("success");
    };
    window.addEventListener("sr:code-copied", handleCodeCopied);
    return () => window.removeEventListener("sr:code-copied", handleCodeCopied);
  }, []);

  useEffect(() => {
    if (!content) return;
    const handleScroll = () => {
      setIsScrolling(true);
      setOpen(false);
      window.clearTimeout(scrollTimer.current);
      scrollTimer.current = window.setTimeout(() => setIsScrolling(false), 420);
      const height = document.documentElement.scrollHeight - window.innerHeight;
      if (height <= 0) return;
      const progress = Math.min(100, Math.max(0, (window.scrollY / height) * 100));
      window.cancelAnimationFrame(progressFrame.current);
      progressFrame.current = window.requestAnimationFrame(() => setProgress(progress >= 90 ? 100 : Math.round(progress)));
      const milestone = Math.floor(progress / 25) * 25;
      if (milestone > lastProgress.current && milestone > 0) {
        lastProgress.current = milestone;
        setProgress(Math.round(progress));
        recordReadingProgress(content, progress);
        setProfile(readLearningProfile());
        if (milestone >= 90) setMood("completed");
        else if (milestone >= 50) setMood("encouraging");
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.clearTimeout(scrollTimer.current);
      window.cancelAnimationFrame(progressFrame.current);
    };
  }, [content]);

  if (!profile.companionEnabled) {
    return (
      <div className="sr-companion sr-companion--hidden-state">
        <button
          type="button"
          className="sr-companion__restore"
          onClick={() => {
            setCompanionEnabled(true);
            setProfile(readLearningProfile());
          }}
          aria-label="Show learning companion"
          title="Show learning companion"
        >
          <Sparkles size={15} aria-hidden="true" />
        </button>
      </div>
    );
  }

  const handleHide = () => {
    setCompanionEnabled(false);
    setProfile(readLearningProfile());
    setOpen(false);
  };

  const message = mood === "error"
    ? "Could not load"
    : mood === "completed"
      ? "Completed"
      : mood === "welcome"
    ? "Welcome back. Continue where you left off?"
    : mood === "success"
      ? "Nice. That code is copied and ready to use."
      : mood === "encouraging"
        ? `Good progress. You are exploring ${content?.topics[0] ?? "a useful topic"}.`
        : content
          ? `Reading ${content.type === "blog" ? "article" : "answer"}. Take your time.`
          : recommendation
            ? recommendationReason
            : lastRead
              ? `Continue reading ${lastRead.title}?`
              : "Pick a topic and I will keep your place here.";

  return (
    <div className={`sr-companion ${isScrolling ? "sr-companion--scrolling" : ""}`}>
      {open && (
        <section className={`sr-companion__tray ${mood === "error" ? "sr-companion__tray--error" : ""}`} aria-label="Learning companion" aria-live="polite">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent"><Sparkles size={14} aria-hidden="true" /> Learning companion</div>
            <button type="button" className="sr-companion__icon-button" onClick={() => setOpen(false)} aria-label="Close companion"><X size={16} /></button>
          </div>
          {mood === "error" ? (
            <div className="sr-companion__error-state" role="alert">
              <div className="sr-companion__error-icon"><AlertTriangle size={18} aria-hidden="true" /></div>
              <div>
                <p className="text-sm font-semibold text-text">Could not load</p>
                <span className="sr-only">This page did not load. Retry or return to the list.</span>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm font-semibold leading-6 text-text">{message}</p>
          )}
          {(profile.counts.articlesOpened > 0 || profile.counts.questionsOpened > 0) && (
            <p className="mt-2 text-xs leading-5 text-muted">
              {profile.counts.articlesOpened} articles · {profile.counts.questionsOpened} questions explored
            </p>
          )}
          {mood === "error" ? (
            <div className="sr-companion__error-actions">
              <button type="button" className="sr-companion__action" onClick={() => {
                window.dispatchEvent(new CustomEvent("sr:content-retry", { detail: { type: errorType, slug: content?.slug } }));
              }}><RotateCcw size={15} aria-hidden="true" /> Retry</button>
              <a className="sr-companion__quiet-action" href={errorType === "interview" ? "#interview-questions" : "#blogs"} onClick={() => setOpen(false)}>Back to list</a>
            </div>
          ) : mood === "welcome" && lastRead ? (
            <a className="sr-companion__action" href={lastRead.href} onClick={() => setOpen(false)}><BookOpen size={15} aria-hidden="true" /> Continue reading <ArrowRight size={15} aria-hidden="true" /></a>
          ) : recommendation ? (
            <a className="sr-companion__action" href={recommendation.href} onClick={() => setOpen(false)}>Explore suggestion <ArrowRight size={15} aria-hidden="true" /></a>
          ) : null}
          {content && (
            <div className="sr-companion__progress-copy">
              <span>Reading progress</span>
              <strong>{progress}%</strong>
            </div>
          )}
          <div className="sr-companion__size-control">
            <span>Mascot size</span>
            <div className="sr-companion__size-actions">
              <button
                type="button"
                className="sr-companion__size-button"
                onClick={() => {
                  setMascotScale(profile.mascotScale - 0.1);
                  setProfile(readLearningProfile());
                }}
                disabled={profile.mascotScale <= 0.8}
                aria-label="Make mascot smaller"
              >
                <Minus size={14} />
              </button>
              <span aria-live="polite">{Math.round(profile.mascotScale * 100)}%</span>
              <button
                type="button"
                className="sr-companion__size-button"
                onClick={() => {
                  setMascotScale(profile.mascotScale + 0.1);
                  setProfile(readLearningProfile());
                }}
                disabled={profile.mascotScale >= 1.2}
                aria-label="Make mascot larger"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-3">
            <button
              type="button"
              className="sr-companion__quiet-action"
              onClick={() => {
                const next = !profile.personalisedSuggestionsEnabled;
                setPersonalisedSuggestionsEnabled(next);
                setProfile(readLearningProfile());
              }}
              title="Toggle personalised suggestions"
            >
              <Sparkles size={14} aria-hidden="true" /> {profile.personalisedSuggestionsEnabled ? "Suggestions on" : "Suggestions off"}
            </button>
            <button type="button" className="sr-companion__quiet-action" onClick={handleHide}><EyeOff size={14} aria-hidden="true" /> Hide companion</button>
            <button
              type="button"
              className="sr-companion__quiet-action"
              onClick={() => {
                clearLearningHistory();
                setProfile(readLearningProfile());
                setProgress(0);
                setMood(content ? "focused" : "idle");
              }}
              title="Clear saved learning history"
            >
              <History size={14} aria-hidden="true" /> Clear
            </button>
          </div>
        </section>
      )}
      <button type="button" className={`sr-companion__button ${mood === "success" || mood === "completed" ? "sr-companion__button--success" : ""} ${mood === "error" ? "sr-companion__button--error" : ""}`} style={{ "--companion-progress": `${progress}%`, "--mascot-scale": profile.mascotScale } as CSSProperties} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Minimise learning companion" : "Open learning companion"}>
        <Mascot mood={mood} progress={progress} />
        {content && <span className="sr-companion__progress" aria-hidden="true" />}
      </button>
    </div>
  );
};
