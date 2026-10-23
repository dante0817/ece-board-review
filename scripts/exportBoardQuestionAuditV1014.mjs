import {readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url), ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..');
const src=path.join(root,'src/data/boardExpansionQuestions.ts');
const output=ts.transpileModule(readFileSync(src,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod={exports:{}};new Function('require','module','exports',output)(require,mod,mod.exports);
const audit=mod.exports.BOARD_EXPANSION_QUESTIONS;
const validation=readFileSync(path.join(root,'scripts/validateBoardExpansionV1014.mjs'),'utf8');
const fixtures=new Set([...validation.matchAll(/\s+'(geas|electronics|est)-([\w-]+)-1':/g)].map(m=>`v1014-${m[1]}-${m[2]}-1`));
const csv=(value)=>`"${String(value??'').replaceAll('"','""')}"`;
const columns=['question_id','subject_area','question_family_id','topic_id','topic_name','variant','difficulty','question','correct_option_id','correct_answer','key_formula','worked_explanation','golden_fixture_checked','peer_reviewed','prc_tos_mapped'];
const rows=audit.map(q=>[
 q.id,q.id.split('-')[1],q.questionFamilyId,q.topicId,q.topicName,q.id.endsWith('-1')?'1':'2',q.difficulty,q.question,
 q.correctOptionId,q.options.find(o=>o.id===q.correctOptionId)?.text,q.keyFormula,q.explanation,
 fixtures.has(q.id)?'yes':'no','pending','no',
]);
const out=path.join(root,'BOARD_QUESTION_AUDIT_V10_14.csv');
writeFileSync(out,[columns,...rows].map(row=>row.map(csv).join(',')).join('\n')+'\n');
console.log(`Wrote ${rows.length} question audit rows; ${fixtures.size} hand-calculated golden fixtures; peer review and TOS mapping pending.`);
