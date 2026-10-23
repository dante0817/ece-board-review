/** v10.26 source checks preserve previous release suites and add content-coverage checks. */
import {runNpmScript} from './runNpmScript.mjs';
const checks=[
 'validate:algebra:v10.8','validate:integrity:v10.9','validate:assessment:v10.10',
 'validate:curriculum:v10.11','validate:learning-paths:v10.12',
 'validate:board:v10.13','validate:board:v10.14','validate:tos:v10.15',
 'validate:content:v10.16','validate:calculator:v10.17','validate:calculator:v10.18',
 'validate:calculator:v10.19','validate:calculator:v10.20','validate:calculator:v10.21',
 'validate:calculator:v10.22','validate:integration:v10.23',
 'validate:calculator:v10.24','validate:calculator:v10.25','validate:calculator:v10.26',
 'lint:integrity','lint:assessment','lint:curriculum','lint:learning-paths','lint:board',
 'lint:calculator','lint:calculator:v10.19','lint:calculator:v10.20',
 'lint:calculator:v10.21','lint:calculator:v10.22','lint:integration:v10.23',
 'lint:calculator:v10.24','lint:calculator:v10.25','lint:calculator:v10.26',
 'scan:imports:v10.23'
];
let errors=0;
for(const name of checks){
 const result=runNpmScript(name,{encoding:'utf8',env:{...process.env,BSECE_QA_INSTALLED_APP:'1'},timeout:60000,maxBuffer:1024*1024*5});
 const ok=result.status===0&&!result.error;
 console.log(`${ok?'PASS':'FAIL'} ${name}`);
 if(!ok){errors++;console.error(`${result.error?.message??''}\n${(result.stderr||result.stdout||'').slice(-1200)}`);}
}
console.log(`v10.26 source QA: ${checks.length-errors}/${checks.length} passed. Not a full npm build or physical-device test.`);
if(errors)process.exitCode=1;
