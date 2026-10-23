import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRequire} from 'node:module';

const tmp=mkdtempSync(join(tmpdir(),'bsece-practice-qa-'));
try {
  execFileSync('tsc',['--project','tsconfig.practice.v1032.json','--outDir',tmp,'--module','commonjs',
    '--moduleResolution','node','--noEmit','false','--pretty','false'],{stdio:'pipe'});
  const req=createRequire(join(tmp,'qa.cjs'));
  const {PRACTICE_CATALOG,filterPracticeQuestions}=req(join(tmp,'domain/practice/catalog.js'));
  const {LINEAR_DAILY_CREDIT_KEY,claimLinearDailyCredit,validateLinearCredit}=req(join(tmp,'domain/practice/linearDailyCredit.js'));
  const {PRACTICE_ENGINE_KEY,emptyPracticeStore,createPracticeSession,acceptPracticeAnswer,
    validatePracticeStore,savePracticeStore,loadPracticeStore}=req(join(tmp,'domain/practice/practiceStorage.js'));
  const {exportLearnerArchive,previewLearnerImport,restoreLearnerArchive}=req(join(tmp,'utils/learnerBackup.js'));
  const {generateWeakSpotQuizFromErrors}=req(join(tmp,'utils/weakSpotQuizGenerator.js'));
  assert(PRACTICE_CATALOG.length>=270,'Expected 3 legacy Algebra banks');
  assert.equal(new Set(PRACTICE_CATALOG.map(q=>q.key)).size,PRACTICE_CATALOG.length,'runtime IDs collide');
  assert(PRACTICE_CATALOG.every(q=>q.options.some(o=>o.id===q.correctOptionId)));
  assert(PRACTICE_CATALOG.filter(q=>!['quadratic-expansion','algebra-expansion-v1034','trigonometry-pilot'].includes(q.bankId)).every(q=>q.reviewStatus==='legacy-under-review'));
  assert.equal(PRACTICE_CATALOG.filter(q=>q.bankId==='quadratic-expansion').length,40);
  assert(PRACTICE_CATALOG.filter(q=>q.bankId==='trigonometry-pilot' && q.reviewStatus==='draft-unverified').length>=128); // 32 retained pilot + 96 new foundation questions
  const quadratic=PRACTICE_CATALOG.filter(q=>q.topicId==='top-quadratics');
  assert(quadratic.length>=15,'Quadratics pilot missing');
  const filter={topicId:'top-quadratics',subskill:'',difficulty:'',search:'',status:'all'};
  assert.equal(filterPracticeQuestions(PRACTICE_CATALOG,filter).length,quadratic.length);
  assert.equal(filterPracticeQuestions(PRACTICE_CATALOG,{...filter,subskill:'FAKE'}).length,0);
  assert.equal(filterPracticeQuestions(PRACTICE_CATALOG,{...filter,difficulty:'Basic'}).every(q=>q.difficulty==='Basic'),true);
  const initial=emptyPracticeStore();assert(validatePracticeStore(initial));
  const session=createPracticeSession(initial,quadratic.slice(0,5).map(q=>({key:q.key,revision:q.revision})),'test-session','2026-10-11T00:00:00.000Z');
  assert.equal(session.activeSessionId,'test-session');assert.equal(session.sessions[0].keys.length,5);
  assert.throws(()=>createPracticeSession(initial,[{key:'a',revision:'1'},{key:'a',revision:'1'}],'dupe','now'));
  const q=quadratic[0],answer={questionKey:q.key,revision:q.revision,chosenOptionId:q.correctOptionId,
    correct:true,at:'2026-10-11T00:00:00.000Z',assisted:true,sessionId:'test-session'};
  const first=acceptPracticeAnswer(session,answer);
  assert(first.accepted);assert(!acceptPracticeAnswer(first.store,answer).accepted,'Double first-attempt credit');
  assert.equal(Object.keys(first.store.firstAttempts).length,1);
  assert.equal(filterPracticeQuestions(PRACTICE_CATALOG,{...filter,status:'unattempted'},first.store.firstAttempts).length,quadratic.length-1);
  assert.equal(filterPracticeQuestions(PRACTICE_CATALOG,{...filter,status:'attempted'},first.store.firstAttempts).length,1);
  assert(!validatePracticeStore({...first.store,firstAttempts:{bad:{correct:'yes'}}}));
  assert(!validatePracticeStore({...first.store,sessions:[{...session.sessions[0],keys:['duplicate','duplicate']}]}));
  class Store {
    #data=new Map();get length(){return this.#data.size}key(i){return [...this.#data.keys()][i]??null}
    getItem(k){return this.#data.get(k)??null}setItem(k,v){this.#data.set(k,v)}removeItem(k){this.#data.delete(k)}
  }
  const memory=new Store();savePracticeStore(memory,first.store);
  assert(claimLinearDailyCredit(memory,'2026-10-11','lp-1'));
  assert(!claimLinearDailyCredit(memory,'2026-10-11','lp-1'),'Daily retry credit inflated');
  assert(!claimLinearDailyCredit(memory,'2026-10-11','lp-1'),'Reload credit inflated');
  assert(claimLinearDailyCredit(memory,'2026-10-12','lp-1'),'New day should be allowed');
  assert(validateLinearCredit(JSON.parse(memory.getItem(LINEAR_DAILY_CREDIT_KEY))));
  assert.deepEqual(loadPracticeStore(memory),first.store);
  const archive=exportLearnerArchive(memory);assert(PRACTICE_ENGINE_KEY in archive.data);
  const preview=previewLearnerImport(archive);assert(preview.preview.keys>=1);
  const restored=new Store();restoreLearnerArchive(restored,archive);
  assert.deepEqual(loadPracticeStore(restored),first.store);
  assert.throws(()=>previewLearnerImport({...archive,data:{...archive.data,[PRACTICE_ENGINE_KEY]:'{"version":99}'}}));
  assert.throws(()=>previewLearnerImport({...archive,data:{...archive.data,[LINEAR_DAILY_CREDIT_KEY]:'{"version":99}'}}));
  // Refuse to overwrite corrupted history; never silently destroy a learner's old bytes.
  const corrupt=new Store();corrupt.setItem(PRACTICE_ENGINE_KEY,'{corrupt!');
  assert.throws(()=>savePracticeStore(corrupt,first.store));
  const oldArchive={...archive,data:{}};assert.doesNotThrow(()=>previewLearnerImport(oldArchive));
  // Targeted quiz filtering: never spill into another subject or ignore selected error categories.
  const subjects=[{id:'subj-math-algebra',name:'Algebra',category:'Mathematics',groups:[]},
    {id:'subj-geas',name:'GEAS',category:'GEAS',groups:[]}];
  const errors=[{id:'err-1',subjectId:'subj-math-algebra',topicId:'top-partial-fractions',topicName:'Partial Fractions',
    isResolved:false,category:'Formula recall',description:'Wrong term',occurrenceCount:2,solutionOrKeyFormula:'Repeat terms'}];
  const math=generateWeakSpotQuizFromErrors(errors,subjects,[],{targetSubjectId:'subj-math-algebra',questionCount:5,focusErrorCategory:'Formula recall'});
  assert(math.questions.length>0);
  assert(math.questions.every(q=>q.subjectId==='subj-math-algebra'&&q.topicId==='top-partial-fractions'));
  assert.equal(math.subjectBreakdown.reduce((sum,s)=>sum+s.allocatedQuestionCount,0),math.questions.length);
  const noMatch=generateWeakSpotQuizFromErrors(errors,subjects,[],{targetSubjectId:'subj-geas',focusErrorCategory:'Wrong method'});
  assert.equal(noMatch.questions.length,0,'No silent cross-category fallback');
  const source=readFileSync('src/components/PracticeScreen.tsx','utf8');
  assert(source.includes('PracticeLibrary')&&source.includes('Log External Practice'));
  assert(!source.includes('selectedDifficulty')&&!source.includes('questionCount'));
  const rational=readFileSync('src/components/rational-expressions/PracticeTab.tsx','utf8');
  assert(!rational.includes('return pool.length > 0 ? pool : PRACTICE_QUESTIONS_BANK'));
  console.log(`Practice v10.32 QA PASS: ${PRACTICE_CATALOG.length} unique question listings, ${quadratic.length} Quadratic items, strict filters, session snapshots, idempotency, backup/restore and Smart Quiz pool restrictions.`);
} finally {rmSync(tmp,{recursive:true,force:true});}
