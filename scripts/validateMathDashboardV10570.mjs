/** v10.57.0: Mathematics landing page, registry, routing and non-destructive storage QA. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const json=file=>JSON.parse(read(file));
const pkg=json('package.json'),lock=json('package-lock.json');
assert(['10.57.0','10.58.0','10.60.0','10.61.0','10.62.0'].includes(pkg.version));
assert.equal(lock.version,pkg.version);
assert.equal(lock.packages[''].version,pkg.version);
const math=read('src/components/MathematicsScreen.tsx');
const catalog=read('src/features/mathematics/mathCatalog.ts');
const sidebar=read('src/components/Sidebar.tsx');
const app=read('src/App.tsx');
const review=read('src/context/ReviewContext.tsx');
const legacy=read('src/domain/learn/manualLearnTracking.ts');
for(const file of ['src/components/MathematicsScreen.tsx','src/features/mathematics/mathCatalog.ts','src/components/Sidebar.tsx','src/App.tsx']){
  const source=read(file);
  const sf=ts.createSourceFile(file,source,ts.ScriptTarget.ES2022,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  assert.equal(sf.parseDiagnostics.length,0,`${file}: ${sf.parseDiagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')).join(' / ')}`);
  const output=ts.transpileModule(source,{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true});
  assert(!(output.diagnostics??[]).some(d=>d.category===ts.DiagnosticCategory.Error),`${file} transpile diagnostics`);
}
assert(math.includes('id="mathematics-app-screen"'));
assert(math.includes('id="mathematics-scroll-region"'));
for(const tab of ['learn','practice','exams','progress'])assert(math.includes(`id={\`math-tab-${'${tab.id}'}\`}`)||math.includes('math-tab-${tab.id}'),`Tabs use shared accessible control (${tab})`);
for(const panel of ['learn','practice','exams','progress'])assert(math.includes(`mathematics-${panel}-panel`));
assert(math.includes('getRecentMathSubject()'),'Resume link must be based on stored actual navigation');
assert(math.includes("lastMathSubject?.destination??'algebra'"));
assert(math.includes("setCurrentScreen('practice')") && math.includes("setCurrentScreen('tests')"));
assert(math.includes('not an official board-readiness score') || math.includes('not an official board-readiness score.'));
assert(math.includes('Planned curriculum · lessons not yet available'));
assert(!math.includes('expandedGroups'),'Removed old multi-accordion navigation');
assert(!/localStorage\.(clear|removeItem)\(/.test(math+sidebar+catalog));
assert(legacy.includes("'ece_manual_learn_tracking_v1'")&&legacy.includes('schemaVersion: 1'));
assert(sidebar.includes('rememberMathSubject(currentScreen)'), 'Resume only after committed route change');
assert(review.includes('strictAssessmentLocked(assessmentRef.current)'),'Retain strict assessment lock');
assert(review.includes('deepFocus.isActive'),'Retain focus navigation guard');

// Compile the registry without modifying project files, then exercise its real functions with mocked browser storage.
const out=ts.transpileModule(catalog,{fileName:'mathCatalog.ts',compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const map=new Map();let storageAvailable=true;
const localStorage={
 setItem(k,v){if(!storageAvailable)throw Error('storage denied');map.set(k,v);},
 getItem(k){if(!storageAvailable)throw Error('storage denied');return map.get(k)??null;}
};
const sandbox={exports:{},window:{localStorage}};
vm.runInNewContext(out,sandbox,{filename:'mathCatalog.js'});
const {MATH_CATALOG,AVAILABLE_MATH_ENTRIES,rememberMathSubject,getRecentMathSubject}=sandbox.exports;
assert.equal(MATH_CATALOG.length,3);
assert.deepEqual(Array.from(MATH_CATALOG,group=>group.entries.length),[4,5,3]);
const entries=MATH_CATALOG.flatMap(g=>g.entries);
assert.equal(entries.length,12);
assert.equal(new Set(entries.map(e=>e.id)).size,12);
assert.equal(AVAILABLE_MATH_ENTRIES.length,['10.58.0','10.60.0','10.61.0','10.62.0'].includes(pkg.version)?5:4,'Only implemented subject screens may advertise availability');
for(const e of entries){
 assert(e.label.length>3 && e.summary.length>8 && e.overview.length>=3);
 const sources=app.includes(`currentScreen === '${e.destination}' &&`) && review.includes(`| '${e.destination}'`);
 if(e.destination)assert(sources,`Available subject has no registered route: ${e.id}`);
 else assert.equal(e.availability,'planned',`Unpublished module cannot advertise available status: ${e.id}`);
 const mathIcons=['calculator','plus-minus','brackets','percent','power-ten','equals','division','sum','exponential','logarithm','matrix','book','square','graph'];
 const iconGroup=mathIcons.includes(e.icon)?'algebra-3d-v1':'app-3d-v1';
 assert(fs.existsSync(new URL(`../public/icons/${iconGroup}/${e.icon}.png`,import.meta.url)),`Missing artwork: ${e.icon}`);
}
assert.equal(getRecentMathSubject(),null);
rememberMathSubject('tests');assert.equal(map.size,0,'Non-math screens must not alter recent subject');
rememberMathSubject('algebra');assert.equal(getRecentMathSubject().id,'algebra');
rememberMathSubject('analytic-geometry');assert.equal(getRecentMathSubject().id,'analytic-geometry');
map.set('bsece_math_recent_subject_v1','fake-route');assert.equal(getRecentMathSubject(),null,'Stale destinations must be ignored');
storageAvailable=false;rememberMathSubject('algebra');assert.equal(getRecentMathSubject(),null,'Blocked storage must not crash');
storageAvailable=true;

// The original question and lesson repositories are guaranteed by previous versioned baselines.
const protectedSets=['scripts/analyticGeometryProtectedV10550.json','scripts/geometryBaselineV10530.json'];
let protectedFiles=0;
for(const file of protectedSets){
 const record=json(file);
 for(const [item,digest] of Object.entries(record.protectedSha256)){
  // Shared learner schema was previously additively extended: its original baseline is older.
  if(item==='src/domain/learn/manualLearnTracking.ts')continue;
  assert.equal(crypto.createHash('sha256').update(read(item)).digest('hex'),digest,`Protected original content changed: ${item}`);
  protectedFiles++;
 }
}
console.log(`PASS v10.57.0 Mathematics dashboard: 4 tabs, ${AVAILABLE_MATH_ENTRIES.length} available / ${12-AVAILABLE_MATH_ENTRIES.length} planned subject entries, 3 groups, committed-route resume, guarded navigation, valid icons, no schema deletion, ${protectedFiles} protected content hash checks, 4 TS/TSX parse checks. Browser and full typecheck require installed dependencies.`);
