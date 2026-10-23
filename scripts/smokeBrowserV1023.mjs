/** Run AFTER `npm run dev` or `npm start` on a dependency-installed host. */
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const base=process.env.BSECE_SMOKE_URL||'http://127.0.0.1:3000';
const browser=process.env.CHROMIUM_PATH||(process.platform==='win32'?'chrome':'chromium');
let temp;
try{
 const health=await fetch(`${base}/api/health`,{signal:AbortSignal.timeout(10000)});
 assert.equal(health.status,200,'/api/health must return HTTP 200');
 const status=await health.json();assert.equal(status.status,'ok');
 const response=await fetch(base,{signal:AbortSignal.timeout(10000)});
 assert.equal(response.status,200,'App root must return HTTP 200');
 const html=await response.text();assert.ok(/id=["']root["']/.test(html),'Root element missing');
 console.log('PASS running application health endpoint and HTML root');
 temp=mkdtempSync(path.join(os.tmpdir(),'bsece-chrome-smoke-'));
 const proc=spawnSync(browser,[
  '--headless','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
  '--no-first-run','--disable-extensions',`--user-data-dir=${temp}`,
  '--virtual-time-budget=10000','--dump-dom',base
 ],{encoding:'utf8',timeout:35000,maxBuffer:16*1024*1024});
 if(proc.error)throw new Error(`Cannot start Chromium (${browser}): ${proc.error.message}`);
 if(proc.status!==0)throw new Error(`Chromium exit code ${proc.status}; ${proc.stderr.slice(-750)}`);
 const doc=proc.stdout;
 assert.ok(doc.includes('id="nav-btn-calculator-skills"'),'React sidebar did not mount; check browser console and installed packages');
 assert.ok(doc.includes('Calculator Skills'),'Calculator Skills route entry missing');
 assert.ok(doc.includes('mock-exams'),'Mock assessment navigation not visible');
 console.log('PASS headless Chromium rendered React sidebar, calculator entry and exam navigation');
 console.log('NOTE: Further manual browser journeys, data migration, strict-mode and device tests remain required.');
}catch(error){console.error(`FAIL browser integration smoke: ${error.message}`);process.exitCode=1;}
finally{if(temp)rmSync(temp,{recursive:true,force:true});}
