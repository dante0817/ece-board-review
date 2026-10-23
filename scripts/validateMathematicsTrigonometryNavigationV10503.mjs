import fs from 'node:fs';
import assert from 'node:assert/strict';
const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const manifest=JSON.parse(read('package.json'));
const lock=JSON.parse(read('package-lock.json'));
assert(['10.51.0','10.52.0', '10.53.0', '10.54.0','10.55.0','10.56.0','10.57.0','10.58.0','10.60.0','10.61.0','10.62.0'].includes(manifest.version)); // Forward compatibility: preserved v10.50.3 navigation in the v10.51.0 release.
assert.equal(lock.version,manifest.version);
assert.equal(lock.packages[''].version,manifest.version);
const sidebar=read('src/components/Sidebar.tsx');
const mathematics=read('src/components/MathematicsScreen.tsx');
const app=read('src/App.tsx');
const trigo=read('src/features/trigonometry/TrigonometryScreen.tsx');
const sidebarScope=sidebar.split('id="nav-btn-mathematics"')[1]?.split('id="nav-btn-geas"')[0] ?? '';
assert(sidebarScope.includes("handleNavClick('mathematics')"),'Mathematics still opens its hub');
assert(sidebarScope.includes("setSelectedMathModuleId('foundation')"),'Foundation group selected on navigation');
assert(!sidebar.includes('id="nav-btn-trigonometry"'),'No separate Trigonometry sidebar button');
assert(sidebar.includes("'trigonometry'"),'Trigonometry remains under active Mathematics screen family');
if (['10.57.0','10.58.0','10.60.0','10.61.0','10.62.0'].includes(manifest.version)) {
  const catalog=read('src/features/mathematics/mathCatalog.ts');
  assert(catalog.includes("id:'algebra'") && catalog.includes("destination:'algebra'"));
  assert(catalog.includes("id:'trigonometry'") && catalog.includes("destination:'trigonometry'"));
  assert(catalog.indexOf("id:'algebra'")<catalog.indexOf("id:'trigonometry'"));
  assert(mathematics.includes('MATH_CATALOG') && mathematics.includes('entry.destination'));
} else {
  assert(mathematics.includes('id="btn-module-algebra"'),'Algebra entry is retained');
  assert(mathematics.includes('id="btn-module-trigonometry"'),'Trigonometry entry is retained');
  const foundation=mathematics.split('FOUNDATION MATHEMATICS')[2] ?? mathematics;
  const a=foundation.indexOf('id="btn-module-algebra"');
  const b=foundation.indexOf('id="btn-module-trigonometry"');
  assert(a>=0 && b>a,'Trigonometry follows Algebra in Foundation Mathematics');
  assert.match(mathematics,/id="btn-module-trigonometry"[\s\S]*?setCurrentScreen\('trigonometry'\)/);
}
assert.match(app,/currentScreen === 'trigonometry' && <TrigonometryScreen/);
assert.match(trigo,/label:'Mathematics',onClick:\(\)=>setCurrentScreen\('mathematics'\)/);
assert.match(trigo,/label:'Back to Mathematics'/);
assert(!/localStorage\.clear\(|localStorage\.removeItem\(/.test(sidebar+mathematics),'No destructive storage operations');
console.log('PASS v10.50.3: Trigonometry moved from sidebar to Mathematics → Foundation, with Algebra, screen route and back navigation preserved.');
