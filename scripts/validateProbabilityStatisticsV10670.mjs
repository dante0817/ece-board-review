/** v10.67.0 content integrity, source locator and fail-closed readiness checks.
  Validates technical consistency; DOES NOT confer subject-matter-expert certification. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {runInNewContext} from 'node:vm';
import crypto from 'node:crypto';
const require=createRequire(import.meta.url);
let ts;
try{ts=require('typescript');}catch{ts=require(execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim()+'/typescript');}
const root=new URL('../',import.meta.url),rootDir=fileURLToPath(root);
const loadText=(f)=>readFileSync(new URL(f,root),'utf8');
const J=f=>JSON.parse(loadText(f));
const prefix='src/features/probability-statistics/';
const lessons=J(prefix+'psLessons.json'), qs=J(prefix+'psQuestions.json'),
 ev=J(prefix+'psLessonEvidence.json'), qr=J(prefix+'psQuestionReview.json'),
 loc=J(prefix+'psV10670SourceLocatorChecks.json'),
 register=J(prefix+'psV10670QuestionVerificationRegister.json'),
 blueprint=J(prefix+'psAssessmentBlueprint.json'),base=J('scripts/psBaselineV10670.json');
const pkg=J('package.json'),lock=J('package-lock.json');
assert.equal(pkg.version,'10.67.0');assert.equal(lock.version,'10.67.0');assert.equal(lock.packages[''].version,'10.67.0');
assert.equal(lessons.length,80);assert.equal(qs.length,204);
assert.equal(qs.filter(x=>x.guidedOnly).length,64);
const active=qs.filter(x=>!x.guidedOnly);
assert.equal(active.length,140);assert.equal(active.filter(x=>x.kind==='calculation').length,99);assert.equal(active.filter(x=>x.kind==='concept').length,41);
const U=(arr,msg)=>assert.equal(new Set(arr).size,arr.length,msg);
U(lessons.map(x=>x.id),'lesson duplicate');U(qs.map(x=>x.id),'question duplicate');
assert.equal(Object.keys(ev).length,80);assert.equal(Object.keys(qr).length,140);
assert.equal(Object.keys(loc).length,80);assert.equal(Object.keys(register).length,140);
assert(lessons.every(l=>l.status==='draft'));
assert(qs.every(q=>q.assessmentEligible===false));
assert(Object.values(ev).every(e=>e.passageVerified===false));
assert(Object.values(qr).every(r=>!r.expertApproved&&!r.independentEditorialSignoff&&!r.statisticalModelVerified&&!r.answerAndDistractorsVerified&&!r.passageVerified&&r.approvedCognitiveLevel===null));
assert(Object.values(loc).every(e=>e.pageHasExtractableText===true&&e.pageTextLength>100&&!e.wholeLessonPassageVerified&&!e.workedExampleVerified&&!e.independentExpertSignoff));
assert(Object.values(register).every(q=>q.fourUniqueOptions&&!q.expertSignoff&&!q.assessmentEligibility));
assert.deepEqual(Object.keys(loc).sort(),lessons.map(l=>l.id).sort());
assert.deepEqual(Object.keys(register).sort(),active.map(q=>q.id).sort());
for(const l of lessons){const p=loc[l.id],e=ev[l.id];assert.equal(p.pdfPage1Based,e.pdfPage);assert.equal(p.section,e.section);assert.equal(p.sectionTitle,e.sectionTitle);}
for(const q of active){const v=register[q.id];assert.equal(v.answerKey,q.options[q.correctIndex]);assert.equal(v.sourceLocatorId,q.topicId);assert.equal(v.lessonId,q.topicId);}
assert(lessons.find(l=>l.id==='PS06-03').concept.includes('at most α'));
assert(lessons.find(l=>l.id==='PS07-01').guardrail.includes('undefined'));
assert.equal(ev['PS03-08'].pdfPage,89);assert.equal(ev['PS06-03'].pdfPage,494);assert.equal(ev['PS07-07'].pdfPage,567);
const H=x=>crypto.createHash('sha256').update(JSON.stringify(canonical(x))).digest('hex');
function canonical(x){if(Array.isArray(x))return x.map(canonical);if(x&&typeof x==='object')return Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])]));return x;}
const diffs=(items,hashes,key)=>items.filter(i=>H(i[key]??i)!==hashes[i.id]).map(i=>i.id).sort();
// source signatures supplied by independent 10.66 release snapshot; do not touch these on patching.
assert.deepEqual(diffs(lessons,base.lessonSHA256,'___'),base.expectedChangedLessons.sort());
assert.deepEqual(diffs(qs,base.questionSHA256,'___'),base.expectedChangedQuestions);
assert.deepEqual(Object.entries(ev).filter(([id,x])=>H(x)!==base.evidenceSHA256[id]).map(([id])=>id).sort(),base.expectedChangedEvidence.sort());
for(const f of ['psContent.ts','ProbabilityStatisticsScreen.tsx','PSPracticePanel.tsx']){
 const fpath=prefix+f;const kind=f.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS;
 const tree=ts.createSourceFile(f,loadText(fpath),ts.ScriptTarget.ES2022,true,kind);
 assert.equal(tree.parseDiagnostics.length,0,`parse errors: ${f}`);
}
const filename=fileURLToPath(new URL(prefix+'psContent.ts',root));
const compiled=ts.transpileModule(loadText(prefix+'psContent.ts'),{
 fileName:filename,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true,resolveJsonModule:true}
}).outputText;
const output={};runInNewContext(compiled,{exports:output,module:{exports:output},require:createRequire(filename)},{filename});
assert.equal(Object.keys(output.PS_READER_LESSONS).length,80);
assert.equal(output.PS_BOARD_EXAM_QUESTIONS.length,0);
assert.equal(output.PS_BOARD_EXAM_READY,false);
assert.equal(output.PS_JOINT_BLUEPRINT_FEASIBLE,false);
assert.equal(output.PS_EDITORIAL_PREFLIGHT.sourcePageReadable,80);
assert.equal(output.PS_EDITORIAL_PREFLIGHT.fullLessonPassagesApproved,0);
assert.equal(output.PS_EDITORIAL_PREFLIGHT.conceptualQuestions,41);
assert.equal(output.PS_EDITORIAL_PREFLIGHT.conceptualSMEApproved,0);
assert.deepEqual(blueprint.competencies.map(c=>c.items),[2,5,2,2,4]);
const targets=blueprint.competencies;const slots=targets.flatMap(c=>Array.from({length:c.items},()=>c.id));
const levels=Object.entries(blueprint.cognitiveTargetAcross15).flatMap(([level,n])=>Array.from({length:n},()=>level));
const possible=slots.map((competency,i)=>({id:`ok${i}`,competency,cognitiveLevel:levels[i]}));
assert.equal(output.psCanFillJointBlueprint(possible,targets,blueprint.cognitiveTargetAcross15),true);
assert.equal(output.psCanFillJointBlueprint(possible.slice(1),targets,blueprint.cognitiveTargetAcross15),false);
console.log('PASS: v10.67 source syntax, SHA-256 change control, 80 source-page records and 140 question review records');
console.log('PASS: exact expected changes (2 lessons, 3 locators, 0 questions), all 204 question IDs preserved');
console.log('PASS: assessment remains fail closed; 0 independently approved lessons and 0 qualified questions');
