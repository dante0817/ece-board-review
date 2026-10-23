import {writeFileSync,readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url),ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..'),cache=new Map();
function load(rel){const full=path.resolve(root,rel);if(cache.has(full))return cache.get(full).exports;
  const code=ts.transpileModule(readFileSync(full,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const mod={exports:{}};cache.set(full,mod);
  new Function('require','module','exports',code)(name=>name.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(full),name+'.ts'))):require(name),mod,mod.exports);
  return mod.exports;}
const {MOCK_EXAM_QUESTIONS,ALGEBRA_REFERENCE_ASSESSMENT_QUESTIONS}=load('src/data/mockExamQuestions.ts');
const {inspectBoardPreview}=load('src/domain/exam/boardBlueprint.ts');
const pool=[...MOCK_EXAM_QUESTIONS,...ALGEBRA_REFERENCE_ASSESSMENT_QUESTIONS];
const columns=['requested_total','area_id','area_name','area_weight_percent','quota','available_distinct_prompts','available_topic_labels','original_v1014_families','original_v1014_numeric_variants','selected','shortage','selected_total','missing_total','quota_complete','tos_representative'];
const rows=[30,50,100,200].flatMap(count=>{const p=inspectBoardPreview(count,pool);return p.areas.map(a=>[count,a.areaId,a.name,a.weightPercent,a.requested,a.available,a.distinctTopicCount,a.newFamilyCount,a.newVariants,a.selected,a.shortage,p.selectedQuestions,p.missingQuestions,p.quotaComplete,p.boardRepresentative]);});
const quote=x=>`"${String(x).replaceAll('"','""')}"`;
writeFileSync(path.join(root,'BOARD_COVERAGE_V10_14.csv'),[columns,...rows].map(r=>r.map(quote).join(',')).join('\n')+'\n');
console.log('Wrote board availability and diversity report:',rows.length,'rows');
