(function(){"use strict";let a=null;const d=()=>(a||(importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js"),a=loadPyodide({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.26.2/full/"})),a),c=t=>{const e=t instanceof Error?t.message:String(t),n=e.match(/IndentationError:\s*([^\n]+)/);if(n)return`Python indentation error: ${n[1].trim()} Use four spaces for each indentation level, or press Tab in the editor.`;const s=e.match(/SyntaxError:\s*([^\n]+)/);if(s)return`Python syntax error: ${s[1].trim()} Check the line shown in the editor.`;const r=e.match(/NameError:\s*([^\n]+)/);return r?`Python name error: ${r[1].trim()} Check that your variable and function names match the starter code.`:e.length>600?`${e.slice(-600)}`:e};self.onmessage=async t=>{var n;if(((n=t.data)==null?void 0:n.type)!=="run")return;const e=performance.now();try{const s=await d(),r=JSON.stringify(t.data.testCases||[]),p=JSON.stringify(t.data.functionName||""),l=`
import json, sys, io, contextlib, time
sys.setrecursionlimit(2000)
_output = io.StringIO()
_cases = json.loads(${JSON.stringify(r)})
_name = ${p}
_mode = ${JSON.stringify(t.data.executionMode||"Function")}
if _mode == "Stdin/Stdout":
    _input = ${JSON.stringify(t.data.stdinOverride??"")} or (_cases[0].get("stdin", "") if _cases else "")
    _old_stdin = sys.stdin
    sys.stdin = io.StringIO(_input)
    with contextlib.redirect_stdout(_output):
        exec(${JSON.stringify(t.data.code)}, globals())
    sys.stdin = _old_stdin
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
`,_=await s.runPythonAsync(`${t.data.code}
${l}`),u=String(_);if(u.length>2e4)throw new Error("Output limit exceeded. Keep your program output below 20,000 characters.");const o=JSON.parse(u.trim().split(`
`).pop()||"{}"),i=Array.isArray(o.results)?o.results:[],f=i.length>0&&i.every(m=>m.passed);self.postMessage({type:"result",passed:f,results:i,stdout:typeof o.stdout=="string"?o.stdout:"",durationMs:Math.round(performance.now()-e)})}catch(s){self.postMessage({type:"error",message:c(s),durationMs:Math.round(performance.now()-e)})}}})();
