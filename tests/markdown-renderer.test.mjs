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
  assert.match(html, /data-code-copy/);
  assert.match(html, />Copy<\/span>/);
});

test("sanitizing highlighted code preserves syntax spans and removes unsafe markup", () => {
  const html = sanitizeArticleHtml(renderHighlightedCode({
    lang: "bash",
    text: "echo \"hello\""
  }) + "<script>alert(1)</script>");

  assert.match(html, /code-block-shell/);
  assert.match(html, /hljs-string/);
  assert.match(html, /data-code-copy/);
  assert.equal(html.includes("<script>"), false);
});

test("infers Terraform commands that Notion labels as JavaScript", () => {
  const html = renderHighlightedCode({
    lang: "javascript",
    text: "terraform plan -refresh-only\nterraform apply -refresh-only"
  });

  assert.match(html, /code-block-language">COMMAND/);
  assert.match(html, /language-command/);
  assert.doesNotMatch(html, /language-javascript/);
});

test("highlights important Terraform lifecycle arguments", () => {
  const html = renderHighlightedCode({
    lang: "hcl",
    text: "lifecycle {\n  ignore_changes = [\n    desired_capacity\n  ]\n}"
  });

  assert.match(html, /hljs-keyword">lifecycle/);
  assert.match(html, /hljs-keyword">ignore_changes/);
});
