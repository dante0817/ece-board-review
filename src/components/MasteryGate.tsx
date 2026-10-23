import { AppArtwork } from './common/AppArtwork';
import React, { useState } from 'react';
import { getSubjectReadiness } from '../utils/assessmentIntegrity';
import { useReview } from '../context/ReviewContext';
import { Subject, Topic, SubjectReadiness } from '../types';
import { CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface MasteryGateProps {
  subject?: Subject;
  readiness?: SubjectReadiness;
  onTopicClick?: (topic: Topic) => void;
}

export const MasteryGate: React.FC<MasteryGateProps> = ({
  subject: propSubject,
  readiness: _propReadiness,
  onTopicClick,
}) => {
  const {
    currentSubject: contextSubject,
    testRecords,
    currentDateStr,
    markSubjectMaintenance,
    openTopicDrawer,
    startReview,
  } = useReview();

  const subject = propSubject || contextSubject;

  // Optional simulation toggle for testing & reviewer evaluation
  const [showGraduationToast, setShowGraduationToast] = useState<boolean>(false);
  const [showTopicListModal, setShowTopicListModal] = useState<boolean>(false);

  const allTopics: Topic[] = subject.groups.flatMap(g => g.topics);
  const totalTopics = allTopics.length;
  const readiness = getSubjectReadiness(subject, testRecords, currentDateStr);
  const coveredTopics=allTopics.filter(t=>t.initialCovered);
  const unstudiedTopics=allTopics.filter(t=>!t.initialCovered);
  const coveragePercent=readiness.initialCoveragePercent;
  const coverageThreshold=90;
  const isCoverageMet=coveragePercent>=coverageThreshold;
  const topicsBelowL3=allTopics.filter(t=>!t.initialCovered || t.mastery===null || t.mastery<3 || t.evidenceStatus!=='verified');
  const isMasteryFloorMet=topicsBelowL3.length===0 && totalTopics>0;
  const hpAvgMastery=readiness.highPriorityAvgMastery;
  const hpThreshold=4.0;
  const isHighPriorityMet=hpAvgMastery>=hpThreshold;
  const latestMixedScore=readiness.latestMixedTestScore;
  const timedAccuracy=readiness.timedBoardAccuracy;
  const testThreshold=85;
  const isTestMet=latestMixedScore!==null && latestMixedScore>=testThreshold;
  const isTimedMet=timedAccuracy!==null && timedAccuracy>=88;
  const overdueTopics=allTopics.filter(t=>t.initialCovered && !!t.nextReviewDate && t.nextReviewDate<currentDateStr);
  const isOverdueCleared=overdueTopics.length===0;

  // Criteria definition for structured rendering
  const criteria = [
    {
      id: 'coverage',
      label: 'Syllabus Coverage',
      targetLabel: '≥ 90% covered',
      currentDisplay: `${coveragePercent}% (${coveredTopics.length}/${totalTopics})`,
      isMet: isCoverageMet,
      shortDetail:
        coveragePercent >= coverageThreshold
          ? 'Comprehensive syllabus coverage achieved'
          : `${unstudiedTopics.length} unstudied topic(s) remain`,
      actionableCount: unstudiedTopics.length,
      topics: unstudiedTopics,
    },
    {
      id: 'floor',
      label: 'Mastery Floor (Level 3+)',
      targetLabel: '0 unverified/below-L3 topics',
      currentDisplay: `${topicsBelowL3.length} topics not yet verified at L3+`,
      isMet: isMasteryFloorMet,
      shortDetail:
        topicsBelowL3.length === 0
          ? 'Zero weak topics holding back board baseline'
          : `${topicsBelowL3.length} topic(s) lack sufficient independent mastery evidence`,
      actionableCount: topicsBelowL3.length,
      topics: topicsBelowL3,
    },
    {
      id: 'high-priority',
      label: 'High-Priority Average',
      targetLabel: '≥ 4.0 / 5.0 mastery',
      currentDisplay: `${hpAvgMastery} / 5.0`,
      isMet: isHighPriorityMet,
      shortDetail:
        hpAvgMastery >= hpThreshold
          ? 'Solid foundational strength in core ECE questions'
          : `Requires ${hpThreshold - hpAvgMastery > 0 ? (hpThreshold - hpAvgMastery).toFixed(1) : 0} boost`,
      actionableCount: 0,
      topics: [],
    },
    {
      id: 'mixed-test',
      label: 'Diagnostic Mixed Test',
      targetLabel: '≥ 85% accuracy',
      currentDisplay: latestMixedScore===null ? 'Not assessed' : `${latestMixedScore}% latest`,
      isMet: isTestMet,
      shortDetail:
        latestMixedScore===null ? 'No independently scored subject assessment recorded' : latestMixedScore>=testThreshold ? 'Verified subject-level practice assessment' : 'Below app study target of 85%',
      actionableCount: 0,
      topics: [],
    },
    {
      id: 'spaced-repetition',
      label: 'Overdue Reviews Cleared',
      targetLabel: '0 overdue reviews',
      currentDisplay: `${overdueTopics.length} overdue`,
      isMet: isOverdueCleared,
      shortDetail:
        overdueTopics.length === 0
          ? 'Spaced interval schedule fully maintained'
          : `${overdueTopics.length} review(s) currently overdue`,
      actionableCount: overdueTopics.length,
      topics: overdueTopics,
    },
  ];

  criteria.push({
    id:'timed',label:'Timed Subject Assessment',targetLabel:'≥ 88% accuracy',
    currentDisplay: timedAccuracy===null?'Not assessed':`${timedAccuracy}% latest`,
    isMet:isTimedMet,
    shortDetail: timedAccuracy===null?'No independently scored timed subject assessment recorded':'App study target: 88%',
    actionableCount:0,topics:[],
  });

  const metCount = criteria.filter((c) => c.isMet).length;
  const totalCriteriaCount = criteria.length;
  const isFullyReady = readiness.isReadyForMaintenance;

  const handleToggleMaintenance = () => {
    const nextState = !subject.inMaintenance;
    if (nextState && !isFullyReady) return;
    markSubjectMaintenance(subject.id, nextState);
    if (nextState) {
      setShowGraduationToast(true);
      setTimeout(() => setShowGraduationToast(false), 3500);
    }
  };

  const handleTopicSelect = (topic: Topic) => {
    if (onTopicClick) {
      onTopicClick(topic);
    } else {
      openTopicDrawer(topic);
    }
  };

  return (
    <div className="bg-white border-2 border-stone-900 rounded-xl p-5 sm:p-6 shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center font-bold app-artwork-tile">
              <AppArtwork name="shield" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900 uppercase tracking-tight">
                  {subject.name} Readiness (Mastery Gate)
                </h2>
                {subject.inMaintenance ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Maintenance Active
                  </span>
                ) : isFullyReady ? (
                  <span className="bg-amber-100 text-amber-900 text-[11px] font-bold px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1 animate-pulse">
                    <AppArtwork name="star" inline className="w-3.5 h-3.5 text-amber-600" />
                    Readiness Met
                  </span>
                ) : (
                  <span className="bg-stone-100 text-stone-700 text-[11px] font-bold px-2 py-0.5 rounded border border-stone-300 flex items-center gap-1">
                    <AppArtwork name="padlock" inline className="w-3 h-3 text-stone-500" />
                    {totalCriteriaCount - metCount} Criteria Remaining
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                App study targets only; these are not official PRC passing criteria.
              </p>
            </div>
          </div>
        </div>

        {/* Readiness Meter & Testing Simulation */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-right">
            <div className="text-[10px] uppercase font-semibold text-stone-500">Readiness Score</div>
            <div className="text-sm font-mono font-bold text-stone-900">
              {metCount} of {totalCriteriaCount} Gates Met
            </div>
          </div>
          <div className="w-11 h-11 rounded-full border-3 border-stone-200 border-t-amber-500 flex items-center justify-center font-mono font-bold text-stone-900 text-xs shrink-0">
            {Math.round((metCount / totalCriteriaCount) * 100)}%
          </div>


        </div>
      </div>

      {showGraduationToast && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-3 animate-in fade-in">
          <AppArtwork name="star" inline className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <div className="font-bold">{subject.name} successfully graduated to Maintenance Mode!</div>
            <div className="text-[11px] text-emerald-700 mt-0.5">
              Primary daily focus can now shift to Calculus or Electronics. Algebra is scheduled for periodic maintenance retention drills.
            </div>
          </div>
        </div>
      )}

      {/* 5-Criterion Interactive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {criteria.map((c) => (
          <div
            key={c.id}
            className={`p-3.5 rounded-xl border transition-all ${
              c.isMet
                ? 'bg-emerald-50/60 border-emerald-200 text-stone-900'
                : 'bg-stone-50 border-stone-200 text-stone-800'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-bold uppercase tracking-wider text-stone-600 text-[10px]">
                {c.label}
              </span>
              {c.isMet ? (
                <span className="text-emerald-700 font-bold flex items-center gap-0.5 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Met
                </span>
              ) : (
                <span className="text-amber-700 font-semibold text-[11px]">
                  {c.targetLabel}
                </span>
              )}
            </div>

            <div className="text-base font-bold font-mono text-stone-900 mt-1">
              {c.currentDisplay}
            </div>

            <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
              {c.shortDetail}
            </p>

            {c.topics.length > 0 && !c.isMet && (
              <div className="mt-2 pt-2 border-t border-stone-200/80">
                <button
                  type="button"
                  onClick={() => setShowTopicListModal(true)}
                  className="text-[10px] text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
                >
                  <span>View {c.topics.length} blocking topic(s)</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Blocking Topics Remediation Bar (if any topics below Level 3 or overdue) */}
      {!isFullyReady && (topicsBelowL3.length > 0 || overdueTopics.length > 0) && (
        <div className="mb-5 p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Topics Blocking Maintenance Graduation ({topicsBelowL3.length + overdueTopics.length})</span>
            </div>
            <span className="text-[11px] text-amber-800">
              Click to inspect or start drill
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {topicsBelowL3.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleTopicSelect(topic)}
                className="bg-white hover:bg-amber-100/80 border border-amber-300 text-stone-800 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <span className="font-semibold">{topic.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                  {topic.evidenceStatus!=='verified' ? 'Unverified' : (topic.mastery !== null ? `L${topic.mastery}` : 'Unranked')}
                </span>
                {topic.latestScore !== null && (
                  <span className="text-[10px] font-mono text-stone-500">
                    {topic.latestScore}%
                  </span>
                )}
              </button>
            ))}

            {overdueTopics
              .filter((ot) => !topicsBelowL3.some((tb) => tb.id === ot.id))
              .map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleTopicSelect(topic)}
                  className="bg-white hover:bg-amber-100/80 border border-amber-300 text-stone-800 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <span className="font-semibold">{topic.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                    Overdue
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Graduation Status Banner & 'Move to Maintenance' Button */}
      <div className="p-4 sm:p-5 bg-stone-100 rounded-xl border border-stone-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs uppercase font-bold text-stone-500 tracking-wider flex items-center gap-1.5">
            <span>Maintenance Gate Status</span>
            <span>•</span>
            <span className="font-mono text-stone-700">
              {subject.inMaintenance
                ? 'GRADUATED'
                : isFullyReady
                ? 'READY TO GRADUATE'
                : 'REVIEWS IN PROGRESS'}
            </span>
          </div>

          <div className="text-base sm:text-lg font-bold text-stone-900">
            {subject.inMaintenance
              ? 'Maintenance Review Mode Active'
              : isFullyReady
              ? 'Readiness Thresholds Met — Ready for Maintenance'
              : `Gate Locked: Complete ${totalCriteriaCount - metCount} Remaining Target(s)`}
          </div>

          <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
            {subject.inMaintenance
              ? 'Algebra is actively retained with periodic spaced quizzes and mixed board-style problem sets, allowing full attention on secondary subjects.'
              : isFullyReady
              ? 'All app readiness thresholds (syllabus coverage, mastery floor, core mastery, test benchmark, and overdue clearance) have been achieved. Move Algebra to maintenance rotation.'
              : 'Elevate weak topics to at least Level 3 (Developing) and clear overdue reviews to unlock the maintenance graduation gate.'}
          </p>
        </div>

        {/* Action Button: 'Move to Maintenance' */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          {subject.inMaintenance ? (
            <button
              type="button"
              onClick={handleToggleMaintenance}
              className="bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold px-5 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <AppArtwork name="cycle" inline className="w-3.5 h-3.5 text-stone-600" />
              <span>Return to Primary Focus</span>
            </button>
          ) : isFullyReady ? (
            <button
              type="button"
              onClick={handleToggleMaintenance}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98"
            >
              <AppArtwork name="shield" inline className="w-4 h-4 text-emerald-200" />
              <span>MOVE TO MAINTENANCE</span>
            </button>
          ) : (
            <div className="relative group">
              <button
                type="button"
                disabled
                className="w-full sm:w-auto bg-stone-300 text-stone-500 cursor-not-allowed text-xs font-bold px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 border border-stone-300"
                title="Thresholds not yet met"
              >
                <AppArtwork name="padlock" inline className="w-3.5 h-3.5" />
                <span>MOVE TO MAINTENANCE (LOCKED)</span>
              </button>
              <div className="hidden group-hover:block absolute bottom-full mb-2 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 w-64 p-2 bg-stone-900 text-stone-100 text-[11px] rounded-lg shadow-lg z-20 pointer-events-none text-center">
                All app readiness thresholds must be met before graduating. A missing independently scored assessment remains Not assessed.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
