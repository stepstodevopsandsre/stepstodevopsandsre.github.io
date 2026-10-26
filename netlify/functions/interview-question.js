import { Client } from "@notionhq/client";
import { marked } from "marked";
import { NotionToMarkdown } from "notion-to-md";
import {
  DEFAULT_ORIGIN,
  calculateReadingTime,
  createCorsHeaders,
  createExcerpt,
  getPublishedFilter,
  getSlugFilter,
  isAllowedOrigin,
  parseNotionPageToInterviewQuestion,
  sanitizeArticleHtml
} from "./_shared/blog-utils.js";

marked.setOptions({
  gfm: true,
  breaks: false
});

const resolvePageIdFromDatabase = async (notion, slug) => {
  const databaseId = process.env.NOTION_INTERVIEW_DATABASE_ID;

  if (!databaseId) {
    return null;
  }

  const slugProperty = process.env.NOTION_INTERVIEW_SLUG_PROPERTY || "Slug";
  const slugPropertyType = process.env.NOTION_INTERVIEW_SLUG_PROPERTY_TYPE || "rich_text";
  const statusProperty = process.env.NOTION_INTERVIEW_STATUS_PROPERTY || "Status";
  const statusPropertyType = process.env.NOTION_INTERVIEW_STATUS_PROPERTY_TYPE || "status";
  const publishedValue = process.env.NOTION_INTERVIEW_PUBLISHED_VALUE || "Done";

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

const getLinkedContentPageId = (page, fallbackPageId) => {
  const notionPageUrlProp = page.properties?.["Notion Page URL"];

  if (!notionPageUrlProp || notionPageUrlProp.type !== "url" || !notionPageUrlProp.url) {
    return fallbackPageId;
  }

  const match =
    notionPageUrlProp.url.match(/([a-f0-9]{32})/i) ||
    notionPageUrlProp.url.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);

  return match ? match[1] : fallbackPageId;
};

const configureNotionToMarkdown = (notionToMarkdown) => {
  notionToMarkdown.setCustomTransformer("column_list", async (block) => {
    const mdBlocks = await notionToMarkdown.pageToMarkdown(block.id);
    const mdString = notionToMarkdown.toMarkdownString(mdBlocks);
    return `<div class="notion-column-list">${mdString.parent}</div>`;
  });

  notionToMarkdown.setCustomTransformer("column", async (block) => {
    const mdBlocks = await notionToMarkdown.pageToMarkdown(block.id);
    const mdString = notionToMarkdown.toMarkdownString(mdBlocks);
    return `<div class="notion-column">${mdString.parent}</div>`;
  });

  notionToMarkdown.setCustomTransformer("image", async (block) => {
    const imageData = block.image;
    if (!imageData) return "";
    const src = imageData.type === "external" ? imageData.external?.url : imageData.file?.url;
    if (!src) return "";
    const captionText = (imageData.caption || []).map((c) => c.plain_text).join("");
    const alt = captionText || "Interview question image";
    const caption = captionText ? `<figcaption>${captionText}</figcaption>` : "";
    return `<figure class="notion-image"><img src="${src}" alt="${alt}" loading="lazy" />${caption}</figure>`;
  });

  notionToMarkdown.setCustomTransformer("callout", async (block) => {
    const callout = block.callout;
    if (!callout) return "";
    const icon = callout.icon?.type === "emoji" ? `<span class="callout-icon">${callout.icon.emoji}</span>` : "";
    const text = (callout.rich_text || []).map((t) => t.plain_text).join("");
    let childrenMd = "";
    if (block.has_children) {
      const childBlocks = await notionToMarkdown.pageToMarkdown(block.id);
      childrenMd = notionToMarkdown.toMarkdownString(childBlocks).parent;
    }
    return `<div class="notion-callout">${icon}<div class="callout-content"><p>${text}</p>${childrenMd}</div></div>`;
  });

  const hexToRgb = (hex) => {
    const h = hex.replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16)
    };
  };

  const relativeLuminance = ({ r, g, b }) => {
    const sRGB = [r, g, b].map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  notionToMarkdown.setCustomTransformer("code", async (block) => {
    const codeData = block.code;
    if (!codeData) return "";
    const language = codeData.language || "";
    const rawContent = (codeData.rich_text || []).map((t) => t.plain_text).join("");
    if (language === "mermaid") {
      const contrastAdjusted = rawContent.replace(
        /style\s+(\w+)\s+(fill:(#[0-9a-fA-F]{3,6})([^,\n]*))(?!,color:)/g,
        (match, _node, _rest, fillHex) => {
          try {
            const lum = relativeLuminance(hexToRgb(fillHex));
            const textColor = lum > 0.35 ? "#1a202c" : "#f1f5f9";
            return `${match},color:${textColor}`;
          } catch {
            return match;
          }
        }
      );
      const escaped = contrastAdjusted
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<div class="mermaid">${escaped}</div>`;
    }
    return `\`\`\`${language}\n${rawContent}\n\`\`\``;
  });
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
  const slugProperty = process.env.NOTION_INTERVIEW_SLUG_PROPERTY || "Slug";

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
    configureNotionToMarkdown(notionToMarkdown);

    const pageId = await resolvePageIdFromDatabase(notion, slug);

    if (!pageId) {
      return {
        statusCode: 404,
        headers: createCorsHeaders(requestOrigin || allowedOrigin),
        body: JSON.stringify({
          error: `No published Notion interview question found for slug "${slug}".`
        })
      };
    }

    const page = await notion.pages.retrieve({ page_id: pageId });
    const parsedQuestion = parseNotionPageToInterviewQuestion(page, slugProperty);
    const contentPageId = getLinkedContentPageId(page, pageId);

    const mdBlocks = await notionToMarkdown.pageToMarkdown(contentPageId);
    const markdownResult = notionToMarkdown.toMarkdownString(mdBlocks);
    const markdown = markdownResult.parent.trim();
    const html = sanitizeArticleHtml(await marked.parse(markdown));

    return {
      statusCode: 200,
      headers: {
        ...createCorsHeaders(requestOrigin || allowedOrigin),
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300"
      },
      body: JSON.stringify({
        slug,
        title: parsedQuestion.question,
        question: parsedQuestion.question,
        domain: parsedQuestion.domain,
        difficulty: parsedQuestion.difficulty,
        keywords: parsedQuestion.keywords,
        companies: parsedQuestion.companies,
        publishedDate: parsedQuestion.publishedDate,
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
        error: error instanceof Error ? error.message : "Unable to fetch interview question content from Notion."
      })
    };
  }
};
