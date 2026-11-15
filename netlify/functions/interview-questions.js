import { Client } from "@notionhq/client";
import {
  DEFAULT_ORIGIN,
  createCorsHeaders,
  getDifficultyFilter,
  getInterviewSearchFilter,
  getMultiSelectContainsFilter,
  getPublishedFilter,
  getSelectEqualsFilter,
  isAllowedOrigin,
  logAndHideNotionError,
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
  const difficultyProperty = process.env.NOTION_INTERVIEW_DIFFICULTY_PROPERTY || "Difficulty";
  const difficultyPropertyType = process.env.NOTION_INTERVIEW_DIFFICULTY_PROPERTY_TYPE || "select";
  const domainProperty = process.env.NOTION_INTERVIEW_DOMAIN_PROPERTY || "Domain";
  const keywordsProperty = process.env.NOTION_INTERVIEW_KEYWORDS_PROPERTY || "Keywords";
  const companyProperty = process.env.NOTION_INTERVIEW_COMPANY_PROPERTY || "Company";
  const questionProperty = process.env.NOTION_INTERVIEW_QUESTION_PROPERTY || "Question";

  const pageSizeParam = event.queryStringParameters?.pageSize;
  const cursorParam = event.queryStringParameters?.cursor;
  const pageSize = pageSizeParam ? Math.min(Math.max(parseInt(pageSizeParam, 10) || 10, 1), 100) : 10;
  const startCursor = cursorParam || undefined;
  const difficultyParam = event.queryStringParameters?.difficulty;
  const domainParam = event.queryStringParameters?.domain?.trim();
  const keywordParam = event.queryStringParameters?.keyword?.trim();
  const companyParam = event.queryStringParameters?.company?.trim();
  const searchParam = event.queryStringParameters?.search?.trim();

  const cacheHeaders = {
    ...createCorsHeaders(requestOrigin || allowedOrigin),
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300"
  };

  if (!notionToken) {
    return {
      statusCode: 500,
      headers: createCorsHeaders(requestOrigin || allowedOrigin),
      body: JSON.stringify({ error: "Interview questions are temporarily unavailable. Please try again later." })
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
    const filters = [getPublishedFilter(statusProperty, publishedValue, statusPropertyType)];
    if (difficultyParam && difficultyParam !== "all") {
      filters.push(getDifficultyFilter(difficultyProperty, difficultyParam, difficultyPropertyType));
    }
    if (domainParam && domainParam !== "all") {
      filters.push(getSelectEqualsFilter(domainProperty, domainParam));
    }
    if (keywordParam) {
      filters.push(getMultiSelectContainsFilter(keywordsProperty, keywordParam));
    }
    if (companyParam && companyParam !== "all") {
      filters.push(getMultiSelectContainsFilter(companyProperty, companyParam));
    }
    if (searchParam) {
      filters.push(getInterviewSearchFilter(questionProperty, keywordsProperty, searchParam));
    }

    const response = await notion.databases.query({
      database_id: databaseId,
      filter: filters.length === 1 ? filters[0] : { and: filters },
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
        error: logAndHideNotionError(
          error,
          "interview-questions",
          "Interview questions are temporarily unavailable. Please try again later."
        )
      })
    };
  }
};
