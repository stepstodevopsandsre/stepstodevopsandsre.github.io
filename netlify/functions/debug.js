import { Client } from "@notionhq/client";
import { DEFAULT_ORIGIN, createCorsHeaders, isAllowedOrigin } from "./_shared/blog-utils.js";

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
    const pageId = "3a15aace-fb86-8180-b37a-e46f5847cad7";
    
    // Fetch top-level block children
    const response = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100
    });

    // Helper to recursively fetch child blocks for containers
    const blocksWithChildren = await Promise.all(
      response.results.map(async (block) => {
        if (block.has_children) {
          const children = await notion.blocks.children.list({
            block_id: block.id,
            page_size: 100
          });
          return { ...block, children: children.results };
        }
        return block;
      })
    );

    return {
      statusCode: 200,
      headers: {
        ...createCorsHeaders(requestOrigin || allowedOrigin),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ blocks: blocksWithChildren })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: createCorsHeaders(requestOrigin || allowedOrigin),
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "Error debugging Notion blocks."
      })
    };
  }
};
