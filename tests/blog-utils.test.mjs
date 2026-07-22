import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateReadingTime,
  createExcerpt,
  getPageTitle,
  getPublishedFilter,
  getSlugFilter,
  isAllowedOrigin,
  parsePageMap,
  sanitizeArticleHtml,
  parseNotionPageToPost,
  cleanNotionText
} from "../netlify/functions/_shared/blog-utils.js";

test("cleanNotionText replaces Notion formatting artifacts correctly", () => {
  assert.equal(cleanNotionText("text****text"), "text text");
  assert.equal(cleanNotionText("text**text"), "text text");
  assert.equal(cleanNotionText("text —text"), "text-text");
  assert.equal(cleanNotionText("text, and text"), "text and text");
  assert.equal(cleanNotionText("text, or text"), "text or text");
});

test("parsePageMap merges env-provided slugs with defaults", () => {
  const pageMap = parsePageMap('{"incident-review":"abc"}');

  assert.equal(pageMap["incident-review"], "abc");
  assert.ok(pageMap["grafana-observability-p95-p99-latency"]);
});

test("createExcerpt trims markdown into readable plain text", () => {
  const excerpt = createExcerpt("## Heading\n\nThis is **important** latency guidance for platform teams.");

  assert.match(excerpt, /This is important latency guidance/);
});

test("calculateReadingTime never returns zero", () => {
  assert.equal(calculateReadingTime("short text"), 1);
});

test("isAllowedOrigin accepts the site origin and local development", () => {
  assert.equal(isAllowedOrigin("https://stepstodevopsandsre.github.io", "https://stepstodevopsandsre.github.io"), true);
  assert.equal(isAllowedOrigin("http://localhost:5173", "https://stepstodevopsandsre.github.io"), true);
  assert.equal(isAllowedOrigin("http://localhost:8888", "https://stepstodevopsandsre.github.io"), true);
  assert.equal(isAllowedOrigin("https://example.com", "https://stepstodevopsandsre.github.io"), false);
});

test("sanitizeArticleHtml removes unsafe script tags", () => {
  const html = sanitizeArticleHtml("<p>safe</p><script>alert(1)</script>");

  assert.equal(html.includes("<script>"), false);
  assert.equal(html.includes("<p>safe</p>"), true);
});

test("getPageTitle reads the first title property from a Notion page object", () => {
  const title = getPageTitle({
    properties: {
      Name: {
        type: "title",
        title: [{ plain_text: "Grafana Observability" }]
      }
    }
  });

  assert.equal(title, "Grafana Observability");
});

test("getSlugFilter creates a rich_text filter by default", () => {
  const filter = getSlugFilter("Slug", "grafana-observability-p95-p99-latency");

  assert.equal(filter.property, "Slug");
  assert.equal(filter.rich_text.equals, "grafana-observability-p95-p99-latency");
});

test("getSlugFilter can create a title filter", () => {
  const filter = getSlugFilter("Slug", "post-slug", "title");

  assert.equal(filter.property, "Slug");
  assert.equal(filter.title.equals, "post-slug");
});

test("getPublishedFilter creates a status filter by default", () => {
  const filter = getPublishedFilter("Status", "Done");

  assert.equal(filter.property, "Status");
  assert.equal(filter.status.equals, "Done");
});

test("getPublishedFilter can create a select filter", () => {
  const filter = getPublishedFilter("Status", "Published", "select");

  assert.equal(filter.property, "Status");
  assert.equal(filter.select.equals, "Published");
});

test("sanitizeArticleHtml does not strip image tags or their S3 URLs", () => {
  const url = "https://prod-files-secure.s3.us-west-2.amazonaws.com/3a15aace-fb86-8180-b37a-e46f5847cad7/de217d05-4c55-40cc-87b6-e2652a926fa9/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAT73L25NZPMW766M5%2F20260719%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260719T133700Z&X-Amz-Expires=3600&X-Amz-Signature=abc&X-Amz-SignedHeaders=host";
  const html = sanitizeArticleHtml(`<img src="${url}" alt="Test Image" />`);
  assert.match(html, /src="https:\/\/prod-files-secure\.s3\.us-west-2\.amazonaws\.com/);
});

test("parseNotionPageToPost parses Notion page properties correctly", () => {
  const mockPage = {
    id: "3a15aace-fb86-8180-b37a-e46f5847cad7",
    last_edited_time: "2026-07-18T09:14:00.000Z",
    properties: {
      Name: {
        type: "title",
        title: [{ plain_text: "Grafana Observability for p95 & p99" }]
      },
      Slug: {
        type: "rich_text",
        rich_text: [{ plain_text: "grafana-observability-p95-p99-latency" }]
      },
      Tag: {
        type: "select",
        select: { name: "Observability" }
      },
      Summary: {
        type: "rich_text",
        rich_text: [{ plain_text: "Mock description" }]
      },
      "Read Time": {
        type: "number",
        number: 12
      }
    }
  };

  const parsed = parseNotionPageToPost(mockPage);

  assert.equal(parsed.slug, "grafana-observability-p95-p99-latency");
  assert.equal(parsed.notionPageId, "3a15aace-fb86-8180-b37a-e46f5847cad7");
  assert.equal(parsed.title, "Grafana Observability for p95 & p99");
  assert.equal(parsed.summary, "Mock description");
  assert.equal(parsed.tag, "Observability");
  assert.equal(parsed.readTime, "12 min read");
  assert.equal(parsed.href, "#/blog/grafana-observability-p95-p99-latency");
});

