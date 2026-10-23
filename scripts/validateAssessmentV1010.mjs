import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..');const cache=new Map();
const load=rel=>{
  const full=path.resolve(root,rel);if(cache.has(full))return cache.get(full).exports;
  const content=readFileSync(full,'utf8');
  const code=ts.transpileModule(content,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const mod={exports:{}};cache.set(full,mod);
  new Function('require','module','exports',code)(name=>name.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(full),name+'.ts'))):require(name),mod,mod.exports);
  return mod.exports;
};
const {shuffledOptionIds,orderedChoices,buildOptionOrders}=load('src/domain/assessment/optionOrder.ts');
const {gradeResponses}=load('src/domain/assessment/grading.ts');
const {classifyEvidence}=load('src/domain/assessment/evidence.ts');
const {previewLearnerImport,exportLearnerArchive,restoreLearnerArchive}=load('src/utils/learnerBackup.ts');
const {migrateLearnerV109,LEARNER_SCHEMA}=load('src/utils/learnerMigration.ts');
const items=Array.from({length:8},(_,i)=>({questionId:`q${i}`,topicId:i===0?'weak':'strong',subjectId:'math',correctOptionId:'C',options:[{id:'A',text:'one'},{id:'B',text:'two'},{id:'C',text:'three'},{id:'D',text:'four'}]}));
const answers=Object.fromEntries(items.map((q,i)=>[q.questionId,i===0?'B':'C']));
for(let j=0;j<40;j++){
 const orders=buildOptionOrders(items.map(q=>({id:q.questionId,options:q.options})));
 const {grade,results}=gradeResponses(items,answers,orders);
 assert.equal(grade.questions,8);assert.equal(grade.correct,7);assert.equal(grade.incorrect,1);assert.equal(grade.scorePercent,88);
 assert.equal(results.find(r=>r.topicId==='weak').selectedOptionId,'B');
 for(const item of items)assert.deepEqual(orderedChoices(item.options,orders[item.questionId]).map(q=>q.id),orders[item.questionId]);
}
assert.deepEqual(shuffledOptionIds(items[0].options,true),['A','B','C','D']);
assert.throws(()=>gradeResponses(items,{},{}),/Invalid option order/);
assert.throws(()=>gradeResponses(items,{q0:'NOT_AN_OPTION'},buildOptionOrders(items.map(q=>({id:q.questionId,options:q.options})))),/Unknown selected/);
assert.throws(()=>gradeResponses([...items,items[0]],answers,buildOptionOrders(items.map(q=>({id:q.questionId,options:q.options})))),/unique/);
const strict={provenance:'automatic',assessmentMode:'strict',assistanceUsed:false,pausedSeconds:0,selfAttested:true,questions:1,itemResults:[{questionId:'x'}]};
assert.equal(classifyEvidence(strict),'strict-self-attested');
assert.equal(classifyEvidence({...strict,assistanceUsed:true}),'study-assisted');
assert.equal(classifyEvidence({...strict,pausedSeconds:2}),'study-assisted');
assert.equal(classifyEvidence({...strict,provenance:'manual'}),'manual-reported');
assert.equal(classifyEvidence({...strict,provenance:'legacy'}),'legacy-unverified');
const memoryStore=()=>{const db=new Map();return {
 get length(){return db.size;},key:i=>[...db.keys()][i]??null,getItem:k=>db.get(k)??null,
 setItem:(k,v)=>db.set(k,String(v)),removeItem:k=>db.delete(k),dump:()=>Object.fromEntries(db)
};};
const store=memoryStore();
assert.equal(migrateLearnerV109(store),'fresh');assert.equal(store.getItem(LEARNER_SCHEMA),'10.10');
store.setItem('ece_board_review_tests_v3',JSON.stringify([{id:'legacy1',subjectId:'math',questions:2,correct:1,incorrect:1,unanswered:0,timeMinutes:1}]));
store.setItem('ece_reference_practice_evidence_v1:top-quadratics',JSON.stringify({version:1,questions:{q1:{attempts:1}}}));
store.setItem('my_secret_token','do-not-export');
const archived=exportLearnerArchive(store);
assert.ok(!('my_secret_token' in archived.data));
assert.equal(previewLearnerImport(archived).preview.tests,1);
const target=memoryStore();
restoreLearnerArchive(target,archived);
assert.deepEqual(JSON.parse(target.getItem('ece_board_review_tests_v3')),JSON.parse(store.getItem('ece_board_review_tests_v3')));
assert.equal(target.getItem('ece_reference_practice_evidence_v1:top-quadratics'),store.getItem('ece_reference_practice_evidence_v1:top-quadratics'));
assert.equal(target.getItem(LEARNER_SCHEMA),'10.10');
assert.throws(()=>previewLearnerImport({...archived,data:{...archived.data,'unknown-service-token':'bad'}}),/Unsupported/);
assert.throws(()=>previewLearnerImport({...archived,data:{...archived.data,'ece_board_review_tests_v3':'[{invalid]'}}),/Syntax/);
const before=JSON.stringify(target.dump());
assert.throws(()=>restoreLearnerArchive(target,{...archived,data:{...archived.data,'ece_board_review_tests_v3':'not-json'}}),/Syntax/);
assert.equal(JSON.stringify(target.dump()),before);
const uiPaths=['src/components/TimedMockExam.tsx','src/components/WeakSpotQuizModal.tsx','src/components/rational-expressions/QuizTab.tsx','src/components/RealNumbersKnowledgeCheck.tsx','src/components/math/ReferenceInformedTopicScreen.tsx','src/components/math/ReferenceTopicQuiz.tsx'];
for(const filename of uiPaths){const source=readFileSync(path.join(root,filename),'utf8');assert.ok(source.includes('optionOrders')||source.includes('displayedOptionOrder'),`missing option shuffle integration in ${filename}`);}
console.log('PASS v10.10: 40 shuffle/grade permutations, invalid answer/order guards, strict vs study evidence, backup/restore + invalid import rejection, six UI integration checks.');
