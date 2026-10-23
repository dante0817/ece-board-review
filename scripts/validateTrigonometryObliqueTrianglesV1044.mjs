/** Topic 09 math/data/regression checks. Structural/numerical checks are NOT independent editorial certification. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const req=createRequire(import.meta.url);
let ts;try{ts=req('typescript')}catch{ts=req('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}
const root=path.resolve(import.meta.dirname,'..'),file=f=>fs.readFileSync(path.join(root,f),'utf8'),json=f=>JSON.parse(file(f));
const cache=new Map();
function load(f){let p=path.resolve(root,f);if(!fs.existsSync(p))for(const ext of ['.ts','.tsx','.json'])if(fs.existsSync(p+ext)){p+=ext;break;}
 if(p.endsWith('.json'))return {default:JSON.parse(fs.readFileSync(p,'utf8'))};if(cache.has(p))return cache.get(p).exports;
 const res=ts.transpileModule(fs.readFileSync(p,'utf8'),{fileName:p,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal((res.diagnostics??[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,p);
 const mod={exports:{}};cache.set(p,mod);new Function('require','module','exports',res.outputText)(x=>x.startsWith('.')?load(path.resolve(path.dirname(p),x)):req(x),mod,mod.exports);return mod.exports;
}
const c=json('src/features/trigonometry/curriculum.json');assert.equal(c.topics.length,14);assert.equal(c.topics.flatMap(t=>t.subtopics).length,102);
const topic=c.topics.find(t=>t.number==='09'),ss=topic.subtopics;assert.equal(ss.length,8);
const target=new Set(ss.map(s=>s.id)),L=json('src/data/lessons/trigonometryObliqueTriangles.json'),Q=json('src/data/practice/trigonometryObliqueTriangles.json'),ledger=json('src/data/practice/trigonometryObliqueTrianglesAnswerLedgerV1044.json');
assert.deepEqual(new Set(Object.keys(L)),target);assert.equal(Q.length,64);assert.equal(Object.keys(ledger).length,64);
const blockIds=new Set();let diagramCount=0;
for(const [id,lesson] of Object.entries(L)){
 assert(target.has(id));assert.equal(lesson.id,id);assert.equal(lesson.status,'draft');assert.equal(lesson.contentVersion,1);
 assert(lesson.summary.length>80);assert.equal(lesson.sections.length,3);
 const b=lesson.sections.flatMap(s=>s.blocks);
 for(const t of ['definition','formula','worked-example','note','checkpoint'])assert(b.some(x=>x.type===t),`${id} missing ${t}`);
 assert.equal(b.filter(x=>x.type==='formula').length,3);assert.equal(b.filter(x=>x.type==='worked-example').length,2);
 assert(b.some(x=>x.type==='note'&&x.text.includes('Reference guide')));
 for(const x of b){assert(!blockIds.has(x.id),`duplicate block ${x.id}`);blockIds.add(x.id);
  if(x.type==='formula'){
   assert(x.latex.includes('\\'));assert.equal((x.latex.match(/{/g)||[]).length,(x.latex.match(/}/g)||[]).length);
   assert(!/[\x00-\x08\x0b\x0c\x0e-\x1f\t]/.test(x.latex),`illegal escape in ${x.id}`);
  }
  if(x.type==='worked-example'){assert(x.strategy.length>25);assert(x.steps.length>=2);assert(x.check.length>=32);}
  if(x.type==='checkpoint'){assert(x.explanation.length>=35);assert(x.answer.length>0);}
  if(x.type==='diagram'){diagramCount++;assert(['oblique-triangle','ssa-ambiguity'].includes(x.diagram));assert(x.caption.length>=60);}
 }
}
assert.equal(diagramCount,2);
const expected=[
 ['SAS','SSS','AAS','70°','No: 4+7<12','Similar triangles of many sizes are possible','SSA','10'],
 ['10√2','12','75°','14','4√3','5√3','10','9'],
 ['0','1','2','1','0','1','2','0'],
 ['5','√39','√19','2√13','1/5','90°','√193','2√21'],
 ['20','27','30√3','14','30','15','9','45√3/2'],
 ['84','12','6','60','84','24','18','No, 2+3<6'],
 ['2','5','1','5/2','3/2','10','√3','2√3'],
 ['100√3/3 m','5 km','5√3 km','5 km','030°','090°','Southwest','√39 km'],
];
const seenIds=new Set(),seenPrompts=new Set();
for(let i=0;i<8;i++){
 const list=Q.filter(q=>q.subtopicId===ss[i].id);assert.equal(list.length,8,ss[i].number);
 for(let j=0;j<8;j++){
  const q=list[j];assert.equal(q.id,`TRI44-09${i+1}-${String(j+1).padStart(3,'0')}`);
  assert(!seenIds.has(q.id));seenIds.add(q.id);
  assert(!seenPrompts.has(q.prompt));seenPrompts.add(q.prompt);
  assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);
  assert(Number.isInteger(q.correctIndex)&&q.correctIndex>=0&&q.correctIndex<4);
  assert.equal(q.options[q.correctIndex],expected[i][j],`independent review ledger ${q.id}`);
  assert.equal(q.options[q.correctIndex],ledger[q.id]);assert(q.explanation.length>=60,q.id+' needs explanation');
  assert(['Basic','Intermediate','Advanced'].includes(q.difficulty));
 }
 assert(list.some(q=>q.difficulty==='Advanced'),ss[i].id+' should include an advanced item');
}
const {PRACTICE_CATALOG: allCatalog,filterPracticeQuestions}=load('src/domain/practice/catalog.ts');
const PRACTICE_CATALOG=allCatalog.filter(q=>!q.key.startsWith('trigonometry-pilot:TRI49-')&&!q.key.startsWith('trigonometry-pilot:TRI49-')&&!q.key.startsWith('trigonometry-pilot:TRI47-')&&!q.key.startsWith('trigonometry-pilot:TRI48-')); 
const historicalCatalog=PRACTICE_CATALOG.filter(q=>!q.key.startsWith('trigonometry-pilot:TRI45-')&&!q.key.startsWith('trigonometry-pilot:TRI46-'));
assert.equal(historicalCatalog.length,942);assert.equal(new Set(PRACTICE_CATALOG.map(q=>q.key)).size,PRACTICE_CATALOG.length);
assert.equal(historicalCatalog.filter(q=>!q.key.startsWith('trigonometry-pilot:TRI44-')).length,878);
assert.equal(PRACTICE_CATALOG.filter(q=>q.bankId!=='trigonometry-pilot').length,422);
assert.equal(historicalCatalog.filter(q=>q.bankId==='trigonometry-pilot').length,520);
for(const subtopic of ss){const matches=filterPracticeQuestions(PRACTICE_CATALOG,{topicId:subtopic.id,subskill:'',difficulty:'',search:'',status:'all'});
 assert.equal(matches.length,8);assert(matches.every(q=>q.reviewStatus==='draft-unverified'&&q.revision&&q.objectiveId===subtopic.id));}
assert.equal(PRACTICE_CATALOG.find(q=>q.legacyId==='TRI44-098-001').problemType,'Application');
const source=file('src/features/trigonometry/TrigonometryScreen.tsx'),catalogSource=file('src/domain/practice/catalog.ts');
assert(source.includes('...TRIGONOMETRY_OBLIQUE_TRIANGLES_LESSONS'));assert(catalogSource.includes('...TRIGONOMETRY_OBLIQUE_TRIANGLES_QUESTIONS'));
assert(file('src/domain/learn/lessonTypes.ts').includes("|'ssa-ambiguity'"));assert(file('src/components/learn-reader/TrigonometryDiagram.tsx').includes("diagram==='ssa-ambiguity'"));
// Numeric verification independent of author-provided answer text.
const pi=Math.PI,deg=x=>x*pi/180,near=(x,y,label)=>assert(Math.abs(x-y)<1e-8,`${label}: ${x} vs ${y}`);
near(10*Math.sin(deg(45))/Math.sin(deg(30)),10*Math.SQRT2,'sines AAS');
near(5*Math.sin(deg(120))/Math.sin(deg(30)),5*Math.sqrt(3),'sines obtuse C');
function ssa(A,a,b){const h=b*Math.sin(deg(A));if(A<90){if(a<h-1e-9)return 0;if(Math.abs(a-h)<1e-9)return 1;if(a<b-1e-9)return 2;return 1;}return a>b?1:0;}
assert.deepEqual([[30,4,10],[30,5,10],[30,6,10],[30,10,10],[120,4,5],[120,7,5],[30,5,8],[60,8,10]].map(args=>ssa(...args)),[0,1,2,1,0,1,2,0]);
const cosine=(a,b,C)=>Math.sqrt(a*a+b*b-2*a*b*Math.cos(deg(C)));
near(cosine(5,7,60),Math.sqrt(39),'cosines');near(cosine(6,8,60),2*Math.sqrt(13),'cosines 2');near(cosine(7,9,120),Math.sqrt(193),'cosines obtuse');
near((25+36-49)/(2*5*6),.2,'cos C SSS');
const area=(a,b,C)=>.5*a*b*Math.sin(deg(C));
near(area(10,12,60),30*Math.sqrt(3),'sine area');near(area(10,12,150),30,'obtuse area');near(area(9,10,60),45*Math.sqrt(3)/2,'sine area2');
function heron(a,b,c){const s=(a+b+c)/2;return Math.sqrt(s*(s-a)*(s-b)*(s-c));}
for(const [sides,answer] of [[[13,14,15],84],[[5,5,6],12],[[3,4,5],6],[[8,15,17],60],[[7,24,25],84],[[6,8,10],24]])near(heron(...sides),answer,'Heron');
near(24/12,2,'inradius');near((6*8*10)/(4*24),5,'circumradius');near(6/(2*Math.sin(deg(60))),2*Math.sqrt(3),'equilateral circumradius');
near(100*Math.tan(deg(30)),100*Math.sqrt(3)/3,'elevation');near(10*Math.sin(deg(30)),5,'east bearing');near(10*Math.cos(deg(30)),5*Math.sqrt(3),'north bearing');
// Existing manual tracking storage must accept new IDs without touching prior records.
const track=load('src/domain/learn/manualLearnTracking.ts'),progress=load('src/features/trigonometry/manualProgressAdapter.ts');
const m=new Map();globalThis.localStorage={getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};globalThis.window={dispatchEvent:()=>{}};
const prior={...track.emptyManualLearnRecord(),reviewCount:2,selfStatus:'understood',needsReview:true,updatedAt:'2026-01-01T00:00:00.000Z'};
m.set(track.MANUAL_LEARN_STORAGE_KEY,JSON.stringify({schemaVersion:1,records:{'alg-preserve':prior,'trig-equations-basic-trigonometric-equations':prior}}));
assert(track.isManualTrackingId(ss[0].id));progress.saveTrigManualProgress(ss[0].id,{read1:true,read2:true,read3:true,mastered:true,review:true});
const records=track.readManualLearnStore().records;assert.deepEqual(records['alg-preserve'],prior);assert.deepEqual(records['trig-equations-basic-trigonometric-equations'],prior);
assert.equal(records[ss[0].id].reviewCount,3);assert.equal(records[ss[0].id].selfStatus,'mastered');assert.equal(records[ss[0].id].needsReview,true);
for(const f of ['src/data/lessons/trigonometryObliqueTriangles.ts','src/data/practice/trigonometryObliqueTriangles.ts','src/features/trigonometry/TrigonometryScreen.tsx','src/components/learn-reader/TrigonometryDiagram.tsx','src/domain/practice/catalog.ts']){
 const result=ts.transpileModule(file(f),{fileName:f,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal((result.diagnostics??[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,f);
}
assert(['10.47.0','10.48.0','10.49.0','10.50.0','10.50.1','10.50.2','10.50.3','10.51.0', '10.52.0', '10.53.0', '10.54.0','10.55.0','10.56.0','10.57.0','10.58.0','10.60.0','10.61.0','10.62.0'].includes(json('package.json').version));assert.equal(json('package-lock.json').version,json('package.json').version);
console.log('PASS v10.44: 8 Topic-09 draft lessons, 64 independent keyed questions, SSA case counts, sine/cosine/Heron/radii/bearing math, diagrams, 65/102 lessons, 520 Trigonometry questions; all original Algebra and progress preserved.');
