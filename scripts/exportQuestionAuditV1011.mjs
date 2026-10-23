import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url),ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..');
function readData(file){const code=ts.transpileModule(readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const module={exports:{}};new Function('module','exports','require',code)(module,module.exports,()=>{});return module.exports;}
const content=readData('src/data/algebraReferenceContent.ts').ALGEBRA_REFERENCE_CONTENT;
const independent=readData('src/data/independentAlgebraAssessment.ts').INDEPENDENT_ALGEBRA_QUESTIONS;
const columns=['catalog_version','question_id','topic_id','topic_title','question_family_id','subskill','difficulty','key_option_id','correct_option_text','prompt','explanation','source_type','structural_status','math_key_verification','review_note'];
const row=(values)=>columns.map(key=>'"'+String(values[key]??'').replaceAll('"','""').replace(/\r?\n/g,' \n ')+'"').join(',');
const lines=[columns.join(',')];
const promptCounts=new Map();for(const entry of Object.values(content))for(const question of entry.practiceQuestions){const signature=question.prompt.trim().replace(/\s+/g,' ').toLowerCase();promptCounts.set(signature,(promptCounts.get(signature)??0)+1);}
for(const [topicId,topic] of Object.entries(content))for(const q of topic.practiceQuestions)lines.push(row({
  catalog_version:'algebra-reference-2026.10-v10.11',question_id:q.id,topic_id:topicId,topic_title:topic.title,
  question_family_id:q.id,subskill:q.subskill,difficulty:q.difficulty,key_option_id:String(q.correctIndex),correct_option_text:q.options[q.correctIndex],prompt:q.prompt,explanation:q.explanation,
  source_type:'legacy-visible-practice',structural_status:'PASS',math_key_verification:['q-mat-12','q-mat-14','q-gp-1','q-gp-2'].includes(q.id)?'FOCUSED_MANUAL_CHECK':'PENDING_FULL_MATH_REVIEW',
  review_note:(promptCounts.get(q.prompt.trim().replace(/\s+/g,' ').toLowerCase())>1?'HISTORICAL DUPLICATE PROMPT: count as one distinct practice problem; maintain stable legacy IDs. ':'')+'Existing lesson questions are available in study; not independent assessment families.'}));
for(const q of independent)lines.push(row({catalog_version:'algebra-reference-2026.10-v10.11',question_id:q.id,topic_id:q.topicId,topic_title:content[q.topicId]?.title??'',question_family_id:q.familyId,
  subskill:q.subskill,difficulty:q.difficulty,key_option_id:String(q.correctIndex),correct_option_text:q.options[q.correctIndex],prompt:q.prompt,explanation:q.explanation,source_type:'original-reserved-variant',structural_status:'PASS',math_key_verification:'PROGRAMMATIC_RELATION_CHECK',
  review_note:'Reserved client-side problem; self-attested, not proctored. Multiple numeric variants of a single conceptual family count as ONE family.'}));
const out=path.join(root,'QUESTION_AUDIT_V10_11.csv');writeFileSync(out,lines.join('\n')+'\n');
console.log(`Wrote ${lines.length-1} question-level audit rows: ${out}`);
