import { AppArtwork } from './common/AppArtwork';
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useReview } from '../context/ReviewContext';
import {
  generateCalendarMonthGrid,
  getDayActivitySummary,
  calculateConsistencyMetrics,
  MONTH_NAMES,
  DAY_OF_WEEK_SHORT,
  INITIAL_COMPLETED_QUEUE_DATES,
  formatDateKey,
  parseDateKey,
  addDaysToDateKey,
  CalendarGridDay,
} from '../utils/consistencyCalendarUtils';
import { DayStudyActivitySummary } from '../types';

export type HeatmapMetricMode = 'minutes' | 'questions' | 'productivityScore';
export type PeriodSelection = 'past-30-days' | 'current-month' | 'august-2026';
export type FilterIntensityMode = 'all' | 'active' | 'peak' | 'tests';

interface EnrichedDayData {
  cell: CalendarGridDay;
  summary: DayStudyActivitySummary;
  intensityLevel: 0 | 1 | 2 | 3 | 4;
  productivityScore: number;
  isPeakDay: boolean;
  isMockTestDay: boolean;
  hasActivity: boolean;
}

export const StudyIntensityHeatmap: React.FC = () => {
  const {
    allTopics,
    testRecords,
    currentDateStr,
    dailyStudyQueue,
    openTopicDrawer,
    openRecordTestForTopic,
  } = useReview();

  // Selected period state
  const [period, setPeriod] = useState<PeriodSelection>('past-30-days');
  const [metricMode, setMetricMode] = useState<HeatmapMetricMode>('minutes');
  const [filterMode, setFilterMode] = useState<FilterIntensityMode>('all');

  // Month navigation (base year & month)
  // Default: September 2026 (month 8, 0-indexed)
  const [navYear, setNavYear] = useState<number>(2026);
  const [navMonth, setNavMonth] = useState<number>(8); // 8 = September

  // Selected Day for deep inspector panel
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-09-03'); // Default to one of the most productive days

  // Compute calendar days and enriched summaries based on selected period
  const { enrichedDays, peakDay, topProductiveDays, consistencyMetrics } = useMemo(() => {
    let cells: CalendarGridDay[] = [];

    if (period === 'past-30-days') {
      // Generate a continuous rolling grid covering roughly 35 days ending around currentDateStr
      // From 2026-08-10 to 2026-09-13
      const baseEnd = currentDateStr;
      const { year: curYear, month: curMonth, day: curDay } = parseDateKey(baseEnd);
      const endDate = new Date(curYear, curMonth, curDay);
      // Find end of week (Saturday)
      const daysUntilSat = 6 - endDate.getDay();
      const rollingEnd = new Date(curYear, curMonth, curDay + daysUntilSat);
      
      // Go back 34 days to get 35 cells (5 weeks exactly)
      const rollingStart = new Date(rollingEnd.getTime() - 34 * 24 * 60 * 60 * 1000);
      
      cells = [];
      for (let i = 0; i < 35; i++) {
        const d = new Date(rollingStart.getTime() + i * 24 * 60 * 60 * 1000);
        const dStr = formatDateKey(d.getFullYear(), d.getMonth(), d.getDate());
        cells.push({
          dateStr: dStr,
          dayNumber: d.getDate(),
          isCurrentMonth: d.getMonth() === curMonth,
          isToday: dStr === currentDateStr,
          isPast: dStr < currentDateStr,
          isFuture: dStr > currentDateStr,
          dayOfWeek: d.getDay(),
        });
      }
    } else {
      // Standard calendar month grid
      cells = generateCalendarMonthGrid(navYear, navMonth, currentDateStr);
    }

    // Process summary for each day cell
    const daySummaries: Record<string, DayStudyActivitySummary> = {};
    cells.forEach((c) => {
      daySummaries[c.dateStr] = getDayActivitySummary(
        c.dateStr,
        currentDateStr,
        INITIAL_COMPLETED_QUEUE_DATES,
        allTopics,
        testRecords,
        dailyStudyQueue
      );
    });

    // Determine highest intensity value to compute peak day
    let maxMetricVal = 0;
    let foundPeakDate: string | null = null;

    cells.forEach((c) => {
      // In past-30-days or current month, consider past and today
      if (c.dateStr <= currentDateStr) {
        const sum = daySummaries[c.dateStr];
        const val =
          metricMode === 'minutes'
            ? sum.totalMinutes
            : metricMode === 'questions'
            ? sum.totalQuestions
            : sum.totalMinutes + sum.totalQuestions * 0.5;

        if (val > maxMetricVal) {
          maxMetricVal = val;
          foundPeakDate = c.dateStr;
        }
      }
    });

    // Enriched list
    const list: EnrichedDayData[] = cells.map((c) => {
      const sum = daySummaries[c.dateStr];
      const hasActivity = sum.totalMinutes > 0 || sum.totalQuestions > 0 || sum.mockTests.length > 0;
      const isMockTestDay = sum.mockTests.length > 0;
      const isPeakDay = c.dateStr === foundPeakDate && maxMetricVal > 0;

      // Intensity level mapping (0 - 4)
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (metricMode === 'minutes') {
        if (sum.totalMinutes >= 105) level = 4;
        else if (sum.totalMinutes >= 60) level = 3;
        else if (sum.totalMinutes >= 30) level = 2;
        else if (sum.totalMinutes > 0) level = 1;
      } else if (metricMode === 'questions') {
        if (sum.totalQuestions >= 70) level = 4;
        else if (sum.totalQuestions >= 40) level = 3;
        else if (sum.totalQuestions >= 20) level = 2;
        else if (sum.totalQuestions > 0) level = 1;
      } else {
        // Productivity score composite
        const score = sum.totalMinutes + sum.totalQuestions * 0.6;
        if (score >= 140) level = 4;
        else if (score >= 80) level = 3;
        else if (score >= 40) level = 2;
        else if (score > 0) level = 1;
      }

      const productivityScore = Math.round(
        sum.totalMinutes +
          sum.totalQuestions * 0.5 +
          (sum.correctQuestions / Math.max(1, sum.totalQuestions)) * 20
      );

      return {
        cell: c,
        summary: sum,
        intensityLevel: level,
        productivityScore,
        isPeakDay,
        isMockTestDay,
        hasActivity,
      };
    });

    // Top 4 productive days (sorted descending)
    const activeDaysInPeriod = list
      .filter((d) => d.hasActivity && d.cell.dateStr <= currentDateStr)
      .sort((a, b) => {
        if (metricMode === 'minutes') return b.summary.totalMinutes - a.summary.totalMinutes;
        if (metricMode === 'questions') return b.summary.totalQuestions - a.summary.totalQuestions;
        return b.productivityScore - a.productivityScore;
      });

    const topProductive = activeDaysInPeriod.slice(0, 4);
    const peak = activeDaysInPeriod.length > 0 ? activeDaysInPeriod[0] : null;

    // Consistency metrics
    const metrics = calculateConsistencyMetrics(
      INITIAL_COMPLETED_QUEUE_DATES,
      currentDateStr,
      navYear,
      navMonth,
      allTopics,
      testRecords
    );

    return {
      enrichedDays: list,
      peakDay: peak,
      topProductiveDays: topProductive,
      consistencyMetrics: metrics,
    };
  }, [period, metricMode, navYear, navMonth, currentDateStr, allTopics, testRecords, dailyStudyQueue]);

  // If user selected month preset, sync navYear/navMonth
  const handlePeriodChange = (newPeriod: PeriodSelection) => {
    setPeriod(newPeriod);
    if (newPeriod === 'past-30-days') {
      setNavYear(2026);
      setNavMonth(8); // Sep
    } else if (newPeriod === 'current-month') {
      setNavYear(2026);
      setNavMonth(8); // Sep
    } else if (newPeriod === 'august-2026') {
      setNavYear(2026);
      setNavMonth(7); // Aug
    }
  };

  const handlePrevMonth = () => {
    if (period === 'past-30-days') {
      setPeriod('august-2026');
      setNavYear(2026);
      setNavMonth(7);
      return;
    }
    if (navMonth === 0) {
      setNavYear((y) => y - 1);
      setNavMonth(11);
    } else {
      setNavMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (navMonth === 11) {
      setNavYear((y) => y + 1);
      setNavMonth(0);
    } else {
      setNavMonth((m) => m + 1);
    }
  };

  // Find currently selected day data
  const selectedDayData = useMemo(() => {
    const found = enrichedDays.find((d) => d.cell.dateStr === selectedDateStr);
    if (found) return found;

    // Fallback: use getDayActivitySummary directly
    const sum = getDayActivitySummary(
      selectedDateStr,
      currentDateStr,
      INITIAL_COMPLETED_QUEUE_DATES,
      allTopics,
      testRecords,
      dailyStudyQueue
    );
    const mockCell: CalendarGridDay = {
      dateStr: selectedDateStr,
      dayNumber: parseInt(selectedDateStr.split('-')[2] || '1', 10),
      isCurrentMonth: true,
      isToday: selectedDateStr === currentDateStr,
      isPast: selectedDateStr < currentDateStr,
      isFuture: selectedDateStr > currentDateStr,
      dayOfWeek: new Date(selectedDateStr).getDay(),
    };
    return {
      cell: mockCell,
      summary: sum,
      intensityLevel: (sum.totalMinutes >= 60 ? 3 : sum.totalMinutes > 0 ? 2 : 0) as 0 | 1 | 2 | 3 | 4,
      productivityScore: sum.totalMinutes + sum.totalQuestions,
      isPeakDay: peakDay?.cell.dateStr === selectedDateStr,
      isMockTestDay: sum.mockTests.length > 0,
      hasActivity: sum.totalMinutes > 0 || sum.totalQuestions > 0,
    };
  }, [enrichedDays, selectedDateStr, currentDateStr, allTopics, testRecords, dailyStudyQueue, peakDay]);

  // Aggregate period statistics
  const periodTotals = useMemo(() => {
    let totalMinutes = 0;
    let totalQuestions = 0;
    let totalCorrect = 0;
    let activeDaysCount = 0;
    let mockTestsCount = 0;
    const pastAndTodayDays = enrichedDays.filter(
      (d) => d.cell.dateStr <= currentDateStr && (period === 'past-30-days' ? true : d.cell.isCurrentMonth)
    );

    pastAndTodayDays.forEach((d) => {
      if (d.hasActivity) {
        activeDaysCount++;
        totalMinutes += d.summary.totalMinutes;
        totalQuestions += d.summary.totalQuestions;
        totalCorrect += d.summary.correctQuestions;
        mockTestsCount += d.summary.mockTests.length;
      }
    });

    const evaluatedDaysCount = Math.max(1, pastAndTodayDays.length);
    const consistencyRate = Math.round((activeDaysCount / evaluatedDaysCount) * 100);
    const avgMinsPerActiveDay =
      activeDaysCount > 0 ? Math.round(totalMinutes / activeDaysCount) : 0;
    const accuracy =
      totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : null;

    return {
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      totalMinutes,
      totalQuestions,
      activeDaysCount,
      evaluatedDaysCount,
      consistencyRate,
      avgMinsPerActiveDay,
      accuracy,
      mockTestsCount,
    };
  }, [enrichedDays, currentDateStr, period]);

  // Helper to format date nicely (e.g. "Wednesday, September 2, 2026")
  const formatFriendlyDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map((v) => parseInt(v, 10));
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Helper for short date (e.g. "Sep 3")
  const formatShortDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map((v) => parseInt(v, 10));
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      id="study-intensity-heatmap-card"
      className="bg-white border-2 border-stone-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6"
    >
      {/* 1. Header & View Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
              <AppArtwork name="calendar" inline className="w-5 h-5 text-amber-700" />
            </span>
            <h2 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
              <span>Study Intensity & Consistency Heatmap</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 border border-amber-500">
                Past Month
              </span>
            </h2>
          </div>
          <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
            A calendar-style density map visualizing daily problem-solving volume, diagnostic tests,
            and peak productive sessions. Click any day to inspect topics and performance metrics.
          </p>
        </div>

        {/* View Range Tabs & Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          {/* Period selector tabs */}
          <div className="flex items-center rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs font-semibold">
            <button
              type="button"
              id="heatmap-tab-past-30-days"
              onClick={() => handlePeriodChange('past-30-days')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'past-30-days'
                  ? 'bg-white text-stone-900 font-bold shadow-xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Past 30 Days (Rolling)
            </button>
            <button
              type="button"
              id="heatmap-tab-current-month"
              onClick={() => handlePeriodChange('current-month')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'current-month'
                  ? 'bg-white text-stone-900 font-bold shadow-xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              September 2026
            </button>
            <button
              type="button"
              id="heatmap-tab-august-2026"
              onClick={() => handlePeriodChange('august-2026')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'august-2026'
                  ? 'bg-white text-stone-900 font-bold shadow-xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              August 2026
            </button>
          </div>

          {/* Month Navigation for monthly mode */}
          {period !== 'past-30-days' && (
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                type="button"
                id="heatmap-nav-prev-btn"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-white text-stone-700 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-stone-800 px-1.5 font-mono">
                {MONTH_NAMES[navMonth]?.substring(0, 3)} {navYear}
              </span>
              <button
                type="button"
                id="heatmap-nav-next-btn"
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-white text-stone-700 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. AT-A-GLANCE MOST PRODUCTIVE DAY BANNER */}
      {peakDay && (
        <div
          id="heatmap-peak-day-banner"
          className="relative overflow-hidden bg-linear-to-r from-amber-50 via-stone-50 to-amber-50/50 border-2 border-amber-300 rounded-xl p-4 sm:p-5 shadow-xs"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-400 text-stone-950 shadow-xs shrink-0 ring-2 ring-amber-500/30">
                <AppArtwork name="trophy" inline className="w-6 h-6 text-stone-950" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md border border-amber-300">
                    Highest Study Intensity
                  </span>
                  <span className="text-xs font-bold text-stone-500">
                    Most Productive Day in Period
                  </span>
                </div>
                <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                  <span>{formatFriendlyDate(peakDay.cell.dateStr)}</span>
                  {peakDay.isMockTestDay && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-stone-900 text-amber-300">
                      Mock Exam Day
                    </span>
                  )}
                </h3>
                <p className="text-xs text-stone-600">
                  Total of <strong className="text-stone-900">{peakDay.summary.totalMinutes} minutes</strong> (
                  {(peakDay.summary.totalMinutes / 60).toFixed(1)} hrs) •{' '}
                  <strong className="text-stone-900">{peakDay.summary.totalQuestions} questions</strong> solved •{' '}
                  <strong className="text-stone-900">
                    {peakDay.summary.averageScore ? `${peakDay.summary.averageScore}% accuracy` : 'Completed'}
                  </strong>{' '}
                  across {peakDay.summary.reviewedTopics.length} syllabus topics
                  {peakDay.summary.mockTests.length > 0 &&
                    ` and ${peakDay.summary.mockTests.length} timed diagnostic test`}
                  .
                </p>
              </div>
            </div>

            <button
              type="button"
              id="inspect-peak-day-btn"
              onClick={() => setSelectedDateStr(peakDay.cell.dateStr)}
              className="self-start md:self-center flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
            >
              <span>Inspect This Peak Day</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Top 4 Productive Days Quick-Pills & Metric Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        {/* Top Productive Days Quick-Jump Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-stone-700 flex items-center gap-1 mr-1">
            <AppArtwork name="trophy" inline className="w-3.5 h-3.5 text-amber-600" />
            <span>Top Days:</span>
          </span>
          {topProductiveDays.map((topDay, index) => {
            const isSelected = topDay.cell.dateStr === selectedDateStr;
            return (
              <button
                key={topDay.cell.dateStr}
                type="button"
                id={`quick-top-day-${index + 1}`}
                onClick={() => setSelectedDateStr(topDay.cell.dateStr)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-stone-950 font-bold ring-2 ring-stone-900 shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200'
                }`}
                title={`Rank #${index + 1}: ${formatFriendlyDate(topDay.cell.dateStr)} (${
                  topDay.summary.totalMinutes
                } mins)`}
              >
                <span
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono font-bold ${
                    isSelected ? 'bg-stone-950 text-amber-300' : 'bg-stone-300 text-stone-800'
                  }`}
                >
                  #{index + 1}
                </span>
                <span>{formatShortDate(topDay.cell.dateStr)}</span>
                <span className="font-mono text-[11px] opacity-85">
                  {topDay.summary.totalMinutes}m
                </span>
              </button>
            );
          })}
        </div>

        {/* Heatmap Metric Mode Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
            Intensity By:
          </label>
          <div className="flex items-center rounded-lg bg-stone-100 p-0.5 border border-stone-200 text-[11px] font-medium">
            <button
              type="button"
              id="metric-mode-minutes-btn"
              onClick={() => setMetricMode('minutes')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                metricMode === 'minutes'
                  ? 'bg-white text-stone-900 font-bold shadow-2xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Study Time (Mins)
            </button>
            <button
              type="button"
              id="metric-mode-questions-btn"
              onClick={() => setMetricMode('questions')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                metricMode === 'questions'
                  ? 'bg-white text-stone-900 font-bold shadow-2xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Questions Solved
            </button>
            <button
              type="button"
              id="metric-mode-score-btn"
              onClick={() => setMetricMode('productivityScore')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                metricMode === 'productivityScore'
                  ? 'bg-white text-stone-900 font-bold shadow-2xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Productivity Index
            </button>
          </div>
        </div>
      </div>

      {/* 4. KEY SUMMARY STATS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 border border-stone-200 rounded-xl p-3.5">
        <div className="space-y-0.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
            <AppArtwork name="timer" inline className="w-3 h-3 text-stone-600" />
            <span>Total Study Hours</span>
          </div>
          <div className="text-xl font-extrabold text-stone-900 font-mono">
            {periodTotals.totalHours}{' '}
            <span className="text-xs font-sans text-stone-500 font-normal">hrs</span>
          </div>
          <p className="text-[11px] text-stone-500">Across {periodTotals.totalMinutes} total minutes</p>
        </div>

        <div className="space-y-0.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
            <AppArtwork name="calendar" inline className="w-3 h-3 text-amber-600" />
            <span>Active Study Days</span>
          </div>
          <div className="text-xl font-extrabold text-stone-900 font-mono">
            {periodTotals.activeDaysCount}{' '}
            <span className="text-xs font-sans text-stone-500 font-normal">
              / {periodTotals.evaluatedDaysCount} days
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold">
            {periodTotals.consistencyRate}% consistency rate
          </p>
        </div>

        <div className="space-y-0.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
            <AppArtwork name="target" inline className="w-3 h-3 text-stone-600" />
            <span>Questions Solved</span>
          </div>
          <div className="text-xl font-extrabold text-stone-900 font-mono">
            {periodTotals.totalQuestions}{' '}
            <span className="text-xs font-sans text-stone-500 font-normal">problems</span>
          </div>
          <p className="text-[11px] text-stone-500">
            {periodTotals.accuracy ? `${periodTotals.accuracy}% overall accuracy` : 'Recorded practice'}
          </p>
        </div>

        <div className="space-y-0.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
            <AppArtwork name="flame" inline className="w-3 h-3 text-amber-500" />
            <span>Active Days Average</span>
          </div>
          <div className="text-xl font-extrabold text-amber-600 font-mono">
            {periodTotals.avgMinsPerActiveDay}{' '}
            <span className="text-xs font-sans text-stone-500 font-normal">mins / day</span>
          </div>
          <p className="text-[11px] text-stone-500 font-medium">
            Streak: {consistencyMetrics.currentStreakDays} days active 🔥
          </p>
        </div>
      </div>

      {/* 5. CALENDAR-STYLE HEATMAP MATRIX */}
      <div className="space-y-2">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-xs font-bold text-stone-600 tracking-wider uppercase">
          {DAY_OF_WEEK_SHORT.map((day, idx) => (
            <div
              key={day}
              className={`py-1.5 rounded-lg ${
                idx === 0 || idx === 6 ? 'bg-stone-100/60 text-stone-500 font-semibold' : 'text-stone-700'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 7-Column Month/Rolling Grid Cells */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {enrichedDays.map((dayData) => {
            const { cell, summary, intensityLevel, isPeakDay, isMockTestDay, hasActivity } = dayData;
            const isSelected = cell.dateStr === selectedDateStr;

            // Compute background and text color based on intensity level
            let cellBgClass = 'bg-stone-50 text-stone-700 border-stone-200/70 hover:bg-stone-100';
            if (intensityLevel === 1) {
              cellBgClass =
                'bg-amber-100/90 text-amber-950 border-amber-300 hover:bg-amber-200/90 shadow-2xs';
            } else if (intensityLevel === 2) {
              cellBgClass =
                'bg-amber-300 text-stone-950 border-amber-400 font-medium hover:bg-amber-400 shadow-2xs';
            } else if (intensityLevel === 3) {
              cellBgClass =
                'bg-amber-500 text-stone-950 border-amber-600 font-bold hover:bg-amber-600 shadow-xs';
            } else if (intensityLevel === 4) {
              cellBgClass =
                'bg-stone-950 text-amber-300 border-amber-400 font-extrabold hover:bg-stone-900 shadow-sm ring-1 ring-amber-400/50';
            }

            // Inactive trailing days outside current month
            if (period !== 'past-30-days' && !cell.isCurrentMonth) {
              cellBgClass = 'bg-stone-100/40 text-stone-400 border-stone-200/30 opacity-60';
            }

            // Today styling
            const isToday = cell.isToday;

            return (
              <button
                key={cell.dateStr}
                type="button"
                id={`calendar-heatmap-cell-${cell.dateStr}`}
                onClick={() => setSelectedDateStr(cell.dateStr)}
                aria-pressed={isSelected}
                className={`relative group rounded-xl p-1.5 sm:p-2.5 flex flex-col justify-between min-h-[64px] sm:min-h-[82px] border transition-all text-left cursor-pointer ${cellBgClass} ${
                  isSelected
                    ? 'ring-3 ring-amber-500 ring-offset-2 scale-[1.03] z-10 shadow-md'
                    : 'hover:scale-[1.01]'
                }`}
                title={`${formatFriendlyDate(cell.dateStr)}: ${
                  summary.totalMinutes > 0
                    ? `${summary.totalMinutes} mins • ${summary.totalQuestions} questions`
                    : 'No study recorded'
                }`}
              >
                {/* Top Row of Cell: Day Number and Micro Badges */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs sm:text-sm font-mono font-bold leading-none ${
                      isToday
                        ? 'px-1.5 py-0.5 rounded-md bg-amber-400 text-stone-950 font-black shadow-2xs'
                        : ''
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  <div className="flex items-center gap-1">
                    {/* Peak Day Trophy Badge */}
                    {isPeakDay && (
                      <span
                        className="p-0.5 rounded-full bg-amber-400 text-stone-950"
                        title="Peak Productive Day of the Month"
                      >
                        <AppArtwork name="trophy" inline className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current text-stone-950" />
                      </span>
                    )}

                    {/* Mock Test Badge */}
                    {isMockTestDay && !isPeakDay && (
                      <span
                        className="p-0.5 rounded-md bg-stone-900 text-amber-300"
                        title="Mock Diagnostic Test Taken"
                      >
                        <AppArtwork name="exam" inline className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </span>
                    )}

                    {/* Today indicator */}
                    {isToday && (
                      <span className="hidden sm:inline text-[9px] font-mono font-black uppercase tracking-wider text-amber-900 bg-amber-200/90 px-1 rounded">
                        Today
                      </span>
                    )}
                  </div>
                </div>

                {/* Center / Bottom of Cell: Study Value Indicator */}
                <div className="mt-1 sm:mt-1.5 space-y-0.5">
                  {hasActivity ? (
                    <>
                      <div className="text-[11px] sm:text-xs font-mono font-extrabold truncate">
                        {metricMode === 'minutes' ? (
                          <span>{summary.totalMinutes}m</span>
                        ) : metricMode === 'questions' ? (
                          <span>{summary.totalQuestions} Qs</span>
                        ) : (
                          <span>{dayData.productivityScore} pts</span>
                        )}
                      </div>
                      <div className="hidden sm:block text-[9px] opacity-80 truncate">
                        {summary.reviewedTopics.length > 0 &&
                          `${summary.reviewedTopics.length} topic${
                            summary.reviewedTopics.length > 1 ? 's' : ''
                          }`}
                        {summary.mockTests.length > 0 &&
                          ` • ${summary.mockTests.length} test`}
                      </div>
                    </>
                  ) : cell.isFuture ? (
                    <span className="text-[9px] text-stone-400 italic hidden sm:inline">
                      {summary.scheduledTopics.length > 0
                        ? `${summary.scheduledTopics.length} due`
                        : 'Scheduled'}
                    </span>
                  ) : (
                    <span className="text-[9px] text-stone-400 hidden sm:inline opacity-60">
                      Rest
                    </span>
                  )}
                </div>

                {/* Micro intensity bar indicator on bottom edge */}
                {intensityLevel > 0 && (
                  <div
                    className={`h-1 w-full rounded-full mt-1 ${
                      intensityLevel === 4
                        ? 'bg-amber-400'
                        : intensityLevel === 3
                        ? 'bg-stone-900/40'
                        : intensityLevel === 2
                        ? 'bg-amber-600/50'
                        : 'bg-amber-400/40'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. HEATMAP INTENSITY COLOR LEGEND */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-stone-200 text-xs text-stone-600">
        {/* Color Scale Legend */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-700">Study Intensity:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-stone-500">Less</span>
            <div className="flex items-center gap-1">
              <span
                className="w-4 h-4 rounded-md bg-stone-100 border border-stone-200"
                title="Level 0: 0 mins (Rest Day)"
              />
              <span
                className="w-4 h-4 rounded-md bg-amber-100 border border-amber-300"
                title="Level 1: 1–29 mins (Light Review)"
              />
              <span
                className="w-4 h-4 rounded-md bg-amber-300 border border-amber-400"
                title="Level 2: 30–59 mins (Moderate Study)"
              />
              <span
                className="w-4 h-4 rounded-md bg-amber-500 border border-amber-600"
                title="Level 3: 60–104 mins (Intensive Session)"
              />
              <span
                className="w-4 h-4 rounded-md bg-stone-950 border border-amber-400 ring-1 ring-amber-400/50"
                title="Level 4: 105+ mins (Peak Productivity Day)"
              />
            </div>
            <span className="text-[11px] text-stone-900 font-bold">More (105m+ Peak)</span>
          </div>
        </div>

        {/* Badge Explanations */}
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <AppArtwork name="trophy" inline className="w-3.5 h-3.5 text-amber-600" />
            <span>Peak Study Day</span>
          </span>
          <span className="flex items-center gap-1">
            <AppArtwork name="exam" inline className="w-3.5 h-3.5 text-stone-700" />
            <span>Mock Exam Day</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Today ({formatShortDate(currentDateStr)})</span>
          </span>
        </div>
      </div>

      {/* 7. INTERACTIVE SELECTED DAY INSPECTOR CARD */}
      {selectedDayData && (
        <div
          id="heatmap-selected-day-inspector"
          className="bg-stone-50 border-2 border-stone-300 rounded-xl p-4 sm:p-5 space-y-4"
        >
          {/* Top Title & Day Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500">
                  DAY BREAKDOWN INSPECTOR
                </span>
                {selectedDayData.isPeakDay && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 border border-amber-500 flex items-center gap-1">
                    <AppArtwork name="trophy" inline className="w-3 h-3 text-stone-950" />
                    <span>Peak Study Day</span>
                  </span>
                )}
                {selectedDayData.cell.isToday && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-900 text-amber-400 border border-stone-700">
                    Today
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <AppArtwork name="calendar" inline className="w-4 h-4 text-amber-600" />
                <span>{formatFriendlyDate(selectedDayData.cell.dateStr)}</span>
              </h3>
            </div>

            {/* Overall stats pills for the selected day */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="px-3 py-1 rounded-lg bg-white border border-stone-200 shadow-2xs font-mono">
                <span className="text-stone-500 mr-1">Study Time:</span>
                <strong className="text-stone-900">
                  {selectedDayData.summary.totalMinutes} mins (
                  {(selectedDayData.summary.totalMinutes / 60).toFixed(1)}h)
                </strong>
              </div>
              <div className="px-3 py-1 rounded-lg bg-white border border-stone-200 shadow-2xs font-mono">
                <span className="text-stone-500 mr-1">Questions:</span>
                <strong className="text-stone-900">{selectedDayData.summary.totalQuestions}</strong>
              </div>
              {selectedDayData.summary.averageScore !== null && (
                <div className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 shadow-2xs font-mono font-bold">
                  <span className="text-emerald-700 mr-1">Avg Score:</span>
                  <span>{selectedDayData.summary.averageScore}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Activities list / Mock Tests / Scheduled Topics */}
          {selectedDayData.hasActivity ? (
            <div className="space-y-3">
              {/* Syllabus topics reviewed on this date */}
              {selectedDayData.summary.reviewedTopics.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wide flex items-center gap-1.5">
                    <AppArtwork name="book" inline className="w-3.5 h-3.5 text-stone-600" />
                    <span>
                      Syllabus Topics Reviewed ({selectedDayData.summary.reviewedTopics.length})
                    </span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedDayData.summary.reviewedTopics.map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        className="p-3 bg-white border border-stone-200 rounded-lg shadow-2xs flex items-center justify-between gap-3 hover:border-amber-400 transition-colors"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <button
                            type="button"
                            onClick={() => {
                              const foundTopic = allTopics.find((t) => t.id === item.topicId);
                              if (foundTopic) openTopicDrawer(foundTopic);
                            }}
                            className="text-xs font-bold text-stone-900 hover:text-amber-700 truncate block text-left cursor-pointer"
                            title="Open topic details"
                          >
                            {item.topicName}
                          </button>
                          <div className="flex items-center gap-2 text-[11px] text-stone-500">
                            <span className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-700 font-medium">
                              {item.type}
                            </span>
                            <span>•</span>
                            <span className="font-mono">{item.minutes} mins</span>
                            <span>•</span>
                            <span className="font-mono">
                              {item.questionsCorrect}/{item.questionsAttempted} Qs
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${
                              item.score >= 90
                                ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                                : item.score >= 80
                                ? 'bg-amber-100 text-amber-950 border-amber-300'
                                : 'bg-rose-100 text-rose-950 border-rose-300'
                            }`}
                          >
                            {item.score}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mock exam diagnostic tests taken on this date */}
              {selectedDayData.summary.mockTests.length > 0 && (
                <div className="space-y-2 pt-1">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wide flex items-center gap-1.5">
                    <AppArtwork name="exam" inline className="w-3.5 h-3.5 text-stone-600" />
                    <span>Board Diagnostic Mock Tests ({selectedDayData.summary.mockTests.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedDayData.summary.mockTests.map((test, idx) => (
                      <div
                        key={`${test.id}-${idx}`}
                        className="p-3 bg-stone-900 text-white rounded-lg shadow-xs flex items-center justify-between gap-3 border border-stone-800"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="text-xs font-bold text-amber-300 truncate">
                            {test.title}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-stone-400 font-mono">
                            <span>{test.minutes} mins</span>
                            <span>•</span>
                            <span>{test.correct}/{test.questions} correct</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-400 text-stone-950">
                            {test.score}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : selectedDayData.cell.isFuture ? (
            // Future Day: show scheduled spaced reviews
            <div className="p-4 bg-white border border-stone-200 rounded-lg text-center space-y-2">
              <AppArtwork name="star" inline className="w-6 h-6 text-amber-500 mx-auto" />
              <div className="text-xs font-bold text-stone-900">
                Scheduled Upcoming Spaced Repetition Queue
              </div>
              {selectedDayData.summary.scheduledTopics.length > 0 ? (
                <div className="text-xs text-stone-600 space-y-1">
                  <p>
                    {selectedDayData.summary.scheduledTopics.length} topics scheduled for retention
                    check on this date:
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                    {selectedDayData.summary.scheduledTopics.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          const found = allTopics.find((top) => top.id === t.id);
                          if (found) openTopicDrawer(found);
                        }}
                        className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-medium border border-stone-200 cursor-pointer"
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-500">
                  No overdue or scheduled reviews queued yet for this future date.
                </p>
              )}
            </div>
          ) : (
            // Past Day with no study recorded (Rest Day)
            <div className="p-4 bg-white border border-stone-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-stone-800">
                  Rest & Cognitive Consolidation Day
                </div>
                <p className="text-xs text-stone-500">
                  No study sessions or tests were logged on this date. Intentional rest days help
                  consolidate memory retention and prevent burnout before the board exam.
                </p>
              </div>
              <button
                type="button"
                id="log-practice-for-day-btn"
                onClick={() => openRecordTestForTopic()}
                className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-200 shrink-0 cursor-pointer"
              >
                Log Test / Practice
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
