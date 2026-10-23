import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { MathFormula } from '../MathFormula';
import {
  POLYNOMIAL_ANATOMY_EXAMPLES,
  NON_POLYNOMIAL_TRAPS,
  LIKE_TERMS_CHALLENGES,
  TermAnatomyItem,
  PolynomialAnatomyExample,
} from '../../data/algebraicTermsData';
import { Info, CheckCircle2, AlertTriangle, Hash } from 'lucide-react';

export const AnatomyTab: React.FC = () => {
  // Active example selection
  const [selectedExampleIndex, setSelectedExampleIndex] = useState<number>(0);
  const currentExample: PolynomialAnatomyExample = POLYNOMIAL_ANATOMY_EXAMPLES[selectedExampleIndex];

  // Selected term within the current example
  const [selectedTermId, setSelectedTermId] = useState<string>(currentExample.terms[0]?.id || '');
  const activeTerm: TermAnatomyItem | undefined = currentExample.terms.find(
    (t) => t.id === selectedTermId
  ) || currentExample.terms[0];

  // Like terms challenge state
  const [activeLikeChallengeIdx, setActiveLikeChallengeIdx] = useState<number>(0);
  const [showLikeSteps, setShowLikeSteps] = useState<boolean>(false);
  const currentLikeChallenge = LIKE_TERMS_CHALLENGES[activeLikeChallengeIdx];

  // Custom Term Degree Tester state
  const [customVar1Power, setCustomVar1Power] = useState<number>(3);
  const [customVar2Power, setCustomVar2Power] = useState<number>(2);
  const [customVar3Power, setCustomVar3Power] = useState<number>(1);
  const customTotalDegree = customVar1Power + customVar2Power + customVar3Power;

  return (
    <div className="space-y-6">
      {/* 1. Core Anatomy Inspector Header & Concept Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
                Anatomy &amp; Structure
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                PRC ECE Board Core Standard
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Interactive Term &amp; Polynomial Anatomy Inspector
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Select an expression below. Click on individual terms to inspect coefficients, literal parts, and multivariable degree rules.
            </p>
          </div>

          {/* Example Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {POLYNOMIAL_ANATOMY_EXAMPLES.map((ex, idx) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => {
                  setSelectedExampleIndex(idx);
                  setSelectedTermId(POLYNOMIAL_ANATOMY_EXAMPLES[idx].terms[0]?.id || '');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedExampleIndex === idx
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {ex.title.split(' ')[0]} {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Expression Display Box */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-inner relative overflow-hidden">
          <div className="absolute top-3 right-4 text-xs font-mono text-slate-400">
            Click any term below to inspect
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">
            {currentExample.title}
          </div>

          {/* Interactive Term Tokens */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 py-3">
            {currentExample.terms.map((term) => {
              const isSelected = term.id === (activeTerm?.id || '');
              return (
                <button
                  key={term.id}
                  type="button"
                  onClick={() => setSelectedTermId(term.id)}
                  className={`px-3 sm:px-4 py-2 rounded-xl font-mono text-base sm:text-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-blue-500 text-white ring-4 ring-blue-400/40 shadow-lg scale-105'
                      : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700/80 border border-slate-700'
                  }`}
                >
                  <MathFormula formula={term.rawLatex} inline />
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-slate-300 mt-2 font-medium">
            {currentExample.description}
          </p>
        </div>

        {/* Term Anatomy Deep-Dive Card */}
        {activeTerm && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: Coefficient & Variables */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800">
                <Hash className="w-4 h-4 text-blue-600" />
                <span>Coefficients &amp; Factors</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Active Term:</span>
                  <span className="font-mono font-bold text-slate-900">
                    <MathFormula formula={activeTerm.rawLatex} inline />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Numerical Coefficient:</span>
                  <span className="font-mono font-bold text-blue-700">
                    {String(activeTerm.numericalCoefficient)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Sign:</span>
                  <span className="font-bold text-slate-900">
                    {activeTerm.sign === '+' ? 'Positive (+)' : 'Negative (-)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Literal Factor:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {activeTerm.literalFactors}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: Degree Calculation */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                <AppArtwork name="calculator" inline className="w-4 h-4 text-amber-600" />
                <span>Term Degree Rule</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Term Degree:</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 font-mono font-extrabold text-sm">
                    {activeTerm.termDegree}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 leading-relaxed bg-white/80 p-2 rounded-lg border border-amber-100">
                  {activeTerm.variables.length > 0 ? (
                    <>
                      Sum of exponents:{' '}
                      <span className="font-mono font-bold text-amber-800">
                        {activeTerm.variables.map((v) => `${v.name}^${v.power}`).join(' · ')}
                        {' → '}
                        {activeTerm.variables.map((v) => v.power).join(' + ')} = {activeTerm.termDegree}
                      </span>
                    </>
                  ) : (
                    <span className="italic text-slate-500">
                      Constant term has 0 variables. Degree is strictly 0.
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-amber-800 font-medium">
                  {activeTerm.termDescription}
                </p>
              </div>
            </div>

            {/* Column 3: Polynomial Classification */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900">
                <AppArtwork name="book" inline className="w-4 h-4 text-emerald-600" />
                <span>Polynomial Metadata</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Type:</span>
                  <span className="font-bold text-emerald-800">{currentExample.classification}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Degree of Polynomial:</span>
                  <span className="font-mono font-bold text-emerald-800">{currentExample.degree}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Leading Term:</span>
                  <span className="font-mono font-bold text-slate-900">
                    <MathFormula formula={currentExample.leadingTerm} inline />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Constant Term:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {currentExample.constantTerm}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900">PRC Board Rule:</span> {currentExample.notes}
          </div>
        </div>
      </div>

      {/* 2. Interactive Like vs. Unlike Terms Combiner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 uppercase tracking-wider">
              Combining Rules
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
              Like Terms vs. Unlike Terms &amp; The Distributive Law
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Terms can ONLY be combined if they have the <strong>exact same variable literal factors</strong> raised to the <strong>exact same powers</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveLikeChallengeIdx((prev) => (prev === 0 ? 1 : 0));
                setShowLikeSteps(false);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
            >
              Switch Example ({activeLikeChallengeIdx + 1}/2)
            </button>
          </div>
        </div>

        {/* Expression Breakdown */}
        <div className="bg-indigo-950 text-white rounded-2xl p-5 shadow-inner space-y-3">
          <div className="text-xs text-indigo-300 font-bold uppercase tracking-wider">
            Unsimplified Expression:
          </div>
          <div className="font-mono text-base sm:text-lg font-bold text-indigo-100 bg-indigo-900/60 p-3.5 rounded-xl border border-indigo-800/80">
            <MathFormula formula={currentLikeChallenge.rawExpression} inline />
          </div>

          {/* Color-coded terms list */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {currentLikeChallenge.terms.map((t) => {
              const colorMap: Record<string, string> = {
                x2y: 'bg-blue-600 text-white border-blue-400',
                xy2: 'bg-purple-600 text-white border-purple-400',
                xy: 'bg-emerald-600 text-white border-emerald-400',
                a: 'bg-amber-600 text-white border-amber-400',
                b: 'bg-rose-600 text-white border-rose-400',
              };
              const cls = colorMap[t.groupKey] || 'bg-slate-700 text-white';

              return (
                <span
                  key={t.id}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border shadow-xs ${cls}`}
                >
                  <MathFormula formula={t.latex} inline />
                </span>
              );
            })}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-indigo-900">
            <div className="text-xs text-indigo-200">
              Final Simplified Result:{' '}
              <span className="font-mono font-bold text-white text-sm bg-indigo-900 px-2 py-1 rounded-md border border-indigo-700 ml-1">
                <MathFormula formula={currentLikeChallenge.groupedResultLatex} inline />
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowLikeSteps(!showLikeSteps)}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
            >
              {showLikeSteps ? 'Hide Step-by-Step Factoring' : 'Reveal Step-by-Step Factoring'}
            </button>
          </div>

          {showLikeSteps && (
            <div className="mt-3 bg-indigo-900/90 rounded-xl p-4 border border-indigo-700/80 space-y-2 text-xs text-indigo-100 animate-fadeIn">
              <div className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                Distributive Factoring Derivation:
              </div>
              {currentLikeChallenge.stepByStepDerivation.map((st, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{st}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Non-Polynomial Counterexamples (Crucial PRC Distractors) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <h3 className="text-lg font-extrabold text-slate-900">
            Critical Board Distractors: Why Are These NOT Polynomials?
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mb-4">
          Exam questionnaires routinely test whether students can distinguish true polynomial terms from general algebraic expressions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {NON_POLYNOMIAL_TRAPS.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-200 text-rose-800 uppercase tracking-wide">
                  {item.distractorType}
                </span>
                <span className="text-xs font-bold text-rose-600 font-mono">Illegal</span>
              </div>
              <div className="font-mono text-base font-bold text-slate-900 py-1">
                <MathFormula formula={item.latex} inline />
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                {item.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Interactive Term Degree Sandbox Tester */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <AppArtwork name="calculator" inline className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-extrabold text-slate-900">
            Multivariable Term Degree Simulator
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mb-4">
          Test any term with variables <span className="font-mono font-bold">x</span>,{' '}
          <span className="font-mono font-bold">y</span>, and <span className="font-mono font-bold">z</span> to verify how degrees compound under PRC ECE Board rules:
        </p>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Variable X Power */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Power of x:</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={customVar1Power}
                  onChange={(e) => setCustomVar1Power(Number(e.target.value))}
                  className="w-24 accent-blue-600 cursor-pointer"
                />
                <span className="font-mono font-bold text-sm text-blue-600 w-5">
                  {customVar1Power}
                </span>
              </div>
            </div>

            {/* Variable Y Power */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Power of y:</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={customVar2Power}
                  onChange={(e) => setCustomVar2Power(Number(e.target.value))}
                  className="w-24 accent-blue-600 cursor-pointer"
                />
                <span className="font-mono font-bold text-sm text-blue-600 w-5">
                  {customVar2Power}
                </span>
              </div>
            </div>

            {/* Variable Z Power */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Power of z:</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={customVar3Power}
                  onChange={(e) => setCustomVar3Power(Number(e.target.value))}
                  className="w-24 accent-blue-600 cursor-pointer"
                />
                <span className="font-mono font-bold text-sm text-blue-600 w-5">
                  {customVar3Power}
                </span>
              </div>
            </div>
          </div>

          {/* Computed Term Display */}
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-xs flex items-center gap-4 shrink-0">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Simulated Term:
              </div>
              <div className="font-mono text-lg font-bold text-slate-900">
                <MathFormula
                  formula={`-9 x^{${customVar1Power}} y^{${customVar2Power}} z^{${customVar3Power}}`}
                  inline
                />
              </div>
            </div>
            <div className="border-l border-slate-200 pl-4 text-center">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Term Degree:
              </div>
              <div className="text-2xl font-black text-emerald-600 font-mono">
                {customTotalDegree}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {customVar1Power} + {customVar2Power} + {customVar3Power}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
