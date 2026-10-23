/** Runtime gate. Never claims certification on the basis of source parsing alone.
 * Usage: npm run certify:runtime:v10.27 [-- --verify] [-- --output=path.json]
 * --verify runs the installed-dependency lint, full build, starts the local server,
 * and invokes the headless browser smoke. It cannot certify a physical calculator. */
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {runNpmScript} from './runNpmScript.mjs';
const root=path.resolve(import.meta.dirname,'..');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const lock=JSON.parse(fs.readFileSync(path.join(root,'package-lock.json'),'utf8'));
const names=['react','react-dom','vite','@vitejs/plugin-react','@tailwindcss/vite','express','ws','@google/genai','esbuild','tsx','typescript'];
const missing=names.filter(name=>!fs.existsSync(path.join(root,'node_modules',...name.split('/'),'package.json')));
const args=process.argv.slice(2),verify=args.includes('--verify');
const outputArg=args.find(a=>a.startsWith('--output='));
const result={app:'BSECE Board Reviewer',version:pkg.version,generatedAt:new Date().toISOString(),
 packageLockMatches:pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version,
 coreDependencies:{present:names.filter(n=>!missing.includes(n)),missing},
 installedTypecheck:'not-run',fullBuild:'not-run',browserSmoke:'not-run',physicalCanonF789SGA:'not-tested',
 qualifiedDeviceApproval:'not-verified',overall:'not-certified',limitations:[]};
function command(script,timeout=180000){
 const run=runNpmScript(script,{cwd:root,env:process.env,encoding:'utf8',timeout,maxBuffer:2*1024*1024,windowsHide:true});
 return {pass:run.status===0&&!run.error,exitCode:run.status,reason:run.error?.message??(run.stderr||run.stdout||'').slice(-650)};
}
let child;
async function awaitHealth(port,ms){
 const stop=Date.now()+ms;
 while(Date.now()<stop){
  if(child?.exitCode!==null)return false;
  try{const response=await fetch(`http://127.0.0.1:${port}/api/health`,{signal:AbortSignal.timeout(1200)});
   if(response.status===200&&(await response.json()).status==='ok')return true;
  }catch{}await new Promise(resolve=>setTimeout(resolve,600));
 }return false;
}
try{
 if(!result.packageLockMatches)result.limitations.push('package-lock version mismatch');
 if(missing.length)result.limitations.push(`${missing.length} required npm dependency packages missing: ${missing.join(', ')}`);
 if(verify&&result.packageLockMatches&&!missing.length){
  const type=command('lint');result.installedTypecheck=type.pass?'pass':`fail: ${type.reason}`;
  if(type.pass){
   const build=command('build');result.fullBuild=build.pass?'pass':`fail: ${build.reason}`;
   if(build.pass){
    // The application currently hard-codes port 3000. Check that it is not already occupied.
    let occupied=false;
    try{const existing=await fetch('http://127.0.0.1:3000/api/health',{signal:AbortSignal.timeout(1000)});occupied=existing.ok;}catch{}
    if(occupied){result.browserSmoke='not-run: port 3000 already occupied; close any app before certification';}
    else{
     child=spawn(process.execPath,['dist/server.cjs'],{cwd:root,env:process.env,stdio:'ignore',windowsHide:true});
     const healthy=await awaitHealth(3000,20000);
     if(healthy){const browser=command('smoke:browser:v10.23',55000);result.browserSmoke=browser.pass?'pass':`fail: ${browser.reason}`;}
     else result.browserSmoke='fail: server did not reach HTTP 200 /api/health within 20s';
    }
   }
  }
 }else if(verify){result.limitations.push('Full runtime checks cannot start until dependencies and lockfile are valid.');}
 if(result.installedTypecheck==='pass'&&result.fullBuild==='pass'&&result.browserSmoke==='pass'){
  result.overall='automated-app-smoke-passed; manual-browser-and-device-qa-pending';
 }else result.limitations.push('Installed-dependency build and browser certification incomplete.');
 result.limitations.push('Physical Canon F-789SGA keystrokes/LCD were not tested by this script.');
}finally{
 if(child){child.kill('SIGTERM');await new Promise(resolve=>setTimeout(resolve,250));if(child.exitCode===null)child.kill('SIGKILL');}
 const output=outputArg?.slice('--output='.length);
 if(output)fs.writeFileSync(path.resolve(root,output),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result,null,2));
 if(!result.packageLockMatches||result.overall==='not-certified')process.exitCode=2;
}
