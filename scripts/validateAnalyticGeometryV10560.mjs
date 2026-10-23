/** v10.56: all 27 canonical topics, coordinate calculations, routing, and protected existing content. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const json=f=>JSON.parse(read(f));
const L=json('src/features/analytic-geometry/analyticLessons.json');
const F=json('src/features/analytic-geometry/analyticFormulas.json');
const U=json('src/features/analytic-geometry/analyticUnits.json');
const Q=json('src/features/analytic-geometry/analyticPractice.json');
const pkg=json('package.json'),lock=json('package-lock.json');
assert(['10.56.0','10.57.0','10.58.0','10.60.0','10.61.0','10.62.0'].includes(pkg.version));assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
assert.equal(L.length,27);assert.equal(U.length,9);assert.equal(F.length,44);assert.equal(Q.length,54);
const getL=new Map(L.map(l=>[l.topic_id,l]));const getF=new Map(F.map(f=>[f.id,f]));
assert.equal(getL.size,27);assert.equal(getF.size,F.length);
for(let i=79;i<=105;i++){
 const id=`GEO-${String(i).padStart(3,"0")}`;
 assert(getL.has(id),`Missing canonical lesson ${id}`);
 const l=getL.get(id);assert(l.title&&l.concept.length>50&&l.method.length>35&&l.guardrail.length>24);
 assert(U.some(u=>u.unit_id===l.unit_id),`${id} has no unit`);
 assert(['Core','Extended'].includes(l.priority));
 assert(l.main_reference_code&&l.main_reference_location&&l.support_reference_code);
 assert.equal(Q.filter(q=>q.topic_id===id).length,2,id);
 assert(F.some(f=>f.topic_id===id),id);
}
const r={
 reflect_x:([x])=>-x,
 distance2:([a,b,c,d])=>Math.sqrt((a-c)**2+(b-d)**2),
 section_x:([x1,x2,m,n])=>(n*x1+m*x2)/(m+n),
 slope:([x1,y1,x2,y2])=>(y2-y1)/(x2-x1),
 perp_slope:([m])=>-1/m,
 point_slope_y:([x1,y1,m,x])=>y1+m*(x-x1),
 general_y:([a,b,c,x])=>(c-a*x)/b,
 point_line_distance:([x,y,a,b,c])=>Math.abs(a*x+b*y+c)/Math.hypot(a,b),
 intersection_x:([m1,b1,m2,b2])=>(b2-b1)/(m1-m2),
 perp_bisector_x:([a,b])=>(a+b)/2,
 circle_radius_sq:([d,e,f])=>(d*d+e*e)/4-f,
 tangent_length:([d,r])=>Math.sqrt(d*d-r*r),
 parabola_p:([v])=>v/4,
 ellipse_c:([a,b])=>Math.sqrt(a*a-b*b),
 hyperbola_c:([a,b])=>Math.hypot(a,b),
 conic_discriminant:([a,b,c])=>b*b-4*a*c,
 translation_x:([x,h])=>x-h,
 polar_x:([radius,deg])=>radius*Math.cos(deg*Math.PI/180),
 param_x:([x0,a,t])=>x0+a*t,
 vector_sum_x:([a,b])=>a+b,
 dot3:([ax,ay,az,bx,by,bz])=>ax*bx+ay*by+az*bz,
 distance3:([x,y,z,u,v,w])=>Math.hypot(u-x,v-y,w-z),
 line3_x:([x0,a,t])=>x0+a*t,
 plane_z:([a,b,c,d,x,y])=>(d-a*x-b*y)/c,
 sphere_r:([r2])=>Math.sqrt(r2),
 ellipsoid_max:([a,b,c])=>Math.sqrt(Math.max(a,b,c)),
 triangle_det_area:([x1,y1,x2,y2,x3,y3])=>Math.abs(x1*(y2-y3)+x2*(y3-y1)+x3*(y1-y2))/2,
};
assert.equal(Object.keys(r).length,27);
let numeric=0,concept=0;const qs=new Set();
for(const q of Q){
 assert(!qs.has(q.id),`Duplicate question ${q.id}`);qs.add(q.id);
 assert(getL.has(q.topic_id),q.id);assert(getF.has(q.formulaId),q.id);
 assert.equal(q.options.length,4,q.id);assert.equal(new Set(q.options.map(String)).size,4,q.id);
 assert(Number.isInteger(q.correctIndex)&&q.correctIndex>=0&&q.correctIndex<4,q.id);
 assert(q.prompt.length>=25 && q.work.length>=1 && q.work.every(w=>w.trim()),q.id);
 if(q.kind==='numeric'){
   assert.equal(typeof q.expected,'number',q.id);
   assert(typeof r[q.rule]==='function',q.id);
   const actual=r[q.rule](q.params);
   assert(Number.isFinite(actual),`${q.id}: result nonfinite`);
   assert(Math.abs(actual-q.expected)<=Math.max(0.00011,Math.abs(q.expected)*1e-7),`${q.id}: computed ${actual}, stored ${q.expected}`);
   assert.equal(q.options[q.correctIndex],q.expected,q.id);
   numeric++;
 }else{
   assert.equal(q.kind,'concept',q.id);
   assert.equal(typeof q.options[q.correctIndex],'string',q.id);
   assert(q.work[0].length>=30,q.id);
   concept++;
 }
}
assert.equal(numeric,27);assert.equal(concept,27);
for(const f of F){
 assert(getL.has(f.topic_id)&&f.name.length>3&&f.conditions.length>12,f.id);
 assert(f.latex.length>5&&!f.latex.includes('\\\\'),`Malformed latex escape in ${f.id}`);
}
for(const u of U)assert(L.some(l=>l.unit_id===u.unit_id));
const app=read('src/App.tsx'),context=read('src/context/ReviewContext.tsx'),side=read('src/components/Sidebar.tsx'),hub=read('src/features/geometry/GeometryScreen.tsx'),catalog=read('src/features/geometry/geometryCatalog.ts'),content=read('src/features/analytic-geometry/analyticGeometryContent.ts'),screen=read('src/features/analytic-geometry/AnalyticGeometryScreen.tsx');
for(const text of [app,context,side])assert(text.includes("'analytic-geometry'"));
assert(app.includes("currentScreen === 'analytic-geometry' && <AnalyticGeometryScreen />"));
assert(hub.includes('id="btn-geometry-analytic-geometry"') && hub.includes("setCurrentScreen('analytic-geometry')"));
assert(catalog.includes("id: 'analytic', name: 'Analytic Geometry', availability: 'available-draft'"));
assert(content.includes('geo-analytic-${id.slice(-3)}'));
assert(screen.includes('ANALYTIC_READER_LESSONS') && screen.includes('ManualLearnTracker'));
assert(screen.includes("Back to Geometry',onClick:()=>setCurrentScreen('geometry')"));
assert(read('src/domain/learn/manualLearnTracking.ts').includes('geo-(?:solid|plane|analytic)-[0-9]{3}'));
const protectedSource=json('scripts/analyticGeometryProtectedV10550.json').protectedSha256;
for(const [file,hash] of Object.entries(protectedSource)){
 const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
 assert.equal(actual,hash,`Protected Plane/Solid content changed: ${file}`);
}
console.log(`PASS Analytic Geometry v10.56.0: 27 lessons, 9 units, 44 formula notes; 27/27 independently recomputed numerical answers, 27 concept items structurally checked, all protected ${Object.keys(protectedSource).length} existing content files unchanged`);
