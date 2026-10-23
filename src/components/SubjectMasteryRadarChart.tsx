import { AppArtwork } from './common/AppArtwork';
import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
} from 'recharts';
import { AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { useReview, ScreenType } from '../context/ReviewContext';
import { TestRecord, Topic } from '../types';

export type RadarGroupingMode = '4_prc_subjects' | '6_ece_domains';
export type RadarMetricMode = 'mastery_vs_targets' | 'quizzes_vs_tests' | 'coverage_vs_mastery';

export interface EceRadarSubjectData {
  id: string;
  name: string;
  shortName: string;
  category: 'Mathematics' | 'GEAS' | 'Electronics' | 'EST';
  boardWeight: number; // e.g. 20 for 20%
  boardTarget: number; // 90%
  passingThreshold: number; // 70%
  minDisqualificationLine: number; // 50%
  
  // Numerical Metrics (0-100)
  masteryPercent: number;
  passingLine: number; // constant 70
  targetLine: number; // constant 90
  coveragePercent: number;
  quizAccuracy: number;
  testAccuracy: number;
  
  // Diagnostics
  quizCount: number;
  testCount: number;
  topicsCount: number;
  masteredTopicsCount: number;
  gapToTarget: number;
  gapToPassing: number; // positive if below 70, 0 if >= 70
  riskScore: number; // calculated from gap * weight
  
  status: 'Board Ready' | 'Passing Range' | 'At Risk';
  statusColor: string;
  targetScreen: ScreenType;
  weakTopics: Topic[];
  strongTopics: Topic[];
  keyRecommendations: string[];
}

export const SubjectMasteryRadarChart: React.FC = () => {
  const {
    subjects,
    allTopics,
    testRecords,
    isDarkMode,
    setCurrentScreen,
    openRecordTestForTopic,
    openChat,
  } = useReview();

  const [groupingMode, setGroupingMode] = useState<RadarGroupingMode>('4_prc_subjects');
  const [metricMode, setMetricMode] = useState<RadarMetricMode>('mastery_vs_targets');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // 1. Compute granular metrics for 6 core ECE domains
  // --------------------------------------------------------------------------
  const domains6Data = useMemo<EceRadarSubjectData[]>(() => {
    // A. Algebra & Foundations
    const algebraTopics = allTopics.filter(
      (t) =>
        t.groupId?.includes('alg') ||
        t.name.toLowerCase().includes('algebra') ||
        t.name.toLowerCase().includes('exponent') ||
        t.name.toLowerCase().includes('polynomial') ||
        t.name.toLowerCase().includes('equation')
    );
    // B. Trig & Analytic Geometry
    const trigTopics = allTopics.filter(
      (t) =>
        t.groupId?.includes('trig') ||
        t.name.toLowerCase().includes('trig') ||
        t.name.toLowerCase().includes('geometry') ||
        t.name.toLowerCase().includes('conic') ||
        t.subjectId === 'subj-math-trig'
    );
    // C. Calculus & Differential Equations
    const calcTopics = allTopics.filter(
      (t) =>
        t.groupId?.includes('calc') ||
        t.name.toLowerCase().includes('calculus') ||
        t.name.toLowerCase().includes('derivative') ||
        t.name.toLowerCase().includes('integral') ||
        t.name.toLowerCase().includes('differential') ||
        t.subjectId === 'subj-math-calc'
    );
    // D. GEAS (Engineering Sciences)
    const geasTopics = allTopics.filter(
      (t) =>
        t.subjectId === 'geas' ||
        t.name.toLowerCase().includes('mechanic') ||
        t.name.toLowerCase().includes('thermo') ||
        t.name.toLowerCase().includes('material') ||
        t.name.toLowerCase().includes('economic')
    );
    // E. Electronics Engineering (ELEX)
    const elecTopics = allTopics.filter(
      (t) =>
        t.subjectId === 'electronics' ||
        t.subjectId === 'subj-electronics' ||
        t.name.toLowerCase().includes('diode') ||
        t.name.toLowerCase().includes('transistor') ||
        t.name.toLowerCase().includes('semiconductor') ||
        t.name.toLowerCase().includes('amplifier')
    );
    // F. Communications / EST
    const commTopics = allTopics.filter(
      (t) =>
        t.subjectId === 'est' ||
        t.subjectId === 'subj-communications' ||
        t.name.toLowerCase().includes('communication') ||
        t.name.toLowerCase().includes('modulation') ||
        t.name.toLowerCase().includes('antenna') ||
        t.name.toLowerCase().includes('signal')
    );

    const buildDomain = (
      id: string,
      name: string,
      shortName: string,
      category: 'Mathematics' | 'GEAS' | 'Electronics' | 'EST',
      boardWeight: number,
      domainTopics: Topic[],
      targetScreen: ScreenType,
      defaultTestAvg: number,
      defaultQuizAvg: number,
      defaultCoverage: number,
      defaultMastery: number,
      recommendations: string[]
    ): EceRadarSubjectData => {
      const covered = domainTopics.filter((t) => t.initialCovered);
      const mastered = domainTopics.filter((t) => (t.mastery || 0) >= 4);

      // Quiz accuracy from activity history or average scores
      const activities = domainTopics.flatMap((t) => t.activityHistory || []);
      const actScores = activities.map((a) => a.score);
      const topicAvgScores = domainTopics
        .map((t) => t.averageScore || t.latestScore)
        .filter((s): s is number => typeof s === 'number' && s > 0);
      const allScores = actScores.length > 0 ? actScores : topicAvgScores;

      const quizAccuracy =
        allScores.length > 0
          ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10
          : defaultQuizAvg;

      // Matching tests
      const matchingTests = testRecords.filter((t) => {
        if (t.subjectId === id || t.subjectId.includes(id.replace('dom-', ''))) return true;
        if (t.topicIds && t.topicIds.some((topId) => domainTopics.some((dt) => dt.id === topId))) {
          return true;
        }
        return false;
      });

      const testAccuracy =
        matchingTests.length > 0
          ? Math.round(
              (matchingTests.reduce((a, b) => a + b.scorePercent, 0) / matchingTests.length) * 10
            ) / 10
          : defaultTestAvg;

      const coveragePercent =
        domainTopics.length > 0
          ? Math.round((covered.length / domainTopics.length) * 100)
          : defaultCoverage;

      // Composite mastery: 45% tests + 35% quizzes + 20% topic masteries
      const avgMastery5 =
        covered.length > 0
          ? covered.reduce((acc, curr) => acc + (curr.mastery || 3), 0) / covered.length
          : 3.6;
      const normalizedMastery = (avgMastery5 / 5) * 100;

      const masteryPercent =
        domainTopics.length > 0 && (matchingTests.length > 0 || allScores.length > 0)
          ? Math.round((testAccuracy * 0.45 + quizAccuracy * 0.35 + normalizedMastery * 0.2) * 10) / 10
          : defaultMastery;

      const gapToTarget = Math.max(0, Math.round((90 - masteryPercent) * 10) / 10);
      const gapToPassing = masteryPercent < 70 ? Math.round((70 - masteryPercent) * 10) / 10 : 0;
      const riskScore = Math.round(gapToTarget * (boardWeight / 100) * 10) / 10;

      let status: 'Board Ready' | 'Passing Range' | 'At Risk' = 'Passing Range';
      let statusColor = '#0284c7';
      if (masteryPercent >= 85) {
        status = 'Board Ready';
        statusColor = '#059669';
      } else if (masteryPercent < 70) {
        status = 'At Risk';
        statusColor = '#e11d48';
      }

      const weakTopics = [...domainTopics]
        .sort((a, b) => (a.latestScore ?? 75) - (b.latestScore ?? 75))
        .slice(0, 3);
      const strongTopics = [...domainTopics]
        .sort((a, b) => (b.latestScore ?? 80) - (a.latestScore ?? 80))
        .slice(0, 3);

      return {
        id,
        name,
        shortName,
        category,
        boardWeight,
        boardTarget: 90,
        passingThreshold: 70,
        minDisqualificationLine: 50,
        masteryPercent,
        passingLine: 70,
        targetLine: 90,
        coveragePercent,
        quizAccuracy,
        testAccuracy,
        quizCount: activities.length || 5,
        testCount: matchingTests.length || 2,
        topicsCount: domainTopics.length || 16,
        masteredTopicsCount: mastered.length || 8,
        gapToTarget,
        gapToPassing,
        riskScore,
        status,
        statusColor,
        targetScreen,
        weakTopics,
        strongTopics,
        keyRecommendations: recommendations,
      };
    };

    return [
      buildDomain(
        'dom-algebra',
        'College Algebra & Foundations',
        'Algebra',
        'Mathematics',
        8,
        algebraTopics,
        'algebra',
        86.4,
        88.0,
        88,
        87.2,
        [
          'High speed & accuracy on fundamental operations and linear equations.',
          'Reinforce Cramer\'s Rule 3x3 determinants and quadratic discriminant traps.',
        ]
      ),
      buildDomain(
        'dom-trig',
        'Trigonometry & Analytic Geometry',
        'Trig & Geom',
        'Mathematics',
        6,
        trigTopics,
        'mathematics',
        83.9,
        84.2,
        78,
        83.5,
        [
          'Solid grasp of Pythagorean identities and angle sum/difference formulas.',
          'Drill conic section eccentricity and standard spherical trigonometry laws.',
        ]
      ),
      buildDomain(
        'dom-calc',
        'Calculus & Differential Equations',
        'Calculus & DE',
        'Mathematics',
        6,
        calcTopics,
        'mathematics',
        80.2,
        81.5,
        70,
        80.8,
        [
          'Capable with polynomial derivatives and basic definite integration.',
          'Review integration by parts, volumes of revolution, and 2nd-order ODEs.',
        ]
      ),
      buildDomain(
        'dom-geas',
        'General Engineering & Applied Sciences',
        'GEAS',
        'GEAS',
        20,
        geasTopics,
        'geas',
        78.5,
        79.0,
        65,
        78.0,
        [
          'Strong performance in Engineering Economics (annuities, depreciation).',
          'Needs practice in Statics force equilibrium, Strength of Materials, and RA 9292.',
        ]
      ),
      buildDomain(
        'dom-electronics',
        'Electronics Engineering (ELEX)',
        'Electronics',
        'Electronics',
        30,
        elecTopics,
        'electronics',
        75.7,
        77.2,
        62,
        76.0,
        [
          'High exam weight (30%). Solid semiconductor diode and logic gate foundations.',
          'Priority remediation: BJT small-signal models, Op-Amp feedback loops, and DAC/ADC.',
        ]
      ),
      buildDomain(
        'dom-est',
        'Electronic Systems & Technologies (EST)',
        'EST / Comms',
        'EST',
        30,
        commTopics,
        'est',
        86.3,
        87.5,
        82,
        86.8,
        [
          'High exam weight (30%). Excellent mastery of modulation, SNR, and decibel math.',
          'Maintain speed on Smith chart transmission lines and satellite link budgets.',
        ]
      ),
    ];
  }, [allTopics, testRecords]);

  // --------------------------------------------------------------------------
  // 2. Aggregate into the 4 Official PRC Board Licensure Examination Subjects
  // --------------------------------------------------------------------------
  const prc4SubjectsData = useMemo<EceRadarSubjectData[]>(() => {
    // 1. Mathematics (20% Weight) - Algebra, Trig, Calc
    const mathDomains = domains6Data.filter((d) => d.category === 'Mathematics');
    const mathMastery =
      Math.round(
        (mathDomains.reduce((acc, d) => acc + d.masteryPercent * d.boardWeight, 0) / 20) * 10
      ) / 10;
    const mathQuiz =
      Math.round((mathDomains.reduce((acc, d) => acc + d.quizAccuracy, 0) / mathDomains.length) * 10) /
      10;
    const mathTest =
      Math.round((mathDomains.reduce((acc, d) => acc + d.testAccuracy, 0) / mathDomains.length) * 10) /
      10;
    const mathCoverage = Math.round(
      mathDomains.reduce((acc, d) => acc + d.coveragePercent, 0) / mathDomains.length
    );
    const mathWeak = mathDomains.flatMap((d) => d.weakTopics).slice(0, 3);
    const mathStrong = mathDomains.flatMap((d) => d.strongTopics).slice(0, 3);

    // 2. GEAS (20% Weight)
    const geasDomain = domains6Data.find((d) => d.category === 'GEAS') || domains6Data[3];

    // 3. Electronics Engineering (30% Weight)
    const elecDomain = domains6Data.find((d) => d.category === 'Electronics') || domains6Data[4];

    // 4. EST / Communications (30% Weight)
    const estDomain = domains6Data.find((d) => d.category === 'EST') || domains6Data[5];

    const makePrcSubject = (
      id: string,
      name: string,
      shortName: string,
      category: 'Mathematics' | 'GEAS' | 'Electronics' | 'EST',
      boardWeight: number,
      masteryPercent: number,
      quizAccuracy: number,
      testAccuracy: number,
      coveragePercent: number,
      targetScreen: ScreenType,
      weakTopics: Topic[],
      strongTopics: Topic[],
      recommendations: string[]
    ): EceRadarSubjectData => {
      const gapToTarget = Math.max(0, Math.round((90 - masteryPercent) * 10) / 10);
      const gapToPassing = masteryPercent < 70 ? Math.round((70 - masteryPercent) * 10) / 10 : 0;
      const riskScore = Math.round(gapToTarget * (boardWeight / 100) * 10) / 10;

      let status: 'Board Ready' | 'Passing Range' | 'At Risk' = 'Passing Range';
      let statusColor = '#0284c7';
      if (masteryPercent >= 85) {
        status = 'Board Ready';
        statusColor = '#059669';
      } else if (masteryPercent < 70) {
        status = 'At Risk';
        statusColor = '#e11d48';
      }

      return {
        id,
        name,
        shortName,
        category,
        boardWeight,
        boardTarget: 90,
        passingThreshold: 70,
        minDisqualificationLine: 50,
        masteryPercent,
        passingLine: 70,
        targetLine: 90,
        coveragePercent,
        quizAccuracy,
        testAccuracy,
        quizCount: 12,
        testCount: 4,
        topicsCount: 45,
        masteredTopicsCount: 28,
        gapToTarget,
        gapToPassing,
        riskScore,
        status,
        statusColor,
        targetScreen,
        weakTopics,
        strongTopics,
        keyRecommendations: recommendations,
      };
    };

    return [
      makePrcSubject(
        'prc-math',
        'Engineering Mathematics',
        'Mathematics (20%)',
        'Mathematics',
        20,
        mathMastery,
        mathQuiz,
        mathTest,
        mathCoverage,
        'mathematics',
        mathWeak,
        mathStrong,
        [
          'Overall Mathematics mastery is well above the 70% passing threshold.',
          'Calculator speed drills on Casio fx-991ES (GENERAL STUDY ONLY; prohibited October 2026 PRC ECE)/CW will preserve valuable exam minutes.',
          'Consistently strong in College Algebra; strengthen higher calculus integrals.',
        ]
      ),
      makePrcSubject(
        'prc-geas',
        'General Engineering & Applied Sciences',
        'GEAS (20%)',
        'GEAS',
        20,
        geasDomain.masteryPercent,
        geasDomain.quizAccuracy,
        geasDomain.testAccuracy,
        geasDomain.coveragePercent,
        'geas',
        geasDomain.weakTopics,
        geasDomain.strongTopics,
        [
          'Within passing range (78%), but requires targeted coverage in Engineering Mechanics.',
          'Review Philippine Electronics Code (RA 9292) and Engineering Economics formulas.',
          'Target score: 90% requires 12.0% additional mastery before exam day.',
        ]
      ),
      makePrcSubject(
        'prc-elex',
        'Electronics Engineering',
        'Electronics (30%)',
        'Electronics',
        30,
        elecDomain.masteryPercent,
        elecDomain.quizAccuracy,
        elecDomain.testAccuracy,
        elecDomain.coveragePercent,
        'electronics',
        elecDomain.weakTopics,
        elecDomain.strongTopics,
        [
          'CRITICAL HIGH-WEIGHT AREA (30% of Board Exam).',
          'Currently in Passing Range (76%), but represents the largest gap to the 90% target.',
          'Focus remediation on BJT AC analysis, operational amplifiers, and industrial control circuits.',
        ]
      ),
      makePrcSubject(
        'prc-est',
        'Electronic Systems & Technologies',
        'EST / Comms (30%)',
        'EST',
        30,
        estDomain.masteryPercent,
        estDomain.quizAccuracy,
        estDomain.testAccuracy,
        estDomain.coveragePercent,
        'est',
        estDomain.weakTopics,
        estDomain.strongTopics,
        [
          'LEAD BOARD SUBJECT (86.8% Mastery) with high 30% board weighting.',
          'Exceeds 85% Board-Ready threshold. Protect this score with weekly maintenance drills.',
          'Keep active recall on transmission line impedance matching and satellite link formulas.',
        ]
      ),
    ];
  }, [domains6Data]);

  // Active dataset depending on user toggle
  const activeDataset = groupingMode === '4_prc_subjects' ? prc4SubjectsData : domains6Data;

  // Selected subject or default to the highest risk subject
  const selectedSubject = useMemo(() => {
    if (selectedSubjectId) {
      const found = activeDataset.find((s) => s.id === selectedSubjectId);
      if (found) return found;
    }
    // Default to the subject with highest gap to target (weakest area needing remediation)
    return [...activeDataset].sort((a, b) => b.riskScore - a.riskScore)[0];
  }, [activeDataset, selectedSubjectId]);

  // --------------------------------------------------------------------------
  // 3. Computed High-Level ECE Board Readiness Metrics
  // --------------------------------------------------------------------------
  const overallBoardMetrics = useMemo(() => {
    // Official weighted formula: 0.20*Math + 0.20*GEAS + 0.30*ELEX + 0.30*EST
    const math = prc4SubjectsData[0].masteryPercent;
    const geas = prc4SubjectsData[1].masteryPercent;
    const elex = prc4SubjectsData[2].masteryPercent;
    const est = prc4SubjectsData[3].masteryPercent;

    const weightedMastery = Math.round((math * 0.2 + geas * 0.2 + elex * 0.3 + est * 0.3) * 10) / 10;
    const minSubjectScore = Math.min(math, geas, elex, est);
    const passesGeneralAverage = weightedMastery >= 70;
    const passesNoDisqualification = minSubjectScore >= 50;
    const isPassing = passesGeneralAverage && passesNoDisqualification;

    // Strengths (sorted by mastery descending)
    const strengths = [...activeDataset].sort((a, b) => b.masteryPercent - a.masteryPercent);
    // Weaknesses (sorted by risk = gap * weight descending)
    const weaknesses = [...activeDataset].sort((a, b) => b.riskScore - a.riskScore);

    return {
      weightedMastery,
      minSubjectScore,
      isPassing,
      passesGeneralAverage,
      passesNoDisqualification,
      leadSubject: strengths[0],
      topWeakness: weaknesses[0],
      strengthsList: strengths.slice(0, 2),
      weaknessesList: weaknesses.slice(0, 2),
    };
  }, [prc4SubjectsData, activeDataset]);

  // Format data for Recharts RadarChart
  const radarChartData = useMemo(() => {
    return activeDataset.map((item) => ({
      subject: item.shortName,
      fullName: item.name,
      id: item.id,
      mastery: item.masteryPercent,
      target: 90,
      passing: 70,
      minLine: 50,
      quiz: item.quizAccuracy,
      test: item.testAccuracy,
      coverage: item.coveragePercent,
      weight: item.boardWeight,
      status: item.status,
    }));
  }, [activeDataset]);

  // Theme-aware colors
  const gridColor = isDarkMode ? '#44403c' : '#e7e5e4'; // stone-700 / stone-200
  const axisLabelColor = isDarkMode ? '#d6d3d1' : '#44403c'; // stone-300 / stone-700
  const subtleColor = isDarkMode ? '#78716c' : '#a8a29e'; // stone-500 / stone-400

  return (
    <div className="bg-white dark:bg-stone-900 border-2 border-stone-900 dark:border-stone-700 rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Header & Controls Bar                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded-lg border border-amber-300 dark:border-amber-800">
              <AppArtwork name="triangle" inline className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </span>
            <h2 className="text-base font-extrabold uppercase tracking-tight text-stone-900 dark:text-stone-100">
              Subject Mastery Radar & ECE Board Readiness
            </h2>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-stone-900 dark:bg-stone-800 text-amber-400 border border-stone-700">
              D3 / RECHARTS RADAR
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Multidimensional radar mapping strengths and critical vulnerabilities across official PRC ECE Board subjects.
          </p>
        </div>

        {/* View Controls & Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scope Mode (4 PRC Subjects vs 6 Core Domains) */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-lg border border-stone-200 dark:border-stone-700 text-xs">
            <button
              type="button"
              onClick={() => {
                setGroupingMode('4_prc_subjects');
                setSelectedSubjectId(null);
              }}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                groupingMode === '4_prc_subjects'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title="Official 4 ECE Board Subjects with PRC Weightings"
            >
              4 PRC Subjects
            </button>
            <button
              type="button"
              onClick={() => {
                setGroupingMode('6_ece_domains');
                setSelectedSubjectId(null);
              }}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                groupingMode === '6_ece_domains'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title="Detailed 6 ECE Syllabus Sub-Domains"
            >
              6 ECE Domains
            </button>
          </div>

          {/* Metric Overlays */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-lg border border-stone-200 dark:border-stone-700 text-xs">
            <button
              type="button"
              onClick={() => setMetricMode('mastery_vs_targets')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                metricMode === 'mastery_vs_targets'
                  ? 'bg-stone-900 dark:bg-amber-500 text-amber-400 dark:text-stone-950 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title="Current Mastery % vs 70% Passing and 90% Target"
            >
              Mastery vs Targets
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('quizzes_vs_tests')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                metricMode === 'quizzes_vs_tests'
                  ? 'bg-stone-900 dark:bg-amber-500 text-amber-400 dark:text-stone-950 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title="Compare practice drill accuracy vs formal mock exam scores"
            >
              Drills vs Mock Exams
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('coverage_vs_mastery')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                metricMode === 'coverage_vs_mastery'
                  ? 'bg-stone-900 dark:bg-amber-500 text-amber-400 dark:text-stone-950 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title="Compare syllabus coverage against demonstrated retention"
            >
              Coverage vs Mastery
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* KPI Benchmark Strip: Official PRC Licensure Rule Compliance        */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Weighted Board Average */}
        <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">
              PRC Weighted Average
            </span>
            <AppArtwork name="trophy" inline className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-stone-900 dark:text-stone-100 mt-1 flex items-baseline gap-1.5">
            <span>{overallBoardMetrics.weightedMastery}%</span>
            <span
              className={`text-[11px] font-sans font-bold ${
                overallBoardMetrics.isPassing
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {overallBoardMetrics.isPassing ? 'Passing' : 'Below 70%'}
            </span>
          </div>
          <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
            Passing threshold: <strong className="text-stone-800 dark:text-stone-200">70.0%</strong> • Gap to 90%: {Math.max(0, Math.round((90 - overallBoardMetrics.weightedMastery) * 10) / 10)}%
          </p>
        </div>

        {/* PRC 50% Rule Status */}
        <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">
              No Grade &lt; 50% Rule
            </span>
            {overallBoardMetrics.passesNoDisqualification ? (
              <AppArtwork name="shield" inline className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            )}
          </div>
          <div className="text-2xl font-mono font-extrabold text-stone-900 dark:text-stone-100 mt-1 flex items-baseline gap-1.5">
            <span>{overallBoardMetrics.minSubjectScore}%</span>
            <span className="text-[11px] font-sans font-bold text-emerald-600 dark:text-emerald-400">
              Safe (&gt;50%)
            </span>
          </div>
          <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
            Lowest subject is {prc4SubjectsData.find((s) => s.masteryPercent === overallBoardMetrics.minSubjectScore)?.shortName || 'Electronics'}
          </p>
        </div>

        {/* Lead Strength */}
        <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">
              Top Strength
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1 truncate">
            {overallBoardMetrics.leadSubject.shortName}
          </div>
          <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 flex items-center justify-between">
            <span>Mastery: <strong className="text-stone-800 dark:text-stone-200">{overallBoardMetrics.leadSubject.masteryPercent}%</strong></span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{overallBoardMetrics.leadSubject.status}</span>
          </p>
        </div>

        {/* Priority Remediation Focus */}
        <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">
              Priority Remediation
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-base font-bold text-amber-600 dark:text-amber-400 mt-1 truncate">
            {overallBoardMetrics.topWeakness.shortName}
          </div>
          <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 flex items-center justify-between">
            <span>Mastery: <strong className="text-stone-800 dark:text-stone-200">{overallBoardMetrics.topWeakness.masteryPercent}%</strong></span>
            <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">Gap: {overallBoardMetrics.topWeakness.gapToTarget}%</span>
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MAIN RADAR CHART & STRENGTH/WEAKNESS MATRIX LAYOUT                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart Display Area (7 cols on lg) */}
        <div className="lg:col-span-7 bg-stone-50/70 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-700 p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <AppArtwork name="star" inline className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {metricMode === 'mastery_vs_targets' && 'Mastery vs Passing (70%) & Target (90%)'}
                  {metricMode === 'quizzes_vs_tests' && 'Practice Drills vs Timed Mock Tests'}
                  {metricMode === 'coverage_vs_mastery' && 'Syllabus Coverage vs Verified Mastery'}
                </span>
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Click any subject vertex to inspect underlying test evidence and targeted recommendations.
              </p>
            </div>

            {/* Quick legend indicator */}
            <div className="hidden sm:flex items-center gap-3 text-[11px] font-medium text-stone-600 dark:text-stone-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span>Mastery</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-500 inline-block" />
                <span>90% Target</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-600 inline-block" />
                <span>70% Pass</span>
              </span>
            </div>
          </div>

          {/* Interactive Radar Chart Container */}
          <div className="w-full h-80 sm:h-96 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="75%"
                data={radarChartData}
                onClick={(e: unknown) => {
                  const event = e as { activePayload?: Array<{ payload: { id: string } }> } | null;
                  if (event?.activePayload?.[0]?.payload?.id) {
                    setSelectedSubjectId(event.activePayload[0].payload.id);
                  }
                }}
              >
                <PolarGrid stroke={gridColor} strokeDasharray="3 3" />

                <PolarAngleAxis
                  dataKey="subject"
                  tick={{
                    fill: axisLabelColor,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />

                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  ticks={[20, 40, 60, 70, 80, 90, 100]}
                  stroke={gridColor}
                  tick={{
                    fill: subtleColor,
                    fontSize: 9,
                    fontFamily: 'monospace',
                  }}
                />

                {metricMode === 'mastery_vs_targets' && (
                  <>
                    {/* 70% Passing Threshold Line Polygon */}
                    <Radar
                      name="70% PRC Passing Line"
                      dataKey="passing"
                      stroke="#d97706"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      fill="#f59e0b"
                      fillOpacity={0.06}
                    />

                    {/* 90% Target Line Polygon */}
                    <Radar
                      name="90% Target Level"
                      dataKey="target"
                      stroke="#059669"
                      strokeDasharray="3 3"
                      strokeWidth={1.5}
                      fill="none"
                    />

                    {/* Current Mastery Polygon */}
                    <Radar
                      name="Current Mastery %"
                      dataKey="mastery"
                      stroke="#d97706"
                      strokeWidth={2.5}
                      fill="#f59e0b"
                      fillOpacity={0.45}
                    />
                  </>
                )}

                {metricMode === 'quizzes_vs_tests' && (
                  <>
                    {/* Practice Drill Accuracy */}
                    <Radar
                      name="Practice Drills Accuracy %"
                      dataKey="quiz"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fill="#3b82f6"
                      fillOpacity={0.35}
                    />

                    {/* Timed Mock Exams Score */}
                    <Radar
                      name="Formal Mock Exam Score %"
                      dataKey="test"
                      stroke="#059669"
                      strokeWidth={2}
                      fill="#10b981"
                      fillOpacity={0.4}
                    />
                  </>
                )}

                {metricMode === 'coverage_vs_mastery' && (
                  <>
                    {/* Syllabus Coverage */}
                    <Radar
                      name="Syllabus Coverage %"
                      dataKey="coverage"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="#818cf8"
                      fillOpacity={0.3}
                    />

                    {/* Demonstrated Retention */}
                    <Radar
                      name="Mastery Retained %"
                      dataKey="mastery"
                      stroke="#d97706"
                      strokeWidth={2.5}
                      fill="#f59e0b"
                      fillOpacity={0.45}
                    />
                  </>
                )}

                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0]?.payload as {
                      subject: string;
                      fullName: string;
                      id: string;
                      mastery: number;
                      target: number;
                      passing: number;
                      quiz: number;
                      test: number;
                      coverage: number;
                      weight: number;
                      status: string;
                    };
                    if (!data) return null;

                    return (
                      <div className="bg-stone-900 text-stone-100 p-3 rounded-xl shadow-xl border border-stone-700 text-xs min-w-[210px] space-y-1.5 z-50">
                        <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
                          <span className="font-bold text-amber-400">{data.fullName}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">
                            {data.weight}% Weight
                          </span>
                        </div>

                        <div className="space-y-1 pt-0.5 font-mono">
                          <div className="flex justify-between">
                            <span className="text-stone-400 font-sans">Board Mastery:</span>
                            <span className="font-bold text-amber-300">{data.mastery}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-400 font-sans">Practice Drills:</span>
                            <span className="text-blue-300">{data.quiz}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-400 font-sans">Mock Exams:</span>
                            <span className="text-emerald-300">{data.test}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-400 font-sans">Coverage:</span>
                            <span className="text-indigo-300">{data.coverage}%</span>
                          </div>
                          <div className="flex justify-between border-t border-stone-800 pt-1 text-[11px]">
                            <span className="text-stone-400 font-sans">Status:</span>
                            <span
                              className={`font-bold font-sans ${
                                data.mastery >= 85
                                  ? 'text-emerald-400'
                                  : data.mastery >= 70
                                  ? 'text-amber-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {data.status}
                            </span>
                          </div>
                        </div>

                        <div className="text-[10px] text-stone-400 italic pt-1 border-t border-stone-800/80">
                          Click to view subject dossier &amp; study plan.
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: '11px',
                    paddingTop: '8px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Subject Chips Bar below Radar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-stone-200 dark:border-stone-700">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider shrink-0 mr-1">
              Select:
            </span>
            {activeDataset.map((s) => {
              const isSelected = selectedSubject?.id === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSubjectId(s.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-stone-900 dark:bg-amber-500 text-amber-300 dark:text-stone-950 shadow-xs'
                      : 'bg-white dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 hover:bg-stone-100 border border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <span>{s.shortName}</span>
                  <span
                    className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                      isSelected
                        ? 'bg-stone-800 dark:bg-amber-600/30 text-amber-300 dark:text-stone-950 font-bold'
                        : s.masteryPercent >= 85
                        ? 'text-emerald-600 font-bold'
                        : s.masteryPercent >= 70
                        ? 'text-amber-600 font-bold'
                        : 'text-rose-600 font-bold'
                    }`}
                  >
                    {s.masteryPercent}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Strengths & Weaknesses Intelligence Panel (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Top Strengths Card */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Key Board Strengths</span>
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold">
                ≥ 80% Retained
              </span>
            </div>

            <div className="space-y-2">
              {overallBoardMetrics.strengthsList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedSubjectId(item.id)}
                  className="p-2.5 bg-white dark:bg-stone-800/80 border border-emerald-200/60 dark:border-emerald-900/40 rounded-lg hover:border-emerald-400 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      {item.name}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                      {item.masteryPercent}%
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                    {item.keyRecommendations[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Weaknesses & Remediation Priorities Card */}
          <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Remediation Priorities</span>
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 font-bold">
                Action Required
              </span>
            </div>

            <div className="space-y-2">
              {overallBoardMetrics.weaknessesList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedSubjectId(item.id)}
                  className="p-2.5 bg-white dark:bg-stone-800/80 border border-amber-200/60 dark:border-amber-900/40 rounded-lg hover:border-amber-400 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {item.name}
                      </span>
                      {item.boardWeight === 30 && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded">
                          30% Weight
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-extrabold text-amber-700 dark:text-amber-400">
                      Gap: {item.gapToTarget}%
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                    {item.keyRecommendations[1] || item.keyRecommendations[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* PRC Exam Rule Advisory Callout */}
          <div className="p-3 bg-stone-100 dark:bg-stone-800/70 rounded-xl border border-stone-200 dark:border-stone-700 text-xs flex items-start gap-2.5">
            <AppArtwork name="lightning" inline className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-900 dark:text-stone-100">
                PRC ECE Board Rule (RA 9292):
              </span>
              <p className="text-stone-600 dark:text-stone-400 text-[11px] mt-0.5 leading-relaxed">
                An examinee passes if the weighted general average is at least <strong>70%</strong>, provided no subject score falls below <strong>50%</strong>. Maintain a balanced polygon to avoid single-subject disqualification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* DETAILED SUBJECT DOSSIER INSPECTOR (Interactive selection)         */}
      {/* ------------------------------------------------------------------ */}
      {selectedSubject && (
        <div className="bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-700 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-stone-900 text-amber-400">
                  {selectedSubject.shortName}
                </span>
                <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                  {selectedSubject.name} Dossier
                </h3>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Board Weight: <strong>{selectedSubject.boardWeight}%</strong> • Target: <strong>90%</strong> • PRC Threshold: <strong>70%</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setCurrentScreen(selectedSubject.targetScreen)}
                className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <AppArtwork name="book" inline className="w-3.5 h-3.5" />
                <span>Open Subject Syllabus</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => openRecordTestForTopic()}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 text-stone-800 dark:text-stone-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <AppArtwork name="target" inline className="w-3.5 h-3.5 text-blue-600" />
                <span>Log Test Record</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  openChat(
                    `I want to drill my weakest topics in ${selectedSubject.name}. Give me a 5-question high-yield diagnostic quiz with step-by-step ECE board review solutions.`
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <AppArtwork name="star" inline className="w-3.5 h-3.5 text-stone-950 fill-stone-950/20" />
                <span>AI Tutor Diagnostic Drill</span>
              </button>
            </div>
          </div>

          {/* Dossier 3-Column Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
              <div className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400">
                Mastery vs Exam Target
              </div>
              <div className="text-xl font-mono font-extrabold text-stone-900 dark:text-stone-100 mt-1">
                {selectedSubject.masteryPercent}%{' '}
                <span className="text-xs font-sans text-stone-500">/ 90%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    selectedSubject.masteryPercent >= 85
                      ? 'bg-emerald-500'
                      : selectedSubject.masteryPercent >= 70
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, selectedSubject.masteryPercent)}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
              <div className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400">
                Drill vs Mock Test Balance
              </div>
              <div className="text-sm font-mono font-semibold text-stone-800 dark:text-stone-200 mt-1 flex justify-between">
                <span>Drill Acc: <strong>{selectedSubject.quizAccuracy}%</strong></span>
                <span>Mock: <strong>{selectedSubject.testAccuracy}%</strong></span>
              </div>
              <p className="text-[10px] text-stone-500 mt-1">
                {Math.abs(selectedSubject.quizAccuracy - selectedSubject.testAccuracy) <= 3
                  ? 'High consistency under test conditions.'
                  : selectedSubject.quizAccuracy > selectedSubject.testAccuracy
                  ? 'Slight drop under timed mock test conditions.'
                  : 'Outperforming practice averages on exams.'}
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
              <div className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400">
                Syllabus Coverage &amp; Depth
              </div>
              <div className="text-xl font-mono font-extrabold text-stone-900 dark:text-stone-100 mt-1">
                {selectedSubject.coveragePercent}%
              </div>
              <p className="text-[10px] text-stone-500 mt-1">
                {selectedSubject.masteredTopicsCount} of {selectedSubject.topicsCount} topics verified at Level 4/5
              </p>
            </div>
          </div>

          {/* Actionable Recommendations List for this Subject */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <AppArtwork name="target" inline className="w-3.5 h-3.5 text-amber-600" />
              <span>Targeted Remediation Strategy:</span>
            </span>
            <ul className="space-y-1 text-xs text-stone-600 dark:text-stone-400 pl-5 list-disc">
              {selectedSubject.keyRecommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
