/** v10.61.0: new independent PS06/PS07 lesson/question invariants + TS parse. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url), ts=require('typescript');
const text=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const json=p=>JSON.parse(text(p));
const pkg=json('package.json'),lock=json('package-lock.json');
assert(['10.61.0','10.62.0','10.64.0'].includes(pkg.version));assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
const base='src/features/probability-statistics/';
const mods=json(base+'psModules.json'),lessons=json(base+'psLessons.json'),qs=json(base+'psQuestions.json');
const ids=(xs,name)=>assert.equal(new Set(xs).size,xs.length,`Duplicate ${name}`);
ids(mods.map(x=>x.id),'modules');ids(lessons.map(x=>x.id),'lessons');ids(qs.map(x=>x.id),'questions');
assert.equal(mods.length,8);assert.equal(lessons.length,['10.62.0','10.64.0'].includes(pkg.version)?80:56);assert.equal(qs.length,['10.62.0','10.64.0'].includes(pkg.version)?204:140);
const active=qs.filter(x=>!x.guidedOnly),newQ=qs.filter(x=>x.origin==='v10.61.0');
assert.equal(active.length,['10.62.0','10.64.0'].includes(pkg.version)?140:76);assert.equal(qs.filter(x=>x.guidedOnly).length,64);
assert.equal(newQ.length,32);assert.equal(newQ.filter(x=>x.kind==='calculation').length,23);
const lm=new Map(lessons.map(x=>[x.id,x]));
for(const m of mods){
 const expected=['10.62.0','10.64.0'].includes(pkg.version)?10:['PS05','PS06','PS07','PS08'].includes(m.id)?10:4;
 assert.equal(m.lessonIds.length,expected,m.id);ids(m.lessonIds,m.id+' lessons');
 assert(m.lessonIds.every(x=>lm.get(x)?.moduleId===m.id));
}
const norm=s=>s.toLowerCase().replace(/\s+/g,' ').trim();
const psCounts={PS06:0,PS07:0};const seen=new Set(qs.filter(x=>x.origin!=='v10.61.0').map(x=>norm(x.prompt)));
for(const l of lessons.filter(x=>['PS06','PS07'].includes(x.moduleId)&&Number(x.id.slice(-2))>4)){
 assert(l.workedExample?.steps.length>=2&&l.checkpoint?.explanation?.length>35,l.id);
 assert(l.guardrail.length>70&&l.reference.length>20&&l.latex.length>7,l.id);
}
for(const q of newQ){
 assert(q.topicId.slice(0,4)==='PS06'||q.topicId.slice(0,4)==='PS07');
 assert(lm.has(q.topicId),q.id);assert(q.id.startsWith(q.topicId+'-P'),q.id);
 assert(q.options.length===4&&new Set(q.options).size===4,q.id);
 assert(q.correctIndex>=0&&q.correctIndex<=3&&q.work.length>0&&q.restriction.length>18,q.id);
 assert.equal(q.reviewStatus,'editorial-pending');assert.equal(q.guidedOnly,false);assert.equal(q.assessmentEligible,false);
 const l=lm.get(q.topicId);const n=norm(q.prompt);
 assert(!seen.has(n),'repeated prompt '+q.id);seen.add(n);
 assert.notEqual(n,norm(l.workedExample?.prompt??''),q.id);
 assert.notEqual(n,norm(l.checkpoint?.prompt??''),q.id);
 if(q.kind==='calculation')assert(q.auditRule&&q.auditArgs.length&&Number.isFinite(q.auditExpected),q.id);
 else assert.equal(q.auditRule,null,q.id);
 psCounts[q.topicId.slice(0,4)]++;
}
assert.deepEqual(psCounts,{PS06:16,PS07:16});
assert(qs.every(q=>q.assessmentEligible===false),'No uncertified exam questions');
const affected=[base+'psContent.ts',base+'PSPracticePanel.tsx',base+'ProbabilityStatisticsScreen.tsx'];
for(const path of affected){
 const t=ts.createSourceFile(path,text(path),ts.ScriptTarget.ES2022,true,path.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 assert.equal(t.parseDiagnostics.length,0,`${path}: ${t.parseDiagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')).join('; ')}`);
}
assert(text(base+'psContent.ts').includes('PS_PRACTICE_QUESTIONS=PS_QUESTIONS.filter(q=>!q.guidedOnly)'));
assert(text(base+'PSPracticePanel.tsx').includes('PS_PRACTICE_QUESTIONS'));
assert(!text(base+'PSPracticePanel.tsx').includes('setManualLearn'));
console.log('PASS v10.61: 56 lessons, 140 questions, 64 guided and 76 separate practice; PS06/PS07 +12 lessons/+32 questions; no scored pool leakage.');
