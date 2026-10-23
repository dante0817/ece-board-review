import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..'),cache=new Map();
function load(rel){
 const file=path.resolve(root,rel);if(cache.has(file))return cache.get(file).exports;
 const source=readFileSync(file,'utf8');
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const mod={exports:{}};cache.set(file,mod);
 new Function('require','module','exports',code)((name)=>name.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(file),name+'.ts'))):require(name),mod,mod.exports);
 return mod.exports;
}
const {normalizeCalculatorBoardTip,CALCULATOR_AI_GUARDRAIL}=load('src/domain/calculator/modelSafety.ts');
assert.ok(CALCULATOR_AI_GUARDRAIL.includes('Canon F-789SGA'));
for(const oldTip of [
 'On Casio fx-991: press MODE 5 3 then SHIFT 4 to evaluate.',
 'Press [SHIFT] then [SOLVE] on the fx-991CW.',
 'Use MODE 6 MATRIX > MatA SHIFT 4 7.',
 'A result of 0 for x=2 proves the expressions identical for every x.',
]){
 const fixed=normalizeCalculatorBoardTip(oldTip);
 assert.ok(fixed.includes('withheld'),oldTip);
 assert.ok(!/Casio|MODE 6|SHIFT 4|proves the expressions identical/i.test(fixed),oldTip);
}
assert.equal(normalizeCalculatorBoardTip('Check the domain x>1, and verify x=5 in the original equation.'),
 'Check the domain x>1, and verify x=5 in the original equation.');
assert.ok(normalizeCalculatorBoardTip(null).includes('original equation'));
console.log('PASS known incompatible device instructions filtered, general math tips retained');
const {CANON_DEVICE_QA_CASES,EMPTY_DEVICE_QA,recordDeviceObservation}=load('src/domain/calculator/deviceQa.ts');
const {buildCanonQaEvidenceExport}=load('src/domain/calculator/deviceEvidence.ts');
const now='2026-10-10T13:00:00.000Z';
const blank=buildCanonQaEvidenceExport(EMPTY_DEVICE_QA,now);
assert.equal(blank.totalCases,CANON_DEVICE_QA_CASES.length);assert.equal(blank.outstandingCaseIds.length,CANON_DEVICE_QA_CASES.length);
assert.equal(blank.status,'observer-supplied-unverified');
assert.ok(!Object.hasOwn(blank,'approved')&&!Object.hasOwn(blank,'certified'));
const example={techniqueId:CANON_DEVICE_QA_CASES[0].id,techniqueVersion:1,modelId:'canon-f789sga',outcome:'observed-pass',observedAt:now,observer:'Test A',setup:'Real Canon F-789SGA initial setup (sample, unverified)',display:'Observed 2.00 (sample)',notes:'Observation only; manual approval remains pending'};
const ledger=recordDeviceObservation(EMPTY_DEVICE_QA,example);
assert.ok(ledger);
const report=buildCanonQaEvidenceExport(ledger,now);
assert.equal(report.observations.length,1);assert.equal(report.outstandingCaseIds.length,CANON_DEVICE_QA_CASES.length-1);
assert.ok(report.reviewRequirement.includes('not approval'));
assert.equal(buildCanonQaEvidenceExport({...ledger,observations:[example,example]},now),null);
assert.equal(buildCanonQaEvidenceExport(ledger,'invalid-date'),null);
const output=JSON.stringify(report);
assert.ok(output.includes('observer-supplied-unverified')&&!output.includes('"approved":true'));
console.log(`PASS ${CANON_DEVICE_QA_CASES.length}-case review handoff, report validation and no automatic approval`);
const server=readFileSync(path.join(root,'server.ts'),'utf8');
const qa=readFileSync(path.join(root,'src/components/CanonDeviceQaScreen.tsx'),'utf8');
const card=readFileSync(path.join(root,'src/components/CalculatorTechniqueCard.tsx'),'utf8');
const chat=readFileSync(path.join(root,'src/data/chatRoles.ts'),'utf8');
const policy=readFileSync(path.join(root,'src/domain/assessment/assessmentAccess.ts'),'utf8');
assert.ok(server.includes('CALCULATOR_AI_GUARDRAIL')&&server.includes('normalizeCalculatorBoardTip'));
assert.ok(!server.includes('If the result is $0$, the simplification is mathematically identical'));
assert.ok(!server.includes('MODE 5 3'));
assert.ok(!chat.includes('Casio calculator shortcuts'));
assert.ok(qa.includes('exportForExternalReview')&&qa.includes('Export unverified QA evidence'));
assert.ok(qa.includes('strictAssessmentLocked(assessmentSession)'));
assert.ok(card.includes('canRevealCalculator')&&policy.includes("if(strictAssessmentLocked(session)) return false"));
assert.ok(server.includes("app.get('/api/health'"));
console.log('PASS application calculator/tutor integration and strict assistance checks');
const pkg=JSON.parse(readFileSync(path.join(root,'package.json'),'utf8'));
const lock=JSON.parse(readFileSync(path.join(root,'package-lock.json'),'utf8'));
assert.match(pkg.version,/^10\.(?:2[3-9]|[3-9]\d)\.\d+$/,'v10.23 or later');assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
assert.ok(pkg.scripts['smoke:browser:v10.23']&&pkg.scripts['preflight:v10.23']);
console.log('PASS build/browser QA entrypoints and package metadata consistent');
