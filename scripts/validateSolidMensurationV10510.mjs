import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const read=(p)=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const data=(p)=>JSON.parse(read(`src/data/geometry/${p}.json`));
const units=data('solidMensurationUnits'),lessons=data('solidMensurationLessons'),formulas=data('solidMensurationFormulas'),checks=data('solidMensurationNumericChecks');
const inUnit=(id)=>units.some(u=>u.topic_ids.includes(id));
assert.equal(lessons.length,43);assert.equal(formulas.length,73);assert.equal(checks.length,43);assert.equal(units.length,13);
assert.equal(new Set(lessons.map(l=>l.topic_id)).size,43);assert.equal(new Set(formulas.map(f=>f.id)).size,73);
assert.equal(new Set(checks.map(c=>c.test_id)).size,43);
for(let n=36;n<=78;n++)assert(lessons.some(l=>l.topic_id===`GEO-${String(n).padStart(3,'0')}`));
for(const l of lessons){assert(inUnit(l.topic_id),l.topic_id);assert(units.find(u=>u.unit_id===l.unit_id).topic_ids.includes(l.topic_id));assert(l.demonstrable_learning_goal?.length>15);assert(l.guardrail?.length>12);assert(l.main_reference_location);assert(l.reference_status);}
for(const f of formulas){for(const id of f.topic_ids.split(',').map(s=>s.trim()))assert(lessons.some(l=>l.topic_id===id),`${f.id}: ${id}`);assert(f.latex.length>2);assert(f.conditions.length>6);}
const evaluate=(id,a)=>{
 const [x,y,z,w]=a,p=Math.PI;
 switch(id){
 case 'SMF-001':return Math.hypot(x,y,z);
 case 'SMF-002':return x-y+z;
 case 'SMF-007':case 'SMF-008':return x*y;
 case 'SMF-010':return x*y*z;
 case 'SMF-011':return 2*(x*y+x*z+y*z);
 case 'SMF-015':return p*x*x*y;
 case 'SMF-016':return 2*p*x*y;
 case 'SMF-018':return p*(x*x-y*y)*z;
 case 'SMF-019':return 2*p*(x+y)*z+2*p*(x*x-y*y);
 case 'SMF-021':return x*y/3;
 case 'SMF-023':return x*y/2;
 case 'SMF-025':return p*x*x*y/3;
 case 'SMF-026':return Math.hypot(x,y);
 case 'SMF-027':return p*x*y;
 case 'SMF-029':return p*z*(x*x+x*y+y*y)/3;
 case 'SMF-030':return Math.hypot(z,x-y);
 case 'SMF-031':return p*(x+y)*z;
 case 'SMF-033':return z*(x+y+Math.sqrt(x*y))/3;
 case 'SMF-036':return 4*p*x*x;
 case 'SMF-037':return 4*p*x*x*x/3;
 case 'SMF-039':return 3*p*x*x;
 case 'SMF-040':return 2*p*x*x*x/3;
 case 'SMF-043':return 2*p*x*y;
 case 'SMF-044':return p*y*y*(x-y/3);
 case 'SMF-045':return 2*x*y-y*y;
 case 'SMF-047':return p*z*(3*x*x+3*y*y+z*z)/6;
 case 'SMF-048':return 2*p*x*x*y/3;
 case 'SMF-050':return x**3/(6*Math.SQRT2);
 case 'SMF-052':return Math.SQRT2*x**3/3;
 case 'SMF-053':return 4*p*x*y*z/3;
 case 'SMF-055':return 2*p*p*x*y*y;
 case 'SMF-056':return 4*p*p*x*y;
 case 'SMF-059':return x*x*y;
 case 'SMF-060':return x**3*y;
 case 'SMF-065':return w*(x+4*y+z)/6;
 case 'SMF-066':return 2*p*x*x*p*y; // A=πr², centroid travels 2πd
 case 'SMF-067':return 2*p*x*2*p*y; // L=2πr, centroid travels 2πd
 case 'SMF-068':return 1000*x;
 case 'SMF-069':return x*y;
 case 'SMF-071':return 2*x;
 case 'SMF-072':return Math.cbrt(x/(2*p));
 default:throw Error(`Case has no independent evaluator: ${id}`);
 }
};
let maxAbs=0;
for(const c of checks){assert(formulas.some(f=>f.id===c.formula_id));const actual=evaluate(c.formula_id,c.inputs);const delta=Math.abs(actual-c.expected_result);const epsilon=1e-8*Math.max(1,Math.abs(c.expected_result));assert(delta<epsilon,`${c.test_id} expected ${c.expected_result}, calculated ${actual}`);maxAbs=Math.max(maxAbs,delta);assert(c.scenario?.length>=8)}
// Check the specialized cases have actual coverage and enforce guardrail descriptions.
for(const id of ['GEO-056','GEO-057','GEO-061','GEO-062','GEO-071','GEO-072','GEO-073','GEO-074'])assert(lessons.some(l=>l.topic_id===id&&l.formula_ids.length));
const manifest=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(['10.51.0','10.52.0','10.53.0', '10.54.0','10.55.0','10.56.0','10.57.0','10.58.0','10.60.0','10.61.0','10.62.0'].includes(manifest.version));assert.equal(lock.version,manifest.version);assert.equal(lock.packages[''].version,manifest.version);
const app=read('src/App.tsx'),math=read('src/components/MathematicsScreen.tsx'),ctx=read('src/context/ReviewContext.tsx'),progress=read('src/domain/learn/manualLearnTracking.ts');
assert(app.includes("currentScreen === 'solid-mensuration' && <SolidMensurationScreen"));if(['10.57.0','10.58.0','10.60.0','10.61.0','10.62.0'].includes(manifest.version)) {
  const catalog=read('src/features/mathematics/mathCatalog.ts');
  const hub=read('src/features/geometry/GeometryScreen.tsx');
  assert(catalog.includes("id:'geometry'") && catalog.includes("destination:'geometry'"));
  assert(hub.includes('id="btn-geometry-solid-mensuration"'));
} else assert(math.includes('id="btn-module-solid-mensuration"'));assert(ctx.includes("| 'solid-mensuration'"));assert(progress.includes('geo-(?:solid|plane|analytic)-[0-9]{3}'));
assert(!/localStorage\.(clear|removeItem)\(/.test(read('src/features/solid-mensuration/SolidMensurationScreen.tsx')));
console.log(`PASS v10.51.0 Solid Mensuration: ${units.length} units; ${lessons.length} unique canonical topics; ${formulas.length} formulas; ${checks.length} independently re-evaluated numerical checks. Maximum arithmetic error: ${maxAbs}. Routes, source metadata and progress namespaces checked.`);
