import {writeFileSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..'),cache=new Map();
function load(rel){const full=path.resolve(root,rel);if(cache.has(full))return cache.get(full).exports;
  const code=ts.transpileModule(readFileSync(full,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const mod={exports:{}};cache.set(full,mod);new Function('require','module','exports',code)(name=>name.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(full),name+'.ts'))):require(name),mod,mod.exports);return mod.exports;}
const {MOCK_EXAM_QUESTIONS,ALGEBRA_REFERENCE_ASSESSMENT_QUESTIONS}=load('src/data/mockExamQuestions.ts');
const {inspectBoardPreview}=load('src/domain/exam/boardBlueprint.ts');
const pool=[...MOCK_EXAM_QUESTIONS,...ALGEBRA_REFERENCE_ASSESSMENT_QUESTIONS];
const rows=['requested_total,area_id,area_name,weight_percent,quota,distinct_available,selected,shortage,delivered_total,missing_total,board_representative'];
for(const count of [10,15,20,30,50,100]){const plan=inspectBoardPreview(count,pool);
  for(const area of plan.areas)rows.push([count,area.areaId,`"${area.name.replaceAll('"','""')}"`,area.weightPercent,area.requested,area.available,area.selected,area.shortage,plan.selectedQuestions,plan.missingQuestions,false].join(','));}
writeFileSync(path.join(root,'BOARD_COVERAGE_V10_13.csv'),rows.join('\n')+'\n');
console.log('Generated',rows.length-1,'area rows');
