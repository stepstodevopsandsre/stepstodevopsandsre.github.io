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
