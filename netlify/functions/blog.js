import { Client } from "@notionhq/client";
import { marked } from "marked";
import { NotionToMarkdown } from "notion-to-md";
import {
  DEFAULT_ORIGIN,
  calculateReadingTime,
  createCorsHeaders,
  createExcerpt,
  getPageTitle,
  getPublishedFilter,
  getSlugFilter,
  isAllowedOrigin,
  parsePageMap,
  sanitizeArticleHtml
} from "./_shared/blog-utils.js";

marked.setOptions({
  gfm: true,
  breaks: false
});

const resolvePageIdFromDatabase = async (notion, slug) => {
  const databaseId = process.env.NOTION_BLOG_DATABASE_ID;

  if (!databaseId) {
    return null;
  }

  const slugProperty = process.env.NOTION_BLOG_SLUG_PROPERTY || "Slug";
  const slugPropertyType = process.env.NOTION_BLOG_SLUG_PROPERTY_TYPE || "rich_text";
  const statusProperty = process.env.NOTION_BLOG_STATUS_PROPERTY || "Status";
  const statusPropertyType = process.env.NOTION_BLOG_STATUS_PROPERTY_TYPE || "status";
  const publishedValue = process.env.NOTION_BLOG_PUBLISHED_VALUE || "Done";

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      and: [
        getSlugFilter(slugProperty, slug, slugPropertyType),
        getPublishedFilter(statusProperty, publishedValue, statusPropertyType)
      ]
    },
    page_size: 1
  });

  return response.results[0]?.id || null;
};

export const handler = async (event) => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
  const requestOrigin = event.headers.origin || event.headers.Origin;

  if (event.httpMethod === "OPTIONS") {
    if (!isAllowedOrigin(requestOrigin, allowedOrigin)) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Origin not allowed." })
      };
    }

    return {
      statusCode: 204,
      headers: createCorsHeaders(requestOrigin || allowedOrigin),
      body: ""
    };
  }

  if (!isAllowedOrigin(requestOrigin, allowedOrigin)) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: "Origin not allowed." })
    };
  }

  const slug = event.queryStringParameters?.slug;
  const notionToken = process.env.NOTION_TOKEN;
  const pageMap = parsePageMap(process.env.NOTION_BLOG_PAGE_MAP);

  if (!slug) {
    return {
      statusCode: 400,
      headers: createCorsHeaders(requestOrigin || allowedOrigin),
      body: JSON.stringify({ error: "Missing slug query parameter." })
    };
  }

  if (!notionToken) {
    return {
      statusCode: 500,
      headers: createCorsHeaders(requestOrigin || allowedOrigin),
      body: JSON.stringify({ error: "NOTION_TOKEN is not configured in Netlify." })
    };
  }

  try {
    const notion = new Client({ auth: notionToken });
    const notionToMarkdown = new NotionToMarkdown({ notionClient: notion });

    // Custom transformers for responsive multi-column layouts
    notionToMarkdown.setCustomTransformer("column_list", async (block) => {
      const { id } = block;
      const mdBlocks = await notionToMarkdown.pageToMarkdown(id);
      const mdString = notionToMarkdown.toMarkdownString(mdBlocks);
      return `<div class="notion-column-list">${mdString.parent}</div>`;
    });

    notionToMarkdown.setCustomTransformer("column", async (block) => {
      const { id } = block;
      const mdBlocks = await notionToMarkdown.pageToMarkdown(id);
      const mdString = notionToMarkdown.toMarkdownString(mdBlocks);
      return `<div class="notion-column">${mdString.parent}</div>`;
    });

    // Handle image blocks (both external URLs and Notion-hosted S3 files)
    notionToMarkdown.setCustomTransformer("image", async (block) => {
      const imageData = block.image;
      if (!imageData) return "";
      const src =
        imageData.type === "external"
          ? imageData.external?.url
          : imageData.file?.url;
      if (!src) return "";
      const captionText = (imageData.caption || [])
        .map((c) => c.plain_text)
        .join("");
      const alt = captionText || "Blog image";
      const caption = captionText
        ? `<figcaption>${captionText}</figcaption>`
        : "";
      return `<figure class="notion-image"><img src="${src}" alt="${alt}" loading="lazy" />${caption}</figure>`;
    });

    // Handle callout blocks — render icon + text + any nested children
    notionToMarkdown.setCustomTransformer("callout", async (block) => {
      const callout = block.callout;
      if (!callout) return "";
      const icon =
        callout.icon?.type === "emoji"
          ? `<span class="callout-icon">${callout.icon.emoji}</span>`
          : "";
      const text = (callout.rich_text || []).map((t) => t.plain_text).join("");
      let childrenMd = "";
      if (block.has_children) {
        const childBlocks = await notionToMarkdown.pageToMarkdown(block.id);
        childrenMd = notionToMarkdown.toMarkdownString(childBlocks).parent;
      }
      return `<div class="notion-callout">${icon}<div class="callout-content"><p>${text}</p>${childrenMd}</div></div>`;
    });

    // Intercept code blocks whose language is "mermaid" — output a div that Mermaid.js renders client-side
    notionToMarkdown.setCustomTransformer("code", async (block) => {
      const codeData = block.code;
      if (!codeData) return "";
      const language = codeData.language || "";
      const content = (codeData.rich_text || []).map((t) => t.plain_text).join("");
      if (language === "mermaid") {
        // HTML-escape angle brackets so the diagram text isn't mangled
        const escaped = content
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        return `<div class="mermaid">${escaped}</div>`;
      }
      // Fall back to a standard fenced code block for all other languages
      const fence = "```";
      return `${fence}${language}\n${content}\n${fence}`;
    });

    const pageId = (await resolvePageIdFromDatabase(notion, slug)) || pageMap[slug];


    if (!pageId) {
      return {
        statusCode: 404,
        headers: createCorsHeaders(requestOrigin || allowedOrigin),
        body: JSON.stringify({
          error: `No published Notion article found for slug \"${slug}\".`
        })
      };
    }

    const page = await notion.pages.retrieve({ page_id: pageId });
    const mdBlocks = await notionToMarkdown.pageToMarkdown(pageId);
    const markdownResult = notionToMarkdown.toMarkdownString(mdBlocks);
    const markdown = markdownResult.parent.trim();
    const html = sanitizeArticleHtml(await marked.parse(markdown));

    return {
      statusCode: 200,
      headers: {
        ...createCorsHeaders(requestOrigin || allowedOrigin),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        slug,
        title: getPageTitle(page),
        icon: page.icon?.type === "emoji" ? page.icon.emoji : undefined,
        url: page.url,
        excerpt: createExcerpt(markdown),
        html,
        markdown,
        readingTimeMinutes: calculateReadingTime(markdown),
        lastEditedTime: page.last_edited_time
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: createCorsHeaders(requestOrigin || allowedOrigin),
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "Unable to fetch blog content from Notion."
      })
    };
  }
};
