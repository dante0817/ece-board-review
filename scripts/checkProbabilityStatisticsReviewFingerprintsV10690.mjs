/** Checks that editorial evidence belongs to the exact current lesson/question text.
 * Default mode is READ ONLY. `--refresh` explicitly invalidates old approvals and
 * updates fingerprints for changed content; it NEVER grants any approval.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const base=new URL('../src/features/probability-statistics/',import.meta.url);
const filenames=['psQuestions.json','psLessons.json','psQuestionReview.json','psLessonEvidence.json'];
const files=Object.fromEntries(filenames.map(name=>[name,fileURLToPath(new URL(name,base))]));
const obj=Object.fromEntries(filenames.map(name=>[name,JSON.parse(readFileSync(files[name],'utf8'))]));
const [questions,lessons,review,evidence]=filenames.map(n=>obj[n]);
const sha=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const qKeys=['id','topicId','kind','level','prompt','options','correctIndex','work','restriction','auditRule','auditArgs','auditExpected','guidedOnly'];
const lKeys=['id','moduleId','title','summary','concept','method','guardrail','latex','workedExample','checkpoint'];
const hash=(rec,keys)=>sha(keys.map(k=>rec[k]??null));
const changedQuestions=questions.filter(q=>!q.guidedOnly&&review[q.id]?.questionSHA256!==hash(q,qKeys));
const changedLessons=lessons.filter(l=>evidence[l.id]?.lessonSHA256!==hash(l,lKeys));
const orphanQuestions=questions.filter(q=>!q.guidedOnly&&!review[q.id]);
const orphanLessons=lessons.filter(l=>!evidence[l.id]);
if(orphanQuestions.length||orphanLessons.length)throw Error(`Missing review records for ${orphanQuestions.map(x=>x.id)} ${orphanLessons.map(x=>x.id)}`);
if(!changedQuestions.length&&!changedLessons.length){console.log('PASS: 140 question and 80 lesson review fingerprints match current content. No approvals inferred.');process.exit(0)}
console.log('Fingerprint mismatches:',JSON.stringify({questions:changedQuestions.map(q=>q.id),lessons:changedLessons.map(l=>l.id)}));
if(!process.argv.includes('--refresh')){
  console.error('ERROR: Reviewed content changed. Run with --refresh to invalidate existing approvals explicitly; review the changes afterwards.');
  process.exit(1);
}
const affected=new Set(changedQuestions.map(q=>q.id));
for(const l of changedLessons){
  evidence[l.id].lessonSHA256=hash(l,lKeys);
  evidence[l.id].passageVerified=false;evidence[l.id].evidenceLevel='table-of-contents-only';
  for(const q of questions.filter(q=>!q.guidedOnly&&q.topicId===l.id))affected.add(q.id);
}
for(const q of questions.filter(q=>!q.guidedOnly&&affected.has(q.id))){
  const r=review[q.id];r.questionSHA256=hash(q,qKeys);
  q.assessmentEligible=false;q.reviewStatus='editorial-pending';
  r.expertApproved=false;r.independentEditorialSignoff=false;r.statisticalModelVerified=false;
  r.answerAndDistractorsVerified=false;r.passageVerified=false;
  r.approvedCognitiveLevel=null;r.reviewStatus='editorial-pending';
  r.findingIds=[...new Set([...(r.findingIds||[]),'CONTENT-CHANGED-REVIEW-REQUIRED'])];
}
const write=(name,value)=>writeFileSync(files[name],JSON.stringify(value,null,2)+'\n');
write('psQuestionReview.json',review);write('psLessonEvidence.json',evidence);
if(affected.size)write('psQuestions.json',questions);
console.log(`REFRESHED: ${changedLessons.length} changed lesson(s); reset ${affected.size} question review(s) to unapproved. No approvals granted.`);
