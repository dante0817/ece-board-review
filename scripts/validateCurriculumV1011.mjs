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
const {ALGEBRA_REFERENCE_CONTENT}=load('src/data/algebraReferenceContent.ts');
const {INDEPENDENT_ALGEBRA_QUESTIONS}=load('src/data/independentAlgebraAssessment.ts');
const {buildSkillCoverage,canonicalSkillId,getIndependentSkillEvidence,ALGEBRA_COVERAGE_CATALOG_VERSION}=load('src/domain/curriculum/skillCatalog.ts');
const {getReferenceSubskillStats,recordReferencePracticeAttempt,emptyReferencePracticeEvidence}=load('src/utils/referencePracticeMastery.ts');
const {migrateAbsoluteValuePracticeEvidence}=load('src/utils/referenceEvidenceMigration.ts');
const {buildOptionOrders,orderedChoices}=load('src/domain/assessment/optionOrder.ts');
const {selectReservedQuestionIds,countReservedFamilies}=load('src/domain/curriculum/reservedSelection.ts');
const {gradeResponses}=load('src/domain/assessment/grading.ts');
const all=Object.values(ALGEBRA_REFERENCE_CONTENT),baseline=all.flatMap(topic=>topic.practiceQuestions),ids=new Set();
let duplicateOptions=0,unverifiedReasons=[];
for(const topic of all){
  assert.equal(topic.canonicalTopicId,Object.entries(ALGEBRA_REFERENCE_CONTENT).find(([,c])=>c===topic)?.[0]);
  assert.ok(topic.objectives.length>0,`Missing lesson objectives: ${topic.canonicalTopicId}`);
  for(const q of topic.practiceQuestions){
    assert.ok(q.id&&!ids.has(q.id),`Duplicate question ID ${q.id}`);ids.add(q.id);
    assert.ok(q.prompt.trim().length>10,`Empty prompt ${q.id}`);
    assert.ok(q.explanation.trim().length>=5,`Missing explanation ${q.id}`);
    assert.equal(q.options.length,4,`Choice count ${q.id}`);
    assert.ok(Number.isInteger(q.correctIndex)&&q.correctIndex>=0&&q.correctIndex<4,`Incorrect key index ${q.id}`);
    if(new Set(q.options.map(x=>x.trim().toLowerCase())).size!==4)duplicateOptions++;
  }
}
assert.equal(baseline.length,260);assert.equal(duplicateOptions,0,'Repeated identical choice texts in reference bank');
const beforeGroups=all.reduce((sum,c)=>sum+new Set(c.practiceQuestions.map(q=>q.subskill)).size,0);
const allSkills=all.flatMap(c=>buildSkillCoverage(c,INDEPENDENT_ALGEBRA_QUESTIONS));
const afterGroups=allSkills.length;
assert.ok(afterGroups<beforeGroups,`Normalization failed ${afterGroups} vs ${beforeGroups}`);
const seenQuestionIds=new Set();const seenFamily=new Set();
for(const q of INDEPENDENT_ALGEBRA_QUESTIONS){
  assert.ok(!ids.has(q.id)&&!seenQuestionIds.has(q.id),`Independent question duplicates baseline or another item: ${q.id}`);
  seenQuestionIds.add(q.id);seenFamily.add(q.familyId);
  assert.equal(q.correctIndex,0);
  assert.equal(new Set(q.options.map(x=>x.toLowerCase())).size,4);
  assert.ok(q.explanation.length>=30);
  const v=q.check.values;
  switch(q.check.kind){
    case 'monic-factor':{const [a,b]=v;assert.equal(q.options[0],`x = ${a} or ${b}`);assert.equal((a+b)**2-4*a*b,(a-b)**2);break;}
    case 'root-square':{const [h,r]=v;assert.equal(q.options[0],`x = ${h-r} or ${h+r}`);break;}
    case 'nonmonic-factor':{const [a,b]=v;assert.equal(q.options[0],`x = ${a} or ${b}`);break;}
    case 'discriminant-class':{const [a,b,c]=v,d=b*b-4*a*c;assert.ok(q.options[0].includes(d>0?'two distinct real':d===0?'one repeated real':'two nonreal'));break;}
    case 'discriminant-value':{const [a,b,c]=v;assert.equal(q.options[0],String(b*b-4*a*c));break;}
    case 'repeated-coefficient':{const [a,b,c]=v;assert.equal(b*b-4*a*c,0);assert.equal(q.options[0],`c = ${c}`);break;}
    case 'radical-domain':{const [k]=v;assert.equal(q.options[0],`x ≤ ${k}`);break;}
    case 'rational-domain':{const [k]=v;assert.equal(q.options[0],`all real x except x = ${k}`);break;}
    case 'log-domain':{const [k]=v;assert.equal(q.options[0],`x > ${k}`);break;}
    case 'linear-isolate':{const [a,x,b,rhs]=v;assert.equal(a*x+b,rhs);assert.equal(q.options[0],`x = ${x}`);break;}
    case 'linear-bracket':{const [a,x,b,rhs]=v;assert.equal(a*(x+b),rhs);assert.equal(q.options[0],`x = ${x}`);break;}
    case 'linear-two-sides':{const [a,c,x,b,d]=v;assert.equal(a*x+b,c*x+d);assert.notEqual(a,c);assert.equal(q.options[0],`x = ${x}`);break;}
    case 'exponent-product':{const [m,n]=v;assert.equal(q.options[0],`x^${m+n}`);break;}
    case 'exponent-quotient':{const [m,n]=v;assert.equal(q.options[0],`x^${m-n}`);break;}
    case 'exponent-power':{const [m,n]=v;assert.equal(q.options[0],`x^${m*n}`);break;}
    default:throw Error(`Unvalidated family ${q.id}`);
  }
  const skillId=canonicalSkillId(q.topicId,q.subskill);
  assert.ok(allSkills.some(s=>s.skillId===skillId));
}
assert.equal(INDEPENDENT_ALGEBRA_QUESTIONS.length,30);assert.equal(seenFamily.size,15);
// Historical duplicates remain with their immutable IDs but contribute only one unique problem exposure.
const byPrompt=new Map();
for(const question of baseline){const key=question.prompt.trim().replace(/\s+/g,' ').toLowerCase();byPrompt.set(key,[...(byPrompt.get(key)??[]),question.id]);}
const duplicatePrompts=[...byPrompt.values()].filter(ids=>ids.length>1);
assert.equal(duplicatePrompts.length,4);
const exponents=ALGEBRA_REFERENCE_CONTENT['top-laws-exponents'];
let duplicatePractice=emptyReferencePracticeEvidence();
const repeated=exponents.practiceQuestions.filter(q=>['q-exp-2','q-exp-8'].includes(q.id));
for(const q of repeated)duplicatePractice=recordReferencePracticeAttempt(duplicatePractice,q,true);
const stDup=getReferenceSubskillStats(exponents,duplicatePractice).find(s=>s.subskill==='Exponent and radical rules');
assert.equal(stDup.attemptedQuestions,1,'Duplicate prompt must not create multiple unique exposures');
// Shuffle grading is invariant across 30 independent items, including answer-order changes.
const bank=INDEPENDENT_ALGEBRA_QUESTIONS.map(q=>({questionId:q.id,topicId:q.topicId,subjectId:'subj-math-algebra',questionFamilyId:q.familyId,skillId:canonicalSkillId(q.topicId,q.subskill),options:q.options.map((text,id)=>({id:String(id),text})),correctOptionId:String(q.correctIndex)}));
for(let repeat=0;repeat<25;repeat++){
  const orders=buildOptionOrders(bank.map(q=>({...q,id:q.questionId})));
  const full=gradeResponses(bank,Object.fromEntries(bank.map(q=>[q.questionId,q.correctOptionId])),orders);
  assert.equal(full.grade.correct,30);assert.equal(full.grade.scorePercent,100);
  assert.equal(new Set(full.results.map(r=>r.questionFamilyId)).size,15);
  for(const result of full.results)assert.deepEqual(orderedChoices(bank.find(q=>q.questionId===result.questionId).options,orders[result.questionId]).map(c=>c.id),orders[result.questionId]);
}

for(const [topic,items] of Object.entries(Object.groupBy(INDEPENDENT_ALGEBRA_QUESTIONS,x=>x.topicId))){
  assert.equal(countReservedFamilies(items),topic==='top-quadratics'?6:3);
  for(let i=0;i<30;i++){
    const chosen=selectReservedQuestionIds(items,3);
    assert.equal(chosen.length,3);
    assert.equal(new Set(chosen.map(id=>items.find(q=>q.id===id).familyId)).size,3);
  }
  const chosen=selectReservedQuestionIds(items,3,()=>0.6);
  const remaining=items.filter(item=>!chosen.includes(item.id));
  assert.ok(countReservedFamilies(remaining)>=3);
  assert.equal(selectReservedQuestionIds(remaining,3,()=>0.3).length,3);
}
// One correct practice answer, including repeated attempts, never generates a strong label.
const quad=ALGEBRA_REFERENCE_CONTENT['top-quadratics'];let practice=emptyReferencePracticeEvidence();
for(let i=0;i<9;i++)practice=recordReferencePracticeAttempt(practice,quad.practiceQuestions[0],true);
const st=getReferenceSubskillStats(quad,practice).find(s=>s.subskill==='Solving quadratics');
assert.equal(st.attemptedQuestions,1);assert.equal(st.level,'Practiced once');
// Repeated questions, study, manual, and legacy records cannot count as independent families.
const skillId=canonicalSkillId('top-quadratics','Factoring');
const t=Date.parse('2026-10-01T08:00:00Z');
const record=(qid,at,mode='strict')=>({provenance:'automatic',assessmentMode:mode,assistanceUsed:false,pausedSeconds:0,selfAttested:true,questions:1,curriculumVersion:'v10.11',startedAt:new Date(at).toISOString(),itemResults:[{questionId:qid,questionFamilyId:qid.replace(/-v[12]$/,''),skillId,topicId:'top-quadratics',selectedOptionId:'0',correctOptionId:'0'}]});
let tests=[record('ind11-quadratic-monic-factor-v1',t),record('ind11-quadratic-monic-factor-v1',t+10_000),record('ind11-quadratic-square-root-v1',t+20_000),record('ind11-quadratic-nonmonic-factor-v1',t+30_000),record('ind11-quadratic-monic-factor-v2',t+60_000,'study'),{...record('ind11-quadratic-monic-factor-v2',t+60_000),provenance:'manual'}];
let evidence=getIndependentSkillEvidence(skillId,tests,new Date(t+70_000));
assert.equal(evidence.attemptedFamilyCount,3);assert.equal(evidence.status,'Developing (self-attested)');assert.equal(evidence.delayedRecheck,false);
tests.push(record('ind11-quadratic-monic-factor-v2',t+25*3600_000));
evidence=getIndependentSkillEvidence(skillId,tests,new Date(t+26*3600_000));
assert.equal(evidence.attemptedFamilyCount,3);assert.equal(evidence.status,'Consistent (self-attested)');assert.equal(evidence.delayedRecheck,true);
assert.equal(getIndependentSkillEvidence(skillId,[],new Date()).status,'Not assessed');
// One-time Absolute Value/inequalities split with immutable legacy backup.
const db=new Map();const store={getItem:k=>db.get(k)??null,setItem:(k,v)=>db.set(k,String(v))};
const legacy={version:1,questions:{'q-abs-1':{attempts:2,correct:1,lastCorrect:false,lastAttemptAt:'2026-10-01'},'q-ineq-1':{attempts:3,correct:2,lastCorrect:true,lastAttemptAt:'2026-10-01'}},misconceptionMisses:{'ABS_INSIDE_OUTSIDE':2,'INEQ_SIGN':1}};
store.setItem('ece_reference_practice_evidence_v1:top-inequalities',JSON.stringify(legacy));
assert.equal(migrateAbsoluteValuePracticeEvidence(store),'migrated');
assert.equal(migrateAbsoluteValuePracticeEvidence(store),'already');
assert.deepEqual(JSON.parse(store.getItem('ece_reference_practice_evidence_v1:legacy-inequalities-abs-backup-v10.11')),legacy);
const moved=JSON.parse(store.getItem('ece_reference_practice_evidence_v1:top-absolute-value'));
const retained=JSON.parse(store.getItem('ece_reference_practice_evidence_v1:top-inequalities'));
assert.deepEqual(Object.keys(moved.questions),['q-abs-1']);
assert.deepEqual(Object.keys(retained.questions),['q-ineq-1']);
assert.equal(moved.misconceptionMisses.ABS_INSIDE_OUTSIDE,2);
assert.equal(retained.misconceptionMisses.INEQ_SIGN,1);
const fresh={getItem:()=>null,setItem:()=>{throw Error('Must not be called')}};
assert.equal(migrateAbsoluteValuePracticeEvidence(fresh),'not-needed');
// Coverage denominator is explicitly the app's catalog; never calculated as a PRC syllabus percentage.
assert.match(ALGEBRA_COVERAGE_CATALOG_VERSION,/v10.11/);
assert.equal(allSkills.filter(s=>s.assessmentFamilyIds.length>=3).length,5);
console.log(`PASS v10.11: ${all.length} topics; ${baseline.length} practice questions structurally checked; ${beforeGroups} original subskill tags -> ${afterGroups} grouped skills; ${INDEPENDENT_ALGEBRA_QUESTIONS.length} original variants in ${seenFamily.size} families numerically checked; 25 rounds shuffle+grading; independent/duplicate/delayed evidence and conservative absolute-value migration rules.`);
console.log('NOTE: structural/reference-bank checks do NOT constitute a human mathematics and explanation audit of all 260 existing questions.');
console.log(`COVERAGE: ${allSkills.filter(s=>s.assessmentFamilyIds.length>=3).length}/${afterGroups} grouped skills have 3+ reserved original assessment families; denominator ${ALGEBRA_COVERAGE_CATALOG_VERSION}.`);
