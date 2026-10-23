/** Aggregate all earlier source-level regressions; add v10.28 runtime safeguards. */
import {runNpmScript} from './runNpmScript.mjs';
const checks=[
 'validate:algebra:v10.8','validate:integrity:v10.9','validate:assessment:v10.10',
 'validate:curriculum:v10.11','validate:learning-paths:v10.12',
 'validate:board:v10.13','validate:board:v10.14','validate:tos:v10.15',
 'validate:content:v10.16','validate:calculator:v10.17','validate:calculator:v10.18',
 'validate:calculator:v10.19','validate:calculator:v10.20','validate:calculator:v10.21',
 'validate:calculator:v10.22','validate:integration:v10.23',
 'validate:calculator:v10.24','validate:calculator:v10.25','validate:calculator:v10.26',
 'validate:calculator:v10.27','validate:runtime:v10.28',
 'lint:integrity','lint:assessment','lint:curriculum','lint:learning-paths','lint:board',
 'lint:calculator','lint:calculator:v10.19','lint:calculator:v10.20',
 'lint:calculator:v10.21','lint:calculator:v10.22','lint:integration:v10.23',
 'lint:calculator:v10.24','lint:calculator:v10.25','lint:calculator:v10.26',
 'lint:calculator:v10.27','lint:runtime:v10.28','scan:imports:v10.23'
];
let passed=0;
for(const name of checks){
 const result=runNpmScript(name,
  {encoding:'utf8',env:{...process.env,BSECE_QA_INSTALLED_APP:'1'},timeout:80000,maxBuffer:5*1024*1024});
 const ok=result.status===0&&!result.error;
 if(ok)passed++;
 console.log(`${ok?'PASS':'FAIL'} ${name}`);
 if(!ok)console.error(`${result.error?.message||''}\n${(result.stderr||result.stdout||'').slice(-1300)}`);
}
console.log(`v10.28 source QA: ${passed}/${checks.length} passed. Does not certify an installed-dependency build or physical calculator.`);
if(passed!==checks.length)process.exitCode=1;
