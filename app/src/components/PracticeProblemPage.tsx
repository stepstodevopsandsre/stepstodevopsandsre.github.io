import { AlertCircle, ArrowLeft, Check, CheckCircle2, Code2, Copy, LoaderCircle, Play, RotateCcw, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fetchPracticeProblemArticle } from "@/lib/api";
import type { PracticeProblemArticle } from "@/types";
import { MotionReveal } from "./MotionReveal";

type PracticeProblemPageProps = { slug: string };
type LoadState =
  | { status: "loading" }
  | { status: "success"; article: PracticeProblemArticle }
  | { status: "error"; message: string };

type RunState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "running" }
  | { status: "success"; results: Array<{ actual: unknown; expected: unknown; passed: boolean; milliseconds: number }>; durationMs: number }
  | { status: "failed"; message: string; durationMs?: number; results?: Array<{ actual: unknown; expected: unknown; passed: boolean; milliseconds: number }> };

type PythonCodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const PythonCodeEditor = ({ value, onChange }: PythonCodeEditorProps) => {
  const [highlighted, setHighlighted] = useState("");
  const codeLayerRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let active = true;
    import("highlight.js/lib/core")
      .then(async ({ default: hljs }) => {
        const { default: python } = await import("highlight.js/lib/languages/python");
        hljs.registerLanguage("python", python);
        if (active) setHighlighted(hljs.highlight(value || " ", { language: "python" }).value);
      })
      .catch(() => {
        if (active) setHighlighted("");
      });
    return () => {
      active = false;
    };
  }, [value]);

  const syncScroll = () => {
    if (!textareaRef.current || !codeLayerRef.current) return;
    codeLayerRef.current.scrollTop = textareaRef.current.scrollTop;
    codeLayerRef.current.scrollLeft = textareaRef.current.scrollLeft;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = event.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    if (event.key === "Tab") {
      event.preventDefault();
      const nextValue = `${value.slice(0, start)}    ${value.slice(end)}`;
      onChange(nextValue);
      requestAnimationFrame(() => {
        target.selectionStart = start + 4;
        target.selectionEnd = start + 4;
      });
      return;
    }

    if (event.key === "Enter" && start === end) {
      const currentLine = value.slice(0, start).split("\n").pop() || "";
      const indentation = currentLine.match(/^\s*/)?.[0] || "";
      const extraIndent = /:\s*(#.*)?$/.test(currentLine) ? "    " : "";
      const insertion = `\n${indentation}${extraIndent}`;
      event.preventDefault();
      onChange(`${value.slice(0, start)}${insertion}${value.slice(end)}`);
      requestAnimationFrame(() => {
        target.selectionStart = start + insertion.length;
        target.selectionEnd = start + insertion.length;
      });
    }
  };

  const normalizeLeadingTabs = (source: string) => source.replace(/^(\s*)\t/gm, "$1    ");

  const lineCount = Math.max(1, value.split("\n").length);

  return (
    <div className="relative min-h-[20rem] overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-y-0 left-0 w-12 border-r border-slate-800 bg-slate-900/80" />
        <div className="absolute inset-y-0 left-0 w-12 pt-4 text-right font-mono text-xs leading-6 text-slate-600">
          {Array.from({ length: lineCount }, (_, index) => <div key={index} className="pr-3">{index + 1}</div>)}
        </div>
        <pre ref={codeLayerRef} className="absolute inset-0 m-0 overflow-hidden whitespace-pre p-4 pl-16 font-mono text-sm leading-6 text-slate-100" style={{ backgroundImage: "repeating-linear-gradient(to right, transparent 0, transparent 2.95rem, rgba(148,163,184,0.10) 3rem, transparent 3.05rem)", backgroundSize: "1.5rem 100%" }}><code dangerouslySetInnerHTML={{ __html: highlighted || value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") }} /></pre>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(normalizeLeadingTabs(event.target.value))}
        onKeyDown={handleKeyDown}
        onScroll={syncScroll}
        spellCheck={false}
        aria-label="Python code editor"
        className="relative z-10 min-h-[20rem] w-full resize-y overflow-auto border-0 bg-transparent p-4 pl-16 font-mono text-sm leading-6 text-transparent caret-white outline-none selection:bg-sky-400/30 focus:ring-2 focus:ring-accent/60"
        style={{ WebkitTextFillColor: "transparent", tabSize: 4 }}
      />
    </div>
  );
};

export const PracticeProblemPage = ({ slug }: PracticeProblemPageProps) => {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [runState, setRunState] = useState<RunState>({ status: "idle" });
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  const draftKey = `sr-practice-draft-${slug}`;

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetchPracticeProblemArticle(slug)
      .then((article) => {
        if (!cancelled) {
          setState({ status: "success", article });
          try {
            setCode(localStorage.getItem(draftKey) || article.starterCode || "");
          } catch {
            setCode(article.starterCode || "");
          }
        }
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ status: "error", message: error.message });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const runCode = () => {
    if (state.status !== "success" || !code.trim()) return;
    setRunState({ status: "loading" });
    try {
      localStorage.setItem(draftKey, code);
    } catch {
      // Draft persistence is best effort.
    }

    const worker = new Worker(new URL("../workers/python.worker.ts", import.meta.url));
    let settled = false;
    const timeout = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      worker.terminate();
      setRunState({ status: "failed", message: "Execution took too long. Check for an infinite loop and try again." });
    }, 8000);

    worker.onmessage = (event: MessageEvent<RunState & { type: string }>) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      worker.terminate();
      if (event.data.type === "result") {
        const result = event.data as unknown as { passed: boolean; results: Array<{ actual: unknown; expected: unknown; passed: boolean; milliseconds: number }>; durationMs: number };
        setRunState(result.passed
          ? { status: "success", results: result.results, durationMs: result.durationMs }
          : { status: "failed", message: "One or more tests did not pass.", results: result.results, durationMs: result.durationMs });
      } else {
        setRunState({ status: "failed", message: (event.data as unknown as { message: string }).message || "The code could not run." });
      }
    };
    worker.onerror = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      worker.terminate();
      setRunState({ status: "failed", message: "The Python runtime could not start. Please try again." });
    };
    setRunState({ status: "running" });
    worker.postMessage({ type: "run", code, functionName: state.article.functionName, testCases: state.article.testCases });
  };

  const resetCode = () => {
    if (state.status !== "success") return;
    setCode(state.article.starterCode || "");
    setRunState({ status: "idle" });
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // Ignore storage errors.
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const article = state.status === "success" ? state.article : undefined;

  return (
    <main className="mx-auto max-w-[88rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-5xl">
        <MotionReveal>
          <a href="#" className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface/70 px-4 py-2.5 text-sm font-medium text-muted transition hover:border-accent/30 hover:text-text">
            <ArrowLeft size={16} /> Back to home
          </a>
        </MotionReveal>

        <MotionReveal className="mt-6 rounded-[2rem] border border-border/70 bg-surface/80 p-6 shadow-panel backdrop-blur sm:p-8" delay={0.05}>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            <span className="inline-flex items-center gap-2 rounded-full bg-accentSoft px-3 py-1.5"><Code2 size={14} /> Python practice</span>
            {article?.difficulty && <span className="rounded-full border border-border/70 px-3 py-1.5 text-muted">{article.difficulty}</span>}
          </div>
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-text sm:text-5xl">
            {article?.question ?? (state.status === "error" ? "Practice problem unavailable" : "Loading practice problem")}
          </h1>
          {article && (
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted">
              <span>{article.language}</span>
              {article.topics.map((topic) => <span key={topic} className="rounded-full border border-border/70 px-3 py-1">{topic}</span>)}
            </div>
          )}
        </MotionReveal>

        {state.status === "loading" && (
          <div className="mt-6 flex min-h-[14rem] items-center justify-center rounded-[2rem] border border-border/70 bg-surface/75 p-8 shadow-panel">
            <div className="flex items-center gap-3 text-muted"><LoaderCircle className="animate-spin" size={20} /> Loading problem…</div>
          </div>
        )}

        {state.status === "error" && (
          <div className="mt-6 rounded-[2rem] border border-rose-500/20 bg-rose-500/10 p-8 shadow-panel">
            <div className="flex items-start gap-3"><AlertCircle className="mt-0.5 text-rose-500" size={18} /><div><h2 className="font-display text-2xl font-semibold text-text">Practice problem unavailable</h2><p className="mt-3 text-sm leading-7 text-muted">{state.message}</p></div></div>
          </div>
        )}

        {article && (
          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-surface/80 shadow-panel">
              <article className="article-content prose prose-slate max-w-none overflow-x-hidden p-5 dark:prose-invert sm:p-8" dangerouslySetInnerHTML={{ __html: article.html }} />
            </section>
            <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-surface/80 shadow-panel lg:sticky lg:top-24">
            <div className="bg-canvas/35 p-5 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Python playground</p><p className="mt-1 text-sm text-muted">Run your function against the visible examples. The runtime loads only when you run.</p></div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={resetCode} className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3.5 py-2 text-sm font-semibold text-muted transition hover:border-accent/40 hover:text-text"><RotateCcw size={15} /> Reset</button>
                  <button type="button" onClick={runCode} disabled={runState.status === "loading" || runState.status === "running"} className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60"><Play size={15} /> {runState.status === "loading" ? "Preparing…" : runState.status === "running" ? "Running…" : "Run"}</button>
                </div>
              </div>
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-700/80 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-400"><span>Python</span><button type="button" onClick={copyCode} className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition ${copied ? "bg-emerald-400/15 text-emerald-400" : "hover:text-white"}`} aria-live="polite">{copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied!" : "Copy"}</button></div>
                <PythonCodeEditor value={code} onChange={(value) => { setCode(value); setRunState({ status: "idle" }); }} />
              </div>
              {runState.status === "success" && (
                <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-emerald-500"><CheckCircle2 size={17} /> All visible tests passed <span className="font-normal text-muted">in {runState.durationMs} ms</span></div><div className="mt-3 grid gap-2 sm:grid-cols-3">{runState.results.map((result, index) => <div key={index} className="rounded-xl border border-border/60 bg-surface/50 p-3 text-xs text-muted">Test {index + 1}: {String(result.actual)} <span className="text-emerald-500">✓</span></div>)}</div></div>
              )}
              {runState.status === "failed" && (
                <div className="mt-4 rounded-2xl border border-rose-400/25 bg-rose-400/10 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-rose-500"><XCircle size={17} /> Run needs attention</div><p className="mt-2 text-sm leading-6 text-muted">{runState.message || "One or more tests did not pass."}</p>{runState.results && <div className="mt-3 grid gap-2 sm:grid-cols-3">{runState.results.map((result, index) => <div key={index} className="rounded-xl border border-border/60 bg-surface/50 p-3 text-xs text-muted">Test {index + 1}: expected {String(result.expected)}, received {String(result.actual)} {result.passed ? "✓" : "×"}</div>)}</div>}</div>
              )}
            </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
};
