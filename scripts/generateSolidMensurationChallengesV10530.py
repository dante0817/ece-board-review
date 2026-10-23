#!/usr/bin/env python3
"""Deterministic original, independently computable Solid Mensuration challenge bank.
Do not derive wording or diagrams from textbook questions. No network dependencies.
Two variants per canonical topic, IDs intentionally disjoint from v10.52.0.
"""
from __future__ import annotations
import json, math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'src/data/geometry/solidMensurationChallenges.json'
base = json.loads((ROOT/'src/data/geometry/solidMensurationPractice.json').read_text())
by_topic={f'GEO-{i:03d}': next(q for q in base if q['topic_id']==f'GEO-{i:03d}') for i in range(36,79)}

# Derivations independently checked by scripts/validateSolidMensurationV10530.mjs.
def calc(tag, a):
 x=a[0]; y=a[1] if len(a)>1 else 0; z=a[2] if len(a)>2 else 0; w=a[3] if len(a)>3 else 0
 p=math.pi
 return {
  'euler-faces':lambda:2+y-x,
  'diagonal':lambda:math.sqrt(sum(t*t for t in a)),
  'rectangle':lambda:x*y,
  'prism-total':lambda:x*y+2*z,
  'prism-volume':lambda:x*y,
  'cuboid':lambda:x*y*z,
  'cylinder-lateral':lambda:2*p*x*y,
  'cylinder-total':lambda:2*p*x*(y+x),
  'cylinder-volume':lambda:p*x*x*y,
  'pipe-volume':lambda:p*(x*x-y*y)*z,
  'pyramid-lateral':lambda:x*y/2,
  'pyramid-volume':lambda:x*y/3,
  'cone-slant':lambda:math.hypot(x,y),
  'cone-volume':lambda:p*x*x*y/3,
  'frustum-volume':lambda:p*z*(x*x+x*y+y*y)/3,
  'pyramidal-frustum':lambda:z*(x+y+math.sqrt(x*y))/3,
  'sphere-volume':lambda:4*p*x**3/3,
  'hemisphere-total':lambda:3*p*x*x,
  'circumscribed-radius':lambda:math.sqrt(3)*x/2,
  'cap-volume':lambda:p*y*y*(x-y/3),
  'segment-volume':lambda:p*z*(3*x*x+3*y*y+z*z)/6,
  'tetra-area':lambda:math.sqrt(3)*x*x,
  'ellipsoid-volume':lambda:4*p*x*y*z/3,
  'torus-volume':lambda:2*p*p*x*y*y,
  'sum':lambda:sum(a),
  'drilled-block':lambda:x*y*z-p*w*w*z,
  'scale-volume':lambda:x*y**3,
  'truncated-cone':lambda:p*(x*x*y-z*z*w)/3,
  'disk':lambda:p*x*x*y,
  'cavalieri':lambda:x*y,
  'prismoid':lambda:w*(x+4*y+z)/6,
  'pappus-volume':lambda:2*p*x*y,
  'pappus-area':lambda:2*p*x*y,
  'half-cylinder-liters':lambda:500*p*x*x*y,
  'mass':lambda:x*y,
  'opt-radius':lambda:(x/(2*p))**(1/3),
  'mm3-m3':lambda:x/1e9,
 }[tag]()

# These are independently authored engineering contexts, not copied reference exercises.
# Each tuple: tag, (two parameter sets), unit, description/variables, solution rule, restriction.
CASES={
39:('euler-faces',[(12,18),(14,21)],'faces',
 'A convex hexagonal/heptagonal prism has {0} vertices and {1} edges. Determine the number of faces.',
 'For a convex polyhedron, V − E + F = 2; therefore F = 2 + E − V.', 'The Euler relation assumes a closed connected genus-zero polyhedral surface.'),
40:('diagonal',[(5,12,13),(9,12,20)],'m',
 'A rectangular instrument cabinet has perpendicular internal dimensions {0} m, {1} m, and {2} m. Find the straight-line space diagonal.',
 'Apply 3D Pythagoras: d = √(length² + width² + height²).','Edges meet at right angles.'),
41:('rectangle',[(7,11),(9,13)],'cm²',
 'A right prism has a rectangular base {0} cm by {1} cm. A plane cuts it parallel to its base. Find the section area.',
 'Parallel cross-sections of a prism are congruent to the base; A = width × length.','The cutting plane is parallel to the base and intersects the interior.'),
42:('prism-total',[(12,8,9),(16,9,16)],'m²',
 'A closed right square prism has base perimeter {0} m, vertical height {1} m, and base area {2} m². Find the total exterior area.',
 'For a right prism: S = perimeter × height + 2 × base area.','The given measurements describe a square base; both end faces are included.'),
43:('prism-volume',[(32,7),(45,11)],'m³',
 'A straight-sided reservoir has uniform polygonal cross-section of area {0} m² and length {1} m. Determine internal volume.',
 'For a prism: V = base area × perpendicular length.','Cross-sectional area is constant along the length.'),
44:('prism-volume',[(21,9),(34,6)],'cm³',
 'A leaning prism has base area {0} cm² and perpendicular distance {1} cm between its parallel bases. Find volume (do not use the slant edge).',
 'An oblique prism retains V = base area × perpendicular height.','The given distance is the perpendicular separation of its bases.'),
45:('cuboid',[(4,7,11),(5,9,12)],'cm³',
 'A rectangular electronics enclosure is {0} cm wide, {1} cm deep, and {2} cm tall internally. Find the enclosed volume.',
 'For a rectangular cuboid: V = length × width × height.','The interior is a rectangular box without internal obstructions.'),
46:('cylinder-total',[(4,9),(5,12)],'m²',
 'A completely closed upright circular cylinder has radius {0} m and height {1} m. Calculate the area of its curved wall plus both circular ends.',
 'S = 2πrh + 2πr² = 2πr(h+r).','Valid for a right circular cylinder, with both bases included.'),
47:('cylinder-volume',[(2.5,12),(3.5,10)],'m³',
 'A cylindrical storage vessel has internal radius {0} m and usable axial height {1} m. Determine full capacity in cubic meters.',
 'Use V = πr²h for a circular cylinder.','Assumes a uniform circular section and perpendicular (axial) height.'),
48:('cylinder-volume',[(2,11),(4,9)],'cm³',
 'An oblique cylindrical core has circular base radius {0} cm and perpendicular distance {1} cm between bases. Determine its volume.',
 'For an oblique cylinder, V = πr² × perpendicular height.','Use perpendicular height, not the tilted generator length.'),
49:('pipe-volume',[(7,5,10),(8,3,12)],'cm³',
 'A hollow pipe is {2} cm long, with outer radius {0} cm and inner radius {1} cm. Determine the volume of wall material.',
 'Subtract inner cylindrical volume from outer volume: V = π(R²−r²)L.','Outer radius must be greater than the inner radius.'),
50:('pyramid-lateral',[(24,5),(32,5)],'m²',
 'A right regular square pyramid has base perimeter {0} m and a common triangular-face slant height of {1} m. Find lateral area (exclude base).',
 'For a regular pyramid, lateral area = (base perimeter × face slant height)/2.','Common slant height requires a right regular pyramid.'),
51:('pyramid-volume',[(72,10),(108,8)],'m³',
 'A pyramid-shaped sand pile has flat base area {0} m² and perpendicular height {1} m. Estimate idealized sand volume.',
 'Pyramid volume equals one third of base area times perpendicular height.','Use perpendicular height; the pile is modeled as a perfect pyramid.'),
52:('pyramid-volume',[(60,9),(42,13)],'cm³',
 'An irregular pyramid has polygonal base area {0} cm² and perpendicular apex-to-base height {1} cm. Compute its volume.',
 'Even for an oblique or irregular pyramid, V = (base area × perpendicular height)/3.','The area provided is the complete base area.'),
53:('cone-slant',[(8,15),(7,24)],'cm',
 'A right circular funnel cone has radius {0} cm and perpendicular height {1} cm. Find a straight generator (slant height).',
 'Slant height satisfies l² = r²+h²; take l = √(r²+h²).','A right circular cone, with apex directly over base center.'),
54:('cone-volume',[(4,15),(6,11)],'m³',
 'A conical vessel has circular opening radius {0} m and perpendicular depth {1} m. Determine its ideal internal volume.',
 'V = πr²h/3.','Assumes a complete cone, not a frustum.'),
55:('cone-volume',[(5,12),(3,16)],'m³',
 'An off-center-apex (oblique) cone has base radius {0} m and perpendicular apex altitude {1} m. Find volume.',
 'V = πr²h/3 uses perpendicular altitude even for an oblique cone.','Do not use the right-cone curved-surface-area shortcut.'),
56:('frustum-volume',[(6,3,8),(8,2,7)],'m³',
 'A right circular conical frustum has lower radius {0} m, upper radius {1} m, and perpendicular height {2} m. Determine volume.',
 'V = (πh/3)(R²+Rr+r²).','Both ends are parallel circles of a conical frustum.'),
57:('pyramidal-frustum',[(81,25,8),(100,36,9)],'m³',
 'A pyramid truncated parallel to the base has lower area {0} m², upper area {1} m², and perpendicular height {2} m. Find frustum volume.',
 'V = h(A₁+A₂+√(A₁A₂))/3.','Cross-sections are similar polygons; the cutting plane is parallel to the base.'),
58:('sphere-volume',[(5,),(7,)],'m³',
 'A spherical tank has interior radius {0} m. What is its complete internal volume?',
 'V = (4π/3)r³.','The cavity is a full sphere.'),
59:('hemisphere-total',[(6,),(9,)],'m²',
 'A closed hemispherical enclosure has radius {0} m. Find its curved wall area plus its flat circular floor.',
 'S = 2πr² + πr² = 3πr².','Total area includes the circular closure.'),
60:('circumscribed-radius',[(8,),(10,)],'cm',
 'A cube of edge {0} cm is inscribed in a sphere (all eight cube vertices on the sphere). Determine the sphere radius.',
 'Cube space diagonal = edge√3 and equals the enclosing sphere diameter; r = edge√3/2.','Sphere passes through all cube vertices.'),
61:('cap-volume',[(8,3),(9,4)],'cm³',
 'A plane removes a spherical cap of height {1} cm from a sphere of radius {0} cm. Calculate the cap volume.',
 'V = πh²(R−h/3).','Cap height is between 0 and 2R.'),
62:('segment-volume',[(3,4,5),(4,5,6)],'cm³',
 'A sphere is cut by two parallel planes {2} cm apart, yielding section-circle radii {0} cm and {1} cm. Find the enclosed spherical segment volume.',
 'V = πh(3a²+3b²+h²)/6 for the two circular section radii a and b.','The two cuts bound one contiguous segment of a sphere.'),
63:('tetra-area',[(5,),(7,)],'cm²',
 'A regular tetrahedron has all edges {0} cm long. Find total area of its four equilateral triangle faces.',
 'Each face has area (√3/4)a². Four faces give S = √3a².','All four faces must be equilateral.'),
64:('ellipsoid-volume',[(4,6,8),(3,5,9)],'m³',
 'An ellipsoid has three mutually perpendicular semiaxes {0} m, {1} m, and {2} m. Find its enclosed volume.',
 'V = (4π/3)abc.','The given distances are semiaxes, not full diameters.'),
65:('torus-volume',[(7,2),(9,3)],'cm³',
 'A ring-shaped toroidal seal has major radius {0} cm and circular tube radius {1} cm. Calculate solid volume.',
 'V = (2πR)(πr²) = 2π²Rr².','Ring torus with major radius R strictly larger than tube radius r.'),
66:('sum',[(46,38,15),(70,25,12)],'L',
 'A vessel assembly has three disjoint chambers holding {0} L, {1} L and {2} L. Find total capacity.',
 'Add the nonoverlapping chamber volumes.','The chambers do not overlap.'),
67:('drilled-block',[(12,10,8,2),(15,12,6,3)],'cm³',
 'A rectangular block is {0} cm by {1} cm by {2} cm. A round hole of radius {3} cm passes through its {2}-cm dimension. Find solid volume remaining.',
 'Vremaining = length × width × thickness − π(hole radius)²×thickness.','The through-hole lies wholly inside the block.'),
68:('scale-volume',[(13,2.5),(8,3)],'L',
 'A {0}-liter prototype is enlarged so every linear dimension is multiplied by {1}. What is the resulting volume?',
 'For similar solids, Vnew = Voriginal × (linear scale)³.','Uniform scaling in all three spatial dimensions.'),
69:('truncated-cone',[(6,12,2,4),(9,15,3,5)],'cm³',
 'From a right cone with radius {0} cm and height {1} cm, remove a smaller similar tip cone with radius {2} cm and height {3} cm. Find the remaining frustum volume.',
 'Subtract similar cone volumes: V = (π/3)(R²H−r²h).','The tip cone is similar and removed by a cut parallel to the base.'),
70:('disk',[(4,7),(2.5,9)],'cm³',
 'Rotate a rectangle of height {0} cm and length {1} cm fully about the axis along its length. Find the volume swept out.',
 'The rotation produces a cylinder: V = π(radius)² × length.','The axis coincides with one long side of the rectangle.'),
71:('cavalieri',[(18,7),(24,11)],'cm³',
 'Two solids of equal height {1} cm have equal horizontal sections of constant area {0} cm² at every level. Find the volume of either solid.',
 'By Cavalieri, the two volumes match; each is integral of section area: V = Ah.','All corresponding heights have equal cross-sectional area.'),
72:('prismoid',[(100,64,36,8),(64,36,16,12)],'m³',
 'A true prismoid of height {3} m has end areas {0} m² and {2} m² and midsection area {1} m². Find volume by the prismoidal rule.',
 'V = (h/6)(A₁+4Am+A₂). For similar linear sections, the area varies quadratically.','Only use for an appropriate prismoid, not an arbitrary body.'),
73:('pappus-volume',[(12,5),(15,7)],'cm³',
 'A thin rectangular planar region with area {0} cm² revolves through 360° about an external coplanar axis {1} cm from its centroid. Determine swept volume.',
 'Pappus volume theorem: V = area × (2π× centroid-axis distance).','The axis is coplanar and external to the entire region.'),
74:('pappus-area',[(14,6),(9,5)],'cm²',
 'A straight plane curve of length {0} cm revolves once about a coplanar axis {1} cm from its centroid that does not meet the curve. Find swept area.',
 'Pappus surface theorem: S = curve length × (2π× centroid-axis distance).','The generating curve does not intersect the rotation axis.'),
75:('half-cylinder-liters',[(1.5,6),(0.8,10)],'L',
 'A horizontal right circular cylinder of radius {0} m and length {1} m is filled exactly to its centerline. How many liters are inside?',
 'Half of full-cylinder volume = ½πr²L cubic meters; multiply by 1,000 L/m³.','The axis is horizontal and the liquid surface passes through the center.'),
76:('mass',[(0.04,7850),(0.065,2700)],'kg',
 'A homogeneous fabricated component has net solid volume {0} m³ and material density {1} kg/m³. Find its mass.',
 'Mass = density × material (not cavity) volume.','Consistent density and volume units.'),
77:('opt-radius',[(54*math.pi,),(128*math.pi,)],'cm',
 'A fully closed right circular cylinder must hold {0} cm³ while minimizing total material surface area. Find its optimal radius.',
 'Minimum area occurs at h = 2r. Thus V = πr²h = 2πr³, giving r = (V/(2π))^(1/3).','Fixed volume, right cylinder, two end disks included.'),
78:('mm3-m3',[(50_000_000,),(125_000_000,)],'m³',
 'Convert a machined component volume of {0} mm³ to cubic meters.',
 'Since 1 m = 1000 mm, 1 m³ = 10⁹ mm³; divide by 10⁹.','Volume conversion applies the length factor three times.'),
}

CONCEPTUAL={
36:[('Plane intersection','Which configuration is possible for two distinct planes in Euclidean 3D?',
 ['They intersect in exactly one straight line','They meet at exactly two isolated points','They meet in only a finite line segment','They form an isolated shared circle'],0,
 ['Two distinct planes either are parallel or intersect along a complete straight line.','A circle or finite segment cannot be the entire intersection of two infinite planes.']),
 ('Line-plane incidence','If a straight line contains two different points of a plane, what follows?',
 ['The entire line lies in the plane','The line crosses the plane at a single point','The line cannot be parallel to the plane','The plane must be perpendicular to the line'],0,
 ['Any two distinct points determine a line.','The plane containing both points also contains that entire line.'])],
37:[('Skew lines','Which statement about two skew lines is correct?',
 ['They do not intersect and are not coplanar','They intersect at 90°','They lie on the same plane and never meet','Their distance must be zero'],0,
 ['Skew lines are noncoplanar and nonintersecting.','Parallel lines must be coplanar, so skew lines are not parallel.']),
 ('Perpendicular lines','What must be established before declaring two straight lines perpendicular?',
 ['They intersect at a right angle','They appear to form a right angle in a perspective drawing','They have different slopes in two different planes','They never meet'],0,
 ['Perpendicularity of lines requires a common intersection at 90°.','Perspective illustrations may distort apparent angles.'])],
38:[('Dihedral angle','The dihedral angle between two half-planes sharing an edge is measured using:',
 ['A section by a plane perpendicular to their common edge','Their projected area on a horizontal plane','The angles of any triangle drawn on one face','The distance between arbitrary points on the two faces'],0,
 ['Take a cross-section perpendicular to the common edge.','The two intersection rays determine the plane angle of the dihedral angle.']),
 ('Perpendicular planes','Two adjacent walls meet at an interior dihedral angle of 90°. They are:',
 ['Perpendicular planes','Parallel planes','Skew planes','Coincident planes'],0,
 ['A right dihedral angle describes perpendicular intersecting planes.','Distinct planes cannot be skew in the line-geometry sense.'])]
}

CHALLENGE_TITLES={
39:'Polyhedron face count', 42:'Closed square prism total area',
46:'Closed cylinder surface area', 50:'Regular pyramid lateral area',
58:'Spherical tank volume', 59:'Closed hemisphere total area',
60:'Circumscribed sphere radius', 61:'Spherical cap volume',
63:'Regular tetrahedron total surface area',
75:'Half-full horizontal cylinder volume', 77:'Optimal closed-cylinder radius'
}
out=[]
for topic in range(36,79):
 tid=f'GEO-{topic:03d}'
 if topic in CONCEPTUAL:
  for variant,(title,prompt,options,correct,work) in enumerate(CONCEPTUAL[topic],1):
   order=(variant+topic)%4
   perm=list(range(4)); perm=perm[order:]+perm[:order]
   out.append({'id':f'SMP-{topic:03d}-C{variant}','topic_id':tid,'title':title,'level':'Challenge',
    'kind':'conceptual','prompt':prompt,'options':[options[i] for i in perm],
    'correctIndex':perm.index(correct),'expected':None,'unit':'','formulaId':'','work':work,
    'restriction':'','example':False})
  continue
 tag,paramsets,unit,template,rule,restriction=CASES[topic]
 original=by_topic[tid]
 for variant,params in enumerate(paramsets,1):
  value=calc(tag,params)
  assert math.isfinite(value) and value>0,(topic,variant,value)
  # Ensure 4 distinct choices after 6 significant digits (matching UI display precision).
  if tag=='euler-faces':
   distractors=[value-2,value-1,value+1]
  else:
   distractors=[value*f for f in (.75,.9,1.2)]
  order=(topic*3+variant)%4
  options=[value]+distractors
  perm=list(range(4));perm=perm[order:]+perm[:order]
  options=[options[i] for i in perm]
  assert len({float(f'{x:.6g}') for x in options})==4,(topic,options)
  prompt=template.format(*[f'{x:.6g}' if isinstance(x,float) else str(x) for x in params])
  if topic==39: prompt=prompt.replace('hexagonal/heptagonal',('hexagonal' if variant==1 else 'heptagonal'))
  if topic==77:
   prompt=f'A fully closed right circular cylinder must hold {round(params[0]/math.pi)}π cm³ while minimizing total material surface area. Find its optimal radius.' 
  work=[rule,f'Substitute the given measurements: {tag.replace("-"," ")} with inputs '+', '.join(f'{x:.6g}' if isinstance(x,float) else str(x) for x in params)+f' gives {value:.8g} {unit}.']
  out.append({'id':f'SMP-{topic:03d}-C{variant}','topic_id':tid,'title':f'{CHALLENGE_TITLES.get(topic, original["title"].split(" — ")[0])} — challenge {variant}',
   'level':'Challenge','kind':'numeric','prompt':prompt,'options':options,'correctIndex':perm.index(0),
   'expected':value,'unit':unit,'formulaId':next((candidate.get('formulaId','') for candidate in base if candidate['topic_id']==tid and candidate.get('verifyTag')==tag),''),'work':work,
   'verifyTag':tag,'verifyInputs':params,'restriction':restriction,'example':False})
assert len(out)==86 and len({q['id'] for q in out})==86
OUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(f'Generated {len(out)} independently worded challenge questions in {OUT.relative_to(ROOT)}.')
