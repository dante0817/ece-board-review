import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..'),cache=new Map();
function load(rel){
 const file=path.resolve(root,rel);if(cache.has(file))return cache.get(file).exports;
 const source=readFileSync(file,'utf8');
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React}}).outputText;
 const mod={exports:{}};cache.set(file,mod);
 new Function('require','module','exports',code)((name)=>name.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(file),name+'.ts'))):require(name),mod,mod.exports);
 return mod.exports;
}
const {
 CANON_DEVICE_QA_CASES,CANON_DEVICE_QA_KEY,EMPTY_DEVICE_QA,validateDeviceQaLedger,
 validateDeviceObservation,recordDeviceObservation,removeDeviceObservation,readDeviceQaLedger
}=load('src/domain/calculator/deviceQa.ts');
const {CANON_PILOT_TECHNIQUES}=load('src/domain/calculator/canonTechniques.ts');
const {CANON_FAMILY_TECHNIQUES}=load('src/domain/calculator/familyTechniques.ts');
const {CANON_TECHNIQUE_TEMPLATES,isPublishedTechnique}=load('src/domain/calculator/techniqueLibrary.ts');
const {exportLearnerArchive,previewLearnerImport,restoreLearnerArchive}=load('src/utils/learnerBackup.ts');
assert.ok(CANON_DEVICE_QA_CASES.length>=28);
assert.equal(CANON_PILOT_TECHNIQUES.length,10);
assert.ok(CANON_FAMILY_TECHNIQUES.length>=18);
assert.equal(new Set(CANON_DEVICE_QA_CASES.map(x=>x.id)).size,CANON_DEVICE_QA_CASES.length);
assert.ok(CANON_DEVICE_QA_CASES.every(x=>x.expected&&x.warnings&&x.mode));
assert.ok(CANON_TECHNIQUE_TEMPLATES.every(x=>!isPublishedTechnique(x)&&x.reviewStage==='draft'));
assert.ok(CANON_FAMILY_TECHNIQUES.every(x=>x.deviceTested===false));
console.log(`PASS ${CANON_DEVICE_QA_CASES.length} unique Canon QA cases, correct pending device/editorial status`);
const sample={techniqueId:CANON_DEVICE_QA_CASES[0].id,techniqueVersion:1,modelId:'canon-f789sga',outcome:'observed-pass',observedAt:'2026-10-10T11:00:00Z',observer:'Verifier A',setup:'Physical F-789SGA EXP, cleared memory, COMP mode.',display:'Observed output 2 and 3',notes:'Photographic evidence pending external review'};
assert.equal(validateDeviceObservation(sample),true);
for(const bad of [{...sample,modelId:'casio-fx991'}, {...sample,techniqueId:'unknown'}, {...sample,observer:''},{...sample,setup:''},{...sample,display:''},{...sample,outcome:'published'},{...sample,techniqueVersion:2},{...sample,observedAt:'not-a-date'},{...sample,notes:'x'.repeat(1201)}])assert.equal(validateDeviceObservation(bad),false);
let ledger=recordDeviceObservation(EMPTY_DEVICE_QA,sample);
assert.ok(ledger);assert.equal(ledger.observations.length,1);
const updated={...sample,outcome:'observed-issue',display:'Actual screen differed'};
ledger=recordDeviceObservation(ledger,updated);
assert.ok(ledger);assert.equal(ledger.observations.length,1);assert.equal(ledger.observations[0].outcome,'observed-issue');
assert.equal(validateDeviceQaLedger({...ledger,observations:[sample,sample]}),false);
assert.equal(validateDeviceQaLedger({...ledger,observations:[{...sample,modelId:'unrecognized'}]}),false);
assert.equal(validateDeviceQaLedger({...ledger,observations:[]}),true);
assert.equal(recordDeviceObservation(ledger,{...sample,notes:'x'.repeat(1201)}),null);
assert.equal(removeDeviceObservation(ledger,'unknown'),null);
assert.deepEqual(removeDeviceObservation(ledger,sample.techniqueId),EMPTY_DEVICE_QA);
console.log('PASS fail-closed QA input validation, update/delete, no duplicate records');
const map=new Map();const store={get length(){return map.size},key(i){return [...map.keys()][i]??null},getItem(k){return map.get(k)??null},setItem(k,v){map.set(k,v)},removeItem(k){map.delete(k)}};
store.setItem(CANON_DEVICE_QA_KEY,JSON.stringify(ledger));
assert.deepEqual(readDeviceQaLedger(store),ledger);
const archive=exportLearnerArchive(store,'2026-10-10T12:00:00Z');
assert.ok(archive.data[CANON_DEVICE_QA_KEY]);
previewLearnerImport(archive);map.clear();restoreLearnerArchive(store,archive);
assert.deepEqual(readDeviceQaLedger(store),ledger);
for(const tampered of [JSON.stringify({version:1,observations:[{...sample,outcome:'certified'}]}),JSON.stringify({version:1,observations:[sample,sample]}),'{bad json']){
 assert.throws(()=>previewLearnerImport({...archive,data:{...archive.data,[CANON_DEVICE_QA_KEY]:tampered}}));
}
assert.equal(readDeviceQaLedger({getItem:()=>'{invalid-json'}).observations.length,0);
console.log('PASS backup/restore, malformed payload rejection and bounded local records');
const skills=readFileSync(path.join(root,'src/components/CalculatorSkillsScreen.tsx'),'utf8');
const qa=readFileSync(path.join(root,'src/components/CanonDeviceQaScreen.tsx'),'utf8');
assert.ok(skills.includes('Physical-device QA worksheet')&&skills.includes('<CanonDeviceQaScreen/>'));
assert.ok(qa.includes('strictAssessmentLocked(assessmentSession)'));
assert.ok(qa.includes('does NOT change the publication status')&&qa.includes('0 published by this worksheet'));
assert.ok(qa.includes('setLedger(next)')&&qa.includes('Save observation'));
const header=readFileSync(path.join(root,'src/components/Header.tsx'),'utf8');
const app=readFileSync(path.join(root,'src/App.tsx'),'utf8');
assert.ok(header.includes('if(strictAssessmentLocked(assessmentSession))return ('));
assert.ok(header.includes('Search, tutor, notifications and instructional navigation are temporarily unavailable.'));
assert.ok(app.includes('{!strictLocked && <AddErrorModal />}'));
assert.ok(app.includes('{!strictLocked && <PomodoroFocusTimer />}'));
const noticeFiles=[
 'linear-equations/LinearMistakesTab','linear-equations/LinearPracticeTab',
 'order-of-operations/OrderOfOperationsPracticeTab','rational-expressions/PracticeTab',
 'rational-expressions/LearnTab','algebraic-terms/PracticeTab','algebraic-terms/SimplificationTab',
 'scientific-notation/DualNotationConverterTab','scientific-notation/NotationTrapsTab'
];
for(const file of noticeFiles)assert.ok(readFileSync(path.join(root,`src/components/${file}.tsx`),'utf8').includes('<CalculatorCompatibilityNotice/>'),file);
console.log('PASS strict-header instructional controls closed and nine additional model warnings');
console.log('PASS device-QA UI entry, strict lock and honest observation-only notices');
console.log('PASS v10.22 QA ledger hardening (NOT a physical-device certification)');
