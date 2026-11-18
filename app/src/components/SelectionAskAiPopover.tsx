import { useEffect, useRef, useState } from "react";
import { BookOpen, Brain, Check, ChevronRight, Copy, ExternalLink, Lightbulb, MessageCircle, Sparkles } from "lucide-react";

type Provider = "ChatGPT" | "Gemini" | "Claude";
type PromptAction = "explain" | "example" | "interview";
type SelectionState = { text: string; top: number; left: number };

const MAX_SELECTION_LENGTH = 5000;
const providers: { name: Provider; url: string; queryKey: string; icon: typeof Brain }[] = [
  { name: "ChatGPT", url: "https://chatgpt.com/", queryKey: "q", icon: MessageCircle },
  { name: "Gemini", url: "https://gemini.google.com/app", queryKey: "prompt", icon: Sparkles },
  { name: "Claude", url: "https://claude.ai/new", queryKey: "q", icon: Brain }
];

const actionLabels: Record<PromptAction, { label: string; icon: typeof BookOpen; instruction: string }> = {
  explain: { label: "Explain simply", icon: BookOpen, instruction: "Explain the selected text in simple English. Build the idea step by step and define any necessary term." },
  example: { label: "Give a real example", icon: Lightbulb, instruction: "Explain the selected text with one practical DevOps or SRE example, including a short command or code sample when useful." },
  interview: { label: "Turn into interview practice", icon: MessageCircle, instruction: "Turn the selected text into interview preparation. Give a strong sample answer, then add two useful follow-up questions." }
};

const getPageContext = () => document.title.replace(/\s*\|\s*Steps to DevOps & SRE\s*$/, "").trim() || "this page";
const buildPrompt = (text: string, instruction: string) => `I am reading "${getPageContext()}" on Steps to DevOps & SRE.

${instruction}

Selected text:
"""
${text}
"""

Keep the response practical, accurate, and focused on helping me understand this topic.`;

const copyText = async (value: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
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
  return copied;
};

const createProviderUrl = (baseUrl: string, queryKey: string, prompt: string) => {
  // Keep the URL reasonably small. The complete prompt is copied separately.
  const urlPrompt = prompt.slice(0, 1800);
  return `${baseUrl}?${queryKey}=${encodeURIComponent(urlPrompt)}`;
};

export const SelectionAskAiPopover = () => {
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSelection = () => {
      const currentSelection = window.getSelection();
      const text = currentSelection?.toString().trim() || "";
      const range = currentSelection?.rangeCount ? currentSelection.getRangeAt(0) : null;
      if (!text || !range || currentSelection?.isCollapsed) {
        setSelection(null);
        setIsOpen(false);
        return;
      }
      const element = range.commonAncestorContainer instanceof Element ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
      if (!element || element.closest("input, textarea, select, button, a")) {
        setSelection(null);
        setIsOpen(false);
        return;
      }
      const rect = range.getBoundingClientRect();
      const popoverWidth = 250;
      const left = Math.min(Math.max(12, rect.left + rect.width / 2 - popoverWidth / 2), window.innerWidth - popoverWidth - 12);
      const top = rect.top > 110 ? rect.top - 58 : rect.bottom + 12;
      setSelection({ text: text.slice(0, MAX_SELECTION_LENGTH), top, left });
      setStatus("");
    };
    const clearOnScroll = () => { setSelection(null); setIsOpen(false); };
    const handlePointerDown = (event: PointerEvent) => {
      if (!popoverRef.current?.contains(event.target as Node)) { setSelection(null); setIsOpen(false); }
    };
    document.addEventListener("selectionchange", updateSelection);
    document.addEventListener("mouseup", updateSelection);
    document.addEventListener("touchend", updateSelection);
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("scroll", clearOnScroll, true);
    window.addEventListener("resize", clearOnScroll);
    return () => {
      document.removeEventListener("selectionchange", updateSelection);
      document.removeEventListener("mouseup", updateSelection);
      document.removeEventListener("touchend", updateSelection);
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("scroll", clearOnScroll, true);
      window.removeEventListener("resize", clearOnScroll);
    };
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { setSelection(null); setIsOpen(false); } };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  if (!selection) return null;
  const runAction = async (action: PromptAction) => {
    const copied = await copyText(buildPrompt(selection.text, actionLabels[action].instruction));
    setStatus(copied ? "Prompt copied. Paste it into your AI chat." : "Copy failed. Please try again.");
    setIsOpen(false);
  };
  const openProvider = async (provider: Provider, url: string, queryKey: string) => {
    const prompt = buildPrompt(selection.text, "Help me understand the selected text and give a practical explanation.");
    const copied = await copyText(prompt);
    window.open(createProviderUrl(url, queryKey, prompt), "_blank", "noopener,noreferrer");
    setStatus(copied ? `Prompt copied. Paste it into ${provider}.` : `Opened ${provider}. Copy failed.`);
    setIsOpen(false);
  };

  return <div ref={popoverRef} className="fixed z-[80] hidden w-[min(250px,calc(100vw-1.5rem))] flex-col gap-2 rounded-2xl border border-border/80 bg-surface/95 p-2.5 shadow-[0_18px_50px_rgba(15,23,42,0.22)] backdrop-blur-xl lg:flex" style={{ top: selection.top, left: selection.left }} role="dialog" aria-label="Ask AI about selected text">
    <button type="button" onClick={() => setIsOpen((open) => !open)} className="flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold text-text transition hover:bg-accentSoft hover:text-accent" aria-expanded={isOpen}>
      <span className="inline-flex items-center gap-2"><Sparkles size={16} className="text-accent" />Ask AI about this</span>
      <ChevronRight size={15} className={`text-muted transition-transform ${isOpen ? "rotate-90" : ""}`} />
    </button>
    {isOpen && <div className="border-t border-border/60 pt-2">
      <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Create a prompt</p>
      {Object.entries(actionLabels).map(([key, action]) => { const Icon = action.icon; return <button key={key} type="button" onClick={() => runAction(key as PromptAction)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-text transition hover:bg-accentSoft hover:text-accent"><Icon size={14} />{action.label}<Copy size={12} className="ml-auto text-muted" /></button>; })}
      <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Open an AI chat</p>
      {providers.map(({ name, url, queryKey, icon: Icon }) => <button key={name} type="button" onClick={() => openProvider(name, url, queryKey)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-text transition hover:bg-accentSoft hover:text-accent"><Icon size={14} />{name}<ExternalLink size={12} className="ml-auto text-muted" /></button>)}
    </div>}
    {status && <p className="flex items-start gap-1.5 border-t border-border/60 px-3 pt-2 text-[11px] leading-4 text-muted"><Check size={13} className="mt-0.5 shrink-0 text-success" />{status}</p>}
  </div>;
};
