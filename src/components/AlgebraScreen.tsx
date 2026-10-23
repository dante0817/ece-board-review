import { ALGEBRA_REFERENCE_CONTENT } from '../data/algebraReferenceContent';
import { readReaderStore } from '../domain/learn/readerProgress';
import { getManualLearnCardSummary, moduleTrackingId } from '../domain/learn/manualLearnTracking';
import { useManualLearnTracking } from '../hooks/useManualLearnTracking';
import { AppArtwork } from './common/AppArtwork';
import { FeatureIcon } from './common/FeatureIcon';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useExclusiveDropdown } from '../hooks/useExclusiveDropdown';
import { useReview } from '../context/ReviewContext';
import { ChevronRight, ChevronDown, ArrowRight, Search, MoreHorizontal, CheckCircle2, AlertCircle } from 'lucide-react';
import { AlgebraFormulaModal } from './AlgebraFormulaModal';
import { FlashcardsModal } from './FlashcardsModal';
import { SubjectOutlineModal } from './SubjectOutlineModal';
import { TreeMenuHeader } from './TreeMenuHeader';
import { AlgebraTimedChallengeModal } from './algebra/AlgebraTimedChallengeModal';
import { FormulaQuickSheetModal } from './FormulaQuickSheetModal';
import { getDedicatedMathScreen } from '../utils/mathTopicNavigation';
import { LEARNING_PATHS, recommendNextForPath } from '../domain/learning/learningPaths';
import { AlgebraArtwork, ALGEBRA_GROUP_ARTWORK, ALGEBRA_TOPIC_ARTWORK } from './algebra/AlgebraArtwork';

const ALGEBRA_ICON_TONES: Record<string, string> = {
  'group-fundamentals': 'blue',
  'group-polynomials': 'violet',
  'group-equations': 'red',
  'group-functions': 'orange',
  'group-exponential': 'emerald',
  'group-systems': 'cyan',
};

export interface AlgebraTopicItem {
  id: string;
  index: number;
  name: string;
  description: string;
  iconLabel?: string;
  iconType?: 'sigma' | 'x_squared' | 'fraction' | 'file' | 'division' | 'chart' | 'book';
  status: 'Mastered' | 'Strong' | 'Needs Work' | 'Not Started';
  actionType: 'Review' | 'Continue' | 'Learn';
  isHighlighted?: boolean;
  scoreInfo?: string;
  isDueToday?: boolean;
  mistakesCount?: number;
  interactiveScreen?: string;
  metricsBadge?: {
    latestScore: string;
    recurringMistakes: string;
    reviewDue: string;
  };
}

export interface AlgebraGroup {
  id: string;
  title: string;
  subtitle?: string;
  masteredCount: number;
  totalCount: number;
  percentage: number;
  dueCount?: number;
  progressBarColor?: string;
  topics: AlgebraTopicItem[];
}

const ALGEBRA_UI_STATE_KEY = 'ece_algebra_ui_state_v1';
const ALGEBRA_SCROLL_KEY = 'ece_algebra_scroll_v1';

const ALGEBRA_CANONICAL_TOPIC_MAP: Record<string, string> = {
  'alg-real-numbers': 'top-real-numbers',
  'alg-signed-numbers': 'top-signed-numbers',
  'alg-pemdas': 'top-order-operations',
  'alg-algebraic-terms': 'top-algebraic-expressions',
  'alg-ratios': 'top-ratios-proportions',
  'alg-scientific-notation': 'top-scientific-notation',
  'alg-exponents': 'top-laws-exponents',
  'alg-polynomials': 'top-polynomial-eq',
  'alg-factoring': 'top-factoring',
  'alg-rational-expressions': 'top-alg-fractions',
  'alg-remainder-factor': 'top-polynomial-functions',
  'alg-synthetic-division': 'top-polynomial-functions',
  'alg-polynomial-functions': 'top-polynomial-functions',
  'alg-binomial-theorem': 'top-binomial-theorem',
  'alg-linear-eq': 'top-linear-eq',
  'alg-quadratic-eq': 'top-quadratics',
  'alg-radical-eq': 'top-rational-radical-eqs',
  'alg-literal-eq': 'top-linear-eq',
  'alg-linear-ineq': 'top-inequalities',
  'alg-quadratic-ineq': 'top-inequalities',
  'alg-abs-value': 'top-absolute-value',
  'alg-cartesian-graph': 'top-functions',
  'alg-relations-functions': 'top-functions',
  'alg-domain-range': 'top-functions',
  'alg-composite-inverse': 'top-inverse-functions',
  'alg-transformations': 'top-functions',
  'alg-rational-functions': 'top-rational-functions',
  'alg-exp-models': 'top-logarithms',
  'alg-log-definitions': 'top-logarithms',
  'alg-log-properties': 'top-logarithms',
  'alg-exp-log-eq': 'top-logarithms',
  'alg-linear-systems': 'top-simultaneous-linear',
  'alg-matrices': 'top-matrices',
  'alg-complex-numbers': 'top-complex-numbers',
  'alg-word-problems': 'top-word-problems',
  'alg-arithmetic-prog': 'top-arithmetic-seq',
  'alg-geometric-prog': 'top-geometric-seq',
  'alg-harmonic-prog': 'top-harmonic-seq',
  'alg-partial-fractions': 'top-partial-fractions',
};

export const AlgebraScreen: React.FC = () => {
  const manualLearnStore=useManualLearnTracking();
  const { setCurrentScreen, navigateToReferenceTopic, startReview, allTopics, subjects, dailyStudyQueue, allDueOrOverdueTopics, errors, currentDateStr, openChat, formulaMemorizationStats, learningPath, testRecords, openTopicDrawer } = useReview();

  // Modals state
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [isQuickSheetOpen, setIsQuickSheetOpen] = useState(false);
  const [isFlashcardsModalOpen, setIsFlashcardsModalOpen] = useState(false);
  const [isOutlineModalOpen, setIsOutlineModalOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useExclusiveDropdown();
  const [isTimedChallengeOpen, setIsTimedChallengeOpen] = useState(false);
  const [timedChallengeSetId, setTimedChallengeSetId] = useState('set-1-core');

  // Topics and syllabus material for Gemini flashcard generation
  const algebraTopics = useMemo(
    () => allTopics.filter((topic) => topic.subjectId === 'subj-math-algebra'),
    [allTopics]
  );

  const algebraMaterial = useMemo(() => {
    return [
      `SUBJECT: College Algebra (Engineering Mathematics - PRC ECE Board Exam)`,
      `Key Syllabus Modules & Topic Breakdown:`,
      `• Algebra Fundamentals: Real number properties, signed numbers, law of signs, exponents & radical operations, order of operations (PEMDAS), algebraic notation.`,
      `• Polynomials & Expressions: Polynomial arithmetic, binomial theorem, factoring techniques (difference of squares, sum/diff of cubes, grouping), rational algebraic expressions & LCD simplification.`,
      `• Equations & Inequations: Linear equations & word problems (mixture, motion, work rate, age), quadratic equations (factoring, quadratic formula, discriminant nature of roots), radical & rational equations.`,
      `• Functions & Relations: Function notation f(x), domain and range restrictions, composite & inverse functions, quadratic functions & vertex.`,
      `• Exponential & Logarithmic Functions: Laws of exponents and logarithms, change of base formula, solving exponential & logarithmic equations.`,
      `• Systems of Equations: 2x2 and 3x3 linear systems, elimination, substitution, Cramer's Rule with determinants, and model-appropriate equation solving with original-equation checks.`,
      `Focus: High-yield board exam question patterns, trap distractors, and quick algebraic shortcuts.`,
    ].join('\n');
  }, []);

  const algebraSubject = subjects.find((subject) => subject.id === 'subj-math-algebra');
  const canonicalAlgebraTopics = algebraSubject?.groups.flatMap((group) => group.topics) ?? [];
  const canonicalCovered = canonicalAlgebraTopics.filter((topic) => topic.initialCovered).length;
  const canonicalMastered = canonicalAlgebraTopics.filter((topic) => (topic.mastery ?? 0) === 5).length;
  const canonicalCoverage = canonicalAlgebraTopics.length
    ? Math.round((canonicalCovered / canonicalAlgebraTopics.length) * 100)
    : 0;
  const algebraDueTopics = allDueOrOverdueTopics.filter((topic) => topic.subjectId === 'subj-math-algebra');
  const pathSuggestion = useMemo(() => recommendNextForPath(learningPath, subjects, testRecords, errors, dailyStudyQueue), [learningPath, subjects, testRecords, errors, dailyStudyQueue]);
  const recommendedAlgebraTopic = pathSuggestion.topic?.subjectId === 'subj-math-algebra' ? pathSuggestion.topic : canonicalAlgebraTopics[0] ?? null;
  const recommendedAlgebraItem = dailyStudyQueue.find(item => item.topic.id === recommendedAlgebraTopic?.id);
  const recommendedAlgebraUiId = Object.keys(ALGEBRA_CANONICAL_TOPIC_MAP).find(
    (id) => ALGEBRA_CANONICAL_TOPIC_MAP[id] === recommendedAlgebraTopic?.id
  );
  const recommendedAlgebraArtwork = ALGEBRA_TOPIC_ARTWORK[recommendedAlgebraUiId ?? ''] || 'square';

  const openRecommendedAlgebraTopic = () => {
    if (!recommendedAlgebraTopic) return;
    const screen = getDedicatedMathScreen(recommendedAlgebraTopic.id);
    if (screen) {
      setCurrentScreen(screen as any);
    } else {
      openTopicDrawer(recommendedAlgebraTopic);
    }
  };

  const savedUiState = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem(ALGEBRA_UI_STATE_KEY) || '{}') as {
        searchQuery?: string;
        activeFilter?: 'All' | 'Due' | 'Needs Work' | 'Not Started' | 'My Review Flag' | 'Self-Mastered';
        expandedGroups?: Record<string, boolean>;
      };
    } catch {
      return {};
    }
  }, []);

  // Search, filter, and accordion position survive a topic round-trip during the
  // current browser session so Back returns the learner to the same curriculum context.
  const [searchQuery, setSearchQuery] = useState(savedUiState.searchQuery || '');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Due' | 'Needs Work' | 'Not Started' | 'My Review Flag' | 'Self-Mastered'>(savedUiState.activeFilter || 'All');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    // Older sessions may have several groups open; restore only one.
    const savedGroups = savedUiState.expandedGroups;
    const openGroup = savedGroups
      ? Object.keys(savedGroups).find((groupId) => savedGroups[groupId])
      : 'group-fundamentals';
    return openGroup ? { [openGroup]: true } : {};
  });
  const [unavailableTopic, setUnavailableTopic] = useState<AlgebraTopicItem | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      [groupId]: !prev[groupId],
    }));
  };

  useEffect(() => {
    try {
      sessionStorage.setItem(
        ALGEBRA_UI_STATE_KEY,
        JSON.stringify({ searchQuery, activeFilter, expandedGroups })
      );
    } catch {
      // Session persistence is a convenience only.
    }
  }, [searchQuery, activeFilter, expandedGroups]);

  useEffect(() => {
    const node = scrollContainerRef.current;
    if (!node) return;
    try {
      const saved = Number(sessionStorage.getItem(ALGEBRA_SCROLL_KEY) || 0);
      if (Number.isFinite(saved) && saved > 0) {
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = saved;
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const handleAlgebraScroll = () => {
    try {
      sessionStorage.setItem(ALGEBRA_SCROLL_KEY, String(scrollContainerRef.current?.scrollTop || 0));
    } catch {
      // ignore
    }
  };

  // Complete data for the 6 Canonical Algebra Groups matching the user interface
  const algebraCatalog: AlgebraGroup[] = useMemo(
    () => [
      {
        id: 'group-fundamentals',
        title: 'Algebra Fundamentals',
        subtitle: 'Core numerical and symbolic skills used throughout Algebra.',
        masteredCount: 4,
        totalCount: 7,
        percentage: 57,
        progressBarColor: 'bg-emerald-500',
        topics: [
          {
            id: 'alg-real-numbers',
            index: 1,
            name: 'Real Numbers & Number Systems',
            description: 'Natural, whole, integers, rational, irrational, real • Number line • Comparison',
            iconLabel: '123',
            status: 'Mastered',
            actionType: 'Review',
            interactiveScreen: 'real-numbers',
          },
          {
            id: 'alg-signed-numbers',
            index: 2,
            name: 'Signed Numbers, Fractions & Decimals',
            description: 'Sign rules • Fraction operations • LCD • Reciprocals • Decimals',
            iconLabel: '±',
            status: 'Needs Work',
            actionType: 'Continue',
            interactiveScreen: 'real-numbers',
            isDueToday: true,
            metricsBadge: {
              latestScore: '72% latest',
              recurringMistakes: '2 recurring mistakes',
              reviewDue: 'Review due today',
            },
          },
          {
            id: 'alg-pemdas',
            index: 3,
            name: 'Order of Operations & Algebraic Properties',
            description: 'PEMDAS • Commutative • Associative • Distributive • Identity • Inverse',
            iconLabel: '( )',
            status: 'Mastered',
            actionType: 'Review',
            isHighlighted: true,
            interactiveScreen: 'order-of-operations',
          },
          {
            id: 'alg-algebraic-terms',
            index: 4,
            name: 'Algebraic Expressions & Terms',
            description: 'Monomial anatomy • Like terms • Unary precedence • Nested brackets • Casio CALC',
            iconLabel: 'X',
            status: 'Mastered',
            actionType: 'Review',
            isHighlighted: true,
            interactiveScreen: 'algebraic-terms',
            metricsBadge: {
              latestScore: '89% latest',
              recurringMistakes: 'Resolved unary trap',
              reviewDue: 'Ready for drill',
            },
          },
          {
            id: 'alg-ratios',
            index: 5,
            name: 'Ratios, Proportions & Percent',
            description: 'Ratios • Equivalent ratios • Proportions • Percentages • Basic applications',
            iconLabel: '%',
            status: 'Mastered',
            actionType: 'Review',
            isHighlighted: true,
            interactiveScreen: 'ratios-proportions',
            metricsBadge: {
              latestScore: '92% latest',
              recurringMistakes: 'Mastered asymmetry trap',
              reviewDue: 'Ready for drill',
            },
          },
          {
            id: 'alg-scientific-notation',
            index: 6,
            name: 'Scientific & Engineering Notation',
            description: 'Scientific notation • Powers of ten • Engineering notation • SI prefixes',
            iconLabel: '10ⁿ',
            status: 'Mastered',
            actionType: 'Review',
            isHighlighted: true,
            interactiveScreen: 'scientific-notation',
            metricsBadge: {
              latestScore: '94% latest',
              recurringMistakes: 'Mastered EIA 104 capacitor code',
              reviewDue: 'Ready for drill',
            },
          },
          {
            id: 'alg-exponents',
            index: 7,
            name: 'Exponents & Radicals',
            description: 'Exponent laws • Rational exponents • Radical simplification • Rationalization',
            iconLabel: 'xⁿ',
            status: 'Strong',
            actionType: 'Review',
            interactiveScreen: 'exponents-radicals',
          },
        ],
      },
      {
        id: 'group-polynomials',
        title: 'Expressions & Polynomials',
        subtitle: 'Operations, factoring strategies, rational expressions, and expansion theorems.',
        masteredCount: 3,
        totalCount: 7,
        dueCount: 1,
        percentage: 50,
        progressBarColor: 'bg-amber-400',
        topics: [
          {
            id: 'alg-polynomials',
            index: 1,
            name: 'Polynomials',
            description: 'Classification • Degrees • Standard form • Addition & Subtraction',
            iconType: 'sigma',
            status: 'Strong',
            actionType: 'Review',
            interactiveScreen: 'polynomials',
          },
          {
            id: 'alg-factoring',
            index: 2,
            name: 'Factoring',
            description: 'GCF • Difference of squares • Trinomials • Grouping methods',
            iconType: 'x_squared',
            status: 'Mastered',
            actionType: 'Review',
            interactiveScreen: 'factoring',
          },
          {
            id: 'alg-rational-expressions',
            index: 3,
            name: 'Rational Expressions',
            description: 'Simplifying • Multiplication & Division • Common denominators • Complex fractions',
            iconType: 'fraction',
            status: 'Needs Work',
            actionType: 'Continue',
            isHighlighted: true,
            scoreInfo: '68% latest',
            isDueToday: true,
            mistakesCount: 2,
            interactiveScreen: 'rational-expressions',
          },
          {
            id: 'alg-remainder-factor',
            index: 4,
            name: 'Remainder & Factor Theorems',
            description: 'Polynomial long division • Synthetic substitution • Root verification',
            iconType: 'file',
            status: 'Not Started',
            actionType: 'Learn',
            interactiveScreen: 'polynomial-functions',
          },
          {
            id: 'alg-synthetic-division',
            index: 5,
            name: 'Synthetic Division',
            description: 'Quick quotient evaluation • Depressed equations • Factor trees',
            iconType: 'division',
            status: 'Not Started',
            actionType: 'Learn',
            interactiveScreen: 'polynomial-functions',
          },
          {
            id: 'alg-polynomial-functions',
            index: 6,
            name: 'Polynomial Functions, Zeros & End Behavior',
            description: 'Zeros & multiplicity • Remainder/Factor Theorems • Rational-zero candidates • End behavior',
            iconType: 'chart',
            status: 'Not Started',
            actionType: 'Learn',
            interactiveScreen: 'polynomial-functions',
          },
          {
            id: 'alg-binomial-theorem',
            index: 7,
            name: 'Binomial Theorem',
            description: 'Pascal triangle • Combinations nCr • General term r+1 coefficient',
            iconType: 'chart',
            status: 'Not Started',
            actionType: 'Learn',
            interactiveScreen: 'binomial-theorem',
          },
        ],
      },
      {
        id: 'group-equations',
        title: 'Equations & Inequalities',
        subtitle: 'Linear, quadratic, radical, and inequality solution techniques with interval notations.',
        masteredCount: 2,
        totalCount: 7,
        percentage: 29,
        progressBarColor: 'bg-teal-500',
        topics: [
          {
            id: 'alg-linear-eq',
            index: 1,
            name: 'Linear Equations in One Variable',
            description: 'Isolation • Clearing denominators • Cross multiplication • Word setups',
            iconType: 'file',
            status: 'Mastered',
            actionType: 'Review',
            interactiveScreen: 'linear-equations',
          },
          {
            id: 'alg-quadratic-eq',
            index: 2,
            name: 'Quadratic Equations, Discriminants & Roots',
            description: 'Factoring • Quadratic formula • Completing square • Nature of roots',
            iconType: 'x_squared',
            status: 'Mastered',
            actionType: 'Review',
            isDueToday: true,
            interactiveScreen: 'quadratic-equations',
          },
          {
            id: 'alg-radical-eq',
            index: 3,
            name: 'Radical and Fractional Equations',
            description: 'Extraneous root checks • Squaring both sides • Rational exponents',
            iconType: 'fraction',
            status: 'Strong',
            actionType: 'Review',
            interactiveScreen: 'rational-radical-equations',
          },
          {
            id: 'alg-literal-eq',
            index: 4,
            name: 'Literal Equations & Formula Rearrangements',
            description: 'Solving for specific board variables • Dimensional isolation',
            iconType: 'file',
            status: 'Needs Work',
            actionType: 'Continue',
            interactiveScreen: 'linear-equations',
          },
          {
            id: 'alg-linear-ineq',
            index: 5,
            name: 'Linear Inequalities & Interval Notation',
            description: 'Reversing inequality signs • Number line graphs • Compound intervals',
            iconType: 'chart',
            status: 'Not Started',
            actionType: 'Learn',
            interactiveScreen: 'inequalities',
          },
          {
            id: 'alg-quadratic-ineq',
            index: 6,
            name: 'Quadratic & Rational Sign Charts',
            description: 'Critical points • Test intervals • Sign analysis • Open/closed sets',
            iconType: 'division',
            status: 'Not Started',
            actionType: 'Learn',
            interactiveScreen: 'inequalities',
          },
          {
            id: 'alg-abs-value',
            index: 7,
            name: 'Absolute Value Equations & Inequalities',
            description: 'Distance definition • Piecewise splitting • Boundary cases',
            iconType: 'sigma',
            status: 'Not Started',
            actionType: 'Learn',
            interactiveScreen: 'absolute-value',
          },
        ],
      },
      {
        id: 'group-functions',
        title: 'Functions & Graphs',
        subtitle: 'Coordinate geometry, function mappings, graph transformations, and compositions.',
        masteredCount: 1,
        totalCount: 5,
        percentage: 20,
        progressBarColor: 'bg-teal-500',
        topics: [
          {
            id: 'alg-cartesian-graph',
            index: 1,
            name: 'Cartesian Coordinate System & Line Slopes',
            description: 'Distance formula • Midpoint • Slope-intercept • Point-slope forms',
            iconType: 'chart',
            status: 'Mastered',
            actionType: 'Review',
            interactiveScreen: 'functions',
          },
          {
            id: 'alg-relations-functions',
            index: 2,
            name: 'Relations, Functions & Vertical Line Test',
            description: 'One-to-one • Onto • Mapping diagrams • Domain & range testing',
            iconType: 'file',
            status: 'Strong',
            actionType: 'Review',
            interactiveScreen: 'functions',
          },
          {
            id: 'alg-domain-range',
            index: 3,
            name: 'Domain, Range & Piecewise Functions',
            description: 'Restrictions • Denominators ≠ 0 • Radicands ≥ 0 • Split definitions',
            iconType: 'book',
            status: 'Not Started',
            actionType: 'Learn',
            interactiveScreen: 'functions',
          },
          {
            id: 'alg-composite-inverse',
            index: 4,
            name: 'Composite & Inverse Functions',
            description: 'f(g(x)) substitution • Finding inverses algebraically • Reflection over y = x',
            iconType: 'division',
            status: 'Not Started',
            actionType: 'Learn',
            interactiveScreen: 'inverse-functions',
          },
          {
            id: 'alg-transformations',
            index: 5,
            name: 'Graph Transformations (Shifts & Reflections)',
            description: 'Horizontal/vertical shifts • Stretching • Compressing • Axis reflections',
            iconType: 'chart',
            status: 'Not Started',
            actionType: 'Learn',
            interactiveScreen: 'functions',
          },
          {
            id: 'alg-rational-functions',
            index: 6,
            name: 'Rational Functions, Holes & Asymptotes',
            description: 'Domain • Holes • Vertical/horizontal/slant asymptotes • Intercepts • Graph behavior',
            iconType: 'chart',
            status: 'Not Started',
            actionType: 'Learn',
            interactiveScreen: 'rational-functions',
          },
        ],
      },
      {
        id: 'group-exponential',
        title: 'Exponential & Logarithmic Functions',
        subtitle: 'Growth/decay models, logarithmic properties, natural base e, and equation solving.',
        masteredCount: 1,
        totalCount: 4,
        percentage: 25,
        progressBarColor: 'bg-teal-500',
        topics: [
          {
            id: 'alg-exp-models',
            index: 1,
            name: 'Exponential Functions, Growth & Decay',
            description: 'Base e • Half-life • Compound interest • Population doubling',
            iconType: 'chart',
            status: 'Mastered',
            actionType: 'Review',
            interactiveScreen: 'exponential-logarithmic',
          },
          {
            id: 'alg-log-definitions',
            index: 2,
            name: 'Logarithmic Definitions & Change of Base',
            description: 'Common log (log10) • Natural log (ln) • Base conversion theorem',
            iconType: 'file',
            status: 'Strong',
            actionType: 'Review',
            interactiveScreen: 'exponential-logarithmic',
          },
          {
            id: 'alg-log-properties',
            index: 3,
            name: 'Laws of Logarithms & Expansions',
            description: 'Product law • Quotient law • Power rule • Condensing expressions',
            iconType: 'sigma',
            status: 'Not Started',
            actionType: 'Learn',
            interactiveScreen: 'exponential-logarithmic',
          },
          {
            id: 'alg-exp-log-eq',
            index: 4,
            name: 'Solving Exponential & Logarithmic Equations',
            description: 'Taking logs of both sides • Extraneous root detection • Substitution',
            iconType: 'division',
            status: 'Not Started',
            actionType: 'Learn',
            interactiveScreen: 'exponential-logarithmic',
          },
        ],
      },
      {
        id: 'group-systems',
        title: 'Systems, Sequences & Special Topics',
        subtitle: 'Systems, complex-number algebra, board word problems, AP/GP progressions, and partial fractions.',
        masteredCount: 0,
        totalCount: 8,
        percentage: 0,
        progressBarColor: 'bg-slate-300',
        topics: [
          {
            id: 'alg-linear-systems',
            index: 1,
            name: 'Systems of Linear & Nonlinear Equations',
            description: 'Substitution • Elimination • 3-variable systems • Determinants / Cramer’s Rule • Nonlinear intersections',
            iconType: 'file',
            status: 'Strong',
            actionType: 'Review',
            isDueToday: true,
            interactiveScreen: 'systems-equations',
          },
          {
            id: 'alg-matrices',
            index: 2,
            name: 'Matrices & Matrix Methods',
            description: 'Dimensions • Operations • Multiplication • Row reduction • Inverses • Determinants',
            iconType: 'file',
            status: 'Needs Work',
            actionType: 'Continue',
            interactiveScreen: 'matrices',
          },
          {
            id: 'alg-complex-numbers',
            index: 3,
            name: 'Complex Numbers',
            description: 'Powers of i • Rectangular arithmetic • Conjugates • Complex quadratic roots',
            iconType: 'file',
            status: 'Needs Work',
            actionType: 'Continue',
            interactiveScreen: 'complex-numbers',
          },
          {
            id: 'alg-word-problems',
            index: 4,
            name: 'Algebraic Word Problems (Age, Mixture, Work)',
            description: 'Rate of work equations • Liquid mixtures • Motion & uniform velocity',
            iconType: 'chart',
            status: 'Needs Work',
            actionType: 'Continue',
            interactiveScreen: 'word-problems',
          },
          {
            id: 'alg-arithmetic-prog',
            index: 5,
            name: 'Arithmetic Progressions & Series Sums',
            description: 'Common difference d • nth term formula • Arithmetic means • Sum of n terms',
            iconType: 'sigma',
            status: 'Not Started',
            actionType: 'Learn',
            interactiveScreen: 'arithmetic-progressions',
          },
          {
            id: 'alg-geometric-prog',
            index: 6,
            name: 'Geometric Progressions & Infinite Convergent Sums',
            description: 'Common ratio r • nth term • Geometric means • Infinite series S∞ = a/(1-r)',
            iconType: 'division',
            status: 'Not Started',
            actionType: 'Learn',
            interactiveScreen: 'geometric-progressions',
          },
          {
            id: 'alg-harmonic-prog',
            index: 7,
            name: 'Harmonic Progressions & Means',
            description: 'Reciprocal relations • Harmonic mean • Reference-limited practice scope',
            iconType: 'fraction',
            status: 'Not Started',
            actionType: 'Learn',
            interactiveScreen: 'harmonic-progressions',
          },
          {
            id: 'alg-partial-fractions',
            index: 8,
            name: 'Partial Fractions Decomposition',
            description: 'Distinct linear • Repeated linear • Irreducible quadratic factors',
            iconType: 'fraction',
            status: 'Not Started',
            actionType: 'Learn',
            interactiveScreen: 'partial-fractions',
          },
        ],
      },
    ],
    []
  );

  // Project the catalog rows from canonical topic state. Static copy above now
  // defines curriculum labels only; mastery, scores, due state and mistake counts
  // come from the learner's current canonical records.
  const algebraGroups: AlgebraGroup[] = useMemo(() => {
    const unresolvedByTopic = new Map<string, number>();
    for (const error of errors) {
      if (!error.isResolved) {
        unresolvedByTopic.set(error.topicId, (unresolvedByTopic.get(error.topicId) || 0) + 1);
      }
    }

    return algebraCatalog.map((group) => {
      const topics = group.topics.map((catalogTopic) => {
        const canonicalId = ALGEBRA_CANONICAL_TOPIC_MAP[catalogTopic.id];
        const canonical = canonicalId ? allTopics.find((topic) => topic.id === canonicalId) : undefined;
        if (!canonical) return catalogTopic;

        const unresolvedMistakes = unresolvedByTopic.get(canonical.id) || 0;
        const due = Boolean(
          canonical.isFlaggedForReview ||
          (canonical.nextReviewDate && canonical.nextReviewDate <= currentDateStr)
        );
        const mastery = canonical.mastery ?? 0;
        const status: AlgebraTopicItem['status'] = !canonical.initialCovered
          ? 'Not Started'
          : mastery >= 5
            ? 'Mastered'
            : mastery >= 4
              ? 'Strong'
              : 'Needs Work';
        const actionType: AlgebraTopicItem['actionType'] = !canonical.initialCovered
          ? 'Learn'
          : mastery <= 3
            ? 'Continue'
            : 'Review';

        const metricsBadge = canonical.initialCovered && (due || unresolvedMistakes > 0 || mastery <= 3)
          ? {
              latestScore: canonical.latestScore == null ? 'No quiz yet' : `${canonical.latestScore}% latest`,
              recurringMistakes: unresolvedMistakes > 0
                ? `${unresolvedMistakes} unresolved mistake${unresolvedMistakes === 1 ? '' : 's'}`
                : 'No unresolved mistakes',
              reviewDue: due
                ? canonical.nextReviewDate && canonical.nextReviewDate < currentDateStr
                  ? 'Review overdue'
                  : 'Review due'
                : canonical.nextReviewDate
                  ? `Next ${canonical.nextReviewDate}`
                  : 'Not scheduled',
            }
          : undefined;

        return {
          ...catalogTopic,
          status,
          actionType,
          scoreInfo: canonical.latestScore == null ? undefined : `${canonical.latestScore}% latest`,
          isDueToday: due,
          mistakesCount: unresolvedMistakes,
          isHighlighted: due || mastery <= 3,
          metricsBadge,
        };
      });

      const masteredCount = topics.filter((topic) => topic.status === 'Mastered').length;
      const dueCount = topics.filter((topic) => topic.isDueToday).length;
      return {
        ...group,
        topics,
        masteredCount,
        totalCount: topics.length,
        dueCount,
        percentage: topics.length ? Math.round((masteredCount / topics.length) * 100) : 0,
        progressBarColor: masteredCount === topics.length
          ? 'bg-emerald-500'
          : dueCount > 0
            ? 'bg-amber-400'
            : 'bg-teal-500',
      };
    });
  }, [algebraCatalog, allTopics, errors, currentDateStr]);

  const allAlgebraModules = useMemo(() => algebraGroups.flatMap((group) => group.topics), [algebraGroups]);
  const dueCanonicalIds = useMemo(() => new Set(algebraDueTopics.map((topic) => topic.id)), [algebraDueTopics]);
  const isAlgebraModuleDue = (topic: AlgebraTopicItem) => {
    const canonicalId = ALGEBRA_CANONICAL_TOPIC_MAP[topic.id];
    return canonicalId ? dueCanonicalIds.has(canonicalId) : false;
  };
  const algebraModuleCounts = useMemo(
    () => ({
      all: allAlgebraModules.length,
      due: allAlgebraModules.filter(isAlgebraModuleDue).length,
      developing: allAlgebraModules.filter((topic) => topic.status === 'Needs Work').length,
      notStarted: allAlgebraModules.filter((topic) => topic.status === 'Not Started').length,
      myReviewFlag: allAlgebraModules.filter(topic=>getManualLearnCardSummary(manualLearnStore,moduleTrackingId(topic.id)).hasReviewFlag).length,
      selfMastered: allAlgebraModules.filter(topic=>getManualLearnCardSummary(manualLearnStore,moduleTrackingId(topic.id)).hasSelfMastered).length,
    }),
    [allAlgebraModules, dueCanonicalIds,manualLearnStore]
  );

  // Filter and search logic
  const filteredGroups = useMemo(() => {
    return algebraGroups
      .map((group) => {
        const matchingTopics = group.topics.filter((t) => {
          // Search query check
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            if (!t.name.toLowerCase().includes(q)) {
              return false;
            }
          }

          // Filter chips
          if (activeFilter === 'Due') return isAlgebraModuleDue(t);
          if (activeFilter === 'Needs Work') return t.status === 'Needs Work';
          if (activeFilter === 'Not Started') return t.status === 'Not Started';
          if (activeFilter === 'My Review Flag') return getManualLearnCardSummary(manualLearnStore,moduleTrackingId(t.id)).hasReviewFlag;
          if (activeFilter === 'Self-Mastered') return getManualLearnCardSummary(manualLearnStore,moduleTrackingId(t.id)).hasSelfMastered;

          return true;
        });

        return {
          ...group,
          topics: matchingTopics,
        };
      })
      .filter((group) => group.topics.length > 0 || (activeFilter === 'All' && searchQuery.trim() === ''));
  }, [algebraGroups, searchQuery, activeFilter, dueCanonicalIds,manualLearnStore]);

  const getCanonicalTopicForModule = (topic: AlgebraTopicItem) => {
    const canonicalId = ALGEBRA_CANONICAL_TOPIC_MAP[topic.id];
    return canonicalId ? allTopics.find((item) => item.id === canonicalId) : undefined;
  };

  // Topic action handler. Dedicated lessons open directly. Modules without a
  // dedicated lesson show an explicit content-state dialog rather than silently
  // opening a broader or unrelated canonical topic.
  const handleTopicAction = (topic: AlgebraTopicItem) => {
    if (topic.interactiveScreen) {
      const canonical=getCanonicalTopicForModule(topic);
      if (canonical && topic.actionType==='Review' && isAlgebraModuleDue(topic)) {
        startReview(canonical,'Spaced Review');
        return;
      }
      if (canonical && canonical.id in ALGEBRA_REFERENCE_CONTENT) {
        const saved=readReaderStore().topics[canonical.id];
        const view = topic.actionType==='Continue' && !saved ? 'practice' : 'learn';
        navigateToReferenceTopic(topic.interactiveScreen as any,{topicId:canonical.id,view,source:'catalog',catalogModuleId:topic.id,catalogModuleName:topic.name});
      } else if(canonical){
        navigateToReferenceTopic(topic.interactiveScreen as any,{
          topicId:canonical.id,view:'learn',source:'catalog',catalogModuleId:topic.id,catalogModuleName:topic.name
        });
      } else {
        setUnavailableTopic(topic);
      }
      return;
    }

    setUnavailableTopic(topic);
  };

  // Manual status controls live inside the actual Learn topic. This opens the
  // lesson even when the regular action would start a scheduled review.
  const openTopicLearn = (topic:AlgebraTopicItem) => {
    if(!topic.interactiveScreen)return setUnavailableTopic(topic);
    const canonical=getCanonicalTopicForModule(topic);
    if(!canonical)return setUnavailableTopic(topic);
    navigateToReferenceTopic(topic.interactiveScreen as any,{
      topicId:canonical.id,view:'learn',source:'catalog',catalogModuleId:topic.id,catalogModuleName:topic.name
    });
  };

  const handleStartMixedDrill = () => {
    const algebraTopic = allTopics.find((topic) => topic.subjectId === 'subj-math-algebra');
    if (algebraTopic) startReview(algebraTopic, 'Mixed Drill');
  };

  const renderGroupIcon = (groupId: string) => {
    return (
      <span aria-hidden="true" className={`icon-3d algebra-topic-icon algebra-artwork-tile icon-3d--${ALGEBRA_ICON_TONES[groupId] || 'blue'}`}>
        <AlgebraArtwork name={ALGEBRA_GROUP_ARTWORK[groupId] || 'calculator'} />
      </span>
    );
  };

  // Helper status badge renderer matching image.png
  const renderStatusBadge = (status: AlgebraTopicItem['status']) => {
    switch (status) {
      case 'Strong':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] shadow-2xs">
            <AppArtwork name="graph" inline className="w-3.5 h-3.5 text-[#2563eb]" />
            <span>Proficient</span>
          </span>
        );
      case 'Mastered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]/80 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
            <span>Mastered</span>
          </span>
        );
      case 'Needs Work':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fffbeb] text-[#d97706] border border-[#fde68a] shadow-2xs">
            <AlertCircle className="w-3.5 h-3.5 text-[#d97706]" />
            <span>Developing</span>
          </span>
        );
      case 'Not Started':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
            <AppArtwork name="cycle" inline className="w-3.5 h-3.5 text-slate-400" />
            <span>Not Started</span>
          </span>
        );
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#f4f7fb]">
      {/* Top Header / Breadcrumbs (OUTSIDE the scrollbar - pinned at top, remains accessible when scrolling) */}
      <TreeMenuHeader
        items={[
          { label: 'Board Subjects', onClick: () => setCurrentScreen('subjects') },
          { label: 'Mathematics', onClick: () => setCurrentScreen('mathematics') },
          { label: 'Algebra', isActive: true },
        ]}
        backButton={{
          label: 'Back to Mathematics',
          onClick: () => setCurrentScreen('mathematics'),
        }}
      />

      {/* Main Container - scrollbar starts strictly below the navigation bar */}
      <div ref={scrollContainerRef} onScroll={handleAlgebraScroll} className="flex-1 overflow-y-auto pb-16">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 select-none">
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">
            <strong>{LEARNING_PATHS[learningPath].label}:</strong>{' '}
            {learningPath === 'guided'
              ? 'Follow topic order and learn through examples, explanation and practice. Course completion has not been mapped to a specific university syllabus.'
              : 'Target weak skills, rechecks and timed work. Independent assessment coverage remains limited, and the Algebra catalog alone is not a complete PRC blueprint.'}
            <span className="ml-1 text-xs text-blue-800">Switch paths in the sidebar; the topic library and saved evidence are shared.</span>
          </div>
          {/* Top Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Icon & Subject Title */}
          <div className="flex items-center gap-4">
            <div className="icon-3d icon-3d--large algebra-artwork-tile" aria-hidden="true">
              <AlgebraArtwork name="square" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                ALGEBRA
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                {learningPath === 'guided' ? 'Build algebra skills with guided explanations' : 'Foundation mathematics for the ECE board exam'}
              </p>
            </div>
          </div>

          {/* Middle & Right: Metrics and Action Buttons */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-5 sm:gap-7 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            {/* Stat 1: Coverage */}
            <div className="text-left sm:text-center min-w-[65px]">
              <span className="block text-xs text-slate-400 font-medium">
                Coverage
              </span>
              <span className="block text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                {canonicalCoverage}%
              </span>
            </div>

            <div className="hidden sm:block h-8 w-[1px] bg-slate-200/80" />

            {/* Stat 2: Mastered */}
            <div className="text-left sm:text-center min-w-[75px]">
              <span className="block text-xs text-slate-400 font-medium">
                Mastered
              </span>
              <span className="block text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                {canonicalMastered}/{canonicalAlgebraTopics.length}
              </span>
            </div>

            <div className="hidden sm:block h-8 w-[1px] bg-slate-200/80" />

            {/* Stat 3: Due (Orange) */}
            <div className="text-left sm:text-center min-w-[45px]">
              <span className="block text-xs text-slate-400 font-medium">
                Due
              </span>
              <span className="block text-2xl sm:text-3xl font-black text-[#ea580c] tracking-tight mt-0.5">
                {algebraDueTopics.length}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0 ml-auto lg:ml-2">
              {/* Tools Dropdown Button */}
              <div className="relative">
                <button
                  id="btn-algebra-tools"
                  type="button"
                  onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                  className="px-3.5 py-2 sm:py-2.5 rounded-xl bg-white hover:bg-blue-50/70 border border-blue-200 text-blue-600 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <span className="icon-3d icon-3d--small icon-3d--blue app-artwork-tile" aria-hidden="true"><AppArtwork name="gear" /></span>
                  <span>Tools</span>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-600 ml-0.5" />
                </button>

                {/* Dropdown Menu */}
                {isToolsDropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-30 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setIsToolsDropdownOpen(false)}
                  >
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Algebra Utilities
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsToolsDropdownOpen(false);
                        setIsQuickSheetOpen(true);
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-xs text-blue-800 hover:bg-blue-50 flex items-center gap-2.5 font-bold cursor-pointer"
                    >
                      <span className="icon-3d icon-3d--small icon-3d--blue app-artwork-tile" aria-hidden="true"><AppArtwork name="printer" /></span>
                      <span>Formula Quick-Sheet ({formulaMemorizationStats.memorized}/{formulaMemorizationStats.total})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsToolsDropdownOpen(false);
                        handleStartMixedDrill();
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 font-medium cursor-pointer"
                    >
                      <span className="icon-3d icon-3d--small icon-3d--blue app-artwork-tile" aria-hidden="true"><AppArtwork name="cycle" /></span>
                      <span>Mixed Algebra Drill</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsToolsDropdownOpen(false);
                        setTimedChallengeSetId('set-1-core');
                        setIsTimedChallengeOpen(true);
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-xs text-amber-800 hover:bg-amber-50 flex items-center gap-2.5 font-bold cursor-pointer"
                    >
                      <span className="icon-3d icon-3d--small icon-3d--amber app-artwork-tile" aria-hidden="true"><AppArtwork name="timer" /></span>
                      <span>5-Expression Timed Challenge</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsToolsDropdownOpen(false);
                        setIsFormulaModalOpen(true);
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 font-medium cursor-pointer"
                    >
                      <span className="icon-3d icon-3d--small icon-3d--blue app-artwork-tile" aria-hidden="true"><AppArtwork name="calculator" /></span>
                      <span>Formula Reference Sheet</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsToolsDropdownOpen(false);
                        setIsFlashcardsModalOpen(true);
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-xs text-amber-800 hover:bg-amber-50 flex items-center gap-2.5 font-bold cursor-pointer"
                    >
                      <FeatureIcon name="flashcards" size="small" />
                      <span>Generate Flashcards (Gemini AI)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsToolsDropdownOpen(false);
                        setIsOutlineModalOpen(true);
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 font-medium cursor-pointer"
                    >
                      <span className="icon-3d icon-3d--small icon-3d--blue app-artwork-tile"><AppArtwork name="exam" /></span>
                      <span>Full Board Syllabus (TOS)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsToolsDropdownOpen(false);
                        openChat('I need help with Algebra for the ECE Board Exam. Can you explain a formula or quiz me on factoring and rational expressions?');
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 font-medium cursor-pointer border-t border-slate-100"
                    >
                      <span className="icon-3d icon-3d--small icon-3d--violet app-artwork-tile" aria-hidden="true"><AppArtwork name="star" /></span>
                      <span>Ask AI Math Tutor</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recommended Next Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-black text-blue-600 uppercase tracking-wider">
            RECOMMENDED NEXT
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa] shadow-2xs">
            <AppArtwork name="calendar" inline className="w-3.5 h-3.5 text-[#ea580c]" />
            <span>{recommendedAlgebraItem ? recommendedAlgebraItem.flagReason.toUpperCase() : 'CONTINUE'}</span>
          </span>
        </div>

        {/* Content row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#e8f2ff] border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 algebra-artwork-tile" aria-hidden="true">
              <AlgebraArtwork name={recommendedAlgebraArtwork} />
            </div>
            <div>
              <h3
                onClick={openRecommendedAlgebraTopic}
                className="text-base sm:text-lg font-black text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
              >
                {recommendedAlgebraTopic?.name ?? 'Continue Algebra'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {pathSuggestion.explanation}
              </p>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                <AppArtwork name="timer" inline className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{recommendedAlgebraItem ? `${recommendedAlgebraItem.suggestedQuestionCount} questions • ~${recommendedAlgebraItem.suggestedDurationMinutes} min` : 'Open the next available topic'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
            <button
              id="btn-timed-challenge-recommended"
              type="button"
              onClick={() => {
                setTimedChallengeSetId('set-1-core');
                setIsTimedChallengeOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <span className="icon-3d icon-3d--small icon-3d--amber app-artwork-tile" aria-hidden="true"><AppArtwork name="timer" /></span>
              <span>Timed Challenge (5q)</span>
            </button>

            <button
              id="btn-start-review-recommended"
              type="button"
              onClick={openRecommendedAlgebraTopic}
              className="px-6 py-2.5 rounded-xl bg-[#1d6bf3] hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <span>Start Recommended</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        {pathSuggestion.reasons.length ? (
          <details className="mt-4">
            <summary className="cursor-pointer text-xs font-bold text-blue-700 hover:text-blue-800">Why this recommendation?</summary>
            <ul className="mt-2 pl-5 list-disc space-y-1 text-xs text-slate-600">
              {pathSuggestion.reasons.slice(0, 4).map((reason) => <li key={reason}>{reason}</li>)}
            </ul>
          </details>
        ) : null}
      </div>

      {/* 4. Algebra Topics Section */}
      <div className="space-y-4">
        {/* Section Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
            ALGEBRA TOPICS
          </h2>

          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics..."
                className="w-44 sm:w-60 pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* More Options Button */}
            <button
              type="button"
              onClick={() => setIsOutlineModalOpen(true)}
              className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              title="More options & curriculum syllabus"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs custom-scrollbar">
          <button
            type="button"
            onClick={() => setActiveFilter('All')}
            className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeFilter === 'All'
                ? 'bg-[#1d6bf3] text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>All</span>
            <span
              className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                activeFilter === 'All' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {algebraModuleCounts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('Due')}
            className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeFilter === 'Due'
                ? 'bg-[#1d6bf3] text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>Due</span>
            <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700">
              {algebraModuleCounts.due}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('Needs Work')}
            className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeFilter === 'Needs Work'
                ? 'bg-[#1d6bf3] text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>Developing</span>
            <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
              {algebraModuleCounts.developing}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('Not Started')}
            className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeFilter === 'Not Started'
                ? 'bg-[#1d6bf3] text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>Not Started</span>
            <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
              {algebraModuleCounts.notStarted}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs custom-scrollbar">
          <button type="button" onClick={()=>setActiveFilter('My Review Flag')} className={`shrink-0 rounded-full px-3 py-1.5 font-semibold border ${activeFilter==='My Review Flag'?'bg-amber-500 border-amber-500 text-white':'bg-white border-amber-200 text-amber-800 hover:bg-amber-50'}`}>
            My Review Flag <span className="ml-1 opacity-80">{algebraModuleCounts.myReviewFlag}</span>
          </button>
          <button type="button" onClick={()=>setActiveFilter('Self-Mastered')} className={`shrink-0 rounded-full px-3 py-1.5 font-semibold border ${activeFilter==='Self-Mastered'?'bg-indigo-700 border-indigo-700 text-white':'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50'}`}>
            Any Mastered (Self) <span className="ml-1 opacity-80">{algebraModuleCounts.selfMastered}</span>
          </button>
          <span className="text-[11px] text-slate-500 shrink-0">Manual labels are separate from scored progress.</span>
        </div>

        {filteredGroups.length===0&&<div role="status" className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">No matching Algebra topics. Try another search or clear the manual status filter. <button type="button" onClick={()=>{setSearchQuery('');setActiveFilter('All');}} className="ml-2 font-semibold text-blue-700 underline">Show all topics</button></div>}
        {/* 5. Accordion Groups List */}
        <div className="space-y-3">
          {filteredGroups.map((group) => {
            const isExpanded = expandedGroups[group.id] ?? false;

            return (
              <div
                key={group.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-colors"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleGroup(group.id)}
                  data-tone={ALGEBRA_ICON_TONES[group.id] || 'blue'}
                  data-expanded={isExpanded}
                  className="algebra-group-header p-4 sm:p-4.5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between cursor-pointer transition-colors select-none"
                >
                  <div className="flex flex-1 items-center gap-3 min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-slate-600 shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
                    )}
                    {renderGroupIcon(group.id)}
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight leading-snug">
                        {group.title}
                      </h3>
                      {group.subtitle && (
                        <p className="text-xs text-slate-500 font-normal mt-0.5 leading-relaxed">
                          {group.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Header Stats & Progress */}
                  <div className="flex items-center justify-between gap-3 sm:gap-4 sm:justify-start shrink-0 text-xs sm:text-sm font-medium">
                    <div className="text-slate-500 flex items-center gap-1.5">
                      <span>
                        {group.masteredCount}/{group.totalCount} mastered
                      </span>
                      {group.dueCount && group.dueCount > 0 ? (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-[#ea580c] font-semibold">
                            {group.dueCount} due
                          </span>
                        </>
                      ) : null}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-16 sm:w-20 h-2 bg-slate-200 rounded-full overflow-hidden shrink-0">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          group.progressBarColor || 'bg-emerald-500'
                        }`}
                        style={{ width: `${group.percentage}%` }}
                      />
                    </div>

                    {/* Percentage */}
                    <span className="text-xs sm:text-sm font-semibold text-slate-700 min-w-[32px] text-right">
                      {group.percentage}%
                    </span>

                    {/* Trailing Chevron on collapsed */}
                    {!isExpanded && (
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-0.5" />
                    )}
                  </div>
                </div>

                {/* Submodules List (when expanded) */}
                {isExpanded && (
                  <div className="px-3 sm:px-4 pb-4 pt-3 space-y-2.5">
                    {group.topics.map((topic, idx) => {
                      const itemNumber = topic.index ?? idx + 1;

                      return (
                        <div
                          key={topic.id}
                          className={`rounded-2xl p-3.5 sm:p-4 flex flex-col items-stretch sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 sm:flex-wrap transition-all bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs ${
                            topic.isHighlighted ? 'ring-1 ring-blue-300/60 bg-[#f8faff]' : ''
                          }`}
                        >
                          {/* Left: Index, Icon & Content */}
                          <div className="flex flex-1 items-center gap-3 sm:gap-4 min-w-0">
                            {/* Number Index */}
                            <span className="w-5 text-center text-slate-700 font-bold text-sm sm:text-base shrink-0 select-none">
                              {itemNumber}
                            </span>

                            {/* Glossy artwork inside the existing colored tile. */}
                            <div aria-hidden="true" className={`icon-3d algebra-topic-icon algebra-artwork-tile select-none icon-3d--${ALGEBRA_ICON_TONES[group.id] || 'blue'}`}>
                              <AlgebraArtwork name={ALGEBRA_TOPIC_ARTWORK[topic.id] || ALGEBRA_GROUP_ARTWORK[group.id] || 'calculator'} />
                            </div>

                            {/* Title, Subtitle, & Optional Metrics Badge */}
                            <div className="min-w-0">
                              <h4
                                onClick={() => handleTopicAction(topic)}
                                className="font-bold text-slate-900 text-sm sm:text-base leading-snug hover:text-blue-600 cursor-pointer transition-colors"
                              >
                                {topic.name}
                              </h4>

                              {topic.description && (
                                <p className="text-xs text-slate-500 font-normal mt-0.5 leading-relaxed">
                                  {topic.description}
                                </p>
                              )}

                              {(() => {
                                const summary=getManualLearnCardSummary(manualLearnStore,moduleTrackingId(topic.id));
                                const manual=summary.parent;
                                return (manual.reviewCount>0||manual.selfStatus!=='unrated'||manual.needsReview||summary.trackedCards>0)
                                  ? <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600" aria-label="Manual study progress">
                                      <span className="rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5">My reviews: {manual.reviewCount}×</span>
                                      {manual.selfStatus!=='unrated'&&<span className="rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5">{manual.selfStatus==='mastered'?'Mastered (Self)':manual.selfStatus==='understood'?'Understood':'Studying'}</span>}
                                      {summary.reviewedCards>0&&<span className="rounded-md bg-indigo-50 border border-indigo-100 px-2 py-0.5">Lesson cards read: {summary.reviewedCards}</span>}
                                      {summary.selfMasteredCards>0&&<span className="rounded-md bg-emerald-50 border border-emerald-100 px-2 py-0.5">Cards mastered (self): {summary.selfMasteredCards}</span>}
                                      {summary.hasReviewFlag&&<span className="rounded-md bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5">My Review Flag</span>}
                                    </div>:null;
                              })()}
                              {topic.metricsBadge && (
                                <div className="inline-flex flex-wrap items-center gap-2 px-2.5 py-0.5 rounded-lg bg-[#fff1f2] border border-rose-200/80 text-[#e11d48] text-[11px] font-semibold mt-1.5 shadow-2xs">
                                  <span>{topic.metricsBadge.latestScore}</span>
                                  <span className="text-rose-300 font-normal">|</span>
                                  <span>{topic.metricsBadge.recurringMistakes}</span>
                                  <span className="text-rose-300 font-normal">|</span>
                                  <span>{topic.metricsBadge.reviewDue}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Status Pill, Button, Trailing Chevron */}
                          <div className="flex items-center justify-end gap-2.5 sm:gap-3 sm:justify-start shrink-0">
                            {topic.actionType!=='Learn'&&<button type="button" onClick={()=>openTopicLearn(topic)} aria-label={`Open Learn topic and manual status checkboxes for ${topic.name}`} className="rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 px-2.5 py-2 text-xs font-semibold">Open Learn</button>}
                            {renderStatusBadge(topic.status)}

                            {topic.actionType === 'Continue' ? (
                              <button
                                type="button"
                                onClick={() => handleTopicAction(topic)}
                                className="px-5 sm:px-6 py-2 rounded-xl bg-[#1d6bf3] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer min-w-[88px] sm:min-w-[96px] text-center"
                              >
                                Continue
                              </button>
                            ) : topic.actionType === 'Review' ? (
                              <button
                                type="button"
                                onClick={() => handleTopicAction(topic)}
                                className="px-5 sm:px-6 py-2 rounded-xl bg-white hover:bg-blue-50/70 border border-blue-200 text-blue-600 font-semibold text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer min-w-[88px] sm:min-w-[96px] text-center"
                              >
                                Review
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleTopicAction(topic)}
                                className="px-5 sm:px-6 py-2 rounded-xl bg-white hover:bg-blue-50/70 border border-blue-200 text-blue-600 font-semibold text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer min-w-[88px] sm:min-w-[96px] text-center"
                              >
                                Learn
                              </button>
                            )}

                            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
        </div>
      </div>

      {unavailableTopic && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="unavailable-topic-title">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 sm:p-6">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mb-4 app-artwork-tile">
              <AppArtwork name="book" />
            </div>
            <h2 id="unavailable-topic-title" className="text-lg font-black text-slate-900">{unavailableTopic.name}</h2>
            <p className="text-sm text-slate-600 mt-2">The full dedicated lesson for this module has not been added yet. The reviewer will not redirect you to another lesson.</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {getCanonicalTopicForModule(unavailableTopic) && (
                <button
                  type="button"
                  onClick={() => {
                    const related = getCanonicalTopicForModule(unavailableTopic);
                    if (related) startReview(related, 'Related Practice');
                    setUnavailableTopic(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold"
                >
                  Practice Related Questions
                </button>
              )}
              <button type="button" onClick={() => { openChat(`Teach me ${unavailableTopic.name} for the ECE board exam using the approved reviewer scope.`); setUnavailableTopic(null); }} className="px-4 py-2.5 rounded-xl bg-white border border-blue-200 text-blue-700 text-sm font-bold hover:bg-blue-50">Ask Tutor</button>
              <button type="button" onClick={() => setUnavailableTopic(null)} className="sm:col-span-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50">Back to Algebra</button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isFormulaModalOpen && (
        <AlgebraFormulaModal
          isOpen={isFormulaModalOpen}
          onClose={() => setIsFormulaModalOpen(false)}
        />
      )}

      {isQuickSheetOpen && (
        <FormulaQuickSheetModal
          isOpen={isQuickSheetOpen}
          onClose={() => setIsQuickSheetOpen(false)}
        />
      )}

      {isFlashcardsModalOpen && (
        <FlashcardsModal
          isOpen={isFlashcardsModalOpen}
          onClose={() => setIsFlashcardsModalOpen(false)}
          selectedTopics={algebraTopics}
          subjectName="College Algebra"
          material={algebraMaterial}
          title="College Algebra Review Flashcards"
        />
      )}

      {isOutlineModalOpen && (
        <SubjectOutlineModal
          isOpen={isOutlineModalOpen}
          onClose={() => setIsOutlineModalOpen(false)}
        />
      )}

      {isTimedChallengeOpen && (
        <AlgebraTimedChallengeModal
          isOpen={isTimedChallengeOpen}
          onClose={() => setIsTimedChallengeOpen(false)}
          initialSetId={timedChallengeSetId}
        />
      )}
    </div>
  );
};
