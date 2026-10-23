import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {previewLearnerImport,exportLearnerArchive,restoreLearnerArchive} from '../src/utils/learnerBackup.ts';
import {INITIAL_SUBJECTS} from '../src/data/initialData.ts';
import {runNpmScript} from './runNpmScript.mjs';
const db=new Map();
const store={get length(){return db.size},key:i=>[...db.keys()][i]??null,getItem:k=>db.get(k)??null,setItem:(k,v)=>db.set(k,String(v)),removeItem:k=>db.delete(k)};
const archive=data=>({format:'BSECE-learner-backup',version:1,exportedAt:new Date().toISOString(),data});
db.set('ece_board_review_subjects_v4',JSON.stringify(INITIAL_SUBJECTS));
db.set('unrelated-secret','qa-fixture-not-a-key');
const old=exportLearnerArchive(store);
assert.equal(old.data['unrelated-secret'],undefined);
assert.equal(previewLearnerImport(old).preview.subjects,6);
for(const group of [null,{id:'g',topics:null},{id:'g',topics:[null]},{id:'g',topics:[{id:'t',name:'T',activityHistory:{}}]},{id:'g',topics:[{id:'t',name:'T',activityHistory:[{score:101}]}]}]){
 const malformed=archive({ece_board_review_subjects_v4:JSON.stringify([{id:'subj-math-algebra',groups:[group]}])});
 const before=JSON.stringify([...db]);assert.throws(()=>restoreLearnerArchive(store,malformed),/Invalid subject structure/);assert.equal(JSON.stringify([...db]),before);
}
restoreLearnerArchive(store,old);assert.ok(db.has('ece_board_v1010_pre_restore_backup'));assert.equal(db.get('unrelated-secret'),'qa-fixture-not-a-key');
const recovery=db.get('ece_board_v1010_pre_restore_backup');restoreLearnerArchive(store,old);assert.equal(db.get('ece_board_v1010_pre_restore_backup'),recovery);
const before=JSON.stringify([...db]);const bad=archive({ece_learning_path_v1:'invalid'});assert.throws(()=>restoreLearnerArchive(store,bad));assert.equal(JSON.stringify([...db]),before);
const npmResult=runNpmScript('lint:runtime:v10.28',{encoding:'utf8',timeout:30000,windowsHide:true});assert.equal(npmResult.status,0,npmResult.error?.message||npmResult.stderr);
const require=createRequire(import.meta.url);const katex=require('katex');const React=require('react');const {renderToStaticMarkup}=require('react-dom/server');const {InlineMath}=require('react-katex');
assert.match(renderToStaticMarkup(React.createElement(InlineMath,{math:String.raw`\frac{1}{2}`})),/katex/);
assert.match(katex.version,/^0\.18\./);
try{Object.prototype.trust=true;const html=katex.renderToString(String.raw`\href{javascript:alert(1)}{x}`,{throwOnError:false});assert.ok(!html.includes('<a '));}finally{delete Object.prototype.trust;}
console.log('PASS nested backup validation rejects corrupt groups/topics/activities before writes');
console.log('PASS legacy subjects, unknown-storage exclusion and immutable restore recovery');
console.log('PASS Windows npm child runner executes a real TypeScript check');
console.log('PASS react-katex renders using patched KaTeX; inherited trust is rejected');
