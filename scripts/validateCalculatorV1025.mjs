import assert from 'node:assert/strict';
import path from 'node:path';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..');
const file=path.join(root,'src/domain/calculator/numericDrills.ts');
const js=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod={exports:{}};
new Function('module','exports',js)(mod,mod.exports);
const {CANON_NUMERIC_EXERCISES,diagnoseNumericMistake,checkNumericAnswer,parseNumericEntry,buildNumericDrill,gradeNumericDrill,createNumericDrillAttempt,numericDrillDeadlineReached}=mod.exports;
const byId=new Map(CANON_NUMERIC_EXERCISES.map(q=>[q.id,q]));
const cases={
 'num-scientific-a':['90','exponent-shift'],
 'num-scientific-b':['400','exponent-shift'],
 'num-parallel-a':['300','series-vs-parallel'],
 'num-parallel-b':['450','series-vs-parallel'],
 'num-cutoff-a':['10000','missing-2pi'],
 'num-cutoff-b':[String(1/(2000*0.22e-6)),'missing-2pi'],
 'num-decibel-a':['40','power-vs-amplitude'],
 'num-decibel-b':[String(20*Math.log10(50)),'power-vs-amplitude'],
 'num-sampling-a':['7.5','nyquist-factor'],
 'num-sampling-b':['18','nyquist-factor'],
 'num-power-a':['420','current-decimal'],
 'num-power-b':['300','current-decimal'],
};
for(const [id,[entry,code]] of Object.entries(cases)){
 const item=byId.get(id);
 assert.ok(item,id);
 assert.equal(checkNumericAnswer(item,entry),'incorrect',id);
 assert.equal(diagnoseNumericMistake(item,entry)?.code,code,id);
 assert.equal(diagnoseNumericMistake(item,String(item.expected)),null);
 assert.equal(diagnoseNumericMistake(item,'1,000'),null);
 assert.equal(diagnoseNumericMistake(item,null),null);
 assert.equal(diagnoseNumericMistake(item,' '),null);
 assert.equal(diagnoseNumericMistake(item,String(item.expected+1234567)),null);
}
assert.equal(diagnoseNumericMistake(byId.get('num-cutoff-a'),'0'),null,'Near-zero guesses must not be falsely diagnosed as microfarad conversion');
assert.equal(diagnoseNumericMistake(byId.get('num-cutoff-a'),'0.00159155')?.code,'microfarads');
assert.equal(diagnoseNumericMistake(byId.get('num-cutoff-b'),'0.00036172')?.code,'microfarads');
for(const item of CANON_NUMERIC_EXERCISES){
 assert.equal(checkNumericAnswer(item,(item.expected+item.absoluteTolerance*0.5).toString()),'correct');
 assert.equal(checkNumericAnswer(item,(item.expected+item.absoluteTolerance*2).toString()),'incorrect');
}
assert.equal(numericDrillDeadlineReached(1000,360999),false);
assert.equal(numericDrillDeadlineReached(1000,361000),true);
assert.equal(numericDrillDeadlineReached(NaN,361000),true);
console.log('PASS 12 item-specific misconception fixtures, boundary-tested fail-closed timer and no false positives');
const first=buildNumericDrill(0);assert.equal(first.length,6);
const attempt=createNumericDrillAttempt({id:'numeric-v1025-qa',startedAt:'2026-10-10T00:00:00.000Z',completedAt:'2026-10-10T00:06:00.000Z',questionIds:first.map(x=>x.id),entries:Object.fromEntries(first.map(x=>[x.id,String(x.expected)]))});
assert.ok(attempt?.timedOut);
assert.equal(gradeNumericDrill(attempt)?.correct,6);
for(const sample of ['NaN','∞','0x1234','1e999','+','3,141.59'])assert.equal(parseNumericEntry(sample),null);
const ui=readFileSync(path.join(root,'src/components/CalculatorNumericDrills.tsx'),'utf8');
for(const marker of ['entriesRef.current','numericDrillDeadlineReached(session.startedMs,Date.now())','The numerical drill was interrupted by the strict assessment','diagnoseNumericMistake','strictAssessmentLocked(assessmentSession)'])assert.ok(ui.includes(marker),`Missing UI safety marker: ${marker}`);
const pkg=JSON.parse(readFileSync(path.join(root,'package.json'),'utf8'));
assert.match(pkg.version,/^10\.(?:2[5-9]|[3-9]\d)\.\d+$/);
console.log('PASS deadline guarded input, strict-mode interruption, known-error review and package metadata');
