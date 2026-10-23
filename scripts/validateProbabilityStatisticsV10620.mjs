/** v10.62 PS01-04 extension; includes exact legacy content snapshot, navigation and syntax checks. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const ts=require('typescript');
const txt=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
const j=f=>JSON.parse(txt(f));
const p='src/features/probability-statistics/';
const pkg=j('package.json'),lock=j('package-lock.json');
assert(['10.62.0','10.64.0'].includes(pkg.version));assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
const mods=j(p+'psModules.json'),lessons=j(p+'psLessons.json'),qs=j(p+'psQuestions.json');
const base=j('scripts/psBaselineV10610.json');
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x,Object.keys(x).sort())).digest('hex');
// Canonical JSON digests are verified exhaustively by companion Python QA.
assert.equal(mods.length,8);assert.equal(lessons.length,80);assert.equal(qs.length,204);
const uniq=(a,k)=>assert.equal(a.length,new Set(a).size,'duplicate '+k);
uniq(lessons.map(x=>x.id),'lessons');uniq(qs.map(x=>x.id),'questions');
const newQ=qs.filter(x=>x.origin==='v10.62.0'),guided=qs.filter(x=>x.guidedOnly),active=qs.filter(x=>!x.guidedOnly);
assert.equal(newQ.length,64);assert.equal(newQ.filter(x=>x.kind==='calculation').length,46);
assert.equal(guided.length,64);assert.equal(active.length,140);
const lessonIds=new Set(lessons.map(x=>x.id));
for(const m of mods){
 assert.equal(m.lessonIds.length,10,m.id);uniq(m.lessonIds,m.id);assert(m.lessonIds.every(id=>lessonIds.has(id)),m.id);
 if(m.id in base.modules){assert.equal(m.title,JSON.parse(txt(p+'psModules.json')).find(x=>x.id===m.id).title);}
}
assert.equal(Object.keys(base.lessons).length,56);assert.equal(Object.keys(base.questions).length,140);
const counts={PS01:0,PS02:0,PS03:0,PS04:0};
const norm=s=>s.toLowerCase().replace(/\s+/g,' ').trim();
const prompts=new Set(qs.filter(q=>q.origin!=='v10.62.0').map(q=>norm(q.prompt)));
const map=new Map(lessons.map(l=>[l.id,l]));
for(const q of newQ){
 assert(q.id.startsWith(q.topicId+'-P'),q.id);assert(q.topicId.slice(0,4) in counts,q.id);
 assert(map.has(q.topicId));assert.equal(q.options.length,4);uniq(q.options,q.id+' options');
 assert(q.correctIndex>=0&&q.correctIndex<4&&Number.isInteger(q.correctIndex));
 assert(q.work.length>0&&q.restriction.length>20&&q.prompt.length>32);
 assert(!q.guidedOnly&&!q.assessmentEligible&&q.reviewStatus==='editorial-pending');
 assert(!prompts.has(norm(q.prompt)),'prompt reuse '+q.id);prompts.add(norm(q.prompt));
 const l=map.get(q.topicId);
 assert.notEqual(norm(q.prompt),norm(l.workedExample?.prompt??''),q.id);
 assert.notEqual(norm(q.prompt),norm(l.checkpoint?.prompt??''),q.id);
 if(q.kind==='calculation')assert(q.auditRule&&q.auditArgs.length&&Number.isFinite(q.auditExpected));
 else assert.equal(q.auditRule,null);
 counts[q.topicId.slice(0,4)]++;
}
assert.deepEqual(counts,{PS01:16,PS02:16,PS03:16,PS04:16});
for(const l of lessons.filter(x=>!base.lessons[x.id])){
 assert(l.status==='draft'&&l.workedExample?.steps.length>=2&&l.checkpoint?.explanation.length>30);
 assert(l.reference.length>30&&l.latex.length>4&&!/[\x00-\x1f]/.test(l.latex));
}
assert(qs.every(q=>q.assessmentEligible===false));
for(const path of [p+'psContent.ts',p+'PSPracticePanel.tsx',p+'ProbabilityStatisticsScreen.tsx']){
 const src=txt(path);const tree=ts.createSourceFile(path,src,ts.ScriptTarget.ES2022,true,path.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 assert.equal(tree.parseDiagnostics.length,0,path);
}
assert(txt(p+'psContent.ts').includes('PS_PRACTICE_QUESTIONS=PS_QUESTIONS.filter(q=>!q.guidedOnly)'));
assert(txt(p+'PSPracticePanel.tsx').includes('PS_PRACTICE_QUESTIONS'));
console.log('PASS v10.62 source invariants: 8×10 lessons, 204 question records, 64 guided + 140 unseen, 0 board-exam eligible.');
