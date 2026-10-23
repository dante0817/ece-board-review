import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRequire} from 'node:module';
const temp=mkdtempSync(join(tmpdir(),'bsece-1033-qa-'));
try {
  execFileSync('tsc',['--project','tsconfig.practice.v1032.json','--outDir',temp,'--module','commonjs',
    '--moduleResolution','node','--noEmit','false','--pretty','false'],{stdio:'pipe'});
  const req=createRequire(join(temp,'validation.cjs'));
  const {PRACTICE_CATALOG,filterPracticeQuestions}=req(join(temp,'domain/practice/catalog.js'));
  const {createPracticeSession,recordSessionAnswer,endPracticeSession,isPracticeExpired,validatePracticeStore,
    emptyPracticeStore,savePracticeStore,loadPracticeStore,PRACTICE_ENGINE_KEY}=req(join(temp,'domain/practice/practiceStorage.js'));
  const {exportLearnerArchive,previewLearnerImport,restoreLearnerArchive}=req(join(temp,'utils/learnerBackup.js'));
  const newItems=PRACTICE_CATALOG.filter(q=>q.bankId==='quadratic-expansion');
  const allQuadratics=PRACTICE_CATALOG.filter(q=>q.topicId==='top-quadratics');
  assert.equal(newItems.length,40);
  assert.equal(allQuadratics.length,55);
  assert(PRACTICE_CATALOG.length>=322);
  assert.equal(new Set(newItems.map(q=>q.key)).size,40);
  assert.equal(new Set(newItems.map(q=>q.familyId)).size,32);
  assert.equal(new Set(newItems.map(q=>q.subskill)).size,10);
  assert(newItems.every(q=>q.reviewStatus==='automated-checked'&&q.objectiveId&&q.options.length===4&&
    q.options.every(o=>o.text)&&q.options.some(o=>o.id===q.correctOptionId)));
  const common={topicId:'top-quadratics',subskill:'',difficulty:'',search:'',status:'all'};
  assert.equal(filterPracticeQuestions(PRACTICE_CATALOG,common).length,55);
  const item=newItems[0],when='2026-10-11T09:00:00.000Z';
  for(const mode of ['guided','independent','timed']){
    const initial=emptyPracticeStore();
    const created=createPracticeSession(initial,[{key:item.key,revision:item.revision}],`qa-${mode}`,when,mode,300);
    assert.equal(created.sessions[0].mode,mode);
    assert(validatePracticeStore(created));
    const session=created.sessions[0];
    if(mode==='timed'){
      assert.equal(session.deadlineAt,'2026-10-11T09:05:00.000Z');
      assert(!isPracticeExpired(session,Date.parse('2026-10-11T09:04:59.999Z')));
      assert(isPracticeExpired(session,Date.parse(session.deadlineAt)));
      const late=recordSessionAnswer(created,session.id,item.key,item.correctOptionId,item.correctOptionId,
        item.revision,'2026-10-11T09:05:00.000Z');
      assert(!late.accepted,'Deadline accepted a late answer');
    }else assert.equal(session.deadlineAt,undefined);
    const answer=recordSessionAnswer(created,session.id,item.key,item.correctOptionId,item.correctOptionId,
      item.revision,'2026-10-11T09:01:00.000Z');
    assert(answer.accepted);
    assert(answer.store.firstAttempts[item.key]);
    assert.equal(answer.store.firstAttempts[item.key].assisted,mode==='guided');
    assert.equal(answer.store.sessions[0].answers[item.key],item.correctOptionId);
    assert(!recordSessionAnswer(answer.store,session.id,item.key,item.correctOptionId,item.correctOptionId,
      item.revision,'2026-10-11T09:01:01.000Z').accepted,'Double score after retry');
    const ended=endPracticeSession(answer.store,session.id,'2026-10-11T09:02:00.000Z');
    assert(ended.sessions[0].endedAt);
    assert(!recordSessionAnswer(ended,session.id,item.key,item.correctOptionId,item.correctOptionId,
      item.revision,'2026-10-11T09:02:01.000Z').accepted);
    assert.deepEqual(endPracticeSession(ended,session.id,'2026-10-11T09:03:00.000Z'),ended,'Finish should be idempotent');
    class StorageMock{
      data=new Map();get length(){return this.data.size}key(n){return [...this.data.keys()][n]??null}
      getItem(k){return this.data.get(k)??null}setItem(k,v){this.data.set(k,v)}removeItem(k){this.data.delete(k)}
    }
    const memory=new StorageMock();savePracticeStore(memory,ended);
    assert.deepEqual(loadPracticeStore(memory),ended);
    const backup=exportLearnerArchive(memory);
    const restored=new StorageMock();
    assert.doesNotThrow(()=>previewLearnerImport(backup));
    restoreLearnerArchive(restored,backup);
    assert.deepEqual(loadPracticeStore(restored),ended);
    assert(PRACTICE_ENGINE_KEY in backup.data);
    const second=createPracticeSession(ended,[{key:item.key,revision:item.revision}],'another-session','2026-10-12T10:00:00.000Z');
    const repeated=recordSessionAnswer(second,'another-session',item.key,item.correctOptionId,item.correctOptionId,item.revision,'2026-10-12T10:01:00.000Z');
    assert(repeated.accepted,'Retried practice question should remain solvable');
    assert.equal(Object.keys(repeated.store.firstAttempts).length,1,'Repeat inflated unique first-attempt credit');
  }
  const multi=createPracticeSession(emptyPracticeStore(),newItems.slice(0,3).map(q=>({key:q.key,revision:q.revision})),
    'timed-with-unanswered',when,'timed',300);
  assert.deepEqual(multi.sessions[0].answers,{});
  const expired=endPracticeSession(multi,'timed-with-unanswered','2026-10-11T09:05:01.000Z');
  assert.equal(Object.keys(expired.sessions[0].answers).length,0,'Unanswered questions must stay unanswered');
  assert(!validatePracticeStore({...multi,sessions:[{...multi.sessions[0],durationSeconds:-1}]}));
  assert(!validatePracticeStore({...multi,sessions:[{...multi.sessions[0],deadlineAt:'2026-10-11T12:00:00.000Z'}]}));
  assert(!validatePracticeStore({...multi,sessions:[{...multi.sessions[0],endedAt:'not-a-date'}]}));
  const reader=readFileSync('src/components/practice/PracticeLibrary.tsx','utf8');
  const topic=readFileSync('src/components/math/ReferenceInformedTopicScreen.tsx','utf8');
  assert(reader.includes("selectedMode==='timed'") && reader.includes("currentSession.mode==='guided'") &&
    reader.includes('Finish & see results') && reader.includes('isPracticeExpired') &&
    reader.includes('recordSessionAnswer'),'Practice UI missing mode or deadline guards');
  assert(topic.includes('browsePracticeLibrary'),'Topic Practice missing link to shared library');
  console.log(`Practice v10.33 QA PASS: ${newItems.length} new questions / ${allQuadratics.length} Quadratic problems / ${PRACTICE_CATALOG.length} total. Guided/Independent/Timed, expiry, ungraded unanswered items, idempotent scoring, legacy records and backup/restore.`);
}finally{rmSync(temp,{recursive:true,force:true});}
