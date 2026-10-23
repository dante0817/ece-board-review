/** v10.48 Topic 13 source, math and progress regression gate (not an expert editorial certificate). */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let ts;try{ts=require('typescript')}catch{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}
const root=path.resolve(import.meta.dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const cache=new Map();
function load(relative){let file=path.isAbsolute(relative)?relative:path.join(root,relative);
 if(!fs.existsSync(file))for(const ext of ['.ts','.tsx','.json'])if(fs.existsSync(file+ext)){file+=ext;break;}
 if(file.endsWith('.json'))return{default:JSON.parse(fs.readFileSync(file,'utf8'))};
 if(cache.has(file))return cache.get(file).exports;
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal(out.diagnostics?.filter(d=>d.category===ts.DiagnosticCategory.Error).length??0,0,`TypeScript syntax: ${file}`);
 const mod={exports:{}};cache.set(file,mod);
 new Function('require','module','exports',out.outputText)(x=>x.startsWith('.')?load(path.resolve(path.dirname(file),x)):require(x),mod,mod.exports);return mod.exports;
}
const c=json('src/features/trigonometry/curriculum.json');const all=c.topics.flatMap(t=>t.subtopics);
assert.equal(c.topics.length,14);assert.equal(all.length,102);
assert.equal(new Set(all.map(x=>x.id)).size,102,'All curriculum IDs must be stable and unique');
const group=c.topics.find(t=>t.number==='13');assert.equal(group?.subtopics.length,8);
const ids=new Set(group.subtopics.map(s=>s.id));
const lesson=json('src/data/lessons/trigonometryWavesPhase.json');
const question=json('src/data/practice/trigonometryWavesPhase.json');
const ledger=json('src/data/practice/trigonometryWavesPhaseAnswerLedgerV1048.json');
assert.deepEqual(new Set(Object.keys(lesson)),ids);assert.equal(question.length,64);assert.equal(Object.keys(ledger).length,64);
const blockIds=new Set(), diagrams=new Set();
for(const [id,l] of Object.entries(lesson)){
 assert.equal(l.id,id);assert.equal(l.status,'draft');assert.equal(l.contentVersion,1);
 assert(l.title.length>=10&&l.summary.length>=80);
 assert.equal(l.sections.length,3);
 const blocks=l.sections.flatMap(s=>s.blocks);
 for(const kind of ['definition','formula','worked-example','note','checkpoint','diagram'])assert(blocks.some(b=>b.type===kind),`${id} needs ${kind}`);
 assert.equal(blocks.filter(b=>b.type==='formula').length,3);
 assert.equal(blocks.filter(b=>b.type==='worked-example').length,2);
 assert(blocks.some(b=>b.type==='note'&&b.text.includes('Reference guide')));
 for(const b of blocks){assert(!blockIds.has(b.id),`Duplicate lesson block: ${b.id}`);blockIds.add(b.id);
  if(b.type==='formula'){
   assert(b.latex.length>6);assert.equal((b.latex.match(/{/g)??[]).length,(b.latex.match(/}/g)??[]).length,b.id);
   assert(!/[\x00-\x08\x0b\x0c\x0e-\x1f\t]/.test(b.latex),`Escaped math issue: ${b.id}`);
  }
  if(b.type==='worked-example')assert(b.steps.length>=2&&b.strategy.length>20&&b.check.length>30);
  if(b.type==='diagram'){diagrams.add(b.diagram);assert(b.caption.length>70);}
  if(b.type==='checkpoint')assert(b.answer.length>2&&b.explanation.length>35);
 }
}
assert.deepEqual(diagrams,new Set(['wave-sinusoid','wave-damped','wave-phasor']));
const qids=new Set(),prompts=new Set();
for(let i=0;i<8;i++){
 const items=question.filter(q=>q.subtopicId===group.subtopics[i].id);assert.equal(items.length,8,group.subtopics[i].number);
 assert(items.some(q=>q.difficulty==='Advanced'));
 for(let j=0;j<8;j++){
  const q=items[j];assert.equal(q.id,`TRI48-13${i+1}-${String(j+1).padStart(3,'0')}`);
  assert(!qids.has(q.id));qids.add(q.id);
  assert(!prompts.has(q.prompt));prompts.add(q.prompt);
  assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4,q.id);
  assert(Number.isInteger(q.correctIndex)&&q.correctIndex>=0&&q.correctIndex<4);
  assert.equal(q.options[q.correctIndex],ledger[q.id]);assert(q.explanation.length>=65,q.id);
 }
}
// Human-authored independent answer-index fixture, separate from the generated answer ledger.
const independentlyExpectedIndices=[
 [1,2,1,3,2,0,3,1], [0,2,1,3,0,2,1,3],
 [0,2,1,3,0,2,1,3], [0,1,2,3,0,1,2,3],
 [0,2,1,3,0,2,1,3], [0,2,1,3,0,2,1,3],
 [0,2,1,3,0,2,1,3], [0,2,1,3,0,1,2,3]
];
for(let i=0;i<8;i++)for(let j=0;j<8;j++){
 const id=`TRI48-13${i+1}-${String(j+1).padStart(3,'0')}`;
 assert.equal(question.find(q=>q.id===id)?.correctIndex,independentlyExpectedIndices[i][j],`Independent answer-index mismatch for ${id}`);
}
const {PRACTICE_CATALOG,filterPracticeQuestions}=load('src/domain/practice/catalog.ts');
assert.equal(PRACTICE_CATALOG.filter(q=>!q.key.startsWith('trigonometry-pilot:TRI49-')).length,1182);
assert.equal(new Set(PRACTICE_CATALOG.map(v=>v.key)).size,PRACTICE_CATALOG.length);
assert.equal(PRACTICE_CATALOG.filter(q=>q.bankId!=='trigonometry-pilot').length,422);
assert.equal(PRACTICE_CATALOG.filter(q=>q.bankId==='trigonometry-pilot'&&!q.key.startsWith('trigonometry-pilot:TRI49-')).length,760);
assert.equal(PRACTICE_CATALOG.filter(q=>q.key.startsWith('trigonometry-pilot:TRI48-')).length,64);
for(const s of group.subtopics){const qs=filterPracticeQuestions(PRACTICE_CATALOG,{topicId:s.id,subskill:'',difficulty:'',search:'',status:'all'});
 assert.equal(qs.length,8);assert(qs.every(q=>q.reviewStatus==='draft-unverified'&&q.objectiveId===s.id&&q.revision));}
const screen=read('src/features/trigonometry/TrigonometryScreen.tsx');
assert(screen.includes('...TRIGONOMETRY_WAVES_PHASE_LESSONS'));
assert(read('src/domain/practice/catalog.ts').includes('...TRIGONOMETRY_WAVES_PHASE_QUESTIONS'));
for(const kind of diagrams){assert(read('src/domain/learn/lessonTypes.ts').includes(`'${kind}'`));assert(read('src/components/learn-reader/TrigonometryDiagram.tsx').includes(`diagram==='${kind}'`));}
const near=(a,b,msg,tol=1e-9)=>assert(Math.abs(a-b)<=tol,`${msg}: ${a}, expected ${b}`);
// Mathematical invariants for content examples and representative question families.
near(2*Math.PI*50,100*Math.PI,'50 Hz angular frequency');near(1/50,.02,'50 Hz period');
near(2*Math.PI/(4*Math.PI),.5,'sinusoid period');near(2*Math.PI/4,Math.PI/2,'omega 4 period');
near((Math.PI/2)/(100*Math.PI),.005,'quarter phase delay');near((Math.PI/2)/(4*Math.PI),.125,'phase advance');
near((120/360)/60,1/180,'lead lag time');near(Math.hypot(3,4),5,'sum-sinusoid amplitude');
for(let x=0;x<=2*Math.PI;x+=.09){near(5*Math.sin(x+Math.atan2(4,3)),3*Math.sin(x)+4*Math.cos(x),'phasor sum');near(Math.sin(x)+Math.sin(x+Math.PI),0,'anti-phase cancellation');}
near(.1*20,2,'SHM peak velocity');near(.1*20*20,40,'SHM peak acceleration');
near(Math.exp(-.5*2),Math.exp(-1),'decay exponent');near(Math.exp(-.25*4),1/Math.E,'time constant');
near(10/Math.SQRT2,7.0710678118654755,'peak RMS');near(120*Math.SQRT2,169.7056274847714,'RMS peak');
near(Math.atan2(4,3)*180/Math.PI,53.13010235415598,'complex phasor angle');
// Preserve existing Algebra and previously completed Trigonometry manual learning records.
const tracking=load('src/domain/learn/manualLearnTracking.ts');const progress=load('src/features/trigonometry/manualProgressAdapter.ts');
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};globalThis.window={dispatchEvent:()=>{}};
const old={...tracking.emptyManualLearnRecord(),reviewCount:2,selfStatus:'understood',needsReview:true,updatedAt:'2026-01-01T00:00:00.000Z'};
memory.set(tracking.MANUAL_LEARN_STORAGE_KEY,JSON.stringify({schemaVersion:1,records:{'alg-preserve':old,'trig-polar-parametric-polar-coordinate-system':old}}));
for(const id of ids)assert(tracking.isManualTrackingId(id));
progress.saveTrigManualProgress(group.subtopics[0].id,{read1:true,read2:true,read3:true,mastered:true,review:true});
const records=tracking.readManualLearnStore().records;
assert.deepEqual(records['alg-preserve'],old);assert.deepEqual(records['trig-polar-parametric-polar-coordinate-system'],old);
assert.equal(records[group.subtopics[0].id].reviewCount,3);
assert.equal(records[group.subtopics[0].id].selfStatus,'mastered');assert.equal(records[group.subtopics[0].id].needsReview,true);
for(const p of ['src/data/lessons/trigonometryWavesPhase.ts','src/data/practice/trigonometryWavesPhase.ts','src/features/trigonometry/TrigonometryScreen.tsx','src/components/learn-reader/TrigonometryDiagram.tsx','src/domain/practice/catalog.ts']){
 const out=ts.transpileModule(read(p),{fileName:p,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal(out.diagnostics?.filter(x=>x.category===ts.DiagnosticCategory.Error).length??0,0,p);
}
assert(['10.48.0','10.49.0','10.50.0','10.50.1','10.50.2','10.50.3','10.51.0', '10.52.0', '10.53.0', '10.54.0','10.55.0','10.56.0','10.57.0','10.58.0','10.60.0','10.61.0','10.62.0'].includes(json('package.json').version));assert.equal(json('package-lock.json').version,json('package.json').version);
console.log('PASS v10.48: eight draft wave/phase lessons, 64 answer-ledger questions, three original diagrams, math assertions, 760 Trigonometry/422 Algebra questions, progress unchanged.');
