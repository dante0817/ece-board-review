/**
 * Focused Physics for Engineers Batch 2 source-integrity check.
 * Run: node scripts/validatePhysicsEngineersBatch2.mjs
 * This is not an independent academic or browser/build certification.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';

const base='src/features/physics/';
const load=(name)=>JSON.parse(fs.readFileSync(base+name,'utf8'));
const lessons=[...load('physicsEngineersPart1.json'),...load('physicsEngineersPart2.json')];
const questions=[1,2,3,4].flatMap(n=>load(`physicsEngineersQuestions${n}.json`));
const catalog=fs.readFileSync(base+'physicsCatalog.ts','utf8');
const marker='export const PHYSICS_TOS_GROUPS: readonly PhysicsTosGroup[] = ';
const start=catalog.indexOf(marker);
assert.ok(start>=0,'Physics TOS group definition not found');
const from=start+marker.length;
const end=catalog.indexOf('] as const;',from);
assert.ok(end>=0,'Physics TOS group terminator not found');
const groups=JSON.parse(catalog.slice(from,end+1)).filter(g=>g.courseId==='geas-physics');
assert.equal(groups.length,4);
const outlines=groups.flatMap(g=>g.objectives.map((title,i)=>({id:`${g.id}-lesson-${i+1}`,title,groupId:g.id})));
const outlineMap=new Map(outlines.map(x=>[x.id,x]));
assert.equal(outlines.length,18);
assert.equal(lessons.length,18);
assert.equal(new Set(lessons.map(l=>l.id)).size,18);
for(const lesson of lessons){
  const outline=outlineMap.get(lesson.id);
  assert.ok(outline,`Unmapped lesson ${lesson.id}`);
  assert.equal(lesson.title,outline.title);
  assert.ok(lesson.concept.length>=100,`Short concept ${lesson.id}`);
  assert.ok(lesson.summary.length>=40,`Short summary ${lesson.id}`);
  assert.ok(lesson.method&&lesson.guardrail&&lesson.reference,`Lesson scaffolding ${lesson.id}`);
  assert.ok(lesson.formulas.length>=1&&lesson.formulas.every(x=>x.latex&&x.note),`Equations ${lesson.id}`);
  assert.ok(lesson.worked.steps.length>=2&&lesson.worked.check,`Worked example ${lesson.id}`);
  assert.ok(lesson.checks.length>=2&&lesson.checks.every(q=>q.length===3&&q.every(Boolean)),`Checkpoints ${lesson.id}`);
}
const expected={
  'pfe-mechanics':{knowledge:15,comprehension:10},
  'pfe-rotation-waves':{knowledge:10,comprehension:10},
  'pfe-fluids-heat':{knowledge:10,comprehension:0},
  'pfe-electric-optics':{knowledge:15,comprehension:5},
};
assert.equal(questions.length,75);
assert.equal(new Set(questions.map(q=>q.id)).size,75,'Duplicate question id');
assert.equal(new Set(questions.map(q=>q.stem.trim().toLowerCase())).size,75,'Duplicate question stem');
for(const q of questions){
  const o=outlineMap.get(q.lessonId);
  assert.ok(o&&o.groupId===q.groupId,`Unmapped question ${q.id}`);
  assert.ok(q.stem.length>15&&q.explanation.length>15,`Incomplete question ${q.id}`);
  assert.equal(q.options.length,4,`Choices ${q.id}`);
  assert.equal(new Set(q.options.map(x=>x.trim())).size,4,`Repeated choice ${q.id}`);
  assert.ok(Number.isInteger(q.correctIndex)&&q.correctIndex>=0&&q.correctIndex<4,`Answer index ${q.id}`);
  assert.equal(q.reviewStatus,'draft');
  assert.equal(q.assessmentEligible,false);
  assert.ok(['knowledge','comprehension'].includes(q.cognitive),`Cognitive classification ${q.id}`);
}
for(const [id,dist] of Object.entries(expected)){
  const subset=questions.filter(q=>q.groupId===id);
  const target=groups.find(g=>g.id===id);
  assert.ok(target,`Missing official group ${id}`);
  assert.equal(subset.length,(target.officialItems)*5,`Group quantity ${id}`);
  for(const [level,count] of Object.entries(dist)){
    assert.equal(subset.filter(q=>q.cognitive===level).length,count,`Cognitive count ${id}/${level}`);
    assert.equal(target.cognitive[level]*5,count,`Official cognitive allocation ${id}/${level}`);
  }
}
assert.equal(questions.filter(q=>q.assessmentEligible).length,0);
console.log('PASS Physics Engineers Batch 2: 18 draft lessons, 75 ungraded questions, 4 TOS groups, exact 50 knowledge + 25 comprehension, unique IDs, lesson links and guarded scored eligibility.');
