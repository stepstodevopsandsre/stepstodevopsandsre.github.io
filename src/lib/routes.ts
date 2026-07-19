export const BLOG_ROUTE_PREFIX = "#/blog/";

export type AppRoute =
  | { name: "home" }
  | { name: "blog"; slug: string };

export const getRouteFromHash = (hash: string): AppRoute => {
  if (hash.startsWith(BLOG_ROUTE_PREFIX)) {
    const slug = hash.slice(BLOG_ROUTE_PREFIX.length).trim();

    if (slug) {
      return { name: "blog", slug: decodeURIComponent(slug) };
    }
  }

  return { name: "home" };
};

export const getBlogHref = (slug: string) => `${BLOG_ROUTE_PREFIX}${encodeURIComponent(slug)}`;
