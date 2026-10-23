import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..'),cache=new Map();
function load(rel){
 const filename=path.resolve(root,rel);if(cache.has(filename))return cache.get(filename).exports;
 const source=readFileSync(filename,'utf8');const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React}}).outputText;
 const mod={exports:{}};cache.set(filename,mod);
 new Function('require','module','exports',code)((name)=>name.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(filename),name+'.ts'))):require(name),mod,mod.exports);
 return mod.exports;
}
const {MOCK_EXAM_QUESTIONS}=load('src/data/mockExamQuestions.ts');
const {CANON_FAMILY_TECHNIQUES,resolveFamilyTechnique}=load('src/domain/calculator/familyTechniques.ts');
const {CANON_PILOT_TECHNIQUES}=load('src/domain/calculator/canonTechniques.ts');
assert.ok(CANON_FAMILY_TECHNIQUES.length>=18);
assert.equal(new Set(CANON_FAMILY_TECHNIQUES.map(g=>g.familyId)).size,CANON_FAMILY_TECHNIQUES.length);
const legacyIds=new Set(CANON_FAMILY_TECHNIQUES.slice(0,18).map(t=>t.familyId));
const supported=MOCK_EXAM_QUESTIONS.filter(q=>legacyIds.has(q.questionFamilyId)&&resolveFamilyTechnique(q).kind==='available');
assert.equal(supported.length,36);
const families=new Set(supported.map(q=>q.questionFamilyId));assert.equal(families.size,18);
for(const guide of CANON_FAMILY_TECHNIQUES.filter(g=>legacyIds.has(g.familyId))){
 assert.equal(guide.deviceTested,false);
 const qs=supported.filter(q=>q.questionFamilyId===guide.familyId);assert.equal(qs.length,2,guide.familyId);
 for(const q of qs){
  const result=resolveFamilyTechnique(q);assert.equal(result.kind,'available',q.id);
  assert.equal(result.technique.questionId,q.id);
  assert.equal(result.technique.status,'preliminary-not-device-tested');
  assert.ok(result.technique.verification.length>=1);
  assert.ok(result.technique.shortcut.length>=3);
  assert.equal(result.technique.unit,q.calculatorInputs.unit);
  assert.equal(guide.parameterKeys.length,q.calculatorInputs.values.length);
  // This is a separate hardcoded fixture table for every family, not a call to its question generator.
 }
}
const fixture={
 'v1014-geas-newton':[36,72],
 'v1014-geas-kinetic-energy':[100,180],
 'v1014-geas-hydrostatic-pressure':[49.05,78.48],
 'v1014-geas-present-value':[10000,10000],
 'v1014-electronics-divider':[8,6],
 'v1014-electronics-parallel':[50,120],
 'v1014-electronics-rc-time':[1000,4840],
 'v1014-electronics-rc-cutoff':[1/(2*Math.PI*10000*1e-6),1/(2*Math.PI*20000*2e-6)],
 'v1014-est-nyquist-sampling':[6000,10000],
 'v1014-est-pcm-bitrate':[64,160],
 'v1014-est-wavelength':[3,2],
 'v1014-est-shannon':[12,12],
 'v1014-est-carson':[120,180],
 'v1014-est-power-gain':[10,20],
 'v1016-math-arithmetic-mean':[10,9],
 'v1016-math-weighted-mean':[82,86.25],
 'v1016-electronics-timer-overflow':[16.384,2.048],
 'v1016-electronics-binary-truth-table':[16,32],
};
assert.deepEqual(Object.keys(fixture).sort(),[...families].sort());
for(const [family,expected] of Object.entries(fixture)){
 for(let variant=1;variant<=2;variant++){
  const q=supported.find(q=>q.questionFamilyId===family&&q.id.endsWith(`-${variant}`));
  assert.ok(q,`${family} variant ${variant}`);
  const bound=resolveFamilyTechnique(q).technique;
  const epsilon=Math.max(1e-9,Math.abs(expected[variant-1])*1e-8);
  assert.ok(Math.abs(bound.expected-expected[variant-1])<=epsilon,`${family} ${variant}: ${bound.expected} != ${expected[variant-1]}`);
 }
}
console.log('PASS 36 independently-authored expected-answer fixtures across 18 families and four examination areas');
const sample=supported.find(q=>q.questionFamilyId==='v1014-electronics-divider');
assert.ok(sample);
const fail=(q)=>assert.equal(resolveFamilyTechnique(q).kind,'pending');
fail({...sample,calculatorInputs:undefined});
fail({...sample,calculatorInputs:{...sample.calculatorInputs,familyId:'wrong-family'}});
fail({...sample,calculatorInputs:{...sample.calculatorInputs,unit:'mA'}});
fail({...sample,calculatorInputs:{...sample.calculatorInputs,values:[2]}});
fail({...sample,calculatorInputs:{...sample.calculatorInputs,values:[2,NaN,4]}});
fail({...sample,options:sample.options.map(o=>o.id===sample.correctOptionId?{...o,text:'999999 V'}:o)});
fail({...sample,options:sample.options.map(o=>o.id===sample.correctOptionId?{...o,text:'11 A'}:o)});
fail({...sample,calculatorInputs:{...sample.calculatorInputs,values:[12,2000,-2000]}});
assert.equal(resolveFamilyTechnique(MOCK_EXAM_QUESTIONS.find(q=>q.id==='mock-q-01')).kind,'pending');
console.log('PASS fail-closed binding on incorrect family, dimensions, unit, missing data, invalid denominator, key mismatch');
assert.equal(CANON_PILOT_TECHNIQUES.length,10);
const card=readFileSync(path.join(root,'src/components/CalculatorTechniqueCard.tsx'),'utf8');
const mock=readFileSync(path.join(root,'src/components/TimedMockExam.tsx'),'utf8');
const skills=readFileSync(path.join(root,'src/components/CalculatorSkillsScreen.tsx'),'utf8');
assert.ok(card.includes('canRevealCalculator(assessmentSession,disclosure)'));
assert.ok(card.includes('resolveFamilyTechnique(question)'));
assert.ok(card.includes('if(!allowed||!active)return'));
assert.ok(mock.includes('question={q} disclosure="after-answer"'));
assert.ok(skills.includes('question={question} disclosure="skills-center"'));
console.log('PASS 10 preserved pilot references; guarded UI integration; no shortcut exposed by omitted disclosure');
const preV18=readFileSync(path.join(root,'scripts/validateCalculatorV1018.mjs'),'utf8');
assert.ok(preV18.includes('all 7 aid gates'));
console.log('PASS previous calculator access regression retained');
