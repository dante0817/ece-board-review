import { AppArtwork } from './common/AppArtwork';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';
import { triggerSubjectMastery100Confetti } from '../utils/confetti';
import { playCelebrationFanfare } from '../utils/celebrationSound';

export interface MilestoneCelebrationData {
  subjectName: string;
  category?: string;
  masteryScore: number;
  totalTopics?: number;
  unlockedDate?: string;
}

interface MasteryCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MilestoneCelebrationData | null;
}

export const MasteryCelebrationModal: React.FC<MasteryCelebrationModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire celebration fireworks and celebratory fanfare
      triggerSubjectMastery100Confetti();
      playCelebrationFanfare();
    }
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const handleReplayConfetti = () => {
    triggerSubjectMastery100Confetti();
    playCelebrationFanfare();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-950/75 backdrop-blur-md transition-opacity"
        />

        {/* Celebration Container */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 24, stiffness: 320 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 border-2 border-amber-400/80 rounded-3xl shadow-2xl p-6 sm:p-8 text-white overflow-hidden my-auto"
        >
          {/* Rotating Sunburst Halo in Background */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer z-10"
            aria-label="Close celebration"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Trophy & Sparkles Hero */}
          <div className="relative flex flex-col items-center text-center pt-2">
            {/* Pulsing Trophy Halo */}
            <div className="relative mb-5">
              <motion.div
                animate={{
                  scale: [1, 1.12, 1],
                  opacity: [0.6, 0.9, 0.6],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.4,
                  ease: 'easeInOut',
                }}
                className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full blur-xl opacity-70"
              />

              {/* Floating Stars */}
              <motion.div
                animate={{
                  y: [-4, 4, -4],
                  rotate: [0, 15, -15, 0],
                }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="absolute -top-3 -left-3 text-amber-300"
              >
                <AppArtwork name="star" inline className="w-6 h-6 fill-amber-300" />
              </motion.div>

              <motion.div
                animate={{
                  y: [4, -4, 4],
                  rotate: [0, -20, 20, 0],
                }}
                transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', delay: 0.3 }}
                className="absolute -bottom-2 -right-2 text-yellow-200"
              >
                <AppArtwork name="star" inline className="w-6 h-6" />
              </motion.div>

              {/* Trophy Emblem */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, -2, 2, 0],
                }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 p-0.5 shadow-2xl flex items-center justify-center border-2 border-yellow-200/60"
              >
                <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-stone-900 to-stone-950 flex items-center justify-center app-artwork-tile">
                  <AppArtwork name="trophy" />
                </div>
              </motion.div>
            </div>

            {/* Badge */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-wider uppercase mb-2 shadow-inner"
            >
              <AppArtwork name="trophy" inline className="w-3.5 h-3.5" />
              <span>100% Mastery Milestone</span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 tracking-tight"
            >
              Flawless Mastery Achieved!
            </motion.h2>

            {/* Subject Highlight */}
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-stone-300 text-sm sm:text-base mt-2 font-medium max-w-sm"
            >
              You have unlocked a complete <span className="font-bold text-amber-300">{data.masteryScore}% Board Ready score</span> for{' '}
              <span className="font-bold text-white underline decoration-amber-400 decoration-2 underline-offset-4">
                {data.subjectName}
              </span>
              .
            </motion.p>

            {/* Milestone Achievement Stats */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="w-full mt-6 grid grid-cols-2 gap-3 text-left"
            >
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                  <AppArtwork name="shield" inline className="w-4 h-4 text-emerald-400" />
                  <span>PRC Syllabus</span>
                </div>
                <div className="text-lg font-extrabold text-white mt-0.5">100% Primed</div>
                <div className="text-[11px] text-stone-400">All topics verified</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                  <AppArtwork name="flame" inline className="w-4 h-4 text-amber-400" />
                  <span>Mastery Level</span>
                </div>
                <div className="text-lg font-extrabold text-white mt-0.5">Level 5 / 5</div>
                <div className="text-[11px] text-stone-400">Board Exam Ready</div>
              </div>
            </motion.div>

            {/* Checklist of accomplished criteria */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="w-full mt-4 bg-amber-950/30 border border-amber-500/20 rounded-xl p-3.5 space-y-2 text-xs text-stone-300 text-left"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero persistent weak spots or diagnostic bottlenecks</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Timed accuracy requirements verified under board conditions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Spaced maintenance intervals enabled for peak exam retention</span>
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="w-full mt-6 flex flex-col sm:flex-row items-center gap-3"
            >
              <button
                type="button"
                onClick={handleReplayConfetti}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all active:scale-98 cursor-pointer"
              >
                <AppArtwork name="star" inline className="w-4 h-4" />
                <span>Replay Confetti Burst</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 hover:text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                Keep Dominating
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
