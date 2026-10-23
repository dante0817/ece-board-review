import { AppArtwork } from '../common/AppArtwork';
import React from 'react';
import { CheckCircle2, ExternalLink, ShieldAlert } from 'lucide-react';
import { AlgebraReferenceTopicContent } from '../../data/algebraReferenceContent';
import { MathFormula } from '../MathFormula';

interface Props {
  content: AlgebraReferenceTopicContent;
  compact?: boolean;
}

export const ReferenceStudyBlueprint: React.FC<Props> = ({ content, compact = false }) => {
  return (
    <div className="space-y-4">
      <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-blue-700 text-xs font-black uppercase tracking-wide">
              <AppArtwork name="target" inline className="w-4 h-4" />
              <span>Learning objectives</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">Reference-informed objectives rewritten for concise ECE review.</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-bold">
            {content.boardPriority} priority
          </span>
        </div>
        <div className={`mt-4 grid ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-2.5`}>
          {content.objectives.map((objective) => (
            <div key={objective.id} className="flex items-start gap-2.5 rounded-xl bg-slate-50 border border-slate-100 p-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700 leading-relaxed">{objective.text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 text-slate-900 font-black">
          <AppArtwork name="book" inline className="w-5 h-5 text-indigo-600" />
          <h2>Prerequisite warm-up</h2>
        </div>
        <p className="text-sm text-slate-500 mt-1">Quick checks based on prerequisite skills used by this topic.</p>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
          {content.prerequisites.map((item) => (
            <details key={item.id} className="group rounded-xl border border-slate-200 bg-slate-50 p-3">
              <summary className="cursor-pointer list-none text-sm font-bold text-slate-800 flex items-center justify-between gap-2">
                <span>{item.label}</span>
                <span className="text-[11px] text-blue-600 group-open:hidden">Check</span>
              </summary>
              <p className="text-sm text-slate-700 mt-2">{item.checkPrompt}</p>
              <div className="mt-2 rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm text-emerald-700 font-semibold">
                Answer: {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 text-slate-900 font-black">
          <AppArtwork name="bulb" inline className="w-5 h-5 text-amber-500" />
          <h2>Rules & quick reference</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
          {content.rules.map((rule) => (
            <div key={rule.title} className="rounded-xl border border-slate-200 p-4 bg-slate-50/70">
              <h3 className="text-sm font-black text-slate-900">{rule.title}</h3>
              {rule.formula && (
                <div className="mt-2 rounded-lg bg-white border border-slate-200 px-3 py-2 overflow-x-auto">
                  <MathFormula formula={rule.formula} />
                </div>
              )}
              <p className="text-sm text-slate-700 mt-2 leading-relaxed">{rule.meaning}</p>
              {rule.condition && <p className="text-xs text-blue-700 mt-2"><strong>Condition:</strong> {rule.condition}</p>}
              {rule.commonError && <p className="text-xs text-rose-700 mt-1"><strong>Common error:</strong> {rule.commonError}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 text-rose-900 font-black">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <h2>Common traps to diagnose</h2>
        </div>
        <p className="text-sm text-rose-800/75 mt-1">These tags can be used by the Error Log for targeted remediation.</p>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
          {content.misconceptions.map((trap) => (
            <div key={trap.id} className="rounded-xl bg-white border border-rose-100 p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-black text-slate-900">{trap.label}</h3>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-full px-2 py-0.5">{trap.id}</span>
              </div>
              <p className="text-xs text-slate-600 mt-2"><strong>Symptom:</strong> {trap.symptom}</p>
              <p className="text-xs text-emerald-800 mt-1"><strong>Correction:</strong> {trap.correction}</p>
              <p className="text-xs text-blue-800 mt-1"><strong>Quick check:</strong> {trap.quickCheck}</p>
            </div>
          ))}
        </div>
      </section>

      <details className="bg-white border border-slate-200 rounded-2xl shadow-xs">
        <summary className="cursor-pointer list-none px-4 sm:px-5 py-4 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm font-black text-slate-800">
            <ExternalLink className="w-4 h-4 text-slate-500" />
            Reference map
          </span>
          <span className="text-xs text-slate-500">{content.sources.length} sources</span>
        </summary>
        <div className="border-t border-slate-100 p-4 sm:p-5 space-y-3">
          <p className="text-xs text-slate-500 leading-relaxed">
            These references guide scope, pedagogy, and practice taxonomy. Student-facing explanations and questions in the app are original reviewer content rather than textbook reproductions.
          </p>
          {content.sources.map((source) => (
            <div key={`${source.book}-${source.section}`} className="rounded-xl bg-slate-50 border border-slate-100 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-bold text-slate-900">{source.book}</div>
                <span className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                  source.verificationStatus === 'verified-section-pages'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-amber-200 bg-amber-50 text-amber-700'
                }`}>
                  <CheckCircle2 className="w-3 h-3" />
                  {source.verificationStatus === 'verified-section-pages' ? 'Section/pages verified' : 'Provisional locator'}
                </span>
              </div>
              <div className="text-xs text-blue-700 font-semibold mt-0.5">{source.role} · {source.section} · {source.locator}</div>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{source.use}</p>
              {source.verificationNote && <p className="text-[11px] text-slate-500 mt-1">{source.verificationNote}</p>}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};
