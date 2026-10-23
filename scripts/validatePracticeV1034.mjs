import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRequire} from 'node:module';

const temp=mkdtempSync(join(tmpdir(),'bsece-v1034-qa-'));
try {
  execFileSync('tsc',['--project','tsconfig.practice.v1032.json','--outDir',temp,'--module','commonjs',
    '--moduleResolution','node','--noEmit','false','--pretty','false'],{stdio:'pipe'});
  const req=createRequire(join(temp,'qa.cjs'));
  const {PRACTICE_CATALOG,filterPracticeQuestions}=req(join(temp,'domain/practice/catalog.js'));
  const {ALGEBRA_REFERENCE_CONTENT}=req(join(temp,'data/algebraReferenceContent.js'));
  const {createPracticeSession,emptyPracticeStore,recordSessionAnswer,savePracticeStore,loadPracticeStore,
    endPracticeSession}=req(join(temp,'domain/practice/practiceStorage.js'));
  const {exportLearnerArchive,previewLearnerImport,restoreLearnerArchive}=req(join(temp,'utils/learnerBackup.js'));
  const original=PRACTICE_CATALOG.filter(q=>q.bankId==='algebra-expansion-v1034');
  assert.equal(original.length,100);
  assert.equal(PRACTICE_CATALOG.filter(q=>q.bankId!=='trigonometry-pilot').length,422);
  assert.equal(PRACTICE_CATALOG.filter(q=>!q.key.startsWith('trigonometry-pilot:TRI40-')&&!q.key.startsWith('trigonometry-pilot:TRI41-')&&!q.key.startsWith('trigonometry-pilot:TRI42-')&&!q.key.startsWith('trigonometry-pilot:TRI43-')&&!q.key.startsWith('trigonometry-pilot:TRI44-')&&!q.key.startsWith('trigonometry-pilot:TRI45-')&&!q.key.startsWith('trigonometry-pilot:TRI46-')&&!q.key.startsWith('trigonometry-pilot:TRI47-')&&!q.key.startsWith('trigonometry-pilot:TRI48-')&&!q.key.startsWith('trigonometry-pilot:TRI49-')).length,662); // preserve complete v10.39 baseline in subsequent content releases
  assert.equal(new Set(PRACTICE_CATALOG.map(q=>q.key)).size,PRACTICE_CATALOG.length);
  assert.equal(new Set(original.map(q=>q.familyId)).size,50);
  const topicIds=[...new Set(original.map(q=>q.topicId))];
  assert.equal(topicIds.length,10);
  assert(original.every(q=>q.reviewStatus==='automated-checked'&&q.legacyId.startsWith('alge34-')&&
    q.revision&&q.options.length===4&&q.explanation&&q.objectiveId&&q.familyId&&
    new Set(q.options.map(o=>o.text)).size===4));
  const actualCounts={};
  for(const topicId of topicIds){
    const meta=ALGEBRA_REFERENCE_CONTENT[topicId];
    assert(meta,`Missing existing topic ${topicId}`);
    const bank=original.filter(q=>q.topicId===topicId);
    assert.equal(bank.length,10,`Wrong count for ${topicId}`);
    const validIds=new Set(meta.objectives.map(objective=>objective.id));
    assert(bank.every(q=>validIds.has(q.objectiveId)),`Invalid objective mapping ${topicId}`);
    assert(bank.every(q=>q.topic===meta.title&&q.group===meta.groupLabel));
    assert.equal(filterPracticeQuestions(PRACTICE_CATALOG,{topicId,subskill:'',difficulty:'',search:'',status:'all'})
      .filter(q=>q.bankId==='algebra-expansion-v1034').length,10);
    const one=bank[0];
    assert.equal(filterPracticeQuestions(PRACTICE_CATALOG,{topicId,subskill:one.subskill,difficulty:'',search:'',status:'all'})
      .filter(q=>q.subskill===one.subskill).length>=2,true);
    actualCounts[topicId]=PRACTICE_CATALOG.filter(q=>q.topicId===topicId).length;
  }
  // Compatibility: previously published v10.33 stable IDs and content must not change.
  assert.equal(PRACTICE_CATALOG.filter(q=>q.bankId==='quadratic-expansion').length,40);
  assert.equal(PRACTICE_CATALOG.filter(q=>q.topicId==='top-quadratics').length,55);
  const q=original[0];
  const store=createPracticeSession(emptyPracticeStore(),original.slice(0,12).map(q=>({key:q.key,revision:q.revision})),
    'v1034-exercise-session','2026-10-11T07:00:00.000Z','independent');
  const response=recordSessionAnswer(store,'v1034-exercise-session',q.key,q.correctOptionId,q.correctOptionId,q.revision,'2026-10-11T07:01:00.000Z');
  assert(response.accepted);
  assert(!recordSessionAnswer(response.store,'v1034-exercise-session',q.key,q.correctOptionId,q.correctOptionId,q.revision,'2026-10-11T07:02:00.000Z').accepted);
  const closed=endPracticeSession(response.store,'v1034-exercise-session','2026-10-11T07:03:00.000Z');
  class MemoryStore {
    data=new Map();get length(){return this.data.size}key(n){return [...this.data.keys()][n]??null}
    getItem(k){return this.data.get(k)??null}setItem(k,v){this.data.set(k,v)}removeItem(k){this.data.delete(k)}
  }
  const memory=new MemoryStore();savePracticeStore(memory,closed);
  const archive=exportLearnerArchive(memory);previewLearnerImport(archive);
  const restored=new MemoryStore();restoreLearnerArchive(restored,archive);
  assert.deepEqual(loadPracticeStore(restored),closed,'Migration/restore changed saved answer');
  assert.equal(loadPracticeStore(restored).sessions[0].revisions[q.key],q.revision);
  console.log(`v10.34 Practice source QA PASS: ${PRACTICE_CATALOG.length} combined catalog listings, ${original.length} new Algebra exercises in ${topicIds.length} topics / ${new Set(original.map(q=>q.familyId)).size} families, objective mapping, filters, deduplicated answers, persistence & backup. Counts by topic: ${JSON.stringify(actualCounts)}`);
} finally{rmSync(temp,{recursive:true,force:true});}
