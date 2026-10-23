/** The Geometry hub is instructional navigation, not a new board-TOS assessment category. */
export type GeometrySubjectId = 'plane' | 'solid' | 'analytic';
export type GeometryAvailability = 'available-draft' | 'planned';

export interface GeometryModuleInfo {
  id: GeometrySubjectId;
  name: string;
  summary: string;
  availability: GeometryAvailability;
  plannedTopics: number;
  curriculumUnits: readonly string[];
}

export const GEOMETRY_MODULES: readonly GeometryModuleInfo[] = [
  {
    id: 'plane', name: 'Plane Geometry & Mensuration', availability: 'available-draft', plannedTopics: 35,
    summary: 'Two-dimensional shapes, construction, geometric relationships, area and perimeter.',
    curriculumUnits: ['Lines, angles and reasoning', 'Triangles and congruence', 'Similarity and proportionality', 'Quadrilaterals and polygons', 'Circles and sectors', 'Perimeter and area', 'Applied plane mensuration'],
  },
  {
    id: 'solid', name: 'Solid Geometry & Mensuration', availability: 'available-draft', plannedTopics: 43,
    summary: 'Three-dimensional solids, surface areas, volumes and measurement theorems.',
    curriculumUnits: ['Spatial fundamentals', 'Prisms and cylinders', 'Pyramids and cones', 'Frustums and spherical portions', 'Composite solids', 'Measurement theorems', 'Engineering applications'],
  },
  {
    id: 'analytic', name: 'Analytic Geometry', availability: 'available-draft', plannedTopics: 27,
    summary: 'Coordinates, equations, lines, circles, conic sections and spatial coordinates.',
    curriculumUnits: ['Coordinate foundations', 'Distance, midpoint and slope', 'Lines and loci', 'Circles', 'Parabolas', 'Ellipses and hyperbolas', 'Coordinate transformations', 'Three-dimensional coordinates'],
  },
] as const;
