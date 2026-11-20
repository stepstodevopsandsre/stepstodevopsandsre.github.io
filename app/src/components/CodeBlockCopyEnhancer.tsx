import { useEffect } from "react";

const copyIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
const checkIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>`;

const copyText = async (value: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Clipboard copy failed");
};

export const CodeBlockCopyEnhancer = () => {
  useEffect(() => {
    const handleClick = async (event: MouseEvent) => {
      const target = event.target instanceof Element
        ? event.target.closest<HTMLButtonElement>("[data-code-copy]")
        : null;
      if (!target) return;

      const code = target.closest(".code-block-shell")?.querySelector("pre code")?.textContent || "";
      if (!code) return;

      try {
        await copyText(code);
        target.dataset.copyState = "copied";
        target.setAttribute("aria-label", "Code copied");
        target.title = "Copied";
        target.innerHTML = `${checkIcon}<span>Copied!</span>`;
        window.setTimeout(() => {
          if (!target.isConnected) return;
          target.dataset.copyState = "ready";
          target.setAttribute("aria-label", "Copy code");
          target.title = "Copy code";
          target.innerHTML = `${copyIcon}<span>Copy</span>`;
        }, 1800);
      } catch {
        target.setAttribute("aria-label", "Copy failed");
        target.title = "Copy failed";
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
};
