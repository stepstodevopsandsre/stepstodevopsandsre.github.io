import { Client } from "@notionhq/client";
import { DEFAULT_ORIGIN, createCorsHeaders } from "./_shared/blog-utils.js";

export const handler = async (event) => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
  const requestOrigin = event.headers.origin || event.headers.Origin;

  const notionToken = process.env.NOTION_TOKEN;
  if (!notionToken) {
    return {
      statusCode: 500,
      headers: createCorsHeaders(requestOrigin || allowedOrigin),
      body: JSON.stringify({ error: "NOTION_TOKEN is not configured." })
    };
  }

  try {
    const notion = new Client({ auth: notionToken });
    const blockId = "3a25aace-fb86-819a-9f18-f4226fc6ab7e";
    
    const response = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100
    });

    return {
      statusCode: 200,
      headers: {
        ...createCorsHeaders(requestOrigin || allowedOrigin),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(response.results)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: createCorsHeaders(requestOrigin || allowedOrigin),
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "Error listing block children."
      })
    };
  }
};
