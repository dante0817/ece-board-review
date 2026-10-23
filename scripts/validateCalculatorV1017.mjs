import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url),ts=require('typescript'),root=path.resolve(import.meta.dirname,'..');
const cache=new Map();
function load(rel){const filename=path.resolve(root,rel);if(cache.has(filename))return cache.get(filename).exports;
 const code=ts.transpileModule(readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const mod={exports:{}};cache.set(filename,mod);
 new Function('require','module','exports',code)(name=>name.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(filename),name+'.ts'))):require(name),mod,mod.exports);return mod.exports;
}
const {CANON_PILOT_TECHNIQUES:getAll,getCanonTechnique,calculatorGuidanceState,PRC_CALCULATORS_URL,CANON_MANUAL_URL}=load('src/domain/calculator/canonTechniques.ts');
const {MOCK_EXAM_QUESTIONS}=load('src/data/mockExamQuestions.ts');
assert.equal(getAll.length,10);
assert.ok(PRC_CALCULATORS_URL.startsWith('https://www.prc.gov.ph/'));
assert.ok(CANON_MANUAL_URL.startsWith('https://ij.manual.canon/'));
assert.equal(new Set(getAll.map(t=>t.questionId)).size,getAll.length);
const golden={
 'mock-q-01':'a₁ = 2, d = 3','mock-q-02':'90 meters','mock-q-03':'672','mock-q-04':'x = 5',
 'mock-q-16':'660 W','mock-q-17':'180 kHz','mock-q-18':'3.0','mock-q-20':'29,902 bps',
 'mock-q-21':'k = ±12','mock-q-23':'6.75 mA',
};
for(const t of getAll){
 const q=MOCK_EXAM_QUESTIONS.find(q=>q.id===t.questionId);assert.ok(q,`Orphan technique ${t.questionId}`);
 const choice=q.options.find(o=>o.id===q.correctOptionId);assert.equal(choice.text,golden[t.questionId],`Golden solution mismatch ${q.id}`);
 assert.ok(t.steps.length>=2 && t.verify.length>=2 && t.caution.length>=12 && t.expected.length>=3);
 assert.equal(t.status,'manual-documented-not-device-tested');
 assert.ok(t.manualSection.startsWith('') && t.manualSection.includes('manual p'));
 assert.deepEqual(getCanonTechnique(q.id),t);
 assert.equal(calculatorGuidanceState(t.questionId,false).kind,'locked');
 assert.equal(calculatorGuidanceState(t.questionId,true).kind,'available');
}
assert.equal(calculatorGuidanceState('unreviewed-001',true).kind,'pending');
assert.equal(getCanonTechnique('__prototype__'),null);
const mock=readFileSync(path.join(root,'src/components/TimedMockExam.tsx'),'utf8');
assert.ok(mock.includes('<CalculatorTechniqueCard key={q.id} questionId={q.id} question={q} disclosure="after-answer" />'), 'Question identity and explicit review permission must be supplied');
assert.ok(mock.indexOf('Question-by-Question Diagnostic Review')<mock.indexOf('<CalculatorTechniqueCard key={q.id}'));
const practice=readFileSync(path.join(root,'src/components/math/ReferenceInformedTopicScreen.tsx'),'utf8');
assert.ok(practice.includes('{checked && <div className="mt-3"><CalculatorTechniqueCard'));
const app=readFileSync(path.join(root,'src/App.tsx'),'utf8'),nav=readFileSync(path.join(root,'src/components/Sidebar.tsx'),'utf8');
assert.ok(app.includes("currentScreen === 'calculator-skills' && <CalculatorSkillsScreen />"));
assert.ok(nav.includes("handleNavClick('calculator-skills')"));
const settings=readFileSync(path.join(root,'src/components/SettingsModal.tsx'),'utf8');
assert.ok(settings.includes('calculatorModel,') && settings.includes('id="calculator-profile"'));
const numericTrap = readFileSync(path.join(root,'src/components/order-of-operations/OrderOfOperationsPracticeTab.tsx'),'utf8');
const L=0.01,C=100e-12;
const wrong=(1/2)*Math.PI*Math.sqrt(L*C), correct=1/(2*Math.PI*Math.sqrt(L*C));
assert.ok(Math.abs((wrong/correct)/(Math.PI*Math.PI*L*C)-1)<1e-12);
assert.ok(correct>159000 && correct<159200 && wrong<2e-6);
assert.ok(numericTrap.includes('π²LC ≈ 9.87×10⁻¹²') && numericTrap.includes('1.5708×10⁻⁶'));
assert.ok(!numericTrap.includes('4π² times larger'));
console.log('PASS corrected resonance calculator-precedence trap (independent numerical ratio check)');
const backup=readFileSync(path.join(root,'src/utils/learnerBackup.ts'),'utf8');
assert.ok(backup.includes("'ece_board_review_profile_v3'"),'Existing learner backup must preserve profile storage');
console.log('PASS 10 exact question-ID Canon pilot methods, 10 independent golden answer-choice fixtures');
console.log('PASS 10 manual-documented provenance flags, verified-step fields, cross-link and eligibility URLs');
console.log('PASS no solution visibility pre-submit, reviewed fallback for unsupported items');
console.log('PASS dedicated navigation, profile settings, assessment-review and checked-practice integration');
console.log('PASS existing learner profile storage is preserved by archive exporter');
