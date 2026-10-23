/** Dependency-free Chromium check of the actual TypeScript numeric grading module.
 * This is NOT a full React/Vite browser journey; that still requires npm ci. */
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..');
const code=ts.transpileModule(readFileSync(path.join(root,'src/domain/calculator/numericDrills.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const script=`window.module={exports:{}};window.exports=window.module.exports;\n${code}\n
try {
 const {CANON_NUMERIC_EXERCISES,parseNumericEntry,checkNumericAnswer,diagnoseNumericMistake,buildNumericDrill}=window.module.exports;
 const fixtures={
 'num-scientific-a':['90','exponent-shift'],
 'num-parallel-a':['300','series-vs-parallel'],
 'num-cutoff-a':['10000','missing-2pi'],
 'num-decibel-a':['40','power-vs-amplitude'],
 'num-sampling-a':['7.5','nyquist-factor'],
 'num-power-a':['420','current-decimal']};
 let checked=0;
 for(const item of CANON_NUMERIC_EXERCISES){
  if(checkNumericAnswer(item,String(item.expected))!=='correct')throw Error('correct-answer failure '+item.id);
  if(checkNumericAnswer(item,'')!=='unanswered')throw Error('unanswered failure '+item.id);
  checked+=2;
 }
 for(const [id,[wrong,code]] of Object.entries(fixtures)){
  const q=CANON_NUMERIC_EXERCISES.find(item=>item.id===id);
  if(diagnoseNumericMistake(q,wrong)?.code!==code)throw Error('diagnostic failure '+id);
  checked++;
 }
 if(parseNumericEntry('1.5e3')!==1500 || parseNumericEntry('1+2')!==null)throw Error('parser failure');
 if(buildNumericDrill(0).length!==6)throw Error('rotation failure');
 checked+=3;
 const result=document.getElementById('result');
 result.setAttribute('data-status','PASS');
 result.textContent='PASS '+checked+' actual browser numeric checks';
}catch(err){const result=document.getElementById('result');result.setAttribute('data-status','FAIL');result.textContent='FAIL: '+err.message;}
`;
let directory;
try {
 directory=mkdtempSync(path.join(os.tmpdir(),'bsece-numeric-browser-'));
 const file=path.join(directory,'smoke.html');
 writeFileSync(file,`<!doctype html><html><head><meta charset="utf-8"></head><body><div id="result">TEST DID NOT EXECUTE</div><script>${script.replaceAll('</script>','<\\/script>')}</script></body></html>`);
 const browser=process.env.CHROMIUM_PATH||(process.platform==='win32'?'chrome':'chromium');
 const result=spawnSync(browser,['--headless','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-first-run','--disable-extensions',`--user-data-dir=${path.join(directory,'profile')}`,'--virtual-time-budget=1500','--dump-dom',pathToFileURL(file).href],{encoding:'utf8',timeout:25000,maxBuffer:8*1024*1024});
 if(result.error)throw result.error;
 if(result.status!==0)throw Error(`${browser} exit code ${result.status}: ${result.stderr.slice(-500)}`);
 assert.ok(result.stdout.includes('data-status="PASS"'),`Browser test did not pass: ${result.stdout.slice(-1500)}`);
 const msg=result.stdout.match(/PASS \d+ actual browser numeric checks/)?.[0];
 console.log(msg||'PASS browser numeric grading');
 console.log('NOTE: This validates numeric logic in Chromium, not React UI, the full application build or a physical Canon calculator.');
}catch(err){console.error('FAIL numerical browser smoke:',err.message);process.exitCode=1;}
finally{if(directory)rmSync(directory,{recursive:true,force:true});}
