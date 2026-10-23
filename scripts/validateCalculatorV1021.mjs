import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..'),cache=new Map();
function load(rel){
 const file=path.resolve(root,rel);if(cache.has(file))return cache.get(file).exports;
 const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React}}).outputText;
 const mod={exports:{}};cache.set(file,mod);
 new Function('require','module','exports',code)((name)=>name.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(file),name+'.ts'))):require(name),mod,mod.exports);return mod.exports;
}
const {
 CHECK_BY_ID,CANON_SPEED_DRILL_KEY,EMPTY_SPEED_DRILLS,SPEED_DRILL_QUESTIONS,SPEED_DRILL_SECONDS,
 buildSpeedDrill,validateSpeedDrillHistory,createSpeedDrillAttempt,appendSpeedDrill,
 readSpeedDrillHistory,gradeSpeedDrill,recommendCalculatorRemediation,calculatorRetentionPrompts,MANUAL_VS_CANON_COMPARISONS
}=load('src/domain/calculator/speedDrills.ts');
const {exportLearnerArchive,previewLearnerImport,restoreLearnerArchive}=load('src/utils/learnerBackup.ts');
assert.equal(CHECK_BY_ID.size,20);
assert.equal(SPEED_DRILL_QUESTIONS,10);
assert.equal(SPEED_DRILL_SECONDS,300);
const first=buildSpeedDrill(0),second=buildSpeedDrill(1);
assert.equal(first.length,10);assert.equal(second.length,10);
assert.equal(new Set(first.map(x=>x.lessonId)).size,10);
assert.equal(new Set(first.map(x=>x.id)).size,10);
assert.notDeepEqual(first.map(q=>q.id).sort(),second.map(q=>q.id).sort(),'second drill must select alternative check for each lesson');
assert.deepEqual(new Set(first.map(q=>q.lessonId)),new Set(second.map(q=>q.lessonId)));
console.log('PASS complete 10-lesson coverage, distinct checks, variant rotation');
const start='2026-10-10T09:00:00.000Z',end='2026-10-10T09:02:20.000Z';
const request={id:'drill-test-001',startedAt:start,completedAt:end,questionIds:first.map(q=>q.id),selections:Object.fromEntries(first.map(q=>[q.id,q.check.correctIndex]))};
let attempt=createSpeedDrillAttempt(request);
assert.ok(attempt);assert.equal(attempt.elapsedSeconds,140);assert.equal(attempt.timedOut,false);
assert.deepEqual(gradeSpeedDrill(attempt.answers).correct,10);
assert.deepEqual(gradeSpeedDrill(attempt.answers).incorrect,0);
assert.equal(createSpeedDrillAttempt({...request,selections:{...request.selections,[first[0].id]:3}}),null);
assert.equal(createSpeedDrillAttempt({...request,questionIds:[...first.map(q=>q.id),first[0].id]}),null);
assert.equal(createSpeedDrillAttempt({...request,selections:{...request.selections,unknown:1}}),null);
assert.equal(createSpeedDrillAttempt({...request,completedAt:'2026-10-10T08:59:00Z'}),null);
console.log('PASS numeric grading, elapsed seconds, invalid answer and time rejection');
const wrongAnswers={...request.selections,[first[0].id]:(first[0].check.correctIndex+1)%3};
for(const q of first.slice(-2))delete wrongAnswers[q.id];
attempt=createSpeedDrillAttempt({...request,id:'drill-test-002',completedAt:'2026-10-10T09:06:00.000Z',selections:wrongAnswers});
assert.ok(attempt);assert.equal(attempt.timedOut,true);assert.equal(attempt.elapsedSeconds,300);
const score=gradeSpeedDrill(attempt.answers);assert.equal(score.correct,7);assert.equal(score.incorrect,1);assert.equal(score.unanswered,2);
let history=appendSpeedDrill(EMPTY_SPEED_DRILLS,attempt);assert.ok(history);
assert.equal(appendSpeedDrill(history,attempt),null);
const recommendations=recommendCalculatorRemediation(history,[],5);
assert.equal(recommendations[0].source,'drill');
assert.equal(recommendations[0].lessonId,first[0].lessonId);
assert.equal(recommendations[0].incorrect,1);
assert.ok(recommendations.some(r=>r.unanswered>0));
const explicit={id:'err1',topicId:'any',topicName:'',subjectId:'',category:'Sign / algebra errors',description:'',lastOccurred:'',isResolved:false,occurrenceCount:1};
const related=recommendCalculatorRemediation(EMPTY_SPEED_DRILLS,[explicit],5);
assert.equal(related[0].source,'error-log');assert.equal(related[0].lessonId,'parentheses');
assert.deepEqual(recommendCalculatorRemediation(EMPTY_SPEED_DRILLS,[{...explicit,isResolved:true}],5),[]);
console.log('PASS capped wall-clock timeout, honest wrong/unanswered counts, observed-vs-categorized remediation');
const pending=calculatorRetentionPrompts(history,'2026-10-11T09:05:59Z');
assert.equal(pending.length,3);assert.ok(pending.every(p=>!p.due));
const due=calculatorRetentionPrompts(history,'2026-10-11T09:06:00Z');assert.equal(due.length,3);assert.ok(due.every(p=>p.due));
const corrected=createSpeedDrillAttempt({...request,id:'drill-test-corrected',completedAt:'2026-10-12T09:02:20Z',startedAt:'2026-10-12T09:00:00Z'});
const cleared=appendSpeedDrill(history,corrected);
assert.equal(calculatorRetentionPrompts(cleared,'2026-10-13T09:00:00Z').length,0);
console.log('PASS 24-hour in-app follow-ups, due scheduling, cleared by a later correct answer');
const map=new Map();const store={get length(){return map.size},key(i){return [...map.keys()][i]??null},getItem(k){return map.get(k)??null},setItem(k,v){map.set(k,v)},removeItem(k){map.delete(k)}};
store.setItem(CANON_SPEED_DRILL_KEY,JSON.stringify(history));
assert.deepEqual(readSpeedDrillHistory(store),history);
const backup=exportLearnerArchive(store);assert.ok(backup.data[CANON_SPEED_DRILL_KEY]);
previewLearnerImport(backup);map.clear();restoreLearnerArchive(store,backup);
assert.deepEqual(readSpeedDrillHistory(store),history);
assert.throws(()=>previewLearnerImport({...backup,data:{...backup.data,[CANON_SPEED_DRILL_KEY]:JSON.stringify({version:1,attempts:[{...attempt,answers:[...attempt.answers,{checkId:'fake',selectedIndex:1}]}]})}}));
assert.ok(!validateSpeedDrillHistory({version:1,attempts:[{...attempt,answers:attempt.answers.map((a,i)=>i===1?{...a,checkId:attempt.answers[0].checkId}:a)}]}));
assert.ok(!validateSpeedDrillHistory({version:1,attempts:Array.from({length:51},(_,i)=>({...attempt,id:`drill-id-${i}`}))}));
let many=EMPTY_SPEED_DRILLS;
for(let i=0;i<65;i++){
 const newAttempt={...attempt,id:`drill-more-${i}`};many=appendSpeedDrill(many,newAttempt);assert.ok(many);
}
assert.equal(many.attempts.length,50);
console.log('PASS bounded history, backup/restore, tamper and malformed record rejection');
assert.equal(MANUAL_VS_CANON_COMPARISONS.length,5);
for(const c of MANUAL_VS_CANON_COMPARISONS){assert.ok(c.manual&&c.calculator&&c.fastest&&c.check&&c.trap);}
const skills=readFileSync(path.join(root,'src/components/CalculatorSkillsScreen.tsx'),'utf8');
const drills=readFileSync(path.join(root,'src/components/CalculatorSpeedDrills.tsx'),'utf8');
assert.ok(skills.includes("section==='drills'"));
assert.ok(skills.includes('CalculatorSpeedDrills errors={errors}'));
assert.ok(drills.includes('strictAssessmentLocked(assessmentSession)'));
assert.ok(drills.includes("role=\"timer\""));
assert.ok(drills.includes("document.addEventListener('visibilitychange',update)"));
assert.ok(drills.includes('finish(active,selected)'));
assert.ok(drills.includes('if(locked)return'));
console.log('PASS five model-labeled strategy comparisons, UI guard and wall-clock countdown wiring');
console.log('PASS v10.21 timed decision drills and mistake remediation (no hardware verification claimed)');
