import { AppArtwork } from './common/AppArtwork';
import { BOARD_EXPANSION_QUESTIONS } from '../data/boardExpansionQuestions';
import { FeatureIcon } from './common/FeatureIcon';
import React, { useState, useMemo } from 'react';
import { useReview } from '../context/ReviewContext';
import { TreeMenuHeader } from './TreeMenuHeader';
import { FlashcardsModal } from './FlashcardsModal';
import { Topic } from '../types';
import { SubjectProTipWidget } from './SubjectProTipWidget';
import { ArrowRight, LayoutGrid } from 'lucide-react';

interface BoardSubjectScreenProps {
  category: 'geas' | 'electronics' | 'est';
}

export const BoardSubjectScreen: React.FC<BoardSubjectScreenProps> = ({ category }) => {
  const { allTopics, openTopicDrawer, startReview, setCurrentScreen } = useReview();

  // Flashcards state
  const [isFlashcardsModalOpen, setIsFlashcardsModalOpen] = useState<boolean>(false);
  const [activeFlashcardTopics, setActiveFlashcardTopics] = useState<Topic[]>([]);
  const [activeMaterial, setActiveMaterial] = useState<string>('');
  const [activeModalTitle, setActiveModalTitle] = useState<string>('');

  const bankArea = category;
  const originalQuestions=BOARD_EXPANSION_QUESTIONS.filter(q=>q.id.startsWith(`v1014-${bankArea}-`));
  const newFamilies=new Set(originalQuestions.map(q=>q.questionFamilyId)).size;

  const config = {
    geas: {
      title: 'General Engineering & Applied Sciences (GEAS)',
      shortTitle: 'GEAS',
      code: 'GEAS',
      weight: '20% weight',
      quote: '“Engineering physics and chemistry form the material bedrock of modern electronics.”',
      focus: 'Engineering Mechanics',
      modules: [
        { name: 'Engineering Mechanics', topics: 24, completed: 0, status: 'Not Started' },
        { name: 'Strength of Materials', topics: 18, completed: 0, status: 'Not Started' },
        { name: 'Engineering Economics', topics: 20, completed: 0, status: 'Not Started' },
        { name: 'Thermodynamics', topics: 16, completed: 0, status: 'Not Started' },
        { name: 'Engineering Chemistry', topics: 14, completed: 0, status: 'Not Started' },
        { name: 'Physics for Engineers', topics: 4, completed: 0, status: 'Not Started' },
        { name: 'Physics 2', topics: 4, completed: 0, status: 'Not Started' },
        { name: 'Engineering Materials', topics: 12, completed: 0, status: 'Not Started' },
        { name: 'ECE Laws & Ethics (RA 9292)', topics: 10, completed: 0, status: 'Not Started' },
      ],
    },
    electronics: {
      title: 'Electronics Engineering',
      shortTitle: 'Electronics',
      code: 'ECE',
      weight: '30% weight',
      quote: '“Mastering semiconductor physics turns silicon into boundless intelligence.”',
      focus: 'Semiconductor Diodes & BJTs',
      modules: [
        { name: 'Semiconductors & Diodes', topics: 22, completed: 1, status: 'In Progress' },
        { name: 'BJT & FET Amplifiers', topics: 26, completed: 0, status: 'Not Started' },
        { name: 'Operational Amplifiers (Op-Amps)', topics: 18, completed: 0, status: 'Not Started' },
        { name: 'Power Supplies & Regulators', topics: 14, completed: 0, status: 'Not Started' },
        { name: 'Digital Logic Circuits', topics: 28, completed: 0, status: 'Not Started' },
        { name: 'Microprocessors & Microcontrollers', topics: 20, completed: 0, status: 'Not Started' },
        { name: 'Industrial Electronics & Control', topics: 16, completed: 0, status: 'Not Started' },
        { name: 'Electronic Instruments & Measurement', topics: 14, completed: 0, status: 'Not Started' },
      ],
    },
    est: {
      title: 'Electronics Systems & Technologies (EST)',
      shortTitle: 'EST',
      code: 'EST',
      weight: '30% weight',
      quote: '“Communication bridges minds across horizons, from HF wire to space constellations.”',
      focus: 'Analog & Digital Modulation',
      modules: [
        { name: 'Signals, Spectra & Noise', topics: 18, completed: 0, status: 'Not Started' },
        { name: 'Analog Modulation (AM/FM/PM)', topics: 22, completed: 0, status: 'Not Started' },
        { name: 'Digital Communications & Coding', topics: 24, completed: 0, status: 'Not Started' },
        { name: 'Transmission Lines & Waveguides', topics: 20, completed: 0, status: 'Not Started' },
        { name: 'Antennas & Wave Propagation', topics: 26, completed: 0, status: 'Not Started' },
        { name: 'Microwave & Satellite Communications', topics: 18, completed: 0, status: 'Not Started' },
        { name: 'Fiber Optic Communications', topics: 16, completed: 0, status: 'Not Started' },
        { name: 'Data Communications & Networking', topics: 24, completed: 0, status: 'Not Started' },
      ],
    },
  }[category];


  // Curate topics and current syllabus material for Gemini flashcard synthesis
  const subjectTopics = useMemo(() => {
    return allTopics.filter(
      (t) =>
        t.subjectId === (category==='geas'?'subj-geas':category==='electronics'?'subj-electronics':'subj-communications') ||
        config.modules.some((m) => t.name.toLowerCase().includes(m.name.toLowerCase()))
    );
  }, [allTopics, category, config]);

  const currentSubjectMaterial = useMemo(() => {
    return [
      `SUBJECT SYLLABUS: ${config.title} (${config.shortTitle})`,
      `PRC ECE Board Exam Weight: ${config.weight}`,
      `Core Syllabus Focus: ${config.focus}`,
      `Guiding Engineering Principle: ${config.quote}`,
      `Key Syllabus Modules & Topic Breakdown:`,
      ...config.modules.map(
        (m, idx) =>
          `• Module ${idx+1}: ${m.name} (outline only; content not verified)`
      ),
    ].join('\n');
  }, [config]);

  const handleGenerateSubjectFlashcards = () => {
    setActiveFlashcardTopics(subjectTopics);
    setActiveMaterial(currentSubjectMaterial);
    setActiveModalTitle(`${config.shortTitle} Board Review Flashcards`);
    setIsFlashcardsModalOpen(true);
  };

  const handleGenerateModuleFlashcards = (moduleName: string) => {
    const matchedTopics = allTopics.filter(
      (t) =>
        t.name.toLowerCase().includes(moduleName.toLowerCase()) ||
        (t.whyWeakReasons && t.whyWeakReasons.some((r) => r.toLowerCase().includes(moduleName.toLowerCase())))
    );

    const moduleMaterial = [
      `SUBJECT: ${config.title} (${config.shortTitle})`,
      `MODULE FOCUS: ${moduleName}`,
      `PRC ECE Board Exam Weight: ${config.weight}`,
      `Key Concepts & Problem Formulations for ${moduleName}:`,
      `- Standard formulas, derivation steps, unit analysis, and calculator techniques`,
      `- High-yield board exam questions, trap distractors, and standard approximations`,
      `- PRC ECE syllabus coverage for ${moduleName}`,
    ].join('\n');

    setActiveFlashcardTopics(matchedTopics);
    setActiveMaterial(moduleMaterial);
    setActiveModalTitle(`${moduleName} Flashcards (Gemini AI)`);
    setIsFlashcardsModalOpen(true);
  };

  const handleStart = (moduleName: string) => {
    const matched = allTopics.find((t) => t.name.toLowerCase()===moduleName.toLowerCase());
    if (matched) {
      startReview(matched, 'Practice Problems');
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#f4f7fb]">
      {/* Top Header / Breadcrumbs (OUTSIDE the scrollbar - pinned at top, remains accessible when scrolling) */}
      <TreeMenuHeader
        items={[
          { label: 'Board Subjects', onClick: () => setCurrentScreen('subjects') },
          { label: config.shortTitle, isActive: true },
        ]}
        backButton={{
          label: 'Back to Board Subjects',
          onClick: () => setCurrentScreen('subjects'),
        }}
      />

      {/* Main Container - scrollbar starts strictly below the navigation bar */}
      <div className="flex-1 overflow-y-auto pb-16">
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3.5">
            <FeatureIcon name={category} />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {config.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Board Subject <span className="mx-1">•</span> {config.weight}
              </p>
            </div>
          </div>
        </div>

        <div className="hidden lg:block text-right max-w-xs">
          <p className="italic text-xs sm:text-sm text-slate-500 font-serif leading-relaxed">
            {config.quote}
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-blue-950">
          <strong>{originalQuestions.length} original numerical practice variants</strong> in {newFamilies} problem families are available for this subject.
          These are authored practice questions, <strong>not verified PRC TOS coverage or full lessons</strong>.
        </p>
        <button type="button" onClick={()=>setCurrentScreen('mock-exams')}
          className="px-4 py-2 bg-blue-700 text-white hover:bg-blue-800 rounded-lg text-xs font-bold">
          Open Timed Question Practice →
        </button>
      </div>

      {/* Pro-Tip Widget: High-yield memorization techniques & mnemonics */}
      <SubjectProTipWidget category={category} />

      {/* Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 app-artwork-tile">
              <AppArtwork name="book" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight uppercase">
                {config.shortTitle} Syllabus & Review
              </h2>
              <p className="text-xs text-slate-500">
                Board subject outline. Most modules are not yet connected to validated lessons or assessments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
              <AppArtwork name="target" inline className="w-3.5 h-3.5 text-blue-600" />
              <span>Recommended Focus: <strong>{config.focus}</strong></span>
            </span>

            <button
              id={`btn-generate-flashcards-${category}`}
              type="button"
              onClick={handleGenerateSubjectFlashcards}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
              title="Use Gemini AI to create summary flashcards based on this board review syllabus"
            >
              <AppArtwork name="star" inline className="w-3.5 h-3.5 text-stone-950 fill-stone-950/20" />
              <span>Generate Flashcards</span>
              <span className="px-1.5 py-0.2 rounded-sm bg-stone-900 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                Gemini AI
              </span>
            </button>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="pt-5 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {config.shortTitle} Topic Modules
              </h3>
            </div>
            <button
              type="button"
              onClick={handleGenerateSubjectFlashcards}
              className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <AppArtwork name="star" inline className="w-3.5 h-3.5 text-amber-600" />
              <span>Generate summary cards from all {config.modules.length} modules</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {config.modules.map((m, idx) => (
              <div
                key={idx}
                className="bg-[#fcfdfe] border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between hover:border-blue-300 hover:shadow-xs transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-400">#0{idx + 1}</span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        m.status === 'In Progress'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {category==='geas' && (m.name==='Physics for Engineers'||m.name==='Physics 2') ? 'Curriculum available' : 'Content not yet available'}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm leading-snug">{m.name}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    <strong className="font-semibold text-slate-700">Not mapped to verified content</strong>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => category==='geas' && (m.name==='Physics for Engineers'||m.name==='Physics 2') ? setCurrentScreen('physics') : handleStart(m.name)}
                    disabled={!(category==='geas' && (m.name==='Physics for Engineers'||m.name==='Physics 2')) && !allTopics.some(t => t.name.toLowerCase()===m.name.toLowerCase())}
                    className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-200 text-blue-600 font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{category==='geas' && (m.name==='Physics for Engineers'||m.name==='Physics 2') ? 'Open Physics' : 'Unavailable'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenerateModuleFlashcards(m.name)}
                    className="py-1.5 px-2.5 rounded-lg border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-900 font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title={`Generate summary flashcards for ${m.name} with Gemini AI`}
                  >
                    <AppArtwork name="star" inline className="w-3 h-3 text-amber-700" />
                    <span className="text-[11px]">Cards</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="rounded-2xl bg-[#ebf3fc] border border-blue-100/90 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0 app-artwork-tile">
            <AppArtwork name="cap" />
          </div>
          <p className="italic text-slate-600 font-serif text-xs sm:text-sm">
            {config.quote}
          </p>
        </div>
        <div className="text-slate-400 font-semibold text-[11px] tracking-wider uppercase">
          ECE Board Review
        </div>
      </div>
        </div>
      </div>

      {/* AI-Powered Flashcards Modal */}
      <FlashcardsModal
        isOpen={isFlashcardsModalOpen}
        onClose={() => setIsFlashcardsModalOpen(false)}
        selectedTopics={activeFlashcardTopics}
        subjectName={config.title}
        material={activeMaterial}
        title={activeModalTitle || `${config.shortTitle} Board Review Flashcards`}
      />
    </div>
  );
};
