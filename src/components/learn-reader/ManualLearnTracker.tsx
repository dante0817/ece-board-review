import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { changeManualLearnRecord, correctManualReviewCount, getManualLearnRecord, isManualTrackingId, markManualReviewed, setManualReadMilestone, setManualLearnStatus, setManualNeedsReview, type ManualLearnRecord, type ManualLearnStatus } from '../../domain/learn/manualLearnTracking';
import { useManualLearnTracking } from '../../hooks/useManualLearnTracking';

const STATUS_LABEL:Record<ManualLearnStatus,string>={unrated:'Not Rated',studying:'Studying',understood:'Understood',mastered:'Mastered (Self)'};
interface Props { trackingId:string; scopeLabel:string; compact?:boolean; }
export const ManualLearnTracker:React.FC<Props>=({trackingId,scopeLabel,compact=false})=>{
  const store=useManualLearnTracking();
  const record=getManualLearnRecord(store,trackingId);
  const [expanded,setExpanded]=useState(false);
  const [warning,setWarning]=useState(false);
  const [undo,setUndo]=useState<{before:ManualLearnRecord;after:ManualLearnRecord}|null>(null);
  const [exactCount,setExactCount]=useState<string>('');
  if(!isManualTrackingId(trackingId))return null;
  const commit=(run:()=>boolean)=>{const ok=run();setWarning(!ok);return ok;};
  const mark=()=>{
    const before=getManualLearnRecord(store,trackingId);
    if(before.reviewCount===999)return;
    const stamped=new Date().toISOString();
    if(commit(()=>markManualReviewed(trackingId,stamped))){
      setUndo({before,after:{...before,reviewCount:before.reviewCount+1,lastReviewedAt:stamped,updatedAt:stamped}});
    }
  };
  const undoMark=()=>{
    if(!undo)return;
    // Undo must not discard another change from this or another open tab.
    const current=getManualLearnRecord(store,trackingId);
    if(current.reviewCount!==undo.after.reviewCount||current.lastReviewedAt!==undo.after.lastReviewedAt){setUndo(null);return;}
    if(commit(()=>changeManualLearnRecord(trackingId,prev=>({...prev,reviewCount:undo.before.reviewCount,lastReviewedAt:undo.before.lastReviewedAt}))))setUndo(null);
  };
  const edit=(run:()=>boolean)=>{setUndo(null);commit(run);};
  const setMilestone=(level:1|2|3,checked:boolean)=>{
    edit(()=>setManualReadMilestone(trackingId,level,checked));
  };
  const milestoneLabels=[1,2,3] as const;
  return <section aria-label={`My manual study tracker: ${scopeLabel}`} className={`rounded-xl border border-indigo-200/70 bg-indigo-50/60 ${compact?'p-3':'p-3 sm:p-4'} space-y-3`}>
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="min-w-0"><div className="text-[11px] font-bold uppercase tracking-wide text-indigo-800">My Learn Status</div><div className="text-xs text-slate-600" title={scopeLabel}>{scopeLabel}</div></div>
      <span className="text-[11px] text-slate-600">Manual · not quiz mastery</span>
    </div>
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Manual reading milestones">
      {milestoneLabels.map(level=><label key={level} className={`inline-flex items-center gap-2 cursor-pointer rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${record.reviewCount>=level?'bg-indigo-100 border-indigo-300 text-indigo-900':'bg-white border-slate-200 text-slate-700'}`}>
        <input aria-label={`Read ${level} time${level>1?'s':''}`} type="checkbox" checked={record.reviewCount>=level} onChange={event=>setMilestone(level,event.target.checked)} className="h-4 w-4 accent-indigo-700"/>
        Read {level}×
      </label>)}
      <label className={`inline-flex items-center gap-2 cursor-pointer rounded-lg border px-3 py-2 text-xs font-semibold ${record.selfStatus==='mastered'?'bg-emerald-100 border-emerald-300 text-emerald-900':'bg-white border-slate-200 text-slate-700'}`}>
        <input aria-label="Mastered (Self)" type="checkbox" checked={record.selfStatus==='mastered'} onChange={event=>edit(()=>setManualLearnStatus(trackingId,event.target.checked?'mastered':'unrated'))} className="h-4 w-4 accent-emerald-700"/>
        Mastered (Self)
      </label>
      <label className={`inline-flex items-center gap-2 cursor-pointer rounded-lg border px-3 py-2 text-xs font-semibold ${record.needsReview?'bg-amber-100 border-amber-300 text-amber-900':'bg-white border-slate-200 text-slate-700'}`}>
        <input aria-label="Needs Review (manual)" type="checkbox" checked={record.needsReview} onChange={event=>edit(()=>setManualNeedsReview(trackingId,event.target.checked))} className="h-4 w-4 accent-amber-600"/>
        Needs Review
      </label>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-[11px] text-slate-600">{record.reviewCount} study pass{record.reviewCount===1?'':'es'} recorded. Checking Read 3× also checks Read 1× and 2×.</p>
      <div className="flex items-center gap-2 flex-wrap">
        <button type="button" onClick={mark} disabled={record.reviewCount>=999} className="rounded-lg bg-indigo-700 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-800 disabled:opacity-50"><Check className="inline w-3.5 h-3.5 mr-1"/>Mark Reviewed +1</button>
        {undo&&<button type="button" onClick={undoMark} className="rounded-lg px-2 py-2 text-xs font-semibold text-indigo-700"><RotateCcw className="inline w-3.5 h-3.5 mr-1"/>Undo</button>}
        <button type="button" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded} className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-800">More options {expanded?<ChevronUp className="inline w-3.5 h-3.5"/>:<ChevronDown className="inline w-3.5 h-3.5"/>}</button>
      </div>
    </div>
    {expanded&&<div className="rounded-lg bg-white border border-indigo-100 p-3 space-y-3">
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-700">My understanding (self-assessed)
        <select value={record.selfStatus} onChange={event=>edit(()=>setManualLearnStatus(trackingId,event.target.value as ManualLearnStatus))} className="w-full rounded-lg border border-slate-300 p-2 bg-white text-sm">
          <option value="unrated">Not Rated</option><option value="studying">Studying</option><option value="understood">Understood</option><option value="mastered">Mastered (Self)</option>
        </select>
      </label>
      <form className="flex items-end flex-wrap gap-2" onSubmit={event=>{event.preventDefault();const count=Number(exactCount);if(exactCount.trim()!==''&&Number.isInteger(count)&&count>=0&&count<=999){edit(()=>correctManualReviewCount(trackingId,count));setExactCount('');}}}>
        <label className="flex-1 min-w-[120px] text-xs font-medium text-slate-700">Set exact review count (0–999)
          <input aria-label="Correct total reviews" type="number" min={0} max={999} step={1} inputMode="numeric" placeholder={String(record.reviewCount)} value={exactCount} onChange={event=>setExactCount(event.target.value)} className="w-full rounded-lg border border-slate-300 p-2 mt-1 text-sm"/>
        </label>
        <button type="submit" disabled={exactCount.trim()==='' || !/^\d{1,3}$/.test(exactCount)||Number(exactCount)>999} className="rounded-lg border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-800 disabled:opacity-40">Set count</button>
      </form>
      <p className="text-[11px] text-slate-500">Changing reading checkboxes or correcting a count does not create a new review date. Only Mark Reviewed +1 dates an actual study pass.</p>
      {record.lastReviewedAt&&<p className="text-[11px] text-slate-500">Last manually marked reviewed: {new Date(record.lastReviewedAt).toLocaleDateString()}</p>}
    </div>}
    {warning&&<p role="alert" className="text-xs text-amber-800">Unable to save manual study status in browser storage. Your previous saved record was kept.</p>}
  </section>;
};
