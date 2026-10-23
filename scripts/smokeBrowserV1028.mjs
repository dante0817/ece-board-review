/** Functional Chromium smoke: verifies live React navigation, not merely HTML text.
 * Run against an already-running, installed-dependency application.
 * Requires Node 22+ with global WebSocket and an installed Chrome/Chromium browser.
 */
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,readFileSync,existsSync,rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const base=process.env.BSECE_SMOKE_URL||'http://127.0.0.1:3000';
const browser=process.env.CHROMIUM_PATH||(process.platform==='win32'?'chrome':'chromium');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const abortAfter=ms=>AbortSignal.timeout(ms);
let child,ws,temp;
const exceptions=[];
async function devtoolsPort(){
 const file=path.join(temp,'DevToolsActivePort');
 for(let i=0;i<65;i++){
  if(child.exitCode!==null||child.signalCode!==null)throw new Error('Chromium exited before its debugger opened');
  if(existsSync(file)){
   const number=Number(readFileSync(file,'utf8').split(/\r?\n/)[0]);
   if(Number.isInteger(number)&&number>0)return number;
  }
  await delay(180);
 }
 throw new Error('Chromium debugging endpoint did not appear (browser startup timeout)');
}
async function connect(url){
 const socket=new WebSocket(url);
 await new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(new Error('DevTools websocket connection timeout')),7000);
  socket.addEventListener('open',()=>{clearTimeout(timeout);resolve();},{once:true});
  socket.addEventListener('error',()=>{clearTimeout(timeout);reject(new Error('DevTools websocket connection failed'));},{once:true});
 });
 return socket;
}
let seq=0;
const requests=new Map();
function send(method,params={}){
 const id=++seq;
 return new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>{requests.delete(id);reject(new Error(`${method} response timeout`));},10000);
  requests.set(id,{resolve,reject,timeout});
  ws.send(JSON.stringify({id,method,params}));
 });
}
async function evaluate(expression){
 const reply=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
 if(reply.exceptionDetails)throw new Error(`Browser JS error: ${reply.exceptionDetails.exception?.description??reply.exceptionDetails.text}`);
 return reply.result?.value;
}
async function until(expression,description,timeoutMs=15000){
 const end=Date.now()+timeoutMs;
 while(Date.now()<end){
  if(await evaluate(expression))return;
  await delay(220);
 }
 throw new Error(`Timed out waiting for ${description}`);
}
async function clickAndWait(selector,expression,description){
 const found=await evaluate(`(() => {const el=document.querySelector(${JSON.stringify(selector)});if(!el)return false;el.click();return true;})()`);
 assert.ok(found,`Missing clickable element: ${selector}`);
 await until(expression,description);
}
try{
 const healthResponse=await fetch(new URL('/api/health',base),{signal:abortAfter(5000)});
 assert.equal(healthResponse.status,200);
 const health=await healthResponse.json();
 assert.equal(health.application,'bsece-board-reviewer','A different service is listening at this URL');
 if(process.env.BSECE_EXPECTED_QA_NONCE) assert.equal(health.qaNonce,process.env.BSECE_EXPECTED_QA_NONCE,'Server identity token mismatch');
 assert.equal(health.status,'ok');
 const rootResponse=await fetch(base,{signal:abortAfter(5000)});
 assert.equal(rootResponse.status,200);
 assert.match(await rootResponse.text(),/id=["']root["']/);
 console.log('PASS: owned server health and HTML shell');
 temp=mkdtempSync(path.join(os.tmpdir(),'bsece-chrome28-'));
 child=spawn(browser,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
  '--no-first-run','--no-default-browser-check','--disable-extensions','--disable-background-networking',
  '--no-proxy-server','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0',
  '--remote-allow-origins=*',`--user-data-dir=${temp}`,'about:blank'],
  {stdio:'ignore',windowsHide:true});
 child.on('error',()=>{}); // avoid an uncaught spawn error; the debugger wait reports failure
 const port=await devtoolsPort();
 const listResponse=await fetch(`http://127.0.0.1:${port}/json/list`,{signal:abortAfter(5000)});
 const pages=await listResponse.json();
 const page=pages.find(p=>p.type==='page'&&p.webSocketDebuggerUrl);
 assert.ok(page,'Chromium has no inspectable page');
 ws=await connect(page.webSocketDebuggerUrl);
 ws.addEventListener('message',event=>{
  let data;try{data=JSON.parse(event.data);}catch{return;}
  if(data.method==='Runtime.exceptionThrown')exceptions.push(data.params?.exceptionDetails?.text??'Uncaught browser exception');
  if(!data.id)return;
  const entry=requests.get(data.id);if(!entry)return;
  requests.delete(data.id);clearTimeout(entry.timeout);
  if(data.error)entry.reject(new Error(data.error.message));else entry.resolve(data.result??{});
 });
 await send('Page.enable');await send('Runtime.enable');
 await send('Page.navigate',{url:base});
 await until('!!document.getElementById("nav-btn-calculator-skills")','React application to mount',20000);
 console.log('PASS: React navigation mounted in Chromium');
 await clickAndWait('#nav-btn-calculator-skills',
  `!!document.querySelector('main[aria-label="Canon Calculator Skills Center"]')`,'Calculator Skills screen');
 console.log('PASS: Calculator Skills opened through real browser click');
 // Find the numeric drill tab by its visible text; do not rely on a fragile component index.
 const numericSelected=await evaluate(`(() => {const el=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim()==='Numerical answer drills');if(!el)return false;el.click();return true;})()`);
 assert.ok(numericSelected,'Numerical drill tab not found');
 await until(`!!document.querySelector('section[aria-label="Calculator numeric-answer practice"]')`,'numeric drill practice screen');
 console.log('PASS: Numerical answer drills render in browser');
 await clickAndWait('#nav-btn-mock-exams',
  'document.body.innerText.includes("Mixed Practice Mock") || document.body.innerText.includes("Timed Mock")','mock assessment entry');
 console.log('PASS: Mock assessment navigation works');
 assert.equal(exceptions.length,0,`Uncaught browser exceptions: ${exceptions.join(' | ').slice(0,400)}`);
 console.log('PASS: no uncaught JS exceptions recorded during smoke journey');
 console.log('NOTE: Manual strict-exam, backup, numerical submissions and physical Canon device testing remain required.');
}catch(error){console.error(`FAIL v10.28 browser smoke: ${error.message}`);process.exitCode=1;}
finally{
 for(const entry of requests.values()){clearTimeout(entry.timeout);entry.reject(new Error('Browser closed'));}requests.clear();
 try{ws?.close();}catch{}
 if(child){child.kill('SIGTERM');await delay(350);if(child.exitCode===null)child.kill('SIGKILL');}
 if(temp)rmSync(temp,{recursive:true,force:true,maxRetries:2});
}
