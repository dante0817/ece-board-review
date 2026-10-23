import type { LearnLesson, LessonBlock } from '../../domain/learn/lessonTypes';
import lessonsJson from '../../data/geometry/solidMensurationLessons.json';
import unitsJson from '../../data/geometry/solidMensurationUnits.json';
import formulasJson from '../../data/geometry/solidMensurationFormulas.json';
import checksJson from '../../data/geometry/solidMensurationNumericChecks.json';
import practiceJson from '../../data/geometry/solidMensurationPractice.json';
import challengeJson from '../../data/geometry/solidMensurationChallenges.json';

export type SolidLesson = (typeof lessonsJson)[number];
export type SolidFormula = (typeof formulasJson)[number];
export type SolidCheck = (typeof checksJson)[number];
export const SOLID_LESSONS = lessonsJson;
export const SOLID_UNITS = unitsJson;
export const SOLID_FORMULAS = formulasJson;
export const SOLID_NUMERIC_CHECKS = checksJson;
/** Independently authored teaching questions, separate from the 43 regression smoke tests. */
export const SOLID_PRACTICE = [...practiceJson, ...challengeJson];
export type SolidPractice = (typeof practiceJson)[number];
export const questionsForLesson=(id:string)=>SOLID_PRACTICE.filter(q=>q.topic_id===id);
export const displayPracticeAnswer=(q:SolidPractice)=>q.kind==='numeric' && q.expected!=null ? `${Number(q.expected.toPrecision(8)).toLocaleString('en-US',{maximumFractionDigits:8})} ${q.unit}` : String(q.options[q.correctIndex]);
const idsFor = (s: string) => s.split(',').map(id => id.trim());
export const formulasForLesson = (id:string) => SOLID_FORMULAS.filter(f=>idsFor(f.topic_ids).includes(id));
export const checksForLesson = (id:string) => SOLID_NUMERIC_CHECKS.filter(c=>formulasForLesson(id).some(f=>f.id===c.formula_id));
export const lessonIdToTrackingId = (id:string) => `geo-solid-${id.slice(-3)}`;

/** Original course explanations. Reference metadata comes from the user's reviewed 21-book matrix.
 * This is draft content pending editorial sign-off, not excerpts from the books. */
export const CONCEPTS: Record<string,string> = {
'GEO-036':'Three-dimensional space uses points, lines and planes. Two distinct planes may intersect along one line or have no common points. Build a model before assuming a relationship from a sketch.',
'GEO-037':'Parallel lines lie in a common plane and never meet. Skew lines are noncoplanar and do not meet. Perpendicular lines meet at a right angle; a right-looking perspective drawing is not proof.',
'GEO-038':'A dihedral angle measures the opening between two planes along their intersection line. Measure its plane angle in a perpendicular cross-section through the common edge.',
'GEO-039':'A polyhedron is bounded by polygonal faces. Use face, edge and vertex counts carefully: the familiar Euler relation applies to connected closed genus-zero polyhedral surfaces.',
'GEO-040':'For a rectangular box, first find the diagonal of the base and then combine it with the vertical height using the Pythagorean theorem.',
'GEO-041':'A net unfolds a solid into planar faces. A section is produced by cutting with a plane; its actual dimensions differ from a foreshortened perspective drawing.',
'GEO-042':'For a right prism, the lateral faces are rectangles. Their combined area equals the base perimeter multiplied by the perpendicular height; add both bases for total surface area.',
'GEO-043':'A prism has constant congruent parallel cross-sections. Multiply the base area by perpendicular height to obtain volume, then convert the resulting cubic units if necessary.',
'GEO-044':'The volume of an oblique prism is still base area times perpendicular distance between base planes. The right-prism lateral-area shortcut generally fails for an oblique prism.',
'GEO-045':'A cuboid has perpendicular edges and rectangular faces. A general parallelepiped can be skew, so its volume must use perpendicular altitude rather than an arbitrary edge.',
'GEO-046':'The curved area of a right circular cylinder unwraps into a rectangle whose width is the circumference of the base and whose height is the cylinder height.',
'GEO-047':'The right and oblique circular cylinders share the base-area-times-perpendicular-height volume rule. A numerical radius requires consistent linear units.',
'GEO-048':'An oblique cylinder has parallel circular bases but tilted generators. Base area times perpendicular altitude gives volume; do not substitute an oblique slant length for altitude.',
'GEO-049':'For a hollow cylindrical pipe, subtract the inner cylinder volume from the outer one. Exposed surface also includes the inner wall and any exposed annular end faces.',
'GEO-050':'A regular pyramid has a regular polygon base and its apex above the base center. Each lateral face is triangular; calculate lateral area from perimeter and the face slant height.',
'GEO-051':'Every pyramid has volume equal to one third of its base area times perpendicular height. Total area requires accounting for the actual lateral faces and base.',
'GEO-052':'An irregular or oblique pyramid retains the one-third base-area-times-perpendicular-height volume rule, but does not generally have one common slant height for all faces.',
'GEO-053':'A right circular cone has a slant height joining apex and rim along a straight generator. Its radius, perpendicular height and slant height form a right triangle.',
'GEO-054':'Volume depends on the perpendicular height and base circle; curved area depends on slant height for a right circular cone. Check which area the question requests.',
'GEO-055':'For an oblique cone, the base-area-times-perpendicular-height volume relation still holds. The usual πrl curved-surface formula is specifically for a right circular cone.',
'GEO-056':'A right conical frustum is a right cone with its top removed by a plane parallel to the base. Distinguish the two radii and use perpendicular height for volume.',
'GEO-057':'A pyramidal frustum has similar parallel polygonal end faces when cut parallel to the original base. Express volume using the two base areas and perpendicular height.',
'GEO-058':'All points of a sphere are equally distant from its center. Surface area grows as radius squared and volume grows as radius cubed.',
'GEO-059':'A hemisphere has half the volume of the corresponding sphere. Its curved area excludes the flat circular base; a closed hemisphere includes that base.',
'GEO-060':'An inscribed solid touches the boundary of another solid while remaining inside it. Identify which lengths correspond to radii, diameters, heights and diagonals.',
'GEO-061':'A spherical cap is cut from a sphere by a plane. Cap height is measured from the cutting plane to the pole along the sphere axis; it is not the radius of the base circle.',
'GEO-062':'Spherical segments are bounded by two parallel cutting planes; a spherical sector combines a cap with the appropriate conical portion. Carefully identify the geometry before applying a formula.',
'GEO-063':'Regular tetrahedra and other Platonic solids have congruent regular polygon faces. Their edge lengths determine corresponding surface areas and volumes.',
'GEO-064':'An ellipsoid is described by three perpendicular semiaxes. The volume formula is exact, while a general elementary closed surface-area formula is not available.',
'GEO-065':'A ring torus is created by revolving a circle around an external axis in the same plane. The major radius locates the tube centerline; the minor radius is the tube radius.',
'GEO-066':'Divide a compound body into basic solids. Add volumes of nonoverlapping parts; do not add shared interior faces when computing exterior surface area.',
'GEO-067':'A cavity removes material. Subtract the cavity volume and include newly exposed inside faces only when the required surface area includes them.',
'GEO-068':'Similar solids have the same shape. Multiplying all lengths by k multiplies corresponding areas by k² and volumes by k³.',
'GEO-069':'When a solid is cut, identify the shape and dimensions of every cross-section before computing volume. A perspective sketch alone is not a reliable source of lengths.',
'GEO-070':'A solid of revolution is created by rotating a plane region about an axis. Cross-sectional methods connect this subject to integral calculus, while centroid methods require their own applicability conditions.',
'GEO-071':'Cavalieri’s principle compares volumes of solids of equal height when corresponding planar sections at every level have equal areas.',
'GEO-072':'The prismoidal formula uses end and midsection areas for a prismoid with the required cross-section behavior. It is not an arbitrary three-sample approximation for any solid.',
'GEO-073':'Pappus’s volume centroid theorem multiplies the area of a plane region by the distance traveled by its centroid during a full revolution about an external coplanar axis.',
'GEO-074':'Pappus’s surface centroid theorem multiplies the length of a plane curve by the distance traveled by its centroid during a full revolution about an external coplanar axis.',
'GEO-075':'Separate total vessel capacity from actual fill volume. Partially filled horizontal cylinders require circular-segment geometry, not a constant fraction of full volume unless justified.',
'GEO-076':'Material volume for a pipe or shell differs from its void volume. Material mass equals material density times the material volume in coherent units.',
'GEO-077':'Optimization starts by defining an objective such as minimum area and a constraint such as fixed volume. Use derivatives and test feasible endpoints where applicable.',
'GEO-078':'Dimensional analysis distinguishes length, area and volume. Multiply conversion factors for lengths once, for areas twice, and for volumes three times.',
};

/** Original application-focused notes; not transcriptions of the listed references. */
export const SOLID_METHOD_NOTES:Record<string,string>={
'GEO-036':'A line belongs to a plane if every point of the line lies in that plane. Two planes can coincide, be parallel, or meet in a line. State these possibilities before interpreting a perspective image.',
'GEO-037':'To distinguish parallel from skew, ask whether one plane contains both complete lines. Parallel lines have the same direction in one plane; skew lines cannot be put in a single plane.',
'GEO-038':'Imagine slicing both walls by a plane perpendicular to their hinge. The two traces form the linear angle of the dihedral angle; arbitrary slanted traces do not measure it.',
'GEO-039':'Label each vertex once, each edge once, and each face once. For a convex polyhedron the quantity V−E+F remains 2, but this relation requires appropriate topology for more general surfaces.',
'GEO-040':'Find a diagonal across the horizontal rectangle first, then pair it with the orthogonal height. The direct square-root formula combines these two Pythagorean applications.',
'GEO-041':'A net shows the true shape of each unfolded face, while a cross-section shows a new polygon created by a cutting plane. A section parallel to a prism base has the same area as the base.',
'GEO-042':'For total area of a closed right prism, count the rectangular side faces and exactly two bases. If one or both bases are absent, subtract those open-end areas.',
'GEO-043':'Volume is base area multiplied by the shortest distance between the base planes. For liters, first express the final volume in cubic meters or cubic centimeters, then apply a coherent conversion.',
'GEO-044':'The oblique side edge is longer than the perpendicular separation whenever the prism leans. Volume remains Bh; the faces become parallelograms and require their own actual heights for area.',
'GEO-045':'A rectangular cuboid has three perpendicular edges. When faces lean, a parallelepiped still has V=base area×perpendicular height or the absolute value of a scalar triple product.',
'GEO-046':'The curved wall of a right cylinder is a rectangle of length 2πr and height h when cut and unrolled. A closed cylinder adds two disks; an open one does not.',
'GEO-047':'A circular cylinder has V=πr²h. The radius is half the diameter, and a twofold change in radius causes a fourfold change in volume when height is fixed.',
'GEO-048':'Compare an oblique and right cylinder using horizontal sections; the sections can have identical area at every height. That proves equal volume but not equal curved surface area.',
'GEO-049':'Name R as outside radius and r as inside radius. For material volume subtract the internal bore; for a fully exposed pipe wall also include the inner wall and annular ends.',
'GEO-050':'Face slant height ends at the midpoint of a polygon side, not at a base corner. Base apothem is the perpendicular distance from center to side, giving ℓ²=h²+a².',
'GEO-051':'The apex determines a pyramid, while perpendicular altitude controls volume. For surface area, compute the actual area of each triangular face; the shortcut Pℓ/2 assumes regularity.',
'GEO-052':'Irregular and oblique pyramids often have different lateral-face heights. Their volume is still Bh/3, but summing all triangular faces is safer than using a single slant height.',
'GEO-053':'Only a right cone has the familiar right triangle r,h,ℓ sharing one slant height for all generators. A cone with slanted axis cannot use the same πrℓ lateral-area shortcut.',
'GEO-054':'When asked for total exterior area, read whether the base disk is exposed. A conical funnel without a bottom uses curved area only; a sealed cone includes the base.',
'GEO-055':'An oblique cone has the same volume as a right cone with matching circular base and perpendicular height. Its curved surface generally requires more sophisticated geometry.',
'GEO-056':'Measure the bottom radius R, top radius r, and vertical separation h. For lateral area of a right frustum, ℓ is found from √[h²+(R−r)²]; for volume use the vertical h.',
'GEO-057':'The parallel faces must be similar because the truncating plane is parallel to the pyramid base. The volume formula works for unequal base areas, provided the faces belong to one pyramid.',
'GEO-058':'Sphere area is quadratic in radius, while sphere capacity is cubic. A diameter given in the problem must be halved before substituting into radius-based formulas.',
'GEO-059':'A hemispherical roof normally needs only curved area, while a closed hemispherical tank includes the bottom disk. The volume is exactly half the volume of the parent sphere.',
'GEO-060':'For an inscribed sphere, diameter equals the cube edge. For a sphere through all eight cube corners, diameter equals the space diagonal a√3; these are different situations.',
'GEO-061':'For a cap, the height h runs from the cutting plane to the pole of the parent sphere. Its circular cut radius is not h, and h is restricted to the interval 0≤h≤2R.',
'GEO-062':'A two-base segment has two boundary circles on one parent sphere; check the parent-sphere geometry if R is also given. A spherical sector has a different construction and formula.',
'GEO-063':'All edges of a regular tetrahedron are equal. Each face is an equilateral triangle, so surface area can be found from four identical triangular areas.',
'GEO-064':'An ellipsoid uses three mutually perpendicular semiaxes a,b,c. If full axis lengths are provided, divide each by two. The standard volume formula is exact even when all axes differ.',
'GEO-065':'A ring torus is a circular tube bent around an axis outside the tube. Major radius R locates the tube centerline; minor radius r describes tube thickness, with R>r.',
'GEO-066':'Decompose a structure into pieces that do not overlap in volume. For exterior surface area, shared attachment faces vanish from the exposed surface count.',
'GEO-067':'When a hole passes through a block, subtract its entire interior cylindrical volume. If surface area is requested instead, the bore creates an additional exposed inner curved face.',
'GEO-068':'A scale factor affects dimensions differently: lengths by k, areas by k² and volumes by k³. Do not apply the length factor directly to volume or coating area.',
'GEO-069':'In truncation problems, similar triangles often yield the missing top radius or altitude. Compute the original solid minus the removed piece, ensuring the cut is genuinely parallel.',
'GEO-070':'Choose washers if cuts perpendicular to the rotation axis form disks or annuli. Choose shells if thin parallel strips sweep cylindrical shells. Overlap and axis distance are essential.',
'GEO-071':'Cavalieri compares two solids with the same altitude and equal cross-section area at each matching height. Equal total height and equal bottom area alone are insufficient.',
'GEO-072':'The prismoidal formula integrates a quadratic cross-sectional area exactly. For irregular area variation, a three-sample Simpson estimate is not automatically an exact physical volume.',
'GEO-073':'Pappus volume uses the *area centroid* of the revolving planar region. Its complete circular path has length 2πd; avoid using the theorem if the axis intersects the region and sweep overlaps.',
'GEO-074':'Pappus surface uses the *length-weighted centroid* of the revolving curve. A region-area centroid is not interchangeable with the curve centroid, and a retraced surface must not be double-counted.',
'GEO-075':'For a partly filled horizontal tank, liquid cross-section is usually a circular segment. At exactly half depth it is half a circle; otherwise the fill fraction is nonlinear.',
'GEO-076':'Material cost can be charged by volume, mass, or sheet area. Define the pricing basis before multiplying; empty pipe space contributes to capacity, not material mass.',
'GEO-077':'For fixed volume V of a fully closed right cylinder, minimize S=2πr²+2V/r. The stationary point yields h=2r, but different constraints and missing ends change the optimum.',
'GEO-078':'A length conversion factor c becomes c² for areas and c³ for volumes. Report units explicitly at every stage, particularly when mixing mm, cm, m, liters, and density.'
};

export const SOLID_READER_LESSONS: Record<string,LearnLesson> = Object.fromEntries(SOLID_LESSONS.map(l=>{
  const formulas = formulasForLesson(l.topic_id);
  const examples = questionsForLesson(l.topic_id);
  const blocks:LessonBlock[] = [
    {id:`${l.topic_id}-concept`,type:'definition',text:CONCEPTS[l.topic_id]},
    {id:`${l.topic_id}-method`,type:'paragraph',text:SOLID_METHOD_NOTES[l.topic_id]},
    {id:`${l.topic_id}-goal`,type:'paragraph',text:`Learning target: ${l.demonstrable_learning_goal}. Prerequisites: ${l.prerequisites}.`},
    ...formulas.map(f=>({id:`${l.topic_id}-${f.id}`,type:'formula' as const,latex:f.latex,description:`${f.name}. Variables: ${f.variables}. Applicability: ${f.conditions}.`})),
    {id:`${l.topic_id}-guardrail`,type:'note',text:`Important restriction: ${l.guardrail}.`},
  ];
  const practiceBlocks:LessonBlock[] = [
    {id:`${l.topic_id}-picture`,type:'paragraph',text:`Use the labeled diagram above as a geometry guide: ${l.diagram_brief}. Draw the actual given dimensions before computing. Diagram is schematic and not to scale.`},
    {id:`${l.topic_id}-question`,type:'checkpoint',prompt:`Apply the topic to this situation: ${l.original_question_scenario}. What measurements or relationships are required first?`,answer:`Use the topic objective: ${l.demonstrable_learning_goal}. Check the stated applicability restrictions before choosing a formula.`},
    {id:`${l.topic_id}-references`,type:'note',text:`Internal reference map: ${l.main_reference_code} — ${l.main_reference_location}; supporting ${l.support_reference_code} — ${l.support_reference_location}. Reference status: ${l.reference_status}. Draft lesson; source details and mathematics require editorial review.`}
  ];

  const workedBlocks:LessonBlock[] = examples.slice(0,1).map((q,i)=>({
    id:`${l.topic_id}-worked-${i+1}`,
    type:'worked-example' as const,
    title:`${i+1}. ${q.title}`,
    problem:q.prompt,
    strategy:`${q.level} · ${q.kind==='numeric'?'Identify the correct dimensions and substitute carefully.':'Classify the geometric relationship from its defining properties.'}`,
    steps:[...q.work],
    check:`Answer: ${displayPracticeAnswer(q)}. ${q.restriction||l.guardrail}.`,
    takeaway:'Check the applicability conditions and units before selecting a formula.'
  }));
  if(examples[1])workedBlocks.push({id:`${l.topic_id}-challenge`,type:'checkpoint',prompt:examples[1].prompt,answer:displayPracticeAnswer(examples[1]),explanation:examples[1].work.join(' ')});
  const lesson:LearnLesson={id:lessonIdToTrackingId(l.topic_id),title:l.title,summary:l.canonical_objective,contentVersion:2,status:'draft',sections:[
    {id:`${l.topic_id}-concepts`,title:'Understand and apply',objectiveIds:[l.topic_id],blocks},
    {id:`${l.topic_id}-worked`,title:'Worked example and guided challenge',objectiveIds:[l.topic_id],blocks:workedBlocks},
    {id:`${l.topic_id}-applications`,title:'Interpretation and practice',objectiveIds:[l.topic_id],blocks:practiceBlocks},
  ]};
  return [l.topic_id,lesson];
}));
