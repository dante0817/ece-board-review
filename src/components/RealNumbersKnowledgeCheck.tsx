import { AppArtwork } from './common/AppArtwork';
import { shuffledOptionIds, orderedChoices } from '../domain/assessment/optionOrder';
import { gradeResponses } from '../domain/assessment/grading';
import { makeAttemptId } from '../domain/assessment/attemptId';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CheckCircle2, XCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import { MathFormula } from './MathFormula';
import { useReview } from '../context/ReviewContext';
import {
  recordQuizPerformanceForConcept,
  loadRealNumbersSchedule,
  ConceptId,
  ConceptScheduleItem,
  SCHEDULE_UPDATED_EVENT,
  getConceptMastery,
} from '../utils/realNumbersScheduler';
import { recordQuestionAnswerForHeatmap } from '../utils/realNumbersHeatmap';

export interface QuizQuestion {
  id: string;
  topicId: number; // 1: Number Sets, 2: Rational vs. Irrational, 3: Classifying Numbers, 4: Ordering & Comparing
  topicName: string;
  question: string;
  formula?: string;
  options: Array<{
    id: string;
    text: string;
    formula?: string;
  }>;
  correctId: string;
  explanation: string;
  trapAlert?: string;
}

const QUESTION_BANK: QuizQuestion[] = [
  // --- TOPIC 1: NUMBER SETS ---
  {
    id: 's1-q1',
    topicId: 1,
    topicName: 'Number Sets',
    question: 'Which of the following numbers belongs to Whole Numbers (W) but does NOT belong to Natural Numbers (ℕ)?',
    options: [
      { id: 'a', text: '1' },
      { id: 'b', text: '0' },
      { id: 'c', text: '-1' },
      { id: 'd', text: '1/2' },
    ],
    correctId: 'b',
    explanation:
      'Natural numbers ℕ = {1, 2, 3, ...} are positive counting integers. Whole numbers W = {0, 1, 2, 3, ...} include zero. Zero is the only whole number that is not a natural number.',
    trapAlert: 'In engineering board exams, ℕ starts strictly at 1. Zero is whole and integer, but NOT natural.',
  },
  {
    id: 's1-q2',
    topicId: 1,
    topicName: 'Number Sets',
    question: 'Which of the following set relations is mathematically FALSE?',
    formula: '\\mathbb{N} \\subset W \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}',
    options: [
      { id: 'a', text: 'ℕ ⊂ ℤ' },
      { id: 'b', text: 'ℤ ⊂ ℚ' },
      { id: 'c', text: 'ℚ ⊂ (ℝ \\ ℚ)' },
      { id: 'd', text: 'ℚ ⊂ ℝ' },
    ],
    correctId: 'c',
    explanation:
      'Rational numbers (ℚ) and Irrational numbers (ℝ \\ ℚ) are mutually disjoint sets: ℚ ∩ (ℝ \\ ℚ) = ∅. A rational number cannot be a subset of irrational numbers.',
    trapAlert: 'Every real number is either rational or irrational, but never both.',
  },
  {
    id: 's1-q3',
    topicId: 1,
    topicName: 'Number Sets',
    question: 'What is the fundamental difference between the Integers (ℤ) and the Whole Numbers (W)?',
    options: [
      { id: 'a', text: 'ℤ contains negative numbers, whereas W contains only non-negative numbers' },
      { id: 'b', text: 'W contains negative numbers, whereas ℤ does not' },
      { id: 'c', text: 'ℤ contains fractional parts like 1/2' },
      { id: 'd', text: 'W contains imaginary values' },
    ],
    correctId: 'a',
    explanation:
      'Whole numbers W = {0, 1, 2, ...} are non-negative. Integers ℤ = {..., -2, -1, 0, 1, 2, ...} include all whole numbers plus negative whole numbers (additive inverses).',
  },
  {
    id: 's1-q4',
    topicId: 1,
    topicName: 'Number Sets',
    question: 'Which of the following simplifies to an element of the Integers (ℤ)?',
    options: [
      { id: 'a', text: '√5' },
      { id: 'b', text: '-√64' },
      { id: 'c', text: '7/4' },
      { id: 'd', text: '3.14' },
    ],
    correctId: 'b',
    explanation:
      '-√64 simplifies directly to -8. Because -8 is a negative whole number without a fractional part, -8 ∈ ℤ.',
    trapAlert: 'Always simplify radical expressions completely before determining set membership!',
  },

  // --- TOPIC 2: RATIONAL VS. IRRATIONAL ---
  {
    id: 's2-q1',
    topicId: 2,
    topicName: 'Rational vs. Irrational',
    question: 'Which of the following numbers is strictly IRRATIONAL?',
    options: [
      { id: 'a', text: '22/7' },
      { id: 'b', text: '0.454545... (repeating 45)' },
      { id: 'c', text: '√20' },
      { id: 'd', text: '√0.09' },
    ],
    correctId: 'c',
    explanation:
      '√20 = 2√5 ≈ 4.4721359... 20 is not a perfect square, so its square root is non-terminating and non-repeating. In contrast, 22/7 is a ratio of integers (rational), 0.4545... = 45/99 = 5/11 (rational), and √0.09 = 0.3 = 3/10 (rational).',
    trapAlert: '22/7 is a popular approximation of π, but 22/7 is RATIONAL because it is an explicit ratio of two integers.',
  },
  {
    id: 's2-q2',
    topicId: 2,
    topicName: 'Rational vs. Irrational',
    question: 'A reduced fraction a/b produces a terminating decimal if and only if the prime factorization of b contains:',
    options: [
      { id: 'a', text: 'Only prime factors of 3 and 7' },
      { id: 'b', text: 'Only prime factors of 2 and/or 5' },
      { id: 'c', text: 'Any prime factor except 2' },
      { id: 'd', text: 'At least one prime factor greater than 10' },
    ],
    correctId: 'b',
    explanation:
      'Because our base-10 numbering system is 10 = 2 × 5, a fully simplified fraction terminating after finite digits requires b = 2ᵐ · 5ⁿ. Any other prime factor (such as 3, 7, 11) forces an infinite repeating cycle.',
  },
  {
    id: 's2-q3',
    topicId: 2,
    topicName: 'Rational vs. Irrational',
    question: 'Is the set of Irrational Numbers (ℝ \\ ℚ) closed under addition?',
    options: [
      { id: 'a', text: 'Yes, the sum of any two irrationals is always irrational' },
      { id: 'b', text: 'No, because √3 + (-√3) = 0, which is rational' },
      { id: 'c', text: 'Yes, because irrationals form an algebraic field' },
      { id: 'd', text: 'No, only multiplication of irrationals is closed' },
    ],
    correctId: 'b',
    explanation:
      'The sum of two irrational numbers can produce a rational number. For example, √3 and -√3 are both irrational, but √3 + (-√3) = 0, which is rational. Therefore, irrationals are NOT closed under addition.',
    trapAlert: 'Irrationals are NOT closed under ANY of the four basic arithmetic operations (+, −, ×, ÷).',
  },
  {
    id: 's2-q4',
    topicId: 2,
    topicName: 'Rational vs. Irrational',
    question: 'Convert the repeating decimal 0.181818... into a simplified fraction:',
    formula: 'x = 0.\\overline{18}',
    options: [
      { id: 'a', text: '18/100' },
      { id: 'b', text: '2/11' },
      { id: 'c', text: '1/6' },
      { id: 'd', text: '9/50' },
    ],
    correctId: 'b',
    explanation:
      'Let x = 0.181818... Multiply by 100: 100x = 18.181818... Subtract: 100x - x = 18 ⟹ 99x = 18 ⟹ x = 18/99. Dividing numerator and denominator by 9 gives 2/11.',
  },

  // --- TOPIC 3: CLASSIFYING NUMBERS ---
  {
    id: 's3-q1',
    topicId: 3,
    topicName: 'Classifying Numbers',
    question: 'Evaluate the radical expression √((-7)²):',
    formula: '\\sqrt{(-7)^2}',
    options: [
      { id: 'a', text: '-7' },
      { id: 'b', text: '±7' },
      { id: 'c', text: '7' },
      { id: 'd', text: 'Undefined in real numbers' },
    ],
    correctId: 'c',
    explanation:
      'By definition, the principal radical symbol denotes the non-negative root: √(x²) = |x|. Here, √((-7)²) = √49 = 7 = |-7|. It can never evaluate to -7.',
    trapAlert: 'Never output a negative number from a standard square root radical! √(x²) = |x|.',
  },
  {
    id: 's3-q2',
    topicId: 3,
    topicName: 'Classifying Numbers',
    question: 'Consider the number 0.12112111211112... where the number of 1s increases by one after each 2. This number is:',
    options: [
      { id: 'a', text: 'Rational, because it follows a predictable pattern' },
      { id: 'b', text: 'Irrational, because it is non-terminating and non-repeating' },
      { id: 'c', text: 'An integer' },
      { id: 'd', text: 'A non-real imaginary number' },
    ],
    correctId: 'b',
    explanation:
      'A number is rational only if its decimal terminates or repeats a fixed finite block periodically. Although this number has an observable pattern, it NEVER repeats a fixed block of digits. Hence, it is strictly irrational.',
    trapAlert: 'Having a "pattern" is not the same as being "periodic". Only periodic repeating decimals are rational.',
  },
  {
    id: 's3-q3',
    topicId: 3,
    topicName: 'Classifying Numbers',
    question: 'Classify the number -√144 / 3 into all its applicable number sets:',
    options: [
      { id: 'a', text: 'Irrational and Real only' },
      { id: 'b', text: 'Integer, Rational, and Real' },
      { id: 'c', text: 'Natural, Whole, and Integer' },
      { id: 'd', text: 'Non-real complex number' },
    ],
    correctId: 'b',
    explanation:
      'Simplify: √144 = 12, so -12 / 3 = -4. The number -4 is an integer, a rational number (-4/1), and a real number. It is not natural or whole because it is negative.',
  },
  {
    id: 's3-q4',
    topicId: 3,
    topicName: 'Classifying Numbers',
    question: 'Which of the following numbers belongs to Real Numbers (ℝ) but NOT Rational Numbers (ℚ)?',
    options: [
      { id: 'a', text: '-22/7' },
      { id: 'b', text: '0' },
      { id: 'c', text: 'π' },
      { id: 'd', text: '√0.64' },
    ],
    correctId: 'c',
    explanation:
      'π is an irrational, transcendental real number (π ∈ ℝ \\ ℚ). -22/7 and 0 are rational; √0.64 = 0.8 = 4/5 is also rational.',
  },

  // --- TOPIC 4: ORDERING & COMPARING ---
  {
    id: 's4-q1',
    topicId: 4,
    topicName: 'Ordering & Comparing',
    question: 'Arrange the following numbers in ascending order: 4/3, 1.4, √2, 3/2.',
    options: [
      { id: 'a', text: '4/3 < 1.4 < √2 < 3/2' },
      { id: 'b', text: '1.4 < 4/3 < √2 < 3/2' },
      { id: 'c', text: '√2 < 1.4 < 4/3 < 3/2' },
      { id: 'd', text: '4/3 < √2 < 1.4 < 3/2' },
    ],
    correctId: 'a',
    explanation:
      'Convert each to 3 decimal places: 4/3 ≈ 1.333, 1.4 = 1.400, √2 ≈ 1.414, 3/2 = 1.500. Comparing values: 1.333 < 1.400 < 1.414 < 1.500 ⟹ 4/3 < 1.4 < √2 < 3/2.',
  },
  {
    id: 's4-q2',
    topicId: 4,
    topicName: 'Ordering & Comparing',
    question: 'The Density Property of the Real Numbers states that:',
    options: [
      { id: 'a', text: 'Between any two distinct real numbers, there exist infinitely many other real numbers' },
      { id: 'b', text: 'Real numbers are concentrated strictly near zero' },
      { id: 'c', text: 'Every real number has an immediate integer neighbor' },
      { id: 'd', text: 'The number line has measurable gaps' },
    ],
    correctId: 'a',
    explanation:
      'Density means that no matter how close two distinct real numbers a and b are (a < b), there is always another number c between them (e.g., c = (a + b)/2).',
  },
  {
    id: 's4-q3',
    topicId: 4,
    topicName: 'Ordering & Comparing',
    question: 'Which of the following numbers lies between -1.75 and -√2 on the coordinate number line?',
    formula: '-1.75 < x < -\\sqrt{2} \\quad (-\\sqrt{2} \\approx -1.414)',
    options: [
      { id: 'a', text: '-2.0' },
      { id: 'b', text: '-1.6' },
      { id: 'c', text: '-1.2' },
      { id: 'd', text: '0' },
    ],
    correctId: 'b',
    explanation:
      '-√2 ≈ -1.414. The target interval is (-1.75, -1.414). The number -1.6 is greater than -1.75 and less than -1.414, so it falls strictly inside this interval.',
  },
  {
    id: 's4-q4',
    topicId: 4,
    topicName: 'Ordering & Comparing',
    question: 'Compare the negative numbers -7/4 and -√3:',
    options: [
      { id: 'a', text: '-7/4 < -√3' },
      { id: 'b', text: '-7/4 > -√3' },
      { id: 'c', text: '-7/4 = -√3' },
      { id: 'd', text: 'They cannot be compared because √3 is irrational' },
    ],
    correctId: 'a',
    explanation:
      '-7/4 = -1.750 and -√3 ≈ -1.732. On the negative side of the number line, a number further to the left has a smaller value: -1.750 < -1.732, so -7/4 < -√3.',
    trapAlert: 'Remember that with negative numbers, the one with the larger magnitude is smaller (-1.75 < -1.732).',
  },
];

interface KnowledgeCheckProps {
  currentStepId?: number; // 1, 2, 3, 4, or undefined for all
  title?: string;
  targetSubTopicId?: string;
  onNavigateNextStep?: () => void;
  nextStepTitle?: string;
  onNavigateLearn?: (stepId: number) => void;
  onNavigateScheduler?: () => void;
  onNavigateHeatmap?: () => void;
}

export const RealNumbersKnowledgeCheck: React.FC<KnowledgeCheckProps> = ({
  currentStepId,
  title,
  targetSubTopicId,
  onNavigateNextStep,
  nextStepTitle,
  onNavigateLearn,
  onNavigateScheduler,
  onNavigateHeatmap,
}) => {
  const { openChat,addTestRecord,currentDateStr } = useReview();

  // Active topic filter: 'current' (tracks currentStepId) or 1, 2, 3, 4, or 0 (all)
  const [selectedTopic, setSelectedTopic] = useState<number>(currentStepId || 1);

  // Sync with prop when prop changes
  useEffect(() => {
    if (currentStepId) {
      setSelectedTopic(currentStepId);
    }
  }, [currentStepId]);

  // Track the 3 generated question IDs
  const [activeQuestionIds, setActiveQuestionIds] = useState<string[]>([]);

  // User answers: questionId -> selectedOptionId
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [optionOrders,setOptionOrders]=useState<Record<string,string[]>>({});
  const [attemptId,setAttemptId]=useState('');
  const [startedAt,setStartedAt]=useState('');

  // Regeneration counter to re-shuffle
  const [seed, setSeed] = useState<number>(0);

  // Spaced-Repetition tracking
  const [scheduleState, setScheduleState] = useState(() => loadRealNumbersSchedule());

  useEffect(() => {
    const handleUpdate = () => {
      setScheduleState(loadRealNumbersSchedule());
    };
    window.addEventListener(SCHEDULE_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(SCHEDULE_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  const [recordedSchedule, setRecordedSchedule] = useState<{
    concept: ConceptScheduleItem;
    score: number;
    total: number;
  } | null>(null);
  const [hasRecordedForRun, setHasRecordedForRun] = useState<boolean>(false);
  const recordedRunRef = useRef(false);

  // Helper to pick 3 questions based on selectedTopic
  const generateQuestions = (topic: number) => {
    let pool = QUESTION_BANK;
    if (topic >= 1 && topic <= 4) {
      pool = QUESTION_BANK.filter((q) => q.topicId === topic);
    }

    // Shuffle
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, 3).map((q) => q.id);
    setActiveQuestionIds(chosen);
    setAttemptId(makeAttemptId());
    setStartedAt(new Date().toISOString());
    setOptionOrders(Object.fromEntries(chosen.map(id=>{const q=QUESTION_BANK.find(item=>item.id===id)!;return [id,shuffledOptionIds(q.options)];})));
    setUserAnswers({});
    recordedRunRef.current=false;
    setHasRecordedForRun(false);
    setRecordedSchedule(null);
  };

  // Generate on mount or topic change or seed change
  useEffect(() => {
    generateQuestions(selectedTopic);
  }, [selectedTopic, seed]);

  // Questions to display
  const currentQuestions = useMemo(() => {
    return activeQuestionIds
      .map((id) => QUESTION_BANK.find((q) => q.id === id))
      .filter((q): q is QuizQuestion => Boolean(q));
  }, [activeQuestionIds]);

  // Answer selection handler (Immediate Feedback)
  const handleSelectOption = (questionId: string, optionId: string) => {
    // Once the drill is saved, selections must not silently rewrite historical evidence.
    if (hasRecordedForRun) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleRegenerate = () => {
    setSeed((prev) => prev + 1);
  };

  // Score statistics
  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = currentQuestions.filter(
    (q) => userAnswers[q.id] === q.correctId
  ).length;
  const isComplete = currentQuestions.length > 0 && answeredCount === currentQuestions.length;

  // Auto-record in Spaced-Repetition Scheduler and Sub-Topic Struggle Heatmap when drill completes
  useEffect(() => {
    if (isComplete && !hasRecordedForRun && !recordedRunRef.current && currentQuestions.length > 0) {
      recordedRunRef.current=true;
      setHasRecordedForRun(true);

      // Canonical practice evidence uses the same stable-ID grade engine as other quizzes.
      // Immediate explanations and repeatable items make this STUDY evidence only.
      const graded=gradeResponses(currentQuestions.map(q=>({
        questionId:q.id,subjectId:'subj-math-algebra',topicId:'top-real-numbers',
        questionFamilyId:q.id,skillId:q.topicName,correctOptionId:q.correctId,options:q.options,
      })),userAnswers,optionOrders);
      addTestRecord({
        attemptId,startedAt,provenance:'automatic',assessmentMode:'study',assistanceUsed:true,pausedSeconds:0,
        curriculumVersion:'v10.10',scope:'topic',subjectId:'subj-math-algebra',
        testType:'Real Numbers 3-Question Knowledge Check',date:currentDateStr,
        questions:graded.grade.questions,correct:graded.grade.correct,incorrect:graded.grade.incorrect,
        unanswered:graded.grade.unanswered,timeMinutes:Number(((Date.now()-new Date(startedAt).getTime())/60000).toFixed(2)),
        topicIds:['top-real-numbers'],itemResults:graded.results,
        notes:'Three-question guided knowledge check; answers and explanations are exposed during practice. Study evidence only.',
      });

      // Record each question's performance into the Sub-Topic Struggle Heatmap
      currentQuestions.forEach((q) => {
        const isCorrect = userAnswers[q.id] === q.correctId;
        recordQuestionAnswerForHeatmap(q.id, isCorrect);
      });

      if (selectedTopic >= 1 && selectedTopic <= 4) {
        const { updatedItem } = recordQuizPerformanceForConcept(
          selectedTopic as ConceptId,
          correctCount,
          currentQuestions.length
        );
        setRecordedSchedule({
          concept: updatedItem,
          score: correctCount,
          total: currentQuestions.length,
        });
      } else {
        // Multi-topic: Record score per question's topic
        const topicScores: Record<number, { correct: number; total: number }> = {};
        currentQuestions.forEach((q) => {
          if (!topicScores[q.topicId]) {
            topicScores[q.topicId] = { correct: 0, total: 0 };
          }
          topicScores[q.topicId].total += 1;
          if (userAnswers[q.id] === q.correctId) {
            topicScores[q.topicId].correct += 1;
          }
        });

        let primaryResult: ConceptScheduleItem | null = null;
        Object.entries(topicScores).forEach(([tidStr, stats]) => {
          const tid = Number(tidStr) as ConceptId;
          const { updatedItem } = recordQuizPerformanceForConcept(tid, stats.correct, stats.total);
          // Pick the one that had lowest accuracy as primary to prompt revisit
          if (!primaryResult || stats.correct / stats.total < primaryResult.lastScore / primaryResult.lastTotalQuestions) {
            primaryResult = updatedItem;
          }
        });

        if (primaryResult) {
          setRecordedSchedule({
            concept: primaryResult,
            score: correctCount,
            total: currentQuestions.length,
          });
        }
      }
    }
  }, [isComplete, hasRecordedForRun, selectedTopic, correctCount, currentQuestions, userAnswers,optionOrders,attemptId,startedAt,currentDateStr]);

  return (
    <div className="bg-linear-to-b from-[#f8faff] to-white border-2 border-blue-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs app-artwork-tile">
            <AppArtwork name="star" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                {title || 'Knowledge Check: 3-Question Drill'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold">
                Instant Feedback
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Test your grasp on definitions, classification rules, and board traps.
            </p>
          </div>
        </div>

        {/* Action Controls & Topic Pills */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {[
              { id: 1, label: 'Sets' },
              { id: 2, label: 'R vs I' },
              { id: 3, label: 'Classify' },
              { id: 4, label: 'Order' },
              { id: 0, label: 'All' },
            ].map((top) => (
              <button
                key={top.id}
                type="button"
                onClick={() => setSelectedTopic(top.id)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[11px] ${
                  selectedTopic === top.id
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {top.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRegenerate}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors cursor-pointer shadow-2xs flex items-center gap-1 text-xs font-semibold"
            title="Generate 3 New Questions"
          >
            <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
            <span className="hidden md:inline">New 3</span>
          </button>
        </div>
      </div>

      {/* Concept Mastery Levels (Knowledge Check Results) */}
      <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200/90 shadow-2xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <AppArtwork name="trophy" inline className="w-3.5 h-3.5 text-blue-600" />
            <span>Concept Mastery (Knowledge Check Progress)</span>
          </div>
          <div className="flex items-center gap-2">
            {onNavigateHeatmap && (
              <button
                type="button"
                onClick={onNavigateHeatmap}
                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <AppArtwork name="flame" inline className="w-3 h-3 text-rose-600" />
                <span>View Struggle Heatmap</span>
              </button>
            )}
            <span className="text-[11px] text-slate-400 hidden md:inline">
              Click a topic below to focus quiz drill
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: 1, label: 'Step 1: Sets', full: 'Number Sets' },
            { id: 2, label: 'Step 2: R vs I', full: 'Rational vs. Irrational' },
            { id: 3, label: 'Step 3: Classify', full: 'Classifying Numbers' },
            { id: 4, label: 'Step 4: Order', full: 'Ordering & Comparing' },
          ].map((top) => {
            const concept = scheduleState.concepts[top.id as ConceptId];
            const mastery = getConceptMastery(concept);
            const isSelected = selectedTopic === top.id;

            return (
              <button
                key={top.id}
                type="button"
                onClick={() => setSelectedTopic(top.id)}
                className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-50/90 border-blue-300 ring-2 ring-blue-500/20 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-xs mb-1.5">
                  <span className="font-bold text-slate-900 truncate text-[11px]">
                    {top.label}
                  </span>
                  <span className={`font-black text-xs shrink-0 ${mastery.textColor}`}>
                    {mastery.percentage}%
                  </span>
                </div>

                {/* Small Progress Bar */}
                <div
                  className="w-full h-1.5 rounded-full bg-slate-200/80 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={mastery.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  title={`${top.full}: ${mastery.percentage}% Mastery (${mastery.label})`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 bg-linear-to-r ${mastery.barGradient}`}
                    style={{ width: `${Math.max(mastery.percentage > 0 ? 5 : 0, mastery.percentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 pt-0.5">
                  <span className={`font-semibold ${mastery.textColor}`}>
                    {mastery.label}
                  </span>
                  <span className="text-slate-400 font-medium">
                    {concept ? `${concept.lastScore}/3 drill` : 'Untested'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress & Live Score Banner */}
      <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-slate-200/80 text-xs shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">Progress:</span>
          <div className="flex items-center gap-1.5">
            {currentQuestions.map((q, idx) => {
              const isAnswered = Boolean(userAnswers[q.id]);
              const isCorrect = userAnswers[q.id] === q.correctId;
              return (
                <span
                  key={q.id}
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    !isAnswered
                      ? 'bg-slate-100 text-slate-500 border border-slate-300'
                      : isCorrect
                      ? 'bg-emerald-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {idx + 1}
                </span>
              );
            })}
          </div>
          <span className="text-slate-400 text-[11px] ml-1">
            ({answeredCount} of {currentQuestions.length} answered)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Score:</span>
          <span
            className={`font-black text-sm px-2 py-0.5 rounded-md ${
              correctCount === currentQuestions.length && isComplete
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-blue-50 text-blue-700'
            }`}
          >
            {correctCount} / {currentQuestions.length}
          </span>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-5">
        {currentQuestions.map((q, qIndex) => {
          const selectedOption = userAnswers[q.id];
          const hasAnswered = Boolean(selectedOption);
          const isCorrect = selectedOption === q.correctId;

          return (
            <div
              key={q.id}
              className={`rounded-2xl p-4 sm:p-5 border transition-all duration-150 ${
                !hasAnswered
                  ? 'bg-white border-slate-200 shadow-2xs'
                  : isCorrect
                  ? 'bg-[#f0fdf4] border-emerald-300 shadow-xs'
                  : 'bg-[#fff5f5] border-rose-300 shadow-xs'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Question {qIndex + 1}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-slate-100 text-slate-600">
                      {q.topicName}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    {q.question}
                  </h4>
                </div>

                {/* Immediate Result Badge */}
                {hasAnswered && (
                  <div className="shrink-0 animate-in fade-in zoom-in-95 duration-150">
                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-xs font-extrabold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Correct!</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-extrabold text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-full border border-rose-300">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Incorrect</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Optional Math Formula */}
              {q.formula && (
                <div className="my-2 p-2 bg-white/80 rounded-xl border border-slate-200 text-center font-mono text-xs sm:text-sm text-blue-900 font-bold">
                  <MathFormula math={q.formula} />
                </div>
              )}

              {/* Multiple Choice Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                {orderedChoices(q.options,optionOrders[q.id]??q.options.map(opt=>opt.id)).map((opt,displayIndex) => {
                  const isSelected = selectedOption === opt.id;
                  const isAnswerKey = opt.id === q.correctId;

                  let buttonStyles =
                    'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-700';

                  if (hasAnswered) {
                    if (isAnswerKey) {
                      // Correct option always highlighted green
                      buttonStyles =
                        'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-400';
                    } else if (isSelected && !isCorrect) {
                      // Wrong selection highlighted red
                      buttonStyles =
                        'bg-rose-100 border-rose-500 text-rose-950 font-semibold ring-2 ring-rose-400';
                    } else {
                      // Non-selected distractors dimmed
                      buttonStyles = 'bg-white/60 border-slate-200 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={String.fromCharCode(65+displayIndex)}
                      type="button"
                      onClick={() => handleSelectOption(q.id, opt.id)}
                      className={`p-3 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-2 cursor-pointer ${buttonStyles}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 uppercase ${
                            isSelected
                              ? isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-rose-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span className="leading-snug">{opt.text}</span>
                      </div>

                      {hasAnswered && isAnswerKey && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {hasAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Immediate Feedback Rationale Box */}
              {hasAnswered && (
                <div className="mt-3.5 pt-3 border-t border-slate-200/70 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2 text-xs">
                    <AppArtwork name="bulb" inline className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-800 leading-relaxed">
                        <strong className="text-slate-900 font-bold">Explanation: </strong>
                        {q.explanation}
                      </p>

                      {q.trapAlert && (
                        <div className="flex items-start gap-1.5 text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-tight font-medium">
                            <strong>Trap: </strong> {q.trapAlert}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        openChat(
                          `Explain question: "${q.question}" in detail. Why is "${q.options.find(option => option.id===q.correctId)?.text}" the right answer and what makes the other options distractors?`,
                          'Mathematics Specialist'
                        )
                      }
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <AppArtwork name="star" inline className="w-3 h-3" />
                      <span>Ask AI Tutor to break this down</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Summary Card with Spaced-Repetition Feedback */}
      {isComplete && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-white rounded-2xl border-2 border-emerald-300 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold app-artwork-tile">
                  <AppArtwork name="trophy" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">
                    {correctCount === currentQuestions.length
                      ? '🎉 Outstanding! Perfect 3/3 on this Drill!'
                      : correctCount >= 2
                      ? '👍 Good Job! You scored ' + correctCount + '/3'
                      : '💡 Keep Practicing! Score: ' + correctCount + '/3'}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {correctCount === currentQuestions.length
                      ? 'You have firmly solidified this concept for the board exam.'
                      : 'Review the explanations and traps above, or generate 3 new questions.'}
                  </p>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
                  <span>Try 3 New Questions</span>
                </button>

                {onNavigateNextStep && (
                  <button
                    type="button"
                    onClick={onNavigateNextStep}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>{nextStepTitle || 'Next Step'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Spaced-Repetition Scheduler Prompt Banner */}
            {recordedSchedule && (
              <div
                className={`rounded-xl p-4 border transition-all ${
                  recordedSchedule.score <= 1
                    ? 'bg-rose-50/90 border-rose-200 text-rose-950'
                    : 'bg-linear-to-r from-blue-50/90 to-indigo-50/80 border-blue-200 text-slate-900'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={(`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 mt-0.5 ${
                        recordedSchedule.score <= 1
                          ? 'bg-rose-500 text-white shadow-2xs'
                          : 'bg-blue-600 text-white shadow-2xs'
                      }`) + " app-artwork-tile"}
                    >
                      <AppArtwork name="timer" />
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm">
                          {recordedSchedule.score <= 1
                            ? '⚠️ Spaced-Repetition Prompt: Immediate Revisit Scheduled'
                            : '🧠 Spaced-Repetition Schedule Calibrated'}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            recordedSchedule.score <= 1
                              ? 'bg-rose-200 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {recordedSchedule.concept.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {recordedSchedule.score <= 1 ? (
                          <>
                            Score of <strong>{recordedSchedule.score}/3</strong> indicates a retention lapse. The scheduler has calibrated an <strong>urgent 1-day revisit</strong> for <strong>{recordedSchedule.concept.nextReviewDate}</strong>. Revisit this concept to prevent forgetting!
                          </>
                        ) : (
                          <>
                            Retention strengthened to <strong>{recordedSchedule.concept.estimatedRetention}%</strong>! Next review scheduled for <strong>{recordedSchedule.concept.nextReviewDate}</strong> (Interval: {recordedSchedule.concept.intervalDays}d, Streak: {recordedSchedule.concept.repetitions}).
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions to Revisit or View Schedule */}
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    {onNavigateLearn && (
                      <button
                        type="button"
                        onClick={() => onNavigateLearn(recordedSchedule.concept.stepId)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                          recordedSchedule.score <= 1
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <span>Revisit Step {recordedSchedule.concept.stepId}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {onNavigateScheduler && (
                      <button
                        type="button"
                        onClick={onNavigateScheduler}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <AppArtwork name="calendar" inline className="w-3.5 h-3.5" />
                        <span>View Schedule</span>
                      </button>
                    )}

                    {onNavigateHeatmap && (
                      <button
                        type="button"
                        onClick={onNavigateHeatmap}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <AppArtwork name="flame" inline className="w-3.5 h-3.5" />
                        <span>Struggle Heatmap</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
