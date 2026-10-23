/** v10.53: challenge bank numeric QA, topic coverage, integrity and adaptive selector. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {practiceIndices, recommendedPracticeIndex} from '../src/features/solid-mensuration/solidPracticeEngine.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const old=json('src/data/geometry/solidMensurationPractice.json');
const next=json('src/data/geometry/solidMensurationChallenges.json');
const formulas=json('src/data/geometry/solidMensurationFormulas.json');
const lessons=json('src/data/geometry/solidMensurationLessons.json');
const units=json('src/data/geometry/solidMensurationUnits.json');
assert.equal(old.length,86);assert.equal(next.length,86);assert.equal(old.length+next.length,172);
const qs=[...old,...next];
assert.equal(new Set(qs.map(q=>q.id)).size,172);
const topics=new Set(lessons.map(l=>l.topic_id));
const ids=new Set(formulas.map(f=>f.id));
const map=new Map(qs.map((q,i)=>[q.id,i]));
const pi=Math.PI;
function compute(q){
 const [a,b,c,d]=q.verifyInputs;
 switch(q.verifyTag){
  case 'euler-faces':return 2+b-a;
  case 'diagonal':return Math.hypot(...q.verifyInputs);
  case 'rectangle':case 'prism-volume':case 'cavalieri':case 'mass':return a*b;
  case 'prism-total':return a*b+2*c;
  case 'cuboid':return a*b*c;
  case 'cylinder-total':return 2*pi*a*(b+a);
  case 'cylinder-volume':case 'disk':return pi*a*a*b;
  case 'pipe-volume':return pi*(a*a-b*b)*c;
  case 'pyramid-lateral':return a*b/2;
  case 'pyramid-volume':return a*b/3;
  case 'cone-slant':return Math.hypot(a,b);
  case 'cone-volume':return pi*a*a*b/3;
  case 'frustum-volume':return pi*c*(a*a+a*b+b*b)/3;
  case 'pyramidal-frustum':return c*(a+b+Math.sqrt(a*b))/3;
  case 'sphere-volume':return 4*pi*a*a*a/3;
  case 'hemisphere-total':return 3*pi*a*a;
  case 'circumscribed-radius':return Math.sqrt(3)*a/2;
  case 'cap-volume':return pi*b*b*(a-b/3);
  case 'segment-volume':return pi*c*(3*a*a+3*b*b+c*c)/6;
  case 'tetra-area':return Math.sqrt(3)*a*a;
  case 'ellipsoid-volume':return 4*pi*a*b*c/3;
  case 'torus-volume':return 2*pi*pi*a*b*b;
  case 'sum':return q.verifyInputs.reduce((s,n)=>s+n,0);
  case 'drilled-block':return a*b*c-pi*d*d*c;
  case 'scale-volume':return a*b**3;
  case 'truncated-cone':return pi*(a*a*b-c*c*d)/3;
  case 'prismoid':return d*(a+4*b+c)/6;
  case 'pappus-volume':case 'pappus-area':return 2*pi*a*b;
  case 'half-cylinder-liters':return 500*pi*a*a*b;
  case 'opt-radius':return Math.cbrt(a/(2*pi));
  case 'mm3-m3':return a/1e9;
  default:throw new Error(`Unsupported independent evaluator: ${q.verifyTag}`);
 }
}
const byTopic=new Map();let numerical=0,conceptual=0;
for(const q of next){
 assert(q.id.match(/^SMP-0(3[6-9]|[4-7][0-9])-C[12]$/),q.id);
 assert(topics.has(q.topic_id),q.id);
 byTopic.set(q.topic_id,(byTopic.get(q.topic_id)??0)+1);
 assert.equal(q.level,'Challenge');assert.equal(q.options.length,4,q.id);
 assert(q.prompt.length>42,q.id);assert(q.work.length>=2,q.id);
 assert(q.correctIndex>=0&&q.correctIndex<4,q.id);
 assert(q.formulaId===''||ids.has(q.formulaId),q.id);
 if(q.kind==='conceptual'){
  conceptual++;assert.equal(q.expected,null,q.id);
  assert.equal(new Set(q.options).size,4,q.id);
 } else {
  numerical++;
  assert(q.verifyTag&&Array.isArray(q.verifyInputs),q.id);
  assert(q.verifyInputs.every(Number.isFinite),q.id);
  const computed=compute(q);
  assert(Number.isFinite(computed)&&computed>0,q.id);
  assert(Math.abs(computed-q.expected)<Math.max(1,Math.abs(computed))*1e-10,`${q.id}: ${computed} != ${q.expected}`);
  assert(Math.abs(q.options[q.correctIndex]-q.expected)<Math.max(1,Math.abs(computed))*1e-10,q.id);
  assert.equal(new Set(q.options.map(v=>Number(v.toPrecision(6)))).size,4,q.id);
  assert(q.restriction.length>12,q.id);
  if(q.verifyTag==='pipe-volume') assert(q.verifyInputs[0]>q.verifyInputs[1],q.id);
  if(q.verifyTag==='cap-volume') assert(q.verifyInputs[1]<=2*q.verifyInputs[0],q.id);
  if(q.verifyTag==='torus-volume') assert(q.verifyInputs[0]>q.verifyInputs[1],q.id);
  if(q.verifyTag==='truncated-cone') assert(Math.abs(q.verifyInputs[0]/q.verifyInputs[1]-q.verifyInputs[2]/q.verifyInputs[3])<1e-8,q.id);
 }
}
assert.equal(conceptual,6);assert.equal(numerical,80);
assert.equal(byTopic.size,43);
for(const [k,v] of byTopic) assert.equal(v,2,k);
assert(qs.every(q=>topics.has(q.topic_id)));
for(let i=36;i<=78;i++) assert.equal(qs.filter(q=>q.topic_id===`GEO-${String(i).padStart(3,"0")}`).length,4,`GEO-${String(i).padStart(3,"0")}`);
const all=practiceIndices(qs,{topic:'all',unit:'all',difficulty:'all',status:'all'},{},lessons);
assert.equal(all.length,172);
const challenge=practiceIndices(qs,{topic:'all',unit:'all',difficulty:'Challenge',status:'all'},{},lessons);
assert.equal(challenge.length,86);
for(const unit of units){const found=practiceIndices(qs,{topic:'all',unit:unit.unit_id,difficulty:'all',status:'all'},{},lessons);assert.equal(found.length,unit.topic_ids.length*4,unit.unit_id)}
const narrowed=practiceIndices(qs,{topic:'GEO-043',unit:'all',difficulty:'all',status:'all'},{},lessons);
assert.equal(narrowed.length,4);
const a=qs[narrowed[0]],b=qs[narrowed[1]];
const chosen={[a.id]:a.correctIndex, [b.id]:(b.correctIndex+1)%4};
assert.equal(practiceIndices(qs,{topic:'GEO-043',unit:'all',difficulty:'all',status:'unanswered'},chosen,lessons).length,2);
const missed=practiceIndices(qs,{topic:'GEO-043',unit:'all',difficulty:'all',status:'missed'},chosen,lessons);
assert.deepEqual(missed,[map.get(b.id)]);
assert.equal(recommendedPracticeIndex(qs,all,{},0),1); // deterministic foundation-first selection
const empty=practiceIndices(qs,{topic:'GEO-036',unit:'all',difficulty:'Challenge',status:'missed'},{},lessons);
assert.equal(empty.length,0);
assert.equal(recommendedPracticeIndex(qs,[],{},0),null);
const src=read('src/features/solid-mensuration/SolidPracticePanel.tsx');
for(const f of ['difficulty','unit','topic','status','recommendedPracticeIndex','Show formula hint','Try this question again','Reset answers'])assert(src.includes(f),f);
assert(!src.match(/localStorage\.(clear|removeItem)\(/));
const adapter=read('src/features/solid-mensuration/solidMensurationContent.ts');assert(adapter.includes('challengeJson'));
const pkg=json('package.json'),lock=json('package-lock.json');assert(['10.53.0','10.54.0','10.55.0','10.56.0','10.56.0','10.57.0','10.58.0','10.60.0','10.61.0','10.62.0'].includes(pkg.version));assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
// No external UI bundle in current environment; transpile-only syntax via global TypeScript, not a substitute for Vite build.
console.log(`PASS Solid Mensuration v10.53.0: 172 unique questions in 43 topics; ${numerical} new verified numeric, ${conceptual} conceptual; topic/unit/difficulty/answer filters and adaptive selection checks.`);
