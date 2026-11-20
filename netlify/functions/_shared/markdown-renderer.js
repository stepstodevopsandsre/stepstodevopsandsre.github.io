import hljs from "highlight.js/lib/common";

const LANGUAGE_ALIASES = {
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  tf: "hcl",
  terraform: "hcl",
  docker: "dockerfile",
  dockerfile: "dockerfile",
  js: "javascript",
  ts: "typescript",
  tsx: "typescript",
  jsx: "javascript",
  py: "python",
  md: "markdown",
  plaintext: "text",
  text: "text"
};

const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const normalizeLanguage = (language = "") => {
  const normalized = language.trim().toLowerCase().replace(/[^a-z0-9+#-]/g, "");
  return LANGUAGE_ALIASES[normalized] || normalized;
};

const languageLabel = (language) => {
  if (!language || language === "text") return "Code";
  if (language === "hcl") return "Terraform";
  if (language === "dockerfile") return "Dockerfile";
  return language.charAt(0).toUpperCase() + language.slice(1);
};

export const renderHighlightedCode = ({ text = "", lang = "" }) => {
  const language = normalizeLanguage(lang);
  const canHighlight = language && hljs.getLanguage(language);
  const highlighted = canHighlight
    ? hljs.highlight(text, { language }).value
    : language
      ? escapeHtml(text)
      : hljs.highlightAuto(text).value;
  const className = language ? `hljs language-${language}` : "hljs";

  return `<div class="code-block-shell"><div class="code-block-toolbar"><span class="code-block-language">${languageLabel(language)}</span><button type="button" class="code-block-copy" data-code-copy aria-label="Copy code" title="Copy code"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copy</span></button></div><pre><code class="${className}">${highlighted}</code></pre></div>`;
};

export const highlightedCodeRenderer = {
  code({ text, lang }) {
    return renderHighlightedCode({ text, lang });
  }
};
