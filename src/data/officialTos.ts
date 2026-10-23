/**
 * PRC Professional Regulatory Board of Electronics Engineering,
 * Resolution No. 10 (s. 2022), Annex A: Enhanced Tables of Specifications.
 * https://www.prc.gov.ph/sites/default/files/EE2022-10%20TOS.pdf
 * Official items are PER SUBJECT (100 each), not across the four-subject exam.
 * Only course-level rows are represented here. Subtopic/difficulty-cell auditing
 * remains outstanding. Mapping denotes editorial alignment, NOT PRC approval.
 */
export const OFFICIAL_TOS_SOURCE = {
  id: 'prc-eele-resolution-10-2022-annex-a',
  title: 'Enhanced Tables of Specifications — EELE (Resolution No. 10 s. 2022, Annex A)',
  url: 'https://www.prc.gov.ph/sites/default/files/EE2022-10%20TOS.pdf',
  resolution: 'https://www.prc.gov.ph/sites/default/files/EE2022-10%20published.pdf',
} as const;

export type TosAreaId = 'math' | 'geas' | 'electronics' | 'est';
export interface TosCourse {
  id: string;
  areaId: TosAreaId;
  name: string;
  officialItems: number;  // out of 100 within this board subject
  pdfPage: number;        // 1-indexed pages of Annex A
}

export const OFFICIAL_TOS_COURSES: readonly TosCourse[] = [
  {id:'math-differential',areaId:'math',name:'Differential Calculus',officialItems:15,pdfPage:1},
  {id:'math-integral',areaId:'math',name:'Integral Calculus',officialItems:15,pdfPage:1},
  {id:'math-differential-equations',areaId:'math',name:'Differential Equation',officialItems:15,pdfPage:1},
  {id:'math-advanced',areaId:'math',name:'Advanced Engineering Mathematics for ECE',officialItems:15,pdfPage:1},
  {id:'math-data-analysis',areaId:'math',name:'Engineering Data Analysis',officialItems:15,pdfPage:2},
  {id:'math-electromagnetics',areaId:'math',name:'Electromagnetic (shares with Electronics)',officialItems:9,pdfPage:2},
  {id:'math-signals',areaId:'math',name:'Signals, Spectra & Signal Processing (shares with EST)',officialItems:8,pdfPage:2},
  {id:'math-control',areaId:'math',name:'Feedback and Control Systems (shares with Electronics)',officialItems:8,pdfPage:2},
  {id:'geas-chemistry',areaId:'geas',name:'Chemistry for Engineers',officialItems:10,pdfPage:6},
  {id:'geas-physics',areaId:'geas',name:'Physics for Engineers',officialItems:15,pdfPage:6},
  {id:'geas-economics',areaId:'geas',name:'Engineering Economics',officialItems:6,pdfPage:6},
  {id:'geas-management',areaId:'geas',name:'Engineering Management',officialItems:9,pdfPage:7},
  {id:'geas-technopreneurship',areaId:'geas',name:'Technopreneurship 101',officialItems:10,pdfPage:7},
  {id:'geas-physics2',areaId:'geas',name:'Physics 2',officialItems:10,pdfPage:7},
  {id:'geas-materials',areaId:'geas',name:'Materials Science and Engineering',officialItems:8,pdfPage:7},
  {id:'geas-programming',areaId:'geas',name:'Computer Programming',officialItems:10,pdfPage:8},
  {id:'geas-environment',areaId:'geas',name:'Environment Science and Engineering',officialItems:10,pdfPage:8},
  {id:'geas-law',areaId:'geas',name:'ECE Laws, Contracts, Ethics, Standards & Safety',officialItems:10,pdfPage:9},
  {id:'geas-cad',areaId:'geas',name:'CAD',officialItems:2,pdfPage:9},
  {id:'electronics-dc',areaId:'electronics',name:'DC Electrical Circuits',officialItems:12,pdfPage:15},
  {id:'electronics-ac',areaId:'electronics',name:'AC Electrical Circuits',officialItems:12,pdfPage:15},
  {id:'electronics-electromagnetics',areaId:'electronics',name:'Electromagnetics (shared with Mathematics)',officialItems:8,pdfPage:15},
  {id:'electronics-devices',areaId:'electronics',name:'Electronic Devices and Circuits',officialItems:14,pdfPage:15},
  {id:'electronics-analysis',areaId:'electronics',name:'Electronic Circuit Analysis and Design',officialItems:14,pdfPage:16},
  {id:'electronics-systems',areaId:'electronics',name:'Electronic Systems and Design (shared with EST)',officialItems:8,pdfPage:16},
  {id:'electronics-logic',areaId:'electronics',name:'Logic Circuits and Switching Theory',officialItems:12,pdfPage:16},
  {id:'electronics-microcontrollers',areaId:'electronics',name:'Microprocessor & Microcontroller Systems and Design',officialItems:12,pdfPage:17},
  {id:'electronics-control',areaId:'electronics',name:'Feedback and Control Systems (shared with Mathematics)',officialItems:8,pdfPage:17},
  {id:'est-signals',areaId:'est',name:'Signals, Spectra, Signal Processing',officialItems:10,pdfPage:20},
  {id:'est-principles',areaId:'est',name:'Principles of Communications',officialItems:25,pdfPage:20},
  {id:'est-digital',areaId:'est',name:'Digital Communications',officialItems:15,pdfPage:20},
  {id:'est-transmission',areaId:'est',name:'Transmission and Antenna Systems',officialItems:23,pdfPage:21},
  {id:'est-systems',areaId:'est',name:'Electronics 3: Electronic Systems and Design',officialItems:7,pdfPage:21},
  {id:'est-data',areaId:'est',name:'Data Communications',officialItems:20,pdfPage:21},
];

/** Editorial one-to-one category mapping for demonstrable v10.14 problem families.
 * An unmapped bank item stays unmapped. Entries are PROVISIONAL and await
 * expert review of content, subtopic, difficulty and correct answers. */
export const TOS_FAMILY_COURSE: Readonly<Record<string,string>> = {
  'v1014-geas-newton':'geas-physics',
  'v1014-geas-kinetic-energy':'geas-physics',
  'v1014-geas-mechanical-power':'geas-physics',
  'v1014-geas-hydrostatic-pressure':'geas-physics',
  'v1014-geas-boyle':'geas-physics2',
  'v1014-geas-sensible-heat':'geas-physics2',
  'v1014-geas-stress':'geas-materials',
  'v1014-geas-strain':'geas-materials',
  'v1014-geas-efficiency':'geas-physics',
  'v1014-geas-simple-interest':'geas-economics',
  'v1014-geas-present-value':'geas-economics',
  'v1014-geas-density':'geas-materials',
  'v1014-geas-moles':'geas-chemistry',
  'v1014-geas-molarity':'geas-chemistry',
  'v1014-geas-acidity':'geas-chemistry',
  'v1014-geas-projectile-height':'geas-physics',
  'v1014-electronics-divider':'electronics-dc',
  'v1014-electronics-series':'electronics-dc',
  'v1014-electronics-parallel':'electronics-dc',
  'v1014-electronics-rc-time':'electronics-dc',
  'v1014-electronics-rl-time':'electronics-dc',
  'v1014-electronics-rc-cutoff':'electronics-analysis',
  'v1014-electronics-inverting-amp':'electronics-analysis',
  'v1014-electronics-noninverting-amp':'electronics-analysis',
  'v1014-electronics-bjt-beta':'electronics-devices',
  'v1014-electronics-transistor-power':'electronics-devices',
  'v1014-electronics-diode-resistor':'electronics-devices',
  'v1014-electronics-rms-sine':'electronics-ac',
  'v1014-electronics-led-resistor':'electronics-devices',
  'v1014-electronics-adc-step':'electronics-systems',
  'v1014-electronics-ripple-frequency':'electronics-devices',
  'v1014-electronics-coulomb-charge':'electronics-dc',
  'v1014-est-nyquist-sampling':'est-signals',
  'v1014-est-pcm-bitrate':'est-digital',
  'v1014-est-wavelength':'est-transmission',
  'v1014-est-quarterwave':'est-transmission',
  'v1014-est-shannon':'est-digital',
  'v1014-est-power-gain':'est-transmission',
  'v1014-est-qam-bits':'est-digital',
  'v1014-est-propagation-delay':'est-transmission',
  'v1014-est-am-bandwidth':'est-principles',
  'v1014-est-carson':'est-principles',
  'v1014-est-baudrate':'est-digital',
  'v1014-est-bit-duration':'est-digital',
  'v1014-est-fiber-delay':'est-transmission',
  'v1014-est-channel-spacing':'est-digital',
  'v1014-est-packet-efficiency':'est-data',
  'v1014-est-attenuation':'est-transmission',
};

/** v10.16 course assignments for ORIGINAL practice families.
 * Assignment is reviewed for course plausibility, not PRC approval or subtopic certification. */
export const TOS_V1016_FAMILY_COURSE: Readonly<Record<string,string>> = {
  'v1016-math-arithmetic-mean':'math-data-analysis',
  'v1016-math-weighted-mean':'math-data-analysis',
  'v1016-math-coulomb-force':'math-electromagnetics',
  'v1016-math-discrete-rms':'math-signals',
  'v1016-math-percent-overshoot':'math-control',
  'v1016-geas-cost-performance-index':'geas-management',
  'v1016-geas-startup-breakeven':'geas-technopreneurship',
  'v1016-geas-nested-loop-count':'geas-programming',
  'v1016-geas-pollutant-removal':'geas-environment',
  'v1016-geas-cad-scale':'geas-cad',
  'v1016-electronics-faraday-emf':'electronics-electromagnetics',
  'v1016-electronics-binary-truth-table':'electronics-logic',
  'v1016-electronics-timer-overflow':'electronics-microcontrollers',
  'v1016-electronics-type-zero-error':'electronics-control',
  'v1016-est-dac-code-voltage':'est-systems',
  'v1016-est-stop-wait-throughput':'est-data',
};

/** Small manually inspected subset of original question stems.
 * All remaining legacy questions are deliberately NOT classified by fuzzy matching. */
export const TOS_LEGACY_QUESTION_COURSE: Readonly<Record<string,string>> = {
  'mock-q-05':'math-advanced', 'mock-q-07':'math-advanced',
  'mock-q-10':'math-differential', 'mock-q-26':'math-integral', 'mock-q-27':'math-differential-equations',
  'mock-q-11':'electronics-devices', 'mock-q-12':'electronics-devices',
  'mock-q-13':'electronics-analysis', 'mock-q-14':'electronics-logic', 'mock-q-15':'electronics-devices',
  'mock-q-23':'electronics-devices', 'mock-q-28':'electronics-devices',
  'mock-q-29':'electronics-analysis', 'mock-q-33':'electronics-analysis',
  'mock-q-16':'est-principles','mock-q-17':'est-principles',
  'mock-q-18':'est-transmission','mock-q-19':'est-transmission','mock-q-20':'est-digital',
  'mock-q-24':'est-transmission','mock-q-25':'est-transmission','mock-q-30':'est-signals',
  'mock-q-31':'est-principles','mock-q-34':'est-transmission',
};
