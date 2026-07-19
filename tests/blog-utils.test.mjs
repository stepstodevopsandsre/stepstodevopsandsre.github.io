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
  sanitizeArticleHtml
} from "../netlify/functions/_shared/blog-utils.js";

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
