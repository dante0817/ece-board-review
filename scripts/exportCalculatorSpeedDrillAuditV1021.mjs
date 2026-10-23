import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url),ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..');
const source=readFileSync(path.join(root,'src/domain/calculator/skillsCurriculum.ts'),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod={exports:{}};new Function('require','module','exports',code)(require,mod,mod.exports);
const lessons=mod.exports.CANON_SKILLS_CURRICULUM;
const esc=value=>`"${String(value??'').replaceAll('"','""')}"`;
const rows=[['lesson_id','lesson','level','check_id','prompt','correct_choice','answer_explanation','method_type','device_tested','board_mastery_evidence','verification_state']];
for(const lesson of lessons){for(const check of lesson.checks){rows.push([lesson.id,lesson.title,lesson.level,check.id,check.prompt,check.options[check.correctIndex],check.explanation,'Timed decision check',false,false,'Existing authored v10.20 knowledge check; physical verification pending']);}}
const output=rows.map(r=>r.map(esc).join(',')).join('\n')+'\n';
writeFileSync(path.join(root,'CANON_SPEED_DRILL_AUDIT_V10_21.csv'),output);
console.log(`${rows.length-1} distinct checks exported`);
