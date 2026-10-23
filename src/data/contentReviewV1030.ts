/**
 * v10.30 editorial review ledger. A flagged course assignment remains a
 * PROVISIONAL historical mapping, not evidence of official subtopic coverage.
 * Evidence is from PRC Resolution 10 s.2022, Annex A (25-page TOS PDF).
 * No question key, learner result, or preexisting item ID is changed here.
 */
export type ContentReviewSeverity = 'high' | 'medium';
export type ContentReviewFinding = {
  familyId: string;
  severity: ContentReviewSeverity;
  finding: string;
  evidence: string;
  disposition: 'subtopic-not-demonstrated' | 'subtopic-expert-review';
};

export const CONTENT_REVIEW_FINDINGS_V1030: readonly ContentReviewFinding[] = [
  {
    familyId:'v1016-math-coulomb-force', severity:'high', disposition:'subtopic-not-demonstrated',
    finding:'Coulomb force is currently assigned to the Mathematics Electromagnetics course, although its stated Annex A topics are vector analysis, gradient/divergence/curl, and vector integral theorems. The numerical point-charge force item does not demonstrate one of those Mathematics subtopics.',
    evidence:'PRC TOS Annex A, Mathematics, Electromagnetic (shares with Electronics), PDF page 2 (1-indexed).',
  },
  {
    familyId:'v1016-math-discrete-rms', severity:'high', disposition:'subtopic-not-demonstrated',
    finding:'Four-sample RMS is currently assigned to Mathematics Signals/Spectra/Signal Processing. The three enumerated Mathematics subtopics are Z-transforms, convolution, and correlation; this question does not assess any of the three.',
    evidence:'PRC TOS Annex A, Mathematics, Signals/Spectra/Signal Processing, PDF page 2 (1-indexed).',
  },
  {
    familyId:'v1016-math-arithmetic-mean', severity:'medium', disposition:'subtopic-expert-review',
    finding:'Arithmetic mean is useful foundational statistics, but the Engineering Data Analysis subtopic-level link should be justified rather than inferred from the course name alone.',
    evidence:'PRC TOS Annex A, Mathematics, Engineering Data Analysis, PDF page 2 (1-indexed).',
  },
  {
    familyId:'v1016-math-weighted-mean', severity:'medium', disposition:'subtopic-expert-review',
    finding:'Weighted mean is useful foundational statistics, but the Engineering Data Analysis subtopic-level link should be justified rather than inferred from the course name alone.',
    evidence:'PRC TOS Annex A, Mathematics, Engineering Data Analysis, PDF page 2 (1-indexed).',
  },
  {
    familyId:'v1016-est-dac-code-voltage', severity:'medium', disposition:'subtopic-expert-review',
    finding:'Ideal DAC scaling is potentially relevant to interfacing, but the currently assigned EST Electronics 3 course does not explicitly name DAC quantization. An expert must assess the link.',
    evidence:'PRC TOS Annex A, EST, Electronics 3: Electronic Systems and Design, PDF page 21 (1-indexed).',
  },
];
export const contentReviewFinding = (familyId: string | undefined) =>
  CONTENT_REVIEW_FINDINGS_V1030.find(f=>f.familyId===familyId) ?? null;
