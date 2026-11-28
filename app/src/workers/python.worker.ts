declare const loadPyodide: (options: { indexURL: string }) => Promise<any>;
declare function importScripts(...urls: string[]): void;

type RunRequest = {
  type: "run";
  code: string;
  functionName?: string;
  testCases: Array<{ args: unknown[]; expected: unknown }>;
};

let pyodidePromise: Promise<any> | null = null;

const getPyodide = () => {
  if (!pyodidePromise) {
    importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js");
    pyodidePromise = loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/" });
  }
  return pyodidePromise;
};

const formatPythonError = (error: unknown) => {
  const raw = error instanceof Error ? error.message : String(error);
  const indentation = raw.match(/IndentationError:\s*([^\n]+)/);
  if (indentation) return `Python indentation error: ${indentation[1].trim()} Use four spaces for each indentation level, or press Tab in the editor.`;
  const syntax = raw.match(/SyntaxError:\s*([^\n]+)/);
  if (syntax) return `Python syntax error: ${syntax[1].trim()} Check the line shown in the editor.`;
  const name = raw.match(/NameError:\s*([^\n]+)/);
  if (name) return `Python name error: ${name[1].trim()} Check that your variable and function names match the starter code.`;
  return raw.length > 600 ? `${raw.slice(-600)}` : raw;
};

self.onmessage = async (event: MessageEvent<RunRequest>) => {
  if (event.data?.type !== "run") return;
  const startedAt = performance.now();

  try {
    const pyodide = await getPyodide();
    const testCases = JSON.stringify(event.data.testCases || []);
    const functionName = JSON.stringify(event.data.functionName || "");
    const harness = `
import json, sys, io, contextlib, time
sys.setrecursionlimit(2000)
_output = io.StringIO()
_cases = json.loads(${JSON.stringify(testCases)})
_name = ${functionName}
_fn = globals().get(_name) if _name else None
if not callable(_fn):
    raise RuntimeError("The expected function was not found. Define the required function and run again.")
_results = []
with contextlib.redirect_stdout(_output):
    for _case in _cases:
        _started = time.perf_counter()
        _value = _fn(*_case.get("args", []))
        _elapsed = (time.perf_counter() - _started) * 1000
        _results.append({"actual": _value, "expected": _case.get("expected"), "passed": _value == _case.get("expected"), "milliseconds": round(_elapsed, 2)})
_output.write(json.dumps({"results": _results}, default=str))
_output.getvalue()
`;
    const output = await pyodide.runPythonAsync(`${event.data.code}\n${harness}`);
    const parsed = JSON.parse(String(output).trim().split("\n").pop() || "{}");
    const results = Array.isArray(parsed.results) ? parsed.results : [];
    const passed = results.length > 0 && results.every((item: { passed: boolean }) => item.passed);
    self.postMessage({ type: "result", passed, results, durationMs: Math.round(performance.now() - startedAt) });
  } catch (error) {
    self.postMessage({ type: "error", message: formatPythonError(error), durationMs: Math.round(performance.now() - startedAt) });
  }
};
