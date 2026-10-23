import { AppArtwork } from './common/AppArtwork';
import React, { useState, useMemo } from 'react';
import { useReview } from '../context/ReviewContext';
import { Subject, Topic, TestRecord } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  Cell,
} from 'recharts';
import { CheckCircle2 } from 'lucide-react';

export type TimelineRangePreset = '7_days' | '14_days' | '30_days' | 'all';
export type TimelineUnit = 'minutes' | 'hours';
export type TimelineGrouping = 'categories' | 'subjects';
export type TimelineSourceFilter = 'all' | 'drills' | 'tests';

export interface TimelineDayTopicItem {
  id: string;
  topicName: string;
  subjectName: string;
  category: string;
  minutes: number;
  score: number | null;
  type: string;
  questionsAttempted: number;
  questionsCorrect: number;
}

export interface TimelineDayTestItem {
  id: string;
  testName: string;
  subjectName: string;
  category: string;
  minutes: number;
  scorePercent: number;
  questions: number;
  correct: number;
}

export interface TimelineDayPoint {
  date: string; // YYYY-MM-DD
  displayDate: string; // e.g. "Sep 6"
  fullDisplayDate: string; // e.g. "Sunday, Sep 6, 2026"
  dayOfWeek: string; // e.g. "Sun"
  isToday: boolean;
  totalMinutes: number;
  totalHours: number;
  // Category breakdown in minutes
  mathematicsMinutes: number;
  electronicsMinutes: number;
  communicationsMinutes: number;
  geasMinutes: number;
  // Category breakdown in display unit
  mathematics: number;
  electronics: number;
  communications: number;
  geas: number;
  // Subject breakdown in display unit (for 'subjects' grouping)
  algebra: number;
  trigonometry: number;
  calculus: number;
  electronicsSubj: number;
  communicationsSubj: number;
  // Activity counts and itemized lists
  activitiesCount: number;
  testsCount: number;
  reviewedTopics: TimelineDayTopicItem[];
  mockTests: TimelineDayTestItem[];
}

export const StudyTimeline: React.FC = () => {
  const {
    subjects,
    allTopics,
    testRecords,
    currentDateStr,
    dailyTarget,
    isDarkMode,
    setCurrentScreen,
    setSelectedSubjectId,
    openTopicDrawer,
    startReview,
    openRecordTestForTopic,
  } = useReview();

  // Control state
  const [rangePreset, setRangePreset] = useState<TimelineRangePreset>('14_days');
  const [unit, setUnit] = useState<TimelineUnit>('minutes');
  const [grouping, setGrouping] = useState<TimelineGrouping>('categories');
  const [sourceFilter, setSourceFilter] = useState<TimelineSourceFilter>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Helper date parsing/formatting functions
  const parseDateStr = (dStr: string) => {
    const parts = dStr.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  };

  const formatDateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Find date range boundaries
  const { startDateStr, endDateStr, datesList } = useMemo(() => {
    const end = currentDateStr;
    const endDateObj = parseDateStr(end);

    // Collect all unique activity & test dates to determine earliest date
    const allActivityDates: string[] = [];
    allTopics.forEach((t) => {
      (t.activityHistory || []).forEach((act) => {
        if (act.date) allActivityDates.push(act.date);
      });
    });
    testRecords.forEach((test) => {
      if (test.date) allActivityDates.push(test.date);
    });
    allActivityDates.sort();

    const earliestDate = allActivityDates.length > 0 ? allActivityDates[0] : '2026-08-25';

    let daysCount = 14;
    if (rangePreset === '7_days') daysCount = 7;
    else if (rangePreset === '14_days') daysCount = 14;
    else if (rangePreset === '30_days') daysCount = 30;

    let start = '';
    if (rangePreset === 'all') {
      start = earliestDate;
    } else {
      const startDateObj = new Date(endDateObj.getTime() - (daysCount - 1) * 24 * 60 * 60 * 1000);
      start = formatDateStr(startDateObj);
    }

    // Generate chronological dates
    const dates: string[] = [];
    const curr = parseDateStr(start);
    const endLimit = parseDateStr(end);

    while (curr <= endLimit) {
      dates.push(formatDateStr(curr));
      curr.setDate(curr.getDate() + 1);
    }

    return {
      startDateStr: start,
      endDateStr: end,
      datesList: dates,
    };
  }, [currentDateStr, rangePreset, allTopics, testRecords]);

  // Aggregate daily data per date
  const timelineData = useMemo<TimelineDayPoint[]>(() => {
    // Create map for rapid subject lookup
    const subjectMap = new Map<string, Subject>();
    subjects.forEach((s) => subjectMap.set(s.id, s));

    return datesList.map((dateStr) => {
      const dObj = parseDateStr(dateStr);
      const isToday = dateStr === currentDateStr;
      const displayDate = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const fullDisplayDate = dObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const dayOfWeek = dObj.toLocaleDateString('en-US', { weekday: 'short' });

      let mathMins = 0;
      let elexMins = 0;
      let commsMins = 0;
      let geasMins = 0;

      let algMins = 0;
      let trigMins = 0;
      let calcMins = 0;
      let elexSubjMins = 0;
      let commsSubjMins = 0;

      const reviewedTopics: TimelineDayTopicItem[] = [];
      const mockTests: TimelineDayTestItem[] = [];

      // 1. Gather Topic Activity Logs (Drills & Practice)
      if (sourceFilter === 'all' || sourceFilter === 'drills') {
        allTopics.forEach((t) => {
          (t.activityHistory || []).forEach((act) => {
            if (act.date === dateStr) {
              const minutes = act.timeSpentMinutes || 0;
              const subj = subjectMap.get(t.subjectId);
              const category = subj?.category || 'Mathematics';

              // Category aggregation
              if (category === 'Mathematics') mathMins += minutes;
              else if (category === 'Electronics') elexMins += minutes;
              else if (category === 'Communications') commsMins += minutes;
              else geasMins += minutes;

              // Subject aggregation
              if (t.subjectId === 'subj-math-algebra') algMins += minutes;
              else if (t.subjectId === 'subj-math-trig') trigMins += minutes;
              else if (t.subjectId === 'subj-math-calc') calcMins += minutes;
              else if (t.subjectId === 'subj-electronics') elexSubjMins += minutes;
              else if (t.subjectId === 'subj-communications') commsSubjMins += minutes;

              reviewedTopics.push({
                id: act.id,
                topicName: t.name,
                subjectName: subj?.name || 'Mathematics',
                category,
                minutes,
                score: typeof act.score === 'number' ? act.score : null,
                type: act.type || 'Practice Drill',
                questionsAttempted: act.questionsAttempted || 0,
                questionsCorrect: act.questionsCorrect || 0,
              });
            }
          });
        });
      }

      // 2. Gather Mock Test Records
      if (sourceFilter === 'all' || sourceFilter === 'tests') {
        testRecords.forEach((test) => {
          if (test.date === dateStr) {
            const minutes = test.timeMinutes || 0;
            const subj = subjectMap.get(test.subjectId);
            let category = subj?.category;
            if (!category) {
              if (test.subjectId.includes('math') || test.testType.toLowerCase().includes('algebra') || test.testType.toLowerCase().includes('calculus')) {
                category = 'Mathematics';
              } else if (test.subjectId.includes('elex') || test.testType.toLowerCase().includes('electronics')) {
                category = 'Electronics';
              } else if (test.subjectId.includes('comm') || test.testType.toLowerCase().includes('comm')) {
                category = 'Communications';
              } else {
                category = 'Mathematics';
              }
            }

            // Category aggregation
            if (category === 'Mathematics') mathMins += minutes;
            else if (category === 'Electronics') elexMins += minutes;
            else if (category === 'Communications') commsMins += minutes;
            else geasMins += minutes;

            // Subject aggregation
            if (test.subjectId === 'subj-math-algebra' || test.testType.toLowerCase().includes('algebra')) algMins += minutes;
            else if (test.subjectId === 'subj-math-trig' || test.testType.toLowerCase().includes('trig')) trigMins += minutes;
            else if (test.subjectId === 'subj-math-calc' || test.testType.toLowerCase().includes('calculus')) calcMins += minutes;
            else if (test.subjectId === 'subj-electronics') elexSubjMins += minutes;
            else if (test.subjectId === 'subj-communications') commsSubjMins += minutes;

            mockTests.push({
              id: test.id,
              testName: test.testType,
              subjectName: subj?.name || category,
              category,
              minutes,
              scorePercent: test.scorePercent,
              questions: test.questions || 0,
              correct: test.correct || 0,
            });
          }
        });
      }

      // If today has live completed minutes in dailyTarget that exceed logged items, attribute to active focus subject
      if (isToday) {
        const loggedSum = mathMins + elexMins + commsMins + geasMins;
        const liveCompleted = dailyTarget.completedMinutesToday || 0;
        if (liveCompleted > loggedSum) {
          const delta = liveCompleted - loggedSum;
          const focusSubj = subjects.find((s) => s.isCurrentFocus) || subjects[0];
          if (focusSubj?.category === 'Electronics') elexMins += delta;
          else if (focusSubj?.category === 'Communications') commsMins += delta;
          else mathMins += delta;
        }
      }

      const totalMins = mathMins + elexMins + commsMins + geasMins;
      const totalHrs = Number((totalMins / 60).toFixed(1));

      // Unit factor
      const factor = unit === 'hours' ? 1 / 60 : 1;
      const formatVal = (mins: number) =>
        unit === 'hours' ? Number((mins / 60).toFixed(2)) : mins;

      return {
        date: dateStr,
        displayDate: isToday ? 'Today' : displayDate,
        fullDisplayDate,
        dayOfWeek,
        isToday,
        totalMinutes: totalMins,
        totalHours: totalHrs,
        mathematicsMinutes: mathMins,
        electronicsMinutes: elexMins,
        communicationsMinutes: commsMins,
        geasMinutes: geasMins,
        mathematics: formatVal(mathMins),
        electronics: formatVal(elexMins),
        communications: formatVal(commsMins),
        geas: formatVal(geasMins),
        algebra: formatVal(algMins),
        trigonometry: formatVal(trigMins),
        calculus: formatVal(calcMins),
        electronicsSubj: formatVal(elexSubjMins),
        communicationsSubj: formatVal(commsSubjMins),
        activitiesCount: reviewedTopics.length,
        testsCount: mockTests.length,
        reviewedTopics,
        mockTests,
      };
    });
  }, [datesList, currentDateStr, subjects, allTopics, testRecords, sourceFilter, dailyTarget, unit]);

  // Set default selected date if none chosen
  const activeSelectedDay = useMemo<TimelineDayPoint | null>(() => {
    if (selectedDate) {
      const found = timelineData.find((d) => d.date === selectedDate);
      if (found) return found;
    }
    // Default to the most active day in the view or today
    const withActivity = timelineData.filter((d) => d.totalMinutes > 0);
    if (withActivity.length > 0) {
      return withActivity[withActivity.length - 1]; // Latest active day
    }
    return timelineData[timelineData.length - 1] || null;
  }, [selectedDate, timelineData]);

  // Aggregate KPI summary metrics for the active range
  const rangeMetrics = useMemo(() => {
    const totalMinutes = timelineData.reduce((acc, d) => acc + d.totalMinutes, 0);
    const totalHours = Number((totalMinutes / 60).toFixed(1));

    const mathMins = timelineData.reduce((acc, d) => acc + d.mathematicsMinutes, 0);
    const elexMins = timelineData.reduce((acc, d) => acc + d.electronicsMinutes, 0);
    const commsMins = timelineData.reduce((acc, d) => acc + d.communicationsMinutes, 0);
    const geasMins = timelineData.reduce((acc, d) => acc + d.geasMinutes, 0);

    const activeDaysCount = timelineData.filter((d) => d.totalMinutes > 0).length;
    const totalDaysCount = timelineData.length;
    const consistencyPercent =
      totalDaysCount > 0 ? Math.round((activeDaysCount / totalDaysCount) * 100) : 0;

    const avgMinutesPerActiveDay =
      activeDaysCount > 0 ? Math.round(totalMinutes / activeDaysCount) : 0;
    const avgMinutesOverall = totalDaysCount > 0 ? Math.round(totalMinutes / totalDaysCount) : 0;

    // Peak day
    let peakDay: TimelineDayPoint | null = null;
    timelineData.forEach((d) => {
      if (!peakDay || d.totalMinutes > peakDay.totalMinutes) {
        peakDay = d;
      }
    });

    // Proportions
    const mathPct = totalMinutes > 0 ? Math.round((mathMins / totalMinutes) * 100) : 0;
    const elexPct = totalMinutes > 0 ? Math.round((elexMins / totalMinutes) * 100) : 0;
    const commsPct = totalMinutes > 0 ? Math.round((commsMins / totalMinutes) * 100) : 0;

    return {
      totalMinutes,
      totalHours,
      mathMins,
      elexMins,
      commsMins,
      geasMins,
      mathPct,
      elexPct,
      commsPct,
      activeDaysCount,
      totalDaysCount,
      consistencyPercent,
      avgMinutesPerActiveDay,
      avgMinutesOverall,
      peakDay,
    };
  }, [timelineData]);

  // Target reference line value in active unit
  const targetDailyValue = useMemo(() => {
    const targetMins = dailyTarget.targetMinutes || 60;
    return unit === 'hours' ? Number((targetMins / 60).toFixed(2)) : targetMins;
  }, [dailyTarget.targetMinutes, unit]);

  // Theme-aware chart colors
  const chartColors = {
    mathematics: isDarkMode ? '#64748b' : '#334155', // Slate-700
    electronics: isDarkMode ? '#fbbf24' : '#d97706', // Amber-600
    communications: isDarkMode ? '#c084fc' : '#7c3aed', // Purple-600
    geas: isDarkMode ? '#34d399' : '#059669', // Emerald-600
    // Individual subjects
    algebra: isDarkMode ? '#475569' : '#1e293b',
    trigonometry: isDarkMode ? '#64748b' : '#334155',
    calculus: isDarkMode ? '#94a3b8' : '#475569',
    electronicsSubj: isDarkMode ? '#fbbf24' : '#d97706',
    communicationsSubj: isDarkMode ? '#c084fc' : '#7c3aed',
    // System colors
    grid: isDarkMode ? '#292524' : '#f5f5f4',
    text: isDarkMode ? '#a8a29e' : '#78716c',
    axis: isDarkMode ? '#44403c' : '#e7e5e4',
  };

  // Click on a bar to select that date in inspector
  const handleBarClick = (data: any) => {
    if (data && data.date) {
      setSelectedDate(data.date);
    }
  };

  return (
    <div
      id="study-timeline-section"
      className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6 transition-colors"
    >
      {/* 1. SECTION HEADER BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-600 dark:text-amber-400">
              <AppArtwork name="calendar" inline className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span>Chronological Study Timeline</span>
            </h2>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-stone-900 dark:bg-stone-100 text-amber-400 dark:text-stone-900">
              DAILY TIME DISTRIBUTION
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-2xl">
            Visualizes cumulative daily problem-solving and diagnostic mock test hours invested across each
            ECE board exam subject category.
          </p>
        </div>

        {/* Quick Range Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 self-start lg:self-center">
          <button
            type="button"
            onClick={() => setRangePreset('7_days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              rangePreset === '7_days'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            7 Days
          </button>
          <button
            type="button"
            onClick={() => setRangePreset('14_days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              rangePreset === '14_days'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            14 Days
          </button>
          <button
            type="button"
            onClick={() => setRangePreset('30_days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              rangePreset === '30_days'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            30 Days
          </button>
          <button
            type="button"
            onClick={() => setRangePreset('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              rangePreset === 'all'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            All History
          </button>
        </div>
      </div>

      {/* 2. TIMELINE KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* KPI 1: Total Study Time */}
        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
            <span>Period Study Time</span>
            <AppArtwork name="timer" inline className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black font-mono text-stone-900 dark:text-stone-100">
              {rangeMetrics.totalHours}
            </span>
            <span className="text-xs font-semibold text-stone-500">hours</span>
          </div>
          <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400 mt-1">
            {rangeMetrics.totalMinutes} mins across {rangeMetrics.activeDaysCount} active days
          </div>
        </div>

        {/* KPI 2: Daily Consistency */}
        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
            <span>Daily Consistency</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black font-mono text-stone-900 dark:text-stone-100">
              {rangeMetrics.consistencyPercent}%
            </span>
            <span className="text-xs font-semibold text-stone-500">active</span>
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
            {rangeMetrics.activeDaysCount} of {rangeMetrics.totalDaysCount} calendar days reviewed
          </div>
        </div>

        {/* KPI 3: Daily Average */}
        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
            <span>Daily Average</span>
            <AppArtwork name="graph" inline className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black font-mono text-stone-900 dark:text-stone-100">
              {rangeMetrics.avgMinutesPerActiveDay}
            </span>
            <span className="text-xs font-semibold text-stone-500">min/day</span>
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
            Target: {dailyTarget.targetMinutes} min • {Math.round((rangeMetrics.avgMinutesPerActiveDay / (dailyTarget.targetMinutes || 60)) * 100)}% of pace
          </div>
        </div>

        {/* KPI 4: Peak Study Session */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1">
            <span>Peak Study Day</span>
            <AppArtwork name="flame" inline className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-950 dark:text-amber-200">
              {rangeMetrics.peakDay?.totalMinutes || 0}
            </span>
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">min</span>
          </div>
          <div className="text-[11px] font-mono text-amber-700 dark:text-amber-400 mt-1 truncate">
            {rangeMetrics.peakDay ? `${rangeMetrics.peakDay.displayDate} (${rangeMetrics.peakDay.dayOfWeek})` : 'No logs yet'}
          </div>
        </div>
      </div>

      {/* 3. CHART INTERACTIVE CONTROLS STRIP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Left: Legend & Category indicators */}
        <div className="flex items-center gap-3.5 flex-wrap text-xs font-medium">
          <span className="text-stone-400 dark:text-stone-500 font-semibold text-[11px] uppercase tracking-wider">
            Categories:
          </span>
          <span className="flex items-center gap-1.5 text-stone-800 dark:text-stone-200">
            <span className="w-3 h-3 rounded-xs bg-[#334155] dark:bg-[#64748b] inline-block shadow-2xs" />
            <span>Math (20%)</span>
          </span>
          <span className="flex items-center gap-1.5 text-stone-800 dark:text-stone-200">
            <span className="w-3 h-3 rounded-xs bg-[#d97706] dark:bg-[#fbbf24] inline-block shadow-2xs" />
            <span>Electronics (30%)</span>
          </span>
          <span className="flex items-center gap-1.5 text-stone-800 dark:text-stone-200">
            <span className="w-3 h-3 rounded-xs bg-[#7c3aed] dark:bg-[#c084fc] inline-block shadow-2xs" />
            <span>Communications (30%)</span>
          </span>
          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-mono text-[11px]">
            <span className="w-3 h-0.5 bg-amber-500 inline-block border-t border-dashed" />
            <span>Target Floor ({dailyTarget.targetMinutes}m)</span>
          </span>
        </div>

        {/* Right: Unit & Source Toggles */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Unit Toggle: Minutes vs Hours */}
          <div className="flex items-center p-0.5 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setUnit('minutes')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                unit === 'minutes'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Min
            </button>
            <button
              type="button"
              onClick={() => setUnit('hours')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                unit === 'hours'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Hrs
            </button>
          </div>

          {/* Grouping Toggle: Categories vs Subjects */}
          <div className="flex items-center p-0.5 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setGrouping('categories')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                grouping === 'categories'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              3 Areas
            </button>
            <button
              type="button"
              onClick={() => setGrouping('subjects')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                grouping === 'subjects'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              5 Subjects
            </button>
          </div>

          {/* Source Filter: Drills vs Mock Tests */}
          <div className="flex items-center p-0.5 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setSourceFilter('all')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                sourceFilter === 'all'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
              title="All Study Activities & Tests"
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter('drills')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                sourceFilter === 'drills'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
              title="Practice Problems & Drills"
            >
              Drills
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter('tests')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                sourceFilter === 'tests'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
              title="Timed Mock Exams"
            >
              Mocks
            </button>
          </div>
        </div>
      </div>

      {/* 4. RECHARTS STACKED BAR CHART */}
      <div className="h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={timelineData}
            margin={{ top: 15, right: 15, left: -15, bottom: 20 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length > 0) {
                const clickedDate = state.activePayload[0].payload.date;
                setSelectedDate(clickedDate);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
            <XAxis
              dataKey="displayDate"
              tick={{ fill: chartColors.text, fontSize: 11, fontWeight: 500 }}
              tickLine={false}
              axisLine={{ stroke: chartColors.axis }}
              dy={8}
            />
            <YAxis
              tick={{ fill: chartColors.text, fontSize: 10, fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={{ stroke: chartColors.axis }}
              unit={unit === 'hours' ? 'h' : 'm'}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data: TimelineDayPoint = payload[0].payload;
                  const isSelected = activeSelectedDay?.date === data.date;
                  return (
                    <div className="bg-stone-900 text-stone-100 p-3.5 rounded-xl shadow-xl border border-stone-700 text-xs space-y-2 min-w-[240px]">
                      <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
                        <div>
                          <div className="font-bold text-white text-sm">{data.fullDisplayDate}</div>
                          <div className="text-[10px] text-amber-400 font-mono">
                            {data.isToday ? 'Today (Active Session)' : `${data.dayOfWeek} Review`}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-black font-mono text-white">
                            {data.totalMinutes} min
                          </span>
                          <div className="text-[10px] text-stone-400">
                            ({data.totalHours} hrs)
                          </div>
                        </div>
                      </div>

                      {/* Stacked Breakdown */}
                      <div className="space-y-1 font-mono text-[11px]">
                        <div className="flex justify-between items-center text-slate-300">
                          <span className="flex items-center gap-1.5 font-sans">
                            <span className="w-2.5 h-2.5 rounded-xs bg-[#334155] inline-block border border-slate-500" />
                            Mathematics:
                          </span>
                          <span className="font-bold">
                            {data.mathematicsMinutes}m{' '}
                            {data.totalMinutes > 0 && (
                              <span className="text-stone-400 font-normal">
                                ({Math.round((data.mathematicsMinutes / data.totalMinutes) * 100)}%)
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-amber-300">
                          <span className="flex items-center gap-1.5 font-sans">
                            <span className="w-2.5 h-2.5 rounded-xs bg-[#d97706] inline-block" />
                            Electronics:
                          </span>
                          <span className="font-bold">
                            {data.electronicsMinutes}m{' '}
                            {data.totalMinutes > 0 && (
                              <span className="text-stone-400 font-normal">
                                ({Math.round((data.electronicsMinutes / data.totalMinutes) * 100)}%)
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-purple-300">
                          <span className="flex items-center gap-1.5 font-sans">
                            <span className="w-2.5 h-2.5 rounded-xs bg-[#7c3aed] inline-block" />
                            Communications:
                          </span>
                          <span className="font-bold">
                            {data.communicationsMinutes}m{' '}
                            {data.totalMinutes > 0 && (
                              <span className="text-stone-400 font-normal">
                                ({Math.round((data.communicationsMinutes / data.totalMinutes) * 100)}%)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Activities summary */}
                      <div className="pt-1.5 border-t border-stone-800 flex items-center justify-between text-[10px] text-stone-400">
                        <span>
                          {data.activitiesCount} topic drill(s) • {data.testsCount} mock test(s)
                        </span>
                        <span className="text-amber-400 font-sans font-bold">
                          {isSelected ? 'Inspecting' : 'Click to inspect'}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Daily Target Goal Reference Line */}
            <ReferenceLine
              y={targetDailyValue}
              stroke="#d97706"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Goal: ${dailyTarget.targetMinutes}m`,
                position: 'insideTopRight',
                fill: '#d97706',
                fontSize: 10,
                fontWeight: 700,
              }}
            />

            {grouping === 'categories' ? (
              // 3 Official Board Categories Stack
              <>
                <Bar
                  dataKey="mathematics"
                  name="Mathematics"
                  stackId="studyTime"
                  fill={chartColors.mathematics}
                  maxBarSize={38}
                />
                <Bar
                  dataKey="electronics"
                  name="Electronics"
                  stackId="studyTime"
                  fill={chartColors.electronics}
                  maxBarSize={38}
                />
                <Bar
                  dataKey="communications"
                  name="Communications"
                  stackId="studyTime"
                  fill={chartColors.communications}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={38}
                />
              </>
            ) : (
              // 5 Individual Subjects Stack
              <>
                <Bar
                  dataKey="algebra"
                  name="Algebra"
                  stackId="studyTime"
                  fill={chartColors.algebra}
                  maxBarSize={38}
                />
                <Bar
                  dataKey="trigonometry"
                  name="Trigonometry"
                  stackId="studyTime"
                  fill={chartColors.trigonometry}
                  maxBarSize={38}
                />
                <Bar
                  dataKey="calculus"
                  name="Calculus"
                  stackId="studyTime"
                  fill={chartColors.calculus}
                  maxBarSize={38}
                />
                <Bar
                  dataKey="electronicsSubj"
                  name="Electronics"
                  stackId="studyTime"
                  fill={chartColors.electronicsSubj}
                  maxBarSize={38}
                />
                <Bar
                  dataKey="communicationsSubj"
                  name="Communications"
                  stackId="studyTime"
                  fill={chartColors.communicationsSubj}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={38}
                />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 5. ACTUAL TIME BALANCE VS PRC STATUTORY WEIGHTS */}
      <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <AppArtwork name="cards" inline className="w-3.5 h-3.5 text-amber-500" />
              <span>Study Time Investment vs. PRC Board Weights</span>
            </span>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
              Identifies whether your study hours are appropriately proportional to the 20% Math / 30% Electronics / 30% Communications board weights.
            </p>
          </div>
          <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 shrink-0">
            Selected Period Total: <strong>{rangeMetrics.totalHours} hrs</strong>
          </span>
        </div>

        {/* Stacked comparison bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono text-stone-600 dark:text-stone-300">
            <span>Actual Time Distribution:</span>
            <span>
              Math: {rangeMetrics.mathPct}% • ELEX: {rangeMetrics.elexPct}% • EST: {rangeMetrics.commsPct}%
            </span>
          </div>
          <div className="h-4 w-full bg-stone-200 dark:bg-stone-700 rounded-lg overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${rangeMetrics.mathPct}%` }}
              className="bg-[#334155] dark:bg-[#64748b] h-full flex items-center justify-center text-[10px] font-bold text-white font-mono overflow-hidden transition-all duration-500"
              title={`Mathematics: ${rangeMetrics.mathPct}% of study time (Target PRC: 20%)`}
            >
              {rangeMetrics.mathPct >= 10 && `Math ${rangeMetrics.mathPct}%`}
            </div>
            <div
              style={{ width: `${rangeMetrics.elexPct}%` }}
              className="bg-[#d97706] dark:bg-[#fbbf24] dark:text-stone-900 h-full flex items-center justify-center text-[10px] font-bold text-white font-mono overflow-hidden transition-all duration-500"
              title={`Electronics: ${rangeMetrics.elexPct}% of study time (Target PRC: 30%)`}
            >
              {rangeMetrics.elexPct >= 10 && `ELEX ${rangeMetrics.elexPct}%`}
            </div>
            <div
              style={{ width: `${rangeMetrics.commsPct}%` }}
              className="bg-[#7c3aed] dark:bg-[#c084fc] h-full flex items-center justify-center text-[10px] font-bold text-white font-mono overflow-hidden transition-all duration-500"
              title={`Communications: ${rangeMetrics.commsPct}% of study time (Target PRC: 30%)`}
            >
              {rangeMetrics.commsPct >= 10 && `EST ${rangeMetrics.commsPct}%`}
            </div>
          </div>
        </div>

        <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-mono text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#334155]" /> Math: {rangeMetrics.mathMins}m ({Math.round(rangeMetrics.mathMins / 60)}h)
            </span>
            <span className="flex items-center gap-1 font-mono text-amber-700 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-[#d97706]" /> ELEX: {rangeMetrics.elexMins}m ({Math.round(rangeMetrics.elexMins / 60)}h)
            </span>
            <span className="flex items-center gap-1 font-mono text-purple-700 dark:text-purple-400">
              <span className="w-2 h-2 rounded-full bg-[#7c3aed]" /> EST: {rangeMetrics.commsMins}m ({Math.round(rangeMetrics.commsMins / 60)}h)
            </span>
          </div>

          {rangeMetrics.mathPct > 50 && (
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              💡 Tip: Shift future study blocks toward Communications & Electronics to match the combined 60% board weight!
            </span>
          )}
        </div>
      </div>

      {/* 6. DAY INSPECTOR PANEL (INTERACTIVE DRILLDOWN) */}
      {activeSelectedDay && (
        <div
          id="study-timeline-inspector"
          className="border-2 border-stone-900 dark:border-stone-700 rounded-xl p-4 sm:p-5 bg-white dark:bg-stone-900 space-y-4 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-stone-900 text-amber-400 dark:bg-amber-400 dark:text-stone-900">
                  <AppArtwork name="calendar" inline className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-sm font-black text-stone-900 dark:text-stone-100 uppercase tracking-tight">
                  Day Session Inspector: {activeSelectedDay.fullDisplayDate}
                </h3>
                {activeSelectedDay.isToday && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300">
                    TODAY
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Detailed activity audit for selected date in the timeline. Click any bar above to switch days.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-lg font-black font-mono text-stone-900 dark:text-stone-100">
                  {activeSelectedDay.totalMinutes} min
                </div>
                <div className="text-[10px] text-stone-500 font-mono">
                  {activeSelectedDay.totalHours} hrs logged
                </div>
              </div>
              <div
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold font-mono ${
                  activeSelectedDay.totalMinutes >= (dailyTarget.targetMinutes || 60)
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-300'
                }`}
              >
                {activeSelectedDay.totalMinutes >= (dailyTarget.targetMinutes || 60)
                  ? 'Target Reached ✓'
                  : `${Math.max(0, (dailyTarget.targetMinutes || 60) - activeSelectedDay.totalMinutes)}m to Target`}
              </div>
            </div>
          </div>

          {/* Activities List */}
          {activeSelectedDay.totalMinutes === 0 ? (
            <div className="p-6 text-center text-stone-400 dark:text-stone-500 space-y-2">
              <AppArtwork name="timer" inline className="w-8 h-8 mx-auto opacity-40" />
              <div className="text-xs font-semibold">No study activities logged on this date</div>
              <p className="text-[11px] max-w-sm mx-auto">
                Rest days or scheduled revision breaks. Review sessions and mock exams taken on this date will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left Column: Topic Practice Drills */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-stone-700 dark:text-stone-300">
                  <span className="flex items-center gap-1.5">
                    <AppArtwork name="book" inline className="w-3.5 h-3.5 text-amber-500" />
                    <span>Topic Drills & Practice ({activeSelectedDay.reviewedTopics.length})</span>
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">
                    {activeSelectedDay.reviewedTopics.reduce((a, b) => a + b.minutes, 0)} min total
                  </span>
                </div>

                {activeSelectedDay.reviewedTopics.length === 0 ? (
                  <div className="p-3 text-xs text-stone-400 italic bg-stone-50 dark:bg-stone-800/40 rounded-lg border border-stone-200 dark:border-stone-800">
                    No topic drills logged on this date.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {activeSelectedDay.reviewedTopics.map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        className="p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-800/50 flex items-center justify-between text-xs hover:border-stone-300 transition-colors"
                      >
                        <div className="space-y-0.5 truncate mr-2">
                          <div className="font-bold text-stone-900 dark:text-stone-100 truncate">
                            {item.topicName}
                          </div>
                          <div className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                            {item.subjectName} • {item.type}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
                            {item.minutes} min
                          </span>
                          {item.score !== null && (
                            <div className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {item.score}% accuracy
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Mock Exams & Tests */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-stone-700 dark:text-stone-300">
                  <span className="flex items-center gap-1.5">
                    <AppArtwork name="trophy" inline className="w-3.5 h-3.5 text-purple-500" />
                    <span>Timed Mock Exams & Tests ({activeSelectedDay.mockTests.length})</span>
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">
                    {activeSelectedDay.mockTests.reduce((a, b) => a + b.minutes, 0)} min total
                  </span>
                </div>

                {activeSelectedDay.mockTests.length === 0 ? (
                  <div className="p-3 text-xs text-stone-400 italic bg-stone-50 dark:bg-stone-800/40 rounded-lg border border-stone-200 dark:border-stone-800">
                    No formal mock tests recorded on this date.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {activeSelectedDay.mockTests.map((test, idx) => (
                      <div
                        key={`${test.id}-${idx}`}
                        className="p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-800/50 flex items-center justify-between text-xs hover:border-stone-300 transition-colors"
                      >
                        <div className="space-y-0.5 truncate mr-2">
                          <div className="font-bold text-stone-900 dark:text-stone-100 truncate">
                            {test.testName}
                          </div>
                          <div className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                            {test.subjectName} • {test.correct}/{test.questions} questions
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-mono font-black text-xs text-purple-700 dark:text-purple-300">
                            {test.scorePercent}%
                          </div>
                          <div className="text-[10px] text-stone-500 font-mono">
                            {test.minutes} min
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Inspector Action Footer */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3 flex-wrap">
            <span className="text-xs text-stone-500 dark:text-stone-400">
              Need to add or adjust records for this date?
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentScreen('today')}
                className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <AppArtwork name="lightning" inline className="w-3.5 h-3.5 text-amber-400" />
                <span>Today's Study Session</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentScreen('tests')}
                className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-200 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-stone-300 dark:border-stone-700 cursor-pointer"
              >
                <AppArtwork name="trophy" inline className="w-3.5 h-3.5 text-stone-500" />
                <span>Mock Tests Screen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
