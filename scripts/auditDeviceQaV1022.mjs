import {writeFileSync,readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url),ts=require('typescript'),root=path.resolve(import.meta.dirname,'..'),cache=new Map();
function load(rel){const f=path.resolve(root,rel);if(cache.has(f))return cache.get(f).exports;
 const code=ts.transpileModule(readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const m={exports:{}};cache.set(f,m);new Function('require','module','exports',code)((n)=>n.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(f),n+'.ts'))):require(n),m,m.exports);return m.exports;}
const {CANON_DEVICE_QA_CASES}=load('src/domain/calculator/deviceQa.ts');
function csv(s){return `"${String(s).replaceAll('"','""')}"`}
const header=['technique_id','type','method_name','model','expected_mode','expected_result_or_formula','device_test_status','editorial_approval','notes'];
const lines=[header.map(csv).join(','),...CANON_DEVICE_QA_CASES.map(c=>[c.id,c.type,c.label,'Canon F-789SGA',c.mode,c.expected,'NOT TESTED IN ENVIRONMENT','NOT APPROVED',c.warnings].map(csv).join(','))];
writeFileSync(path.join(root,'CANON_DEVICE_QA_AUDIT_V10_22.csv'),lines.join('\n')+'\n');
console.log(`Wrote ${CANON_DEVICE_QA_CASES.length} case rows. All remain unverified by physical device.`);
