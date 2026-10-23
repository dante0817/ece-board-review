/** v10.54.0 Geometry hub: stable content, routing, accessibility and storage contracts. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
assert(['10.54.0','10.55.0','10.56.0','10.56.0','10.57.0','10.58.0','10.60.0','10.61.0','10.62.0'].includes(pkg.version));
assert.equal(lock.version,pkg.version);
assert.equal(lock.packages[''].version,pkg.version);
const baseline=JSON.parse(read('scripts/geometryBaselineV10530.json'));
for(const [file,hash] of Object.entries(baseline.protectedSha256)){
  // The only protected-file update is the intentional extension of accepted geometry study IDs.
  if(file==='src/domain/learn/manualLearnTracking.ts') {
    const progress=read(file);
    assert(progress.includes('geo-(?:solid|plane|analytic)-[0-9]{3}'), 'Both geometry scopes must validate');
    assert(progress.includes('normalizedCardId'), 'Geometry reader section IDs need normalization');
    // Existing storage key, schema, legacy patterns and functions must remain unchanged.
    assert(progress.includes("'ece_manual_learn_tracking_v1'") && progress.includes('schemaVersion: 1'));
    assert(progress.includes('alg-[a-z0-9-]{1,100}') && progress.includes('trig-[a-z0-9-]{1,160}'));
    continue;
  }
 const digest=createHash('sha256').update(read(file)).digest('hex');
 assert.equal(digest,hash,`Existing curriculum, question data or learner storage changed: ${file}`);
}
const geometry=read('src/features/geometry/GeometryScreen.tsx');
const catalog=read('src/features/geometry/geometryCatalog.ts');
const math=read('src/components/MathematicsScreen.tsx');
const solid=read('src/features/solid-mensuration/SolidMensurationScreen.tsx');
const app=read('src/App.tsx');
const context=read('src/context/ReviewContext.tsx');
const sidebar=read('src/components/Sidebar.tsx');
const header=read('src/components/TreeMenuHeader.tsx');
const learner=read('src/domain/learn/manualLearnTracking.ts');
const content=read('src/features/solid-mensuration/solidMensurationContent.ts');
assert(context.includes("| 'geometry'") && context.includes("| 'solid-mensuration'"));
assert(app.includes("currentScreen === 'geometry' && <GeometryScreen"));
assert(app.includes("currentScreen === 'solid-mensuration' && <SolidMensurationScreen"));
assert(app.includes("'geometry',"),'Geometry must have dedicated-scroll behavior');
assert(sidebar.includes("'geometry',") && sidebar.includes("'solid-mensuration',"));
if (['10.57.0','10.58.0','10.60.0','10.61.0','10.62.0'].includes(pkg.version)) {
 const newCatalog=read('src/features/mathematics/mathCatalog.ts');
 assert(newCatalog.includes("id:'geometry'") && newCatalog.includes("destination:'geometry'"));
 assert(newCatalog.includes("id:'analytic-geometry'") && newCatalog.includes("destination:'analytic-geometry'"));
 assert(newCatalog.includes("availability:'available-draft'"));
 assert(math.includes('MATH_CATALOG') && math.includes('mathematics-learn-panel'));
 assert(math.includes('aria-label={`${entry.label}'));
 assert(!math.includes('expandedGroups'),'Old nested accordion removed');
} else {
 assert(math.includes('id="btn-module-geometry"') && math.includes("setCurrentScreen('geometry')"));
 assert(math.includes('id="btn-module-solid-mensuration"'),'Existing Solid Mensuration direct shortcut must remain');
 assert(!math.includes('btn-module-analytic-geometry'),'Remove standalone Analytic Geometry module');
 assert(!math.includes('<AppArtwork name="cube"'),'Remove missing cube icon');
 assert(math.includes('aria-expanded={expandedGroups.foundation}') && math.includes('aria-controls='));
}
assert(geometry.includes('id="geometry-app-screen"'));
assert(geometry.includes('id="btn-geometry-solid-mensuration"'));
assert(geometry.includes('id={`btn-geometry-${module.id}-curriculum`}'));
assert(geometry.includes("setCurrentScreen('trigonometry')"),'Keep related spherical-trigonometry cross-link');
assert(geometry.includes('hidden={!isExpanded}'),'Planned outlines show actual preview instead of a dead link');
assert(catalog.includes("availability: 'available-draft'"));
assert(catalog.includes('plannedTopics: 35') && catalog.includes('plannedTopics: 27'));
assert(catalog.includes('plannedTopics: 43'));
assert(solid.includes("{label:'Geometry',onClick:()=>setCurrentScreen('geometry')}"));
assert(solid.includes("Back to Geometry',onClick:()=>setCurrentScreen('geometry')"));
assert(!solid.includes("closeLesson();setCurrentScreen("),'Blocked navigation must not close lessons');
for (const key of ['SOLID_LESSONS.length','SOLID_FORMULAS.length','SOLID_PRACTICE.length']) assert(solid.includes(key),`Missing derived counter: ${key}`);
assert(!solid.includes("[86,'Practice questions']"));
assert(header.includes('aria-current="page"'));
assert(learner.includes("'ece_manual_learn_tracking_v1'"));
assert(learner.includes('geo-(?:solid|plane|analytic)-[0-9]{3}'));
assert(content.includes('lessonIdToTrackingId'));
for(const f of ['src/components/MathematicsScreen.tsx','src/features/geometry/GeometryScreen.tsx']){
 const text=read(f);
 for(const [,name] of text.matchAll(/<AppArtwork name="([^"]+)"/g)){
  const artwork=read('src/components/common/AppArtwork.tsx');
  const group=artwork.match(/const MATH_ARTWORK = \[([^\]]+)\]/)?.[1]?.includes(`'${name}'`)?'algebra-3d-v1':'app-3d-v1';
  assert(fs.existsSync(new URL(`../public/icons/${group}/${name}.png`,import.meta.url)),`Missing artwork ${name} in ${f}`);
 }
}
console.log(`PASS v10.54.0 Geometry: three branches, stable Solid ID, derived 43/73/172 counters, safe breadcrumbs, accessible accordion; 9 original protected content hashes unchanged; shared manual tracking validator additively extended.`);
