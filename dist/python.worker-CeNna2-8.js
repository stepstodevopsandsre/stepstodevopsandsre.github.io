(function(){"use strict";let s=null;const i=()=>(s||(importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js"),s=loadPyodide({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.26.2/full/"})),s);self.onmessage=async t=>{var a;if(((a=t.data)==null?void 0:a.type)!=="run")return;const r=performance.now();try{const e=await i(),d=JSON.stringify(t.data.testCases||[]),u=JSON.stringify(t.data.functionName||""),c=`
import json, sys, io, contextlib, time
sys.setrecursionlimit(2000)
_output = io.StringIO()
_cases = json.loads(${JSON.stringify(d)})
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
`,l=await e.runPythonAsync(`${t.data.code}
${c}`),o=JSON.parse(String(l).trim().split(`
`).pop()||"{}"),n=Array.isArray(o.results)?o.results:[],p=n.length>0&&n.every(f=>f.passed);self.postMessage({type:"result",passed:p,results:n,durationMs:Math.round(performance.now()-r)})}catch(e){self.postMessage({type:"error",message:e instanceof Error?e.message:String(e),durationMs:Math.round(performance.now()-r)})}}})();
