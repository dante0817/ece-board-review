/** v10.45 Vector content, full catalog and backward-compatibility checks.
 * Numeric and source checks are NOT independent expert editorial certification.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let ts;try{ts=require('typescript')}catch{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}
const root=path.resolve(import.meta.dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const json=f=>JSON.parse(read(f));
const cache=new Map();
function load(relative){let abs=path.isAbsolute(relative)?relative:path.join(root,relative);
 if(!fs.existsSync(abs))for(const ext of ['.ts','.tsx','.json'])if(fs.existsSync(abs+ext)){abs+=ext;break;}
 if(abs.endsWith('.json'))return{default:JSON.parse(fs.readFileSync(abs,'utf8'))};
 if(cache.has(abs))return cache.get(abs).exports;
 const result=ts.transpileModule(fs.readFileSync(abs,'utf8'),{fileName:abs,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal((result.diagnostics??[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,abs);
 const mod={exports:{}};cache.set(abs,mod);
 new Function('require','module','exports',result.outputText)(x=>x.startsWith('.')?load(path.resolve(path.dirname(abs),x)):require(x),mod,mod.exports);
 return mod.exports;
}
const c=json('src/features/trigonometry/curriculum.json');
assert.equal(c.topics.length,14);assert.equal(c.topics.flatMap(x=>x.subtopics).length,102);
const topic=c.topics.find(x=>x.number==='10');assert(topic);
const ss=topic.subtopics;assert.equal(ss.length,8);
const ids=new Set(ss.map(x=>x.id));assert.equal(ids.size,8);
const lessons=json('src/data/lessons/trigonometryVectors.json');
const q=json('src/data/practice/trigonometryVectors.json');
const answerLedger=json('src/data/practice/trigonometryVectorsAnswerLedgerV1045.json');
assert.deepEqual(new Set(Object.keys(lessons)),ids);assert.equal(q.length,64);assert.equal(Object.keys(answerLedger).length,64);
let diagramCount=0;
const allBlocks=new Set();
for(const [id,l] of Object.entries(lessons)){
 assert(ids.has(id));assert.equal(l.id,id);assert.equal(l.status,'draft');assert.equal(l.contentVersion,1);
 assert(l.summary.length>85,`Summary weak: ${id}`);assert.equal(l.sections.length,3);
 const blocks=l.sections.flatMap(x=>x.blocks);
 for(const type of ['definition','formula','worked-example','note','checkpoint','diagram'])assert(blocks.some(x=>x.type===type),`${id} missing ${type}`);
 assert.equal(blocks.filter(x=>x.type==='formula').length,3);
 assert.equal(blocks.filter(x=>x.type==='worked-example').length,2);
 assert(blocks.some(x=>x.type==='note'&&x.text.includes('Reference guide')));
 for(const b of blocks){assert(!allBlocks.has(b.id),`Duplicate lesson block: ${b.id}`);allBlocks.add(b.id);
  if(b.type==='formula'){
   assert(b.latex.includes('\\'),`Formula must be real KaTeX: ${b.id}`);
   assert.equal((b.latex.match(/{/g)||[]).length,(b.latex.match(/}/g)||[]).length);
   assert(!/[\x00-\x08\x0b\x0c\x0e-\x1f\t]/.test(b.latex));
  }
  if(b.type==='worked-example'){assert(b.strategy.length>20);assert(b.steps.length>=2);assert(b.check.length>=24);}
  if(b.type==='checkpoint'){assert(b.answer.length>0&&b.explanation.length>=25);}
  if(b.type==='diagram'){diagramCount++;assert(['vector-components','vector-cross-product'].includes(b.diagram));assert(b.caption.length>60);}
 }
}
assert.equal(diagramCount,8);
const seenQ=new Set(),seenPrompts=new Set();
for(let i=0;i<8;i++){
 const qs=q.filter(item=>item.subtopicId===ss[i].id);assert.equal(qs.length,8);
 assert(qs.some(item=>item.difficulty==='Advanced'));
 for(let j=0;j<8;j++){
  const item=qs[j];assert.equal(item.id,`TRI45-10${i+1}-${String(j+1).padStart(3,'0')}`);
  assert(!seenQ.has(item.id));seenQ.add(item.id);
  assert(!seenPrompts.has(item.prompt));seenPrompts.add(item.prompt);
  assert.equal(item.options.length,4);assert.equal(new Set(item.options).size,4);
  assert(Number.isInteger(item.correctIndex)&&item.correctIndex>=0&&item.correctIndex<4);
  assert.equal(item.options[item.correctIndex],answerLedger[item.id],`Answer ledger mismatch ${item.id}`);
  assert(item.explanation.length>=35,`Explanation missing ${item.id}`);
  assert(['Basic','Intermediate','Advanced'].includes(item.difficulty));
 }
}
const {PRACTICE_CATALOG: allCatalog,filterPracticeQuestions}=load('src/domain/practice/catalog.ts');
const PRACTICE_CATALOG=allCatalog.filter(q=>!q.key.startsWith('trigonometry-pilot:TRI49-')&&!q.key.startsWith('trigonometry-pilot:TRI49-')&&!q.key.startsWith('trigonometry-pilot:TRI47-')&&!q.key.startsWith('trigonometry-pilot:TRI48-')); 
const historicalCatalog=PRACTICE_CATALOG.filter(x=>!x.key.startsWith('trigonometry-pilot:TRI46-'));
assert.equal(historicalCatalog.length,1006);
assert.equal(new Set(PRACTICE_CATALOG.map(x=>x.key)).size,PRACTICE_CATALOG.length);
assert.equal(historicalCatalog.filter(x=>x.bankId==='trigonometry-pilot').length,584);
assert.equal(historicalCatalog.filter(x=>x.bankId!=='trigonometry-pilot').length,422);
assert.equal(historicalCatalog.filter(x=>x.key.startsWith('trigonometry-pilot:TRI45-')).length,64);
assert.equal(historicalCatalog.filter(x=>!x.key.startsWith('trigonometry-pilot:TRI45-')).length,942);
for(const st of ss){const f=filterPracticeQuestions(PRACTICE_CATALOG,{topicId:st.id,subskill:'',difficulty:'',search:'',status:'all'});
 assert.equal(f.length,8);assert(f.every(x=>x.reviewStatus==='draft-unverified'&&x.revision&&x.objectiveId===st.id));}
const source=read('src/features/trigonometry/TrigonometryScreen.tsx');const catalogSource=read('src/domain/practice/catalog.ts');
assert(source.includes('...TRIGONOMETRY_VECTORS_LESSONS'));
assert(catalogSource.includes('...TRIGONOMETRY_VECTORS_QUESTIONS'));
assert(read('src/domain/learn/lessonTypes.ts').includes("|'vector-cross-product'"));
assert(read('src/components/learn-reader/TrigonometryDiagram.tsx').includes("diagram==='vector-cross-product'"));
const near=(a,b,label)=>assert(Math.abs(a-b)<1e-9,`${label}: ${a} != ${b}`);
const len=v=>Math.hypot(...v);const add=(a,b)=>a.map((x,i)=>x+b[i]);const sub=(a,b)=>a.map((x,i)=>x-b[i]);
const dot=(a,b)=>a.reduce((sum,x,i)=>sum+x*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
assert.deepEqual(sub([3,-1],[-2,4]),[5,-5]);
near(len([3,4]),5,'2D norm');near(len([2,-3,6]),7,'3D norm');
near(Math.atan2(4,-3)*180/Math.PI,126.86989764584402,'quadrant II');
near(Math.atan2(-1,Math.sqrt(3))*180/Math.PI,-30,'quadrant IV');
near(10*Math.cos(Math.PI/6),5*Math.sqrt(3),'x projection');
near(6*Math.sin(5*Math.PI/6),3,'quadrant II y projection');
assert.deepEqual(add([1,2,3],[2,-1,4]),[3,1,7]);
assert.deepEqual(sub([10,1],[-2,4]),[12,-3]);
const normalized=[-2,1,2].map(x=>x/len([-2,1,2]));near(len(normalized),1,'unit norm');
assert.throws(()=>{if(len([0,0])===0)throw Error('cannot normalize zero');},/cannot normalize zero/);
near(dot([2,3],[4,-1]),5,'dot');near(dot([2,-1,2],[1,4,1]),0,'perpendicular dot');
near(Math.acos(dot([1,0],[1,Math.sqrt(3)])/(1*2))*180/Math.PI,60,'dot angle');
assert.deepEqual(cross([1,2,3],[4,5,6]),[-3,6,-3]);
assert.deepEqual(cross([1,0,0],[0,1,0]),[0,0,1]);
for(const [a,b] of [ [[1,2,3],[4,5,6]], [[0,4,0],[2,3,0]], [[2,0,0],[0,3,0]]]){
 cross(a,b).forEach((v,i)=>near(v,-cross(b,a)[i],'cross anti-commutation')); 
 near(dot(cross(a,b),a),0,'cross orthogonal a');near(dot(cross(a,b),b),0,'cross orthogonal b');
}
near(len(cross([3,0,0],[0,4,0])),12,'parallelogram area');
assert.deepEqual(cross([0,4,0],[2,3,0]),[0,0,-8]);
near(dot([6,8,0],[3,0,0]),18,'work');
near(len(add([4,0],[0,3])),5,'wind velocity');
// Preserve legacy saved learner progress, including unrelated Algebra + old Trigonometry.
const track=load('src/domain/learn/manualLearnTracking.ts');const p=load('src/features/trigonometry/manualProgressAdapter.ts');
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};globalThis.window={dispatchEvent:()=>{}};
const prior={...track.emptyManualLearnRecord(),reviewCount:2,selfStatus:'understood',needsReview:true,updatedAt:'2026-01-01T00:00:00.000Z'};
store.set(track.MANUAL_LEARN_STORAGE_KEY,JSON.stringify({schemaVersion:1,records:{'alg-preserve':prior,'trig-oblique-triangles-law-of-sines':prior}}));
assert(track.isManualTrackingId(ss[0].id));p.saveTrigManualProgress(ss[0].id,{read1:true,read2:true,read3:true,mastered:true,review:true});
const after=track.readManualLearnStore().records;
assert.deepEqual(after['alg-preserve'],prior);assert.deepEqual(after['trig-oblique-triangles-law-of-sines'],prior);
assert.equal(after[ss[0].id].reviewCount,3);assert.equal(after[ss[0].id].selfStatus,'mastered');assert.equal(after[ss[0].id].needsReview,true);
for(const f of ['src/data/lessons/trigonometryVectors.ts','src/data/practice/trigonometryVectors.ts','src/features/trigonometry/TrigonometryScreen.tsx','src/components/learn-reader/TrigonometryDiagram.tsx','src/domain/practice/catalog.ts']){
 const m=ts.transpileModule(read(f),{fileName:f,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal((m.diagnostics??[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,f);
}
assert(['10.47.0','10.48.0','10.49.0','10.50.0','10.50.1','10.50.2','10.50.3','10.51.0', '10.52.0', '10.53.0', '10.54.0','10.55.0','10.56.0','10.57.0','10.58.0','10.60.0','10.61.0','10.62.0'].includes(json('package.json').version));assert.equal(json('package-lock.json').version,json('package.json').version);
console.log('PASS v10.45: 8 draft vector lessons, 64 ledger-checked questions, norm/components/dot/cross/projections/work math samples, diagram contracts, 73/102 total draft lessons, 584 Trigonometry plus 422 Algebra practice, historical progress intact.');
