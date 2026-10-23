/** v10.28 regression: validates isolation, typed server bindings, owned health checks,
 * safe non-certification defaults, and functional browser gate contracts. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {chooseLoopbackPort,matchesOwnedHealth,processIsAlive,automatedSmokeIsSuccessful} from './runtimeHelpersV1028.mjs';
const root=path.resolve(import.meta.dirname,'..');
const require=createRequire(import.meta.url),ts=require('typescript');
const source=fs.readFileSync(path.join(root,'src/domain/runtime/serverConfig.ts'),'utf8');
const compile=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},reportDiagnostics:true});
assert.equal(compile.diagnostics?.length??0,0);
const mod={exports:{}};new Function('module','exports',compile.outputText)(mod,mod.exports);
const {parseServerPort,parseServerHost,APP_HEALTH_IDENTITY}=mod.exports;
assert.equal(APP_HEALTH_IDENTITY,'bsece-board-reviewer');
assert.equal(parseServerPort(undefined),3000);assert.equal(parseServerPort('49152'),49152);assert.equal(parseServerPort('65535'),65535);
assert.equal(parseServerPort('1'),1);
for(const bad of ['0','65536','-5','3.14','4000junk',' 4000','Infinity','999999'])assert.throws(()=>parseServerPort(bad),/PORT/);
assert.equal(parseServerHost(undefined),'127.0.0.1');assert.equal(parseServerHost('127.0.0.1'),'127.0.0.1');
for(const bad of ['localhost','example.com','127.0.0.2','bad.host','::1; rm -rf'])assert.throws(()=>parseServerHost(bad),/HOST/);
const port1=await chooseLoopbackPort(),port2=await chooseLoopbackPort();
assert.ok(port1>0&&port1<65536);assert.ok(port2>0&&port2<65536);
assert.ok(matchesOwnedHealth({status:'ok',application:APP_HEALTH_IDENTITY}));
assert.ok(matchesOwnedHealth({status:'ok',application:APP_HEALTH_IDENTITY,qaNonce:'secret'},APP_HEALTH_IDENTITY,'secret'));
assert.equal(matchesOwnedHealth({status:'ok',application:APP_HEALTH_IDENTITY,qaNonce:'wrong'},APP_HEALTH_IDENTITY,'secret'),false);
for(const health of [null,undefined,{status:'ok'},{status:'ok',application:'other-app'},
 {status:'error',application:APP_HEALTH_IDENTITY},'ok'])assert.equal(matchesOwnedHealth(health),false);
assert.equal(processIsAlive({exitCode:null,signalCode:null}),true);
assert.equal(processIsAlive({exitCode:1,signalCode:null}),false);
assert.equal(processIsAlive(null),false);
const fullReport={packageLockMatches:true,processOwnership:'verified',installedTypecheck:{status:'pass'},
 fullBuild:{status:'pass'},browserSmoke:{status:'pass'}};
assert.equal(automatedSmokeIsSuccessful(fullReport),true);
for(const key of ['processOwnership','packageLockMatches','installedTypecheck','fullBuild','browserSmoke']){
 const variant={...fullReport};variant[key]=key==='packageLockMatches'?false:key==='processOwnership'?'not-run':{status:'not-run'};
 assert.equal(automatedSmokeIsSuccessful(variant),false,`Premature runtime success: ${key}`);
}
const server=fs.readFileSync(path.join(root,'server.ts'),'utf8');
for(const snippet of ['parseServerPort(process.env.PORT)','parseServerHost(process.env.HOST)',
 "application: APP_HEALTH_IDENTITY",'BSECE_QA_NONCE','server.listen(PORT, HOST','startServer().catch'])assert.ok(server.includes(snippet),snippet);
const gate=fs.readFileSync(path.join(root,'scripts/checkRuntimeCertificationV1028.mjs'),'utf8');
for(const snippet of ["NODE_ENV:'production'","HOST:'127.0.0.1'",'PORT:String(port)',
 'matchesOwnedHealth(health,undefined,nonce)','processIsAlive(child)','automatedSmokeIsSuccessful(result)',
 'BSECE_EXPECTED_QA_NONCE:nonce','smoke:browser:v10.28'])assert.ok(gate.includes(snippet),snippet);
const smoke=fs.readFileSync(path.join(root,'scripts/smokeBrowserV1028.mjs'),'utf8');
for(const snippet of ['Page.navigate',"#nav-btn-calculator-skills",'Canon Calculator Skills Center',
 'Numerical answer drills',"#nav-btn-mock-exams",'Runtime.exceptionThrown'])assert.ok(smoke.includes(snippet),snippet);
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const lock=JSON.parse(fs.readFileSync(path.join(root,'package-lock.json'),'utf8'));
assert.ok(/^10\.(?:2[89]|[3-9]\d)\.\d+$/.test(pkg.version));assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
assert.equal(pkg.scripts['certify:runtime:v10.28'],'node scripts/checkRuntimeCertificationV1028.mjs');
assert.equal(pkg.scripts['smoke:browser:v10.28'],'node scripts/smokeBrowserV1028.mjs');
console.log('PASS server PORT/HOST validation, invalid input rejection, loopback port allocation');
console.log('PASS owned health identity and process lifecycle safeguards');
console.log('PASS certification requires installed lint + build + owned process + interactive browser');
console.log('PASS browser smoke has React click-through checkpoints and uncaught exception capture');
console.log('PASS v10.28 package and lockfile versions synchronized');
console.log('NOTE: Source-level tests do not certify the React build, browser or physical calculator.');
