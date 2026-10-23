import React,{useEffect,useRef,useState} from 'react';
import {X,Calculator,Move,RotateCcw,BookOpen} from 'lucide-react';
import {useCalculator} from './CalculatorProvider';
import {evaluateExpression,formatValue,approximateFraction,numericalDerivative,numericalIntegral,numericalSolve,solveLinearSystem,solvePolynomial,statistics,determinant,invertMatrix,multiplyMatrices,baseConversion,vectorOperations,complex,type CalculatorMode,type Complex} from '../../domain/calculator/simulator/engine';
import {CANON_MANUAL_URL} from '../../domain/calculator/canonTechniques';

const modes:CalculatorMode[]=['COMP','CPLX','STAT','BASE','EQN','TABLE','MATX','VCTR'];
const textInput='w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400';
const secondary='rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500';
const parseNumbers=(value:string)=>{
 const arr=value.split(/[\s,;]+/).filter(Boolean).map(Number);if(!arr.length||arr.length>2000||arr.some(x=>!Number.isFinite(x)))throw Error('Input ERROR: enter 1–2000 finite numbers separated by commas');return arr;
};
const parseMatrix=(value:string)=>{
 const rows=value.trim().split(/[;\n]+/).filter(Boolean).map(row=>parseNumbers(row));if(!rows.length||rows.some(row=>row.length!==rows[0].length)||rows.length>4||rows[0].length>4)throw Error('Dimension ERROR: enter a rectangular matrix up to 4×4');return rows;
};
const resultText=(value:unknown):string=>{
 if(typeof value==='number')return Number(value.toPrecision(11)).toString();
 if(Array.isArray(value))return JSON.stringify(value.map(row=>Array.isArray(row)?row.map(resultText):resultText(row)));
 return JSON.stringify(value,null,2);
};

const Field:React.FC<{label:string;value:string;onChange:(s:string)=>void;multiline?:boolean}>=({label,value,onChange,multiline})=><label className="block text-xs font-semibold text-slate-700">{label}{multiline?<textarea className={`${textInput} mt-1 font-mono`} rows={2} value={value} onChange={e=>onChange(e.target.value)}/>:<input className={`${textInput} mt-1 font-mono`} value={value} onChange={e=>onChange(e.target.value)}/>}</label>;
export const CalculatorPanel:React.FC=()=>{
 const {open,setOpen,mode,setMode,angle,setAngle,ans,setAns,memory,setMemory}=useCalculator();
 const [entry,setEntry]=useState('');const [output,setOutput]=useState('0');const [error,setError]=useState('');
 const [registers,setRegisters]=useState<Record<string,Complex>>(()=>Object.fromEntries(['A','B','C','D','E','F'].map(letter=>[letter,complex(0)])));
 const [regName,setRegName]=useState('A');
 const [modeMenuOpen,setModeMenuOpen]=useState(false);const [shift,setShift]=useState(false);const [alpha,setAlpha]=useState(false);const [fraction,setFraction]=useState(false);const [showTools,setShowTools]=useState(false);
 const [toolExpr,setToolExpr]=useState('x^2-2');const [toolX,setToolX]=useState('1');const [toolEnd,setToolEnd]=useState('2');
 const [eqKind,setEqKind]=useState<'poly'|'linear'>('poly');const [eqCoeffs,setEqCoeffs]=useState('1, 0, -2');const [eqMatrix,setEqMatrix]=useState('2,1;1,-1');const [eqRhs,setEqRhs]=useState('5,1');
 const [statXs,setStatXs]=useState('1,2,3,4,5');const [statYs,setStatYs]=useState('');
 const [baseInput,setBaseInput]=useState('255');const [baseRadix,setBaseRadix]=useState<2|8|10|16>(10);
 const [matA,setMatA]=useState('1,2;3,4');const [matB,setMatB]=useState('2,0;1,2');
 const [vecA,setVecA]=useState('1,2,3');const [vecB,setVecB]=useState('4,5,6');
 const [tableExpr,setTableExpr]=useState('x^2');const [tableStart,setTableStart]=useState('0');const [tableEnd,setTableEnd]=useState('5');const [tableStep,setTableStep]=useState('1');
 const [details,setDetails]=useState('');const [position,setPosition]=useState<{x:number;y:number}|null>(null);
 const drag=useRef<{x:number;y:number;startX:number;startY:number}|null>(null);const entryInput=useRef<HTMLInputElement>(null);
 useEffect(()=>{if(!open)return;const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);return}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[open,mode]);
 if(!open)return null;
 const fail=(e:unknown)=>{const message=e instanceof Error?e.message:'Calculation failed';setError(message);setOutput(message)};
 const evalOptions={angle,mode:mode==='CPLX'?'CPLX' as const:'COMP' as const,ans,memory,variables:registers};
 const calculate=()=>{try{const value=evaluateExpression(entry,evalOptions);setAns(value);setOutput(fraction&&value.im===0?approximateFraction(value.re)??formatValue(value,'COMP'):formatValue(value,mode==='CPLX'?'CPLX':'COMP'));setError('')}catch(e){fail(e)}};
 const insert=(value:string)=>{setEntry(previous=>previous+value);setError('');entryInput.current?.focus()};
 const press=(key:string)=>{
  if(modeMenuOpen&&/^[1-8]$/.test(key)){setMode(modes[Number(key)-1]);setModeMenuOpen(false);setDetails('');return}
  if(alpha&&/^[1-6]$/.test(key)){insert('ABCDEF'[Number(key)-1]);setAlpha(false);return}
  if(key==='SHIFT'){setShift(!shift);setAlpha(false);return}if(key==='ALPHA'){setAlpha(!alpha);setShift(false);return}
  if(key==='AC'){setEntry('');setOutput('0');setError('');setShift(false);setAlpha(false);return}
  if(key==='DEL'){setEntry(s=>s.slice(0,-1));return}
  if(key==='='){calculate();setShift(false);setAlpha(false);return}
  if(key==='STO'){setMemory(ans);setOutput('Stored Ans → M');return}
  if(key==='RCL'){insert('M');return}
  if(key==='Ans'){insert('Ans');return}
  if(key==='S⇔D'){setFraction(f=>!f);try{const value=evaluateExpression(entry,evalOptions);setOutput(!fraction&&value.im===0?approximateFraction(value.re)??formatValue(value,'COMP'):formatValue(value,mode==='CPLX'?'CPLX':'COMP'))}catch{/* wait until equals */}return}
  if(key==='MODE'){setModeMenuOpen(value=>!value);return}
  const mapped=key==='sin'?shift?'asin(':'sin(':key==='cos'?shift?'acos(':'cos(':key==='tan'?shift?'atan(':'tan(':key==='ln'?shift?'exp(':'ln(':key==='log'?shift?'10^(':'log(':key==='x²'?shift?'sqrt(':'^2':key==='√'?'sqrt(':key==='xʸ'?'^':key==='EXP'?'E':key==='π'?'pi':key==='i'?'i':key==='×'?'*':key==='÷'?'/':key==='−'?'-':key;
  insert(mapped);setShift(false);setAlpha(false);
 };
 const run=(fn:()=>unknown)=>{try{setDetails(resultText(fn()));setError('')}catch(e){const message=e instanceof Error?e.message:'Input error';setDetails(message);setError(message)}};
 const runTool=(kind:'derivative'|'integral'|'solve')=>run(()=>{
  const x=Number(toolX),end=Number(toolEnd);if(!Number.isFinite(x)||!Number.isFinite(end))throw Error('Input ERROR: use finite numeric arguments');
  if(kind==='derivative')return {derivativeAt:x,value:numericalDerivative(toolExpr,x,evalOptions),method:'centered difference'};
  if(kind==='integral')return {from:x,to:end,value:numericalIntegral(toolExpr,x,end,evalOptions),method:'adaptive Simpson (not Canon firmware)'};
  return {initialGuess:x,root:numericalSolve(toolExpr,x,evalOptions),method:'Newton iteration; not exhaustive'};
 });
 const handleDrag=(e:React.PointerEvent)=>{if(window.innerWidth<640)return;drag.current={x:e.clientX,y:e.clientY,startX:position?.x??Math.max(8,window.innerWidth-410),startY:position?.y??76};(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)};
 const moveDrag=(e:React.PointerEvent)=>{if(!drag.current)return;const p=drag.current;setPosition({x:Math.max(0,Math.min(window.innerWidth-300,p.startX+e.clientX-p.x)),y:Math.max(0,Math.min(window.innerHeight-140,p.startY+e.clientY-p.y))})};
 const keyRows=[['SHIFT','ALPHA','MODE','STO','RCL','DEL'],['sin','cos','tan','ln','log','√'],['(',')','x²','xʸ','π','i'],['7','8','9','÷','Ans','AC'],['4','5','6','×','!','S⇔D'],['1','2','3','−','EXP','%'],['0','.','+','=',',','M']];
 return <div className="fixed inset-0 z-[90] pointer-events-none" aria-label="F-789SGA-style calculator overlay">
  <div className="absolute inset-0 bg-black/40 pointer-events-auto sm:hidden" onClick={()=>setOpen(false)}/>
  <section role="dialog" aria-modal="false" aria-label="F-789SGA-style scientific calculator" className="pointer-events-auto fixed inset-x-0 bottom-0 top-auto sm:inset-auto sm:top-[76px] sm:right-3 w-full sm:w-[396px] max-h-[96vh] sm:max-h-[calc(100vh-84px)] flex flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border border-slate-400 bg-slate-100 text-slate-900 shadow-2xl" style={position&&window.innerWidth>=640?{left:position.x,top:position.y,right:'auto'}:undefined}>
   <header onPointerDown={handleDrag} onPointerMove={moveDrag} onPointerUp={()=>drag.current=null} className="flex items-center justify-between bg-[#21334c] px-3 py-2.5 text-white select-none touch-none sm:cursor-move">
    <div className="flex items-center gap-2"><Move size={14}/><Calculator size={17}/><div><strong className="text-sm">F-789SGA-style Calculator</strong><p className="text-[10px] text-slate-200">Independent training simulator · not Canon firmware</p></div></div>
    <button type="button" title="Close calculator" aria-label="Close calculator" onClick={()=>setOpen(false)} className="rounded-lg p-2 hover:bg-white/15"><X size={19}/></button>
   </header>
   <div className="overflow-y-auto overscroll-contain p-3 space-y-3">
    <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Calculator operating modes">
     {modes.map(m=><button type="button" role="tab" key={m} aria-selected={mode===m} onClick={()=>{setMode(m);setModeMenuOpen(false);setDetails('');setError('');setShift(false)}} className={`rounded-md px-2 py-1.5 text-[11px] font-bold ${mode===m?'bg-indigo-800 text-white':'bg-white text-slate-600 border border-slate-300'}`}>{m}</button>)}
    </div>
    {modeMenuOpen&&<div className="rounded-lg border border-indigo-300 bg-indigo-50 p-2 text-xs">MODE: select 1 COMP · 2 CPLX · 3 STAT · 4 BASE · 5 EQN · 6 TABLE · 7 MATX · 8 VCTR</div>}
    <div className="rounded-xl border-2 border-slate-500 bg-[#d8e5d3] p-3 font-mono shadow-inner" aria-label="Calculator display">
     <div className="flex flex-wrap justify-between text-[10px] font-bold text-slate-700"><span>{mode} · {angle}</span><span>{shift?'SHIFT ':''}{alpha?'ALPHA ':''}{fraction?'FRAC ':''}M</span></div>
     <div className="mt-1 break-all text-right text-[13px] min-h-5">{entry||'0'}</div>
     <output aria-live="polite" className={`block break-all text-right text-xl font-bold min-h-7 ${error?'text-red-700':'text-slate-900'}`}>{output}</output>
    </div>
    {(mode==='COMP'||mode==='CPLX')&&<>
     <div className="flex items-center gap-2"><label className="text-xs font-semibold" htmlFor="f789-entry">Expression</label><input id="f789-entry" ref={entryInput} className={`${textInput} flex-1 font-mono`} aria-label="Calculator expression" value={entry} onChange={e=>setEntry(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();calculate()}}}/></div>
     <div className="flex gap-2 items-center text-xs">Angle: {(['DEG','RAD','GRAD'] as const).map(u=><button key={u} className={`rounded-md px-2 py-1 border ${angle===u?'bg-indigo-800 text-white':'bg-white'}`} onClick={()=>setAngle(u)}>{u}</button>)}<span className="ml-auto text-slate-600">M: {formatValue(memory,'CPLX')}</span></div>
     <p className="text-[10px] text-slate-600">SHIFT maps sin/cos/tan to inverse functions. ALPHA then 1–6 inserts study variables A–F; these are convenience mappings, not verified physical-key sequences.</p>
     <div className="grid grid-cols-6 gap-1" aria-label="Calculator keypad">{keyRows.flat().map((key,i)=><button type="button" key={`${i}-${key}`} aria-label={`Calculator ${key}`} onClick={()=>press(key)} className={`min-h-10 rounded-lg border text-xs font-bold shadow-sm active:translate-y-px focus-visible:outline-blue-700 ${['SHIFT','ALPHA','MODE','STO','RCL','DEL','AC','S⇔D'].includes(key)?'bg-slate-300 border-slate-400 text-slate-900':key==='='?'bg-orange-400 border-orange-500 text-slate-950': 'bg-white border-slate-300 text-slate-900'}`}>{key}</button>)}</div>
     <div className="flex flex-wrap gap-2 items-center text-xs border border-slate-300 rounded-lg p-2" aria-label="Independent calculator variable memories">
      <span className="font-semibold">A–F memories</span>
      <select aria-label="Register" className="rounded border p-1 bg-white" value={regName} onChange={e=>setRegName(e.target.value)}>{['A','B','C','D','E','F'].map(r=><option key={r}>{r}</option>)}</select>
      <button className={secondary} onClick={()=>{setRegisters(previous=>({...previous,[regName]:ans}));setOutput(`Stored Ans → ${regName}`)}}>Save Ans</button>
      <button className={secondary} onClick={()=>insert(regName)}>Recall {regName}</button>
      <span className="text-slate-600">{regName}={formatValue(registers[regName],'CPLX')}</span>
     </div>
     <div className="flex gap-2 flex-wrap"><button className={secondary} onClick={()=>setShowTools(t=>!t)}>Numerical SOLVE / d/dx / ∫</button><button className={secondary} onClick={()=>{setEntry('');setOutput('0');setAns(complex(0));setMemory(complex(0));setRegisters(Object.fromEntries(['A','B','C','D','E','F'].map(letter=>[letter,complex(0)])));setError('')}}><RotateCcw className="inline h-3.5 w-3.5"/> Clear memory & display</button></div>
     {showTools&&<div className="rounded-xl border border-slate-300 bg-white p-3 space-y-2"><Field label="Expression f(x) or f(x)=0 (enter left − right)" value={toolExpr} onChange={setToolExpr}/><div className="grid grid-cols-2 gap-2"><Field label="x / guess / lower" value={toolX} onChange={setToolX}/><Field label="Upper integration bound" value={toolEnd} onChange={setToolEnd}/></div><div className="flex flex-wrap gap-2"><button className={secondary} onClick={()=>runTool('derivative')}>d/dx</button><button className={secondary} onClick={()=>runTool('integral')}>∫ dx</button><button className={secondary} onClick={()=>runTool('solve')}>SOLVE</button></div></div>}
    </>}
    {mode==='EQN'&&<div className="space-y-3"><div className="flex gap-2"><button className={secondary} aria-pressed={eqKind==='poly'} onClick={()=>setEqKind('poly')}>Polynomial</button><button className={secondary} aria-pressed={eqKind==='linear'} onClick={()=>setEqKind('linear')}>Simultaneous</button></div>{eqKind==='poly'?<><Field label="Coefficients highest degree first, e.g. 1,0,-2 for x²−2=0" value={eqCoeffs} onChange={setEqCoeffs}/><button className={secondary} onClick={()=>run(()=>solvePolynomial(parseNumbers(eqCoeffs)).map((z,i)=>`root ${i+1}: ${formatValue(z,'CPLX')}`))}>Solve polynomial (degree 2–4)</button></>:<><Field multiline label="Coefficient matrix A, e.g. 2,1;1,-1" value={eqMatrix} onChange={setEqMatrix}/><Field label="Right-hand values b" value={eqRhs} onChange={setEqRhs}/><button className={secondary} onClick={()=>run(()=>solveLinearSystem(parseMatrix(eqMatrix),parseNumbers(eqRhs)))}>Solve Ax = b</button></>}</div>}
    {mode==='STAT'&&<div className="space-y-2"><Field label="Data X (comma-separated)" value={statXs} onChange={setStatXs}/><Field label="Optional Y (linear regression)" value={statYs} onChange={setStatYs}/><button className={secondary} onClick={()=>run(()=>statistics(parseNumbers(statXs),statYs.trim()?parseNumbers(statYs):undefined))}>Calculate statistics</button></div>}
    {mode==='BASE'&&<div className="space-y-2"><Field label="Signed 32-bit input" value={baseInput} onChange={setBaseInput}/><div className="flex gap-2">{([2,8,10,16] as const).map(r=><button key={r} className={secondary} aria-pressed={baseRadix===r} onClick={()=>setBaseRadix(r)}>{({2:'BIN',8:'OCT',10:'DEC',16:'HEX'} as const)[r]}</button>)}</div><button className={secondary} onClick={()=>run(()=>baseConversion(baseInput,baseRadix))}>Convert</button></div>}
    {mode==='MATX'&&<div className="space-y-2"><Field label="Matrix A (rows separated by semicolons)" value={matA} onChange={setMatA} multiline/><Field label="Matrix B" value={matB} onChange={setMatB} multiline/><div className="flex flex-wrap gap-2"><button className={secondary} onClick={()=>run(()=>({determinant:determinant(parseMatrix(matA))}))}>det A</button><button className={secondary} onClick={()=>run(()=>invertMatrix(parseMatrix(matA)))}>A⁻¹</button><button className={secondary} onClick={()=>run(()=>multiplyMatrices(parseMatrix(matA),parseMatrix(matB)))}>A × B</button></div></div>}
    {mode==='VCTR'&&<div className="space-y-2"><Field label="Vector A" value={vecA} onChange={setVecA}/><Field label="Vector B" value={vecB} onChange={setVecB}/><button className={secondary} onClick={()=>run(()=>vectorOperations(parseNumbers(vecA),parseNumbers(vecB)))}>Vector operations</button></div>}
    {mode==='TABLE'&&<div className="space-y-2"><Field label="f(x)" value={tableExpr} onChange={setTableExpr}/><div className="grid grid-cols-3 gap-2"><Field label="Start" value={tableStart} onChange={setTableStart}/><Field label="End" value={tableEnd} onChange={setTableEnd}/><Field label="Step" value={tableStep} onChange={setTableStep}/></div><button className={secondary} onClick={()=>run(()=>{const from=Number(tableStart),to=Number(tableEnd),step=Number(tableStep);if(![from,to,step].every(Number.isFinite)||step===0||(to-from)/step<0||(to-from)/step>100)throw Error('Range ERROR: use a valid progression with at most 101 rows');return Array.from({length:Math.floor((to-from)/step+1e-9)+1},(_,i)=>{const x=from+i*step;return {x,y:formatValue(evaluateExpression(tableExpr,{...evalOptions,mode:'COMP',x}))}})})}>Generate table</button></div>}
    {details&&<pre className={`max-h-40 overflow-auto whitespace-pre-wrap rounded-lg p-3 text-xs ${error?'border border-red-300 bg-red-50 text-red-900':'bg-white border border-slate-200 text-slate-800'}`} role="status">{details}</pre>}
    <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-300 pt-2 text-[10px] text-slate-600"><span>Study simulator · computation ≠ solution guidance</span><a href={CANON_MANUAL_URL} target="_blank" rel="noreferrer" className="flex items-center gap-1 underline"><BookOpen size={12}/> Official manual</a></footer>
    <p className="text-[10px] text-amber-900">Compatibility note: the keypad is simplified, numerical integration uses adaptive Simpson (not Canon Gauss–Kronrod), and operation sequences, display rounding, error codes and all 605 advertised functions have not been device-verified. Do not use this app as an exact substitute for a permitted physical calculator.</p>
   </div>
  </section>
 </div>
};
