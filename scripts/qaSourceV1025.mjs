/** Reproducible source-level verification. Does not replace a dependency-backed
 * full TypeScript build, Chromium app journey or physical calculator QA. */
import {runNpmScript} from './runNpmScript.mjs';
const checks=[
 'validate:algebra:v10.8','validate:integrity:v10.9','validate:assessment:v10.10',
 'validate:curriculum:v10.11','validate:learning-paths:v10.12',
 'validate:board:v10.13','validate:board:v10.14','validate:tos:v10.15',
 'validate:content:v10.16','validate:calculator:v10.17',
 'validate:calculator:v10.18','validate:calculator:v10.19','validate:calculator:v10.20',
 'validate:calculator:v10.21','validate:calculator:v10.22','validate:integration:v10.23',
 'validate:calculator:v10.24','validate:calculator:v10.25',
 'lint:integrity','lint:assessment','lint:curriculum','lint:learning-paths','lint:board',
 'lint:calculator','lint:calculator:v10.19','lint:calculator:v10.20','lint:calculator:v10.21',
 'lint:calculator:v10.22','lint:integration:v10.23','lint:calculator:v10.24',
 'lint:calculator:v10.25','scan:imports:v10.23'
];
let failures=0;
for(const name of checks){
 const r=runNpmScript(name,{encoding:'utf8',timeout:45000,maxBuffer:4*1024*1024,env:{...process.env,BSECE_QA_INSTALLED_APP:'1'}});
 const ok=r.status===0&&!r.error;
 console.log(`${ok?'PASS':'FAIL'} ${name}`);
 if(!ok){failures++;console.error((r.error?.message??'')+'\n'+(r.stderr||r.stdout||'').slice(-1000));}
}
console.log(`Source gate: ${checks.length-failures}/${checks.length} checks passed.`);
console.log('Not covered: full application dependency build, interactive React browser journey, physical Canon F-789SGA keystrokes.');
if(failures)process.exitCode=1;
