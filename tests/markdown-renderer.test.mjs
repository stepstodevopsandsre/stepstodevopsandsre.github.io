import test from "node:test";
import assert from "node:assert/strict";
import { renderHighlightedCode } from "../netlify/functions/_shared/markdown-renderer.js";
import { sanitizeArticleHtml } from "../netlify/functions/_shared/blog-utils.js";

test("renderHighlightedCode creates a readable YAML code block", () => {
  const html = renderHighlightedCode({
    lang: "yaml",
    text: "apiVersion: v1\nkind: ConfigMap"
  });

  assert.match(html, /code-block-shell/);
  assert.match(html, /code-block-language.*Yaml/);
  assert.match(html, /hljs-attr/);
});

test("sanitizing highlighted code preserves syntax spans and removes unsafe markup", () => {
  const html = sanitizeArticleHtml(renderHighlightedCode({
    lang: "bash",
    text: "echo \"hello\""
  }) + "<script>alert(1)</script>");

  assert.match(html, /code-block-shell/);
  assert.match(html, /hljs-string/);
  assert.equal(html.includes("<script>"), false);
});
