/**
 * Physics foundation for PRC EELE GEAS (Resolution No. 10, s. 2022).
 * This is a syllabus and lesson-identity registry, NOT completed lessons or
 * an approved question bank. Lesson bodies and verified practice are added
 * in later batches. Do not include outline items in learning-completion metrics.
 */
export type PhysicsCourseId = 'geas-physics' | 'geas-physics2';
export type PhysicsScreenId = 'physics-engineers' | 'physics-2';
export type PhysicsCognitiveLevel = 'knowledge' | 'comprehension' | 'application' | 'analysis' | 'synthesis';
export type PhysicsCognitiveCounts = Readonly<Record<PhysicsCognitiveLevel, number>>;

export interface PhysicsCourse {
  readonly id: PhysicsCourseId;
  readonly screen: PhysicsScreenId;
  readonly name: string;
  readonly officialItems: number;
}

export interface PhysicsLessonOutline {
  readonly id: string;
  readonly groupId: string;
  readonly courseId: PhysicsCourseId;
  readonly title: string;
  readonly contentStatus: 'outline';
}

export interface PhysicsTosGroup {
  readonly id: string;
  readonly courseId: PhysicsCourseId;
  readonly name: string;
  readonly officialItems: number;
  readonly cognitive: PhysicsCognitiveCounts;
  readonly objectives: readonly string[];
}

export const PHYSICS_TOS_SOURCE = 'https://www.prc.gov.ph/sites/default/files/EE2022-10%20TOS.pdf';

export const PHYSICS_COURSES: readonly PhysicsCourse[] = [
  {
    "id": "geas-physics",
    "screen": "physics-engineers",
    "name": "Physics for Engineers",
    "officialItems": 15
  },
  {
    "id": "geas-physics2",
    "screen": "physics-2",
    "name": "Physics 2",
    "officialItems": 10
  }
] as const;

export const PHYSICS_TOS_GROUPS: readonly PhysicsTosGroup[] = [
  {
    "id": "pfe-mechanics",
    "courseId": "geas-physics",
    "name": "Work, Energy, Power, Momentum and Mechanics",
    "officialItems": 5,
    "cognitive": {
      "knowledge": 3,
      "comprehension": 2,
      "application": 0,
      "analysis": 0,
      "synthesis": 0
    },
    "objectives": [
      "Physical quantities, SI units and vector operations",
      "One-dimensional and projectile kinematics",
      "Newton's laws, friction and free-body diagrams",
      "Work, kinetic and potential energy, and energy conservation",
      "Impulse, momentum, and collisions",
      "Uniform circular motion and mechanical power"
    ]
  },
  {
    "id": "pfe-rotation-waves",
    "courseId": "geas-physics",
    "name": "Rotation, Elasticity, Oscillations and Waves",
    "officialItems": 4,
    "cognitive": {
      "knowledge": 2,
      "comprehension": 2,
      "application": 0,
      "analysis": 0,
      "synthesis": 0
    },
    "objectives": [
      "Rotational kinematics, torque and moment of inertia",
      "Rotational dynamics and angular-momentum conservation",
      "Static equilibrium, stress, strain and elasticity",
      "Simple harmonic motion, wave propagation and sound"
    ]
  },
  {
    "id": "pfe-fluids-heat",
    "courseId": "geas-physics",
    "name": "Fluids and Heat Transfer",
    "officialItems": 2,
    "cognitive": {
      "knowledge": 2,
      "comprehension": 0,
      "application": 0,
      "analysis": 0,
      "synthesis": 0
    },
    "objectives": [
      "Hydrostatic pressure, Pascal's principle and buoyancy",
      "Continuity, Bernoulli's equation and fluid flow",
      "Temperature, heat transfer, thermal expansion and calorimetry"
    ]
  },
  {
    "id": "pfe-electric-optics",
    "courseId": "geas-physics",
    "name": "Electrostatics, Electricity, Magnetism and Optics",
    "officialItems": 4,
    "cognitive": {
      "knowledge": 3,
      "comprehension": 1,
      "application": 0,
      "analysis": 0,
      "synthesis": 0
    },
    "objectives": [
      "Electric charge, Coulomb's law and electric fields",
      "Electric potential, current, resistance and DC circuits",
      "Magnetic fields, magnetic forces and magnetic materials",
      "Faraday's law and introductory electromagnetic induction",
      "Reflection, refraction, mirrors and lenses"
    ]
  },
  {
    "id": "p2-thermal-modern",
    "courseId": "geas-physics2",
    "name": "Thermodynamics, Condensed Matter, Atomic and Nuclear Physics",
    "officialItems": 4,
    "cognitive": {
      "knowledge": 0,
      "comprehension": 0,
      "application": 2,
      "analysis": 1,
      "synthesis": 1
    },
    "objectives": [
      "Gas laws, thermodynamic processes and the first law",
      "Heat engines, entropy and the second law",
      "Solids, energy bands and semiconductor physics",
      "Photons, quantum principles and atomic structure",
      "Radioactive decay, nuclear reactions and radiation"
    ]
  },
  {
    "id": "p2-electric-induction",
    "courseId": "geas-physics2",
    "name": "Electricity, Magnetism and Electromagnetic Induction",
    "officialItems": 3,
    "cognitive": {
      "knowledge": 0,
      "comprehension": 0,
      "application": 3,
      "analysis": 0,
      "synthesis": 0
    },
    "objectives": [
      "Electric fields, potential and Gauss's law",
      "Capacitance, dielectrics and DC circuit analysis",
      "Magnetic forces and fields from currents",
      "Magnetic flux, Faraday's law and Lenz's law"
    ]
  },
  {
    "id": "p2-inductance-ac",
    "courseId": "geas-physics2",
    "name": "Inductance and Alternating Current",
    "officialItems": 2,
    "cognitive": {
      "knowledge": 0,
      "comprehension": 0,
      "application": 1,
      "analysis": 1,
      "synthesis": 0
    },
    "objectives": [
      "Self/mutual inductance and transient RL/LC circuits",
      "AC impedance, RLC resonance, power and transformers"
    ]
  },
  {
    "id": "p2-optics",
    "courseId": "geas-physics2",
    "name": "Optics",
    "officialItems": 1,
    "cognitive": {
      "knowledge": 0,
      "comprehension": 0,
      "application": 0,
      "analysis": 1,
      "synthesis": 0
    },
    "objectives": [
      "Geometrical optics, images and optical systems",
      "Interference, diffraction and optical resolution"
    ]
  }
] as const;

export const PHYSICS_LESSON_OUTLINES: readonly PhysicsLessonOutline[] =
  PHYSICS_TOS_GROUPS.flatMap(group =>
    group.objectives.map((title, index) => ({
      id: `${group.id}-lesson-${index + 1}`,
      groupId: group.id,
      courseId: group.courseId,
      title,
      contentStatus: 'outline' as const,
    })),
  );

export const getPhysicsGroups = (courseId: PhysicsCourseId): PhysicsTosGroup[] =>
  PHYSICS_TOS_GROUPS.filter(group => group.courseId === courseId);

export const getPhysicsLessonOutlines = (groupId: string): PhysicsLessonOutline[] =>
  PHYSICS_LESSON_OUTLINES.filter(lesson => lesson.groupId === groupId);

export const getPhysicsCognitiveTotals = (courseId: PhysicsCourseId): PhysicsCognitiveCounts => {
  const total: Record<PhysicsCognitiveLevel, number> = {
    knowledge: 0, comprehension: 0, application: 0, analysis: 0, synthesis: 0,
  };
  for (const group of getPhysicsGroups(courseId)) {
    for (const level of Object.keys(total) as PhysicsCognitiveLevel[]) {
      total[level] += group.cognitive[level];
    }
  }
  return total;
};

/** Fail closed on inconsistent exam allocations or duplicated content identities. */
export const verifyPhysicsBlueprint = (): string[] => {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const course of PHYSICS_COURSES) {
    const groups = getPhysicsGroups(course.id);
    const total = groups.reduce((sum, g) => sum + g.officialItems, 0);
    if (groups.length !== 4) errors.push(`${course.id}: expected four TOS groups`);
    if (total !== course.officialItems) errors.push(`${course.id}: TOS item total ${total} != ${course.officialItems}`);
  }
  for (const group of PHYSICS_TOS_GROUPS) {
    if (seen.has(group.id)) errors.push(`Duplicate group id: ${group.id}`);
    seen.add(group.id);
    const cognitiveTotal = Object.values(group.cognitive).reduce((sum, count) => sum + count, 0);
    if (cognitiveTotal !== group.officialItems) errors.push(`${group.id}: cognitive total mismatch`);
    if (group.objectives.length === 0) errors.push(`${group.id}: no lesson outlines`);
  }
  for (const lesson of PHYSICS_LESSON_OUTLINES) {
    if (seen.has(lesson.id)) errors.push(`Duplicate lesson id: ${lesson.id}`);
    seen.add(lesson.id);
  }
  const pfe = getPhysicsCognitiveTotals('geas-physics');
  const p2 = getPhysicsCognitiveTotals('geas-physics2');
  if (pfe.knowledge !== 10 || pfe.comprehension !== 5 || pfe.application !== 0 || pfe.analysis !== 0 || pfe.synthesis !== 0) {
    errors.push('Physics for Engineers: cognitive distribution mismatch');
  }
  if (p2.knowledge !== 0 || p2.comprehension !== 0 || p2.application !== 6 || p2.analysis !== 3 || p2.synthesis !== 1) {
    errors.push('Physics 2: cognitive distribution mismatch');
  }
  return errors;
};
