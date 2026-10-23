import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url), ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..'), cache=new Map();
function load(rel){
  const full=path.resolve(root,rel);if(cache.has(full)) return cache.get(full).exports;
  const code=ts.transpileModule(readFileSync(full,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const mod={exports:{}};cache.set(full,mod);
  new Function('require','module','exports',code)(name=>name.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(full),name+'.ts'))):require(name),mod,mod.exports);
  return mod.exports;
}
const {BOARD_EXPANSION_FAMILIES,BOARD_EXPANSION_QUESTIONS}=load('src/data/boardExpansionQuestions.ts');
const {INITIAL_SUBJECTS}=load('src/data/initialData.ts');
const {MOCK_EXAM_QUESTIONS,ALGEBRA_REFERENCE_ASSESSMENT_QUESTIONS,generateMockExamQuestions}=load('src/data/mockExamQuestions.ts');
const {ECE_BOARD_BLUEPRINT,getBoardAreaId,allocateAreaTargets,inspectBoardPreview,assembleBoardPreview,distinctBoardQuestions,calculateBoardAreaResults,areaResultsMatchRecord}=load('src/domain/exam/boardBlueprint.ts');
const {createCleanSubjects}=load('src/utils/learnerData.ts');
const {migrateSubjectsToCurrentCurriculum}=load('src/utils/curriculumMigration.ts');
const pool=[...MOCK_EXAM_QUESTIONS,...ALGEBRA_REFERENCE_ASSESSMENT_QUESTIONS];
assert.deepEqual(ECE_BOARD_BLUEPRINT.areas.map(x=>x.weightPercent),[20,30,20,30]);
assert.deepEqual(allocateAreaTargets(50),{math:10,electronics:15,geas:10,est:15});
assert.deepEqual(allocateAreaTargets(100),{math:20,electronics:30,geas:20,est:30});
assert.equal(getBoardAreaId('subj-geas'),'geas');
assert.equal(BOARD_EXPANSION_FAMILIES.length,48);
assert.equal(BOARD_EXPANSION_QUESTIONS.length,96);
for(const area of ['geas','electronics','est']){
  const f=BOARD_EXPANSION_FAMILIES.filter(x=>x.area===area);
  const q=BOARD_EXPANSION_QUESTIONS.filter(x=>getBoardAreaId(x.subjectId)===area);
  assert.equal(f.length,16);assert.equal(q.length,32);
  assert.equal(new Set(f.map(x=>x.id)).size,16);
  assert.equal(new Set(q.map(x=>x.questionFamilyId)).size,16);
  assert.equal(new Set(q.map(x=>x.question)).size,32);
}
const allIds=new Set();
const allPrompts=new Set();
const position=new Map([['A',0],['B',0],['C',0],['D',0]]);
for(const q of pool){
  assert.ok(!allIds.has(q.id),`Duplicate question ID ${q.id}`);allIds.add(q.id);
  assert.ok(q.options.some(o=>o.id===q.correctOptionId));
  assert.equal(new Set(q.options.map(o=>o.id)).size,q.options.length);
  if(q.contentOrigin==='original-v10.14'){
    const prompt=q.question.trim().replace(/\s+/g,' ').toLowerCase();
    assert.ok(!allPrompts.has(prompt),`Duplicate new question text: ${q.id}`);allPrompts.add(prompt);
    assert.equal(q.options.length,4);
    assert.equal(new Set(q.options.map(o=>o.text)).size,4);
    assert.ok(q.explanation.includes(q.keyFormula),`Missing formula in explanation: ${q.id}`);
    assert.ok(!/fx-991es/i.test(q.boardTip),'No prohibited calculator recommendations');
    assert.ok(q.questionFamilyId);
    position.set(q.correctOptionId,position.get(q.correctOptionId)+1);
  }
}
assert.ok(Math.max(...position.values())<48,'Answers must not concentrate in one position');
// Hand-calculated numerical spot checks from each area; all remaining variants
// follow the same formula and are checked for uniqueness and keyed positioning.
const expected={
  'geas-newton-1':'36 N',
  'geas-kinetic-energy-1':'100 J',
  'geas-mechanical-power-1':'40 W',
  'geas-hydrostatic-pressure-1':'49.05 kPa',
  'geas-boyle-1':'120 kPa',
  'geas-sensible-heat-1':'42 kJ',
  'geas-stress-1':'3 MPa',
  'geas-strain-1':'0.2 %',
  'geas-efficiency-1':'75 %',
  'geas-simple-interest-1':'3600 PHP',
  'geas-present-value-1':'10000 PHP',
  'geas-density-1':'2700 kg/m³',
  'geas-moles-1':'2 mol',
  'geas-molarity-1':'0.5 mol/L',
  'geas-acidity-1':'3 pH',
  'geas-projectile-height-1':'20 m',
  'electronics-divider-1':'8 V',
  'electronics-series-1':'1300 Ω',
  'electronics-parallel-1':'50 Ω',
  'electronics-rc-time-1':'1000 ms',
  'electronics-rl-time-1':'2 ms',
  'electronics-inverting-amp-1':'-20 V',
  'electronics-noninverting-amp-1':'10 V',
  'electronics-bjt-beta-1':'5 mA',
  'electronics-transistor-power-1':'1 W',
  'electronics-led-resistor-1':'200 Ω',
  'electronics-ripple-frequency-1':'100 Hz',
  'electronics-coulomb-charge-1':'50 C',
  'est-nyquist-sampling-1':'6000 Hz',
  'est-pcm-bitrate-1':'64 kb/s',
  'est-wavelength-1':'3 m',
  'est-quarterwave-1':'0.75 m',
  'est-shannon-1':'12 kb/s',
  'est-power-gain-1':'10 dB',
  'est-qam-bits-1':'4 bits/symbol',
  'est-propagation-delay-1':'3 ms',
  'est-am-bandwidth-1':'8 kHz',
  'est-carson-1':'120 kHz',
  'est-baudrate-1':'2400 baud',
  'est-bit-duration-1':'0.5 ms',
  'est-fiber-delay-1':'0.5 ms',
  'est-channel-spacing-1':'2 MHz',
  'est-attenuation-1':'2 dB',
};
for(const [id,answer] of Object.entries(expected)){
  const q=BOARD_EXPANSION_QUESTIONS.find(q=>q.id===`v1014-${id}`);
  assert.ok(q,`Missing golden fixture ${id}`);
  assert.equal(q.options.find(o=>o.id===q.correctOptionId).text,answer,`Incorrect authored key ${id}`);
}
const fresh=createCleanSubjects();
assert.equal(fresh.find(s=>s.id==='subj-geas').groups[0].topics.length,16);
for (const [area,subjectId] of [['geas','subj-geas'],['electronics','subj-electronics'],['est','subj-communications']]) {
  const actual=fresh.find(s=>s.id===subjectId).groups.flatMap(g=>g.topics).filter(t=>t.id.startsWith(`top-v1014-${area}-`));
  assert.equal(actual.length,16,`Missing ${area} numeric topics`);
  for(const q of BOARD_EXPANSION_QUESTIONS.filter(q=>q.id.startsWith(`v1014-${area}-`))) assert.ok(actual.some(t=>t.id===q.topicId),`Unmapped practice question ${q.id}`);
}
assert.ok(fresh.find(s=>s.id==='subj-geas').groups[0].topics.every(t=>t.mastery===null && t.latestScore===null));
const old=fresh.filter(s=>s.id!=='subj-geas').map(s=>({...s}));
old[0]={...old[0],inMaintenance:true};
const migrated=migrateSubjectsToCurrentCurriculum(old,createCleanSubjects());
assert.equal(migrated.filter(s=>s.id==='subj-geas').length,1,'Existing profiles must receive GEAS without reset');
assert.equal(migrated.find(s=>s.id===old[0].id).inMaintenance,true,'Existing learner settings must be retained');
for(const length of [10,30,50,100]){
  const plan=inspectBoardPreview(length,pool);
  assert.equal(plan.quotaComplete,true,`${length}-question area quotas should have no numerical shortage`);
  assert.equal(plan.boardRepresentative,false,'No claims of validated TOS representation');
  assert.equal(plan.missingQuestions,0);
  for(const area of plan.areas){
    assert.ok(area.available>=area.requested);
    if(area.areaId!=='math') assert.ok(area.newFamilyCount>=16, 'New v10.16 families must not erase the existing 16 v10.14 families');
  }
  for(let i=0;i<10;i++){
    const exam=assembleBoardPreview(length,pool);
    assert.equal(exam.questions.length,length);
    assert.equal(new Set(exam.questions.map(q=>q.id)).size,length);
    assert.ok(exam.questions.every(q=>allIds.has(q.id)));
    for(const area of exam.plan.areas){
      const selected=exam.questions.filter(q=>getBoardAreaId(q.subjectId)===area.areaId);
      assert.equal(selected.length,area.requested);
      if(area.requested<=16 && area.areaId!=='math'){
        assert.equal(new Set(selected.map(q=>q.questionFamilyId??q.id)).size,selected.length,`Repeated family in ${area.areaId} for ${length}`);
      }
    }
  }
}
assert.equal(inspectBoardPreview(200,pool).quotaComplete,false,'Larger requests still disclose shortages');
const generated=assembleBoardPreview(50,pool,()=>0.34);
const answers=Object.fromEntries(generated.questions.map((q,i)=>[q.id,i%3===0?q.correctOptionId:i%3===1?null:q.options.find(o=>o.id!==q.correctOptionId).id]));
const areaResults=calculateBoardAreaResults(generated.questions,answers,generated.plan);
const items=generated.questions.map(q=>({questionId:q.id,subjectId:q.subjectId,topicId:q.topicId,examAreaId:getBoardAreaId(q.subjectId),selectedOptionId:answers[q.id]??null,correctOptionId:q.correctOptionId}));
const correct=items.filter(q=>q.selectedOptionId===q.correctOptionId).length;
const unanswered=items.filter(q=>q.selectedOptionId===null).length;
assert.equal(areaResultsMatchRecord({questions:50,correct,incorrect:50-correct-unanswered,unanswered,itemResults:items,examAreaResults:areaResults}),true);
const legacy=generateMockExamQuestions(15,'all');assert.equal(legacy.length,15);
const ui=readFileSync(path.join(root,'src/components/TimedMockExam.tsx'),'utf8');
assert.ok(ui.includes('newFamilyCount') && ui.includes('TOS Unverified') && ui.includes('questionFamilyId:q.questionFamilyId??q.id'));
console.log('PASS v10.14 original bank: 48 numeric families, 96 variants, answer keys, diverse positions, clean GEAS migration, unique prompts, correct quota assembly, family diversity, subject records, scoring.');
console.log('ANSWER GOLDEN CHECKS:',Object.keys(expected).length);
console.log('KEY POSITIONS:',JSON.stringify(Object.fromEntries(position)));
for(const count of [50,100,200]){
  const p=inspectBoardPreview(count,pool);
  console.log(`${count}-QUESTION PLAN: ${p.selectedQuestions}/${count}; `+p.areas.map(x=>`${x.areaId} ${x.selected}/${x.requested} (bank ${x.available}, new families ${x.newFamilyCount})`).join('; ') + `; full-TOS-verified=${p.boardRepresentative}`);
}
