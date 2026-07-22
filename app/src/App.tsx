import { useEffect, useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { AboutSection } from "@/components/AboutSection";
import { BlogArticlePage } from "@/components/BlogArticlePage";
import { BlogFilters } from "@/components/BlogFilters";
import { ContentGrid } from "@/components/ContentGrid";
import { FeaturedCategories } from "@/components/FeaturedCategories";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MotionReveal } from "@/components/MotionReveal";
import {
  interviewQuestions,
  latestBlogs,
  site
} from "@/data/siteContent";
import { getBlogHref, getRouteFromHash, type AppRoute } from "@/lib/routes";
import { fetchPublishedBlogs, getCachedBlogs } from "@/lib/api";
import type { BlogPost } from "@/types";

const cardClassName =
  "rounded-[1.75rem] border border-border/70 bg-surface/75 p-6 shadow-panel backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-accent/35 hover:bg-elevated";

interface HomePageProps {
  posts: BlogPost[];
  isLoading: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

const HomePage = ({
  posts,
  isLoading,
  hasMore,
  isLoadingMore,
  onLoadMore
}: HomePageProps) => {
  const displayPosts = posts.length > 0 ? posts : (isLoading ? [] : latestBlogs);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");

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
            <p className="mt-4 text-base font-semibold text-text">Pulling articles from Notion…</p>
            <p className="mt-1 text-xs text-muted">Loading latest DevOps & SRE writeups</p>
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
              <article className="flex h-full flex-col rounded-[1.75rem] border border-border/70 bg-surface/75 p-6 shadow-panel backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-accent/35 hover:bg-elevated">
                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                    {post.tag}
                  </span>
                  <span className="text-sm text-muted">{post.readTime}</span>
                </div>
                <h3 className="mt-6 font-display text-2xl font-semibold text-text">{post.title}</h3>
                <p className="mt-4 flex-1 text-sm leading-7 text-muted">{post.summary}</p>
                <a href={getBlogHref(post.slug)} className="mt-6 inline-flex text-sm font-semibold text-accent">
                  Read article
                </a>
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
      >
        {interviewQuestions.map((topic, index) => (
          <MotionReveal key={topic.title} delay={0.04 * index}>
            <article className={cardClassName}>
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{topic.level}</span>
              <h3 className="mt-5 font-display text-2xl font-semibold text-text">{topic.title}</h3>
              <p className="mt-4 text-sm leading-7 text-muted">{topic.description}</p>
              <a href={topic.href} className="mt-6 inline-flex text-sm font-semibold text-accent">
                Browse questions
              </a>
            </article>
          </MotionReveal>
        ))}
      </ContentGrid>

      <AboutSection />
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
    if (cached && cached.posts.length > 0) {
      setBlogs(cached.posts);
      setHasMore(cached.hasMore);
      setNextCursor(cached.nextCursor);
      setIsLoadingBlogs(false);
    }

    // Fetch initial page from network (with stale-while-revalidate background callback)
    fetchPublishedBlogs(undefined, 10, (freshData) => {
      if (mounted && freshData.posts.length > 0) {
        setBlogs(freshData.posts);
        setHasMore(freshData.hasMore);
        setNextCursor(freshData.nextCursor);
      }
    })
      .then((data) => {
        if (mounted && data.posts.length > 0) {
          setBlogs(data.posts);
          setHasMore(data.hasMore);
          setNextCursor(data.nextCursor);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch published blogs dynamically:", err);
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

  useEffect(() => {
    if (route.name === "blog") {
      const activeBlog = blogs.find((post) => post.slug === route.slug) || latestBlogs.find((post) => post.slug === route.slug);
      document.title = `${activeBlog?.title ?? "Blog"} | ${site.name}`;
    } else {
      document.title = `${site.name} | ${site.tagline}`;
    }
  }, [route, blogs]);

  return (
    <div className="min-h-screen bg-canvas text-text">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 mx-auto h-[34rem] max-w-6xl bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_50%),radial-gradient(circle_at_20%_15%,_rgba(251,113,133,0.16),_transparent_28%)] blur-3xl dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_45%),radial-gradient(circle_at_20%_15%,_rgba(251,113,133,0.12),_transparent_24%)]" />
      <div className="relative z-10">
        <Header />
        {route.name === "blog" ? (
          <BlogArticlePage slug={route.slug} allPosts={blogs.length > 0 ? blogs : latestBlogs} />
        ) : (
          <HomePage
            posts={blogs}
            isLoading={isLoadingBlogs}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
          />
        )}
        <Footer />
      </div>
    </div>
  );
}

export default App;
