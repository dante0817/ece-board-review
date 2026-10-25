import fs from 'node:fs';
import assert from 'node:assert/strict';

const content=fs.readFileSync('src/features/calculus/calculusContent.ts','utf8');
const bank=fs.readFileSync('src/features/calculus/calculusQuestions.ts','utf8');
const readArray=(source,left,right)=>JSON.parse(source.split(left)[1]?.split(right)[0]?.trim()??'null');
const modules=readArray(content,'export const CALCULUS_MODULES:CalculusModule[]=',';\nexport const CALCULUS_BLUEPRINT=');
const lessons=readArray(content,'const raw:RawLesson[]=',';\nexport const CALCULUS_LESSONS:');
const questions=readArray(bank,'export const CALCULUS_QUESTIONS:CalculusQuestion[]=',';\nexport const CALCULUS_QUESTION_COUNTS=');
assert.equal(modules?.length,10,'ten distinct PRC syllabus groups required');
assert.equal(new Set(modules.map(m=>m.id)).size,10,'duplicate module IDs');
assert.equal(modules.filter(m=>m.subject==='differential').reduce((n,m)=>n+m.items,0),15);
assert.equal(modules.filter(m=>m.subject==='integral').reduce((n,m)=>n+m.items,0),15);
assert.equal(lessons?.length,20,'twenty originally authored draft lessons expected');
assert.equal(new Set(lessons.map(l=>l.id)).size,20,'duplicate lesson IDs');
for(const lesson of lessons){
 const m=modules.find(m=>lesson.id.startsWith(m.id.toLowerCase()+'-'));
 assert.ok(m,'lesson assigned to a recognized module: '+lesson.id);
 for(const f of ['title','summary','definition','formula','condition','problem','strategy','check','checkpoint','answer','explanation'])
  assert.ok(typeof lesson[f]==='string'&&lesson[f].trim().length>0,'missing '+f+' in '+lesson.id);
 assert.ok(lesson.steps.length>=2,'worked solution must have multiple steps: '+lesson.id);
}
assert.equal(questions?.length,90,'ninety original practice variants expected');
assert.equal(new Set(questions.map(q=>q.id)).size,90,'duplicate question IDs');
for(const m of modules) {
 assert.equal(lessons.filter(l=>l.id.startsWith(m.id.toLowerCase()+'-')).length,2,'two authored draft lessons per module: '+m.id);
 assert.equal(questions.filter(q=>q.moduleId===m.id).length,9,'nine practice variants per module: '+m.id);
}
for(const q of questions){
 assert.ok(modules.some(m=>m.id===q.moduleId),'unrecognized question module');
 assert.equal(q.reviewStatus,'draft','unapproved question must remain draft');
 assert.equal(q.sourceType,'original');
 assert.equal(q.options.length,4);
 assert.equal(new Set(q.options).size,4,'duplicate choices: '+q.id);
 assert.ok(Number.isInteger(q.correctIndex)&&q.correctIndex>=0&&q.correctIndex<4,'invalid key: '+q.id);
 assert.ok(q.explanation.length>15,'missing solution: '+q.id);
}
assert.match(bank,/CALCULUS_EXAM_READY=false/,'unverified items must not enter certified exam');
assert.match(bank,/CALCULUS_APPROVED_EXAM_QUESTION_IDS:readonly string\[\]=\[\]/,'approved pool must remain empty');
console.log('PASS: 10 modules, 20 draft lessons, 90 distinct original practice variants, 0 certified exam items.');
console.log('NOTICE: structural validation does NOT certify mathematical correctness or browser/build integrity.');
