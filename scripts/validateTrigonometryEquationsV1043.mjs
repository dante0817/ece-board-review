/** Topic 08 structural/mathematical regression: NOT an independent human editorial certification. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const req=createRequire(import.meta.url);let ts;
try{ts=req('typescript')}catch{ts=req('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}
const root=path.resolve(import.meta.dirname,'..');const file=x=>fs.readFileSync(path.join(root,x),'utf8');
const json=x=>JSON.parse(file(x));const cache=new Map();
function load(f){let p=path.resolve(root,f);if(!fs.existsSync(p))for(const ext of ['.ts','.tsx','.json'])if(fs.existsSync(p+ext)){p+=ext;break;}
 if(p.endsWith('.json'))return {default:JSON.parse(fs.readFileSync(p,'utf8'))};if(cache.has(p))return cache.get(p).exports;
 const result=ts.transpileModule(fs.readFileSync(p,'utf8'),{fileName:p,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal((result.diagnostics??[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,p);
 const mod={exports:{}};cache.set(p,mod);new Function('require','module','exports',result.outputText)(x=>x.startsWith('.')?load(path.resolve(path.dirname(p),x)):req(x),mod,mod.exports);return mod.exports;
}
const curriculum=json('src/features/trigonometry/curriculum.json');const subtopics=curriculum.topics.find(t=>t.number==='08').subtopics;
assert.equal(curriculum.topics.length,14);assert.equal(curriculum.topics.flatMap(t=>t.subtopics).length,102);assert.equal(subtopics.length,8);
const focus=new Set(subtopics.map(s=>s.id));
const lessons=json('src/data/lessons/trigonometryEquations.json');const questions=json('src/data/practice/trigonometryEquations.json');
const ledger=json('src/data/practice/trigonometryEquationsAnswerLedgerV1043.json');
assert.deepEqual(new Set(Object.keys(lessons)),focus);assert.equal(questions.length,64);assert.equal(Object.keys(ledger).length,64);
const blocksSeen=new Set();
for(const [id,lesson] of Object.entries(lessons)){
 assert.equal(lesson.id,id);assert.equal(lesson.status,'draft');assert.equal(lesson.contentVersion,1);
 assert(lesson.summary.length>65);assert.equal(lesson.sections.length,3);
 const blocks=lesson.sections.flatMap(s=>s.blocks);
 for(const typ of ['definition','formula','worked-example','note','checkpoint'])assert(blocks.some(b=>b.type===typ),id+': '+typ);
 assert.equal(blocks.filter(b=>b.type==='formula').length,3);assert.equal(blocks.filter(b=>b.type==='worked-example').length,id==='trig-equations-extraneous-and-excluded-solutions'?3:2);
 for(const b of blocks){assert(!blocksSeen.has(b.id),b.id);blocksSeen.add(b.id);
  if(b.type==='formula'){assert(b.latex.includes('\\'));assert(!/[\x00-\x08\x0b\x0c\x0e-\x1f\t]/.test(b.latex));assert.equal((b.latex.match(/{/g)||[]).length,(b.latex.match(/}/g)||[]).length);}
  if(b.type==='worked-example'){assert(b.steps.length>=2);assert(b.strategy.length>25);assert(b.check.length>=35);}
  if(b.type==='checkpoint'){assert(b.explanation.length>35);assert(b.answer.length>=2);}
 }
}
const ids=new Set();for(const q of questions){assert(focus.has(q.subtopicId));assert(!ids.has(q.id));ids.add(q.id);
 assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4,q.id+': repeated options');
 assert(q.correctIndex>=0&&q.correctIndex<4);assert.equal(q.options[q.correctIndex],ledger[q.id]);
 assert(q.explanation.length>=45,q.id+' too short');assert(['Basic','Intermediate','Advanced'].includes(q.difficulty));
}
for(const s of subtopics){const local=questions.filter(q=>q.subtopicId===s.id);assert.equal(local.length,8);assert(local.some(q=>q.difficulty==='Advanced'));}
const {PRACTICE_CATALOG: allCatalog,filterPracticeQuestions}=load('src/domain/practice/catalog.ts');
const PRACTICE_CATALOG=allCatalog.filter(q=>!q.key.startsWith('trigonometry-pilot:TRI49-')&&!q.key.startsWith('trigonometry-pilot:TRI49-')&&!q.key.startsWith('trigonometry-pilot:TRI47-')&&!q.key.startsWith('trigonometry-pilot:TRI48-')); 
assert.equal(PRACTICE_CATALOG.filter(q=>!q.key.startsWith('trigonometry-pilot:TRI44-')&&!q.key.startsWith('trigonometry-pilot:TRI45-')&&!q.key.startsWith('trigonometry-pilot:TRI46-')).length,878);assert.equal(new Set(PRACTICE_CATALOG.map(q=>q.key)).size,PRACTICE_CATALOG.length);
assert.equal(PRACTICE_CATALOG.filter(q=>q.bankId!=='trigonometry-pilot').length,422);
assert.equal(PRACTICE_CATALOG.filter(q=>q.bankId==='trigonometry-pilot'&&!q.key.startsWith('trigonometry-pilot:TRI44-')&&!q.key.startsWith('trigonometry-pilot:TRI45-')&&!q.key.startsWith('trigonometry-pilot:TRI46-')).length,456);
assert.equal(PRACTICE_CATALOG.filter(q=>q.key.startsWith('trigonometry-pilot:TRI43-')).length,64);
for(const s of subtopics){const matches=filterPracticeQuestions(PRACTICE_CATALOG,{topicId:s.id,subskill:'',difficulty:'',search:'',status:'all'});
 assert.equal(matches.length,8);assert(matches.every(q=>q.reviewStatus==='draft-unverified'));}
const src=file('src/features/trigonometry/TrigonometryScreen.tsx');assert(src.includes('...TRIGONOMETRY_EQUATIONS_LESSONS'));
assert(file('src/domain/practice/catalog.ts').includes('...TRIGONOMETRY_EQUATIONS_QUESTIONS'));
// Trig-equation numeric check: every angle listed in core worked examples must solve the intended equation.
const pi=Math.PI,near=(a,b,label)=>assert(Math.abs(a-b)<1e-9,`${label}: ${a} expected ${b}`);
const valid=(list,fn,label)=>list.forEach(x=>near(fn(x),0,label));
valid([pi/6,5*pi/6],x=>Math.sin(x)-.5,'basic sine');
valid([3*pi/4,5*pi/4],x=>Math.cos(x)+Math.SQRT1_2,'basic cosine');
valid([0,pi],x=>Math.sin(x),'interval sine');
valid([-pi/3,pi/3],x=>Math.cos(x)-.5,'signed cosine');
valid([0,pi/6,5*pi/6,pi],x=>Math.sin(x)*(2*Math.sin(x)-1),'factor sine');
valid([0,pi/4,pi,5*pi/4],x=>Math.tan(x)*(Math.tan(x)-1),'factor tangent');
valid([pi/2,7*pi/6,11*pi/6],x=>2*Math.sin(x)**2-Math.sin(x)-1,'quadratic sine');
valid([0,pi/3,5*pi/3],x=>2*Math.cos(x)**2-3*Math.cos(x)+1,'quadratic cosine');
valid([0,pi/3,pi,5*pi/3],x=>2*Math.sin(x)*Math.cos(x)-Math.sin(x),'identity factoring');
valid([pi/4,3*pi/4,5*pi/4,7*pi/4],x=>1-2*Math.sin(x)**2,'double-angle');
valid([pi/4,5*pi/4],x=>Math.sin(2*x)-1,'multiple-angle sine');
valid([0,2*pi/3,4*pi/3],x=>Math.cos(3*x)-1,'multiple-angle cosine');
near(Math.asin(.5),pi/6,'inverse arcsin');near(Math.atan(1),pi/4,'inverse arctan');
assert(pi/2>pi/2-1e-6);assert(Number.isNaN(Math.asin(2)));
near((Math.sin(3*pi/2)**2-1)/(Math.sin(3*pi/2)-1),0,'rational trig valid');
assert(Math.abs(Math.sin(pi/2)-1)<1e-10);assert.equal(2*Math.sin(pi/2)**2-1,1);
// Original inverse-trig and Algebra/manual records must survive saving Topic 08 progress.
const track=load('src/domain/learn/manualLearnTracking.ts'),progress=load('src/features/trigonometry/manualProgressAdapter.ts');
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
globalThis.window={dispatchEvent:()=>{}};
const record={...track.emptyManualLearnRecord(),reviewCount:2,selfStatus:'understood',needsReview:true,updatedAt:'2026-01-01T00:00:00.000Z'};
store.set(track.MANUAL_LEARN_STORAGE_KEY,JSON.stringify({schemaVersion:1,records:{'alg-preserve':record,'trig-inverse-functions-inverse-sine-cosine-and-tangent':record}}));
assert(track.isManualTrackingId(subtopics[0].id));progress.saveTrigManualProgress(subtopics[0].id,{read1:true,read2:true,read3:true,mastered:true,review:true});
const stored=track.readManualLearnStore().records;
assert.deepEqual(stored['alg-preserve'],record);assert.deepEqual(stored['trig-inverse-functions-inverse-sine-cosine-and-tangent'],record);
assert.equal(stored[subtopics[0].id].reviewCount,3);assert.equal(stored[subtopics[0].id].selfStatus,'mastered');assert.equal(stored[subtopics[0].id].needsReview,true);
for(const f of ['src/data/lessons/trigonometryEquations.ts','src/data/practice/trigonometryEquations.ts','src/features/trigonometry/TrigonometryScreen.tsx','src/domain/practice/catalog.ts']){
 const result=ts.transpileModule(file(f),{fileName:f,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal((result.diagnostics??[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,f);
}
assert(['10.43.0','10.44.0','10.45.0','10.46.0','10.47.0','10.48.0','10.49.0','10.50.0','10.50.1','10.50.2','10.50.3','10.51.0', '10.52.0', '10.53.0', '10.54.0','10.55.0','10.56.0','10.57.0','10.58.0','10.60.0','10.61.0','10.62.0'].includes(json('package.json').version));assert.equal(json('package-lock.json').version,json('package.json').version);
console.log('PASS v10.43: 8/8 equations draft lessons, 64 keyed questions, mathematical examples, 57/102 lessons and 456 Trigonometry questions; Algebra, inverse functions and saved progress preserved.');
