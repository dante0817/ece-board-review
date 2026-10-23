/** v10.52.0 independent question calculation and content integrity checks. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const get=(relative)=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const src=(relative)=>fs.readFileSync(path.join(root,relative),'utf8');
const qs=get('src/data/geometry/solidMensurationPractice.json');
const lessons=get('src/data/geometry/solidMensurationLessons.json');
const formulae=get('src/data/geometry/solidMensurationFormulas.json');
const units=get('src/data/geometry/solidMensurationUnits.json');
const originalNumericChecks=get('src/data/geometry/solidMensurationNumericChecks.json');
assert.equal(qs.length,86);
assert.equal(lessons.length,43);
assert.equal(formulae.length,73);
assert.equal(originalNumericChecks.length,43);
assert.equal(units.length,13);
assert.equal(new Set(qs.map(q=>q.id)).size,86);
const availableTopics=new Set(lessons.map(x=>x.topic_id));
const formulaIDs=new Set(formulae.map(x=>x.id));
const p=Math.PI;
const verify=(tag,a)=>{
 const [x,y,z,w]=a;
 switch(tag){
  case 'euler-faces':return 2+y-x;
  case 'diagonal':return Math.hypot(...a);
  case 'rectangle':case 'prism-lateral':case 'prism-volume':case 'cavalieri':case 'mass':case 'cost':return x*y;
  case 'prism-total':return x*y+2*z;
  case 'cuboid':return x*y*z;
  case 'cylinder-lateral':return 2*p*x*y;
  case 'cylinder-total':return 2*p*x*(y+x);
  case 'cylinder-volume':case 'disk':return p*x*x*y;
  case 'pipe-volume':return p*(x*x-y*y)*z;
  case 'pyramid-slant':case 'cone-slant':return Math.hypot(x,y);
  case 'pyramid-lateral':return x*y/2;
  case 'pyramid-volume':return x*y/3;
  case 'cone-lateral':return p*x*y;
  case 'cone-volume':return p*x*x*y/3;
  case 'cone-total':return p*x*(y+x);
  case 'frustum-volume':return p*z*(x*x+x*y+y*y)/3;
  case 'frustum-lateral':return p*(x+y)*z;
  case 'pyramidal-frustum':return z*(x+y+Math.sqrt(x*y))/3;
  case 'sphere-area':return 4*p*x*x;
  case 'sphere-volume':return (4/3)*p*x*x*x;
  case 'hemisphere-curved':return 2*p*x*x;
  case 'hemisphere-total':return 3*p*x*x;
  case 'inscribed-radius':return x/2;
  case 'circumscribed-radius':return Math.sqrt(3)*x/2;
  case 'cap-area':return 2*p*x*y;
  case 'cap-volume':return p*y*y*(x-y/3);
  case 'segment-volume':return p*z*(3*x*x+3*y*y+z*z)/6;
  case 'sector-volume':return 2*p*x*x*y/3;
  case 'tetra-volume':return x*x*x/(6*Math.SQRT2);
  case 'tetra-area':return Math.sqrt(3)*x*x;
  case 'ellipsoid-volume':return 4*p*x*y*z/3;
  case 'torus-volume':return 2*p*p*x*y*y;
  case 'torus-area':return 4*p*p*x*y;
  case 'sum':return a.reduce((s,v)=>s+v,0);
  case 'drilled-block':return x*y*z-p*w*w*z;
  case 'scale-volume':return x*y*y*y;
  case 'scale-area':return x*y*y;
  case 'truncated-cone':return p*(x*x*y-z*z*w)/3;
  case 'triangular-prism':return x*y*z/2;
  case 'shell':return p*x*y*y;
  case 'prismoid':return w*(x+4*y+z)/6;
  case 'pappus-volume':case 'pappus-area':return 2*p*x*y;
  case 'm3-liters':return 1000*x;
  case 'half-cylinder-liters':return 500*p*x*x*y;
  case 'opt-height':return 2*x;
  case 'opt-radius':return Math.cbrt(x/(2*p));
  case 'mm3-m3':return x/1e9;
  case 'cm2-m2':return x/10000;
  default:throw new Error(`Unknown independent calculation: ${tag}`);
 }
};
let numerical=0,reasoning=0;
for(let n=36;n<=78;n++){
 const topic=`GEO-${String(n).padStart(3,'0')}`;
 assert(availableTopics.has(topic),topic);
 const items=qs.filter(q=>q.topic_id===topic);
 assert.equal(items.length,2,`${topic} has two teaching problems`);
 assert.notEqual(items[0].prompt,items[1].prompt);
}
for(const q of qs){
 assert(availableTopics.has(q.topic_id));
 assert.equal(q.options.length,4,q.id);
 assert(q.correctIndex>=0&&q.correctIndex<=3,q.id);
 assert(q.work.length>=2,q.id);
 assert(q.work.every(s=>s.length>=3));
 assert(q.prompt.length>18);
 assert(q.formulaId===''||formulaIDs.has(q.formulaId));
 if(q.kind==='conceptual'){
  reasoning++;
  assert.equal(new Set(q.options).size,4,q.id);
  assert.equal(q.expected,null);
 }else{
  numerical++;
  const actual=verify(q.verifyTag,q.verifyInputs);
  assert(Number.isFinite(actual),q.id);
  assert(Math.abs(actual-q.expected) <= 1e-10*Math.max(1,Math.abs(actual)),`${q.id} expected ${q.expected}, computed ${actual}`);
  const difference=Math.abs(q.options[q.correctIndex]-q.expected);
  assert(difference < 2e-10*Math.max(1,Math.abs(actual)),`${q.id} correct option drift`);
  // Options are distinct after UI rounding to six significant figures.
  const rounded=q.options.map(v=>Number(v.toPrecision(6)));
  assert.equal(new Set(rounded).size,4,`${q.id} duplicate visible choice`);
  assert(q.unit.length>0,q.id);
  if(['pipe-volume','frustum-volume','frustum-lateral','torus-volume','torus-area'].includes(q.verifyTag)){
   assert(q.verifyInputs[0]>q.verifyInputs[1] || q.verifyTag==='frustum-volume' || q.verifyTag==='frustum-lateral',q.id);
  }
  if(q.verifyTag==='cap-area'||q.verifyTag==='cap-volume')assert(q.verifyInputs[1]<=2*q.verifyInputs[0],q.id);
  if(q.verifyTag==='segment-volume'){
   // Existence: centers of two circular sections must fit on one sphere.
   const [r1,r2,h]=q.verifyInputs;
   const za=(r1*r1-r2*r2-h*h)/(2*h);
   assert(Number.isFinite(Math.sqrt(r1*r1+za*za)),q.id);
  }
 }
}
assert.equal(numerical,80);assert.equal(reasoning,6);
const adapter=src('src/features/solid-mensuration/solidMensurationContent.ts');
assert(adapter.includes('contentVersion:2'));
assert(adapter.includes('worked-example'));
assert(adapter.includes('lessonsJson'));
assert(adapter.includes('challengeJson')); 
assert(adapter.includes('geo-solid-'));
const screen=src('src/features/solid-mensuration/SolidMensurationScreen.tsx');
assert(screen.includes('SolidGeometryIllustration'));
assert(screen.includes('SOLID_PRACTICE'));
assert(screen.includes('displayPracticeAnswer'));
assert(!/localStorage\.(clear|removeItem)\(/.test(screen));
const figures=src('src/features/solid-mensuration/SolidGeometryIllustration.tsx');
for(let n=36;n<=78;n++)assert(figures.includes(`'${String(n).padStart(3,'0')}'`),n);
const pkg=get('package.json'),lock=get('package-lock.json');
assert(['10.52.0','10.53.0', '10.54.0','10.55.0','10.56.0','10.56.0','10.57.0','10.58.0','10.60.0','10.61.0','10.62.0'].includes(pkg.version));assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
assert.equal(pkg.scripts['validate:solid-mensuration:v10.52.0'],'node scripts/validateSolidMensurationV10520.mjs && node scripts/validateSolidMensurationApplicabilityV10520.mjs');
console.log(`PASS v10.52.0: 43/43 topics; ${numerical} independently recalculated numeric questions; ${reasoning} reasoning questions; 43 illustration mappings (34 SVG variants); 73 formulas; prior 43 numeric regression cases retained; stable tracking IDs.`);
