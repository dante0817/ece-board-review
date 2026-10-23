import type { ScreenType } from '../../context/ReviewContext';
import type { AppArtworkName } from '../../components/common/AppArtwork';

/** v10.57.0: Navigation registry only. Not a claim of completed lessons or TOS certification. */
export type MathGroupId = 'foundations' | 'core' | 'shared';
export type MathAvailability = 'available-draft' | 'planned';
export interface MathCatalogEntry {
  readonly id: string;
  readonly label: string;
  readonly summary: string;
  readonly icon: AppArtworkName;
  readonly tone: string;
  readonly availability: MathAvailability;
  readonly destination: ScreenType | null;
  readonly overview: readonly string[];
}
export interface MathCatalogGroup {
  readonly id: MathGroupId;
  readonly label: string;
  readonly subtitle: string;
  readonly entries: readonly MathCatalogEntry[];
}

export const MATH_CATALOG: readonly MathCatalogGroup[] = [
  {id:'foundations',label:'Mathematical Foundations',subtitle:'Essential skills for engineering mathematics',entries:[
    {id:'algebra',label:'Algebra & Functions',summary:'Equations, expressions and functions',icon:'square',tone:'blue',availability:'available-draft',destination:'algebra',overview:['Algebraic expressions and equations','Functions, graphs and polynomial models','Sequences, complex numbers and introductory matrices']},
    {id:'trigonometry',label:'Trigonometry',summary:'Identities, triangles and periodic functions',icon:'triangle',tone:'emerald',availability:'available-draft',destination:'trigonometry',overview:['Trigonometric ratios, identities and equations','Triangle applications','Graphs, vectors and angular relationships']},
    {id:'geometry',label:'Geometry & Mensuration',summary:'Plane figures, solid shapes, areas and volumes',icon:'square',tone:'indigo',availability:'available-draft',destination:'geometry',overview:['Plane geometry and mensuration','Solid geometry and mensuration','Applications and worked examples']},
    {id:'analytic-geometry',label:'Analytic Geometry',summary:'Coordinates, lines and conic sections',icon:'graph',tone:'violet',availability:'available-draft',destination:'analytic-geometry',overview:['Cartesian coordinates and straight lines','Circles, parabolas, ellipses and hyperbolas','Parametric and polar coordinates']},
  ]},
  {id:'core',label:'Core Engineering Mathematics',subtitle:'Official Mathematics competency areas',entries:[
    {id:'differential-calculus',label:'Differential Calculus',summary:'Limits, derivatives and applications',icon:'graph',tone:'cyan',availability:'planned',destination:null,overview:['Limits and continuity','Differentiation methods','Rates of change and optimization']},
    {id:'integral-calculus',label:'Integral Calculus',summary:'Integration and applications',icon:'integral',tone:'amber',availability:'planned',destination:null,overview:['Definite and indefinite integrals','Techniques of integration','Areas, volumes and multiple integration']},
    {id:'differential-equations',label:'Differential Equations',summary:'GUI pilot · 3 draft lessons · 54 planned',icon:'wave',tone:'indigo',availability:'available-draft',destination:'differential-equations',overview:['First-order equations · pilot lesson','Higher-order equations · pilot lesson','Laplace transforms · pilot lesson','Full curriculum and assessed practice remain in development']},
    {id:'advanced-engineering-math',label:'Advanced Engineering Mathematics',summary:'Complex analysis, matrices and numerical methods',icon:'matrix',tone:'violet',availability:'planned',destination:null,overview:['Complex numbers, Fourier methods and series','PDEs and systems of equations','Numerical methods']},
    {id:'probability-statistics',label:'Probability & Statistics',summary:'Engineering Data Analysis · 8 modules, 32 introductory draft lessons',icon:'graph',tone:'emerald',availability:'available-draft',destination:'probability-statistics',overview:['Obtaining data and descriptive statistics','Combinatorics and probability foundations','Random variables, distributions, sampling and estimation','Hypothesis testing, regression and design of experiments']},
  ]},
  {id:'shared',label:'Shared ECE Mathematics',subtitle:'Mathematics tracks linked to other ECE subjects',entries:[
    {id:'electromagnetic-math',label:'Electromagnetic Mathematics',summary:'Vectors and vector calculus',icon:'atom',tone:'cyan',availability:'planned',destination:null,overview:['Vector operations','Gradient, divergence and curl','Integral theorems and electromagnetic applications']},
    {id:'signal-processing-math',label:'Signal Processing Mathematics',summary:'Signals, transforms and correlation',icon:'wave',tone:'violet',availability:'planned',destination:null,overview:['Z-transforms','Convolution and correlation','Frequency-domain mathematics']},
    {id:'control-systems-math',label:'Control Systems Mathematics',summary:'Poles, response and block diagrams',icon:'chip',tone:'amber',availability:'planned',destination:null,overview:['Poles and zeros','Transient-response calculations','Block diagrams and signal-flow methods']},
  ]},
] as const;

export const AVAILABLE_MATH_ENTRIES = MATH_CATALOG.flatMap(g=>g.entries).filter(e=>e.destination!==null);
const RECENT_MATH_SUBJECT_KEY='bsece_math_recent_subject_v1';

/** Store only a successful subject-level navigation destination, never lesson progress. */
export function rememberMathSubject(screen: ScreenType): void {
  if (!AVAILABLE_MATH_ENTRIES.some(entry=>entry.destination===screen)) return;
  try { if(typeof window!=='undefined') window.localStorage.setItem(RECENT_MATH_SUBJECT_KEY,screen); } catch { /* Private storage may be unavailable. */ }
}
export function getRecentMathSubject(): MathCatalogEntry | null {
  try {
    if(typeof window==='undefined')return null;
    const screen=window.localStorage.getItem(RECENT_MATH_SUBJECT_KEY);
    return AVAILABLE_MATH_ENTRIES.find(entry=>entry.destination===screen)??null;
  } catch {return null;}
}
