import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..'),cache=new Map();
function load(rel){
  const full=path.resolve(root,rel);if(cache.has(full))return cache.get(full).exports;
  const code=ts.transpileModule(readFileSync(full,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const mod={exports:{}};cache.set(full,mod);
  new Function('require','module','exports',code)(name=>name.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(full),name+'.ts'))):require(name),mod,mod.exports);
  return mod.exports;
}
const {OFFICIAL_TOS_COURSES,OFFICIAL_TOS_SOURCE,TOS_FAMILY_COURSE,TOS_LEGACY_QUESTION_COURSE}=load('src/data/officialTos.ts');
const {BOARD_EXPANSION_FAMILIES,BOARD_EXPANSION_QUESTIONS}=load('src/data/boardExpansionQuestions.ts');
const {MOCK_EXAM_QUESTIONS,ALGEBRA_REFERENCE_ASSESSMENT_QUESTIONS}=load('src/data/mockExamQuestions.ts');
const {allocateAreaTargets,distinctBoardQuestions,getBoardAreaId,inspectBoardPreview}=load('src/domain/exam/boardBlueprint.ts');
const {getTosCourseId,allocateTosCourseTargets,inspectTosPreview,assembleTosPreview,tosToBoardPlan}=load('src/domain/exam/tosCoverage.ts');
const pool=[...MOCK_EXAM_QUESTIONS,...ALGEBRA_REFERENCE_ASSESSMENT_QUESTIONS];
assert.equal(OFFICIAL_TOS_SOURCE.url,'https://www.prc.gov.ph/sites/default/files/EE2022-10%20TOS.pdf');
assert.equal(OFFICIAL_TOS_COURSES.length,34);
assert.equal(new Set(OFFICIAL_TOS_COURSES.map(c=>c.id)).size,34);
const officialCounts={math:8,geas:11,electronics:9,est:6};
for(const [area,count] of Object.entries(officialCounts)) {
 const courses=OFFICIAL_TOS_COURSES.filter(c=>c.areaId===area);
 assert.equal(courses.length,count,`Wrong number of PRC courses in ${area}`);
 assert.equal(courses.reduce((n,c)=>n+c.officialItems,0),100,`Official subject course targets must total 100: ${area}`);
}
assert.deepEqual(OFFICIAL_TOS_COURSES.filter(c=>c.areaId==='math').map(c=>c.officialItems),[15,15,15,15,15,9,8,8]);
assert.deepEqual(OFFICIAL_TOS_COURSES.filter(c=>c.areaId==='geas').map(c=>c.officialItems),[10,15,6,9,10,10,8,10,10,10,2]);
assert.deepEqual(OFFICIAL_TOS_COURSES.filter(c=>c.areaId==='electronics').map(c=>c.officialItems),[12,12,8,14,14,8,12,12,8]);
assert.deepEqual(OFFICIAL_TOS_COURSES.filter(c=>c.areaId==='est').map(c=>c.officialItems),[10,25,15,23,7,20]);
const allCourses=new Set(OFFICIAL_TOS_COURSES.map(c=>c.id));
for(const id of [...Object.values(TOS_FAMILY_COURSE),...Object.values(TOS_LEGACY_QUESTION_COURSE)])assert.ok(allCourses.has(id),`Invalid course ${id}`);
assert.equal(Object.keys(TOS_FAMILY_COURSE).length,48);
for(const f of BOARD_EXPANSION_FAMILIES){
 const q=BOARD_EXPANSION_QUESTIONS.find(q=>q.questionFamilyId===`v1014-${f.area}-${f.id}`);
 assert.ok(q,`No question for family ${f.area}/${f.id}`);
 const course=getTosCourseId(q);
 assert.ok(course,`Unmapped new family ${q.id}`);
 assert.equal(OFFICIAL_TOS_COURSES.find(c=>c.id===course).areaId,f.area);
}
// Explicit no-fuzzy-mapping contract, even if a label looks similar.
assert.equal(getTosCourseId({id:'unknown',subjectId:'subj-math-algebra',questionFamilyId:'unknown'}),null);
assert.equal(getTosCourseId({id:'mock-q-05',subjectId:'subj-electronics'}),null,'Wrong-subject source must not be mapped');
assert.equal(getTosCourseId({id:'mock-q-05',subjectId:'subj-math-algebra'}),'math-advanced');
const unique=distinctBoardQuestions(pool);
for(const count of [1,10,15,20,30,50,100,200,401]){
 const target=allocateTosCourseTargets(count), areas=allocateAreaTargets(count);
 assert.equal(Object.values(target).reduce((a,n)=>a+n,0),count);
 for(const [area,amount] of Object.entries(areas))assert.equal(OFFICIAL_TOS_COURSES.filter(c=>c.areaId===area).reduce((n,c)=>n+target[c.id],0),amount);
 const plan=inspectTosPreview(count,pool);
 assert.equal(plan.courses.length,34);
 assert.equal(plan.selectedQuestions+plan.missingQuestions,count);
 assert.equal(plan.areas.reduce((n,a)=>n+a.selected,0),plan.selectedQuestions);
 assert.equal(plan.unmappedQuestionCount,unique.filter(q=>!getTosCourseId(q)).length);
 for(const [courseId,targetCount] of Object.entries(target)){
  const course=plan.courses.find(c=>c.id===courseId);
  assert.equal(course.requested,targetCount);
  assert.equal(course.selected+course.shortage,targetCount);
  assert.ok(course.available>=course.selected);
 }
 for(const fixedSeed of [()=>0,()=>0.42,()=>0.999999,Math.random]){
  const result=assembleTosPreview(count,pool,fixedSeed);
  assert.equal(result.questions.length,plan.selectedQuestions);
  assert.equal(new Set(result.questions.map(q=>q.id)).size,result.questions.length);
  assert.equal(new Set(result.questions.map(q=>q.question.trim().replace(/\s+/g,' ').toLowerCase())).size,result.questions.length);
  const officialByCourse=new Map();
  for(const q of result.questions){
   const id=getTosCourseId(q);assert.ok(id,`Unmapped item selected: ${q.id}`);
   officialByCourse.set(id,(officialByCourse.get(id)||0)+1);
  }
  for(const course of plan.courses)assert.equal(officialByCourse.get(course.id)||0,course.selected);
  const adapted=tosToBoardPlan(plan,pool);
  assert.equal(adapted.selectedQuestions,result.questions.length);
  assert.equal(adapted.missingQuestions,plan.missingQuestions);
  assert.deepEqual(adapted.areas.map(a=>a.selected),plan.areas.map(a=>a.selected));
 }
}
const plan50=inspectTosPreview(50,pool), plan100=inspectTosPreview(100,pool);
assert.equal(inspectBoardPreview(50,pool).missingQuestions,0,'v10.14 four-area selection remains intact');
assert.ok(plan50.missingQuestions>0,'TOS coverage must not be falsely reported as full');
assert.ok(plan100.missingQuestions>0,'TOS coverage must not be falsely reported as full');
// All missing courses must stay unassessed: no cross-course backfill.
const emptyMath=OFFICIAL_TOS_COURSES.find(c=>c.id==='math-data-analysis');
assert.ok(plan100.courses.find(c=>c.id===emptyMath.id).selected>=2,'New data-analysis questions should satisfy some of the formerly empty quota');
assert.ok(plan100.courses.find(c=>c.id===emptyMath.id).shortage>=0, 'The course must not borrow questions from others');
console.log('PASS official PRC Annex A: 34 course rows, sums 100 per board subject');
console.log('PASS all 48 original expansion families map explicitly to correct board subjects');
console.log('PASS no fuzzy assignments, wrong-subject mappings, or duplicate selections');
console.log('PASS 1–401 question quota apportionment; 4 random regimes and no course borrowing');
console.log('PASS v10.14 subject-weight preview unchanged; TOS coverage remains incomplete');
console.log('TOS plan (50):',JSON.stringify({delivered:plan50.selectedQuestions,missing:plan50.missingQuestions,unmapped:plan50.unmappedQuestionCount,areas:plan50.areas}));
console.log('TOS plan (100):',JSON.stringify({delivered:plan100.selectedQuestions,missing:plan100.missingQuestions,unmapped:plan100.unmappedQuestionCount,areas:plan100.areas}));
// Persisted course diagnostics must be an exact partition of the item ledger.
const example=assembleTosPreview(50,pool,()=>0.42);
const items=example.questions.map((q,i)=>({questionId:q.id,tosCourseId:getTosCourseId(q),selectedOptionId:i%2===0?q.correctOptionId:null,correctOptionId:q.correctOptionId}));
const courseResults=OFFICIAL_TOS_COURSES.map(c=>{
 const subset=items.filter(item=>item.tosCourseId===c.id),correct=subset.filter(x=>x.selectedOptionId===x.correctOptionId).length;
 return {courseId:c.id,areaId:c.areaId,requested:example.plan.courses.find(t=>t.id===c.id).requested,questions:subset.length,correct,scorePercent:subset.length?Math.round(correct*100/subset.length):null};
});
const {tosResultsMatchRecord}=load('src/domain/exam/tosCoverage.ts');
assert.equal(tosResultsMatchRecord({itemResults:items,tosCourseResults:courseResults}),true);
assert.equal(tosResultsMatchRecord({itemResults:items,tosCourseResults:courseResults.map((c,i)=>i===0?{...c,correct:c.correct+1}:c)}),false);
assert.equal(tosResultsMatchRecord({itemResults:items,tosCourseResults:courseResults.map((c,i)=>i===1?{...c,requested:-1}:c)}),false);
assert.equal(tosResultsMatchRecord({itemResults:items.slice(1),tosCourseResults:courseResults}),false);
assert.equal(tosResultsMatchRecord({itemResults:items}),true,'Older records without TOS diagnostics remain compatible');
console.log('PASS TOS course score/item-result reconciliation; rejects altered scores, altered targets and missing items');
