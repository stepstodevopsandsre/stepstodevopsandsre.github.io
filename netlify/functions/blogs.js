import { Client } from "@notionhq/client";
import {
  DEFAULT_ORIGIN,
  createCorsHeaders,
  getPublishedFilter,
  isAllowedOrigin,
  parseNotionPageToPost
} from "./_shared/blog-utils.js";

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

  const notionToken = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_BLOG_DATABASE_ID;
  const slugProperty = process.env.NOTION_BLOG_SLUG_PROPERTY || "Slug";
  const statusProperty = process.env.NOTION_BLOG_STATUS_PROPERTY || "Status";
  const statusPropertyType = process.env.NOTION_BLOG_STATUS_PROPERTY_TYPE || "status";
  const publishedValue = process.env.NOTION_BLOG_PUBLISHED_VALUE || "Done";

  const pageSizeParam = event.queryStringParameters?.pageSize;
  const cursorParam = event.queryStringParameters?.cursor;
  const pageSize = pageSizeParam ? Math.min(Math.max(parseInt(pageSizeParam, 10) || 10, 1), 100) : 10;
  const startCursor = cursorParam || undefined;

  const cacheHeaders = {
    ...createCorsHeaders(requestOrigin || allowedOrigin),
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
  };

  if (!notionToken) {
    return {
      statusCode: 500,
      headers: createCorsHeaders(requestOrigin || allowedOrigin),
      body: JSON.stringify({ error: "NOTION_TOKEN is not configured in Netlify." })
    };
  }

  if (!databaseId) {
    // Fallback if database ID is not configured: try to fetch the single default post if token is active
    try {
      const notion = new Client({ auth: notionToken });
      const defaultPageId = "3a15aace-fb86-8180-b37a-e46f5847cad7";
      const page = await notion.pages.retrieve({ page_id: defaultPageId });
      const parsedPost = parseNotionPageToPost(page, slugProperty);
      return {
        statusCode: 200,
        headers: cacheHeaders,
        body: JSON.stringify({
          posts: [parsedPost],
          hasMore: false,
          nextCursor: null
        })
      };
    } catch (error) {
      return {
        statusCode: 200,
        headers: cacheHeaders,
        body: JSON.stringify({
          posts: [],
          hasMore: false,
          nextCursor: null,
          warning: "NOTION_BLOG_DATABASE_ID is not configured and fallback retrieval failed."
        })
      };
    }
  }

  try {
    const notion = new Client({ auth: notionToken });
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: getPublishedFilter(statusProperty, publishedValue, statusPropertyType),
      sorts: [
        {
          timestamp: "last_edited_time",
          direction: "descending"
        }
      ],
      page_size: pageSize,
      start_cursor: startCursor
    });

    const posts = response.results.map((page) => parseNotionPageToPost(page, slugProperty));

    return {
      statusCode: 200,
      headers: cacheHeaders,
      body: JSON.stringify({
        posts,
        hasMore: response.has_more ?? false,
        nextCursor: response.next_cursor ?? null
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: createCorsHeaders(requestOrigin || allowedOrigin),
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "Unable to fetch blog list from Notion."
      })
    };
  }
};
