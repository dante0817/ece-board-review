/** v10.66 developmental source checks, joint quota feasibility and assessment fail-closed proof. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {runInNewContext} from 'node:vm';
import crypto from 'node:crypto';
const require=createRequire(import.meta.url);
let ts;
try{ts=require('typescript');}catch{ts=require(execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim()+'/typescript');}
const R=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const J=file=>JSON.parse(R(file));
const p='src/features/probability-statistics/';
const lessons=J(p+'psLessons.json'), questions=J(p+'psQuestions.json'), ev=J(p+'psLessonEvidence.json'),
  qr=J(p+'psQuestionReview.json'), pts=J(p+'psV10660PassageLocatorAudit.json'),
  findings=J(p+'psV10660EditorialFindings.json'), blueprint=J(p+'psAssessmentBlueprint.json'),baseline=J('scripts/psBaselineV10660.json');
const pkg=J('package.json'), lock=J('package-lock.json');
assert.equal(pkg.version,'10.66.0');assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
assert.equal(lessons.length,80);assert.equal(questions.length,204);
assert.equal(questions.filter(q=>q.guidedOnly).length,64);
assert.equal(questions.filter(q=>!q.guidedOnly).length,140);
assert.equal(questions.filter(q=>!q.guidedOnly&&q.kind==='calculation').length,99);
assert.equal(questions.filter(q=>!q.guidedOnly&&q.kind==='concept').length,41);
assert.equal(Object.keys(ev).length,80);assert.equal(Object.keys(qr).length,140);
assert.equal(Object.keys(pts).length,23);
const uniq=(arr,label)=>assert.equal(new Set(arr).size,arr.length,`Nonunique ${label}`);
uniq(lessons.map(l=>l.id),'lessons');uniq(questions.map(q=>q.id),'questions');
assert(lessons.every(l=>l.status==='draft'));
assert(questions.every(q=>q.assessmentEligible===false));
assert(Object.values(ev).every(e=>e.passageVerified===false));
assert(Object.values(qr).every(r=>!r.expertApproved&&!r.independentEditorialSignoff&&!r.statisticalModelVerified&&!r.answerAndDistractorsVerified&&!r.passageVerified&&r.approvedCognitiveLevel===null));
assert(Object.values(pts).every(t=>t.locatorFound===true&&t.passageVerified===false&&t.independentEditorialSignoff===false));
assert(lessons.find(l=>l.id==='PS02-01').concept.includes('does not require statistically independent'));
assert(lessons.find(l=>l.id==='PS02-04').guardrail.includes('inclusion'));
assert.equal(ev['PS04-09'].section,'2.6');assert.equal(ev['PS04-09'].pdfPage,155);
assert.deepEqual(blueprint.competencies.map(x=>x.items),[2,5,2,2,4]);
assert.deepEqual(blueprint.cognitiveTargetAcross15,{knowledge:2,comprehension:3,application:6,analysis:4});
const sha=x=>crypto.createHash('sha256').update(JSON.stringify(deepSort(x))).digest('hex');
function deepSort(x){if(Array.isArray(x))return x.map(deepSort);if(x&&typeof x==='object')return Object.fromEntries(Object.entries(x).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,deepSort(v)]));return x;}
// Node locale ordering might differ on unicode names; these fields use simple ASCII keys.
for(const [key,objects,id] of [['lessons',lessons,'id'],['questions',questions,'id'],['evidence',Object.entries(ev).map(([id,data])=>({id,data})),'id']]){
 const hashes=baseline[key];const changed=[];
 for(const obj of objects){const val=key==='evidence'?obj.data:obj;if(sha(val)!==hashes[obj[id]])changed.push(obj[id]);}
 const expected=baseline[key==='evidence'?'expectedEditedEvidenceIds':key==='lessons'?'expectedEditedLessonIds':'expectedEditedQuestionIds'];
 assert.deepEqual(changed.sort(),[...expected].sort(),`${key} unexpected changes: ${changed}`);
}
const files=[p+'psContent.ts',p+'PSPracticePanel.tsx',p+'ProbabilityStatisticsScreen.tsx'];
for(const file of files){const src=R(file);const name=path.basename(file);const parse=ts.createSourceFile(name,src,ts.ScriptTarget.ES2022,true,name.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 assert.equal(parse.parseDiagnostics.length,0, `${file}: ${parse.parseDiagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')).join('; ')}`);
}
const content=R(p+'psContent.ts'), filename=fileURLToPath(new URL('../'+p+'psContent.ts',import.meta.url));
const compiled=ts.transpileModule(content,{fileName:filename,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true,resolveJsonModule:true}}).outputText;
const outputs={};
runInNewContext(compiled,{exports:outputs,module:{exports:outputs},require:createRequire(filename)},{filename});
assert.equal(outputs.PS_LESSONS.length,80);
assert.equal(Object.keys(outputs.PS_READER_LESSONS).length,80);
assert.equal(outputs.PS_BOARD_EXAM_QUESTIONS.length,0);
assert.equal(outputs.PS_BOARD_EXAM_READY,false);
assert.equal(outputs.PS_JOINT_BLUEPRINT_FEASIBLE,false);
assert.deepEqual(Array.from(outputs.PS_READINESS_PREFLIGHT,x=>x.missing),[2,5,2,2,4]);
const targets=blueprint.competencies;const cog=blueprint.cognitiveTargetAcross15;
const slots=targets.flatMap(c=>Array.from({length:c.items},()=>c.id));
const levels=Object.entries(cog).flatMap(([level,count])=>Array.from({length:count},()=>level));
const feasible=slots.map((competency,i)=>({id:`ok${i}`,competency,cognitiveLevel:levels[i]}));
assert.equal(outputs.psCanFillJointBlueprint(feasible,targets,cog),true);
assert.equal(outputs.psCanFillJointBlueprint(feasible.slice(1),targets,cog),false);
// Marginal requirements are met but NO joint allocation is possible: all K/C are within 5.1,
// which has only two slots while 5 K/C slots are required across the exam.
const impossible=targets.flatMap((c,i)=>Array.from({length:c.items},(_,j)=>({id:`a${i}-${j}`,competency:c.id,cognitiveLevel:j%2?'analysis':'application'})));
impossible.push(...['knowledge','knowledge','comprehension','comprehension','comprehension'].map((cognitiveLevel,i)=>({id:`restricted${i}`,competency:'5.1',cognitiveLevel})));
assert(impossible.filter(x=>x.cognitiveLevel==='knowledge').length>=2);
assert(impossible.filter(x=>x.cognitiveLevel==='comprehension').length>=3);
assert.equal(outputs.psCanFillJointBlueprint(impossible,targets,cog),false);
assert.equal(findings.release,'10.66.0');
console.log('PASS: v10.66 source and TypeScript syntax; immutable baseline: 2 lessons, 0 questions, 1 reference locator changed.');
console.log('PASS: 80 draft lessons, 140 independent questions, 23 source-page keyword locators; all passage/SME approvals false.');
console.log('PASS: PRC assessment pool remains empty; adversarial joint quota test catches incompatible marginal totals.');
