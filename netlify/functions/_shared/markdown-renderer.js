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

  return `<div class="code-block-shell"><div class="code-block-toolbar"><span class="code-block-language">${languageLabel(language)}</span><span class="code-block-hint">Read, copy, run</span></div><pre><code class="${className}">${highlighted}</code></pre></div>`;
};

export const highlightedCodeRenderer = {
  code({ text, lang }) {
    return renderHighlightedCode({ text, lang });
  }
};
