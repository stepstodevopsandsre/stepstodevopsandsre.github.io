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

export const parseNotionPageToPost = (page, slugProperty = "Slug") => {
  const properties = page.properties || {};

  // Extract Title
  const titleProperty = Object.values(properties).find((p) => p?.type === "title");
  const title = getPlainText(titleProperty?.title) || "Untitled Notion Article";

  // Extract Slug
  const slugProp = properties[slugProperty] || Object.values(properties).find((p) => p?.type === "rich_text");
  let slug = "";
  if (slugProp && slugProp.type === "rich_text") {
    slug = getPlainText(slugProp.rich_text);
  } else if (slugProp && slugProp.type === "title") {
    slug = getPlainText(slugProp.title);
  }
  if (!slug) {
    slug = page.id;
  }

  // Extract Tag/Category
  const tagProperty = properties["Tag"] || properties["Category"] || Object.values(properties).find((p) => p?.type === "select" || p?.type === "multi_select");
  let tag = "DevOps";
  if (tagProperty) {
    if (tagProperty.type === "select" && tagProperty.select) {
      tag = tagProperty.select.name;
    } else if (tagProperty.type === "multi_select" && tagProperty.multi_select && tagProperty.multi_select.length > 0) {
      tag = tagProperty.multi_select[0].name;
    }
  }

  // Extract Summary/Excerpt
  const summaryProperty = properties["Summary"] || properties["Excerpt"] || properties["Description"] || Object.values(properties).find((p) => p?.type === "rich_text" && p !== slugProp);
  let summary = "";
  if (summaryProperty && summaryProperty.type === "rich_text") {
    summary = getPlainText(summaryProperty.rich_text);
  }
  if (!summary) {
    summary = "A Notion-backed engineering writeup.";
  }

  // Read Time
  const readTimeProperty = properties["Read Time"] || properties["Reading Time"];
  let readTime = "5 min read";
  if (readTimeProperty) {
    if (readTimeProperty.type === "number") {
      readTime = `${readTimeProperty.number} min read`;
    } else if (readTimeProperty.type === "rich_text") {
      readTime = getPlainText(readTimeProperty.rich_text);
    }
  }

  // Extract Domain and Module (hierarchy breadcrumb fields)
  const domainProp = properties["Domain"];
  const domain = domainProp?.type === "rich_text" ? getPlainText(domainProp.rich_text) : "";

  const moduleProp = properties["Module"];
  const module = moduleProp?.type === "rich_text" ? getPlainText(moduleProp.rich_text) : "";

  return {
    slug,
    notionPageId: page.id,
    title,
    summary,
    tag,
    readTime,
    domain: domain || undefined,
    module: module || undefined,
    href: `#/blog/${slug}`,
    lastEditedTime: page.last_edited_time
  };
};

export const getSlugFilter = (propertyName, slug, propertyType = "rich_text") => {
  if (propertyType === "title") {
    return {
      property: propertyName,
      title: {
        equals: slug
      }
    };
  }

  return {
    property: propertyName,
    rich_text: {
      equals: slug
    }
  };
};

export const getPublishedFilter = (propertyName, publishedValue, propertyType = "status") => {
  if (propertyType === "select") {
    return {
      property: propertyName,
      select: {
        equals: publishedValue
      }
    };
  }

  return {
    property: propertyName,
    status: {
      equals: publishedValue
    }
  };
};

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
      "figure",
      "figcaption",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "pre",
      "code",
      "span"
    ]),
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title"],
      "*": ["class"]
    },
    allowedSchemes: ["http", "https", "ftp", "mailto", "tel", "data"],
    allowedSchemesAppliedToAttributes: ["href", "cite"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noreferrer",
        target: "_blank"
      })
    }
  });
