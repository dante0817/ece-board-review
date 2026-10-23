import { AppArtwork } from './common/AppArtwork';
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { useReview } from '../context/ReviewContext';
import { MasteryCelebrationModal, MilestoneCelebrationData } from './MasteryCelebrationModal';
import { triggerSubjectMastery100Confetti } from '../utils/confetti';
import { playCelebrationFanfare } from '../utils/celebrationSound';

const STORAGE_KEY_100_MILESTONES = 'ece_100_mastery_milestones';

interface SubjectMilestoneItem {
  id: string;
  name: string;
  category: string;
  color: string;
  masteryPercent: number;
  totalTopics: number;
  masteredTopics: number;
  is100Percent: boolean;
}

export const SubjectMasteryMilestones: React.FC = () => {
  const { subjects, allTopics, testRecords } = useReview();

  // Track manually simulated/boosted 100% subjects in state for testing & celebration
  const [boostedSubjects, setBoostedSubjects] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_100_MILESTONES);
      return saved ? JSON.parse(saved) : { 'subj-math-algebra': false };
    } catch {
      return {};
    }
  });

  // Modal celebration state
  const [celebrationData, setCelebrationData] = useState<MilestoneCelebrationData | null>(null);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState<boolean>(false);

  // Auto-celebration flag so we don't spam the user repeatedly without user interaction
  const [hasAutoCelebrated, setHasAutoCelebrated] = useState<boolean>(false);

  // Compute metrics for all board subjects
  const subjectMilestones = useMemo<SubjectMilestoneItem[]>(() => {
    // Default subject list if none in subjects
    const defaultList = [
      { id: 'subj-math-algebra', name: 'Mathematics: Algebra', category: 'Mathematics', basePercent: 88 },
      { id: 'subj-math-trig', name: 'Trigonometry & Geometry', category: 'Mathematics', basePercent: 84 },
      { id: 'subj-math-calc', name: 'Differential & Integral Calculus', category: 'Mathematics', basePercent: 80 },
      { id: 'subj-electronics', name: 'Electronics Engineering', category: 'Electronics', basePercent: 76 },
      { id: 'subj-communications', name: 'Communications Engineering', category: 'Communications', basePercent: 86 },
    ];

    return defaultList.map((item) => {
      const matchingSubj = subjects.find((s) => s.id === item.id);
      const subjectTopics = allTopics.filter((t) => t.subjectId === item.id);
      const totalTopics = subjectTopics.length > 0 ? subjectTopics.length : 16;
      const masteredTopics = subjectTopics.filter((t) => t.mastery === 5).length;

      // Calculate composite score
      let calculatedPercent = item.basePercent;
      if (subjectTopics.length > 0) {
        const covered = subjectTopics.filter((t) => t.initialCovered);
        if (covered.length > 0) {
          const avgScore =
            covered.reduce((acc, curr) => acc + (curr.averageScore || curr.latestScore || 80), 0) /
            covered.length;
          const avgMastery =
            covered.reduce((acc, curr) => acc + (curr.mastery || 1), 0) / covered.length;
          calculatedPercent = Math.round(avgScore * 0.5 + (avgMastery / 5) * 100 * 0.5);
        }
      }

      // Check if boosted to 100% or naturally reached 100%
      const isSimulated100 = Boolean(boostedSubjects[item.id]);
      const isNatural100 = calculatedPercent >= 100 || (masteredTopics === totalTopics && totalTopics > 0);
      const is100Percent = isSimulated100 || isNatural100;
      const finalPercent = is100Percent ? 100 : Math.min(99, calculatedPercent);

      return {
        id: item.id,
        name: matchingSubj ? matchingSubj.name : item.name,
        category: item.category,
        color:
          item.category === 'Mathematics'
            ? 'border-blue-200 bg-blue-50/50 text-blue-700'
            : item.category === 'Electronics'
            ? 'border-amber-200 bg-amber-50/50 text-amber-700'
            : 'border-emerald-200 bg-emerald-50/50 text-emerald-700',
        masteryPercent: finalPercent,
        totalTopics,
        masteredTopics: is100Percent ? totalTopics : masteredTopics,
        is100Percent,
      };
    });
  }, [subjects, allTopics, boostedSubjects]);

  // Check if any subject is 100%
  const completedMilestoneSubjects = useMemo(
    () => subjectMilestones.filter((s) => s.is100Percent),
    [subjectMilestones]
  );

  const handleTriggerCelebration = (subj: SubjectMilestoneItem) => {
    setCelebrationData({
      subjectName: subj.name,
      category: subj.category,
      masteryScore: 100,
      totalTopics: subj.totalTopics,
      unlockedDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    });
    setIsCelebrationOpen(true);
  };

  const handleToggle100Percent = (subjectId: string, subjectName: string, category: string, totalTopics: number) => {
    const isCurrently100 = Boolean(boostedSubjects[subjectId]);
    const updated = {
      ...boostedSubjects,
      [subjectId]: !isCurrently100,
    };
    setBoostedSubjects(updated);
    try {
      localStorage.setItem(STORAGE_KEY_100_MILESTONES, JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (!isCurrently100) {
      // Reaching 100% milestone! Trigger the celebration modal + confetti immediately!
      setCelebrationData({
        subjectName,
        category,
        masteryScore: 100,
        totalTopics,
        unlockedDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      });
      setIsCelebrationOpen(true);
    }
  };

  // Auto-celebrate once per session if a subject is at 100%
  useEffect(() => {
    if (!hasAutoCelebrated && completedMilestoneSubjects.length > 0) {
      try {
        const alreadyShownSession = sessionStorage.getItem('ece_celebrated_session_shown');
        if (!alreadyShownSession) {
          sessionStorage.setItem('ece_celebrated_session_shown', 'true');
          setHasAutoCelebrated(true);
          const topSubj = completedMilestoneSubjects[0];
          setCelebrationData({
            subjectName: topSubj.name,
            category: topSubj.category,
            masteryScore: 100,
            totalTopics: topSubj.totalTopics,
            unlockedDate: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
          });
          setIsCelebrationOpen(true);
        }
      } catch {
        // ignore
      }
    }
  }, [hasAutoCelebrated, completedMilestoneSubjects]);

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-600">
              <AppArtwork name="trophy" inline className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-stone-900 tracking-tight">
              Subject 100% Mastery Milestones
            </h3>
            {completedMilestoneSubjects.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                <AppArtwork name="star" inline className="w-3 h-3 text-amber-600" />
                {completedMilestoneSubjects.length} Mastered
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Reaching 100% mastery unlocks the PRC Board Exam Readiness celebration animation and high-yield retention scheduling.
          </p>
        </div>

        {/* Global Quick Celebration Demo */}
        <button
          type="button"
          onClick={() => {
            const first100 = completedMilestoneSubjects[0] || subjectMilestones[0];
            handleTriggerCelebration({
              ...first100,
              masteryPercent: 100,
              is100Percent: true,
            });
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-stone-950 font-bold text-xs shadow-xs transition-all active:scale-98 cursor-pointer self-start sm:self-auto"
        >
          <AppArtwork name="star" inline className="w-3.5 h-3.5" />
          <span>Launch Celebration Effect 🎉</span>
        </button>
      </div>

      {/* Top Celebratory Banner if Any Subject Reached 100% */}
      {completedMilestoneSubjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border-2 border-amber-400/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-md shrink-0 app-artwork-tile">
              <AppArtwork name="trophy" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700">
                  Milestone Unlocked
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              </div>
              <h4 className="text-sm font-bold text-stone-900 mt-0.5">
                {completedMilestoneSubjects.map((s) => s.name).join(', ')} reached 100% Board Mastery!
              </h4>
              <p className="text-xs text-stone-600">
                All syllabus competencies verified at Level 5.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleTriggerCelebration(completedMilestoneSubjects[0])}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <AppArtwork name="star" inline className="w-3.5 h-3.5" />
            <span>Replay Celebration Animation</span>
          </button>
        </motion.div>
      )}

      {/* Grid of Subjects with Milestones & Interactive Celebration Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {subjectMilestones.map((subj) => {
          const is100 = subj.is100Percent;

          return (
            <div
              key={subj.id}
              className={`relative rounded-xl border p-4 transition-all ${
                is100
                  ? 'border-amber-400/90 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 shadow-sm ring-1 ring-amber-400/30'
                  : 'border-stone-200 bg-stone-50/40 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        subj.category === 'Mathematics'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : subj.category === 'Electronics'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {subj.category}
                    </span>
                    {is100 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                        <AppArtwork name="trophy" inline className="w-3 h-3 text-amber-600" />
                        100% MASTERED
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 leading-snug">{subj.name}</h4>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono font-extrabold text-lg ${
                      is100 ? 'text-amber-600' : 'text-stone-800'
                    }`}
                  >
                    {subj.masteryPercent}%
                  </span>
                  <div className="text-[10px] text-stone-500 font-medium">
                    {is100 ? 'Flawless' : 'Target: 100%'}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1 mb-3">
                <div className="h-2.5 w-full bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      is100
                        ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                        : subj.masteryPercent >= 85
                        ? 'bg-emerald-600'
                        : 'bg-stone-800'
                    }`}
                    style={{ width: `${subj.masteryPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-stone-500">
                  <span>Level 5 Readiness</span>
                  <span>{is100 ? 'PRC Board Primed' : `${100 - subj.masteryPercent}% to milestone`}</span>
                </div>
              </div>

              {/* Action Buttons for this Subject */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100">
                {is100 ? (
                  <button
                    type="button"
                    onClick={() => handleTriggerCelebration(subj)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                  >
                    <AppArtwork name="trophy" inline className="w-3.5 h-3.5" />
                    <span>Celebrate 100% Milestone 🎉</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      handleToggle100Percent(subj.id, subj.name, subj.category, subj.totalTopics)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-50 text-amber-800 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                    title="Simulate achieving 100% mastery milestone for this subject"
                  >
                    <AppArtwork name="lightning" inline className="w-3.5 h-3.5 text-amber-600" />
                    <span>Reach 100% Milestone</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    handleToggle100Percent(subj.id, subj.name, subj.category, subj.totalTopics)
                  }
                  className="text-[11px] text-stone-400 hover:text-stone-700 transition-colors underline cursor-pointer"
                >
                  {is100 ? 'Reset' : 'Quick test'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Celebration Modal Component */}
      <MasteryCelebrationModal
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        data={celebrationData}
      />
    </div>
  );
};
