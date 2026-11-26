import { ArrowRight, BookOpen, ChevronDown, EyeOff, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BlogPost, InterviewQuestion } from "@/types";
import {
  getLastRead,
  readLearningProfile,
  recordCodeCopied,
  recordContentOpened,
  recordReadingProgress,
  setCompanionEnabled,
  type LearningContent,
  type LearningProfile
} from "@/lib/learningProfile";
import { getRecommendation } from "@/lib/recommendations";
import type { AppRoute } from "@/lib/routes";

type CompanionProps = { route: AppRoute; blogs: BlogPost[]; questions: InterviewQuestion[] };
type CompanionMood = "idle" | "welcome" | "focused" | "success" | "encouraging";

const getContent = (route: AppRoute, blogs: BlogPost[], questions: InterviewQuestion[]): LearningContent | undefined => {
  if (route.name === "home") return undefined;
  if (route.name === "blog") {
    const post = blogs.find((item) => item.slug === route.slug);
    if (!post) return undefined;
    return { type: "blog", slug: post.slug, title: post.title, href: post.href, topics: [post.domain ?? "", post.module ?? "", post.tag].filter(Boolean) };
  }
  const question = questions.find((item) => item.slug === route.slug);
  if (!question) return undefined;
  return { type: "interview", slug: question.slug, title: question.question, href: question.href, topics: [question.domain, ...question.keywords] };
};

export const Companion = ({ route, blogs, questions }: CompanionProps) => {
  const content = useMemo(() => getContent(route, blogs, questions), [route, blogs, questions]);
  const [profile, setProfile] = useState<LearningProfile>(() => readLearningProfile());
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState<CompanionMood>("idle");
  const [isScrolling, setIsScrolling] = useState(false);
  const lastProgress = useRef(0);
  const scrollTimer = useRef<number | undefined>(undefined);
  const recommendation = useMemo(() => getRecommendation(profile, content, blogs, questions), [profile, content, blogs, questions]);
  const lastRead = getLastRead(profile);
  const isReturning = Date.now() - new Date(profile.lastActiveAt).getTime() > 24 * 60 * 60 * 1000;

  useEffect(() => {
    if (!content) return;
    recordContentOpened(content);
    setProfile(readLearningProfile());
    setMood(isReturning ? "welcome" : "focused");
    lastProgress.current = 0;
  }, [content]);

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
      const milestone = Math.floor(progress / 25) * 25;
      if (milestone > lastProgress.current && milestone > 0) {
        lastProgress.current = milestone;
        recordReadingProgress(content, progress);
        setProfile(readLearningProfile());
        if (milestone >= 50) setMood("encouraging");
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.clearTimeout(scrollTimer.current);
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

  const message = mood === "welcome"
    ? "Welcome back. Continue where you left off?"
    : mood === "success"
      ? "Nice. That code is copied and ready to use."
      : mood === "encouraging"
        ? `Good progress. You are exploring ${content?.topics[0] ?? "a useful topic"}.`
        : content
          ? `Reading ${content.type === "blog" ? "article" : "answer"}. Take your time.`
          : recommendation
            ? `You might enjoy ${recommendation.title}.`
            : lastRead
              ? `Continue reading ${lastRead.title}?`
              : "Pick a topic and I will keep your place here.";

  return (
    <div className={`sr-companion ${isScrolling ? "sr-companion--scrolling" : ""}`}>
      {open && (
        <section className="sr-companion__tray" aria-label="Learning companion">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent"><Sparkles size={14} aria-hidden="true" /> Learning companion</div>
            <button type="button" className="sr-companion__icon-button" onClick={() => setOpen(false)} aria-label="Close companion"><X size={16} /></button>
          </div>
          <p className="mt-4 text-sm font-semibold leading-6 text-text">{message}</p>
          {(profile.counts.articlesOpened > 0 || profile.counts.questionsOpened > 0) && (
            <p className="mt-2 text-xs leading-5 text-muted">
              {profile.counts.articlesOpened} articles · {profile.counts.questionsOpened} questions explored
            </p>
          )}
          {mood === "welcome" && lastRead ? (
            <a className="sr-companion__action" href={lastRead.href} onClick={() => setOpen(false)}><BookOpen size={15} aria-hidden="true" /> Continue reading <ArrowRight size={15} aria-hidden="true" /></a>
          ) : recommendation ? (
            <a className="sr-companion__action" href={recommendation.href} onClick={() => setOpen(false)}>Explore suggestion <ArrowRight size={15} aria-hidden="true" /></a>
          ) : null}
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-3">
            <button type="button" className="sr-companion__quiet-action" onClick={handleHide}><EyeOff size={14} aria-hidden="true" /> Hide companion</button>
            <button type="button" className="sr-companion__quiet-action" onClick={() => setOpen(false)}><ChevronDown size={14} aria-hidden="true" /> Minimise</button>
          </div>
        </section>
      )}
      <button type="button" className={`sr-companion__button ${mood === "success" ? "sr-companion__button--success" : ""}`} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Minimise learning companion" : "Open learning companion"}>
        <img src="/mascot-adaptive-light-dark.svg" alt="" aria-hidden="true" />
        {content && <span className="sr-companion__progress" aria-hidden="true" />}
      </button>
    </div>
  );
};
