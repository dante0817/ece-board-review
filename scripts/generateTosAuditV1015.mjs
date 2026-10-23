import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript'),root=path.resolve(import.meta.dirname,'..'),cache=new Map();
function load(rel){const full=path.resolve(root,rel);if(cache.has(full))return cache.get(full).exports;
const code=ts.transpileModule(fs.readFileSync(full,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod={exports:{}};cache.set(full,mod);new Function('require','module','exports',code)(name=>name.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(full),name+'.ts'))):require(name),mod,mod.exports);return mod.exports;}
const {OFFICIAL_TOS_COURSES,OFFICIAL_TOS_SOURCE}=load('src/data/officialTos.ts');
const {MOCK_EXAM_QUESTIONS,ALGEBRA_REFERENCE_ASSESSMENT_QUESTIONS}=load('src/data/mockExamQuestions.ts');
const {getTosCourseId,inspectTosPreview}=load('src/domain/exam/tosCoverage.ts');
const {getBoardAreaId,distinctBoardQuestions}=load('src/domain/exam/boardBlueprint.ts');
const pool=[...MOCK_EXAM_QUESTIONS,...ALGEBRA_REFERENCE_ASSESSMENT_QUESTIONS],plan50=inspectTosPreview(50,pool),plan100=inspectTosPreview(100,pool);
const esc=x=>'"'+String(x??'').replaceAll('"','""')+'"';
function csv(rows,filename){fs.writeFileSync(path.join(root,filename),rows.map(row=>row.map(esc).join(',')).join('\n')+'\n');}
const rows=[['PRC area','official course','course id','official TOS course items out of 100 subject items','Annex A PDF page','mapped distinct prompts','mapped authored families','50-question target','50-question selected','50-question missing','100-question target','100-question selected','100-question missing','content review','source URL']];
for(const c of OFFICIAL_TOS_COURSES){const a=plan50.courses.find(x=>x.id===c.id),b=plan100.courses.find(x=>x.id===c.id);
rows.push([c.areaId,c.name,c.id,c.officialItems,c.pdfPage,a.available,a.knownFamilies,a.requested,a.selected,a.shortage,b.requested,b.selected,b.shortage,'Pending expert subtopic, difficulty, and answer verification',OFFICIAL_TOS_SOURCE.url]);}
csv(rows,'TOS_COURSE_COVERAGE_V10_15.csv');
const unique=distinctBoardQuestions(pool),knownPrompts=new Set(unique.map(q=>q.id));
const checks=[];
const audit=[['question_id','area','subject_id','topic_name','question_family','TOS_course_id','TOS_course','alignment_status','question','correct_option','correct_text','choice_count','distinct_choice_count','explanation_present','key_formula_present','duplicate_prompt_excluded_from_selection','answer_validation','expert_peer_review','source_pdf_page']];
const courses=new Map(OFFICIAL_TOS_COURSES.map(c=>[c.id,c]));
for(const q of pool){const id=getTosCourseId(q),course=id?courses.get(id):null;
const correct=q.options.find(o=>o.id===q.correctOptionId);
const uniqueChoices=new Set(q.options.map(x=>x.text.trim()));
const dup=!knownPrompts.has(q.id);
const problems=[];
if(!correct)problems.push(`missing answer key`);
if(uniqueChoices.size!==q.options.length)problems.push(`identical choice text`);
if(!q.explanation?.trim())problems.push(`missing explanation`);
if(!q.keyFormula?.trim())problems.push(`missing key formula`);
if(dup)problems.push('duplicate normalized prompt excluded');
checks.push(...problems.map(p=>`${q.id}: ${p}`));
const oldNew=q.contentOrigin==='original-v10.14';
audit.push([q.id,getBoardAreaId(q.subjectId)??'unclassified',q.subjectId,q.topicName,q.questionFamilyId??'',id??'',course?.name??'',id?'provisional editorial course alignment':'unmapped; requires manual review',q.question,q.correctOptionId,correct?.text??'',q.options.length,uniqueChoices.size,Boolean(q.explanation?.trim()),Boolean(q.keyFormula?.trim()),dup,oldNew?'v10.14 formula/golden fixtures (partial); peer review pending':'legacy key unverified; expert review pending','pending',course?.pdfPage??'']);}
csv(audit,'TOS_QUESTION_AUDIT_V10_15.csv');
const report=[
'# v10.15 PRC TOS audit — Source findings',
'',`Official annex: ${OFFICIAL_TOS_SOURCE.url}`,
'',`- ${OFFICIAL_TOS_COURSES.length} official course rows (8 Mathematics, 11 GEAS, 9 Electronics Engineering, 6 EST). Each board subject totals 100 official items.`,
`- ${pool.length} authored mock/reference questions; ${unique.length} distinct prompts in the current bank.`,
`- ${unique.filter(q=>getTosCourseId(q)).length} distinct prompts with provisional editorial course assignments; ${plan50.unmappedQuestionCount} distinct prompts not yet mapped.`,
`- 50-question TOS-targeted preview: ${plan50.selectedQuestions} possible, ${plan50.missingQuestions} course quota shortages.`,
`- 100-question TOS-targeted preview: ${plan100.selectedQuestions} possible, ${plan100.missingQuestions} course quota shortages.`,
'- Course mapping is editorial/provisional; the official PRC never endorsed these items.',
'- No complete subtopic-to-question or easy/moderate/difficult cognitive-level alignment has been certified.',
'- v10.14 golden fixtures check a subset of generated solutions; they do not constitute independent review of the entire question bank.',
'- Legacy and reference-question content still requires independent key/solution verification.',
'',`## Static audit flags (${checks.length}; not all are mathematical errors)`,'',...(checks.length?checks.map(x=>'- '+x):['- No basic missing-key/choice/explanation/formula flags in the inspected pool.']),
'', '## Target shortages, official course level','',
...plan50.courses.filter(c=>c.shortage>0).map(c=>`- ${c.areaId} / ${c.name}: requires ${c.requested}, provides ${c.selected}, missing ${c.shortage} at 50 requested`),
'', 'The numerical practice question count is NOT a measure of complete TOS competency coverage.',''];
fs.writeFileSync(path.join(root,'TOS_CONTENT_AUDIT_V10_15.md'),report.join('\n'));
console.log(JSON.stringify({questions:pool.length,distinct:unique.length,provisionallyMapped:unique.filter(q=>getTosCourseId(q)).length,unmapped:plan50.unmappedQuestionCount,flags:checks.length,plan50:{selected:plan50.selectedQuestions,missing:plan50.missingQuestions},plan100:{selected:plan100.selectedQuestions,missing:plan100.missingQuestions}},null,2));
