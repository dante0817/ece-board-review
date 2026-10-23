import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..'),cache=new Map();
function load(rel){
 const file=path.resolve(root,rel);if(cache.has(file))return cache.get(file).exports;
 const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React}}).outputText;
 const mod={exports:{}};cache.set(file,mod);
 new Function('require','module','exports',code)((name)=>name.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(file),name+'.ts'))):require(name),mod,mod.exports);return mod.exports;
}
const {CANON_SKILLS_CURRICULUM,CANON_SKILL_BY_ID,gradeCalculatorSkill}=load('src/domain/calculator/skillsCurriculum.ts');
const {CALCULATOR_SKILLS_PROGRESS_KEY,validateCalculatorSkillsProgress,recordCalculatorSkillAttempt,readCalculatorSkillsProgress}=load('src/domain/calculator/skillsProgress.ts');
const {exportLearnerArchive,previewLearnerImport,restoreLearnerArchive}=load('src/utils/learnerBackup.ts');
assert.equal(CANON_SKILLS_CURRICULUM.length,10);
assert.equal(new Set(CANON_SKILLS_CURRICULUM.map(l=>l.id)).size,10);
for(const lesson of CANON_SKILLS_CURRICULUM){
 assert.ok(lesson.steps.length>=3 && lesson.manualSection && lesson.objective && lesson.example.independentCheck && lesson.example.trap,lesson.id);
 assert.equal(lesson.checks.length,2);
 for(const prereq of lesson.prerequisites)assert.ok(CANON_SKILL_BY_ID.has(prereq),`${lesson.id} invalid prerequisite ${prereq}`);
 for(const item of lesson.checks){assert.equal(item.options.length,3);assert.equal(new Set(item.options).size,3);assert.ok(item.correctIndex>=0&&item.correctIndex<=2);assert.ok(item.explanation);}
 const correct=lesson.checks.map(check=>check.correctIndex),wrong=[(correct[0]+1)%3,correct[1]];
 assert.deepEqual(gradeCalculatorSkill(lesson.id,correct),{correct:2,total:2,passed:true,feedback:[true,true]});
 assert.deepEqual(gradeCalculatorSkill(lesson.id,wrong),{correct:1,total:2,passed:false,feedback:[false,true]});
 assert.equal(gradeCalculatorSkill(lesson.id,[3,0]),null);
 assert.equal(gradeCalculatorSkill(lesson.id,[0]),null);
}
assert.equal(gradeCalculatorSkill('__fake',[0,0]),null);
console.log('PASS 10 ordered Canon lessons, 20 three-choice knowledge checks, prerequisite graph, retryable grading');
let progress={version:1,lessons:{}};
assert.ok(validateCalculatorSkillsProgress(progress));
const first=CANON_SKILLS_CURRICULUM[0],key=first.checks.map(c=>c.correctIndex);
progress=recordCalculatorSkillAttempt(progress,first.id,[(key[0]+1)%3,key[1]],'2026-10-10T02:00:00Z');
assert.equal(progress.lessons[first.id].bestCorrect,1);assert.equal(progress.lessons[first.id].attempts,1);assert.equal(progress.lessons[first.id].completedAt,undefined);
progress=recordCalculatorSkillAttempt(progress,first.id,key,'2026-10-10T02:03:00Z');
assert.equal(progress.lessons[first.id].bestCorrect,2);assert.equal(progress.lessons[first.id].attempts,2);assert.equal(progress.lessons[first.id].completedAt,'2026-10-10T02:03:00Z');
const passedTime=progress.lessons[first.id].completedAt;
progress=recordCalculatorSkillAttempt(progress,first.id,[0,0],'2026-10-10T02:05:00Z');
assert.equal(progress.lessons[first.id].completedAt,passedTime);
assert.ok(!validateCalculatorSkillsProgress({version:1,lessons:{spoof:{attempts:1,bestCorrect:2}}}));
assert.ok(!validateCalculatorSkillsProgress({version:1,lessons:{[first.id]:{attempts:-1,bestCorrect:2}}}));
assert.ok(!validateCalculatorSkillsProgress({version:1,lessons:{[first.id]:{attempts:2,bestCorrect:1,completedAt:'2026-10-10T02:03:00Z'}}}));
const map=new Map(),store={get length(){return map.size},key(i){return [...map.keys()][i]??null},getItem(k){return map.get(k)??null},setItem(k,v){map.set(k,v)},removeItem(k){map.delete(k)}};
store.setItem(CALCULATOR_SKILLS_PROGRESS_KEY,JSON.stringify(progress));
assert.deepEqual(readCalculatorSkillsProgress(store),progress);
const archive=exportLearnerArchive(store);assert.ok(archive.data[CALCULATOR_SKILLS_PROGRESS_KEY]);
previewLearnerImport(archive);map.clear();restoreLearnerArchive(store,archive);assert.deepEqual(readCalculatorSkillsProgress(store),progress);
assert.throws(()=>previewLearnerImport({...archive,data:{...archive.data,[CALCULATOR_SKILLS_PROGRESS_KEY]:'{"version":1,"lessons":{"evil":{"attempts":1,"bestCorrect":0}}}'}}));
console.log('PASS retryable progress, immutable completion, backup round-trip, invalid backup rejection');
const skills=readFileSync(path.join(root,'src/components/CalculatorSkillsScreen.tsx'),'utf8');
assert.ok(skills.includes('strictAssessmentLocked(assessmentSession)'));
assert.ok(skills.includes('disclosure="skills-center"'));
assert.ok(skills.includes('question={question}'));
assert.ok(skills.includes('saveWarning'));
assert.ok(skills.includes('Try again'));
for(const p of ['src/components/ratios-proportions/RatioPracticeTab.tsx','src/components/scientific-notation/ScientificPracticeTab.tsx','src/components/rational-expressions/WorkedExamplesView.tsx']){
 assert.ok(readFileSync(path.join(root,p),'utf8').includes('<CalculatorCompatibilityNotice/>'));
}
console.log('PASS fail-closed assessment screen; existing calculator question integration; three further Casio compatibility notices');
console.log('PASS v10.20 calculator-skills validation (no device approval asserted)');
