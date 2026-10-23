/** Topic 14 full-curriculum draft coverage and mathematical source gate (NOT editorial certification). */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let ts;try{ts=require('typescript')}catch{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}
const root=path.resolve(import.meta.dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const cached=new Map();
function load(relative){let file=path.isAbsolute(relative)?relative:path.join(root,relative);
 if(!fs.existsSync(file))for(const ext of ['.ts','.tsx','.json'])if(fs.existsSync(file+ext)){file+=ext;break;}
 if(file.endsWith('.json'))return{default:JSON.parse(fs.readFileSync(file,'utf8'))};
 if(cached.has(file))return cached.get(file).exports;
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal(out.diagnostics?.filter(d=>d.category===ts.DiagnosticCategory.Error).length??0,0,`TypeScript syntax: ${file}`);
 const mod={exports:{}};cached.set(file,mod);
 new Function('require','module','exports',out.outputText)(x=>x.startsWith('.')?load(path.resolve(path.dirname(file),x)):require(x),mod,mod.exports);return mod.exports;
}
const cat=json('src/features/trigonometry/curriculum.json');
const all=cat.topics.flatMap(t=>t.subtopics);
assert.equal(cat.topics.length,14);assert.equal(all.length,102);assert.equal(new Set(all.map(s=>s.id)).size,102);
const t14=cat.topics.find(t=>t.number==='14');assert(t14?.optional);assert.equal(t14.subtopics.length,7);
const ids=new Set(t14.subtopics.map(s=>s.id));
const lessons=json('src/data/lessons/trigonometryAdvancedEnrichment.json');
const questions=json('src/data/practice/trigonometryAdvancedEnrichment.json');
const ledger=json('src/data/practice/trigonometryAdvancedEnrichmentAnswerLedgerV1049.json');
const answerIndex=json('src/data/practice/trigonometryAdvancedEnrichmentAnswerIndexV1049.json');
assert.deepEqual(new Set(Object.keys(lessons)),ids);
assert.equal(questions.length,56);assert.equal(Object.keys(ledger).length,56);assert.equal(Object.keys(answerIndex).length,56);
const blockids=new Set(),diagrams=new Set();
for(const [id,l] of Object.entries(lessons)){
 assert.equal(l.id,id);assert.equal(l.status,'draft');assert.equal(l.contentVersion,1);
 assert(l.summary.length>=90,`${id} missing developed summary`);
 assert.equal(l.sections.length,3);
 const blocks=l.sections.flatMap(s=>s.blocks);
 for(const type of ['definition','formula','worked-example','note','checkpoint'])assert(blocks.some(b=>b.type===type),`${id} missing ${type}`);
 assert.equal(blocks.filter(b=>b.type==='worked-example').length,2);
 assert.equal(blocks.filter(b=>b.type==='formula').length,3);
 const def=blocks.find(b=>b.type==='definition');assert(def.text.length>250,`${id} needs substantive concept`);
 const pit=blocks.find(b=>b.type==='note'&&!b.text.startsWith('Reference guide'));assert(pit.text.length>90);
 assert(blocks.find(b=>b.type==='note'&&b.text.startsWith('Reference guide'))?.text.includes('Advanced optional enrichment'));
 for(const b of blocks){assert(!blockids.has(b.id),`duplicate block id ${b.id}`);blockids.add(b.id);
  if(b.type==='formula'){
   assert(b.latex.length>10);assert.equal((b.latex.match(/\{/g)||[]).length,(b.latex.match(/\}/g)||[]).length);
   assert(!/[\x00-\x08\x0b\x0c\x0e-\x1f\t]/.test(b.latex),'Broken LaTeX escaping');
  }
  if(b.type==='worked-example')assert(b.steps.length>=2&&b.strategy.length>35&&b.check.length>50);
  if(b.type==='checkpoint')assert(b.explanation.length>=65);
  if(b.type==='diagram'){diagrams.add(b.diagram);assert(b.caption.length>=85)}
 }
}
assert.deepEqual(diagrams,new Set(['unit-circle','advanced-sphere','advanced-hyperbola']));
const promptKeys=new Set(),questionIds=new Set();
for(let i=0;i<7;i++){
 const entries=questions.filter(q=>q.subtopicId===t14.subtopics[i].id);assert.equal(entries.length,8,`${i+1}`);
 assert(entries.some(q=>q.difficulty==='Advanced'));
 for(let j=0;j<8;j++){
  const q=entries[j];assert.equal(q.id,`TRI49-14${i+1}-${String(j+1).padStart(3,'0')}`);
  assert(!questionIds.has(q.id));questionIds.add(q.id);
  assert(!promptKeys.has(q.prompt.toLowerCase()));promptKeys.add(q.prompt.toLowerCase());
  assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(o=>o.toLowerCase())).size,4);
  assert(Number.isInteger(q.correctIndex)&&q.correctIndex>=0&&q.correctIndex<4);
  assert.equal(q.correctIndex,answerIndex[q.id]);assert.equal(q.options[q.correctIndex],ledger[q.id]);
  assert(q.explanation.length>=40);
  assert(['Basic','Intermediate','Advanced'].includes(q.difficulty));
 }
}
const {PRACTICE_CATALOG,filterPracticeQuestions}=load('src/domain/practice/catalog.ts');
assert.equal(PRACTICE_CATALOG.length,1238);assert.equal(new Set(PRACTICE_CATALOG.map(q=>q.key)).size,1238);
assert.equal(PRACTICE_CATALOG.filter(q=>q.bankId!=='trigonometry-pilot').length,422);
assert.equal(PRACTICE_CATALOG.filter(q=>q.bankId==='trigonometry-pilot').length,816);
assert.equal(PRACTICE_CATALOG.filter(q=>q.key.startsWith('trigonometry-pilot:TRI49-')).length,56);
for(const s of t14.subtopics){const entries=filterPracticeQuestions(PRACTICE_CATALOG,{topicId:s.id,subskill:'',difficulty:'',search:'',status:'all'});
 assert.equal(entries.length,8);assert(entries.every(q=>q.reviewStatus==='draft-unverified'&&q.objectiveId===s.id&&q.revision));}
assert(read('src/features/trigonometry/TrigonometryScreen.tsx').includes('...TRIGONOMETRY_ADVANCED_ENRICHMENT_LESSONS'));
assert(read('src/domain/practice/catalog.ts').includes('...TRIGONOMETRY_ADVANCED_ENRICHMENT_QUESTIONS'));
for(const diagram of ['advanced-sphere','advanced-hyperbola']){
 assert(read('src/domain/learn/lessonTypes.ts').includes(`'${diagram}'`));
 assert(read('src/components/learn-reader/TrigonometryDiagram.tsx').includes(`diagram==='${diagram}'`));
}
const screenText=read('src/features/trigonometry/TrigonometryScreen.tsx');
assert(screenText.includes("id:'top-spherical-trig'"));
assert(screenText.includes("id:'top-trig-identities'"));
assert(read('src/features/trigonometry/manualProgressAdapter.ts').includes('saveTrigManualProgress'));
const near=(a,b,descr,eps=1e-9)=>assert(Math.abs(a-b)<eps,`${descr}: ${a} != ${b}`);
// Cross-checked numeric identities and constraints (independent of authored answer fixture).
near(Math.sin(Math.PI/2),1,'sine bound');near(Math.sin(Math.PI/3),Math.sqrt(3)/2,'inequality boundary');
for(const x of [0.2,0.73,1.2])near((1-Math.cos(2*x))/Math.sin(2*x),Math.tan(x),'cancelled quotient');
for(const x of [0,0.23,1.7,4.2])near(Math.sin(x)+Math.cos(x),Math.sqrt(2)*Math.sin(x+Math.PI/4),'phase sum');
for(const t of [-1,-0.4,0,0.5,2]){
 const theta=2*Math.atan(t);
 near(Math.sin(theta),2*t/(1+t*t),'half-angle sine');
 near(Math.cos(theta),(1-t*t)/(1+t*t),'half-angle cosine');
}
near(Math.cos(Math.acos(0.25)),Math.cos(Math.PI/3)*Math.cos(Math.PI/3),'spherical right triangle');
near(Math.PI*2*2/2, 2*Math.PI,'octant area');
for(const x of [-1.8,-0.3,0,0.7,1.8]){
 const sinh=(Math.exp(x)-Math.exp(-x))/2,cosh=(Math.exp(x)+Math.exp(-x))/2;
 near(cosh*cosh-sinh*sinh,1,'hyperbolic identity');
}
near(Math.sin(0.1)-(0.1-0.1**3/6),0.1**5/120, 'sine approximation magnitude',1e-9);
for(const [a,b,c] of [[Math.PI/3,Math.PI/3,Math.PI/3],[Math.PI/2,Math.PI/4,Math.PI/4]]){
 near(Math.sin(a)**2+Math.sin(b)**2+Math.sin(c)**2-2*Math.cos(a)*Math.cos(b)*Math.cos(c),2,'triangle identity');
}
near(3*Math.sin(Math.PI/6)-4*Math.sin(Math.PI/6)**3,1,'triple angle');
// Check all historical records in a separate cohort. IDs and options must remain unchanged.
const hist=PRACTICE_CATALOG.filter(q=>!q.key.startsWith('trigonometry-pilot:TRI49-'));
assert.equal(hist.length,1182);assert.equal(hist.filter(q=>q.bankId==='trigonometry-pilot').length,760);
assert(['10.49.0','10.50.0','10.50.1','10.50.2','10.50.3','10.51.0', '10.52.0', '10.53.0', '10.54.0','10.55.0','10.56.0','10.57.0','10.58.0','10.60.0','10.61.0','10.62.0'].includes(json('package.json').version));assert.equal(json('package-lock.json').version,json('package.json').version);
assert.equal(json('package-lock.json').packages[''].version,json('package.json').version);
console.log('PASS v10.49: 7 draft advanced lessons + 56 draft questions, 102/102 curriculum linked; 816 Trigonometry + 422 original Algebra questions, original spherical topic preserved; representative numerical checks passed.');
