import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateReadingTime,
  createExcerpt,
  getPageTitle,
  getPublishedFilter,
  getSlugPropertyFilter,
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

test("getSlugPropertyFilter supports rich_text or title properties", () => {
  const filter = getSlugPropertyFilter("Slug", "grafana-observability-p95-p99-latency");

  assert.equal(filter.or.length, 2);
  assert.equal(filter.or[0].property, "Slug");
  assert.equal(filter.or[1].title.equals, "grafana-observability-p95-p99-latency");
});

test("getPublishedFilter supports status or select properties", () => {
  const filter = getPublishedFilter("Status", "Published");

  assert.equal(filter.or.length, 2);
  assert.equal(filter.or[0].status.equals, "Published");
  assert.equal(filter.or[1].select.equals, "Published");
});
