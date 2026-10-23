import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url),ts=require('typescript'),root=path.resolve(import.meta.dirname,'..');
const cache=new Map();
function load(rel){
 const filename=path.resolve(root,rel); if(cache.has(filename))return cache.get(filename).exports;
 const code=ts.transpileModule(readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const mod={exports:{}};cache.set(filename,mod);
 new Function('require','module','exports',code)(name=>name.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(filename),name+'.ts'))):require(name),mod,mod.exports);
 return mod.exports;
}
const session=load('src/domain/assessment/assessmentAccess.ts');
const inactive=session.INACTIVE_ASSESSMENT;
assert.equal(session.canRevealCalculator(inactive),false,'Missing disclosure must lock');
assert.equal(session.canRevealCalculator(inactive,'after-answer'),true);
let strict=session.startAssessment(inactive,'att-1','strict','2026-10-09T00:00:00Z');
for(const aid of ['calculator','tutor','voice-tutor','voice-commands','formula','topic-drawer','navigation'])assert.equal(session.canAccessAid(strict,aid),false,aid);
assert.equal(session.canRevealCalculator(strict,'after-answer'),false);
assert.equal(session.canRevealCalculator({...strict,status:'finalizing'},'skills-center'),false);
assert.equal(session.finishAssessment(strict,'exited','2026-10-09T00:01:00Z').status,'interrupted');
assert.equal(session.finishAssessment(strict,'timeout','2026-10-09T00:01:00Z').status,'finalized');
const submitted=session.finishAssessment(strict,'submitted','2026-10-09T00:01:00Z');
assert.equal(session.canRevealCalculator(submitted,'after-answer'),true);
assert.throws(()=>session.startAssessment(strict,'new','strict','2026-10-09T00:02:00Z'));
console.log('PASS fail-closed access policy, all 7 aid gates, strict timeout, exit, finalize');
const {CANON_TECHNIQUE_TEMPLATES,bindCanonTechnique,isPublishedTechnique}=load('src/domain/calculator/techniqueLibrary.ts');
const {MOCK_EXAM_QUESTIONS}=load('src/data/mockExamQuestions.ts');
assert.equal(CANON_TECHNIQUE_TEMPLATES.length,10);
assert.equal(new Set(CANON_TECHNIQUE_TEMPLATES.map(t=>t.originalQuestionId)).size,10);
for(const template of CANON_TECHNIQUE_TEMPLATES){
 assert.equal(template.version,1);assert.equal(template.modelId,'canon-f789sga');
 assert.equal(template.reviewStage,'draft');assert.equal(isPublishedTechnique(template),false);
 const q=MOCK_EXAM_QUESTIONS.find(q=>q.id===template.originalQuestionId);assert.ok(q);
 const actualAnswer=q.options.find(o=>o.id===q.correctOptionId)?.text;assert.ok(actualAnswer);
 const bound=bindCanonTechnique(q.id,actualAnswer);assert.equal(bound.expectedAnswer,actualAnswer);
 assert.ok(bound.renderedSteps.length>=2);assert.ok(template.manual.url.startsWith('https://'));
}
assert.equal(bindCanonTechnique('__none','abc'),null);
assert.equal(bindCanonTechnique('mock-q-01',''),null);
const pr=CANON_TECHNIQUE_TEMPLATES.find(t=>t.originalQuestionId==='mock-q-04').parameters;
assert.deepEqual(pr.map(p=>p.value),[1,2,-35]);
console.log('PASS 10 original pilot mappings, typed template version/provenance, no falsely published method');
// Independent numerical oracles; these do NOT certify physical key sequences.
const close=(actual,expected,tol=1e-9)=>assert.ok(Math.abs(actual-expected)<=tol,`${actual} !== ${expected}`);
const ncr=(n,r)=>{let v=1;for(let j=1;j<=r;j++)v=v*(n-j+1)/j;return v};
const oracles=[
 ['mock-q-01',()=>{const d=(61-31)/(19-9),a=(31-9*d)/2;close(a,2);close(d,3);}],
 ['mock-q-02',()=>close(18*(1+2/3)/(1-2/3),90)],
 ['mock-q-03',()=>close(ncr(9,6)*2**3,672)],
 ['mock-q-04',()=>{const roots=[(-2+Math.sqrt(4+140))/2,(-2-Math.sqrt(4+140))/2];assert.deepEqual(roots,[5,-7]);close(Math.log2(5+3)+Math.log2(5-1),5)}],
 ['mock-q-16',()=>close(500*(1+0.8**2/2),660)],
 ['mock-q-17',()=>close(2*(75+15),180)],
 ['mock-q-18',()=>{const g=Math.abs((150-50)/(150+50));close((1+g)/(1-g),3)}],
 ['mock-q-20',()=>close(3000*Math.log2(1001),29901.68,1)],
 ['mock-q-21',()=>close(Math.sqrt(4*2*18),12)],
 ['mock-q-23',()=>close(12*(1-(-1/-4))**2,6.75)],
];
for(const [id,test] of oracles){assert.ok(CANON_TECHNIQUE_TEMPLATES.some(t=>t.originalQuestionId===id));test()}
console.log('PASS 10 independent arithmetic fixtures; NOT a physical-device verification');
const {appendAidEvent,AID_EVENTS_STORAGE_KEY,validateAidDisclosure}=load('src/domain/assessment/aidEvidence.ts');
const {exportLearnerArchive,previewLearnerImport,restoreLearnerArchive}=load('src/utils/learnerBackup.ts');
const map=new Map();const store={get length(){return map.size},key(i){return [...map.keys()][i]??null},getItem(k){return map.get(k)??null},setItem(k,v){map.set(k,v)},removeItem(k){map.delete(k)}};
const event={eventId:'ev-1',attemptId:'attempt-1',questionId:'mock-q-01',aid:'calculator',techniqueId:'canon-ap-system-1',techniqueVersion:1,revealedAt:'2026-10-09T00:01:00Z',phase:'after-answer',assessmentMode:'strict'};
assert.ok(validateAidDisclosure(event));appendAidEvent(store,event);appendAidEvent(store,event);
assert.equal(JSON.parse(store.getItem(AID_EVENTS_STORAGE_KEY)).length,1);
const archive=exportLearnerArchive(store);assert.ok(archive.data[AID_EVENTS_STORAGE_KEY]);
previewLearnerImport(archive);
map.clear();restoreLearnerArchive(store,archive);
assert.deepEqual(JSON.parse(store.getItem(AID_EVENTS_STORAGE_KEY)),[event]);
assert.throws(()=>previewLearnerImport({...archive,data:{...archive.data,[AID_EVENTS_STORAGE_KEY]:'[{"bad":true}]'}}));
console.log('PASS item-level assistance event deduplication, backup and restore, invalid-event rejection');
// Inspect call paths because transpiled pure utilities cannot validate React runtime routing.
const context=readFileSync(path.join(root,'src/context/ReviewContext.tsx'),'utf8');
const mock=readFileSync(path.join(root,'src/components/TimedMockExam.tsx'),'utf8');
const card=readFileSync(path.join(root,'src/components/CalculatorTechniqueCard.tsx'),'utf8');
const app=readFileSync(path.join(root,'src/App.tsx'),'utf8');
const voice=readFileSync(path.join(root,'src/context/VoiceCommandContext.tsx'),'utf8');
assert.ok(card.includes('canRevealCalculator(assessmentSession,disclosure)'));
assert.ok(!card.includes('isSubmitted=true'));
assert.ok(context.includes("if(!canAccessInstruction('tutor'))return"));
assert.ok(context.includes("if(!canAccessInstruction('voice-tutor'))return"));
assert.ok(context.includes("if(!canAccessInstruction('formula'))return"));
assert.ok(context.includes("if(!canAccessInstruction('topic-drawer'))return"));
assert.ok(mock.includes('beginAssessment(startedId,assessmentCondition)'));
assert.ok(mock.includes("finalizeAssessment('timeout')"));
assert.ok(mock.includes("finalizeAssessment('submitted')"));
assert.ok(mock.includes('interruptAssessment()'));
assert.ok(app.includes('!strictLocked && <TopicDrawer />'));
assert.ok(voice.includes('if(locked)voiceState.stopListening()'));
console.log('PASS static integration guards for assessment lifecycle, overlays and voice shutdown');
