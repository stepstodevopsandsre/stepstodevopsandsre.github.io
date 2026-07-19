import type { BlogArticle, BlogPost } from "@/types";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const DEFAULT_PRODUCTION_API_BASE_URL = "https://stepstodevopsandsre.netlify.app";

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

export const getBlogsEndpoint = () => getEndpoint("/.netlify/functions/blogs");

export const fetchBlogArticle = async (slug: string): Promise<BlogArticle> => {
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
      // Keep the status-based message when the error payload is not JSON.
    }

    throw new Error(message);
  }

  return response.json() as Promise<BlogArticle>;
};

export const fetchPublishedBlogs = async (): Promise<BlogPost[]> => {
  const response = await fetch(getBlogsEndpoint(), {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Unable to load blog index (${response.status}).`);
  }

  const payload = (await response.json()) as { posts?: BlogPost[] };
  return payload.posts ?? [];
};
