import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, AlertOctagon } from 'lucide-react';
import { MathFormula } from '../MathFormula';

export const CoreConceptSections: React.FC = () => {
  // Collapsible state for the 4 core sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'domain-restrictions': true, // open by default
    'factoring-techniques': false,
    'simplification-rules': false,
    'solving-equations': false,
  });

  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    setExpandedSections({
      'domain-restrictions': true,
      'factoring-techniques': true,
      'simplification-rules': true,
      'solving-equations': true,
    });
  };

  const collapseAll = () => {
    setExpandedSections({
      'domain-restrictions': false,
      'factoring-techniques': false,
      'simplification-rules': false,
      'solving-equations': false,
    });
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormula(id);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Section Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 p-4 rounded-2xl border border-blue-200/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs app-artwork-tile">
            <AppArtwork name="book" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <span>Core Concept Deep Dives</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                Syllabus Pillars
              </span>
            </h4>
            <p className="text-xs text-slate-600">
              Interactive algebraic foundations: domain constraints, polynomial factoring, simplification theorems, and rational equation solving.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={expandAll}
            className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            Expand All 4
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBSECTION 1: DOMAIN RESTRICTIONS */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('domain-restrictions')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 font-black text-xs flex items-center justify-center shrink-0 border border-rose-200">
              01
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900">
                  Domain Restrictions, Poles &amp; Removable Singularities
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  Must-Know Board Rule
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Division by zero axiom, unsimplified factorization requirement, and distinguishing vertical asymptotes from holes.
              </p>
            </div>
          </div>
          <div className="p-1 text-slate-400">
            {expandedSections['domain-restrictions'] ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </button>

        {expandedSections['domain-restrictions'] && (
          <div className="p-5 sm:p-6 border-t border-slate-100 space-y-5 text-slate-800 text-xs">
            {/* Theoretical Axiom Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <span>The Zero-Denominator Axiom</span>
              </div>
              <p className="leading-relaxed text-slate-600">
                A rational expression is a quotient of two polynomials <MathFormula formula="R(x) = \frac{P(x)}{Q(x)}" /> where <MathFormula formula="P(x)" /> and <MathFormula formula="Q(x)" /> are polynomials and <MathFormula formula="Q(x) \neq 0" />. In the real number system <MathFormula formula="\mathbb{R}" />, division by zero is strictly undefined:
              </p>
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-center shadow-2xs">
                <MathFormula
                  formula="\text{Domain of } R(x) = \left\{ x \in \mathbb{R} \;\middle|\; Q(x) \neq 0 \right\} = \mathbb{R} \setminus \{x \mid Q(x) = 0\}"
                  block
                />
              </div>
            </div>

            {/* Vertical Asymptotes vs Holes Detailed Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
                <div className="font-extrabold text-blue-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>Case A: Removable Singularity (Hole)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Occurs at <MathFormula formula="x = c" /> when the linear factor <MathFormula formula="(x - c)" /> divides out of both the numerator and denominator:
                </p>
                <div className="p-2.5 bg-white rounded-lg border border-blue-200 text-center font-mono">
                  <MathFormula
                    formula="R(x) = \frac{(x - c) \cdot P_1(x)}{(x - c) \cdot Q_1(x)} = \frac{P_1(x)}{Q_1(x)} \quad \text{for } x \neq c"
                    block
                  />
                </div>
                <p className="text-[11px] text-blue-950 font-medium">
                  The graph has a hollow point at <MathFormula formula="\left(c, \frac{P_1(c)}{Q_1(c)}\right)" />. However, <MathFormula formula="x = c" /> remains strictly <strong>excluded from the domain</strong> of the original function!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-2">
                <div className="font-extrabold text-purple-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  <span>Case B: Non-Removable Singularity (Pole / Asymptote)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Occurs at <MathFormula formula="x = c" /> when the factor <MathFormula formula="(x - c)" /> remains in the denominator after complete simplification:
                </p>
                <div className="p-2.5 bg-white rounded-lg border border-purple-200 text-center font-mono">
                  <MathFormula
                    formula="\lim_{x \to c^+} |R(x)| = \infty \implies \text{Vertical Line } x = c"
                    block
                  />
                </div>
                <p className="text-[11px] text-purple-950 font-medium">
                  In ECE circuit transfer functions <MathFormula formula="H(s)" />, non-removable poles dictate system stability and resonant frequencies.
                </p>
              </div>
            </div>

            {/* Step-by-Step Worked Problem */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="font-black text-slate-900 flex items-center justify-between">
                <span>Worked Example: Comprehensive Domain Determination</span>
                <span className="text-[11px] font-mono text-slate-500">PRC Exam Format</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                <span className="text-xs text-slate-500 mr-2 font-sans">Determine the complete domain of:</span>
                <MathFormula formula="f(x) = \frac{x^2 - 9}{x^3 - 4x^2 - 21x}" block />
              </div>

              <div className="space-y-2 border-l-2 border-rose-400 pl-3">
                <div>
                  <strong className="text-slate-900">Step 1 — Factor Denominator Completely:</strong>
                  <div className="mt-1 p-2 bg-white rounded border border-slate-200 text-center">
                    <MathFormula formula="x^3 - 4x^2 - 21x = x(x^2 - 4x - 21) = x(x - 7)(x + 3)" block />
                  </div>
                </div>
                <div>
                  <strong className="text-slate-900">Step 2 — Set Denominator Factors to Zero (Before Cancelling!):</strong>
                  <div className="mt-1 p-2 bg-white rounded border border-slate-200 text-center">
                    <MathFormula formula="x = 0, \quad x - 7 = 0 \implies x = 7, \quad x + 3 = 0 \implies x = -3" block />
                  </div>
                </div>
                <div>
                  <strong className="text-slate-900">Step 3 — Inspect Numerator for Removable Discontinuities:</strong>
                  <p className="text-slate-600 mt-0.5">
                    Numerator is <MathFormula formula="x^2 - 9 = (x - 3)(x + 3)" />. The factor <MathFormula formula="(x + 3)" /> cancels:
                  </p>
                  <div className="mt-1 p-2 bg-white rounded border border-emerald-200 text-center">
                    <MathFormula formula="f(x) = \frac{(x - 3)\cancel{(x + 3)}}{x(x - 7)\cancel{(x + 3)}} = \frac{x - 3}{x(x - 7)} \quad (x \neq -3)" block />
                  </div>
                  <p className="text-slate-700 mt-1">
                    At <MathFormula formula="x = -3" />, there is a hole at <MathFormula formula="\left(-3, \frac{-6}{(-3)(-10)}\right) = \left(-3, -\frac{1}{5}\right)" />. At <MathFormula formula="x = 0" /> and <MathFormula formula="x = 7" />, there are vertical asymptotes.
                  </p>
                </div>
                <div>
                  <strong className="text-slate-900">Final Answer:</strong>
                  <div className="mt-1 p-2 bg-emerald-50 rounded border border-emerald-300 font-bold text-emerald-900 text-center">
                    <MathFormula formula="\text{Domain} = \{x \in \mathbb{R} \mid x \neq 0, \; x \neq 7, \; x \neq -3\} = (-\infty, -3) \cup (-3, 0) \cup (0, 7) \cup (7, \infty)" block />
                  </div>
                </div>
              </div>
            </div>

            {/* Traps Callout */}
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-rose-900 text-xs">
                  PRC Examiner Trick: Division Three-Way Excluded Value Rule
                </div>
                <p className="text-rose-800 text-[11px] leading-relaxed">
                  When simplifying a rational division <MathFormula formula="\frac{A}{B} \div \frac{C}{D} = \frac{A}{B} \cdot \frac{D}{C} = \frac{AD}{BC}" />, the excluded values are all zeros of <MathFormula formula="B(x)" />, <MathFormula formula="D(x)" />, <strong>AND <MathFormula formula="C(x)" /></strong>. Because <MathFormula formula="C(x)" /> was originally in a denominator position after the operation, setting <MathFormula formula="C(x) = 0" /> would also make the operation undefined.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SUBSECTION 2: FACTORING TECHNIQUES */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('factoring-techniques')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0 border border-indigo-200">
              02
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900">
                  Factoring Techniques &amp; Special Polynomial Identities
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Essential Toolkit
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                GCF, difference of squares, SOAP sum/difference of cubes, trinomial grouping, and sign-reversal factoring.
              </p>
            </div>
          </div>
          <div className="p-1 text-slate-400">
            {expandedSections['factoring-techniques'] ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </button>

        {expandedSections['factoring-techniques'] && (
          <div className="p-5 sm:p-6 border-t border-slate-100 space-y-5 text-slate-800 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Every rational expression simplification, addition, and equation requires factoring as its first step. Below is the systematic factoring hierarchy tested on PRC engineering board exams:
            </p>

            {/* 4 Essential Factoring Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Identity 1: GCF and Sign Inversion */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="font-extrabold text-slate-900 flex items-center justify-between">
                  <span>1. GCF &amp; Sign Inversion Identity</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-200/80 rounded text-slate-700">Priority #1</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center font-mono">
                  <MathFormula formula="b - a = -(a - b) \iff \frac{b - a}{a - b} = -1" block />
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Factoring out <MathFormula formula="-1" /> reverses the terms across a subtraction symbol. Always check for a Greatest Common Factor (GCF) before applying any formula!
                </p>
                <div className="p-2 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-900">
                  <strong>Example:</strong> <MathFormula formula="6 - 2x = -2(x - 3)" />.
                </div>
              </div>

              {/* Identity 2: Difference of Squares */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="font-extrabold text-slate-900 flex items-center justify-between">
                  <span>2. Difference of Squares &amp; Higher Powers</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-200/80 rounded text-slate-700">Conjugates</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center font-mono">
                  <MathFormula formula="a^2 - b^2 = (a - b)(a + b)" block />
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Extends to higher even powers through nested factoring:
                </p>
                <div className="p-2 bg-white rounded border border-slate-200 text-center text-[11px]">
                  <MathFormula formula="a^4 - b^4 = (a^2 - b^2)(a^2 + b^2) = (a - b)(a + b)(a^2 + b^2)" block />
                </div>
                <p className="text-rose-700 text-[10px] font-semibold">
                  Note: <MathFormula formula="a^2 + b^2" /> is prime (irreducible) over the real numbers!
                </p>
              </div>

              {/* Identity 3: Sum and Difference of Cubes */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="font-extrabold text-slate-900 flex items-center justify-between">
                  <span>3. Sum &amp; Difference of Cubes (SOAP)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-200/80 rounded text-slate-700">Mnemonic: SOAP</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center font-mono">
                  <MathFormula formula="a^3 \pm b^3 = (a \pm b)(a^2 \mp ab + b^2)" block />
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  <strong>SOAP Mnemonic:</strong> <strong>S</strong>ame sign in linear binomial, <strong>O</strong>pposite sign in cross-term, <strong>A</strong>lways <strong>P</strong>ositive last term.
                </p>
                <div className="p-2 bg-blue-50 rounded border border-blue-200 text-[11px] text-blue-900">
                  <strong>Crucial Fact:</strong> The trinomial <MathFormula formula="a^2 \mp ab + b^2" /> has <MathFormula formula="\Delta = -3b^2 < 0" />, so it can <strong>NEVER</strong> be factored further over <MathFormula formula="\mathbb{R}" />. Do NOT attempt to factor it!
                </div>
              </div>

              {/* Identity 4: Trinomials & Grouping */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="font-extrabold text-slate-900 flex items-center justify-between">
                  <span>4. Trinomials &amp; 4-Term Grouping</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-200/80 rounded text-slate-700">Grouping</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center font-mono">
                  <MathFormula formula="ax^2 + bx + c \implies \text{Find factors of } ac \text{ that sum to } b" block />
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  For 4 terms, pair terms with common factors:
                </p>
                <div className="p-2 bg-white rounded border border-slate-200 text-center text-[11px]">
                  <MathFormula formula="ax + ay + bx + by = a(x + y) + b(x + y) = (a + b)(x + y)" block />
                </div>
              </div>
            </div>

            {/* Factoring in Action: Step-by-Step Problem */}
            <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-200 space-y-3">
              <div className="font-black text-indigo-950 flex items-center justify-between">
                <span>Multi-Factoring Example: Reducing a Complex Rational</span>
                <span className="text-[11px] text-indigo-700 font-semibold">Step-by-Step Reduction</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-indigo-100 text-center">
                <MathFormula formula="\frac{x^3 - 8}{x^3 + 2x^2 - 4x - 8}" block />
              </div>

              <div className="space-y-2 text-slate-700">
                <div>
                  <strong className="text-indigo-950">Numerator: Difference of Cubes with <MathFormula formula="a = x, b = 2" />:</strong>
                  <div className="mt-1 p-2 bg-white rounded border border-indigo-100 text-center">
                    <MathFormula formula="x^3 - 8 = (x - 2)(x^2 + 2x + 4)" block />
                  </div>
                </div>
                <div>
                  <strong className="text-indigo-950">Denominator: 4-term grouping:</strong>
                  <div className="mt-1 p-2 bg-white rounded border border-indigo-100 text-center">
                    <MathFormula formula="x^2(x + 2) - 4(x + 2) = (x^2 - 4)(x + 2) = (x - 2)(x + 2)(x + 2) = (x - 2)(x + 2)^2" block />
                  </div>
                </div>
                <div>
                  <strong className="text-indigo-950">Divide out Common Factor <MathFormula formula="(x - 2)" />:</strong>
                  <div className="mt-1 p-2 bg-emerald-50 rounded border border-emerald-300 font-bold text-emerald-950 text-center">
                    <MathFormula formula="\frac{\cancel{(x - 2)}(x^2 + 2x + 4)}{\cancel{(x - 2)}(x + 2)^2} = \frac{x^2 + 2x + 4}{(x + 2)^2} \quad (x \neq 2, -2)" block />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SUBSECTION 3: SIMPLIFICATION RULES */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('simplification-rules')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-200">
              03
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900">
                  Simplification Rules, LCD Arithmetic &amp; Complex Fractions
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Operational Core
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Fundamental theorem of fractions, LCD construction, distributing minus signs, and nested compound fraction simplification.
              </p>
            </div>
          </div>
          <div className="p-1 text-slate-400">
            {expandedSections['simplification-rules'] ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </button>

        {expandedSections['simplification-rules'] && (
          <div className="p-5 sm:p-6 border-t border-slate-100 space-y-5 text-slate-800 text-xs">
            {/* The Fundamental Theorem of Fractions */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>The Fundamental Principle of Rational Expressions</span>
              </div>
              <p className="leading-relaxed text-slate-600">
                If <MathFormula formula="P, Q" />, and <MathFormula formula="R" /> are polynomials with <MathFormula formula="Q \neq 0, R \neq 0" />, then:
              </p>
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-center shadow-2xs">
                <MathFormula formula="\frac{P \cdot R}{Q \cdot R} = \frac{P}{Q}" block />
              </div>
              <p className="text-[11px] text-slate-600">
                This identity guarantees that multiplying or dividing both numerator and denominator by the exact same non-zero factor produces an algebraically equivalent fraction.
              </p>
            </div>

            {/* Arithmetic Operations Summary */}
            <div className="space-y-3">
              <div className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                The Four Rational Operations
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Addition / Subtraction */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Addition &amp; Subtraction (LCD)</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded text-center">
                    <MathFormula formula="\frac{A}{D_1} \pm \frac{B}{D_2} = \frac{A \cdot M_1 \pm B \cdot M_2}{\text{LCD}}" block />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    <MathFormula formula="\text{LCD}" /> is the product of the highest power of every distinct prime factor from both denominators.
                  </p>
                </div>

                {/* Multiplication */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Multiplication</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded text-center">
                    <MathFormula formula="\frac{A}{B} \cdot \frac{C}{D} = \frac{A \cdot C}{B \cdot D}, \quad (B \neq 0, D \neq 0)" block />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Cancel common factors across any numerator and denominator <em>before</em> multiplying numerators and denominators.
                  </p>
                </div>

                {/* Division */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>Division (Reciprocal Multiply)</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded text-center">
                    <MathFormula formula="\frac{A}{B} \div \frac{C}{D} = \frac{A}{B} \cdot \frac{D}{C} = \frac{AD}{BC}" block />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Invert the divisor fraction. Exclude zeros of <MathFormula formula="B, C" />, and <MathFormula formula="D" />.
                  </p>
                </div>

                {/* Complex Fractions */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Complex / Compound Fractions</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded text-center">
                    <MathFormula formula="\frac{\frac{A}{B}}{\frac{C}{D}} = \frac{A}{B} \cdot \frac{D}{C} \quad \text{or} \quad \times \frac{\text{Global LCD}}{\text{Global LCD}}" block />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Multiplying numerator and denominator by the Global LCD clears nested fractions in one step!
                  </p>
                </div>
              </div>
            </div>

            {/* Step-by-Step LCD Subtraction Problem with Negative Sign Distribution */}
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
              <div className="font-black text-emerald-950 flex items-center justify-between">
                <span>Worked Example: LCD Construction &amp; Minus Sign Distribution</span>
                <span className="text-[11px] font-bold text-emerald-700">Top Board Trap</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-emerald-100 text-center">
                <span className="text-xs text-slate-500 mr-2 font-sans">Perform operation and simplify:</span>
                <MathFormula formula="\frac{2x}{x^2 - 4} - \frac{1}{x - 2} + \frac{3}{x + 2}" block />
              </div>

              <div className="space-y-2 text-slate-700">
                <div>
                  <strong className="text-slate-900">Step 1 — Factor all denominators completely:</strong>
                  <div className="mt-1 p-2 bg-white rounded border border-emerald-100 text-center">
                    <MathFormula formula="x^2 - 4 = (x - 2)(x + 2) \implies \text{LCD} = (x - 2)(x + 2)" block />
                  </div>
                </div>
                <div>
                  <strong className="text-slate-900">Step 2 — Express every term over the LCD:</strong>
                  <div className="mt-1 p-2 bg-white rounded border border-emerald-100 text-center">
                    <MathFormula formula="= \frac{2x - 1(x + 2) + 3(x - 2)}{(x - 2)(x + 2)}" block />
                  </div>
                </div>
                <div>
                  <strong className="text-slate-900">Step 3 — Distribute carefully across numerator terms:</strong>
                  <p className="text-[11px] text-rose-700 font-medium mt-0.5">
                    Watch out: <MathFormula formula="-1(x + 2) = -x - 2" /> (NOT <MathFormula formula="-x + 2" />)!
                  </p>
                  <div className="mt-1 p-2 bg-white rounded border border-emerald-100 text-center">
                    <MathFormula formula="= \frac{2x - x - 2 + 3x - 6}{(x - 2)(x + 2)} = \frac{4x - 8}{(x - 2)(x + 2)}" block />
                  </div>
                </div>
                <div>
                  <strong className="text-slate-900">Step 4 — Factor the numerator to check for final cancellation:</strong>
                  <div className="mt-1 p-2 bg-emerald-100/70 rounded border border-emerald-300 font-bold text-emerald-950 text-center">
                    <MathFormula formula="= \frac{4\cancel{(x - 2)}}{\cancel{(x - 2)}(x + 2)} = \frac{4}{x + 2} \quad (x \neq 2, -2)" block />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SUBSECTION 4: SOLVING RATIONAL EQUATIONS */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => toggleSection('solving-equations')}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 font-black text-xs flex items-center justify-center shrink-0 border border-amber-200">
              04
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900">
                  Solving Rational Equations &amp; Detecting Extraneous Roots
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  High-Yield Equations
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Clearing fractions via LCD multiplication, cross-multiplication, and mandatory validation against domain restrictions.
              </p>
            </div>
          </div>
          <div className="p-1 text-slate-400">
            {expandedSections['solving-equations'] ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </button>

        {expandedSections['solving-equations'] && (
          <div className="p-5 sm:p-6 border-t border-slate-100 space-y-5 text-slate-800 text-xs">
            {/* The Extraneous Roots Dilemma */}
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-300 space-y-2">
              <div className="font-extrabold text-amber-950 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-amber-700" />
                <span>The Law of Extraneous Roots</span>
              </div>
              <p className="leading-relaxed text-slate-700">
                When solving rational equations, multiplying both sides by the polynomial LCD clears the fractions, transforming the rational equation into an ordinary polynomial equation:
              </p>
              <div className="p-3 bg-white rounded-lg border border-amber-200 text-center font-mono">
                <MathFormula formula="R(x) = 0 \iff \text{LCD}(x) \cdot R(x) = 0 \implies P(x) = 0" block />
              </div>
              <p className="text-amber-950 font-semibold leading-relaxed">
                However, multiplying by an algebraic expression containing the variable <MathFormula formula="x" /> can introduce <strong>extraneous solutions</strong>—apparent roots that satisfy the simplified polynomial equation but make one or more original denominators equal to zero!
              </p>
            </div>

            {/* 4-Step Standard Algorithm */}
            <div className="space-y-2">
              <div className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                Systematic 4-Step Solution Algorithm
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-extrabold text-blue-700 text-xs">Step 1: Domain Check</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Factor all denominators first and write down all excluded values: <MathFormula formula="x \neq c_1, c_2" />.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-extrabold text-indigo-700 text-xs">Step 2: Multiply by LCD</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Multiply every single term on both sides by the entire LCD to completely eliminate denominators.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-extrabold text-purple-700 text-xs">Step 3: Solve Polynomial</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Expand, collect like terms to one side <MathFormula formula="ax^2 + bx + c = 0" />, and factor or use quadratic formula.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-extrabold text-rose-700 text-xs">Step 4: Check for Zeros</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Compare candidate solutions with Step 1. Discard any candidate that matches an excluded value!
                  </p>
                </div>
              </div>
            </div>

            {/* Comprehensive Worked Problem: Extraneous Root Revelation */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="font-black text-slate-900 flex items-center justify-between">
                <span>Worked Example: Detecting Extraneous Roots</span>
                <span className="text-[11px] font-mono text-slate-500">PRC Board Classic</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                <span className="text-xs text-slate-500 mr-2 font-sans">Solve for <MathFormula formula="x" />:</span>
                <MathFormula formula="\frac{x}{x - 2} + \frac{1}{x - 4} = \frac{2}{x^2 - 6x + 8}" block />
              </div>

              <div className="space-y-2 border-l-2 border-amber-400 pl-3">
                <div>
                  <strong className="text-slate-900">Step 1 — Factor Denominators &amp; State Restrictions:</strong>
                  <div className="mt-1 p-2 bg-white rounded border border-slate-200 text-center">
                    <MathFormula formula="x^2 - 6x + 8 = (x - 2)(x - 4) \implies \text{Restrictions: } x \neq 2, \quad x \neq 4" block />
                  </div>
                  <p className="text-[11px] text-rose-600 font-semibold mt-0.5">
                    If candidate solutions equal 2 or 4, they MUST be rejected.
                  </p>
                </div>
                <div>
                  <strong className="text-slate-900">Step 2 — Multiply all terms by the LCD <MathFormula formula="(x - 2)(x - 4)" />:</strong>
                  <div className="mt-1 p-2 bg-white rounded border border-slate-200 text-center">
                    <MathFormula formula="x(x - 4) + 1(x - 2) = 2" block />
                  </div>
                </div>
                <div>
                  <strong className="text-slate-900">Step 3 — Expand and Solve the Resulting Quadratic:</strong>
                  <div className="mt-1 p-2 bg-white rounded border border-slate-200 text-center">
                    <MathFormula formula="x^2 - 4x + x - 2 = 2 \implies x^2 - 3x - 4 = 0" block />
                  </div>
                  <p className="text-slate-600 mt-0.5">Factoring the quadratic trinomial:</p>
                  <div className="mt-1 p-2 bg-white rounded border border-slate-200 text-center">
                    <MathFormula formula="(x - 4)(x + 1) = 0 \implies x_1 = 4, \quad x_2 = -1" block />
                  </div>
                </div>
                <div>
                  <strong className="text-slate-900">Step 4 — Validation Against Domain Restrictions:</strong>
                  <div className="mt-1 space-y-1">
                    <div className="p-2 bg-rose-50 rounded border border-rose-200 text-rose-900 text-[11px]">
                      <strong>At <MathFormula formula="x = 4" />:</strong> The term <MathFormula formula="\frac{1}{x - 4} = \frac{1}{0}" /> is undefined! Thus <MathFormula formula="x = 4" /> is <strong>EXTRANEOUS</strong> and is discarded.
                    </div>
                    <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-emerald-900 text-[11px]">
                      <strong>At <MathFormula formula="x = -1" />:</strong> Makes no denominator zero. <MathFormula formula="\frac{-1}{-3} + \frac{1}{-5} = \frac{1}{3} - \frac{1}{5} = \frac{2}{15}" />, and <MathFormula formula="\frac{2}{1 + 6 + 8} = \frac{2}{15}" /> (True).
                    </div>
                  </div>
                </div>
                <div>
                  <strong className="text-slate-900">Final Solution Set:</strong>
                  <div className="mt-1 p-2 bg-emerald-50 rounded border border-emerald-300 font-bold text-emerald-950 text-center">
                    <MathFormula formula="\text{Solution: } x = -1 \quad \left(\text{Solution Set: } \{-1\}\right)" block />
                  </div>
                </div>
              </div>
            </div>

            {/* Casio fx-991 Speed Hack */}
            <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 flex items-start gap-2.5">
              <AppArtwork name="calculator" inline className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-amber-300 text-xs">
                  Casio fx-991 [SHIFT] [SOLVE] Extraneous Root Detection
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Type the equation into your fx-991ES (GENERAL STUDY ONLY; prohibited October 2026 PRC ECE)/CW using <code className="text-amber-200">[ALPHA] [CALC] (=)</code>. When prompted for an initial guess, input candidate root values. If the calculator returns <code className="text-rose-300">&quot;Can&apos;t Solve&quot;</code> or a math error, the candidate root falls on a vertical pole (extraneous).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
