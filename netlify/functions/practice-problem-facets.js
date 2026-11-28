import { Client } from "@notionhq/client";
import {
  DEFAULT_ORIGIN,
  createCorsHeaders,
  getPublishedFilter,
  isAllowedOrigin,
  logAndHideNotionError,
  parseNotionPageToPracticeProblem
} from "./_shared/blog-utils.js";

const valuesFromProperty = (property) => {
  if (!property) return [];
  if (property.type === "multi_select") return (property.multi_select?.options || []).map((item) => item.name);
  if (property.type === "select") return (property.select?.options || []).map((item) => item.name);
  if (property.type === "status") return (property.status?.options || []).map((item) => item.name);
  return [];
};

export const handler = async (event) => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
  const requestOrigin = event.headers.origin || event.headers.Origin;
  if (event.httpMethod === "OPTIONS") {
    if (!isAllowedOrigin(requestOrigin, allowedOrigin)) return { statusCode: 403, body: JSON.stringify({ error: "Origin not allowed." }) };
    return { statusCode: 204, headers: createCorsHeaders(requestOrigin || allowedOrigin), body: "" };
  }
  if (!isAllowedOrigin(requestOrigin, allowedOrigin)) return { statusCode: 403, body: JSON.stringify({ error: "Origin not allowed." }) };

  const headers = {
    ...createCorsHeaders(requestOrigin || allowedOrigin),
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=1800"
  };
  const notionToken = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_PRACTICE_DATABASE_ID;
  if (!notionToken || !databaseId) return { statusCode: 200, headers, body: JSON.stringify({ topics: [], difficulties: [] }) };

  try {
    const notion = new Client({ auth: notionToken });
    const schema = await notion.databases.retrieve({ database_id: databaseId });
    const topicProperty = process.env.NOTION_PRACTICE_TOPIC_PROPERTY || "Topic";
    const difficultyProperty = process.env.NOTION_PRACTICE_DIFFICULTY_PROPERTY || "Difficulty";
    const properties = schema.properties || {};
    const topics = new Set(valuesFromProperty(properties[topicProperty]));
    const difficulties = new Set(valuesFromProperty(properties[difficultyProperty]));

    // Multi-select options are the canonical taxonomy. The small query only
    // captures values used by published pages when a workspace allows creating
    // options dynamically without updating the database schema first.
    const statusProperty = process.env.NOTION_PRACTICE_STATUS_PROPERTY || "Status";
    const publishedValue = process.env.NOTION_PRACTICE_PUBLISHED_VALUE || "Done";
    const published = await notion.databases.query({
      database_id: databaseId,
      filter: getPublishedFilter(statusProperty, publishedValue, process.env.NOTION_PRACTICE_STATUS_PROPERTY_TYPE || "status"),
      page_size: 100
    });
    for (const page of published.results) {
      const problem = parseNotionPageToPracticeProblem(page);
      problem.topics.forEach((topic) => topics.add(topic));
      if (problem.difficulty) difficulties.add(problem.difficulty);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ topics: [...topics].sort(), difficulties: [...difficulties].sort() })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: logAndHideNotionError(error, "practice-problem-facets", "Practice filters are temporarily unavailable.") })
    };
  }
};
