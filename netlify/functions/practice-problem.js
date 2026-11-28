import { Client } from "@notionhq/client";
import { marked } from "marked";
import { NotionToMarkdown } from "notion-to-md";
import { highlightedCodeRenderer } from "./_shared/markdown-renderer.js";
import {
  DEFAULT_ORIGIN,
  createCorsHeaders,
  getPublishedFilter,
  getSlugFilter,
  isAllowedOrigin,
  logAndHideNotionError,
  parseNotionPageToPracticeProblem,
  sanitizeArticleHtml
} from "./_shared/blog-utils.js";

marked.setOptions({ gfm: true, breaks: false });
marked.use({ renderer: highlightedCodeRenderer });

const getPageId = async (notion, slug) => {
  const databaseId = process.env.NOTION_PRACTICE_DATABASE_ID;
  if (!databaseId) return null;
  const slugProperty = process.env.NOTION_PRACTICE_SLUG_PROPERTY || "Slug";
  const slugPropertyType = process.env.NOTION_PRACTICE_SLUG_PROPERTY_TYPE || "rich_text";
  const statusProperty = process.env.NOTION_PRACTICE_STATUS_PROPERTY || "Status";
  const statusPropertyType = process.env.NOTION_PRACTICE_STATUS_PROPERTY_TYPE || "status";
  const publishedValue = process.env.NOTION_PRACTICE_PUBLISHED_VALUE || "Done";

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: { and: [getSlugFilter(slugProperty, slug, slugPropertyType), getPublishedFilter(statusProperty, publishedValue, statusPropertyType)] },
    page_size: 1
  });
  return response.results[0]?.id || null;
};

const configureNotionToMarkdown = (notionToMarkdown) => {
  notionToMarkdown.setCustomTransformer("code", async (block) => {
    const code = block.code;
    if (!code) return "";
    const language = code.language || "";
    const raw = (code.rich_text || []).map((item) => item.plain_text || "").join("");
    return `\`\`\`${language}\n${raw}\n\`\`\``;
  });
};

const getStarterCode = (markdown) => {
  const match = markdown.match(/```(?:python|py)\s*\n([\s\S]*?)\n```/i);
  return match?.[1]?.trim() || "";
};

export const handler = async (event) => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
  const requestOrigin = event.headers.origin || event.headers.Origin;

  if (event.httpMethod === "OPTIONS") {
    if (!isAllowedOrigin(requestOrigin, allowedOrigin)) return { statusCode: 403, body: JSON.stringify({ error: "Origin not allowed." }) };
    return { statusCode: 204, headers: createCorsHeaders(requestOrigin || allowedOrigin), body: "" };
  }
  if (!isAllowedOrigin(requestOrigin, allowedOrigin)) return { statusCode: 403, body: JSON.stringify({ error: "Origin not allowed." }) };

  const slug = event.queryStringParameters?.slug;
  const notionToken = process.env.NOTION_TOKEN;
  if (!slug) return { statusCode: 400, headers: createCorsHeaders(requestOrigin || allowedOrigin), body: JSON.stringify({ error: "Missing slug query parameter." }) };
  if (!notionToken) return { statusCode: 500, headers: createCorsHeaders(requestOrigin || allowedOrigin), body: JSON.stringify({ error: "This practice problem is temporarily unavailable. Please try again later." }) };
  if (!process.env.NOTION_PRACTICE_DATABASE_ID) return { statusCode: 503, headers: createCorsHeaders(requestOrigin || allowedOrigin), body: JSON.stringify({ error: "Practice problems are not configured yet. Please try again later." }) };

  try {
    const notion = new Client({ auth: notionToken });
    const notionToMarkdown = new NotionToMarkdown({ notionClient: notion });
    configureNotionToMarkdown(notionToMarkdown);
    const pageId = await getPageId(notion, slug);
    if (!pageId) return { statusCode: 404, headers: createCorsHeaders(requestOrigin || allowedOrigin), body: JSON.stringify({ error: "This practice problem is not available yet. Please return to the practice list." }) };

    const page = await notion.pages.retrieve({ page_id: pageId });
    const problem = parseNotionPageToPracticeProblem(page);
    const mdBlocks = await notionToMarkdown.pageToMarkdown(pageId);
    const markdown = notionToMarkdown.toMarkdownString(mdBlocks).parent.trim();
    const html = sanitizeArticleHtml(await marked.parse(markdown));
    return {
      statusCode: 200,
      headers: { ...createCorsHeaders(requestOrigin || allowedOrigin), "Content-Type": "application/json", "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300" },
      body: JSON.stringify({ ...problem, url: page.url, html, markdown, starterCode: getStarterCode(markdown), lastEditedTime: page.last_edited_time })
    };
  } catch (error) {
    return { statusCode: 500, headers: createCorsHeaders(requestOrigin || allowedOrigin), body: JSON.stringify({ error: logAndHideNotionError(error, "practice-problem", "This practice problem is temporarily unavailable. Please try again later.") }) };
  }
};
