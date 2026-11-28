import { Client } from "@notionhq/client";
import {
  DEFAULT_ORIGIN,
  createCorsHeaders,
  getDifficultyFilter,
  getMultiSelectContainsFilter,
  getPublishedFilter,
  getTitleContainsFilter,
  isAllowedOrigin,
  logAndHideNotionError,
  parseNotionPageToPracticeProblem
} from "./_shared/blog-utils.js";

export const handler = async (event) => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
  const requestOrigin = event.headers.origin || event.headers.Origin;
  if (event.httpMethod === "OPTIONS") {
    if (!isAllowedOrigin(requestOrigin, allowedOrigin)) return { statusCode: 403, body: JSON.stringify({ error: "Origin not allowed." }) };
    return { statusCode: 204, headers: createCorsHeaders(requestOrigin || allowedOrigin), body: "" };
  }
  if (!isAllowedOrigin(requestOrigin, allowedOrigin)) return { statusCode: 403, body: JSON.stringify({ error: "Origin not allowed." }) };

  const headers = { ...createCorsHeaders(requestOrigin || allowedOrigin), "Content-Type": "application/json", "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300" };
  const notionToken = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_PRACTICE_DATABASE_ID;
  if (!notionToken) return { statusCode: 500, headers, body: JSON.stringify({ error: "Practice problems are temporarily unavailable. Please try again later." }) };
  if (!databaseId) return { statusCode: 200, headers, body: JSON.stringify({ problems: [], hasMore: false, nextCursor: null }) };

  const pageSize = Math.min(Math.max(parseInt(event.queryStringParameters?.pageSize || "10", 10) || 10, 1), 50);
  const cursor = event.queryStringParameters?.cursor || undefined;
  const topic = event.queryStringParameters?.topic?.trim();
  const difficulty = event.queryStringParameters?.difficulty?.trim();
  const search = event.queryStringParameters?.search?.trim();
  try {
    const notion = new Client({ auth: notionToken });
    const statusProperty = process.env.NOTION_PRACTICE_STATUS_PROPERTY || "Status";
    const topicProperty = process.env.NOTION_PRACTICE_TOPIC_PROPERTY || "Topic";
    const difficultyProperty = process.env.NOTION_PRACTICE_DIFFICULTY_PROPERTY || "Difficulty";
    const questionProperty = process.env.NOTION_PRACTICE_QUESTION_PROPERTY || "Question";
    const slugProperty = process.env.NOTION_PRACTICE_SLUG_PROPERTY || "Slug";
    const filters = [getPublishedFilter(statusProperty, process.env.NOTION_PRACTICE_PUBLISHED_VALUE || "Done", process.env.NOTION_PRACTICE_STATUS_PROPERTY_TYPE || "status")];
    if (topic && topic !== "all") filters.push(getMultiSelectContainsFilter(topicProperty, topic));
    if (difficulty && difficulty !== "all") filters.push(getDifficultyFilter(difficultyProperty, difficulty, process.env.NOTION_PRACTICE_DIFFICULTY_PROPERTY_TYPE || "select"));
    if (search) filters.push({ or: [getTitleContainsFilter(questionProperty, search), { property: slugProperty, rich_text: { contains: search } }] });
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: filters.length === 1 ? filters[0] : { and: filters },
      sorts: [{ property: "Published Date", direction: "descending" }],
      page_size: pageSize,
      start_cursor: cursor
    });
    return { statusCode: 200, headers, body: JSON.stringify({ problems: response.results.map((page) => parseNotionPageToPracticeProblem(page)), hasMore: response.has_more ?? false, nextCursor: response.next_cursor ?? null }) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: logAndHideNotionError(error, "practice-problems", "Practice problems are temporarily unavailable. Please try again later.") }) };
  }
};
