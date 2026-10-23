/** v10.68.0 syntax, content change control, evidence scope, and fail-closed PRC exam checks.
 * This test does not certify statistical expertise or a production build. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {runInNewContext} from 'node:vm';
import crypto from 'node:crypto';
const root=new URL('../',import.meta.url);
const get=f=>readFileSync(new URL(f,root),'utf8');
const load=f=>JSON.parse(get(f));
const pref='src/features/probability-statistics/';
const lessons=load(pref+'psLessons.json'), questions=load(pref+'psQuestions.json');
const ev=load(pref+'psLessonEvidence.json'),qr=load(pref+'psQuestionReview.json');
const sect=load(pref+'psV10680SectionEvidence.json'), concepts=load(pref+'psV10680PreliminaryConceptReview.json');
const old=load('scripts/psBaselineV10680.json');
const pkg=load('package.json'), lock=load('package-lock.json');
assert.equal(pkg.version,'10.68.0');assert.equal(lock.version,'10.68.0');assert.equal(lock.packages[''].version,'10.68.0');
assert.equal(old.baselineVersion,'10.67.0');
assert.equal(lessons.length,80);assert.equal(questions.length,204);
assert.equal(questions.filter(q=>q.guidedOnly).length,64);
const independent=questions.filter(q=>!q.guidedOnly);assert.equal(independent.length,140);
assert.equal(independent.filter(q=>q.kind==='calculation').length,99);
assert.equal(independent.filter(q=>q.kind==='concept').length,41);
const uniq=arr=>assert.equal(new Set(arr).size,arr.length);
uniq(lessons.map(l=>l.id));uniq(questions.map(q=>q.id));
const canon=x=>Array.isArray(x)?x.map(canon):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canon(x[k])])):x;
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(canon(x))).digest('hex');
const diffs=(arr,dict)=>arr.filter(x=>hash(x)!==dict[x.id]).map(x=>x.id).sort();
assert.deepEqual(Object.keys(old.lessonHashes).sort(),lessons.map(l=>l.id).sort());
assert.deepEqual(Object.keys(old.questionHashes).sort(),questions.map(q=>q.id).sort());
assert.deepEqual(diffs(lessons,old.lessonHashes),[]);
const changed=['PS02-01-P02','PS02-04-P02','PS06-01-P01','PS08-03-P01','PS08-08-P01'];
assert.deepEqual(diffs(questions,old.questionHashes),changed.sort());
assert.deepEqual(Object.entries(ev).filter(([k,v])=>hash(v)!==old.evidenceHashes[k]).map(x=>x[0]),[]);
assert.deepEqual(Object.keys(sect).sort(),lessons.map(l=>l.id).sort());
assert.deepEqual(Object.keys(qr).sort(),independent.map(q=>q.id).sort());
for(const l of lessons){
 assert.equal(l.status,'draft');
 assert(l.concept?.length>20&&l.method?.length>20&&l.latex?.length>=7&&l.guardrail?.length>15);
 const s=sect[l.id];assert.equal(s.page1Based,ev[l.id].pdfPage);
 assert.equal(s.sectionLocator,ev[l.id].section);
 assert.equal(s.sectionTitle,ev[l.id].sectionTitle);
 assert.equal(s.localSectionTopicCorroborated,true);
 assert.equal(s.extractablePageText,true);
 assert.equal(s.entireLessonPassageApproved,false);
 assert.equal(s.workedExampleApproved,false);
 assert.equal(s.independentQualifiedSignoff,false);
 assert.equal(ev[l.id].passageVerified,false);
}
assert.equal(concepts.length,41);
assert.deepEqual(concepts.map(x=>x.id).sort(),independent.filter(q=>q.kind==='concept').map(q=>q.id).sort());
for(const c of concepts){
 const q=independent.find(q=>q.id===c.id);
 assert.equal(c.promptSHA256,crypto.createHash('sha256').update(q.prompt).digest('hex'));
 assert.equal(c.answerKey,q.options[q.correctIndex]);
 assert.equal(c.qualifiedExpertApproved,false);
 assert.equal(c.scoredExamEligible,false);
 assert.equal(c.textbookPassageVerified,false);
}
for(const q of questions){
 assert.equal(q.assessmentEligible,false);
 assert.equal(q.options.length,4);
 uniq(q.options);
 assert(q.correctIndex>=0 && q.correctIndex<4);
 if(!q.guidedOnly){const r=qr[q.id];
   assert(r&&!r.expertApproved&&!r.independentEditorialSignoff&&!r.statisticalModelVerified&&!r.answerAndDistractorsVerified&&!r.passageVerified&&r.approvedCognitiveLevel===null);
 }
}
assert(questions.find(q=>q.id==='PS08-03-P01').prompt.includes('additive'));
assert(questions.find(q=>q.id==='PS08-08-P01').prompt.includes('additive'));
assert(questions.find(q=>q.id==='PS02-04-P02').prompt.includes('freely configurable'));
assert(questions.find(q=>q.id==='PS06-01-P01').prompt.includes('0.05'));
const require=createRequire(import.meta.url);
let ts;try{ts=require('typescript');}catch{ts=require(execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim()+'/typescript');}
for(const f of ['psContent.ts','ProbabilityStatisticsScreen.tsx','PSPracticePanel.tsx']){
 const path=pref+f; const a=ts.createSourceFile(f,get(path),ts.ScriptTarget.ES2022,true,f.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 assert.equal(a.parseDiagnostics.length,0,`TS syntax error ${f}`);
}
const filename=fileURLToPath(new URL(pref+'psContent.ts',root));
const compiled=ts.transpileModule(get(pref+'psContent.ts'),{fileName:filename,
 compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true,resolveJsonModule:true}}).outputText;
const output={};runInNewContext(compiled,{exports:output,module:{exports:output},require:createRequire(filename)},{filename});
assert.equal(Object.keys(output.PS_READER_LESSONS).length,80);
assert(output.PS_READER_LESSONS['PS08-03'].sections[1].blocks.some(b=>b.type==='worked-example'));
for(const l of lessons){
 const actual=output.PS_READER_LESSONS[l.id];
 assert(actual&&actual.sections.length===3,l.id);
 const checkpoint=actual.sections[2].blocks[0];
 assert.equal(checkpoint.type,'checkpoint');assert(checkpoint.prompt&&checkpoint.answer,l.id);
}
assert.equal(output.PS_PRACTICE_QUESTIONS.length,140);
assert.equal(output.PS_GUIDED_QUESTIONS.length,64);
assert.equal(output.PS_BOARD_EXAM_QUESTIONS.length,0);
assert.equal(output.PS_BOARD_EXAM_READY,false);
assert.equal(output.PS_JOINT_BLUEPRINT_FEASIBLE,false);
assert.equal(output.PS_EDITORIAL_PREFLIGHT.fullLessonPassagesApproved,0);
assert.equal(output.PS_PRELIMINARY_CONCEPT_REVIEW.length,41);
assert.equal(Object.keys(output.PS_SOURCE_SECTION_EVIDENCE).length,80);
const counts=output.PS_BLUEPRINT.competencies.map(x=>x.items);assert.deepEqual(counts,[2,5,2,2,4]);
assert.equal(output.psCanFillJointBlueprint([],output.PS_BLUEPRINT.competencies,output.PS_BLUEPRINT.cognitiveTargetAcross15),false);
// A favorable quota margin on each axis is insufficient when cells cannot jointly match.
const candidates=output.PS_BLUEPRINT.competencies.flatMap((c,i)=>Array.from({length:c.items},(_,j)=>({id:`${i}-${j}`,competency:c.id,cognitiveLevel:i%2===0?'knowledge':'analysis'})));
assert.equal(output.psCanFillJointBlueprint(candidates,output.PS_BLUEPRINT.competencies,output.PS_BLUEPRINT.cognitiveTargetAcross15),false);
console.log('PASS v10.68 content, syntax, 80 lesson-reader and 140 independent question records');
console.log('PASS 41 provisional conceptual reviews, 80 local PDF section corroborations; 0 expert signoffs');
console.log('PASS 5 controlled stem/assumption clarifications; old lesson/evidence records unchanged');
console.log('PASS PRC exam gate fails closed; no questions enter scored pool');
