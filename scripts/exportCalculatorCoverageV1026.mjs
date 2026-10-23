import {readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..'),cache=new Map();
function load(rel){
 const file=path.resolve(root,rel);if(cache.has(file))return cache.get(file).exports;
 const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const mod={exports:{}};cache.set(file,mod);
 new Function('require','module','exports',code)((n)=>n.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(file),n+'.ts'))):require(n),mod,mod.exports);
 return mod.exports;
}
const {MOCK_EXAM_QUESTIONS}=load('src/data/mockExamQuestions.ts');
const {getCanonTechnique}=load('src/domain/calculator/canonTechniques.ts');
const {resolveFamilyTechnique}=load('src/domain/calculator/familyTechniques.ts');
const {summarizeCalculatorCoverage}=load('src/domain/calculator/coverage.ts');
const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';
const cols=['question_id','subject','topic','question_family','guide_type','technique_id','math_check','device_verified','review_stage','reason_or_limitation'];
const rows=[];
for(const q of MOCK_EXAM_QUESTIONS){
 const pilot=getCanonTechnique(q.id);
 const result=resolveFamilyTechnique(q);
 const t=pilot??(result.kind==='available'?result.technique:null);
 rows.push([
 q.id,q.subjectName,q.topicName,q.questionFamilyId??'',pilot?'pilot':result.kind==='available'?'family':'pending',t?.id??'',
 pilot?'pilot authored, prior regression fixtures':result.kind==='available'?'independently specified arithmetic fixtures / keyed-answer checked':'not checked',
 'NO',t?'preliminary / device QA pending':'unavailable',pilot?pilot.caution:result.kind==='available'?result.technique.caution:result.reason
 ]);
}
const out=path.join(root,'CANON_GUIDANCE_COVERAGE_V10_26.csv');
writeFileSync(out,[cols,...rows].map(row=>row.map(quote).join(',')).join('\n')+'\n');
const summary=summarizeCalculatorCoverage(MOCK_EXAM_QUESTIONS);
console.log('Question coverage',JSON.stringify(summary));
console.log('Output',out);
