import sanitizeHtml from "sanitize-html";

export const DEFAULT_ORIGIN = "https://stepstodevopsandsre.github.io";

export const defaultBlogPageMap = {
  "grafana-observability-p95-p99-latency": "3a15aace-fb86-8180-b37a-e46f5847cad7"
};

export const createCorsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  Vary: "Origin"
});

export const isAllowedOrigin = (origin, allowedOrigin) => {
  if (!origin) {
    return true;
  }

  return origin === allowedOrigin || origin === "http://localhost:5173" || origin === "http://localhost:8888";
};

export const parsePageMap = (rawValue) => {
  if (!rawValue) {
    return defaultBlogPageMap;
  }

  try {
    const parsed = JSON.parse(rawValue);
    return { ...defaultBlogPageMap, ...parsed };
  } catch {
    return defaultBlogPageMap;
  }
};

const getPlainText = (value) => (Array.isArray(value) ? value.map((item) => item?.plain_text || "").join("") : "");

export const getPageTitle = (page) => {
  const titleProperty = Object.values(page?.properties || {}).find((property) => property?.type === "title");
  return getPlainText(titleProperty?.title) || "Untitled Notion Article";
};

export const getSlugPropertyFilter = (propertyName, slug) => ({
  or: [
    {
      property: propertyName,
      rich_text: {
        equals: slug
      }
    },
    {
      property: propertyName,
      title: {
        equals: slug
      }
    }
  ]
});

export const getPublishedFilter = (propertyName, publishedValue) => ({
  or: [
    {
      property: propertyName,
      status: {
        equals: publishedValue
      }
    },
    {
      property: propertyName,
      select: {
        equals: publishedValue
      }
    }
  ]
});

export const stripMarkdown = (value) =>
  value
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/[*_>#-]/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const createExcerpt = (markdown, length = 220) => {
  const plain = stripMarkdown(markdown);

  if (plain.length <= length) {
    return plain;
  }

  return `${plain.slice(0, length).trimEnd()}...`;
};

export const calculateReadingTime = (markdown) => {
  const plain = stripMarkdown(markdown);
  const words = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
};

export const sanitizeArticleHtml = (html) =>
  sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "h1",
      "h2",
      "h3",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "pre",
      "code"
    ]),
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title"],
      "*": ["class"]
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noreferrer",
        target: "_blank"
      })
    }
  });
