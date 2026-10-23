/** Regression checks for on-lesson checkbox UX, milestone transitions, and specialized tracking identity. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url), ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const typescript=(file)=>{
  const result=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
  assert.equal(result.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,`TSX parse failed in ${file}`);
  return result.outputText;
};
const domain=require('node:module');
const transpiled=typescript('src/domain/learn/manualLearnTracking.ts');
const mod={exports:{}};
new Function('require','module','exports',transpiled)(require,mod,mod.exports);
const t=mod.exports;
const data=new Map();
globalThis.localStorage={getItem:key=>data.get(key)||null,setItem:(key,value)=>{data.set(key,value)},removeItem:key=>data.delete(key)};
globalThis.window={dispatchEvent:()=>{}};
const id='alg-log-properties', other='alg-log-definitions', date='2026-10-10T12:00:00Z';
assert(t.markManualReviewed(id,date));
assert(t.setManualReadMilestone(id,3,true));
assert.equal(t.getManualLearnRecord(t.readManualLearnStore(),id).reviewCount,3);
assert.equal(t.getManualLearnRecord(t.readManualLearnStore(),id).lastReviewedAt,date,'checkbox correction must not create a review date');
assert(t.setManualReadMilestone(id,2,false));
assert.equal(t.getManualLearnRecord(t.readManualLearnStore(),id).reviewCount,1,'unticking Read 2x must also clear Read 3x');
assert(t.setManualReadMilestone(id,3,true));
assert(t.correctManualReviewCount(id,8));
assert(t.setManualReadMilestone(id,1,true));
assert.equal(t.getManualLearnRecord(t.readManualLearnStore(),id).reviewCount,8,'checking an earlier milestone must not decrease counts >3');
assert(t.setManualReadMilestone(id,3,false));
assert.equal(t.getManualLearnRecord(t.readManualLearnStore(),id).reviewCount,2);
assert(t.setManualLearnStatus(id,'mastered'));
assert(t.setManualNeedsReview(id,true));
const record=t.getManualLearnRecord(t.readManualLearnStore(),id);
assert.equal(record.selfStatus,'mastered');assert.equal(record.needsReview,true);
assert.equal(record.lastReviewedAt,date);
assert.equal(t.getManualLearnRecord(t.readManualLearnStore(),other).reviewCount,0,'subtopic tracking IDs must be isolated');
assert.equal(t.getManualLearnRecord(t.readManualLearnStore(),t.chapterTrackingId('top-logarithms')).reviewCount,0);
assert.equal(t.setManualReadMilestone(id,4,true),false);
assert.equal(t.setManualReadMilestone(id,0,true),false);
assert.equal(t.setManualReadMilestone(id,2,'true'),false);
for(const filename of ['src/components/learn-reader/ManualLearnTracker.tsx','src/hooks/useAlgebraLearnTrackingIdentity.ts','src/components/AlgebraScreen.tsx','src/components/LinearEquationsScreen.tsx','src/components/RationalExpressionsScreen.tsx','src/components/RealNumbersScreen.tsx'])typescript(filename);
const tracker=read('src/components/learn-reader/ManualLearnTracker.tsx');
assert(tracker.includes('type="checkbox"') && tracker.includes('Read {level}×') && tracker.includes('Mastered (Self)') && tracker.includes('Needs Review'));
assert(tracker.includes('setManualReadMilestone'));
const catalog=read('src/components/AlgebraScreen.tsx');
assert(!catalog.includes('editingManualTopicId') && !catalog.includes('<ManualLearnTracker'));
assert(catalog.includes('Open Learn') && catalog.includes('catalogModuleId:topic.id'));
const reader=read('src/components/learn-reader/LearnReaderLayout.tsx');
assert(reader.includes('ManualLearnTracker compact') && reader.indexOf('ManualLearnTracker compact') < reader.indexOf('<LearnSectionRenderer')); 
// Checkboxes must belong to the active numbered topic card, never float above its lesson.
for(const filename of ['src/components/LinearEquationsScreen.tsx','src/components/RationalExpressionsScreen.tsx','src/components/RealNumbersScreen.tsx']){
  const src=read(filename);
  assert(src.includes('useAlgebraLearnTrackingIdentity') && src.includes("activeTab === 'learn'"),`lesson identity missing in ${filename}`);
}
for(const filename of ['src/components/linear-equations/LinearLearnTab.tsx','src/components/RationalExpressionsScreen.tsx','src/components/RealNumbersScreen.tsx','src/components/learn-reader/LearnReaderLayout.tsx']){
  const src=read(filename);
  assert(src.includes('<ManualLearnTracker')&&src.includes('lessonCardTrackingId'),`per-card tracker missing in ${filename}`);
  typescript(filename);
}
const real=read('src/components/RealNumbersScreen.tsx');
assert(real.indexOf('<ManualLearnTracker compact') > real.indexOf('Main Lesson Content Card'),'Number Sets checkbox controls must be inside lesson card');
const linear=read('src/components/linear-equations/LinearLearnTab.tsx');
assert(linear.indexOf('<ManualLearnTracker compact') > linear.indexOf('Detailed Concept Deep Dive'),'Linear selected concept checkbox controls must be inside its card');
const rational=read('src/components/rational-expressions/DomainRestrictionsModule.tsx');
assert(rational.indexOf('{manualStatusControls}') > rational.indexOf('SECTION HERO'),'Domain Restrictions checkbox controls must be inside its hero card');
typescript('src/components/rational-expressions/DomainRestrictionsModule.tsx');
const card1=t.lessonCardTrackingId('alg-real-numbers','step-1');
const card2=t.lessonCardTrackingId('alg-real-numbers','step-2');
const chapter=t.moduleTrackingId('alg-real-numbers');
assert.notEqual(card1,card2); assert.notEqual(card1,chapter);
assert(t.setManualReadMilestone(card1,3,true));
assert(t.setManualLearnStatus(card2,'mastered'));
assert(t.setManualNeedsReview(card2,true));
const state=t.readManualLearnStore();
assert.equal(t.getManualLearnRecord(state,card1).reviewCount,3);
assert.equal(t.getManualLearnRecord(state,card2).reviewCount,0,'separate lesson cards do not share reviews');
assert.equal(t.getManualLearnRecord(state,chapter).reviewCount,0,'old overall chapter record stays separate');
const summary=t.getManualLearnCardSummary(state,chapter);
assert.equal(summary.reviewedCards,1);
assert.equal(summary.selfMasteredCards,1);
assert.equal(summary.hasReviewFlag,true);
assert.equal(summary.hasSelfMastered,true);
assert.throws(()=>t.lessonCardTrackingId('bad-identity','step-1'));
// Per-card history must scale beyond the old 300-record chapter-only cap.
const large=t.emptyManualLearnStore();
for(let n=0;n<450;n++)large.records[`alg-algebra-module--unit-step-${n}`]={reviewCount:n%4,selfStatus:'studying',needsReview:false,lastReviewedAt:null,updatedAt:'2026-10-11T01:00:00Z'};
assert(t.validateManualLearnStore(large),'450 separately tracked cards must be supported');
assert(t.parseManualLearnStore(JSON.stringify(large)).records['alg-algebra-module--unit-step-449']);

assert(read('src/components/RealNumbersScreen.tsx').includes("['top-signed-numbers']"),'signed numbers must preserve catalog subtopic identity in shared Real Numbers screen');
assert(read('src/domain/learn/manualLearnTracking.ts').includes('MANUAL_LEARN_STORAGE_KEY'));
console.log('Manual Learn v10.35.1 PASS: cumulative checkbox milestones, separate numbered-card records, existing chapter history, manual catalog roll-ups, dates, flags, reader/specialized placement and TSX syntax.');
