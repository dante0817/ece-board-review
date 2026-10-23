import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..');
const code=ts.transpileModule(readFileSync(path.join(root,'src/domain/calculator/numericDrills.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const module={exports:{}};new Function('module','exports',code)(module,module.exports);
const {CANON_NUMERIC_EXERCISES,checkNumericAnswer}=module.exports;
const cols=['question_id','family_id','lesson_id','expected_numeric_answer','answer_unit','absolute_tolerance','independent_check','error_message','mathematics_check','hardware_status'];
const csv=v=>'"'+String(v).replaceAll('"','""').replaceAll(/\r?\n/g,' ')+'"';
const rows=CANON_NUMERIC_EXERCISES.map(q=>{
 if(checkNumericAnswer(q,String(q.expected))!=='correct')throw Error('Inconsistent answer: '+q.id);
 return [q.id,q.familyId,q.lessonId,q.expected,q.unit,q.absoluteTolerance,q.independentCheck,q.pitfall,'Automated independent fixture only; not expert-certified','Physical Canon F-789SGA not tested'];
});
const output=path.join(root,'CANON_NUMERIC_ACCURACY_AUDIT_V10_25.csv');
writeFileSync(output,[cols.map(csv).join(','),...rows.map(row=>row.map(csv).join(','))].join('\n')+'\n');
console.log(`Wrote ${rows.length} numeric items to ${output}`);
