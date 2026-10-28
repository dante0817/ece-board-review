/**
 * Physics curriculum scaffold — PRC Electronics Engineers 2022 TOS.
 *
 * This is an EDITORIAL mapping and development roadmap, not PRC approval,
 * a verified question bank, or finished lesson content.
 * Course and group IDs are stable so future lessons/questions can share them.
 */
export type PhysicsCourseId = 'geas-physics' | 'geas-physics2';
export type PhysicsCognitiveLevel =
  | 'knowledge' | 'comprehension' | 'application' | 'analysis' | 'synthesis';

export interface PhysicsCourse {
  id: PhysicsCourseId;
  title: string;
  officialItems: number;
  description: string;
}
export interface PhysicsTosGroup {
  id: string;
  courseId: PhysicsCourseId;
  title: string;
  officialItems: number;
  cognitive: Readonly<Record<PhysicsCognitiveLevel, number>>;
  lessonIds: readonly string[];
  note: string;
}
export interface PhysicsLessonOutline {
  id: string;
  title: string;
  objective: string;
  status: 'planned';
}
const cells = (knowledge=0,comprehension=0,application=0,analysis=0,synthesis=0) =>
  ({knowledge,comprehension,application,analysis,synthesis}) as const;

export const PHYSICS_COURSES: readonly PhysicsCourse[] = [
  { id:'geas-physics', title:'Physics for Engineers', officialItems:15,
    description:'Fundamental mechanics, waves, thermal physics, electricity, magnetism and optics. Board blueprint emphasizes knowledge and comprehension.' },
  { id:'geas-physics2', title:'Physics 2', officialItems:10,
    description:'Thermodynamics, modern and condensed-matter physics, induction, AC and optics. Board blueprint emphasizes application, analysis and synthesis.' },
];

export const PHYSICS_LESSONS: readonly PhysicsLessonOutline[] = [
  {id:'phys-units-vectors',title:'Measurements, Units and Vectors',objective:'Interpret SI quantities and resolve vectors into components.',status:'planned'},
  {id:'phys-kinematics-1d',title:'One-Dimensional Motion',objective:'Relate displacement, velocity, acceleration and motion graphs.',status:'planned'},
  {id:'phys-kinematics-2d',title:'Two-Dimensional and Projectile Motion',objective:'Separate horizontal and vertical motion under stated assumptions.',status:'planned'},
  {id:'phys-newtons-laws',title:'Newton\'s Laws and Applied Forces',objective:'Recognize inertia, net force, friction and free-body diagrams.',status:'planned'},
  {id:'phys-work-energy',title:'Work and Energy Conservation',objective:'Connect work, kinetic and potential energy with conservation laws.',status:'planned'},
  {id:'phys-power',title:'Power and Mechanical Efficiency',objective:'Distinguish work, power, and energy efficiency.',status:'planned'},
  {id:'phys-momentum',title:'Impulse, Momentum and Collisions',objective:'Apply impulse and conservation of linear momentum conceptually.',status:'planned'},
  {id:'phys-rotation-intro',title:'Angular Motion Foundations',objective:'Distinguish angular displacement, velocity and acceleration.',status:'planned'},
  {id:'phys-rotation-dynamics',title:'Torque, Rotation and Angular Momentum',objective:'Explain rotational inertia, torque and conservation of angular momentum.',status:'planned'},
  {id:'phys-equilibrium-elasticity',title:'Equilibrium, Stress, Strain and Elasticity',objective:'Interpret equilibrium conditions and linear elastic behavior.',status:'planned'},
  {id:'phys-shm',title:'Oscillatory Motion',objective:'Characterize simple harmonic motion, period and restoring force.',status:'planned'},
  {id:'phys-wave-properties',title:'Mechanical Waves',objective:'Relate wavelength, frequency, speed and superposition.',status:'planned'},
  {id:'phys-sound',title:'Sound, Resonance and Doppler Effect',objective:'Analyze qualitative behavior of sound and resonant systems.',status:'planned'},
  {id:'phys-fluid-statics',title:'Fluid Statics and Buoyancy',objective:'Explain hydrostatic pressure and Archimedes\' principle.',status:'planned'},
  {id:'phys-fluid-dynamics',title:'Continuity and Fluid Flow',objective:'State assumptions behind continuity and Bernoulli\'s equation.',status:'planned'},
  {id:'phys-heat-transfer',title:'Temperature, Calorimetry and Heat Transfer',objective:'Differentiate conduction, convection, radiation and heat capacity.',status:'planned'},
  {id:'phys-charge-fields',title:'Electric Charges, Forces and Fields',objective:'Connect charge interactions, field direction and superposition.',status:'planned'},
  {id:'phys-potential',title:'Electric Potential and Capacitance',objective:'Interpret electrical potential, work, energy and capacitance.',status:'planned'},
  {id:'phys-circuits-intro',title:'Electric Current and Basic Circuits',objective:'Distinguish current, voltage, resistance and circuit power.',status:'planned'},
  {id:'phys-magnetic-forces',title:'Magnetic Fields and Forces',objective:'Interpret magnetic fields and forces on charges and conductors.',status:'planned'},
  {id:'phys-geometric-optics',title:'Reflection, Refraction and Imaging',objective:'Use ray principles for mirrors and thin lenses.',status:'planned'},
  {id:'phys-thermodynamic-laws',title:'Thermodynamic Laws and State Variables',objective:'Apply conservation of energy to thermal systems.',status:'planned'},
  {id:'phys-thermal-processes',title:'Gas Processes and Kinetic Theory',objective:'Interpret ideal-gas behavior and process diagrams.',status:'planned'},
  {id:'phys-heat-engines',title:'Heat Engines, Entropy and Refrigeration',objective:'Analyze efficiencies and limits imposed by the second law.',status:'planned'},
  {id:'phys-solid-state',title:'Condensed Matter and Properties of Solids',objective:'Explain microscopic structure and solid-state behavior.',status:'planned'},
  {id:'phys-semiconductor-bands',title:'Energy Bands and Semiconductor Foundations',objective:'Distinguish conductors, insulators and semiconductors by energy bands.',status:'planned'},
  {id:'phys-atomic-models',title:'Photons, Quantum Concepts and Atomic Models',objective:'Apply fundamental photon and atomic-energy relationships.',status:'planned'},
  {id:'phys-nuclear',title:'Nuclear Physics and Radioactivity',objective:'Interpret binding energy, decay and nuclear processes.',status:'planned'},
  {id:'phys-circuit-analysis',title:'Circuit Relationships and Transient Behavior',objective:'Apply basic circuit principles and distinguish steady/transient states.',status:'planned'},
  {id:'phys-induction',title:'Electromagnetic Induction',objective:'Apply Faraday\'s and Lenz\'s laws with sign conventions.',status:'planned'},
  {id:'phys-inductance',title:'Inductance and Magnetic Energy',objective:'Relate inductance, induced emf and magnetic energy storage.',status:'planned'},
  {id:'phys-ac',title:'Sinusoidal Alternating Current',objective:'Interpret phase, frequency, RMS values and reactance.',status:'planned'},
  {id:'phys-rlc',title:'AC Impedance, RLC Circuits and Resonance',objective:'Analyze impedance, phase angle and series resonance.',status:'planned'},
  {id:'phys-transformers',title:'Transformers and AC Power',objective:'Apply ideal-transformer and power-factor concepts with assumptions.',status:'planned'},
  {id:'phys-wave-optics',title:'Interference and Diffraction',objective:'Relate path difference and wave behavior to fringe/diffraction patterns.',status:'planned'},
  {id:'phys-optical-instruments',title:'Optical Instruments',objective:'Explain image formation and optical instrument behavior.',status:'planned'},
];

export const PHYSICS_TOS_GROUPS: readonly PhysicsTosGroup[] = [
  {id:'pfe-01',courseId:'geas-physics',title:'Mechanics, Work, Energy and Momentum',officialItems:5,
   cognitive:cells(3,2),note:'Knowledge and comprehension. Rotation in this row refers to foundational kinematics.',
   lessonIds:['phys-units-vectors','phys-kinematics-1d','phys-kinematics-2d','phys-newtons-laws','phys-work-energy','phys-power','phys-momentum','phys-rotation-intro']},
  {id:'pfe-02',courseId:'geas-physics',title:'Rotation, Elasticity, Oscillations and Waves',officialItems:4,
   cognitive:cells(2,2),note:'Knowledge and comprehension.',
   lessonIds:['phys-rotation-dynamics','phys-equilibrium-elasticity','phys-shm','phys-wave-properties','phys-sound']},
  {id:'pfe-03',courseId:'geas-physics',title:'Fluids and Heat Transfer',officialItems:2,
   cognitive:cells(2,0),note:'Knowledge.',
   lessonIds:['phys-fluid-statics','phys-fluid-dynamics','phys-heat-transfer']},
  {id:'pfe-04',courseId:'geas-physics',title:'Electricity, Magnetism and Optics',officialItems:4,
   cognitive:cells(3,1),note:'Knowledge and comprehension.',
   lessonIds:['phys-charge-fields','phys-potential','phys-circuits-intro','phys-magnetic-forces','phys-geometric-optics']},
  {id:'p2-01',courseId:'geas-physics2',title:'Thermodynamics, Condensed Matter, Atomic and Nuclear Physics',officialItems:4,
   cognitive:cells(0,0,2,1,1),note:'Application, analysis and synthesis.',
   lessonIds:['phys-thermodynamic-laws','phys-thermal-processes','phys-heat-engines','phys-solid-state','phys-semiconductor-bands','phys-atomic-models','phys-nuclear']},
  {id:'p2-02',courseId:'geas-physics2',title:'Electricity, Magnetism and Electromagnetic Induction',officialItems:3,
   cognitive:cells(0,0,3),note:'Application. Some fundamental lessons are shared with Physics for Engineers.',
   lessonIds:['phys-charge-fields','phys-potential','phys-circuit-analysis','phys-magnetic-forces','phys-induction']},
  {id:'p2-03',courseId:'geas-physics2',title:'Inductance and Alternating Current',officialItems:2,
   cognitive:cells(0,0,1,1),note:'Application and analysis.',
   lessonIds:['phys-inductance','phys-ac','phys-rlc','phys-transformers']},
  {id:'p2-04',courseId:'geas-physics2',title:'Optics',officialItems:1,
   cognitive:cells(0,0,0,1),note:'Analysis. Geometric optics foundations are shared.',
   lessonIds:['phys-geometric-optics','phys-wave-optics','phys-optical-instruments']},
];

export const PHYSICS_REFERENCES = [
  {id:'serway-9',label:'Serway & Jewett — Physics for Scientists and Engineers, 9th ed.',role:'Engineering foundations and worked-problem guidance'},
  {id:'young-13',label:'Young & Freedman — University Physics, 13th ed.',role:'Modern physics and deeper technical coverage'},
  {id:'walker-10',label:'Halliday, Resnick & Walker — Fundamentals of Physics, 10th ed.',role:'Quantitative reasoning and problem-solving methods'},
  {id:'cutnell-9',label:'Cutnell & Johnson — Physics, 9th ed.',role:'Accessible explanations and concepts'},
  {id:'schaum-college-9',label:'Bueche & Hecht — Schaum\'s College Physics, 9th ed.',role:'Concise theory and practice patterns'},
] as const;

export const PHYSICS_TOS_SOURCE = {
  title:'PRC Electronics Engineers Table of Specifications — Resolution No. 10 (2022), Annex A',
  url:'https://www.prc.gov.ph/sites/default/files/EE2022-10%20TOS.pdf',
  status:'Editorial course/topic alignment; not PRC certification',
} as const;

export function physicsCourseGroups(id:PhysicsCourseId): readonly PhysicsTosGroup[] {
  return PHYSICS_TOS_GROUPS.filter(group=>group.courseId===id);
}
export function physicsLessonsForGroup(group:PhysicsTosGroup): readonly PhysicsLessonOutline[] {
  return group.lessonIds.map(id=>PHYSICS_LESSONS.find(l=>l.id===id))
    .filter((lesson):lesson is PhysicsLessonOutline=>lesson!==undefined);
}
export function physicsCourseItemTotal(id:PhysicsCourseId):number {
  return physicsCourseGroups(id).reduce((sum,g)=>sum+g.officialItems,0);
}
export function physicsCourseCognitiveTotal(id:PhysicsCourseId,level:PhysicsCognitiveLevel):number {
  return physicsCourseGroups(id).reduce((sum,g)=>sum+g.cognitive[level],0);
}
