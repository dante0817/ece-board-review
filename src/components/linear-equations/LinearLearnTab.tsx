import { CalculatorCompatibilityNotice } from '../CalculatorCompatibilityNotice';
import { ManualLearnTracker } from '../learn-reader/ManualLearnTracker';
import { lessonCardTrackingId } from '../../domain/learn/manualLearnTracking';
import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { LINEAR_CONCEPTS } from './linearConceptsData';
import { LINEAR_QUICK_REF_FORMULAS } from './linearQuickRefFormulasData';
import { LINEAR_WORKED_EXAMPLES } from './linearWorkedExamplesData';
import { MathFormula } from '../MathFormula';
import { AlertTriangle, CheckCircle2, ArrowRight, EyeOff } from 'lucide-react';

interface LearnTabProps {
  onTrySimilar: (similarProblemId: string) => void;
  trackingId: string;
  trackingScopeLabel: string;
}

export const LinearLearnTab: React.FC<LearnTabProps> = ({ onTrySimilar,trackingId,trackingScopeLabel }) => {
  const [activeSubtab, setActiveSubtab] = useState<'concepts' | 'quick-ref' | 'worked-examples'>('concepts');
  const [selectedConceptId, setSelectedConceptId] = useState<string>(LINEAR_CONCEPTS[0].id);
  const [revealedRecallIds, setRevealedRecallIds] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const selectedConcept =
    LINEAR_CONCEPTS.find((c) => c.id === selectedConceptId) || LINEAR_CONCEPTS[0];

  const toggleRecall = (id: string) => {
    setRevealedRecallIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFormulas = LINEAR_QUICK_REF_FORMULAS.filter((f) => {
    if (filterCategory === 'all') return true;
    return f.category === filterCategory;
  });

  return (
    <div className="space-y-6">
      <CalculatorCompatibilityNotice/>
      {/* Sub-navigation pills */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubtab('concepts')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubtab === 'concepts'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            Core Theory & Casio Methods
          </button>
          <button
            type="button"
            onClick={() => setActiveSubtab('worked-examples')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubtab === 'worked-examples'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <span>Worked Examples</span>
            <span className="text-[10px] bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded font-mono">
              {LINEAR_WORKED_EXAMPLES.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubtab('quick-ref')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubtab === 'quick-ref'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <span>Active Recall Formulas</span>
            <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded font-mono">
              {LINEAR_QUICK_REF_FORMULAS.length}
            </span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: CORE CONCEPTS */}
      {activeSubtab === 'concepts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Concept List */}
          <div className="lg:col-span-4 space-y-2">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider px-1">
              Linear Equation Modules
            </div>
            {LINEAR_CONCEPTS.map((c) => {
              const isSelected = c.id === selectedConceptId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedConceptId(c.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-400 text-blue-950 shadow-xs ring-1 ring-blue-300'
                      : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 uppercase">
                      {c.badge}
                    </span>
                    {isSelected && <AppArtwork name="star" inline className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                  <div className="font-bold text-sm text-stone-900">{c.title}</div>
                  <div className="text-xs text-stone-500 mt-1 line-clamp-2">{c.subtitle}</div>
                </button>
              );
            })}
          </div>

          {/* Right: Detailed Concept Deep Dive */}
          <div className="lg:col-span-8 bg-white border border-stone-200 rounded-2xl p-6 space-y-6 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
                  {selectedConcept.badge}
                </span>
                <span className="text-xs text-stone-500">ECE Board Syllabus Topic</span>
              </div>
              <h2 className="text-xl font-bold text-stone-900 mt-1.5">{selectedConcept.title}</h2>
              <p className="text-sm text-stone-600 mt-1 leading-relaxed">{selectedConcept.summary}</p>
            </div>
            <ManualLearnTracker compact key={lessonCardTrackingId(trackingId,selectedConcept.id)} trackingId={lessonCardTrackingId(trackingId,selectedConcept.id)} scopeLabel={`${selectedConcept.title} · ${trackingScopeLabel}`}/>

            {/* Formula Card */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
              <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Fundamental Mathematical Model
              </div>
              <div className="text-center py-2 overflow-x-auto">
                <MathFormula math={selectedConcept.latexFormula} block />
              </div>
            </div>

            {/* Core Principles */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <AppArtwork name="bulb" inline className="w-3.5 h-3.5 text-amber-500" />
                <span>Essential Board Principles</span>
              </div>
              <div className="space-y-2">
                {selectedConcept.corePrinciples.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-stone-50/70 border border-stone-100 rounded-lg text-xs text-stone-700 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Casio fx-991 Calculator Technique */}
            {selectedConcept.casioMethod && (
              <div className="p-4 bg-gradient-to-r from-stone-900 to-stone-800 text-stone-100 rounded-xl space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <AppArtwork name="calculator" inline className="w-4 h-4" />
                    <span>Casio technique — general study only</span>
                  </span>
                  <span className="text-[11px] text-stone-300 font-mono">
                    {selectedConcept.casioMethod.model}
                  </span>
                </div>
                <div className="p-2.5 bg-stone-950/70 border border-stone-700 rounded-lg font-mono text-xs text-amber-300">
                  {selectedConcept.casioMethod.keystrokes}
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {selectedConcept.casioMethod.note}
                </p>
              </div>
            )}

            {/* Common Board Trap Warning */}
            <div className="p-4 bg-rose-50/90 border border-rose-200 rounded-xl space-y-1.5">
              <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Examiner Trap to Avoid</span>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">
                {selectedConcept.boardTrap}
              </p>
            </div>

            {/* Step-by-Step Mini Worked Example */}
            <div className="border-t border-stone-100 pt-5 space-y-3">
              <div className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <AppArtwork name="book" inline className="w-4 h-4 text-blue-600" />
                <span>Illustrative Step-by-Step Example</span>
              </div>
              <p className="text-xs text-stone-800 font-medium">
                {selectedConcept.exampleProblem.statement}
              </p>
              <div className="space-y-2">
                {selectedConcept.exampleProblem.steps.map((st, i) => (
                  <div key={i} className="text-xs p-2.5 bg-stone-50 border border-stone-100 rounded-lg">
                    <div className="text-stone-700">{st.text}</div>
                    {st.latex && (
                      <div className="mt-1 text-center font-mono">
                        <MathFormula math={st.latex} inline />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-900 flex items-center justify-between">
                <span>Final Solution:</span>
                <span className="font-mono">{selectedConcept.exampleProblem.answer}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: WORKED EXAMPLES */}
      {activeSubtab === 'worked-examples' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900">
              PRC Board-Standard Worked Solutions with Instant Practice
            </h3>
            <span className="text-xs text-stone-500">
              Click 'Try Similar Problem' to verify retention
            </span>
          </div>

          <div className="space-y-6">
            {LINEAR_WORKED_EXAMPLES.map((ex) => (
              <div
                key={ex.id}
                className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {ex.category}
                      </span>
                      <span className="text-[11px] text-stone-500 font-medium">
                        {ex.boardExamTag}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-stone-900 mt-1">{ex.title}</h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => onTrySimilar(ex.similarProblemId)}
                    className="self-start sm:self-center px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <AppArtwork name="star" inline className="w-3.5 h-3.5 text-blue-200" />
                    <span>Try Similar Problem</span>
                  </button>
                </div>

                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                  <div className="text-xs font-semibold text-stone-600">{ex.problemText}</div>
                  <div className="text-center py-2 overflow-x-auto font-mono">
                    <MathFormula math={ex.problemLatex} block />
                  </div>
                </div>

                {/* Step-by-Step Derivations */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Full Algebraic Derivation:
                  </div>
                  {ex.steps.map((st) => (
                    <div
                      key={st.stepNumber}
                      className="p-3 bg-stone-50/80 border border-stone-100 rounded-xl space-y-1.5 text-xs"
                    >
                      <div className="font-bold text-stone-900">
                        Step {st.stepNumber}: {st.stepTitle}
                      </div>
                      <p className="text-stone-600 leading-relaxed">{st.explanation}</p>
                      {st.latexEquation && (
                        <div className="p-2 bg-white rounded border border-stone-200 overflow-x-auto text-center font-mono">
                          <MathFormula math={st.latexEquation} inline />
                        </div>
                      )}
                      {st.proTip && (
                        <div className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 flex items-center gap-1.5">
                          <AppArtwork name="bulb" inline className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>{st.proTip}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Final Answer Banner */}
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-emerald-950 uppercase tracking-wider block">
                      Target Answer:
                    </span>
                    <span className="font-mono text-emerald-900 font-bold text-sm">
                      {ex.finalAnswerText}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onTrySimilar(ex.similarProblemId)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <span>Practice Similar Drill</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Casio Hack Pill */}
                {ex.casioHack && (
                  <div className="p-3 bg-stone-900 text-stone-100 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400 flex items-center gap-1">
                        <AppArtwork name="calculator" inline className="w-3.5 h-3.5" />
                        <span>Casio Shortcut ({ex.casioHack.model}):</span>
                      </span>
                      <span className="font-mono text-[11px] text-emerald-400">
                        {ex.casioHack.display}
                      </span>
                    </div>
                    <p className="text-stone-300 text-[11px] font-mono">{ex.casioHack.keystrokes}</p>
                    <p className="text-stone-400 text-[11px]">{ex.casioHack.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: QUICK REF / ACTIVE RECALL FORMULAS */}
      {activeSubtab === 'quick-ref' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-stone-500 font-semibold mr-1">Filter by:</span>
            {[
              { id: 'all', label: 'All Formulas' },
              { id: 'equations', label: 'Single Variable' },
              { id: 'systems', label: 'Systems & Determinants' },
              { id: 'motion', label: 'Motion & Pursuit' },
              { id: 'work-mixture', label: 'Work & Mixture' },
              { id: 'casio-hacks', label: 'Casio Hacks' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilterCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  filterCategory === cat.id
                    ? 'bg-stone-900 text-amber-400'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFormulas.map((f) => {
              const isRevealed = revealedRecallIds.includes(f.id);
              return (
                <div
                  key={f.id}
                  className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${f.badgeColor}`}>
                        {f.categoryLabel}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-stone-400">
                        Rule #{f.ruleNumber}
                      </span>
                    </div>

                    <h4 className="font-bold text-stone-900 text-sm">{f.title}</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">{f.description}</p>

                    {/* Active Retrieval / Masked Formula Box */}
                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-stone-500 uppercase tracking-wider">
                          Active Recall Card
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleRecall(f.id)}
                          className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                        >
                          {isRevealed ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Hide Formula</span>
                            </>
                          ) : (
                            <>
                              <AppArtwork name="eye" inline className="w-3.5 h-3.5" />
                              <span>Reveal Formula</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="text-center py-1 font-mono text-sm overflow-x-auto">
                        {isRevealed ? (
                          <MathFormula math={f.formulaLatex} block />
                        ) : (
                          <div className="text-stone-500 italic text-xs py-2 bg-stone-100 rounded">
                            {f.recallPrompt}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Memory Cue & Trap */}
                    <div className="text-[11px] space-y-1 text-stone-600 pt-1">
                      <div>
                        <strong className="text-stone-900">Mnemonic Cue:</strong> {f.memoryCue}
                      </div>
                      <div className="text-rose-700">
                        <strong>Examiner Trap:</strong> {f.examinerTrap}
                      </div>
                    </div>
                  </div>

                  {f.casioTip && (
                    <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5 text-[11px] font-mono text-stone-600">
                      <AppArtwork name="calculator" inline className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{f.casioTip}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
