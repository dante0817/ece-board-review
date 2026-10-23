/** DE pilot validation without network or third-party dependencies. */
import {readFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const text=p=>readFileSync(join(root,p),'utf8');
const curriculum=JSON.parse(text('src/features/differential-equations/deCurriculum.json'));
assert.equal(curriculum.length,54,'Curriculum must contain 54 specifications');
const uniq=(xs,label)=>assert.equal(new Set(xs).size,xs.length,`Duplicate ${label}`);
uniq(curriculum.map(x=>x.id),'display IDs');
uniq(curriculum.map(x=>x.runtimeLessonId),'runtime IDs');
uniq(curriculum.map(x=>x.proposedTrackingId),'manual tracking IDs');
const plans={DE01:6,DE02:8,DE03:8,DE04:8,DE05:8,DE06:8,DE07:8};
const tos={DE01:'Foundation',DE02:'3.1',DE03:'3.1',DE04:'3.2',DE05:'3.2',DE06:'3.3',DE07:'3.3'};
for(const [id,n] of Object.entries(plans))assert.equal(curriculum.filter(x=>x.moduleId===id).length,n,`module count ${id}`);
for(const row of curriculum){
  assert.match(row.id,/^DE0[1-7]-\d\d$/);
  assert.equal(row.runtimeLessonId,row.id.toLowerCase());
  assert.equal(row.tos,tos[row.moduleId]);
  assert.match(row.proposedTrackingId,/^chapter-top-de-0[1-7]-\d\d$/);
  assert.equal(row.proposedTrackingId,`chapter-top-de-${row.runtimeLessonId.slice(2,4)}-${row.runtimeLessonId.slice(5)}`);
  assert(row.title.length>3&&row.objective.length>15&&row.primary_supporting_sources.length>3);
}
const data=text('src/features/differential-equations/dePilotContent.ts');
const ui=text('src/features/differential-equations/DifferentialEquationsScreen.tsx');
const ids=['de02-02','de04-02','de06-02'];
for(const id of ids){
  assert(curriculum.some(x=>x.runtimeLessonId===id));
  assert(data.includes(`'${id}':draft('${id}'`),`pilot ${id}`);
  for(let i=1;i<=3;i++)assert(data.includes(`${id}-s${i}`),`${id} section ${i}`);
  for(const kind of ['worked-example','checkpoint']){
    const suffix=kind==='worked-example'?'example':'check';
    assert(data.includes(`id:'${id}-${suffix}',type:'${kind}'`),`${id} ${kind}`);
  }
}
assert.equal((data.match(/type:'worked-example'/g)||[]).length,3);
assert.equal((data.match(/type:'checkpoint'/g)||[]).length,3);
assert.match(data,/DE_APPROVED_EXAM_QUESTION_IDS:readonly string\[\]=\[\]/);
assert.match(data,/DE_EXAM_READY=false/);
const cells=[{knowledge:1,comprehension:1,application:4,analysis:0,total:6},{knowledge:0,comprehension:1,application:2,analysis:1,total:4},{knowledge:0,comprehension:0,application:4,analysis:1,total:5}];
assert.equal(cells.reduce((a,x)=>a+x.total,0),15);
for(const c of cells)assert.equal(c.total,c.knowledge+c.comprehension+c.application+c.analysis);
for(const [f,token] of [
 ['src/features/mathematics/mathCatalog.ts',"destination:'differential-equations'"],
 ['src/context/ReviewContext.tsx',"| 'differential-equations'"],
 ['src/App.tsx',"currentScreen === 'differential-equations'"],
 ['src/App.tsx',"'differential-equations',"],
 ['src/components/Sidebar.tsx',"'differential-equations',"],
 ['src/features/differential-equations/DifferentialEquationsScreen.tsx','de-scroll-region'],
 ])assert(text(f).includes(token),`Missing route or UI contract ${f} (${token})`);
assert(ui.includes('disabled={!pilot}'),'nonpilot planned lessons must be disabled');
assert(ui.includes('Not approved for scored PRC mock examinations'),'fail closed status visible');
assert(!text('src/components/MathematicsScreen.tsx').includes('DifferentialEquationsScreen'),'Math landing should remain generic');
console.log('PASS: 54 curriculum entries, 7 module counts, 3 drafts × 3 sections, identifiers, ungraded checkpoints, no exam eligibility, routing, and disabled planned lessons.');
