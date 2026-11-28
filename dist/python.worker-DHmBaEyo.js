(function(){"use strict";let o=null;const c=()=>(o||(importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js"),o=loadPyodide({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.26.2/full/"})),o),d=t=>{const e=t instanceof Error?t.message:String(t),n=e.match(/IndentationError:\s*([^\n]+)/);if(n)return`Python indentation error: ${n[1].trim()} Use four spaces for each indentation level, or press Tab in the editor.`;const s=e.match(/SyntaxError:\s*([^\n]+)/);if(s)return`Python syntax error: ${s[1].trim()} Check the line shown in the editor.`;const r=e.match(/NameError:\s*([^\n]+)/);return r?`Python name error: ${r[1].trim()} Check that your variable and function names match the starter code.`:e.length>600?`${e.slice(-600)}`:e};self.onmessage=async t=>{var n;if(((n=t.data)==null?void 0:n.type)!=="run")return;const e=performance.now();try{const s=await c(),r=JSON.stringify(t.data.testCases||[]),u=JSON.stringify(t.data.functionName||""),l=`
import json, sys, io, contextlib, time
sys.setrecursionlimit(2000)
_output = io.StringIO()
_cases = json.loads(${JSON.stringify(r)})
_name = ${u}
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
`,p=await s.runPythonAsync(`${t.data.code}
${l}`),i=JSON.parse(String(p).trim().split(`
`).pop()||"{}"),a=Array.isArray(i.results)?i.results:[],f=a.length>0&&a.every(m=>m.passed);self.postMessage({type:"result",passed:f,results:a,durationMs:Math.round(performance.now()-e)})}catch(s){self.postMessage({type:"error",message:d(s),durationMs:Math.round(performance.now()-e)})}}})();
