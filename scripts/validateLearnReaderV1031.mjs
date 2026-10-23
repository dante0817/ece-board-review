/** Source-level Learn Reader tests; does not replace full browser QA or math expert review. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url), ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..'),cache=new Map();
const read=(relative)=>fs.readFileSync(path.join(root,relative),'utf8');
function load(relative){
  const full=path.resolve(root,relative);
  const file=fs.existsSync(full)?full:fs.existsSync(`${full}.ts`)?`${full}.ts`:`${full}.tsx`;
  if(cache.has(file))return cache.get(file).exports;
  const source=fs.readFileSync(file,'utf8');
  const code=ts.transpileModule(source,{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const mod={exports:{}};cache.set(file,mod);
  new Function('require','module','exports',code)((name)=>name.startsWith('.')?load(path.resolve(path.dirname(file),name)):require(name),mod,mod.exports);
  return mod.exports;
}
const {ALGEBRA_REFERENCE_CONTENT}=load('src/data/algebraReferenceContent.ts');
const {getLearnLesson}=load('src/domain/learn/legacyLessonAdapter.ts');
const {LEARN_READER_STORAGE_KEY,emptyReaderStore,validateLearnReaderStore,parseReaderStore,resolveReaderProgress,updateReaderTopic,MAX_READER_BYTES}=load('src/domain/learn/readerProgress.ts');
const {exportLearnerArchive,previewLearnerImport,restoreLearnerArchive}=load('src/utils/learnerBackup.ts');
const lessons=Object.values(ALGEBRA_REFERENCE_CONTENT).map(getLearnLesson);
assert.equal(lessons.length,23);
assert.equal(new Set(lessons.map(l=>l.id)).size,23);
for(const lesson of lessons){
  assert(lesson.sections.length>=3,`${lesson.id} insufficient summary sections`);
  const ids=lesson.sections.map(s=>s.id);
  assert.equal(ids.length,new Set(ids).size,`Duplicate section in ${lesson.id}`);
  assert(lesson.sections.every(s=>s.blocks.length>0));
}
const quad=getLearnLesson(ALGEBRA_REFERENCE_CONTENT['top-quadratics']);
assert.equal(quad.status,'draft');
assert.equal(quad.sections.length,7);
const objectiveIds=ALGEBRA_REFERENCE_CONTENT['top-quadratics'].objectives.map(o=>o.id);
for(const id of objectiveIds){
  const sections=quad.sections.filter(s=>s.objectiveIds.includes(id));
  assert(sections.length,`Uncovered objective ${id}`);
  assert(sections.some(s=>s.blocks.some(b=>b.type==='worked-example')),`No worked example for ${id}`);
  assert(sections.some(s=>s.blocks.some(b=>b.type==='checkpoint')),`No checkpoint for ${id}`);
}
for(const sec of quad.sections){
  assert.equal(new Set(sec.blocks.map(b=>b.id)).size,sec.blocks.length,`Duplicate block in ${sec.id}`);
  for(const block of sec.blocks){
    if(block.type==='worked-example')assert(block.steps.length>=2&&block.check.length>0);
    if(block.type==='formula')assert(block.latex.length>0&&!block.latex.includes('$$'));
  }
}
const empty=emptyReaderStore();assert(validateLearnReaderStore(empty));
let state=updateReaderTopic(quad,empty,{lastSectionId:'factoring',bookmarkedSectionIds:['factoring'],completedSectionIds:['introduction']});
assert(validateLearnReaderStore(state));assert.equal(resolveReaderProgress(quad,state).lastSectionId,'factoring');
assert.deepEqual(resolveReaderProgress(quad,state).completedSectionIds,['introduction']);
assert.deepEqual(resolveReaderProgress({...quad,sections:quad.sections.slice(0,1)},state).bookmarkedSectionIds,[]);
assert.equal(resolveReaderProgress({...quad,sections:quad.sections.slice(0,1)},state).lastSectionId,'introduction');
assert.deepEqual(parseReaderStore('{broken'),empty);
assert.deepEqual(parseReaderStore('x'.repeat(MAX_READER_BYTES+1)),empty);
assert.equal(validateLearnReaderStore({...state,topics:{'bad key':state.topics[quad.id]}}),false);
assert.equal(validateLearnReaderStore({...state,topics:{[quad.id]:{...state.topics[quad.id],completedSectionIds:['introduction','introduction']}}}),false);
const store=()=>{
  const map=new Map();return {map,length:0,key(i){return [...map.keys()][i]||null},getItem(k){return map.get(k)||null},setItem(k,v){map.set(k,v);this.length=map.size},removeItem(k){map.delete(k);this.length=map.size}};
};
const local=store();local.setItem(LEARN_READER_STORAGE_KEY,JSON.stringify(state));local.setItem('unmanaged_password','SECRET');
const archive=exportLearnerArchive(local);assert(archive.data[LEARN_READER_STORAGE_KEY]);assert(!('unmanaged_password' in archive.data));
assert.equal(previewLearnerImport(archive).preview.keys,1);
const brokenLocal=store();brokenLocal.setItem(LEARN_READER_STORAGE_KEY,'{bad');
assert.throws(()=>exportLearnerArchive(brokenLocal),/Learn Reader progress/);
assert.doesNotThrow(()=>previewLearnerImport({format:'BSECE-learner-backup',version:1,exportedAt:'2026-01-01',data:{}}));
assert.throws(()=>previewLearnerImport({...archive,data:{[LEARN_READER_STORAGE_KEY]:'{}'}}),/Invalid Learn Reader/);
const dest=store();restoreLearnerArchive(dest,archive);assert.equal(dest.getItem(LEARN_READER_STORAGE_KEY),archive.data[LEARN_READER_STORAGE_KEY]);
// Do not accidentally grade or mutate subject/test keys when touching reading state.
assert(!Object.keys(state.topics[quad.id]).some(k=>/mastery|grade|score|quiz/i.test(k)));
for(const file of ['src/components/math/ReferenceInformedTopicScreen.tsx','src/components/learn-reader/LearnReaderLayout.tsx','src/components/learn-reader/LearnSectionRenderer.tsx','src/components/AlgebraScreen.tsx','src/context/ReviewContext.tsx','src/components/MathFormula.tsx','src/App.tsx']){
  const result=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}});
  assert.equal(result.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,`TS syntax errors in ${file}`);
}
console.log(`Learn Reader source QA PASS: ${lessons.length} lesson views, ${quad.sections.length} quadratic sections, ${objectiveIds.length} objectives, navigation/rendering syntax, reading-state validation and backup/restore.`);
