import React, { useState } from 'react';
import { BookOpenCheck, Check, ChevronDown } from 'lucide-react';
import { MathFormula, FormattedMathText } from '../MathFormula';
import { LessonBlock } from '../../domain/learn/lessonTypes';
import { TrigonometryDiagram } from './TrigonometryDiagram';

const base='text-base leading-[1.8] text-slate-700';
export const LearnSectionRenderer:React.FC<{blocks:LessonBlock[]}> = ({blocks})=> (
  <div className="space-y-7">
    {blocks.map(block=>{
      if(block.type==='diagram')return <TrigonometryDiagram key={block.id} diagram={block.diagram} caption={block.caption}/>;
      if(block.type==='formula')return (
        <figure key={block.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 min-w-0">
          <div className="max-w-full overflow-x-auto"><MathFormula formula={block.latex} block /></div>
          {block.description && <figcaption className="mt-2 text-sm text-center text-slate-600 leading-relaxed">{block.description}</figcaption>}
        </figure>
      );
      if(block.type==='worked-example')return <LearnWorkedExample key={block.id} {...block}/>;
      if(block.type==='checkpoint')return <LearnCheckpoint key={block.id} {...block}/>;
      if(block.type==='definition')return (
        <div key={block.id} className="border-l-[3px] border-blue-500 pl-4 py-1">
          <div className="text-xs font-bold uppercase tracking-wide text-blue-700 mb-1">Definition / Key Concept</div>
          <div className={base}><FormattedMathText text={block.text}/></div>
        </div>
      );
      if(block.type==='note')return <div key={block.id} className="rounded-lg bg-amber-50/70 border border-amber-100 p-4 text-[15px] leading-7 text-slate-700"><FormattedMathText text={block.text}/></div>;
      return <p key={block.id} className={base}><FormattedMathText text={block.text}/></p>;
    })}
  </div>
);

const LearnWorkedExample:React.FC<Extract<LessonBlock,{type:'worked-example'}>> = ({title,problem,strategy,steps,check,takeaway})=>{
  const [guided,setGuided]=useState(false);
  const [stepCount,setStepCount]=useState(1);
  return (
    <section aria-label={`Worked example: ${title}`} className="border border-indigo-200 bg-white rounded-2xl overflow-hidden">
      <div className="px-4 sm:px-6 py-4 bg-indigo-50 border-b border-indigo-100 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2 font-bold text-indigo-950"><BookOpenCheck className="w-5 h-5"/><span>Worked example — {title}</span></div>
        <button type="button" onClick={()=>{setGuided(v=>!v);setStepCount(1);}} className="rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-800 hover:bg-indigo-100">
          {guided?'Show full solution':'Guided steps'}
        </button>
      </div>
      <div className="px-4 sm:px-6 py-5 space-y-4">
        <div className="text-[16px] font-semibold text-slate-900 leading-7"><FormattedMathText text={problem}/></div>
        {strategy && <p className="text-sm text-slate-600"><strong>Strategy: </strong>{strategy}</p>}
        <ol className="space-y-3">
          {steps.slice(0,guided?stepCount:undefined).map((step,i)=><li key={i} className="flex gap-3 items-start text-[15px] text-slate-700 leading-7"><span className="shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">{i+1}</span><div className="min-w-0 flex-1"><FormattedMathText text={step}/></div></li>)}
        </ol>
        {guided && stepCount < steps.length && <button type="button" onClick={()=>setStepCount(n=>Math.min(steps.length,n+1))} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Show next step <ChevronDown className="w-4 h-4 inline"/></button>}
        {(!guided||stepCount===steps.length) && <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-950"><strong><Check className="inline w-4 h-4"/> Verify: </strong><FormattedMathText text={check}/>{takeaway&&<p className="mt-1 text-slate-700"><strong>Remember: </strong>{takeaway}</p>}</div>}
      </div>
    </section>
  );
};
const LearnCheckpoint:React.FC<Extract<LessonBlock,{type:'checkpoint'}>>=({prompt,answer,explanation})=>{
  const [show,setShow]=useState(false);
  return <section className="border border-teal-200 rounded-xl bg-teal-50/40 px-4 sm:px-5 py-4 space-y-3">
    <div className="uppercase text-xs font-bold text-teal-700 tracking-wide">Try it yourself · ungraded</div>
    <p className="font-semibold text-slate-900 text-[15px] leading-7"><FormattedMathText text={prompt}/></p>
    <button type="button" aria-expanded={show} onClick={()=>setShow(s=>!s)} className="rounded-lg border border-teal-300 bg-white px-4 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-100">{show?'Hide answer':'Show answer'}</button>
    {show && <div className="text-sm text-teal-950 leading-6"><strong>Answer: </strong><FormattedMathText text={answer}/>{explanation&&<p className="mt-1 text-slate-700">{explanation}</p>}</div>}
  </section>;
};
