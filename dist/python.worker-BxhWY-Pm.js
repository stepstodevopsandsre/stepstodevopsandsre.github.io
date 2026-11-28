(function(){"use strict";let i=null;const f=()=>(i||(importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js"),i=loadPyodide({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.26.2/full/"})),i),m=t=>{const e=t instanceof Error?t.message:String(t),s=e.match(/IndentationError:\s*([^\n]+)/);if(s)return`Python indentation error: ${s[1].trim()} Use four spaces for each indentation level, or press Tab in the editor.`;const n=e.match(/SyntaxError:\s*([^\n]+)/);if(n)return`Python syntax error: ${n[1].trim()} Check the line shown in the editor.`;const r=e.match(/NameError:\s*([^\n]+)/);return r?`Python name error: ${r[1].trim()} Check that your variable and function names match the starter code.`:e.length>600?`${e.slice(-600)}`:e};self.onmessage=async t=>{var s,n,r,d;if(((s=t.data)==null?void 0:s.type)!=="run")return;const e=performance.now();try{const o=await f();if(t.data.executionMode==="Stdin/Stdout"){const p=((d=(t.data.stdinOverride||((r=(n=t.data.testCases)==null?void 0:n[0])==null?void 0:r.stdin)||"").match(/[^\n]*(?:\n|$)/g))==null?void 0:d.filter(S=>S.length>0))??[];let _=0;o.setStdin({stdin:()=>_<p.length?p[_++]:void 0,isatty:!1})}const h=JSON.stringify(t.data.testCases||[]),g=JSON.stringify(t.data.functionName||""),y=`
import json, sys, io, contextlib, time
sys.setrecursionlimit(2000)
_output = io.StringIO()
_cases = json.loads(${JSON.stringify(h)})
_name = ${g}
_mode = ${JSON.stringify(t.data.executionMode||"Function")}
if _mode == "Stdin/Stdout":
    with contextlib.redirect_stdout(_output):
        exec(${JSON.stringify(t.data.code)}, globals())
    _actual = _output.getvalue().strip()
    _expected = _cases[0].get("expectedOutput", "") if _cases else ""
    _output.seek(0)
    _output.truncate(0)
    _output.write(json.dumps({"results": [{"actual": _actual, "expected": _expected, "passed": _actual == _expected, "milliseconds": 0}]}))
    _output.getvalue()
else:
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
    _captured = _output.getvalue()
    _output.seek(0)
    _output.truncate(0)
    _output.write(json.dumps({"results": _results, "stdout": _captured}, default=str))
    _output.getvalue()
`,x=await o.runPythonAsync(`${t.data.code}
${y}`),c=String(x);if(c.length>2e4)throw new Error("Output limit exceeded. Keep your program output below 20,000 characters.");const a=JSON.parse(c.trim().split(`
`).pop()||"{}"),u=Array.isArray(a.results)?a.results:[],w=u.length>0&&u.every(l=>l.passed);self.postMessage({type:"result",passed:w,results:u,stdout:typeof a.stdout=="string"?a.stdout:"",durationMs:Math.round(performance.now()-e)})}catch(o){self.postMessage({type:"error",message:m(o),durationMs:Math.round(performance.now()-e)})}}})();
