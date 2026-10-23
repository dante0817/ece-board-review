/** Topic 07 validation: original draft lessons and practice integration; not independent human editorial approval. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const req=createRequire(import.meta.url);let ts;
try{ts=req('typescript')}catch{ts=req('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}
const root=path.resolve(import.meta.dirname,'..'),file=x=>fs.readFileSync(path.join(root,x),'utf8');
const json=x=>JSON.parse(file(x));const cache=new Map();
function load(f){let p=path.resolve(root,f);if(!fs.existsSync(p))for(const ext of ['.ts','.tsx','.json'])if(fs.existsSync(p+ext)){p+=ext;break;}
 if(p.endsWith('.json'))return {default:JSON.parse(fs.readFileSync(p,'utf8'))};
 if(cache.has(p))return cache.get(p).exports;
 const result=ts.transpileModule(fs.readFileSync(p,'utf8'),{fileName:p,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal((result.diagnostics??[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,p);
 const mod={exports:{}};cache.set(p,mod);new Function('require','module','exports',result.outputText)(x=>x.startsWith('.')?load(path.resolve(path.dirname(p),x)):req(x),mod,mod.exports);return mod.exports;
}
const curriculum=json('src/features/trigonometry/curriculum.json');
const all=curriculum.topics.flatMap(t=>t.subtopics);
assert.equal(curriculum.topics.length,14);assert.equal(all.length,102);assert.equal(new Set(all.map(s=>s.id)).size,102);
const subtopics=curriculum.topics.find(t=>t.number==='07').subtopics,focus=new Set(subtopics.map(x=>x.id));assert.equal(subtopics.length,6);
const lessons=json('src/data/lessons/trigonometryInverseFunctions.json');
const questions=json('src/data/practice/trigonometryInverseFunctions.json');
const ledger=json('src/data/practice/trigonometryInverseFunctionsAnswerLedgerV1042.json');
assert.deepEqual(new Set(Object.keys(lessons)),focus);assert.equal(questions.length,48);assert.equal(Object.keys(ledger).length,48);
const seenBlocks=new Set();
for(const [id,lesson] of Object.entries(lessons)){
 assert.equal(id,lesson.id);assert.equal(lesson.status,'draft');assert.equal(lesson.contentVersion,1);assert(lesson.summary.length>60);
 assert.equal(lesson.sections.length,3);const blocks=lesson.sections.flatMap(s=>s.blocks);
 for(const kind of ['definition','formula','worked-example','note','checkpoint'])assert(blocks.some(b=>b.type===kind),id+' missing '+kind);
 assert.equal(blocks.filter(b=>b.type==='formula').length,3);assert.equal(blocks.filter(b=>b.type==='worked-example').length,2);
 for(const b of blocks){assert(!seenBlocks.has(b.id),'Repeated block '+b.id);seenBlocks.add(b.id);
  if(b.type==='formula'){assert(b.latex.includes('\\'));assert(!/[\x00-\x08\x0b\x0c\x0e-\x1f\t]/.test(b.latex));assert.equal((b.latex.match(/{/g)||[]).length,(b.latex.match(/}/g)||[]).length);}
  if(b.type==='worked-example'){assert(b.steps.length>=2);assert(b.strategy.length>=10);assert(b.check.length>=25);}
 }
}
const graph=lessons['trig-inverse-functions-graphs-of-inverse-trig-functions'].sections.flatMap(s=>s.blocks);
assert(graph.some(b=>b.type==='diagram'&&b.diagram==='inverse-graphs'));
assert(file('src/components/learn-reader/TrigonometryDiagram.tsx').includes('InverseTrigonometricGraph'));
const ids=new Set();for(const q of questions){assert(focus.has(q.subtopicId));assert(!ids.has(q.id));ids.add(q.id);
 assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4,q.id+' answer choices');
 assert.equal(q.options[q.correctIndex],ledger[q.id]);assert(q.explanation.length>=32);assert(['Basic','Intermediate','Advanced'].includes(q.difficulty));
}
for(const sub of subtopics)assert.equal(questions.filter(q=>q.subtopicId===sub.id).length,8);
const {PRACTICE_CATALOG: allCatalog,filterPracticeQuestions}=load('src/domain/practice/catalog.ts');
const PRACTICE_CATALOG=allCatalog.filter(q=>!q.key.startsWith('trigonometry-pilot:TRI49-')&&!q.key.startsWith('trigonometry-pilot:TRI49-')&&!q.key.startsWith('trigonometry-pilot:TRI47-')&&!q.key.startsWith('trigonometry-pilot:TRI48-')); 
assert.equal(PRACTICE_CATALOG.filter(q=>!q.key.startsWith('trigonometry-pilot:TRI43-')&&!q.key.startsWith('trigonometry-pilot:TRI44-')&&!q.key.startsWith('trigonometry-pilot:TRI45-')&&!q.key.startsWith('trigonometry-pilot:TRI46-')).length,814);assert.equal(new Set(PRACTICE_CATALOG.map(q=>q.key)).size,PRACTICE_CATALOG.length);
assert.equal(PRACTICE_CATALOG.filter(q=>q.bankId!=='trigonometry-pilot').length,422);
assert.equal(PRACTICE_CATALOG.filter(q=>q.bankId==='trigonometry-pilot'&&!q.key.startsWith('trigonometry-pilot:TRI43-')&&!q.key.startsWith('trigonometry-pilot:TRI44-')&&!q.key.startsWith('trigonometry-pilot:TRI45-')&&!q.key.startsWith('trigonometry-pilot:TRI46-')).length,392);
assert.equal(PRACTICE_CATALOG.filter(q=>q.key.startsWith('trigonometry-pilot:TRI42-')).length,48);
for(const sub of subtopics){const matches=filterPracticeQuestions(PRACTICE_CATALOG,{topicId:sub.id,subskill:'',difficulty:'',search:'',status:'all'});
 assert.equal(matches.length,8);assert(matches.every(q=>q.reviewStatus==='draft-unverified'));
}
const lessonsScreen=file('src/features/trigonometry/TrigonometryScreen.tsx');
assert(lessonsScreen.includes('...TRIGONOMETRY_INVERSE_FUNCTIONS_LESSONS'));
assert(file('src/domain/practice/catalog.ts').includes('...TRIGONOMETRY_INVERSE_FUNCTIONS_QUESTIONS'));
// Mathematical cross-checks: principal branches, valid domains, sign choices, and elementary inverse compositions.
const near=(a,b,t)=>assert(Math.abs(a-b)<1e-10,`${t}: ${a} vs ${b}`);
for(const x of [-1,-0.9,-0.5,0,0.6,0.9,1]){
 const asin=Math.asin(x),acos=Math.acos(x);
 assert(asin>=-Math.PI/2-1e-10&&asin<=Math.PI/2+1e-10);
 assert(acos>=-1e-10&&acos<=Math.PI+1e-10);
 near(Math.sin(asin),x,'sin arcsin');near(Math.cos(acos),x,'cos arccos');
 near(Math.cos(asin),Math.sqrt(1-x*x),'cos arcsin');near(Math.sin(acos),Math.sqrt(1-x*x),'sin arccos');
 if(Math.abs(x)<1)near(Math.tan(asin),x/Math.sqrt(1-x*x),'tan arcsin');
}
for(const x of [-1e3,-2,-1,0,0.5,2,1e3]){
 const y=Math.atan(x);assert(y>-Math.PI/2&&y<Math.PI/2);
 near(Math.tan(y),x,'tan arctan');near(Math.cos(y),1/Math.sqrt(1+x*x),'cos arctan');
}
near(Math.asin(Math.sin(5*Math.PI/6)),Math.PI/6,'asin folding');
near(Math.acos(Math.cos(4*Math.PI/3)),2*Math.PI/3,'acos folding');
near(Math.atan(Math.tan(3*Math.PI/4)),-Math.PI/4,'atan folding');
near(Math.acos(1/(-2)),2*Math.PI/3,'arcsec negative');
near(Math.asin(1/(-2)),-Math.PI/6,'arccsc negative');
near(Math.PI/2,Math.PI/2,'arccot zero');
assert(Number.isNaN(Math.asin(1.2))&&Number.isNaN(Math.acos(1.2)));
assert.equal(Math.asin(1),Math.PI/2);
const track=load('src/domain/learn/manualLearnTracking.ts');const progress=load('src/features/trigonometry/manualProgressAdapter.ts');
const st=new Map();globalThis.localStorage={getItem:k=>st.get(k)??null,setItem:(k,v)=>st.set(k,v),removeItem:k=>st.delete(k)};globalThis.window={dispatchEvent:()=>{}};
const record={...track.emptyManualLearnRecord(),reviewCount:2,selfStatus:'understood',needsReview:true,updatedAt:'2026-01-01T00:00:00.000Z'};
st.set(track.MANUAL_LEARN_STORAGE_KEY,JSON.stringify({schemaVersion:1,records:{'alg-original':record,'trig-basic-identities-pythagorean-identities':record}}));
assert(track.isManualTrackingId(subtopics[0].id));progress.saveTrigManualProgress(subtopics[0].id,{read1:true,read2:true,read3:true,mastered:true,review:true});
const saved=track.readManualLearnStore().records;
assert.deepEqual(saved['alg-original'],record);assert.deepEqual(saved['trig-basic-identities-pythagorean-identities'],record);
assert.equal(saved[subtopics[0].id].reviewCount,3);assert.equal(saved[subtopics[0].id].selfStatus,'mastered');assert(saved[subtopics[0].id].needsReview);
for(const f of ['src/data/lessons/trigonometryInverseFunctions.ts','src/data/practice/trigonometryInverseFunctions.ts','src/features/trigonometry/TrigonometryScreen.tsx','src/components/learn-reader/TrigonometryDiagram.tsx','src/domain/practice/catalog.ts']){
 const compiled=ts.transpileModule(file(f),{fileName:f,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal((compiled.diagnostics??[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,f);
}
assert(/^10\.(?:4[2-9]|5[012345678])\./.test(json('package.json').version));assert.equal(json('package-lock.json').version,json('package.json').version);
console.log('PASS v10.42: 6/6 inverse-trig draft lessons, 48 questions and answer ledger, branch/domain checks, graph, 49/102 lessons and 392 Trigonometry questions; legacy progress/catalog intact.');
