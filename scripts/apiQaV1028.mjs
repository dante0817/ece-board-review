import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {chooseLoopbackPort,matchesOwnedHealth} from './runtimeHelpersV1028.mjs';
const port=await chooseLoopbackPort(),nonce=randomUUID(),base=`http://127.0.0.1:${port}`;
const report={generatedAt:new Date().toISOString(),tests:[],serverErrors:[]};
const child=spawn(process.execPath,['dist/server.cjs'],{env:{...process.env,HOST:'127.0.0.1',PORT:String(port),NODE_ENV:'production',GEMINI_API_KEY:'',BSECE_QA_NONCE:nonce},stdio:['ignore','ignore','pipe'],windowsHide:true});
child.stderr.on('data',d=>report.serverErrors.push(d.toString()));
const post=(url,body)=>fetch(base+url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(5000)});
async function test(name,fn){try{await fn();report.tests.push({name,status:'pass'});console.log('PASS '+name);}catch(e){report.tests.push({name,status:'fail',detail:e.message});console.log('FAIL '+name+': '+e.message);}}
try{
 for(let i=0;i<80;i++){try{if(matchesOwnedHealth(await (await fetch(base+'/api/health')).json(),undefined,nonce))break;}catch{}await new Promise(r=>setTimeout(r,100));}
 await test('Production health identity and no secret disclosure',async()=>{const r=await fetch(base+'/api/health');const h=await r.json();assert.ok(matchesOwnedHealth(h,undefined,nonce));assert.equal(h.hasGeminiKey,false);assert.ok(!('apiKey' in h));});
 await test('Curated flashcards fallback',async()=>{const r=await post('/api/gemini/generate-flashcards',{topics:[{id:'qa-topic',name:'Arithmetic Progressions'}],count:3});assert.equal(r.status,200);const h=await r.json();assert.equal(h.flashcards.length,3);assert.equal(h.source,'curated_fallback');});
 await test('Material-only flashcards fallback',async()=>{const r=await post('/api/gemini/generate-flashcards',{material:'DC circuit fundamentals',subjectName:'Electronics',count:2});assert.equal(r.status,200);assert.equal((await r.json()).flashcards.length,2);});
 await test('Curated error flashcards fallback',async()=>{const r=await post('/api/gemini/generate-error-flashcards',{errors:[{id:'qa-error',topicName:'Linear Equations',description:'Sign error'}],count:2});assert.equal(r.status,200);assert.equal((await r.json()).flashcards.length,2);});
 await test('Chat fallback JSON',async()=>{const r=await post('/api/chat',{messages:[{role:'user',content:'Explain arithmetic progressions'}],stream:false});assert.equal(r.status,200);assert.equal((await r.json()).isFallback,true);});
 await test('Chat fallback stream completes',async()=>{const r=await post('/api/chat',{messages:[{role:'user',content:'Explain RC circuits'}]});assert.equal(r.status,200);assert.match(await r.text(),/data: \[DONE\]/);});
 for(const [name,url,body] of [
  ['Empty flashcards','/api/gemini/generate-flashcards',{}],
  ['Empty error flashcards','/api/gemini/generate-error-flashcards',{}],
  ['Empty chat','/api/chat',{}],
  ['Invalid flashcard count','/api/gemini/generate-flashcards',{topics:[{id:'q',name:'Math'}],count:-1}],
  ['Invalid material type','/api/gemini/generate-flashcards',{material:42}],
  ['Invalid chat entry','/api/chat',{messages:[null]}],
  ['Null error entry','/api/gemini/generate-error-flashcards',{errors:[null]}],
  ['Null topic entry','/api/gemini/generate-flashcards',{topics:[null]}]
 ])await test(name+' safely rejected',async()=>{const r=await post(url,body);assert.equal(r.status,400);assert.equal((await fetch(base+'/api/health')).status,200);});
}finally{child.kill();await new Promise(r=>setTimeout(r,300));report.serverExitCode=child.exitCode;report.passed=report.tests.filter(t=>t.status==='pass').length;report.failed=report.tests.filter(t=>t.status==='fail').length;fs.writeFileSync('QA_REPORTS/api-'+(process.env.BSECE_QA_TAG||'local')+'.json',JSON.stringify(report,null,2)+'\n');console.log(`API QA: ${report.passed}/${report.tests.length} passed`);if(report.failed)process.exitCode=1;}
