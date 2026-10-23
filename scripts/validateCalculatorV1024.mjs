import assert from 'node:assert/strict';
import path from 'node:path';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..'),cache=new Map();
function load(rel){
 const file=path.resolve(root,rel);if(cache.has(file))return cache.get(file).exports;
 const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const mod={exports:{}};cache.set(file,mod);
 new Function('require','module','exports',code)((name)=>name.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(file),name+'.ts'))):require(name),mod,mod.exports);
 return mod.exports;
}
const {
 CANON_NUMERIC_DRILLS_KEY,NUMERIC_DRILL_SECONDS,NUMERIC_DRILL_QUESTIONS,CANON_NUMERIC_EXERCISES,
 NUMERIC_BY_ID,buildNumericDrill,parseNumericEntry,checkNumericAnswer,EMPTY_NUMERIC_DRILLS,
 createNumericDrillAttempt,validateNumericDrillHistory,appendNumericDrill,readNumericDrills,gradeNumericDrill
}=load('src/domain/calculator/numericDrills.ts');
const {exportLearnerArchive,previewLearnerImport,restoreLearnerArchive}=load('src/utils/learnerBackup.ts');
assert.equal(NUMERIC_DRILL_QUESTIONS,6);assert.equal(NUMERIC_DRILL_SECONDS,360);
assert.equal(CANON_NUMERIC_EXERCISES.length,12);
assert.equal(NUMERIC_BY_ID.size,12);
assert.equal(new Set(CANON_NUMERIC_EXERCISES.map(q=>q.familyId)).size,6);
for(const item of CANON_NUMERIC_EXERCISES){
 assert.ok(item.formula&&item.independentCheck&&item.pitfall&&item.lessonId);
 assert.equal(checkNumericAnswer(item,String(item.expected)),'correct',item.id);
 assert.equal(checkNumericAnswer(item,'   '),'unanswered',item.id);
 assert.equal(checkNumericAnswer(item,String(item.expected+Math.max(1,Math.abs(item.expected)*0.2))),'incorrect',item.id);
}
// Expected outputs crosschecked against independently authored expressions, rather than fixture strings alone.
const expected={
 'num-scientific-a':3.6e-3*2.5e5,'num-scientific-b':4.8e6/1.2e3,
 'num-parallel-a':1/(1/120+1/180),'num-parallel-b':1/(1/150+1/300),
 'num-cutoff-a':1/(2*Math.PI*1000*0.1e-6),'num-cutoff-b':1/(2*Math.PI*2000*0.22e-6),
 'num-decibel-a':10*Math.log10(100),'num-decibel-b':10*Math.log10(50),
 'num-sampling-a':2*7.5,'num-sampling-b':2*18,
 'num-power-a':12*0.35,'num-power-b':24*0.125
};
for(const item of CANON_NUMERIC_EXERCISES){
 assert.ok(Math.abs(item.expected-expected[item.id])<Math.max(1e-9,Math.abs(item.expected)*1e-11),`Independent fixture mismatch: ${item.id}`);
 assert.equal(checkNumericAnswer(item,String(Number(item.expected.toFixed(2)))),'correct',`Two decimal result: ${item.id}`);
}
console.log('PASS 12 numerical fixtures, independent formula values and per-item tolerance checks');
assert.equal(parseNumericEntry('1.59e3'),1590);assert.equal(parseNumericEntry('-2.5'),-2.5);
for(const entry of ['','1,590','1.2 W','1+2','Infinity','NaN','1e999','1..3'])assert.equal(parseNumericEntry(entry),null,entry);
const q0=buildNumericDrill(0),q1=buildNumericDrill(1),q2=buildNumericDrill(2);
for(const qs of [q0,q1,q2]){assert.equal(qs.length,6);assert.equal(new Set(qs.map(x=>x.familyId)).size,6);}
assert.equal(new Set(q0.map(x=>x.id).concat(q1.map(x=>x.id))).size,12);
assert.notDeepEqual(q0.map(x=>x.familyId),q1.map(x=>x.familyId));
console.log('PASS safe numeric entry parsing and one-per-family deterministic rotation');
const start='2026-10-10T09:00:00.000Z',end='2026-10-10T09:02:00.000Z';
const request={id:'numeric-test-001',startedAt:start,completedAt:end,questionIds:q0.map(q=>q.id),entries:Object.fromEntries(q0.map(q=>[q.id,String(q.expected)]))};
const attempt=createNumericDrillAttempt(request);assert.ok(attempt);assert.equal(attempt.elapsedSeconds,120);
assert.equal(gradeNumericDrill(attempt).correct,6);
assert.equal(gradeNumericDrill(attempt).incorrect,0);
assert.equal(createNumericDrillAttempt({...request,questionIds:[...request.questionIds.slice(0,5),request.questionIds[0]]}),null);
assert.equal(createNumericDrillAttempt({...request,entries:{...request.entries,other:'1'}}),null);
const malformed=createNumericDrillAttempt({...request,entries:{...request.entries,[q0[0].id]:'2,000'}});
assert.ok(malformed);assert.equal(gradeNumericDrill(malformed).incorrect,1,'invalid typed number is a recorded wrong response, not a discarded attempt');
assert.equal(createNumericDrillAttempt({...request,completedAt:'2026-10-10T08:59:00Z'}),null);
const wrong={...request.entries,[q0[0].id]:String(q0[0].expected+123)};delete wrong[q0[1].id];
const timeout=createNumericDrillAttempt({...request,id:'numeric-test-002',completedAt:'2026-10-10T09:08:00Z',entries:wrong});
assert.ok(timeout);assert.equal(timeout.timedOut,true);assert.equal(timeout.elapsedSeconds,360);
const scores=gradeNumericDrill(timeout);assert.deepEqual([scores.correct,scores.incorrect,scores.unanswered],[4,1,1]);
assert.equal(validateNumericDrillHistory({version:1,attempts:[{...timeout,timedOut:false}]}),false);
assert.equal(validateNumericDrillHistory({version:1,attempts:[{...timeout,elapsedSeconds:120}]}),false);
console.log('PASS numeric grading, explicit unanswered, timeout and tamper rejection');
let history=appendNumericDrill(EMPTY_NUMERIC_DRILLS,attempt);assert.ok(history);
history=appendNumericDrill(history,timeout);assert.ok(history);
assert.equal(appendNumericDrill(history,attempt),null);
let many=EMPTY_NUMERIC_DRILLS;
for(let i=0;i<55;i++){many=appendNumericDrill(many,{...attempt,id:`numeric-item-${i}`});assert.ok(many);}
assert.equal(many.attempts.length,50);
const map=new Map();const store={get length(){return map.size},key(i){return [...map.keys()][i]??null},getItem(k){return map.get(k)??null},setItem(k,v){map.set(k,v)},removeItem(k){map.delete(k)}};
store.setItem(CANON_NUMERIC_DRILLS_KEY,JSON.stringify(history));assert.deepEqual(readNumericDrills(store),history);
const backup=exportLearnerArchive(store);assert.ok(backup.data[CANON_NUMERIC_DRILLS_KEY]);
previewLearnerImport(backup);map.clear();restoreLearnerArchive(store,backup);
assert.deepEqual(readNumericDrills(store),history);
assert.throws(()=>previewLearnerImport({...backup,data:{...backup.data,[CANON_NUMERIC_DRILLS_KEY]:JSON.stringify({version:1,attempts:[{...attempt,answers:[{questionId:'unknown',entry:'42'},...attempt.answers.slice(1)]}]})}}));
assert.equal(validateNumericDrillHistory({version:1,attempts:Array.from({length:51},(_,i)=>({...attempt,id:`numeric-overflow-${i}`}))}),false);
console.log('PASS capped history, backup and restore, malformed-data rejection');
const screen=readFileSync(path.join(root,'src/components/CalculatorSkillsScreen.tsx'),'utf8');
const ui=readFileSync(path.join(root,'src/components/CalculatorNumericDrills.tsx'),'utf8');
assert.ok(screen.includes("section==='numeric'?<CalculatorNumericDrills"));
assert.ok(ui.includes('strictAssessmentLocked(assessmentSession)'));
assert.ok(ui.includes("document.addEventListener('visibilitychange',update)"));
assert.ok(ui.includes('parseNumericEntry'));
assert.ok(!ui.includes('addTestRecord'));
const pkg=JSON.parse(readFileSync(path.join(root,'package.json'),'utf8'));
const lock=JSON.parse(readFileSync(path.join(root,'package-lock.json'),'utf8'));
assert.match(pkg.version,/^10\.(?:2[4-9]|[3-9]\d)\.\d+$/);assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
console.log('PASS numerical UI wiring, fail-closed assessment mode and package metadata');
console.log('PASS v10.24 numerical-answer practice and backup integrity (hardware NOT verified)');
