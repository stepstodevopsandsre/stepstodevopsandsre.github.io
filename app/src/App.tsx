import { useEffect, useMemo, useState } from "react";
import { Eye, LoaderCircle } from "lucide-react";
import { AboutSection } from "@/components/AboutSection";
import { BlogArticlePage } from "@/components/BlogArticlePage";
import { BlogPreviewModal } from "@/components/BlogPreviewModal";
import { BlogFilters } from "@/components/BlogFilters";
import { ContentGrid } from "@/components/ContentGrid";
import { FeaturedCategories } from "@/components/FeaturedCategories";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { InterviewQuestionFilters } from "@/components/InterviewQuestionFilters";
import { InterviewQuestionPage } from "@/components/InterviewQuestionPage";
import { MotionReveal } from "@/components/MotionReveal";
import {
  latestInterviewQuestions,
  latestBlogs,
  site
} from "@/data/siteContent";
import { getBlogHref, getInterviewQuestionHref, getRouteFromHash, type AppRoute } from "@/lib/routes";
import {
  cleanBlogPost,
  cleanInterviewQuestion,
  fetchPublishedBlogs,
  fetchPublishedInterviewQuestions,
  getCachedBlogs,
  getCachedInterviewQuestions
} from "@/lib/api";
import type { BlogPost, InterviewQuestion } from "@/types";

const cardClassName =
  "flex h-[18rem] flex-col overflow-hidden rounded-[1.5rem] border border-border/70 bg-surface/75 p-5 shadow-panel backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-accent/35 hover:bg-elevated";

interface HomePageProps {
  posts: BlogPost[];
  isLoading: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  questions: InterviewQuestion[];
  isLoadingQuestions: boolean;
  hasMoreQuestions: boolean;
  isLoadingMoreQuestions: boolean;
  onLoadMoreQuestions: () => void;
  questionDifficulty: string;
  onQuestionDifficultyChange: (value: string) => void;
}

const HomePage = ({
  posts,
  isLoading,
  hasMore,
  isLoadingMore,
  onLoadMore,
  questions,
  isLoadingQuestions,
  hasMoreQuestions,
  isLoadingMoreQuestions,
  onLoadMoreQuestions,
  questionDifficulty,
  onQuestionDifficultyChange
}: HomePageProps) => {
  const displayPosts = posts.length > 0 ? posts : (isLoading ? [] : latestBlogs);
  const displayQuestions =
    questions.length > 0 ? questions : (isLoadingQuestions ? [] : latestInterviewQuestions);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [questionDifficultyFilter, setQuestionDifficultyFilter] = useState(questionDifficulty);
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);

  const categories = useMemo(
    () => [...new Set(displayPosts.map((post) => post.tag).filter(Boolean))].sort(),
    [displayPosts]
  );

  const domains = useMemo(
    () => [...new Set(displayPosts.map((post) => post.domain).filter(Boolean))].sort() as string[],
    [displayPosts]
  );

  const filteredPosts = useMemo(
    () =>
      displayPosts.filter((post) => {
        const matchesCategory = categoryFilter === "all" || post.tag === categoryFilter;
        const matchesDomain = domainFilter === "all" || post.domain === domainFilter;
        return matchesCategory && matchesDomain;
      }),
    [displayPosts, categoryFilter, domainFilter]
  );

  const hasActiveFilters = categoryFilter !== "all" || domainFilter !== "all";

  const filteredQuestions = displayQuestions;
  const hasActiveQuestionFilters = questionDifficultyFilter !== "all";

  return (
    <main>
      <Hero />

      <ContentGrid
        id="blogs"
        eyebrow="Latest Articles"
        title="Learn, Prepare and Get Ready"
        description=""
        headerActions={
          <BlogFilters
            categories={categories}
            domains={domains}
            categoryFilter={categoryFilter}
            domainFilter={domainFilter}
            onCategoryChange={setCategoryFilter}
            onDomainChange={setDomainFilter}
            onClear={() => {
              setCategoryFilter("all");
              setDomainFilter("all");
            }}
            hasActiveFilters={hasActiveFilters}
          />
        }
      >
        {isLoading && displayPosts.length === 0 ? (
          <div className="col-span-full flex min-h-[16rem] flex-col items-center justify-center rounded-[1.75rem] border border-border/70 bg-surface/75 p-8 text-center shadow-panel backdrop-blur">
            <LoaderCircle className="animate-spin text-accent" size={36} />
            <p className="mt-4 text-base font-semibold text-text">Loading latest articles…</p>
            <p className="mt-1 text-xs text-muted">Preparing the latest DevOps & SRE writeups</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="col-span-full rounded-[1.75rem] border border-border/70 bg-surface/75 p-8 text-center shadow-panel">
            <p className="text-muted">No articles match the selected filters.</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter("all");
                  setDomainFilter("all");
                }}
                className="mt-4 text-sm font-semibold text-accent"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filteredPosts.map((post, index) => (
            <MotionReveal key={post.slug} delay={0.04 * index}>
              <article className="flex h-[18rem] flex-col overflow-hidden rounded-[1.5rem] border border-border/70 bg-surface/75 p-5 shadow-panel backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-accent/35 hover:bg-elevated">
                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-full bg-accentSoft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                    {post.tag}
                  </span>
                  <span className="text-xs text-muted">{post.readTime}</span>
                </div>
                <h3 className="mt-5 line-clamp-4 font-display text-xl font-semibold leading-tight text-text">{post.title}</h3>
                <div className="mt-auto flex items-center justify-between gap-4 border-t border-border/60 pt-5">
                  <a href={getBlogHref(post.slug)} className="text-sm font-semibold text-accent transition hover:text-text">
                    Read article
                  </a>
                  <button
                    type="button"
                    onClick={() => setPreviewPost(post)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-accent"
                    aria-label={`Preview ${post.title}`}
                    title="Preview article"
                  >
                    <Eye size={16} />
                    Preview
                  </button>
                </div>
              </article>
            </MotionReveal>
          ))
        )}

        {hasMore && !hasActiveFilters && (
          <div className="col-span-full mt-4 flex justify-center">
            <button
              type="button"
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface/90 px-6 py-3 text-sm font-semibold text-text shadow-panel backdrop-blur transition hover:border-accent/40 hover:bg-elevated disabled:opacity-50"
            >
              {isLoadingMore ? (
                <>
                  <LoaderCircle className="animate-spin text-accent" size={16} />
                  Loading more articles…
                </>
              ) : (
                <>Load More Articles ↓</>
              )}
            </button>
          </div>
        )}
      </ContentGrid>

      <FeaturedCategories />

      <ContentGrid
        id="interview-questions"
        eyebrow="Interview Questions"
        title="Prepare for Interviews with Confidence"
        description="Practice Questions around Linux, cloud, Kubernetes, observability and production cases ."
        headerActions={
          <InterviewQuestionFilters
            difficultyFilter={questionDifficultyFilter}
            onDifficultyChange={(value) => {
              setQuestionDifficultyFilter(value);
              onQuestionDifficultyChange(value);
            }}
            onClear={() => {
              setQuestionDifficultyFilter("all");
              onQuestionDifficultyChange("all");
            }}
            hasActiveFilters={hasActiveQuestionFilters}
          />
        }
      >
        {isLoadingQuestions && displayQuestions.length === 0 ? (
          <div className="col-span-full flex min-h-[16rem] flex-col items-center justify-center rounded-[1.75rem] border border-border/70 bg-surface/75 p-8 text-center shadow-panel backdrop-blur">
            <LoaderCircle className="animate-spin text-accent" size={36} />
            <p className="mt-4 text-base font-semibold text-text">Loading interview questions…</p>
            <p className="mt-1 text-xs text-muted">Preparing the published question bank</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="col-span-full rounded-[1.75rem] border border-border/70 bg-surface/75 p-8 text-center shadow-panel">
            <p className="text-muted">No interview questions match the selected filters.</p>
            {hasActiveQuestionFilters && (
              <button
                type="button"
                onClick={() => {
                  setQuestionDifficultyFilter("all");
                  onQuestionDifficultyChange("all");
                }}
                className="mt-4 text-sm font-semibold text-accent"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filteredQuestions.map((question, index) => (
            <MotionReveal key={question.slug} delay={0.04 * index}>
              <article className={cardClassName}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    {question.domain}
                  </span>
                  <span className="rounded-full border border-border/70 px-3 py-1 text-xs font-semibold text-muted">
                    {question.difficulty}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold leading-tight text-text">{question.question}</h3>
                {question.keywords.length > 0 && (
                  <div className="mt-7 flex flex-wrap gap-2">
                    {question.keywords.slice(0, 4).map((keyword) => (
                      <span key={keyword} className="rounded-full border border-border/60 bg-canvas/60 px-2.5 py-1 text-[11px] font-medium text-muted">
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
                <a href={getInterviewQuestionHref(question.slug)} className="mt-auto inline-flex pt-5 text-sm font-semibold text-accent">
                  View answer
                </a>
              </article>
            </MotionReveal>
          ))
        )}

        {hasMoreQuestions && !hasActiveQuestionFilters && (
          <div className="col-span-full mt-4 flex justify-center">
            <button
              type="button"
              onClick={onLoadMoreQuestions}
              disabled={isLoadingMoreQuestions}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface/90 px-6 py-3 text-sm font-semibold text-text shadow-panel backdrop-blur transition hover:border-accent/40 hover:bg-elevated disabled:opacity-50"
            >
              {isLoadingMoreQuestions ? (
                <>
                  <LoaderCircle className="animate-spin text-accent" size={16} />
                  Loading more questions…
                </>
              ) : (
                <>Load More Questions ↓</>
              )}
            </button>
          </div>
        )}
      </ContentGrid>

      <AboutSection />
      <BlogPreviewModal post={previewPost} onClose={() => setPreviewPost(null)} />
    </main>
  );
};

function App() {
  const [route, setRoute] = useState<AppRoute>(() => getRouteFromHash(window.location.hash));
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(true);
  const [hasMoreQuestions, setHasMoreQuestions] = useState<boolean>(false);
  const [nextQuestionsCursor, setNextQuestionsCursor] = useState<string | null>(null);
  const [isLoadingMoreQuestions, setIsLoadingMoreQuestions] = useState<boolean>(false);
  const [questionDifficulty, setQuestionDifficulty] = useState("all");

  useEffect(() => {
    const updateRoute = () => setRoute(getRouteFromHash(window.location.hash));

    window.addEventListener("hashchange", updateRoute);
    updateRoute();

    return () => {
      window.removeEventListener("hashchange", updateRoute);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    // Check cached data synchronously for instant initial load
    const cached = getCachedBlogs();
    if (cached && cached.posts && cached.posts.length > 0) {
      setBlogs(cached.posts);
      setHasMore(cached.hasMore);
      setNextCursor(cached.nextCursor);
      setIsLoadingBlogs(false);
    } else {
      setIsLoadingBlogs(true);
    }

    // Fetch initial page from network (with stale-while-revalidate background callback)
    fetchPublishedBlogs(undefined, 10, (freshData) => {
      if (mounted && freshData.posts.length > 0) {
        setBlogs(freshData.posts);
        setHasMore(freshData.hasMore);
        setNextCursor(freshData.nextCursor);
        setIsLoadingBlogs(false);
      }
    })
      .then((data) => {
        if (mounted) {
          if (data && data.posts.length > 0) {
            setBlogs(data.posts);
            setHasMore(data.hasMore);
            setNextCursor(data.nextCursor);
          } else if (blogs.length === 0) {
            setBlogs(latestBlogs.map(cleanBlogPost));
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch published blogs dynamically:", err);
        if (mounted && blogs.length === 0) {
          setBlogs(latestBlogs.map(cleanBlogPost));
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoadingBlogs(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const cached = getCachedInterviewQuestions(questionDifficulty);
    if (cached && cached.questions && cached.questions.length > 0) {
      setQuestions(cached.questions);
      setHasMoreQuestions(cached.hasMore);
      setNextQuestionsCursor(cached.nextCursor);
      setIsLoadingQuestions(false);
    } else {
      setIsLoadingQuestions(true);
    }

    fetchPublishedInterviewQuestions(undefined, 10, questionDifficulty, (freshData) => {
      if (mounted && freshData.questions.length > 0) {
        setQuestions(freshData.questions);
        setHasMoreQuestions(freshData.hasMore);
        setNextQuestionsCursor(freshData.nextCursor);
        setIsLoadingQuestions(false);
      }
    })
      .then((data) => {
        if (mounted) {
          if (data && data.questions.length > 0) {
            setQuestions(data.questions);
            setHasMoreQuestions(data.hasMore);
            setNextQuestionsCursor(data.nextCursor);
          } else if (questionDifficulty === "all") {
            setQuestions(latestInterviewQuestions.map(cleanInterviewQuestion));
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch interview questions dynamically:", err);
        if (mounted && questionDifficulty === "all") {
          setQuestions(latestInterviewQuestions.map(cleanInterviewQuestion));
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoadingQuestions(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [questionDifficulty]);

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const res = await fetchPublishedBlogs(nextCursor, 10);
      setBlogs((prev) => {
        const existingSlugs = new Set(prev.map((p) => p.slug));
        const newPosts = res.posts.filter((p) => !existingSlugs.has(p.slug));
        return [...prev, ...newPosts];
      });
      setHasMore(res.hasMore);
      setNextCursor(res.nextCursor);
    } catch (err) {
      console.error("Failed to load more blogs:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleLoadMoreQuestions = async () => {
    if (!nextQuestionsCursor || isLoadingMoreQuestions) return;
    setIsLoadingMoreQuestions(true);
    try {
      const res = await fetchPublishedInterviewQuestions(nextQuestionsCursor, 10, questionDifficulty);
      setQuestions((prev) => {
        const existingSlugs = new Set(prev.map((question) => question.slug));
        const newQuestions = res.questions.filter((question) => !existingSlugs.has(question.slug));
        return [...prev, ...newQuestions];
      });
      setHasMoreQuestions(res.hasMore);
      setNextQuestionsCursor(res.nextCursor);
    } catch (err) {
      console.error("Failed to load more interview questions:", err);
    } finally {
      setIsLoadingMoreQuestions(false);
    }
  };

  const handleQuestionDifficultyChange = (value: string) => {
    setQuestions([]);
    setNextQuestionsCursor(null);
    setHasMoreQuestions(false);
    setQuestionDifficulty(value);
  };

  useEffect(() => {
    if (route.name === "blog") {
      const activeBlog = blogs.find((post) => post.slug === route.slug) || latestBlogs.find((post) => post.slug === route.slug);
      document.title = `${activeBlog?.title ?? "Blog"} | ${site.name}`;
    } else if (route.name === "interviewQuestion") {
      const activeQuestion =
        questions.find((question) => question.slug === route.slug) ||
        latestInterviewQuestions.find((question) => question.slug === route.slug);
      document.title = `${activeQuestion?.question ?? "Interview Question"} | ${site.name}`;
    } else {
      document.title = `${site.name} | ${site.tagline}`;
    }
  }, [route, blogs, questions]);

  return (
    <div className="min-h-screen bg-canvas text-text">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 mx-auto h-[34rem] max-w-6xl bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_50%),radial-gradient(circle_at_20%_15%,_rgba(251,113,133,0.16),_transparent_28%)] blur-3xl dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_45%),radial-gradient(circle_at_20%_15%,_rgba(251,113,133,0.12),_transparent_24%)]" />
      <div className="relative z-10">
        <Header />
        {route.name === "blog" ? (
          <BlogArticlePage slug={route.slug} allPosts={blogs.length > 0 ? blogs : latestBlogs} />
        ) : route.name === "interviewQuestion" ? (
          <InterviewQuestionPage
            slug={route.slug}
            allQuestions={questions.length > 0 ? questions : latestInterviewQuestions}
          />
        ) : (
          <HomePage
            posts={blogs}
            isLoading={isLoadingBlogs}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            questions={questions}
            isLoadingQuestions={isLoadingQuestions}
            hasMoreQuestions={hasMoreQuestions}
            isLoadingMoreQuestions={isLoadingMoreQuestions}
            onLoadMoreQuestions={handleLoadMoreQuestions}
          questionDifficulty={questionDifficulty}
          onQuestionDifficultyChange={handleQuestionDifficultyChange}
          />
        )}
        <Footer />
      </div>
    </div>
  );
}

export default App;
