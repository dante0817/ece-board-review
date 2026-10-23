/** v10.69 content certification-integrity gate checks. No external packages required
 * beyond TypeScript already installed globally for syntax transpilation.
 * These tests do NOT certify any lesson, conceptual answer, or statistical model. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {runInNewContext} from 'node:vm';
import {createHash} from 'node:crypto';
import {TextEncoder} from 'node:util';
const root=new URL('../',import.meta.url);
const txt=f=>readFileSync(new URL(f,root),'utf8');
const data=f=>JSON.parse(txt(f));
const pref='src/features/probability-statistics/';
const lessons=data(pref+'psLessons.json'),questions=data(pref+'psQuestions.json');
const evidence=data(pref+'psLessonEvidence.json'),review=data(pref+'psQuestionReview.json');
const blueprint=data(pref+'psAssessmentBlueprint.json');
const pkg=data('package.json'),lock=data('package-lock.json');
const base=data('scripts/psBaselineV10690.json');
assert.equal(pkg.version,'10.69.0');assert.equal(lock.version,'10.69.0');assert.equal(lock.packages[''].version,'10.69.0');
assert.equal(base.baselineVersion,'10.68.0');
assert.equal(lessons.length,80);assert.equal(questions.length,204);
const independent=questions.filter(q=>!q.guidedOnly);
assert.equal(independent.length,140);assert.equal(questions.filter(q=>q.guidedOnly).length,64);
assert.equal(independent.filter(q=>q.kind==='calculation').length,99);
assert.equal(independent.filter(q=>q.kind==='concept').length,41);
const canon=o=>Array.isArray(o)?o.map(canon):o&&typeof o==='object'?Object.fromEntries(Object.keys(o).sort().map(k=>[k,canon(o[k])])):o;
const sha=s=>createHash('sha256').update(s).digest('hex');
const hash=o=>sha(JSON.stringify(canon(o)));
assert.deepEqual(Object.keys(base.lessonHashes).sort(),lessons.map(l=>l.id).sort());
assert.deepEqual(Object.keys(base.questionHashes).sort(),questions.map(q=>q.id).sort());
for(const l of lessons){assert.equal(hash(l),base.lessonHashes[l.id],`lesson altered: ${l.id}`);assert.equal(l.status,'draft');}
for(const q of questions){assert.equal(hash(q),base.questionHashes[q.id],`question altered: ${q.id}`);assert.equal(q.assessmentEligible,false);}
assert.deepEqual(Object.keys(review).sort(),independent.map(q=>q.id).sort());
assert.deepEqual(Object.keys(evidence).sort(),lessons.map(l=>l.id).sort());
const require=createRequire(import.meta.url);
let ts;try{ts=require('typescript')}catch{ts=require(execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim()+'/typescript')}
for(const f of ['psContent.ts','ProbabilityStatisticsScreen.tsx','PSPracticePanel.tsx']){
 const ast=ts.createSourceFile(f,txt(pref+f),ts.ScriptTarget.ES2022,true,f.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 assert.equal(ast.parseDiagnostics.length,0,`syntax error ${f}: ${ast.parseDiagnostics.map(d=>d.messageText)}`);
}
const filename=fileURLToPath(new URL(pref+'psContent.ts',root));
const js=ts.transpileModule(txt(pref+'psContent.ts'),{fileName:filename,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true,resolveJsonModule:true}}).outputText;
const output={};
runInNewContext(js,{exports:output,module:{exports:output},require:createRequire(filename),TextEncoder,Uint8Array,Uint32Array,BigInt},{filename});
const shaCases=['','abc','ä 🛰 中文','x'.repeat(65),'αβγ'.repeat(30)];
for(const value of shaCases)assert.equal(output.psSha256(value),sha(value),`SHA mismatch: ${value.slice(0,20)}`);
// Compare every manifest entry against the actual executable TypeScript digest function.
for(const q of independent){
 assert.equal(review[q.id].questionSHA256,output.psQuestionReviewDigest(q),q.id);
 assert.match(review[q.id].questionSHA256,/^[a-f0-9]{64}$/);
}
for(const l of lessons){
 assert.equal(evidence[l.id].lessonSHA256,output.psLessonReviewDigest(l),l.id);
 assert.match(evidence[l.id].lessonSHA256,/^[a-f0-9]{64}$/);
 assert.equal(evidence[l.id].passageVerified,false);
}
assert.equal(output.PS_BOARD_EXAM_QUESTIONS.length,0);
assert.equal(output.PS_BOARD_EXAM_READY,false);
assert.equal(output.PS_BOARD_EXAM_SELECTION_IDS,null);
assert.equal(Object.keys(output.PS_READER_LESSONS).length,80);
// Positive-control: permitted only when every approval field, evidence relation and both digests match.
const candidate=output.PS_PRACTICE_QUESTIONS.find(q=>output.PS_QUESTION_REVIEW[q.id].relationship==='Direct'&&output.PS_LESSON_EVIDENCE[q.topicId]?.relationship==='Direct');
assert(candidate,'need a direct-compentency positive-control candidate');
const rr=output.PS_QUESTION_REVIEW[candidate.id],ee=output.PS_LESSON_EVIDENCE[candidate.topicId];
assert.equal(output.psIsBoardExamEligible(candidate),false);
const original={eligible:candidate.assessmentEligible,questionStatus:candidate.reviewStatus,reviewStatus:rr.reviewStatus,evidenceLevel:ee.evidenceLevel,expert:rr.expertApproved,signoff:rr.independentEditorialSignoff,model:rr.statisticalModelVerified,answers:rr.answerAndDistractorsVerified,passage:rr.passageVerified,level:rr.approvedCognitiveLevel,evidence:ee.passageVerified};
candidate.assessmentEligible=true;candidate.reviewStatus='approved';rr.reviewStatus='approved';ee.evidenceLevel='passage-verified';rr.expertApproved=true;rr.independentEditorialSignoff=true;rr.statisticalModelVerified=true;rr.answerAndDistractorsVerified=true;rr.passageVerified=true;rr.approvedCognitiveLevel='application';ee.passageVerified=true;
assert.equal(output.psIsBoardExamEligible(candidate),true,'positive control should be eligible only with every required field');
const origPrompt=candidate.prompt;candidate.prompt+=' (unreviewed addition)';assert.equal(output.psIsBoardExamEligible(candidate),false,'edited stem must revoke eligibility');candidate.prompt=origPrompt;
const origOption=candidate.options[0];candidate.options[0]+=' changed';assert.equal(output.psIsBoardExamEligible(candidate),false,'edited answer option must revoke eligibility');candidate.options[0]=origOption;
const origIndex=candidate.correctIndex;candidate.correctIndex=(origIndex+1)%4;assert.equal(output.psIsBoardExamEligible(candidate),false,'edited key must revoke eligibility');candidate.correctIndex=origIndex;
const lesson=output.PS_LESSONS.find(l=>l.id===candidate.topicId);const origConcept=lesson.concept;lesson.concept+=' changed';assert.equal(output.psIsBoardExamEligible(candidate),false,'edited lesson must revoke eligibility');lesson.concept=origConcept;
const savedQuestionStatus=candidate.reviewStatus;candidate.reviewStatus='editorial-pending';assert.equal(output.psIsBoardExamEligible(candidate),false,'pending item status must fail');candidate.reviewStatus=savedQuestionStatus;
const savedReviewStatus=rr.reviewStatus;rr.reviewStatus='editorial-pending';assert.equal(output.psIsBoardExamEligible(candidate),false,'pending review status must fail');rr.reviewStatus=savedReviewStatus;
const origTag=rr.lessonId;rr.lessonId='PS99-99';assert.equal(output.psIsBoardExamEligible(candidate),false,'wrong lesson linkage');rr.lessonId=origTag;
const origComp=rr.competency;rr.competency='5.5';assert.equal(output.psIsBoardExamEligible(candidate),false,'wrong competency linkage');rr.competency=origComp;
rr.expertApproved=false;assert.equal(output.psIsBoardExamEligible(candidate),false,'missing review approval');
candidate.assessmentEligible=original.eligible;candidate.reviewStatus=original.questionStatus;rr.reviewStatus=original.reviewStatus;ee.evidenceLevel=original.evidenceLevel;rr.expertApproved=original.expert;rr.independentEditorialSignoff=original.signoff;rr.statisticalModelVerified=original.model;rr.answerAndDistractorsVerified=original.answers;rr.passageVerified=original.passage;rr.approvedCognitiveLevel=original.level;ee.passageVerified=original.evidence;
// Blueprint can be fulfilled only by 15 DISTINCT question IDs with correct joint margins.
assert.deepEqual(blueprint.competencies.map(c=>c.items),[2,5,2,2,4]);
assert.deepEqual(blueprint.cognitiveTargetAcross15,{knowledge:2,comprehension:3,application:6,analysis:4});
const cognitive=Object.entries(blueprint.cognitiveTargetAcross15).flatMap(([level,n])=>Array(n).fill(level));
let k=0;
const sample=blueprint.competencies.flatMap(c=>Array.from({length:c.items},(_,i)=>({id:`${c.id}-${i}`,competency:c.id,cognitiveLevel:cognitive[k++]})));
const pick=output.psSelectJointBlueprintIds(sample,blueprint.competencies,blueprint.cognitiveTargetAcross15);
assert(pick&&pick.length===15&&new Set(pick).size===15,'must select exactly 15 distinct approved candidates');
assert.equal(output.psCanFillJointBlueprint(sample,blueprint.competencies,blueprint.cognitiveTargetAcross15),true);
const oversized=[...sample,{id:'extra-z',competency:'5.1',cognitiveLevel:'knowledge'},{id:'extra-a',competency:'5.5',cognitiveLevel:'analysis'}];
assert.equal(output.psSelectJointBlueprintIds(oversized,blueprint.competencies,blueprint.cognitiveTargetAcross15).length,15,'extra candidates must not exceed blueprint');
assert.equal(output.psSelectJointBlueprintIds([...sample].reverse(),blueprint.competencies,blueprint.cognitiveTargetAcross15).join(','),pick.join(','),'deterministic regardless of input order');
assert.equal(output.psSelectJointBlueprintIds(sample.slice(1),blueprint.competencies,blueprint.cognitiveTargetAcross15),null,'insufficient candidates must fail');
assert.equal(output.psSelectJointBlueprintIds([...sample,sample[0]],blueprint.competencies,blueprint.cognitiveTargetAcross15),null,'duplicate IDs must fail');
assert.equal(output.psSelectJointBlueprintIds(sample.map((s,i)=>({...s,cognitiveLevel:i%2===0?'knowledge':'analysis'})),blueprint.competencies,blueprint.cognitiveTargetAcross15),null,'margins mismatch must fail');
assert.equal(output.psSelectJointBlueprintIds(sample.map(s=>({...s,competency:'5.1'})),blueprint.competencies,blueprint.cognitiveTargetAcross15),null,'competency quota must fail');
// Approved-axis margins could appear sufficient, but joint assignment is infeasible.
const impossible=[{id:'a',competency:'A',cognitiveLevel:'X'},{id:'b',competency:'A',cognitiveLevel:'X'},{id:'c',competency:'B',cognitiveLevel:'Y'},{id:'d',competency:'B',cognitiveLevel:'Y'}];
assert.equal(output.psSelectJointBlueprintIds(impossible,[{id:'A',items:1},{id:'B',items:3}],{X:2,Y:2}),null);
console.log('PASS v10.69: all 80 lessons / 204 questions exactly preserved from v10.68');
console.log('PASS v10.69: 220 content SHA256 fingerprints match, tamper and stale-signoff checks pass');
console.log('PASS v10.69: exact 15-item joint PRC selector feasible/infeasible/deterministic tests pass');
console.log('PASS v10.69: all 140 independent items remain developmental and scored pool is empty');
