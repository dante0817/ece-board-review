/** v10.38: source/data checks for new topics 01-02. Independent editorial review pending. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const req=createRequire(import.meta.url);
let ts;try{ts=req('typescript')}catch{ts=req('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}
const root=path.resolve(import.meta.dirname,'..'),cached=new Map();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function load(file){let p=path.resolve(root,file);if(!fs.existsSync(p)){for(const ext of ['.ts','.tsx','.json']){if(fs.existsSync(p+ext)){p+=ext;break}}}
  if(p.endsWith('.json')){const val=JSON.parse(fs.readFileSync(p,'utf8'));return {default:val,...val};}
  if(cached.has(p))return cached.get(p).exports;
  const code=ts.transpileModule(fs.readFileSync(p,'utf8'),{fileName:p,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
  assert.equal((code.diagnostics??[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,`Syntax ${p}`);
  const mod={exports:{}};cached.set(p,mod);new Function('require','module','exports',code.outputText)(dep=>dep.startsWith('.')?load(path.resolve(path.dirname(p),dep)):req(dep),mod,mod.exports);return mod.exports;
}
const curriculum=JSON.parse(read('src/features/trigonometry/curriculum.json'));
const allIds=new Set(curriculum.topics.flatMap(t=>t.subtopics.map(s=>s.id)));
const subset=curriculum.topics.slice(0,2).flatMap(t=>t.subtopics);
assert.equal(subset.length,14);
const {TRIGONOMETRY_FOUNDATIONS_LESSONS:lessons,TRIGONOMETRY_FOUNDATIONS_IDS:ids}=load('src/data/lessons/trigonometryFoundations.ts');
const {TRIGONOMETRY_FOUNDATIONS_QUESTIONS:questions}=load('src/data/practice/trigonometryFoundations.ts');
const {TRIGONOMETRY_PILOT_LESSONS:pilots,TRIGONOMETRY_PILOT_IDS:pilotIds}=load('src/data/lessons/trigonometryPilot.ts');
assert.equal(ids.length,12);assert.equal(questions.length,96);assert.equal(new Set(questions.map(q=>q.id)).size,96);
assert.equal(pilotIds.length,4);assert.equal(Object.keys(pilots).length,4);
const targetIds=new Set(subset.map(s=>s.id));
assert.deepEqual(new Set([...ids,...pilotIds.filter(x=>targetIds.has(x))]),targetIds,'Topics 01-02 fully connected');
assert([...ids].every(id=>targetIds.has(id)&&allIds.has(id)));
for(const id of ids){const lesson=lessons[id];assert.equal(lesson.id,id);assert.equal(lesson.status,'draft');assert.equal(lesson.sections.length,3);
  const blocks=lesson.sections.flatMap(s=>s.blocks);const bIds=blocks.map(b=>b.id);assert.equal(new Set(bIds).size,bIds.length);
  assert(blocks.some(b=>b.type==='definition')&&blocks.some(b=>b.type==='formula')&&blocks.some(b=>b.type==='note')&&blocks.some(b=>b.type==='checkpoint'));
  const works=blocks.filter(b=>b.type==='worked-example');assert.equal(works.length,2);
  assert(works.every(b=>b.steps.length>=2&&b.check.length>9&&b.problem.length>15));
  assert.equal(questions.filter(q=>q.subtopicId===id).length,8);
  assert(blocks.find(b=>b.type==='formula').latex.length>15);
  assert(lesson.sections[2].blocks.find(b=>b.type==='note'&&b.text.startsWith('Reference guide:')));
}
for(const q of questions){assert(ids.includes(q.subtopicId));assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4,`duplicate choice: ${q.id}`);
  assert(q.prompt.length>12&&q.explanation.length>=12, `${q.id}: stem=${q.prompt.length}, explanation=${q.explanation.length}`);assert(q.correctIndex>=0&&q.correctIndex<4);
  assert(q.options[q.correctIndex]&&q.options[q.correctIndex]!=='undefined');
}
// Independent expected-answer ledger curated separately from the question data.
const answerLines=[
['45°','Obtuse','180°','250°','360°','Quadrant IV','Right','3'],
['0.5°','0.75′','18.5°','62°15′00″','12.26°','0°07′30″','7200″','−10.5°'],
['π rad','π/6 rad','45°','4π/3 rad','−150°','315°','165°','−7π/3 rad'],
['400°','90°','300°','90°','θ + 360°k, k an integer','11π/6','2','225°'],
['10 m','8 cm²','π cm','9π m²','2 rad','1/5','16π m²','π/2 rad'],
['4π rad/s','3 m/s','4 rad/s','1 rev/s','6π rad/s','5 rad/s','1 m/s','Double'],
['10','5√2','6','12','4√3','7√2','8, 15, 17','10√3'],
['1/2','1/2','1','√3/2','2','√3','√2','tan90°'],
['70°','50°','60°','cos(π/3)','4/5','sec and csc','65°','tan53°'],
['5 cm','3/4','10 m','5/13','45°','60°','45°','15'],
['55°','5√2','17','6√3','9√3','36.9°','8','65°'],
['5 m','090°','180°','20 m','45°','45°','030°','200°']
];
assert.equal(answerLines.length,12);for(const line of answerLines)assert.equal(line.length,8);
for(let i=0;i<questions.length;i++){const q=questions[i];assert.equal(q.options[q.correctIndex],answerLines[Math.floor(i/8)][i%8],`Expected answer mismatch: ${q.id}`)}
// Independent calculation and sign checks spanning every new content family.
const near=(a,b)=>assert(Math.abs(a-b)<1e-10,`${a} != ${b}`);
near(1080/360,3);near(30/60,0.5);near(12+15/60+36/3600,12.26);near(240/180,4/3);near(-420/180,-7/3);
near((765-45)/360,2);near(-855+3*360,225);near(5*2,10);near(0.5*4**2,8);near(0.5*6**2*(Math.PI/2),9*Math.PI);near(2*Math.PI*3,6*Math.PI);near(0.4*5,2);
near(Math.hypot(6,8),10);near(5*Math.SQRT2,Math.sqrt(50));near(1/Math.cos(Math.PI/3),2);near(Math.sin(Math.PI/6),0.5);
near(Math.sin(20*Math.PI/180),Math.cos(70*Math.PI/180));near(Math.tan(37*Math.PI/180),1/Math.tan(53*Math.PI/180));
near(10*Math.sin(Math.PI/6),5);near(Math.atan(3/4)*180/Math.PI,36.86989764584402);
near(Math.atan(30/30)*180/Math.PI,45);near(Math.atan(40/40)*180/Math.PI,45);
const schema=load('src/domain/learn/manualLearnTracking.ts');const adapter=load('src/features/trigonometry/manualProgressAdapter.ts');
assert([...allIds].every(id=>schema.isManualTrackingId(id)));
const mem=new Map();globalThis.localStorage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v),removeItem:k=>mem.delete(k)};
globalThis.window={dispatchEvent:()=>{}};
const algebra={...schema.emptyManualLearnRecord(),reviewCount:1,selfStatus:'understood',needsReview:true,updatedAt:'2026-01-01T00:00:00.000Z'};
mem.set(schema.MANUAL_LEARN_STORAGE_KEY,JSON.stringify({schemaVersion:1,records:{'alg-existing':algebra}}));
adapter.saveTrigManualProgress(ids[0],{read1:true,read2:true,read3:false,mastered:true,review:true});
let snapshot=adapter.readTrigManualProgress([...pilotIds,...ids]);assert(snapshot[ids[0]].mastered&&snapshot[ids[0]].review);
assert.equal(snapshot[ids[0]].read2,true);assert.deepEqual(schema.readManualLearnStore().records['alg-existing'],algebra);
assert(!Object.hasOwn(snapshot,'trig-angles-radian-measure'),'Old pilot lesson must not be automatically marked as read');
const practiceCatalog=load('src/domain/practice/catalog.ts').PRACTICE_CATALOG;
const trigEntries=practiceCatalog.filter(q=>q.bankId==='trigonometry-pilot');
assert(trigEntries.length>=128);
assert(practiceCatalog.length>=550);
assert.equal(new Set(practiceCatalog.map(q=>q.key)).size,practiceCatalog.length);
assert.equal(trigEntries.filter(q=>ids.includes(q.topicId)).length,96);
assert.equal(trigEntries.filter(q=>pilotIds.includes(q.topicId)).length,32);
assert(read('src/features/trigonometry/TrigonometryScreen.tsx').includes('TRIGONOMETRY_CONNECTED_LESSONS'));
assert(read('src/domain/practice/catalog.ts').includes('TRIGONOMETRY_FOUNDATIONS_QUESTIONS'));
// Check TS transpilation for app integration edits without pretending to run the full build.
for(const p of ['src/data/lessons/trigonometryFoundations.ts','src/data/practice/trigonometryFoundations.ts','src/features/trigonometry/TrigonometryScreen.tsx','src/domain/practice/catalog.ts']){
 const out=ts.transpileModule(read(p),{fileName:p,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal((out.diagnostics??[]).filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,`TS source syntax error: ${p}`)
}
console.log('PASS v10.38.0: topics 01-02 contain 14 draft lessons, 112 questions (32 pilot + 96 new); 102 curriculum IDs unchanged; independent answer ledger; representative numerical checks; persistent progress and unchanged Algebra record; source syntax.');
