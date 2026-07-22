import { latestBlogs } from "@/data/siteContent";
import type { BlogArticle, BlogPost } from "@/types";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const DEFAULT_PRODUCTION_API_BASE_URL = "https://stepstodevopsandsre.netlify.app";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL
const BLOGS_CACHE_KEY = "notion_blogs_cache_v2";
const ARTICLE_CACHE_PREFIX = "notion_article_cache_v2_";

const getApiBaseUrl = () => {
  const configured = import.meta.env.VITE_BLOG_API_BASE_URL;

  if (configured) {
    return trimTrailingSlash(configured);
  }

  if (window.location.hostname === "localhost") {
    return "http://localhost:8888";
  }

  if (window.location.hostname === "stepstodevopsandsre.github.io") {
    return DEFAULT_PRODUCTION_API_BASE_URL;
  }

  return "";
};

const getEndpoint = (path: string) => {
  const baseUrl = getApiBaseUrl();
  return baseUrl ? `${baseUrl}${path}` : path;
};

export const getBlogEndpoint = (slug: string) =>
  getEndpoint(`/.netlify/functions/blog?slug=${encodeURIComponent(slug)}`);

export const getBlogsEndpoint = (cursor?: string, pageSize = 10) => {
  const params = new URLSearchParams();
  params.set("pageSize", String(pageSize));
  if (cursor) {
    params.set("cursor", cursor);
  }
  return getEndpoint(`/.netlify/functions/blogs?${params.toString()}`);
};

/**
 * Replaces Notion syntax artifacts in text:
 * "****" -> " ", "**" -> " ", " —" -> "-", ", and" -> " and", ", or" -> " or"
 */
export const cleanNotionText = (text: string): string => {
  if (!text || typeof text !== "string") return text;
  return text
    .split("****").join(" ")
    .split("**").join(" ")
    .split(" —").join("-")
    .split(", and").join(" and")
    .split(", or").join(" or");
};

export const getDeterministicReadingTime = (seed: string): string => {
  if (!seed) return "7 min read";
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  // Fair distribution pool ranging from 5 to 12 mins (average ~8.3 mins)
  const pool = [5, 6, 7, 7, 8, 8, 8, 9, 9, 9, 10, 11, 12];
  const minutes = pool[absHash % pool.length];
  return `${minutes} min read`;
};

export const cleanBlogPost = (post: BlogPost): BlogPost => {
  const title = cleanNotionText(post.title);
  const summary = cleanNotionText(post.summary);
  const tag = cleanNotionText(post.tag);
  const readTime =
    !post.readTime || post.readTime === "5 min read"
      ? getDeterministicReadingTime(post.slug || post.title)
      : post.readTime;

  return {
    ...post,
    title,
    summary,
    tag,
    readTime,
    domain: post.domain ? cleanNotionText(post.domain) : undefined,
    module: post.module ? cleanNotionText(post.module) : undefined
  };
};

export const cleanBlogArticle = (article: BlogArticle): BlogArticle => ({
  ...article,
  title: cleanNotionText(article.title),
  excerpt: cleanNotionText(article.excerpt),
  html: cleanNotionText(article.html),
  markdown: cleanNotionText(article.markdown)
});

export interface FetchBlogsResult {
  posts: BlogPost[];
  hasMore: boolean;
  nextCursor: string | null;
}

interface BlogsCacheEntry {
  timestamp: number;
  data: FetchBlogsResult;
}

interface ArticleCacheEntry {
  timestamp: number;
  article: BlogArticle;
}

const getStoredBlogsCache = (): BlogsCacheEntry | null => {
  try {
    const raw = localStorage.getItem(BLOGS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BlogsCacheEntry;
    if (!parsed || !parsed.data || !Array.isArray(parsed.data.posts) || parsed.data.posts.length === 0) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const setStoredBlogsCache = (data: FetchBlogsResult) => {
  try {
    if (!data || !Array.isArray(data.posts) || data.posts.length === 0) {
      return;
    }
    const entry: BlogsCacheEntry = { timestamp: Date.now(), data };
    localStorage.setItem(BLOGS_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Ignore storage quota errors
  }
};

export const getCachedBlogs = (): FetchBlogsResult | null => {
  const cached = getStoredBlogsCache();
  return cached ? cached.data : null;
};

export const fetchPublishedBlogs = async (
  cursor?: string,
  pageSize = 10,
  onBackgroundUpdate?: (data: FetchBlogsResult) => void
): Promise<FetchBlogsResult> => {
  // Check local cache for initial load (when cursor is undefined)
  if (!cursor) {
    const cached = getStoredBlogsCache();
    const isFresh = cached && Date.now() - cached.timestamp < CACHE_TTL_MS;

    if (cached && cached.data.posts.length > 0) {
      // Trigger a background update if stale or for revalidation
      if (onBackgroundUpdate) {
        fetchPublishedBlogsFromNetwork(undefined, pageSize)
          .then((fresh) => {
            if (fresh.posts.length > 0) {
              setStoredBlogsCache(fresh);
              onBackgroundUpdate(fresh);
            }
          })
          .catch(() => {
            /* Keep existing cached data on background failure */
          });
      }
      if (isFresh || !onBackgroundUpdate) {
        return cached.data;
      }
    }
  }

  try {
    const result = await fetchPublishedBlogsFromNetwork(cursor, pageSize);

    if (!cursor) {
      if (result.posts.length > 0) {
        setStoredBlogsCache(result);
      }
    } else {
      // Append newly fetched page to existing cached list if present
      const existingCache = getStoredBlogsCache();
      if (existingCache) {
        const existingSlugs = new Set(existingCache.data.posts.map((p) => p.slug));
        const newPosts = result.posts.filter((p) => !existingSlugs.has(p.slug));
        const updatedPosts = [...existingCache.data.posts, ...newPosts];
        const updatedData: FetchBlogsResult = {
          posts: updatedPosts,
          hasMore: result.hasMore,
          nextCursor: result.nextCursor
        };
        setStoredBlogsCache(updatedData);
      }
    }

    return result;
  } catch (err) {
    if (!cursor) {
      const cached = getStoredBlogsCache();
      if (cached && cached.data.posts.length > 0) {
        return cached.data;
      }
      return {
        posts: latestBlogs.map(cleanBlogPost),
        hasMore: false,
        nextCursor: null
      };
    }
    throw err;
  }
};

const fetchPublishedBlogsFromNetwork = async (
  cursor?: string,
  pageSize = 10
): Promise<FetchBlogsResult> => {
  const response = await fetch(getBlogsEndpoint(cursor, pageSize), {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Unable to load blog index (${response.status}).`);
  }

  const payload = (await response.json()) as {
    posts?: BlogPost[];
    hasMore?: boolean;
    nextCursor?: string | null;
  };

  const rawPosts = payload.posts ?? [];
  let posts = rawPosts.map(cleanBlogPost);

  if (!cursor && posts.length === 0) {
    posts = latestBlogs.map(cleanBlogPost);
  }

  return {
    posts,
    hasMore: payload.hasMore ?? false,
    nextCursor: payload.nextCursor ?? null
  };
};

export const fetchBlogArticle = async (slug: string): Promise<BlogArticle> => {
  const cacheKey = `${ARTICLE_CACHE_PREFIX}${slug}`;

  // Check localStorage cache
  try {
    const cachedRaw = localStorage.getItem(cacheKey);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw) as ArticleCacheEntry;
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.article;
      }
    }
  } catch {
    // Ignore cache parse errors
  }

  const response = await fetch(getBlogEndpoint(slug), {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    let message = `Unable to load article (${response.status}).`;

    try {
      const payload = await response.json();
      if (payload?.error) {
        message = payload.error;
      }
    } catch {
      // Keep status-based message when error payload is not JSON
    }

    throw new Error(message);
  }

  const rawArticle = (await response.json()) as BlogArticle;
  const article = cleanBlogArticle(rawArticle);

  // Save to article cache
  try {
    const entry: ArticleCacheEntry = { timestamp: Date.now(), article };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch {
    // Ignore quota errors
  }

  // Update cached blog index readTime if article has accurate reading time
  if (article.readingTimeMinutes) {
    const blogsCache = getStoredBlogsCache();
    if (blogsCache) {
      let modified = false;
      const updatedPosts = blogsCache.data.posts.map((p) => {
        if (p.slug === slug) {
          modified = true;
          return { ...p, readTime: `${article.readingTimeMinutes} min read` };
        }
        return p;
      });
      if (modified) {
        setStoredBlogsCache({ ...blogsCache.data, posts: updatedPosts });
      }
    }
  }

  return article;
};
