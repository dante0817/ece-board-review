/** v10.58.0 Release B: 8-module foundation, exact arithmetic, routing and namespace QA. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const ts=require('typescript');
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const data=p=>JSON.parse(read(p));
const base='src/features/probability-statistics/';
const ms=data(base+'psModules.json'),ls=data(base+'psLessons.json'),qs=data(base+'psQuestions.json');
const pkg=data('package.json'),lock=data('package-lock.json');
assert(['10.58.0','10.60.0','10.61.0','10.62.0','10.64.0'].includes(pkg.version));assert.equal(pkg.version,lock.version);assert.equal(pkg.version,lock.packages[''].version);
assert.equal(ms.length,8);assert(ls.length>=32);assert(qs.length>=64);
const unique=(arr,label)=>assert.equal(new Set(arr).size,arr.length,`${label} duplicated`);
unique(ms.map(m=>m.id),'Module IDs');unique(ls.map(l=>l.id),'Lesson IDs');unique(qs.map(q=>q.id),'Question IDs');
const topics=new Set(ls.map(l=>l.id));let numeric=0;
const near=(a,b,tol=0.00006)=>Number.isFinite(a)&&Math.abs(a-b)<=tol;
const sum=xs=>xs.reduce((a,b)=>a+b,0);
const mean=xs=>sum(xs)/xs.length;
const factorial=n=>Array.from({length:n},(_,i)=>i+1).reduce((a,b)=>a*b,1);
const choose=(n,r)=>factorial(n)/(factorial(r)*factorial(n-r));
const variance=xs=>sum(xs.map(x=>(x-mean(xs))**2))/(xs.length-1);
const stat=(x,y)=>{const mx=mean(x),my=mean(y);const xx=sum(x.map(t=>(t-mx)**2)),xy=sum(x.map((t,i)=>(t-mx)*(y[i]-my)));return {xx,xy,yy:sum(y.map(t=>(t-my)**2))};};
const calc=(rule,a)=>{
 switch(rule){
 case 'sum':return sum(a);
 case 'mean':return mean(a);
 case 'sampleVariance':return variance(a);
 case 'percent':return 100*a[0]/a[1];
 case 'product':return a.reduce((p,x)=>p*x,1);
 case 'nPr':return factorial(a[0])/factorial(a[0]-a[1]);
 case 'nCr':return choose(a[0],a[1]);
 case 'union':return a[0]+a[1]-a[2];
 case 'divide':return a[0]/a[1];
 case 'bayes':return a[0]*a[1]/(a[0]*a[1]+(1-a[0])*a[2]);
 case 'weighted':return a[0]*a[2]+a[1]*a[3];
 case 'binomial':return choose(a[0],a[1])*a[2]**a[1]*(1-a[2])**(a[0]-a[1]);
 case 'poissonZero':return Math.exp(-a[0]);
 case 'zscore':return (a[0]-a[1])/a[2];
 case 'se':return a[0]/Math.sqrt(a[1]);
 case 'marginZ':case 'marginT':return a[0]*a[1]/Math.sqrt(a[2]);
 case 'sampleSize':return Math.ceil((a[0]*a[1]/a[2])**2);
 case 'zTest':case 'tTest':return (a[0]-a[1])/(a[2]/Math.sqrt(a[3]));
 case 'difference':return a[0]-a[1];
 case 'expectedCount':return a[0]*a[1]/a[2];
 case 'correlation':{const s=stat(a.slice(0,3),a.slice(3));return s.xy/Math.sqrt(s.xx*s.yy);}
 case 'slope':{const s=stat(a.slice(0,3),a.slice(3));return s.xy/s.xx;}
 case 'rSquared':return 1-a[0]/a[1];
 case 'interaction':return (a[3]-a[2])-(a[1]-a[0]);
 default:throw Error('Unrecognized numeric audit rule '+rule);
 }
};
for(const mod of ms){
 assert(/^PS0[1-8]$/.test(mod.id));assert(mod.lessonIds.length>=4);
 for(const id of mod.lessonIds){assert(topics.has(id));assert.equal(ls.find(l=>l.id===id)?.moduleId,mod.id);}
 assert(mod.title&&mod.reference&&mod.description);
}
for(const l of ls){
 assert(/^PS0[1-8]-(0[1-9]|10)$/.test(l.id));
 assert(l.concept.length>80&&l.method.length>40&&l.guardrail.length>40&&l.latex.length>5);
 assert.equal(l.status,'draft');
 assert.equal(qs.filter(q=>q.topicId===l.id&&q.guidedOnly).length,Number(l.id.slice(-2))<=4?2:0);
}
for(const q of qs){
 assert(topics.has(q.topicId));assert.equal(q.options.length,4);
 assert.equal(new Set(q.options).size,4,`non-distinct options: ${q.id}`);
 assert(Number.isInteger(q.correctIndex)&&q.correctIndex>=0&&q.correctIndex<4);
 assert(q.prompt.length>25&&q.work.length>0&&q.restriction.length>20);
 if(q.kind==='calculation'&&q.guidedOnly){
   numeric++;
   assert(q.auditRule&&q.auditArgs.length>0&&typeof q.auditExpected==='number');
   const independentlyCalculated=calc(q.auditRule,q.auditArgs);
   assert(near(independentlyCalculated,q.auditExpected),`${q.id} incorrect rule calculation: ${independentlyCalculated} != ${q.auditExpected}`);
   assert(near(Number(q.options[q.correctIndex]),independentlyCalculated),`${q.id} wrong answer key`);
 }else if(q.kind==='concept'){assert.equal(q.auditRule,null);assert.equal(q.auditExpected,null);}
}
assert.equal(numeric,32);
for(const file of ['src/features/probability-statistics/psContent.ts','src/features/probability-statistics/PSPracticePanel.tsx','src/features/probability-statistics/ProbabilityStatisticsScreen.tsx','src/features/mathematics/mathCatalog.ts','src/components/MathematicsScreen.tsx','src/App.tsx','src/components/Sidebar.tsx','src/context/ReviewContext.tsx','src/domain/learn/manualLearnTracking.ts']){
 const source=read(file);
 const tree=ts.createSourceFile(file,source,ts.ScriptTarget.ES2022,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 assert.equal(tree.parseDiagnostics.length,0,`${file} parse errors: ${tree.parseDiagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')).join('/')}`);
 const transpile=ts.transpileModule(source,{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true});
 assert(!(transpile.diagnostics||[]).some(d=>d.category===ts.DiagnosticCategory.Error),`${file} transpile error`);
}
for(const check of [
 ['src/App.tsx',"currentScreen === 'probability-statistics' && <ProbabilityStatisticsScreen />"],
 ['src/context/ReviewContext.tsx',"| 'probability-statistics'"],
 ['src/components/Sidebar.tsx',"'probability-statistics'"],
 ['src/features/mathematics/mathCatalog.ts',"destination:'probability-statistics'"],
 ['src/features/probability-statistics/ProbabilityStatisticsScreen.tsx','LearnReaderLayout'],
 ['src/features/probability-statistics/ProbabilityStatisticsScreen.tsx','ManualLearnTracker'],
 ['src/features/probability-statistics/PSPracticePanel.tsx','Check Answer'],
 ['src/domain/learn/manualLearnTracking.ts','chapter-top-[a-z0-9-]{1,100}'],
 ])assert(read(check[0]).includes(check[1]),check.join(' missing '));
assert(read('src/domain/learn/manualLearnTracking.ts').includes("'ece_manual_learn_tracking_v1'"));
// Exercise the actual study-tracking implementation against pre-existing user records.
{
  const source=read('src/domain/learn/manualLearnTracking.ts');
  const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
  const m={exports:{}};
  new Function('module','exports',compiled)(m,m.exports);
  const x=m.exports;
  const map=new Map();
  const original={reviewCount:2,selfStatus:'studying',needsReview:false,lastReviewedAt:'2026-10-01T09:00:00.000Z',updatedAt:'2026-10-01T09:00:00.000Z'};
  const seed={schemaVersion:1,records:{'alg-real-numbers':{...original},'trig-topic-01':{...original},'geo-analytic-079':{...original}}};
  const oldStore=globalThis.localStorage,oldWindow=globalThis.window;
  try {
    globalThis.localStorage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
    globalThis.window={dispatchEvent:()=>{}};
    map.set(x.MANUAL_LEARN_STORAGE_KEY,JSON.stringify(seed));
    const parent='chapter-top-ps-01-01';assert(x.isManualTrackingId(parent));
    const child=x.lessonCardTrackingId(parent,'ps01-01-concepts');assert(x.isManualTrackingId(child));
    assert(!x.isManualTrackingId('chapter-top-ps-../../traversal'));
    assert(x.setManualReadMilestone(parent,2,true));
    assert(x.setManualReadMilestone(child,1,true));
    const data=x.readManualLearnStore();
    for(const [key,record] of Object.entries(seed.records))assert.deepEqual(data.records[key],record,`legacy progress changed: ${key}`);
    assert.equal(data.records[parent].reviewCount,2);assert.equal(data.records[child].reviewCount,1);
    map.set(x.MANUAL_LEARN_STORAGE_KEY,'{broken-json');
    assert.equal(x.markManualReviewed('chapter-top-ps-01-02'),false,'corrupt existing storage must be preserved');
    assert.equal(map.get(x.MANUAL_LEARN_STORAGE_KEY),'{broken-json');
  }finally{globalThis.localStorage=oldStore;globalThis.window=oldWindow;}
}

// Do not reset legacy user data or corrupt content.
const preserved=['scripts/analyticGeometryProtectedV10550.json','scripts/geometryBaselineV10530.json'];let count=0;
for(const file of preserved){const baseline=data(file);for(const [path,digest] of Object.entries(baseline.protectedSha256)){
 const actual=crypto.createHash('sha256').update(read(path)).digest('hex');
 if(path==='src/domain/learn/manualLearnTracking.ts'){assert.equal(actual,'0ffe03c588c6de03e781dcb3cf7b84056e0dfdcc0c9df2598ab7eba1a00f7ad5', 'Manual tracker must be byte-identical to supplied v10.57.0 baseline');continue;}
 assert.equal(actual,digest,`protected source changed: ${path}`);count++;
}}
console.log(`PASS Probability & Statistics v10.58.0: ${ms.length} modules, ${ls.length} draft lessons, ${qs.length} questions, ${numeric} independently recalculated numeric keys, 32 concept-key structural checks, 9 TS/TSX syntax checks, ${count} legacy protected hashes, route/tracker invariants.`);
