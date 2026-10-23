import { CalculatorCompatibilityNotice } from '../CalculatorCompatibilityNotice';
import { AppArtwork } from '../common/AppArtwork';
import React, { useState, useMemo } from 'react';
import { CheckCircle2, AlertOctagon, ChevronDown, ArrowRight, Search, Check, X } from 'lucide-react';
import { MathFormula } from '../MathFormula';
import { RATIONAL_CONCEPTS, ConceptItem } from './rationalConceptsData';
import { WorkedExamplesView } from './WorkedExamplesView';
import { QuickRefFormulasView } from './QuickRefFormulasView';
import { CoreConceptSections } from './CoreConceptSections';
import { useReview } from '../../context/ReviewContext';

interface LearnTabProps {
  initialSubtab?: 'concepts' | 'quick-ref' | 'worked-examples';
  onTrySimilar: (problemName: string) => void;
}

export const LearnTab: React.FC<LearnTabProps> = ({
  initialSubtab = 'concepts',
  onTrySimilar,
}) => {
  const { openChat } = useReview();

  const [activeSubtab, setActiveSubtab] = useState<'concepts' | 'quick-ref' | 'worked-examples'>(
    initialSubtab
  );

  // Concepts filtering & interaction state
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'foundations' | 'advanced' | 'applications'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedConcepts, setExpandedConcepts] = useState<Record<string, boolean>>({
    'concept-1': true, // default first one expanded
  });
  const [quickCheckAnswers, setQuickCheckAnswers] = useState<Record<string, number>>({});
  const [showQuickCheckExplanations, setShowQuickCheckExplanations] = useState<Record<string, boolean>>({});

  const toggleConceptExpand = (id: string) => {
    setExpandedConcepts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAllConcepts = () => {
    const allExpanded: Record<string, boolean> = {};
    RATIONAL_CONCEPTS.forEach((c) => {
      allExpanded[c.id] = true;
    });
    setExpandedConcepts(allExpanded);
  };

  const collapseAllConcepts = () => {
    setExpandedConcepts({});
  };

  const handleSelectQuickCheck = (conceptId: string, optionIndex: number) => {
    setQuickCheckAnswers((prev) => ({ ...prev, [conceptId]: optionIndex }));
    setShowQuickCheckExplanations((prev) => ({ ...prev, [conceptId]: true }));
  };

  // Filtered concepts based on category and search text
  const filteredConcepts = useMemo(() => {
    return RATIONAL_CONCEPTS.filter((concept) => {
      const matchesCategory =
        selectedCategory === 'all' || concept.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        concept.title.toLowerCase().includes(q) ||
        concept.summary.toLowerCase().includes(q) ||
        concept.eceRelevance.toLowerCase().includes(q) ||
        concept.detailedPoints.some((p) => p.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      <CalculatorCompatibilityNotice/>
      {/* Subtab Navigation Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveSubtab('concepts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeSubtab === 'concepts'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Concepts ({RATIONAL_CONCEPTS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubtab('quick-ref')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeSubtab === 'quick-ref'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Quick Reference (Formulas)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubtab('worked-examples')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeSubtab === 'worked-examples'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Worked Examples
          </button>
        </div>
      </div>

      {/* 1. CONCEPTS SUBTAB */}
      {activeSubtab === 'concepts' && (
        <div className="space-y-5">
          {/* Header Overview Banner */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800">
                    Syllabus Mastery
                  </span>
                  <span className="text-xs text-slate-500 font-medium">PRC ECE Board Exam Coverage</span>
                </div>
                <h3 className="font-black text-slate-900 text-lg">Comprehensive Rational Expressions Guide</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1 max-w-3xl">
                  A rational expression is an algebraic quotient <MathFormula formula="R(x) = \frac{P(x)}{Q(x)}" /> where <MathFormula formula="P(x)" /> and <MathFormula formula="Q(x)" /> are polynomials and <MathFormula formula="Q(x) \neq 0" />. Master all 10 core theoretical foundations, high-yield PRC board techniques, and Casio calculator speed hacks.
                </p>
              </div>

              {/* High-yield ECE connection chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 shrink-0">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Board Weight</div>
                  <div className="text-xs font-black text-slate-900">20% of Math Exam</div>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-left">
                  <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">ECE Direct Link</div>
                  <div className="text-xs font-black text-indigo-950">Circuit Transfer H(s)</div>
                </div>
              </div>
            </div>

            {/* General Formula Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-center shadow-2xs">
              <MathFormula
                formula="R(x) = \frac{P(x)}{Q(x)}, \quad Q(x) \neq 0 \quad \iff \quad \text{Domain} = \mathbb{R} \setminus \{x \mid Q(x) = 0\}"
                block
              />
            </div>
          </div>

          {/* Detailed Collapsible Core Concept Subsections */}
          <CoreConceptSections />

          {/* Filter Bar & Controls */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Concepts ({RATIONAL_CONCEPTS.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('foundations')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === 'foundations'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                Foundations (4)
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('advanced')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === 'advanced'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                Advanced &amp; Circuit Prep (4)
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('applications')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === 'applications'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Board Word Problems &amp; Hacks (2)
              </button>
            </div>

            {/* Search and Expand/Collapse Controls */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-52">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search concepts or traps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <button
                type="button"
                onClick={expandAllConcepts}
                className="px-2.5 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                title="Expand All"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={collapseAllConcepts}
                className="px-2.5 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                title="Collapse All"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Concepts List */}
          <div className="space-y-4">
            {filteredConcepts.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                <Search className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold">No concepts match your search query &quot;{searchQuery}&quot;</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-3 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredConcepts.map((concept) => {
                const isExpanded = !!expandedConcepts[concept.id];
                const selectedAnswer = quickCheckAnswers[concept.id];
                const showExplanation = showQuickCheckExplanations[concept.id];

                return (
                  <div
                    key={concept.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all duration-200 hover:border-slate-300"
                  >
                    {/* Concept Header Card */}
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                      <button
                        type="button"
                        onClick={() => toggleConceptExpand(concept.id)}
                        className="flex-1 text-left flex items-start sm:items-center gap-3 cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {concept.number}
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                              {concept.title}
                            </span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${concept.tagColor}`}>
                              {concept.tag}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <AppArtwork name="chip" inline className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{concept.eceRelevance}</span>
                          </div>
                        </div>
                      </button>

                      {/* Right Action buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openChat(concept.aiPrompt.prompt, concept.aiPrompt.roleId);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Ask AI Tutor about this concept"
                        >
                          <AppArtwork name="chat" inline className="w-3.5 h-3.5 text-purple-600" />
                          <span className="hidden xs:inline">Ask AI Tutor</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleConceptExpand(concept.id)}
                          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
                          aria-label="Toggle concept details"
                        >
                          <ChevronDown
                            className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-blue-600' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Body */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-4">
                        {/* Formula Display */}
                        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs text-center">
                          <MathFormula formula={concept.formula} block />
                        </div>

                        {/* Summary & Core Points */}
                        <div className="bg-white rounded-xl p-4 border border-slate-200/80 space-y-2.5">
                          <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                            {concept.summary}
                          </p>
                          <ul className="space-y-1.5 pt-1">
                            {concept.detailedPoints.map((point, pIdx) => (
                              <li key={pIdx} className="text-xs text-slate-600 flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                <span className="leading-relaxed">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* PRC Board Trap Card */}
                        <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 space-y-2">
                          <div className="flex items-center gap-2 text-rose-900 font-black text-xs uppercase tracking-wider">
                            <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>PRC Board Examiner Trap Alert</span>
                          </div>
                          <div className="text-xs text-rose-900 leading-relaxed">
                            <strong className="text-rose-950 font-bold">The Trap: </strong>
                            {concept.boardTrap.trap}
                          </div>
                          <div className="text-xs text-emerald-900 bg-emerald-50/90 p-2.5 rounded-lg border border-emerald-200 leading-relaxed flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-emerald-950 font-bold">Board Correction: </strong>
                              {concept.boardTrap.correction}
                            </div>
                          </div>
                        </div>

                        {/* Step-by-Step Worked Demonstration */}
                        {concept.workedStep && (
                          <div className="bg-white rounded-xl p-4 border border-slate-200/90 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                <AppArtwork name="bulb" inline className="w-3.5 h-3.5 text-amber-500" />
                                <span>Step-by-Step Demonstration</span>
                              </span>
                              {concept.workedStep.domainNote && (
                                <span className="text-[11px] font-bold text-slate-500">
                                  Domain: {concept.workedStep.domainNote}
                                </span>
                              )}
                            </div>

                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center font-bold text-xs text-slate-800">
                              <MathFormula formula={concept.workedStep.problem} block />
                            </div>

                            <div className="space-y-2.5 pt-1">
                              {concept.workedStep.steps.map((step, sIdx) => (
                                <div key={sIdx} className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100 text-xs space-y-1">
                                  <div className="font-bold text-blue-900">{step.stepName}</div>
                                  <div className="my-1 p-2 bg-white rounded border border-blue-100 text-center">
                                    <MathFormula formula={step.formula} block />
                                  </div>
                                  <div className="text-slate-600 text-[11px]">{step.note}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Interactive Instant Quick Check */}
                        <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                              <AppArtwork name="lightning" inline className="w-3.5 h-3.5 text-amber-500" />
                              <span>Instant Recall Check</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                              Test Your Understanding
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-slate-800">
                            {concept.quickCheck.question}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {concept.quickCheck.options.map((option, oIdx) => {
                              const isSelected = selectedAnswer === oIdx;
                              const isCorrect = oIdx === concept.quickCheck.correctIndex;
                              let btnClass =
                                'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/40';

                              if (isSelected) {
                                if (isCorrect) {
                                  btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                                } else {
                                  btnClass = 'bg-rose-50 border-rose-500 text-rose-950 font-bold';
                                }
                              } else if (showExplanation && isCorrect) {
                                btnClass = 'bg-emerald-50 border-emerald-300 text-emerald-900';
                              }

                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  onClick={() => handleSelectQuickCheck(concept.id, oIdx)}
                                  className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${btnClass}`}
                                >
                                  <span>{option}</span>
                                  {isSelected && (
                                    <span>
                                      {isCorrect ? (
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                      ) : (
                                        <X className="w-4 h-4 text-rose-600 shrink-0" />
                                      )}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {showExplanation && (
                            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
                              <div className="font-bold text-slate-900">
                                {selectedAnswer === concept.quickCheck.correctIndex
                                  ? '✅ Correct Answer!'
                                  : '❌ Incorrect. Review the explanation:'}
                              </div>
                              <p className="text-[11px] leading-relaxed text-slate-600">
                                {concept.quickCheck.explanation}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center justify-between pt-2">
                          <button
                            type="button"
                            onClick={() => onTrySimilar(concept.title)}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <AppArtwork name="lightning" inline className="w-3.5 h-3.5 text-amber-500" />
                            <span>Practice Problems for this Concept</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openChat(concept.aiPrompt.prompt, concept.aiPrompt.roleId)}
                            className="text-xs font-bold text-slate-500 hover:text-purple-700 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>Need deeper explanation?</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 2. QUICK REFERENCE (FORMULAS) SUBTAB */}
      {activeSubtab === 'quick-ref' && (
        <QuickRefFormulasView onPracticeFormula={(category) => onTrySimilar(category)} />
      )}

      {/* 3. WORKED EXAMPLES SUBTAB */}
      {activeSubtab === 'worked-examples' && (
        <WorkedExamplesView onTrySimilar={onTrySimilar} />
      )}
    </div>
  );
};
