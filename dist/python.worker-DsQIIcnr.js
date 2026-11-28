(function(){"use strict";let t=null;const i=()=>(t||(importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js"),t=loadPyodide({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.26.2/full/"})),t);self.onmessage=async s=>{var a;if(((a=s.data)==null?void 0:a.type)!=="run")return;const r=performance.now();try{const e=await i(),d=JSON.stringify(s.data.testCases||[]),c=JSON.stringify(s.data.functionName||""),l=`
import json, sys, io, contextlib, time
sys.setrecursionlimit(2000)
_cases = json.loads(${JSON.stringify(d)})
_name = json.loads(${c})
_fn = globals().get(_name) if _name else None
if not callable(_fn):
    raise RuntimeError("The expected function was not found. Define the required function and run again.")
_results = []
for _case in _cases:
    _started = time.perf_counter()
    _value = _fn(*_case.get("args", []))
    _elapsed = (time.perf_counter() - _started) * 1000
    _results.append({"actual": _value, "expected": _case.get("expected"), "passed": _value == _case.get("expected"), "milliseconds": round(_elapsed, 2)})
print(json.dumps({"results": _results}, default=str))
`,u=await e.runPythonAsync(`${s.data.code}
${l}`),o=JSON.parse(String(u).trim().split(`
`).pop()||"{}"),n=Array.isArray(o.results)?o.results:[],p=n.length>0&&n.every(f=>f.passed);self.postMessage({type:"result",passed:p,results:n,durationMs:Math.round(performance.now()-r)})}catch(e){self.postMessage({type:"error",message:e instanceof Error?e.message:String(e),durationMs:Math.round(performance.now()-r)})}}})();
