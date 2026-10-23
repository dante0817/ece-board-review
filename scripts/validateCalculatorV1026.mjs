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
const {MOCK_EXAM_QUESTIONS}=load('src/data/mockExamQuestions.ts');
const {CANON_FAMILY_TECHNIQUES,resolveFamilyTechnique}=load('src/domain/calculator/familyTechniques.ts');
const {CANON_PILOT_TECHNIQUES}=load('src/domain/calculator/canonTechniques.ts');
const {CANON_DEVICE_QA_CASES,validateDeviceQaLedger,recordDeviceObservation,EMPTY_DEVICE_QA}=load('src/domain/calculator/deviceQa.ts');
const {buildCanonQaEvidenceExport}=load('src/domain/calculator/deviceEvidence.ts');
const {summarizeCalculatorCoverage}=load('src/domain/calculator/coverage.ts');
const originalCount=18;
assert.equal(CANON_FAMILY_TECHNIQUES.length,38);
assert.equal(CANON_PILOT_TECHNIQUES.length,10);
assert.equal(new Set(CANON_FAMILY_TECHNIQUES.map(x=>x.familyId)).size,38);
const newGuides=CANON_FAMILY_TECHNIQUES.slice(originalCount);
assert.equal(newGuides.length,20);
const expected={
 'v1016-math-coulomb-force':[0.5993333333333334,0.7192],
 'v1016-math-discrete-rms':[Math.sqrt(5),2],
 'v1016-math-percent-overshoot':[20,50],
 'v1014-geas-mechanical-power':[40,40],
 'v1014-geas-boyle':[120,100],
 'v1014-geas-sensible-heat':[42,50.4],
 'v1014-geas-stress':[3,3],
 'v1014-geas-simple-interest':[3600,6000],
 'v1014-electronics-series':[1300,1000],
 'v1014-electronics-rl-time':[2,2.5],
 'v1014-electronics-inverting-amp':[-20,-12],
 'v1014-electronics-noninverting-amp':[10,6],
 'v1014-electronics-led-resistor':[200,450],
 'v1014-electronics-adc-step':[4.8828125,12.890625],
 'v1014-est-quarterwave':[0.75,0.5],
 'v1014-est-qam-bits':[4,6],
 'v1014-est-propagation-delay':[3,4.5],
 'v1014-est-packet-efficiency':[1000/11,250/3],
 'v1014-est-attenuation':[2,6],
 'v1014-est-baudrate':[2400,2000],
};
assert.deepEqual(new Set(Object.keys(expected)),new Set(newGuides.map(x=>x.familyId)));
const areas=new Set();
for(const spec of newGuides){
 assert.equal(spec.deviceTested,false);
 assert.equal(spec.calculatorMode,'COMP');
 assert.ok(spec.caution.length>=45 && spec.formula.length>5);
 assert.ok(spec.shortcut && spec.verification && spec.evaluate);
 const variants=MOCK_EXAM_QUESTIONS.filter(q=>q.questionFamilyId===spec.familyId);
 assert.equal(variants.length,2,`variant count ${spec.familyId}`);
 areas.add(variants[0].subjectId);
 for(let i=0;i<variants.length;i++){
  const q=variants[i],b=resolveFamilyTechnique(q);
  assert.equal(b.kind,'available',`${q.id}: ${b.reason??''}`);
  const bound=b.technique,oracle=expected[spec.familyId][i];
  assert.ok(Math.abs(bound.expected-oracle)<=Math.max(1e-8,Math.abs(oracle)*1e-9),`${q.id}: ${bound.expected} != ${oracle}`);
  assert.equal(bound.questionId,q.id);
  assert.equal(bound.unit,q.calculatorInputs.unit);
  assert.equal(bound.status,'preliminary-not-device-tested');
  assert.equal(Object.keys(bound.parameterValues).length,spec.parameterKeys.length);
  assert.ok(bound.shortcut.length>=4);
  assert.ok(bound.verification.length>=1);
  assert.ok(!bound.shortcut.includes('NaN')&&!bound.shortcut.includes('Infinity'));
  assert.ok(!bound.verification.some(t=>t.includes('NaN')||t.includes('Infinity')));
  assert.equal(resolveFamilyTechnique({...q,calculatorInputs:{...q.calculatorInputs,values:q.calculatorInputs.values.slice(1)}}).kind,'pending');
  assert.equal(resolveFamilyTechnique({...q,calculatorInputs:{...q.calculatorInputs,unit:'unexpected'}}).kind,'pending');
  assert.equal(resolveFamilyTechnique({...q,options:q.options.map(o=>o.id===q.correctOptionId?{...o,text:`888888 ${q.calculatorInputs.unit}`}:o)}).kind,'pending');
 }
}
assert.equal(areas.size,4,'All four board-examination areas represented');
console.log('PASS 40 independently specified numerical fixtures across 20 new technique families and four board areas');
const mutate=(id,values)=>{const q=MOCK_EXAM_QUESTIONS.find(q=>q.questionFamilyId===id);assert.ok(q);return resolveFamilyTechnique({...q,calculatorInputs:{...q.calculatorInputs,values}});};
for(const [id,values] of [
 ['v1016-math-coulomb-force',[2,3,0]],
 ['v1016-math-percent-overshoot',[9,10]],
 ['v1014-geas-mechanical-power',[1200,0]],
 ['v1014-geas-boyle',[200,3,0]],
 ['v1014-electronics-rl-time',[0.2,0]],
 ['v1014-electronics-led-resistor',[2,3,20]],
 ['v1014-electronics-led-resistor',[5,2,0]],
 ['v1014-electronics-adc-step',[5,1.5]],
 ['v1014-est-qam-bits',[18]],
 ['v1014-est-baudrate',[9600,3]],
 ['v1014-est-propagation-delay',[600,-2e8]],
 ['v1014-est-packet-efficiency',[1000,0]],
 ])assert.equal(mutate(id,values).kind,'pending',`domain ${id}`);
const signed=resolveFamilyTechnique(MOCK_EXAM_QUESTIONS.find(q=>q.id==='v1016-math-discrete-rms-2'));
assert.equal(signed.kind,'available','Signed samples valid for RMS calculation');
console.log('PASS fail-closed domain, units, variant-shape, keyed-answer mismatch; signed RMS correctly accepted');
const total=MOCK_EXAM_QUESTIONS.filter(q=>resolveFamilyTechnique(q).kind==='available');
assert.equal(total.length,76);
const coverage=summarizeCalculatorCoverage(MOCK_EXAM_QUESTIONS);
assert.equal(coverage.total,165);assert.equal(coverage.available,86);assert.equal(coverage.pending,79);
assert.deepEqual([coverage.pilot,coverage.familyVariants],[10,76]);
assert.equal(coverage.areas.reduce((sum,a)=>sum+a.total,0),coverage.total);
assert.equal(coverage.areas.reduce((sum,a)=>sum+a.available,0),coverage.available);
assert.ok(coverage.areas.some(a=>a.id==='subj-math-calc'&&a.available===0));
assert.ok(coverage.areas.some(a=>a.id==='subj-math-trig'&&a.available===0));
assert.equal(CANON_DEVICE_QA_CASES.length,48);
assert.equal(new Set(CANON_DEVICE_QA_CASES.map(c=>c.id)).size,48);
const report=buildCanonQaEvidenceExport(EMPTY_DEVICE_QA,'2026-10-10T10:00:00Z');
assert.equal(report.totalCases,48);assert.equal(report.outstandingCaseIds.length,48);
const old=CANON_DEVICE_QA_CASES[0];
const observation={techniqueId:old.id,techniqueVersion:1,modelId:'canon-f789sga',outcome:'observed-issue',observedAt:'2026-10-10T10:00:00Z',observer:'Device tester',setup:'Actual model to be checked',display:'Physical test pending',notes:'Does not confer approval'};
const ledger=recordDeviceObservation(EMPTY_DEVICE_QA,observation);
assert.ok(ledger && validateDeviceQaLedger(ledger));
console.log('PASS 48 QA case identifiers, existing observation backward-compatibility and zero automatic approvals');
const ui=readFileSync(path.join(root,'src/components/CalculatorSkillsScreen.tsx'),'utf8');
const card=readFileSync(path.join(root,'src/components/CalculatorTechniqueCard.tsx'),'utf8');
assert.ok(ui.includes('resolveFamilyTechnique(q)'));
assert.ok(ui.includes('summarizeCalculatorCoverage(MOCK_EXAM_QUESTIONS)'));
assert.ok(ui.includes('This measures question-level guidance availability'));
assert.ok(ui.includes('coverageSnapshot.pending'));
assert.ok(card.includes('canRevealCalculator(assessmentSession,disclosure)'));
const pkg=JSON.parse(readFileSync(path.join(root,'package.json'),'utf8'));
const lock=JSON.parse(readFileSync(path.join(root,'package-lock.json'),'utf8'));
assert.match(pkg.version,/^10\.(?:2[6-9]|[3-9]\d)\.\d+$/);assert.equal(pkg.version,lock.version);assert.equal(pkg.version,lock.packages[''].version);
console.log(`PASS ${total.length} family variants + 10 exact pilot guides; strict-mode solution gate; synchronized package metadata`);
console.log('NOTE: Mathematical fixtures are NOT verification of physical Canon F-789SGA key sequences, LCD output, or PRC certification.');
