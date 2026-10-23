/** v10.55.0 Plane Geometry: numerical, curriculum, route, storage and regression gates. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
const dir=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(dir,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const json=f=>JSON.parse(read(f));
const pkg=json('package.json'),lock=json('package-lock.json');
assert(['10.55.0','10.56.0','10.57.0','10.58.0','10.60.0','10.61.0','10.62.0'].includes(pkg.version));assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
const where='src/features/plane-geometry/';
const L=json(where+'planeLessons.json'),F=json(where+'planeFormulas.json'),U=json(where+'planeUnits.json'),Q=json(where+'planePractice.json');
assert.equal(L.length,35);assert.equal(F.length,42);assert.equal(U.length,6);assert.equal(Q.length,70);
for(let i=0;i<35;i++){
 const id=`GEO-${String(i+1).padStart(3,'0')}`;
 assert.equal(L[i].topic_id,id);
 assert.equal(F[i].topic_id,id);
 assert.equal(Q[2*i].topic_id,id);assert.equal(Q[2*i+1].topic_id,id);
 assert.equal(Q[2*i].id,`PG-Q${String(i+1).padStart(3,'0')}-01`);
 assert.equal(Q[2*i+1].id,`PG-Q${String(i+1).padStart(3,'0')}-02`);
 for(const key of ['concept','method','goal','guardrail','main_reference_location','support_reference_location'])assert(L[i][key]?.trim(),`Missing lesson content ${id} ${key}`);
}
assert.equal(new Set(L.map(x=>x.topic_id)).size,35);
assert.equal(new Set(Q.map(x=>x.id)).size,70);
assert.equal(new Set(F.map(x=>x.id)).size,42);
const near=(a,b)=>Math.abs(a-b)<0.000051;
const pi=Math.PI;
// Independent implementation: the Python authoring script creates data and this separate JS runner recomputes keys.
const mathRules={
 complement:([x])=>90-x,supplement:([x])=>180-x,angle_sum:([x,y])=>180-x-y,
 segment_add:([x,y])=>x+y,segment_sub:([x,y])=>x-y,vertical:([x])=>x,corresponding:([x])=>x,
 linear_pair:([x])=>180-x,triangle_exterior:([x,y])=>x+y,triangle_sides:([x,y])=>x+y,
 pythag:([x,y])=>Math.hypot(x,y),pythag_leg:([x,y])=>Math.sqrt((x-y)*(x+y)),
 leg45:([x])=>x*Math.SQRT2,leg30:([x])=>x*Math.sqrt(3),scale:([x,y,z])=>x*y/z,
 midsegment:([x])=>x/2,tanheight:([d,angle])=>d*Math.sin(angle*pi/180)/Math.cos(angle*pi/180),
 heron:(a)=>{const s=a.reduce((v,w)=>v+w,0)/2;return Math.sqrt(a.reduce((v,x)=>v*(s-x),s));},
 parallelogram_area:([b,h])=>b*h,kite_area:([d1,d2])=>d1*d2/2,
 poly_angle:([n])=>180-360/n,poly_diagonals:([n])=>n*(n-3)/2,
 triangle_area:([b,h])=>b*h/2,trap_area:([a,b,h])=>(a+b)*h/2,
 polygon_area:([p,a])=>p*a/2,difference_areas:([w,h,r])=>w*h-r*r*pi,
 area_ratio:([b,s])=>b*b/(s*s),circumference:([r])=>2*r*pi,
 arc_length:([r,t])=>r*(t*pi/180),inscribed_angle:([a])=>a/2,
 chord_product:([a,b,c])=>a*b/c,sector_area:([r,t])=>pi*r*r*t/360,
 segment_area:([r,t])=>0.5*r*r*((t*pi/180)-Math.sin(t*pi/180)),
 tangent_length:([d,r])=>Math.sqrt(d*d-r*r),secant_product:([e,total])=>Math.sqrt(e*total),
 cyclic_angle:([a])=>180-a,ptolemy:([a,b,c,d,diag])=>(a*b+c*d)/diag,
 apothem:([s,n])=>s/(2*Math.tan(pi/n)),locus_distance:([r])=>r,
 rotation:([x,y])=>Math.hypot(x,y),bearing_height:([d,t])=>d*Math.tan(t*pi/180),
 indirect:([h,d,s])=>h*d/s,centroid:([m])=>2*m/3,
 angle_bisector:([l,a,b])=>l*a/(a+b),
};
let numeric=0,concept=0;
for(const q of Q){
 assert(['Foundation','Applied'].includes(q.level),q.id);
 assert.equal(q.options.length,4,q.id);
 assert(q.correctIndex>=0&&q.correctIndex<=3,q.id);
 assert.equal(new Set(q.options.map(String)).size,4,q.id);
 assert(q.work.length>=1 && q.work.every(w=>w.trim()),q.id);
 assert(L.find(l=>l.topic_id===q.topic_id),q.id);
 assert(F.find(f=>f.id===q.formulaId),q.id);
 if(q.kind==='numeric'){
  assert.equal(typeof q.expected,'number',q.id);
  assert.equal(typeof mathRules[q.rule],'function',q.id);
  const actual=mathRules[q.rule](q.params);
  assert(Number.isFinite(actual)&&actual>0,q.id);
  assert(near(actual,q.expected),`${q.id}: expected ${q.expected}, computed ${actual}`);
  assert.equal(q.options[q.correctIndex],q.expected,q.id);
  numeric++;
 }else{
  assert.equal(q.kind,'concept',q.id);
  assert.equal(typeof q.options[q.correctIndex],'string',q.id);
  assert(q.options[q.correctIndex].length>=2,q.id);
  concept++;
 }
}
const context=read('src/context/ReviewContext.tsx'),app=read('src/App.tsx'),hub=read('src/features/geometry/GeometryScreen.tsx'),catalog=read('src/features/geometry/geometryCatalog.ts'),sidebar=read('src/components/Sidebar.tsx'),screen=read(where+'PlaneGeometryScreen.tsx'),content=read(where+'planeGeometryContent.ts');
assert(context.includes("| 'plane-geometry'"));
assert(app.includes("currentScreen === 'plane-geometry' && <PlaneGeometryScreen />"));
assert(app.includes("'plane-geometry',"));
assert(sidebar.includes("'plane-geometry',"));
assert(hub.includes('id="btn-geometry-plane-geometry"')&&hub.includes("setCurrentScreen('plane-geometry')"));
assert(catalog.includes("id: 'plane', name: 'Plane Geometry & Mensuration', availability: 'available-draft'"));
assert(catalog.includes("id: 'analytic', name: 'Analytic Geometry', availability: 'available-draft'"));
assert(screen.includes('id="plane-geometry-app-screen"'));
assert(screen.includes("Back to Geometry',onClick:()=>setCurrentScreen('geometry')"));
assert(content.includes('geo-plane-${id.slice(-3)}'), 'Dedicated tracking ID namespace required');
assert(!content.includes('geo-solid-'));
assert(screen.includes('PLANE_READER_LESSONS') && screen.includes('ManualLearnTracker'));
// No source file protected by the v10.54.0 baseline may be altered.
const baseline=json('scripts/geometryBaselineV10530.json');
for(const [file,digest] of Object.entries(baseline.protectedSha256)){
  // The only protected-file update is the intentional extension of accepted geometry study IDs.
  if(file==='src/domain/learn/manualLearnTracking.ts') {
    const progress=read(file);
    assert(progress.includes('geo-(?:solid|plane|analytic)-[0-9]{3}'), 'Both geometry scopes must validate');
    assert(progress.includes('normalizedCardId'), 'Geometry reader section IDs need normalization');
    // Existing storage key, schema, legacy patterns and functions must remain unchanged.
    assert(progress.includes("'ece_manual_learn_tracking_v1'") && progress.includes('schemaVersion: 1'));
    assert(progress.includes('alg-[a-z0-9-]{1,100}') && progress.includes('trig-[a-z0-9-]{1,160}'));
    continue;
  }
 const current=crypto.createHash('sha256').update(read(file)).digest('hex');
 assert.equal(current,digest,`Protected content/tracking changed: ${file}`);
}
console.log(`PASS Plane Geometry v10.55.0: ${L.length} lessons, ${F.length} formula notes, ${numeric}/${numeric} numeric independently recalculated, ${concept} concept questions structurally checked; 6 units, stable routes and tracking namespace, nine protected content files preserved; shared tracker compatibility-extended.`);
