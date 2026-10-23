import {
  DayStudyActivitySummary,
  ConsistencyStreakMetrics,
  Topic,
  Subject,
  TestRecord,
  DailyStudyQueueItem,
} from '../types';

export const INITIAL_COMPLETED_QUEUE_DATES: string[] = [
  '2026-08-25',
  '2026-08-27',
  '2026-08-28',
  '2026-08-29',
  '2026-08-30',
  '2026-09-01',
  '2026-09-02',
  '2026-09-03',
  '2026-09-04',
  '2026-09-05',
  '2026-09-06',
  '2026-09-07',
  '2026-09-08',
];

export const padZero = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

export const formatDateKey = (year: number, monthZeroIndexed: number, day: number): string => {
  return `${year}-${padZero(monthZeroIndexed + 1)}-${padZero(day)}`;
};

export const parseDateKey = (
  dateStr: string
): { year: number; month: number; day: number } => {
  const parts = dateStr.split('-');
  if (parts.length >= 3) {
    return {
      year: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10) - 1, // 0-indexed
      day: parseInt(parts[2], 10),
    };
  }
  const d = new Date(dateStr);
  return {
    year: d.getFullYear(),
    month: d.getMonth(),
    day: d.getDate(),
  };
};

export interface CalendarGridDay {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  dayOfWeek: number; // 0 = Sun, 6 = Sat
}

/**
 * Generate 35 or 42 day cells for a calendar month grid (Sun-Sat)
 */
export const generateCalendarMonthGrid = (
  year: number,
  monthZeroIndexed: number,
  currentDateStr: string
): CalendarGridDay[] => {
  const firstDayOfMonth = new Date(year, monthZeroIndexed, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  const daysInMonth = new Date(year, monthZeroIndexed + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, monthZeroIndexed, 0).getDate();

  const cells: CalendarGridDay[] = [];

  // Previous month trailing days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonth = monthZeroIndexed === 0 ? 11 : monthZeroIndexed - 1;
    const prevYear = monthZeroIndexed === 0 ? year - 1 : year;
    const dateStr = formatDateKey(prevYear, prevMonth, dayNum);

    cells.push({
      dateStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateStr === currentDateStr,
      isPast: dateStr < currentDateStr,
      isFuture: dateStr > currentDateStr,
      dayOfWeek: (startDayOfWeek - 1 - i) % 7,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDateKey(year, monthZeroIndexed, day);
    const dayOfWeek = new Date(year, monthZeroIndexed, day).getDay();

    cells.push({
      dateStr,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateStr === currentDateStr,
      isPast: dateStr < currentDateStr,
      isFuture: dateStr > currentDateStr,
      dayOfWeek,
    });
  }

  // Next month leading days to complete grid (multiples of 7, usually 35 or 42)
  const remainingCells = 7 - (cells.length % 7);
  if (remainingCells < 7) {
    const nextMonth = monthZeroIndexed === 11 ? 0 : monthZeroIndexed + 1;
    const nextYear = monthZeroIndexed === 11 ? year + 1 : year;

    for (let day = 1; day <= remainingCells; day++) {
      const dateStr = formatDateKey(nextYear, nextMonth, day);
      const dayOfWeek = (cells[cells.length - 1].dayOfWeek + 1) % 7;

      cells.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dateStr === currentDateStr,
        isPast: dateStr < currentDateStr,
        isFuture: dateStr > currentDateStr,
        dayOfWeek,
      });
    }
  }

  return cells;
};

/**
 * Get date string N days offset from a base date
 */
export const addDaysToDateKey = (dateStr: string, daysOffset: number): string => {
  const { year, month, day } = parseDateKey(dateStr);
  const d = new Date(year, month, day + daysOffset);
  return formatDateKey(d.getFullYear(), d.getMonth(), d.getDate());
};

/**
 * Calculate streak and consistency metrics from completed queue dates
 */
export const calculateConsistencyMetrics = (
  completedDates: string[],
  currentDateStr: string,
  year: number,
  monthZeroIndexed: number,
  allTopics: Topic[],
  testRecords: TestRecord[]
): ConsistencyStreakMetrics => {
  const completedSet = new Set(completedDates);

  // 1. Current streak calculation:
  // Check if today is completed:
  let currentStreak = 0;
  let checkDate = currentDateStr;

  if (completedSet.has(checkDate)) {
    // Today is completed, count backwards including today
    while (completedSet.has(checkDate)) {
      currentStreak++;
      checkDate = addDaysToDateKey(checkDate, -1);
    }
  } else {
    // Today is not yet completed; if yesterday was completed, streak is alive!
    const yesterday = addDaysToDateKey(currentDateStr, -1);
    checkDate = yesterday;
    while (completedSet.has(checkDate)) {
      currentStreak++;
      checkDate = addDaysToDateKey(checkDate, -1);
    }
  }

  // 2. Longest streak calculation:
  const sortedDates = Array.from(completedSet).sort();
  let longestStreak = 0;
  let runningStreak = 0;
  let prevDate: string | null = null;

  for (const d of sortedDates) {
    if (!prevDate) {
      runningStreak = 1;
    } else {
      const expectedNext = addDaysToDateKey(prevDate, 1);
      if (d === expectedNext) {
        runningStreak++;
      } else {
        runningStreak = 1;
      }
    }
    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
    prevDate = d;
  }

  // 3. Month specific calculations:
  const monthPrefix = `${year}-${padZero(monthZeroIndexed + 1)}`;
  const completedThisMonth = sortedDates.filter((d) => d.startsWith(monthPrefix)).length;

  // Aggregate total minutes studied in this month
  let totalMinutesThisMonth = 0;
  const activeStudyDaysSet = new Set<string>();

  allTopics.forEach((t) => {
    (t.activityHistory || []).forEach((act) => {
      if (act.date && act.date.startsWith(monthPrefix)) {
        totalMinutesThisMonth += act.timeSpentMinutes || 0;
        activeStudyDaysSet.add(act.date);
      }
    });
  });

  testRecords.forEach((test) => {
    if (test.date && test.date.startsWith(monthPrefix)) {
      totalMinutesThisMonth += test.timeMinutes || 0;
      activeStudyDaysSet.add(test.date);
    }
  });

  // Calculate month completion rate:
  // Days evaluated: either up to today (if current month), or all days in month (if past)
  const isSelectedCurrentMonth = currentDateStr.startsWith(monthPrefix);
  const { day: currentDayNum } = parseDateKey(currentDateStr);
  const totalDaysInMonth = new Date(year, monthZeroIndexed + 1, 0).getDate();

  const daysToEvaluate = isSelectedCurrentMonth
    ? Math.max(1, currentDayNum)
    : totalDaysInMonth;

  const monthCompletionRatePercent = Math.min(
    100,
    Math.round((completedThisMonth / Math.max(1, daysToEvaluate)) * 100)
  );

  return {
    currentStreakDays: currentStreak,
    longestStreakDays: Math.max(longestStreak, currentStreak),
    totalCompletedDays: completedSet.size,
    monthCompletionRatePercent,
    completedThisMonth,
    totalStudyDaysThisMonth: Math.max(completedThisMonth, activeStudyDaysSet.size),
    totalHoursThisMonth: Math.round((totalMinutesThisMonth / 60) * 10) / 10,
  };
};

/**
 * Summarize all study activities, mock tests, and scheduled reviews for a single date
 */
export const getDayActivitySummary = (
  dateStr: string,
  currentDateStr: string,
  completedDates: string[],
  allTopics: Topic[],
  testRecords: TestRecord[],
  dailyStudyQueue?: DailyStudyQueueItem[]
): DayStudyActivitySummary => {
  const isQueueCompleted = completedDates.includes(dateStr);
  const isToday = dateStr === currentDateStr;
  const isPast = dateStr < currentDateStr;
  const isFuture = dateStr > currentDateStr;

  const reviewedTopics: DayStudyActivitySummary['reviewedTopics'] = [];
  let totalMinutes = 0;
  let totalQuestions = 0;
  let correctQuestions = 0;
  const scores: number[] = [];

  // 1. Gather all activity logs for this date
  allTopics.forEach((t) => {
    (t.activityHistory || []).forEach((act) => {
      if (act.date === dateStr) {
        reviewedTopics.push({
          id: act.id,
          topicId: t.id,
          topicName: t.name,
          subjectId: t.subjectId,
          type: act.type,
          score: act.score,
          minutes: act.timeSpentMinutes || 0,
          questionsAttempted: act.questionsAttempted || 0,
          questionsCorrect: act.questionsCorrect || 0,
        });

        totalMinutes += act.timeSpentMinutes || 0;
        totalQuestions += act.questionsAttempted || 0;
        correctQuestions += act.questionsCorrect || 0;
        if (typeof act.score === 'number') scores.push(act.score);
      }
    });
  });

  // 2. Gather mock test records for this date
  const mockTests: DayStudyActivitySummary['mockTests'] = [];
  testRecords.forEach((test) => {
    if (test.date === dateStr) {
      mockTests.push({
        id: test.id,
        title: test.testType,
        score: test.scorePercent,
        minutes: test.timeMinutes || 0,
        questions: test.questions || 0,
        correct: test.correct || 0,
      });

      totalMinutes += test.timeMinutes || 0;
      totalQuestions += test.questions || 0;
      correctQuestions += test.correct || 0;
      if (typeof test.scorePercent === 'number') scores.push(test.scorePercent);
    }
  });

  // 3. Gather topics scheduled for review on this date
  const scheduledTopics: DayStudyActivitySummary['scheduledTopics'] = [];
  allTopics.forEach((t) => {
    if (t.nextReviewDate === dateStr) {
      scheduledTopics.push({
        id: t.id,
        name: t.name,
        subjectId: t.subjectId,
        urgencyLevel: t.urgencyLevel,
        isHighPriority: t.isHighPriority,
        mastery: t.mastery,
      });
    }
  });

  // Average score
  const averageScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  return {
    date: dateStr,
    isQueueCompleted,
    isToday,
    isPast,
    isFuture,
    totalMinutes,
    totalQuestions,
    correctQuestions,
    averageScore,
    reviewedTopics,
    mockTests,
    scheduledTopics,
  };
};

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const DAY_OF_WEEK_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
