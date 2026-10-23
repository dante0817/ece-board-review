/** Full question-level audit / course-quota inventory. Does not certify correctness. */
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..'),cache=new Map();
function load(rel){
 const full=path.resolve(root,rel);if(cache.has(full))return cache.get(full).exports;
 const code=ts.transpileModule(fs.readFileSync(full,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const mod={exports:{}};cache.set(full,mod);
 new Function('require','module','exports',code)(name=>name.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(full),name+'.ts'))):require(name),mod,mod.exports);
 return mod.exports;
}
const {MOCK_EXAM_QUESTIONS,ALGEBRA_REFERENCE_ASSESSMENT_QUESTIONS}=load('src/data/mockExamQuestions.ts');
const {OFFICIAL_TOS_SOURCE,OFFICIAL_TOS_COURSES}=load('src/data/officialTos.ts');
const {getTosCourseId,inspectTosPreview}=load('src/domain/exam/tosCoverage.ts');
const {getBoardAreaId,distinctBoardQuestions}=load('src/domain/exam/boardBlueprint.ts');
const {classifyQuestionQuality,countQuestionQuality}=load('src/domain/exam/questionQuality.ts');
const {contentReviewFinding,CONTENT_REVIEW_FINDINGS_V1030}=load('src/data/contentReviewV1030.ts');
const all=[...MOCK_EXAM_QUESTIONS,...ALGEBRA_REFERENCE_ASSESSMENT_QUESTIONS];
const firstByStem=new Map(), duplicates=[];
const stem=q=>q.question.trim().replace(/\s+/g,' ').toLowerCase();
const quote=v=>'"'+String(v??'').replaceAll('"','""').replace(/\r?\n/g,'\\n')+'"';
const writeCsv=(file,head,rows)=>fs.writeFileSync(path.join(root,file),[head,...rows].map(x=>x.map(quote).join(',')).join('\n')+'\n');
const cols=['question_id','area','source_origin','topic','family_id','variant_or_independent','question_stem','keyed_option_id','keyed_option_text','options_count','correct_option_present','option_ids_unique','option_texts_unique','key_formula_present','explanation_present','source_fixture_status','course_id_provisional','tos_course','subtopic_review_status','subtopic_issue','duplicate_of','expert_answer_certified','expert_subtopic_certified'];
const rows=[];
for(const q of all){
 const key=stem(q), first=firstByStem.get(key);
 if(!first)firstByStem.set(key,q.id);else duplicates.push({id:q.id,first});
 const ids=q.options.map(o=>o.id),texts=q.options.map(o=>o.text.trim());
 const courseId=getTosCourseId(q),course=OFFICIAL_TOS_COURSES.find(x=>x.id===courseId);
 const finding=contentReviewFinding(q.questionFamilyId);
 rows.push([q.id,getBoardAreaId(q.subjectId)??'unmapped-area',q.contentOrigin??'legacy/reference',q.topicName,q.questionFamilyId??q.id,
    q.questionFamilyId?'parameter-family-variant':'independent-unproven',q.question,q.correctOptionId,q.options.find(o=>o.id===q.correctOptionId)?.text??'',q.options.length,
    ids.includes(q.correctOptionId)?'YES':'NO',new Set(ids).size===ids.length?'YES':'NO',new Set(texts).size===texts.length?'YES':'NO',
    q.keyFormula?.trim()?'YES':'NO',q.explanation?.trim()?'YES':'NO',classifyQuestionQuality(q),courseId??'',course?.name??'',
    finding?.disposition??(courseId?'not-independently-audited':'not-mapped'),finding?.finding??'',first??'', 'NO','NO']);
}
writeCsv('CONTENT_QUESTION_LEDGER_V10_30.csv',cols,rows);
const unique=distinctBoardQuestions(all),p50=inspectTosPreview(50,all),p100=inspectTosPreview(100,all);
const courseRows=OFFICIAL_TOS_COURSES.map(c=>{
 const subset=unique.filter(q=>getTosCourseId(q)===c.id),families=new Set(subset.map(q=>q.questionFamilyId??q.id));
 const flagged=subset.filter(q=>contentReviewFinding(q.questionFamilyId));
 const x50=p50.courses.find(x=>x.id===c.id),x100=p100.courses.find(x=>x.id===c.id);
 return [c.areaId,c.id,c.name,c.officialItems,c.pdfPage,subset.length,families.size,flagged.length,
   x50.requested,x50.selected,x50.shortage,x100.requested,x100.selected,x100.shortage,
   'NO','NO','NO'];
});
writeCsv('CONTENT_TOS_COURSE_AUDIT_V10_30.csv',
 ['area','course_id','course_name','official_target_out_of_100','prc_pdf_page_1_based','provisionally_mapped_unique_prompts','distinct_authored_families','mapped_variants_with_subtopic_concerns',
  'target_50','available_selected_50','shortage_50','target_100','available_selected_100','shortage_100',
  'subtopic_coverage_certified','difficulty_cells_certified','prc_approval'],courseRows);
writeCsv('CONTENT_TOS_SUBTOPIC_FLAGS_V10_30.csv',
 ['family_id','severity','disposition','finding','official_pdf_evidence','affected_question_ids'],
 CONTENT_REVIEW_FINDINGS_V1030.map(f=>[f.familyId,f.severity,f.disposition,f.finding,f.evidence,all.filter(q=>q.questionFamilyId===f.familyId).map(q=>q.id).join(';')]));
const quality=countQuestionQuality(all);
const report={version:'10.30.0',officialSource:OFFICIAL_TOS_SOURCE.url,scope:'all static mock and algebra reference assessment questions, not all lesson/practice items',
 totalQuestions:all.length,uniquePrompts:unique.length,duplicatePrompts:duplicates,
 quality,originCounts:Object.fromEntries([...new Set(all.map(q=>q.contentOrigin??'legacy/reference'))].map(key=>[key,all.filter(q=>(q.contentOrigin??'legacy/reference')===key).length])),
 courseMappedUnique:unique.filter(q=>getTosCourseId(q)).length,courseUnmappedUnique:unique.filter(q=>!getTosCourseId(q)).length,
 flaggedFamilyCount:CONTENT_REVIEW_FINDINGS_V1030.length,flaggedMappedVariants:unique.filter(q=>contentReviewFinding(q.questionFamilyId)).length,
 noKey:all.filter(q=>!q.options.some(o=>o.id===q.correctOptionId)).map(q=>q.id),
 missingFormula:all.filter(q=>!q.keyFormula?.trim()).length,
 missingExplanation:all.filter(q=>!q.explanation?.trim()).length,
 duplicateOptionIds:all.filter(q=>new Set(q.options.map(o=>o.id)).size!==q.options.length).map(q=>q.id),
 duplicateOptionTexts:all.filter(q=>new Set(q.options.map(o=>o.text.trim())).size!==q.options.length).map(q=>q.id),
 tos50:{selected:p50.selectedQuestions,missing:p50.missingQuestions,representative:p50.boardRepresentative},
 tos100:{selected:p100.selectedQuestions,missing:p100.missingQuestions,representative:p100.boardRepresentative},
 expertApprovedQuestions:0,subtopicCertifiedFamilies:0,difficultyCellCertified:0,physicalDeviceCertified:0,
 evidenceNote:'Automated option/metadata/fixture checks cannot establish full mathematical, editorial, subtopic or cognitive-level correctness.'};
fs.writeFileSync(path.join(root,'CONTENT_AUDIT_SUMMARY_V10_30.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
