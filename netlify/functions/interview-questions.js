import { Client } from "@notionhq/client";
import {
  DEFAULT_ORIGIN,
  createCorsHeaders,
  getPublishedFilter,
  isAllowedOrigin,
  parseNotionPageToInterviewQuestion
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
  const databaseId = process.env.NOTION_INTERVIEW_DATABASE_ID;
  const slugProperty = process.env.NOTION_INTERVIEW_SLUG_PROPERTY || "Slug";
  const statusProperty = process.env.NOTION_INTERVIEW_STATUS_PROPERTY || "Status";
  const statusPropertyType = process.env.NOTION_INTERVIEW_STATUS_PROPERTY_TYPE || "status";
  const publishedValue = process.env.NOTION_INTERVIEW_PUBLISHED_VALUE || "Done";
  const sortProperty = process.env.NOTION_INTERVIEW_SORT_PROPERTY || "Published Date";

  const pageSizeParam = event.queryStringParameters?.pageSize;
  const cursorParam = event.queryStringParameters?.cursor;
  const pageSize = pageSizeParam ? Math.min(Math.max(parseInt(pageSizeParam, 10) || 10, 1), 100) : 10;
  const startCursor = cursorParam || undefined;

  const cacheHeaders = {
    ...createCorsHeaders(requestOrigin || allowedOrigin),
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300"
  };

  if (!notionToken) {
    return {
      statusCode: 500,
      headers: createCorsHeaders(requestOrigin || allowedOrigin),
      body: JSON.stringify({ error: "NOTION_TOKEN is not configured in Netlify." })
    };
  }

  if (!databaseId) {
    return {
      statusCode: 200,
      headers: cacheHeaders,
      body: JSON.stringify({
        questions: [],
        hasMore: false,
        nextCursor: null,
        warning: "NOTION_INTERVIEW_DATABASE_ID is not configured."
      })
    };
  }

  try {
    const notion = new Client({ auth: notionToken });
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: getPublishedFilter(statusProperty, publishedValue, statusPropertyType),
      sorts: [
        {
          property: sortProperty,
          direction: "descending"
        }
      ],
      page_size: pageSize,
      start_cursor: startCursor
    });

    const questions = response.results.map((page) =>
      parseNotionPageToInterviewQuestion(page, slugProperty)
    );

    return {
      statusCode: 200,
      headers: cacheHeaders,
      body: JSON.stringify({
        questions,
        hasMore: response.has_more ?? false,
        nextCursor: response.next_cursor ?? null
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: createCorsHeaders(requestOrigin || allowedOrigin),
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "Unable to fetch interview questions from Notion."
      })
    };
  }
};
