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
  cli: "command",
  commands: "command",
  shellcommand: "command",
  "shell-command": "command",
  command: "command",
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

const COMMAND_RE = /^(terraform|kubectl|helm|docker|docker-compose|git|aws|az|gcloud|ansible|ansible-playbook|npm|npx|yarn|pnpm|curl|wget|ssh|scp|openssl|jq|make|go|python|pip|node)\b/;

const inferLanguage = (language, text) => {
  const normalized = normalizeLanguage(language);
  if (normalized !== "javascript") return normalized;

  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const commandLines = lines.filter((line) => COMMAND_RE.test(line.replace(/^[$>]\s*/, "")));
  const looksLikeTerraform =
    /(^|\n)\s*(resource|data|variable|output|module|provider|terraform|locals|lifecycle|import|moved)\s+["{]/m.test(text) ||
    /\b(ignore_changes|create_before_destroy|prevent_destroy|replace_triggered_by)\s*=/.test(text);

  if (looksLikeTerraform) return "hcl";
  if (lines.length > 0 && commandLines.length >= Math.max(1, Math.ceil(lines.length * 0.5))) return "command";
  return normalized;
};

const languageLabel = (language) => {
  if (!language || language === "text") return "TEXT";
  if (language === "command") return "COMMAND";
  if (language === "hcl") return "Terraform";
  if (language === "dockerfile") return "Dockerfile";
  return language.charAt(0).toUpperCase() + language.slice(1);
};

const highlightTerraform = (text) => {
  const tokens = [];
  const protect = (value) => {
    const token = `\u0000T${tokens.length}X\u0000`;
    tokens.push(value);
    return token;
  };

  let html = escapeHtml(text);
  html = html.replace(/(^|\n)(\s*#.*)$/gm, (_match, start, comment) =>
    `${start}${protect(`<span class="hljs-comment">${comment}</span>`)}`
  );
  html = html.replace(/(&quot;.*?&quot;)/g, (match) => protect(`<span class="hljs-string">${match}</span>`));
  html = html.replace(
    /\b(terraform|resource|data|variable|output|module|provider|locals|backend|lifecycle|precondition|postcondition|import|moved|for_each|count|depends_on|ignore_changes|create_before_destroy|prevent_destroy|replace_triggered_by|condition|error_message|self|each)\b/g,
    (match) => protect(`<span class="hljs-keyword">${match}</span>`)
  );
  html = html.replace(/\b([A-Za-z_][A-Za-z0-9_-]*)\b(?=\s*=)/g, (match) =>
    protect(`<span class="hljs-attr">${match}</span>`)
  );
  html = html.replace(/\b(true|false|null)\b/g, (match) => protect(`<span class="hljs-literal">${match}</span>`));
  html = html.replace(/\b\d+(?:\.\d+)?\b/g, (match) => protect(`<span class="hljs-number">${match}</span>`));

  return html.replace(/\u0000T(\d+)X\u0000/g, (_match, index) => tokens[Number(index)]);
};

export const renderHighlightedCode = ({ text = "", lang = "" }) => {
  const language = inferLanguage(lang, text);
  const highlighted =
    language === "command"
      ? escapeHtml(text)
      : language === "hcl"
        ? highlightTerraform(text)
        : language && hljs.getLanguage(language)
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
