import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { MathFormula } from '../MathFormula';
import { RationalGraphVisualizer } from './RationalGraphVisualizer';
import { AlertTriangle, CheckCircle2, X, ArrowRight, Check, AlertOctagon } from 'lucide-react';

interface DomainRestrictionsModuleProps {
  onContinueNextSection: () => void;
  onOpenTutor: (prompt: string) => void;
  onStartPracticeDrill: (subskill: string) => void;
  manualStatusControls?: React.ReactNode;
}

// Preset expressions for the Interactive Domain Analyzer Sandbox
interface SandboxPreset {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  expression: string;
  denominatorFormula: string;
  factoredDenominatorFormula: string;
  denominatorEquation: string;
  excludedValues: string[];
  excludedValuesDisplay: string;
  holeDetails: string;
  asymptoteDetails: string;
  setBuilderNotation: string;
  intervalNotation: string;
  explanation: string;
  numberLine: {
    points: { x: number; label: string; isExcluded: boolean }[];
    min: number;
    max: number;
  };
}

const SANDBOX_PRESETS: SandboxPreset[] = [
  {
    id: 'linear',
    name: '1. Linear Denominator',
    badge: 'Fundamental',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    expression: 'f(x) = \\frac{5x - 4}{2x - 8}',
    denominatorFormula: '2x - 8',
    factoredDenominatorFormula: '2(x - 4)',
    denominatorEquation: '2x - 8 = 0 \\implies 2x = 8 \\implies x = 4',
    excludedValues: ['x = 4'],
    excludedValuesDisplay: 'x \\neq 4',
    holeDetails: 'None. (Numerator at x=4 is 5(4)-4 = 16 ≠ 0).',
    asymptoteDetails: 'Vertical Asymptote at x = 4.',
    setBuilderNotation: '\\{x \\in \\mathbb{R} \\mid x \\neq 4\\}',
    intervalNotation: '(-\\infty, 4) \\cup (4, \\infty)',
    explanation: 'A linear denominator has exactly one real zero. Set 2x - 8 = 0 to find the single excluded value x = 4.',
    numberLine: {
      points: [{ x: 4, label: 'x = 4 (Excluded)', isExcluded: true }],
      min: 0,
      max: 8,
    },
  },
  {
    id: 'hole-factor',
    name: '2. Removable Hole (Canceling Factor)',
    badge: 'PRC Board Trap #1',
    badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
    expression: 'f(x) = \\frac{x - 3}{x^2 - 9}',
    denominatorFormula: 'x^2 - 9',
    factoredDenominatorFormula: '(x - 3)(x + 3)',
    denominatorEquation: 'x^2 - 9 = 0 \\implies (x - 3)(x + 3) = 0 \\implies x = \\pm 3',
    excludedValues: ['x = 3', 'x = -3'],
    excludedValuesDisplay: 'x \\neq 3, \\quad x \\neq -3',
    holeDetails: 'Removable Discontinuity (Hole) at x = 3. Simplified fraction is 1/(x+3); y-value is 1/(3+3) = 1/6. Hole: (3, 1/6).',
    asymptoteDetails: 'Vertical Asymptote at x = -3 (factor remains in denominator).',
    setBuilderNotation: '\\{x \\in \\mathbb{R} \\mid x \\neq -3, 3\\}',
    intervalNotation: '(-\\infty, -3) \\cup (-3, 3) \\cup (3, \\infty)',
    explanation: 'CRITICAL RULE: Even though (x - 3) cancels out algebraically, x = 3 remains STRICTLY EXCLUDED from the domain of the original function!',
    numberLine: {
      points: [
        { x: -3, label: 'x = -3 (Asymptote)', isExcluded: true },
        { x: 3, label: 'x = 3 (Hole)', isExcluded: true },
      ],
      min: -6,
      max: 6,
    },
  },
  {
    id: 'trinomial',
    name: '3. Factored Trinomial Denominator',
    badge: 'Quadratic Roots',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    expression: 'f(x) = \\frac{2x + 1}{x^2 - 5x + 6}',
    denominatorFormula: 'x^2 - 5x + 6',
    factoredDenominatorFormula: '(x - 2)(x - 3)',
    denominatorEquation: 'x^2 - 5x + 6 = 0 \\implies (x - 2)(x - 3) = 0 \\implies x = 2, 3',
    excludedValues: ['x = 2', 'x = 3'],
    excludedValuesDisplay: 'x \\neq 2, \\quad x \\neq 3',
    holeDetails: 'None. Numerator 2x + 1 does not share roots with denominator.',
    asymptoteDetails: 'Two Vertical Asymptotes at x = 2 and x = 3.',
    setBuilderNotation: '\\{x \\in \\mathbb{R} \\mid x \\neq 2, 3\\}',
    intervalNotation: '(-\\infty, 2) \\cup (2, 3) \\cup (3, \\infty)',
    explanation: 'Factor the quadratic trinomial into two linear binomials. Setting each factor to 0 yields the two excluded values.',
    numberLine: {
      points: [
        { x: 2, label: 'x = 2 (Asymptote)', isExcluded: true },
        { x: 3, label: 'x = 3 (Asymptote)', isExcluded: true },
      ],
      min: 0,
      max: 5,
    },
  },
  {
    id: 'sum-squares',
    name: '4. Sum of Squares (Always Positive)',
    badge: 'No Real Excluded Values',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    expression: 'f(x) = \\frac{4x - 7}{x^2 + 16}',
    denominatorFormula: 'x^2 + 16',
    factoredDenominatorFormula: 'x^2 + 16 \\;\\text{(Irreducible over } \\mathbb{R}\\text{)}',
    denominatorEquation: 'x^2 + 16 = 0 \\implies x^2 = -16 \\implies x = \\pm 4i \\notin \\mathbb{R}',
    excludedValues: ['None (No Real Zeros)'],
    excludedValuesDisplay: '\\text{No Excluded Values } (x^2 + 16 \\ge 16 > 0)',
    holeDetails: 'None.',
    asymptoteDetails: 'None. The curve is smooth and continuous everywhere.',
    setBuilderNotation: '\\mathbb{R} \\quad \\text{(All Real Numbers)}',
    intervalNotation: '(-\\infty, \\infty)',
    explanation: 'For all real numbers x, x² ≥ 0. Therefore, x² + 16 ≥ 16 > 0. The denominator can NEVER be zero in the real number system.',
    numberLine: {
      points: [],
      min: -8,
      max: 8,
    },
  },
  {
    id: 'division-trap',
    name: '5. Division Quotient Inversion Trap',
    badge: 'PRC Triple Check',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    expression: '\\frac{x - 1}{x} \\div \\frac{x + 2}{x - 4} = \\frac{x - 1}{x} \\cdot \\frac{x - 4}{x + 2}',
    denominatorFormula: '\\text{Denominators: } x, \\; (x - 4), \\;\\text{and inverted numerator } (x + 2)',
    factoredDenominatorFormula: 'x(x - 4)(x + 2) \\neq 0',
    denominatorEquation: 'x = 0, \\quad x - 4 = 0 \\implies x = 4, \\quad x + 2 = 0 \\implies x = -2',
    excludedValues: ['x = 0', 'x = 4', 'x = -2'],
    excludedValuesDisplay: 'x \\neq -2, \\quad x \\neq 0, \\quad x \\neq 4',
    holeDetails: 'None if no factors cancel.',
    asymptoteDetails: 'Vertical asymptotes dependent on the compound operation.',
    setBuilderNotation: '\\{x \\in \\mathbb{R} \\mid x \\neq -2, 0, 4\\}',
    intervalNotation: '(-\\infty, -2) \\cup (-2, 0) \\cup (0, 4) \\cup (4, \\infty)',
    explanation: 'When dividing A/B ÷ C/D, values of x making B = 0, D = 0, OR C = 0 are ALL excluded, because C becomes a denominator when inverted!',
    numberLine: {
      points: [
        { x: -2, label: 'x = -2 (Inverted Num)', isExcluded: true },
        { x: 0, label: 'x = 0 (1st Denom)', isExcluded: true },
        { x: 4, label: 'x = 4 (2nd Denom)', isExcluded: true },
      ],
      min: -4,
      max: 6,
    },
  },
  {
    id: 'radical-rational',
    name: '6. Rational Radical Combination',
    badge: 'ECE Filter Bound',
    badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    expression: 'f(x) = \\frac{3x}{\\sqrt{2x - 10}}',
    denominatorFormula: '\\sqrt{2x - 10}',
    factoredDenominatorFormula: '\\sqrt{2(x - 5)}',
    denominatorEquation: '2x - 10 > 0 \\implies 2x > 10 \\implies x > 5',
    excludedValues: ['All } x \\le 5'],
    excludedValuesDisplay: 'x \\le 5 \\;\\text{are excluded}',
    holeDetails: 'None.',
    asymptoteDetails: 'Vertical Asymptote boundary at x = 5.',
    setBuilderNotation: '\\{x \\in \\mathbb{R} \\mid x > 5\\}',
    intervalNotation: '(5, \\infty)',
    explanation: 'Because the denominator is a square root, the radicand cannot be negative (would produce imaginary values) and cannot be zero (division by zero). Thus 2x - 10 > 0.',
    numberLine: {
      points: [{ x: 5, label: 'x = 5 (Open Bound)', isExcluded: true }],
      min: 0,
      max: 10,
    },
  },
];

// 3 Guided Examples specifically for Domain Restrictions
const GUIDED_EXAMPLES = [
  {
    id: 1,
    title: 'Example 1 of 3: Factoring & Removable Hole',
    expression: '\\frac{x^2 - 4}{x^2 - x - 6}',
    prompt: 'What are the domain restrictions, and which value corresponds to a removable hole?',
    options: [
      {
        key: 'A',
        text: 'Domain: x ≠ 3, -2; Removable hole at x = -2',
        isCorrect: true,
      },
      {
        key: 'B',
        text: 'Domain: x ≠ 3 only; x = -2 cancels out completely so it is included',
        isCorrect: false,
      },
      {
        key: 'C',
        text: 'Domain: x ≠ 2, -2; Vertical asymptotes at both values',
        isCorrect: false,
      },
      {
        key: 'D',
        text: 'Domain: All real numbers',
        isCorrect: false,
      },
    ],
    steps: [
      {
        step: 1,
        label: 'Factor Numerator and Denominator',
        formula: '\\frac{x^2 - 4}{x^2 - x - 6} = \\frac{(x - 2)(x + 2)}{(x - 3)(x + 2)}',
        detail: 'Numerator is a difference of squares: (x-2)(x+2). Denominator factors to (x-3)(x+2).',
      },
      {
        step: 2,
        label: 'Find Excluded Values BEFORE Canceling',
        formula: 'Q(x) = (x - 3)(x + 2) = 0 \\implies x = 3, \\quad x = -2',
        detail: 'Both values make the original denominator zero. Thus the domain is {x ∈ ℝ | x ≠ 3, x ≠ -2}.',
      },
      {
        step: 3,
        label: 'Classify Singularities (Hole vs Asymptote)',
        formula: '\\frac{(x - 2)\\cancel{(x + 2)}}{(x - 3)\\cancel{(x + 2)}} = \\frac{x - 2}{x - 3}, \\quad x \\neq 3, -2',
        detail: 'The factor (x + 2) cancels, creating a Removable Hole at x = -2 with y-value (-2 - 2)/(-2 - 3) = -4/-5 = 4/5. The factor (x - 3) remains, creating a Vertical Asymptote at x = 3.',
      },
    ],
  },
  {
    id: 2,
    title: 'Example 2 of 3: Division Quotient Excluded Values Trap',
    expression: '\\frac{2x}{x - 1} \\div \\frac{x + 5}{x^2 - 16}',
    prompt: 'How many excluded values must be stated for this rational division problem?',
    options: [
      {
        key: 'A',
        text: '4 excluded values: x ≠ 1, 4, -4, and -5',
        isCorrect: true,
      },
      {
        key: 'B',
        text: '3 excluded values: x ≠ 1, 4, and -4 only',
        isCorrect: false,
      },
      {
        key: 'C',
        text: '2 excluded values: x ≠ 4 and -4 only',
        isCorrect: false,
      },
      {
        key: 'D',
        text: '1 excluded value: x ≠ 1 only',
        isCorrect: false,
      },
    ],
    steps: [
      {
        step: 1,
        label: 'Inspect Initial Denominators',
        formula: 'D_1 = x - 1 \\implies x \\neq 1; \\quad D_2 = x^2 - 16 = (x - 4)(x + 4) \\implies x \\neq \\pm 4',
        detail: 'Before inversion, both original denominators cannot be zero: x ≠ 1, 4, -4.',
      },
      {
        step: 2,
        label: 'Invert the Divisor & Check the New Denominator',
        formula: '\\frac{2x}{x - 1} \\cdot \\frac{x^2 - 16}{x + 5} \\implies x + 5 \\neq 0 \\implies x \\neq -5',
        detail: 'The numerator (x + 5) flips into the denominator. Therefore, it also cannot be zero: x ≠ -5.',
      },
      {
        step: 3,
        label: 'Combine All Excluded Values',
        formula: '\\text{Excluded: } x \\in \\{ -5, -4, 1, 4 \\}',
        detail: 'All 4 values will cause division by zero at some point in the operation.',
      },
    ],
  },
  {
    id: 3,
    title: 'Example 3 of 3: Sum of Squares Denominator',
    expression: '\\frac{7x - 3}{x^2 + 25}',
    prompt: 'What is the domain of this rational expression in the real number system?',
    options: [
      {
        key: 'A',
        text: 'All Real Numbers ℝ or (-∞, ∞)',
        isCorrect: true,
      },
      {
        key: 'B',
        text: 'x ≠ 5 and x ≠ -5',
        isCorrect: false,
      },
      {
        key: 'C',
        text: 'x ≠ 3/7 only',
        isCorrect: false,
      },
      {
        key: 'D',
        text: 'x > 5',
        isCorrect: false,
      },
    ],
    steps: [
      {
        step: 1,
        label: 'Set Denominator Equal to Zero',
        formula: 'x^2 + 25 = 0 \\implies x^2 = -25',
        detail: 'Taking the square root gives x = ±√(-25) = ±5i, which are purely imaginary numbers.',
      },
      {
        step: 2,
        label: 'Analyze Real Number Behavior',
        formula: '\\forall x \\in \\mathbb{R}, \\quad x^2 \\ge 0 \\implies x^2 + 25 \\ge 25 > 0',
        detail: 'The sum of a square and a positive constant is strictly positive for any real number.',
      },
      {
        step: 3,
        label: 'State the Domain',
        formula: '\\text{Domain} = (-\\infty, \\infty) = \\mathbb{R}',
        detail: 'No real number causes division by zero. Thus there are zero excluded values.',
      },
    ],
  },
];

// Quick Check Questions for Domain Restrictions
const QUICK_CHECK_QUESTIONS = [
  {
    id: 1,
    question: 'Find all domain restrictions for the rational function: f(x) = \\frac{x + 2}{x^2 - 4}',
    options: [
      { key: 'A', text: 'x \\neq -2 \\text{ and } x \\neq 2', isCorrect: true },
      { key: 'B', text: 'x \\neq 2 \\text{ only, because } (x+2) \\text{ cancels}', isCorrect: false },
      { key: 'C', text: 'x \\neq -2 \\text{ only}', isCorrect: false },
      { key: 'D', text: '\\text{All Real Numbers}', isCorrect: false },
    ],
    explanation:
      'Domain restrictions MUST be found before canceling factors. In x² - 4 = (x - 2)(x + 2), both x = 2 and x = -2 produce zero in the original denominator. While x = -2 is a removable hole, it is still excluded from the domain.',
  },
  {
    id: 2,
    question: 'For the division \\frac{3}{x - 2} \\div \\frac{x + 1}{x + 7}, which values of x must be excluded?',
    options: [
      { key: 'A', text: 'x \\neq 2, -7, \\text{ and } -1', isCorrect: true },
      { key: 'B', text: 'x \\neq 2 \\text{ and } -7 \\text{ only}', isCorrect: false },
      { key: 'C', text: 'x \\neq 2 \\text{ only}', isCorrect: false },
      { key: 'D', text: 'x \\neq -1 \\text{ only}', isCorrect: false },
    ],
    explanation:
      'The original denominators are x - 2 and x + 7, excluding x = 2 and x = -7. When inverted into multiplication 3/(x - 2) · (x + 7)/(x + 1), the numerator x + 1 becomes a denominator, excluding x = -1 as well. Thus x ≠ 2, -7, -1.',
  },
  {
    id: 3,
    question: 'What is the domain of R(x) = \\frac{5x}{x^2 + 9} in interval notation?',
    options: [
      { key: 'A', text: '(-\\infty, \\infty)', isCorrect: true },
      { key: 'B', text: '(-\\infty, -3) \\cup (-3, 3) \\cup (3, \\infty)', isCorrect: false },
      { key: 'C', text: '(-\\infty, 0) \\cup (0, \\infty)', isCorrect: false },
      { key: 'D', text: '[0, \\infty)', isCorrect: false },
    ],
    explanation:
      'x² + 9 = 0 has no real solutions because x² = -9 yields imaginary roots ±3i. For all real x, x² + 9 ≥ 9 > 0. The denominator is never zero, so the domain is (-∞, ∞).',
  },
];

export const DomainRestrictionsModule: React.FC<DomainRestrictionsModuleProps> = ({
  onContinueNextSection,
  onOpenTutor,
  onStartPracticeDrill,
  manualStatusControls,
}) => {
  // Sandbox active preset state
  const [activePresetId, setActivePresetId] = useState<string>('hole-factor');
  const [visualMode, setVisualMode] = useState<'graph2d' | 'numberline'>('graph2d');
  const activePreset =
    SANDBOX_PRESETS.find((p) => p.id === activePresetId) || SANDBOX_PRESETS[1];

  // Guided Example State
  const [guidedIdx, setGuidedIdx] = useState<number>(0);
  const currentGuided = GUIDED_EXAMPLES[guidedIdx];
  const [selectedOption, setSelectedOption] = useState<string>('A');
  const [isChecked, setIsChecked] = useState<boolean>(true);
  const [isStepRevealed, setIsStepRevealed] = useState<boolean>(false);

  // Quick Check Interactive State
  const [quickCheckAnswers, setQuickCheckAnswers] = useState<Record<number, string>>({});
  const [quickCheckSubmitted, setQuickCheckSubmitted] = useState<boolean>(false);

  // Calculator Hack expander state
  const [showCalcGuide, setShowCalcGuide] = useState<boolean>(false);

  const calculateQuickCheckScore = () => {
    let correct = 0;
    QUICK_CHECK_QUESTIONS.forEach((q) => {
      const selected = quickCheckAnswers[q.id];
      const correctOpt = q.options.find((opt) => opt.isCorrect)?.key;
      if (selected === correctOpt) correct++;
    });
    return correct;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. SECTION HERO / SYLLABUS BANNER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase tracking-wider border border-blue-200">
                Section 1 of 8 • Core Foundations
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-extrabold uppercase tracking-wider border border-rose-200">
                High-Yield Board Topic
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <AppArtwork name="book" inline className="w-5 h-5 text-blue-600" />
              <span>Domain Restrictions &amp; Excluded Values</span>
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              A rational expression <MathFormula formula="R(x) = \frac{P(x)}{Q(x)}" /> is strictly undefined wherever its denominator <MathFormula formula="Q(x) = 0" />. Mastering domain restrictions is required for factoring, simplification, graphing, and preventing extraneous solutions in rational equations.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                onOpenTutor(
                  'Explain the fundamental concept of Domain Restrictions and Excluded Values in Rational Expressions. Include how to distinguish between a removable hole and a vertical asymptote for the ECE board exam.'
                )
              }
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <AppArtwork name="lightning" inline className="w-3.5 h-3.5 text-blue-600" />
              <span>Ask Tutor on Domain</span>
            </button>
            <button
              type="button"
              onClick={() => onStartPracticeDrill('Domain Restrictions & Excluded Values')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <AppArtwork name="target" inline className="w-3.5 h-3.5" />
              <span>Practice Drills</span>
            </button>
          </div>
        </div>

        {manualStatusControls}
        {/* Theoretical Axiom Callout */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
            <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
            <span>The Zero-Denominator Axiom &amp; Formal Notation</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            In real number arithmetic <MathFormula formula="\mathbb{R}" />, division by zero is undefined because no real number multiplied by 0 equals a non-zero number (<MathFormula formula="0 \cdot k \neq a" />).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-center font-serif text-xs shadow-2xs">
              <span className="text-[10px] font-sans font-bold text-slate-400 block mb-1">
                Set-Builder Notation:
              </span>
              <MathFormula formula="\text{Domain} = \left\{ x \in \mathbb{R} \;\middle|\; Q(x) \neq 0 \right\}" />
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-center font-serif text-xs shadow-2xs">
              <span className="text-[10px] font-sans font-bold text-slate-400 block mb-1">
                Interval Notation (single restriction c):
              </span>
              <MathFormula formula="\text{Domain} = (-\infty, c) \cup (c, \infty)" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE 2D RATIONAL GRAPH BREAKDOWN & SINGULARITY INSPECTOR */}
      <div className="space-y-4">
        <RationalGraphVisualizer onOpenTutor={onOpenTutor} />
      </div>

      {/* 3. INTERACTIVE DOMAIN ANALYZER & NUMBER LINE SANDBOX */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-sm">
              🔬
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Interactive Domain Analyzer &amp; Singularity Inspector
              </h3>
              <p className="text-xs text-slate-500">
                Select a board exam rational pattern to inspect factoring, excluded values, and number line behavior.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            6 Presets Available
          </span>
        </div>

        {/* Preset Buttons Carousel / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {SANDBOX_PRESETS.map((p) => {
            const isSelected = activePresetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePresetId(p.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[70px] ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-400 text-blue-950 font-bold shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100/80'
                }`}
              >
                <span className="text-[11px] font-bold leading-tight truncate">{p.name}</span>
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border mt-1 w-fit ${p.badgeColor}`}
                >
                  {p.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Preset Inspection Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50/90 to-blue-50/30 border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 gap-2">
            <div>
              <span className="text-[11px] font-bold text-slate-500">Inspecting Expression:</span>
              <div className="text-lg font-serif text-slate-900 mt-0.5 font-bold">
                <MathFormula formula={activePreset.expression} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${activePreset.badgeColor}`}>
                {activePreset.badge}
              </span>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Left Col: Factoring & Denominator Zero */}
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Step 1: Set Denominator Equal to Zero
                </span>
                <div className="font-serif text-slate-900 text-sm">
                  <MathFormula formula={activePreset.denominatorEquation} />
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Step 2: Factored Form of Denominator
                </span>
                <div className="font-serif text-slate-900 text-sm">
                  <MathFormula formula={activePreset.factoredDenominatorFormula} />
                </div>
              </div>

              <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200/80 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  <span>Excluded Values List</span>
                </span>
                <div className="font-serif text-rose-950 font-bold text-sm">
                  <MathFormula formula={activePreset.excludedValuesDisplay} />
                </div>
              </div>
            </div>

            {/* Right Col: Classification & Formal Domain */}
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Discontinuity Classification
                </span>
                <div className="space-y-1 text-slate-700">
                  <div className="flex items-start gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                    <div>
                      <strong className="text-slate-900 font-bold">Holes: </strong>
                      <span>{activePreset.holeDetails}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0" />
                    <div>
                      <strong className="text-slate-900 font-bold">Vertical Asymptotes: </strong>
                      <span>{activePreset.asymptoteDetails}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Formal Domain Representations
                </span>
                <div className="space-y-1 text-emerald-950 font-serif">
                  <div>
                    <span className="font-sans text-[10px] text-emerald-700 font-bold mr-1">Set-Builder:</span>
                    <MathFormula formula={activePreset.setBuilderNotation} />
                  </div>
                  <div>
                    <span className="font-sans text-[10px] text-emerald-700 font-bold mr-1">Interval:</span>
                    <MathFormula formula={activePreset.intervalNotation} />
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 text-[11px] text-slate-600">
                <strong className="font-bold text-blue-900 mr-1">Tutor Note:</strong>
                <span>{activePreset.explanation}</span>
              </div>
            </div>
          </div>

          {/* Visual Real Number Line Display */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <AppArtwork name="eye" inline className="w-3.5 h-3.5 text-blue-600" />
                <span>Visual Real Number Line Graph (Domain Representation)</span>
              </span>
              <span className="text-slate-400">Continuous in ℝ with open circles at excluded values</span>
            </div>

            {/* SVG Visual Number Line */}
            <div className="w-full h-14 relative flex items-center px-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 50">
                {/* Arrow line */}
                <line x1="20" y1="25" x2="580" y2="25" stroke="#94a3b8" strokeWidth="2.5" />
                {/* Arrow heads */}
                <polygon points="12,25 24,20 24,30" fill="#94a3b8" />
                <polygon points="588,25 576,20 576,30" fill="#94a3b8" />

                {/* Real line shading (Domain) */}
                <line x1="24" y1="25" x2="576" y2="25" stroke="#10b981" strokeWidth="4" />

                {/* Excluded Points or Normal ticks */}
                {activePreset.numberLine.points.length === 0 ? (
                  // Continuous Line without breaks
                  <g>
                    <text x="300" y="44" fill="#059669" fontSize="11" fontWeight="bold" textAnchor="middle">
                      All Real Numbers ℝ — Continuous Everywhere (No Excluded Values)
                    </text>
                  </g>
                ) : (
                  activePreset.numberLine.points.map((pt, i) => {
                    const normalizedX =
                      60 +
                      ((pt.x - activePreset.numberLine.min) /
                        (activePreset.numberLine.max - activePreset.numberLine.min)) *
                        480;
                    return (
                      <g key={i}>
                        {/* Cutout line gap */}
                        <circle cx={normalizedX} cy="25" r="7" fill="#ffffff" />
                        {/* Open Ring */}
                        <circle
                          cx={normalizedX}
                          cy="25"
                          r="6"
                          fill="#ffffff"
                          stroke="#e11d48"
                          strokeWidth="2.5"
                        />
                        {/* Label */}
                        <text
                          x={normalizedX}
                          y="44"
                          fill="#be123c"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {pt.label}
                        </text>
                        {/* Value Marker tick */}
                        <line
                          x1={normalizedX}
                          y1="12"
                          x2={normalizedX}
                          y2="17"
                          stroke="#be123c"
                          strokeWidth="1.5"
                        />
                      </g>
                    );
                  })
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 3. GUIDED STEP-BY-STEP EXAMPLES specifically for Domain */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <AppArtwork name="bulb" inline className="w-5 h-5 text-amber-500 fill-amber-400" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Guided Step-by-Step Practice
            </h3>
          </div>
          <div className="flex items-center gap-1 text-xs">
            {GUIDED_EXAMPLES.map((eg, idx) => (
              <button
                key={eg.id}
                type="button"
                onClick={() => {
                  setGuidedIdx(idx);
                  setSelectedOption('A');
                  setIsChecked(true);
                  setIsStepRevealed(false);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  guidedIdx === idx
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Ex {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Example Question Box */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600">
              {currentGuided.title}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Item {guidedIdx + 1} of 3
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-700 font-medium">
              Analyze the rational expression:
            </p>
            <div className="py-2.5 px-4 bg-white rounded-xl border border-slate-200/80 flex items-center justify-center text-base sm:text-lg font-serif">
              <MathFormula formula={currentGuided.expression} />
            </div>
          </div>

          <p className="text-xs font-semibold text-slate-900">
            {currentGuided.prompt}
          </p>

          {/* 4 Options Grid */}
          <div className="space-y-2">
            {currentGuided.options.map((opt) => {
              const isSelected = selectedOption === opt.key;
              const isCorrect = opt.isCorrect;

              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    setSelectedOption(opt.key);
                    setIsChecked(true);
                  }}
                  className={`w-full p-3 rounded-xl border text-left text-xs flex items-center justify-between transition-all cursor-pointer ${
                    isSelected && isCorrect
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium shadow-2xs'
                      : isSelected && !isCorrect
                      ? 'bg-rose-50/80 border-rose-300 text-rose-950 font-medium shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isSelected && isCorrect
                          ? 'bg-emerald-500 text-white'
                          : isSelected && !isCorrect
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {opt.key}
                    </span>
                    <span>{opt.text}</span>
                  </div>

                  {isSelected && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  {isSelected && !isCorrect && (
                    <X className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsChecked(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Verify Answer
            </button>

            <button
              type="button"
              onClick={() => setIsStepRevealed(!isStepRevealed)}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-blue-200 text-blue-600 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <span>≫</span>
              <span>{isStepRevealed ? 'Hide Derivation' : 'Reveal Next Step'}</span>
            </button>
          </div>

          {/* Revealed Steps */}
          {isStepRevealed && (
            <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-3 text-xs animate-fadeIn">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <AppArtwork name="star" inline className="w-3.5 h-3.5 text-blue-600" />
                <span>Step-by-Step Derivation:</span>
              </div>
              {currentGuided.steps.map((s) => (
                <div key={s.step} className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                  <div className="font-semibold text-slate-900">
                    Step {s.step}: {s.label}
                  </div>
                  <div className="py-1 text-slate-800 font-serif">
                    <MathFormula formula={s.formula} />
                  </div>
                  <p className="text-[11px] text-slate-500">{s.detail}</p>
                </div>
              ))}

              <div className="flex items-center justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setGuidedIdx((prev) => (prev + 1) % GUIDED_EXAMPLES.length);
                    setSelectedOption('A');
                    setIsStepRevealed(false);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Try Next Example</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. THE 4 CARDINAL BOARD RULES & TRAPS */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-rose-600" />
          <h3 className="font-extrabold text-slate-900 text-base">
            The 4 Cardinal Board Rules for Excluded Values
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Rule 1 */}
          <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-rose-950">
              <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-[10px] font-black">
                1
              </span>
              <span>Never Cancel Before Determining Restrictions</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Canceling common factors like <MathFormula formula="\frac{x - 3}{x - 3} = 1" /> simplifies the formula for graphing, but <MathFormula formula="x = 3" /> is STILL excluded from the function domain. It represents a <strong>removable hole</strong> at <MathFormula formula="(3, y_0)" />.
            </p>
          </div>

          {/* Rule 2 */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-[10px] font-black">
                2
              </span>
              <span>The Division Triple-Check Trap</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              In <MathFormula formula="\frac{A}{B} \div \frac{C}{D} = \frac{A}{B} \cdot \frac{D}{C}" />, excluded values come from <MathFormula formula="B = 0" />, <MathFormula formula="D = 0" />, <strong>AND</strong> <MathFormula formula="C = 0" />! The numerator <MathFormula formula="C" /> becomes a denominator during inversion.
            </p>
          </div>

          {/* Rule 3 */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-blue-950">
              <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-[10px] font-black">
                3
              </span>
              <span>Irreducible Quadratics Have Zero Restrictions</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              If the denominator is <MathFormula formula="x^2 + c" /> (where <MathFormula formula="c > 0" />), the expression has no real roots (<MathFormula formula="x = \pm i\sqrt{c}" />). Its domain is <strong>All Real Numbers</strong> <MathFormula formula="(-\infty, \infty)" />. Do not write <MathFormula formula="x \neq \pm c" />!
            </p>
          </div>

          {/* Rule 4 */}
          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-purple-950">
              <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-[10px] font-black">
                4
              </span>
              <span>Sign Inversion Factor Traps: (b - a) = -(a - b)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              If the denominator has <MathFormula formula="4 - x" />, factor as <MathFormula formula="-(x - 4)" />. The excluded value is <MathFormula formula="x = 4" />. The negative sign distributes to the numerator or fraction, but the root remains <MathFormula formula="x = 4" />.
            </p>
          </div>
        </div>
      </div>

      {/* 5. CASIO FX-991 CALC PRO-TIP */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AppArtwork name="calculator" inline className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-slate-900 text-sm">
              Casio fx-991ES (GENERAL STUDY ONLY; prohibited October 2026 PRC ECE) Plus / ClassWiz Excluded Value Hack
            </h4>
          </div>
          <button
            type="button"
            onClick={() => setShowCalcGuide(!showCalcGuide)}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>{showCalcGuide ? 'Hide Technique' : 'Show Keystrokes'}</span>
            <span className="text-[10px]">{showCalcGuide ? '▲' : '▼'}</span>
          </button>
        </div>

        {showCalcGuide && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700 animate-fadeIn">
            <p className="font-semibold text-slate-900">
              How to verify excluded values in 5 seconds during the PRC board exam:
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-600">
              <li>
                Type the rational expression directly on screen using <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">믐</kbd> and <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">ALPHA</kbd> + <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">X</kbd>.
              </li>
              <li>
                Press <kbd className="px-1.5 py-0.5 bg-slate-800 text-white rounded font-mono text-[10px] font-bold">CALC</kbd>.
              </li>
              <li>
                Enter the suspected excluded value (e.g. <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">3</kbd>) and press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">=</kbd>.
              </li>
              <li>
                If the screen flashes <strong className="text-rose-600 font-bold">Math ERROR</strong>, the value is undeniably an <strong>Excluded Value</strong> outside the domain!
              </li>
              <li>
                If it gives a numerical result, that value IS in the domain.
              </li>
            </ol>
          </div>
        )}
      </div>

      {/* 6. QUICK CHECK ASSESSMENT */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AppArtwork name="target" inline className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Quick Check: Domain Restrictions Diagnostic
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">
            3 Questions • Test your readiness
          </span>
        </div>

        <div className="space-y-4">
          {QUICK_CHECK_QUESTIONS.map((q, idx) => {
            const selected = quickCheckAnswers[q.id];

            return (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Question {idx + 1} of 3</span>
                  {quickCheckSubmitted && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        selected === q.options.find((o) => o.isCorrect)?.key
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {selected === q.options.find((o) => o.isCorrect)?.key
                        ? 'Correct'
                        : 'Review Required'}
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-800 font-medium">
                  <MathFormula formula={q.question} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt) => {
                    const isChoice = selected === opt.key;

                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() =>
                          setQuickCheckAnswers((prev) => ({ ...prev, [q.id]: opt.key }))
                        }
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                          isChoice
                            ? quickCheckSubmitted
                              ? opt.isCorrect
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                                : 'bg-rose-50 border-rose-400 text-rose-950 font-bold'
                              : 'bg-blue-50 border-blue-400 text-blue-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-sans font-bold text-slate-500">
                            {opt.key}:
                          </span>
                          <span className="font-serif">
                            <MathFormula formula={opt.text} />
                          </span>
                        </div>
                        {quickCheckSubmitted && opt.isCorrect && (
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {quickCheckSubmitted && (
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-600">
                    <strong className="font-bold text-slate-900 mr-1">Explanation:</strong>
                    <span>{q.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
          {!quickCheckSubmitted ? (
            <button
              type="button"
              onClick={() => setQuickCheckSubmitted(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
            >
              Submit Diagnostic
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-900">
                Score: {calculateQuickCheckScore()} / 3 (
                {Math.round((calculateQuickCheckScore() / 3) * 100)}%)
              </span>
              <button
                type="button"
                onClick={() => {
                  setQuickCheckSubmitted(false);
                  setQuickCheckAnswers({});
                }}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Reset Diagnostic
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onContinueNextSection}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <span>Next: Simplification &amp; Factoring</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
