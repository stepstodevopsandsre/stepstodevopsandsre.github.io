import type { BlogArticle } from "@/types";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const getApiBaseUrl = () => {
  const configured = import.meta.env.VITE_BLOG_API_BASE_URL;

  if (configured) {
    return trimTrailingSlash(configured);
  }

  if (window.location.hostname === "localhost") {
    return "http://localhost:8888";
  }

  return "";
};

export const getBlogEndpoint = (slug: string) => {
  const baseUrl = getApiBaseUrl();
  const path = `/.netlify/functions/blog?slug=${encodeURIComponent(slug)}`;

  return baseUrl ? `${baseUrl}${path}` : path;
};

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
