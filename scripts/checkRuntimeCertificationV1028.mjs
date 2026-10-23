/**
 * v10.28 certification gate: `node scripts/checkRuntimeCertificationV1028.mjs --verify --output=<path>`
 * Uses an isolated, loopback-only app process on a free port, checks its identity,
 * runs the installed-dependency build and a functional browser journey.
 * A clean source QA result alone is NEVER runtime certification.
 */
import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {runNpmScript} from './runNpmScript.mjs';
import {chooseLoopbackPort,matchesOwnedHealth,processIsAlive,automatedSmokeIsSuccessful} from './runtimeHelpersV1028.mjs';
const root=path.resolve(import.meta.dirname,'..');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const lock=JSON.parse(fs.readFileSync(path.join(root,'package-lock.json'),'utf8'));
const required=['react','react-dom','vite','@vitejs/plugin-react','@tailwindcss/vite','express','ws','@google/genai','esbuild','tsx','typescript'];
const missing=required.filter(name=>!fs.existsSync(path.join(root,'node_modules',...name.split('/'),'package.json')));
const args=process.argv.slice(2),verify=args.includes('--verify'),outputArg=args.find(a=>a.startsWith('--output='));
const result={app:'BSECE Board Reviewer',version:pkg.version,generatedAt:new Date().toISOString(),
 packageLockMatches:pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version,
 coreDependencies:{present:required.filter(n=>!missing.includes(n)),missing},
 installedTypecheck:{status:'not-run'},fullBuild:{status:'not-run'},
 processOwnership:'not-run',browserSmoke:{status:'not-run'},
 physicalCanonF789SGA:'not-tested',qualifiedDeviceApproval:'not-verified',
 overall:'not-certified',limitations:[]};
function command(name,timeout,env=process.env){
 const proc=runNpmScript(name,{cwd:root,encoding:'utf8',env,timeout,maxBuffer:4*1024*1024,windowsHide:true});
 return {status:proc.status===0&&!proc.error?'pass':'fail',exitCode:proc.status,
  detail:(proc.error?.message??(proc.stderr||proc.stdout||'').slice(-1100))||''};
}
let child;
async function ownedHealth(port,nonce,timeoutMs){
 const end=Date.now()+timeoutMs;
 while(Date.now()<end){
  if(!processIsAlive(child))return {ok:false,reason:'Server process exited before reaching health endpoint'};
  try{
   const response=await fetch(`http://127.0.0.1:${port}/api/health`,{signal:AbortSignal.timeout(900)});
   if(response.ok){const health=await response.json();
    if(matchesOwnedHealth(health,undefined,nonce))return {ok:true};
    return {ok:false,reason:'Health endpoint belongs to an unknown application'};
   }
  }catch{}
  await new Promise(resolve=>setTimeout(resolve,350));
 }
 return {ok:false,reason:'App did not become healthy within the startup timeout'};
}
try{
 if(!result.packageLockMatches)result.limitations.push('Package and lockfile versions differ.');
 if(missing.length)result.limitations.push(`${missing.length} npm packages are not locally installed: ${missing.join(', ')}.`);
 if(verify&&result.packageLockMatches&&!missing.length){
  result.installedTypecheck=command('lint',180000);
  if(result.installedTypecheck.status==='pass'){
   result.fullBuild=command('build',180000);
   if(result.fullBuild.status==='pass'){
    const port=await chooseLoopbackPort();
    const nonce=randomUUID();
    const env={...process.env,NODE_ENV:'production',HOST:'127.0.0.1',PORT:String(port),BSECE_QA_NONCE:nonce};
    child=spawn(process.execPath,['dist/server.cjs'],{cwd:root,env,stdio:'ignore',windowsHide:true});
    child.on('error',()=>{}); // ownedHealth reports a child startup failure
    const health=await ownedHealth(port,nonce,25000);
    if(health.ok){
     result.processOwnership='verified';
     result.browserSmoke=command('smoke:browser:v10.28',75000,{...process.env,BSECE_SMOKE_URL:`http://127.0.0.1:${port}`,BSECE_EXPECTED_QA_NONCE:nonce});
    }else{
     result.processOwnership=`fail: ${health.reason}`;
     result.browserSmoke={status:'not-run',detail:'No verified application process available.'};
    }
   }
  }
 }else if(verify){result.limitations.push('Full runtime checks require a complete npm install and matching lockfile.');}
 if(automatedSmokeIsSuccessful(result))result.overall='automated-runtime-smoke-passed; manual-and-device-review-pending';
 else result.limitations.push('Installed-dependency lint, full build, owned server and real browser journey have not all passed.');
 result.limitations.push('Physical Canon F-789SGA operation and editorial device approval were not tested.');
}finally{
 if(child){child.kill('SIGTERM');await new Promise(resolve=>setTimeout(resolve,400));if(processIsAlive(child))child.kill('SIGKILL');}
 if(outputArg){const file=path.resolve(root,outputArg.slice(9));fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(result,null,2)+'\n');}
 console.log(JSON.stringify(result,null,2));
 if(result.overall==='not-certified')process.exitCode=2;
}
