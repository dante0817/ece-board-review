/** v10.64 editorial corrections, release gate, source evidence and UI syntax.
    Passage-level SME and full React build remain outside this source-level validator. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {runInNewContext} from 'node:vm';
import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url);
let ts;
try{ts=require('typescript');}catch{ts=require(execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim()+'/typescript');}
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const json=path=>JSON.parse(read(path));
const p='src/features/probability-statistics/';
const mods=json(p+'psModules.json'),lessons=json(p+'psLessons.json'),qs=json(p+'psQuestions.json');
const evidence=json(p+'psLessonEvidence.json'),review=json(p+'psQuestionReview.json'),blueprint=json(p+'psAssessmentBlueprint.json');
const pkg=json('package.json'),lock=json('package-lock.json');
assert.equal(pkg.version,'10.64.0');assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
assert.equal(mods.length,8);assert.equal(lessons.length,80);assert.equal(qs.length,204);
assert.equal(Object.keys(evidence).length,80);assert.equal(Object.keys(review).length,140);
const uniq=(xs,name)=>assert.equal(new Set(xs).size,xs.length,`Duplicate ${name}`);
uniq(mods.map(m=>m.id),'modules');uniq(lessons.map(l=>l.id),'lessons');uniq(qs.map(q=>q.id),'questions');
const lid=new Set(lessons.map(x=>x.id));const active=qs.filter(q=>!q.guidedOnly),guided=qs.filter(q=>q.guidedOnly);
assert.equal(active.length,140);assert.equal(guided.length,64);
assert.equal(active.filter(x=>x.kind==='calculation').length,99);assert.equal(active.filter(x=>x.kind==='concept').length,41);
for(const l of lessons){
 assert.equal(l.status,'draft');assert(lid.has(l.id));
 const e=evidence[l.id];assert(e&&e.evidenceLevel==='table-of-contents-only'&&e.passageVerified===false);
 assert(e.source&&e.sectionTitle&&e.section&&Number.isInteger(e.pdfPage)&&e.pdfPage>0);
}
for(const q of active){
 assert(q.topicId in evidence && q.assessmentEligible===false && q.reviewStatus==='editorial-pending');
 const e=review[q.id];assert(e&&e.lessonId===q.topicId&&e.competency===evidence[q.topicId].competency);
 for(const flag of ['expertApproved','independentEditorialSignoff','statisticalModelVerified','answerAndDistractorsVerified','passageVerified'])assert.equal(e[flag],false,q.id+' '+flag);
 assert.equal(e.approvedCognitiveLevel,null);assert(e.provisionalCognitiveLevel.includes('provisional'));
}
assert(guided.every(q=>q.assessmentEligible===false));
assert.deepEqual(blueprint.competencies.map(c=>[c.id,c.items]),[['5.1',2],['5.2',5],['5.3',2],['5.4',2],['5.5',4]]);
assert.deepEqual(blueprint.cognitiveTargetAcross15,{knowledge:2,comprehension:3,application:6,analysis:4});
const mean=qs.find(q=>q.id==='PS01-02-P01');assert(mean.prompt.includes('arithmetic mean'));assert.equal(mean.correctIndex,1);assert.equal(mean.auditExpected,7);
const parallel=qs.find(q=>q.id==='PS03-04-P01');assert(parallel.prompt.includes('independent parallel'));assert.equal(parallel.auditExpected,0.99);assert.equal(parallel.correctIndex,2);
const content=read(p+'psContent.ts'),screen=read(p+'ProbabilityStatisticsScreen.tsx'),panel=read(p+'PSPracticePanel.tsx');
for(const fragment of ['review.expertApproved === true','review.passageVerified === true','review.approvedCognitiveLevel','PS_READINESS_PREFLIGHT','PS_COGNITIVE_PREFLIGHT','PS_BOARD_EXAM_QUESTIONS'])assert(content.includes(fragment),fragment);
assert(screen.includes('ps-readiness-panel')&&screen.includes('Review status'));
assert(panel.includes('PS_QUESTION_REVIEW')&&panel.includes('PS_PRACTICE_QUESTIONS'));
for(const f of ['psContent.ts','PSPracticePanel.tsx','ProbabilityStatisticsScreen.tsx']){
 const src=read(p+f);
 const parsed=ts.createSourceFile(f,src,ts.ScriptTarget.ES2022,true,f.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 assert.equal(parsed.parseDiagnostics.length,0,f+': '+parsed.parseDiagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')).join('; '));
 const result=ts.transpileModule(src,{fileName:f,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true});
 assert(!(result.diagnostics??[]).some(x=>x.category===ts.DiagnosticCategory.Error),f);
}
// Execute the ACTUAL psContent.ts with JSON imports (without requiring React/Vite).
// This guards against a code-level accidentally opened examination pool.
const contentPath=fileURLToPath(new URL('../'+p+'psContent.ts',import.meta.url));
const executed={};
const runtime=ts.transpileModule(content,{fileName:contentPath,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true,resolveJsonModule:true}}).outputText;
runInNewContext(runtime,{exports:executed,module:{exports:executed},require:createRequire(contentPath)},{filename:contentPath});
assert.equal(executed.PS_BOARD_EXAM_QUESTIONS.length,0);
assert.equal(Object.keys(executed.PS_READER_LESSONS).length,80);
assert.equal(executed.PS_BOARD_EXAM_READY,false);
assert.deepEqual(Array.from(executed.PS_READINESS_PREFLIGHT,x=>x.missing),[2,5,2,2,4]);
assert.deepEqual(Array.from(executed.PS_COGNITIVE_PREFLIGHT,x=>x.missing),[2,3,6,4]);
// A question must NEVER be selectable for graded PRC exams on the basis of an unapproved provisional mapping.
const approved=active.filter(q=>{
 const e=review[q.id];
 return q.assessmentEligible===true&&e.relationship==='Direct'&&e.expertApproved&&e.independentEditorialSignoff&&e.statisticalModelVerified&&e.answerAndDistractorsVerified&&e.passageVerified&&e.approvedCognitiveLevel!==null;
});
assert.equal(approved.length,0);
console.log('PASS v10.64 Node/TypeScript syntax and integrity: 80 lesson evidence records, 140 review records, PRC quota/cognitive preflight, 0 approved exams.');
