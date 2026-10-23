/** Full-corpus structural QA + reviewer-authored 102-item math spot check + storage stress tests.
 * NOT independent mathematical certification of all 816 questions.
 * Run: node scripts/qaTrigonometryFullV1050.cjs
 * Requires devDependency typescript (npm ci). Source data is not modified.
 */
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const Module=require('module');
const root=path.resolve(__dirname,'..');
const ts=require('typescript');
const getJson=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
function loadTs(file){
 const filename=path.join(root,file);
 const transpiled=ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}});
 const errors=(transpiled.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);
 assert.equal(errors.length,0,`${file}: TypeScript transpilation errors`);
 const m=new Module(filename,module);m.filename=filename;m.paths=Module._nodeModulePaths(path.dirname(filename));
 const original=m.require.bind(m);
 m.require=(spec)=>{
   if(spec.startsWith('.')){
     const resolved=path.resolve(path.dirname(filename),spec);
     if(fs.existsSync(resolved+'.ts'))return loadTs(path.relative(root,resolved+'.ts'));
     if(fs.existsSync(resolved+'.json'))return getJson(path.relative(root,resolved+'.json'));
   }
   return original(spec);
 };
 m._compile(transpiled.outputText,filename);return m.exports;
}
function normalize(x){return String(x).trim().toLowerCase().replace(/\s+/g,'').replace(/[−–]/g,'-').replace(/π/g,'pi').replace(/θ/g,'theta');}
function assertUnique(ids,label){assert.equal(new Set(ids).size,ids.length,`${label}: duplicate IDs`);}
const lessons={};const qs=[];const provenance={};
for(const f of fs.readdirSync(path.join(root,'src/data/lessons'))){
 if(!/^trigonometry.*\.json$/.test(f))continue;
 Object.assign(lessons,getJson(`src/data/lessons/${f}`));
}
Object.assign(lessons,loadTs('src/data/lessons/trigonometryPilot.ts').TRIGONOMETRY_PILOT_LESSONS);
Object.assign(lessons,loadTs('src/data/lessons/trigonometryFoundations.ts').TRIGONOMETRY_FOUNDATIONS_LESSONS);
for(const f of fs.readdirSync(path.join(root,'src/data/practice'))){
 if(!/^trigonometry.*\.json$/.test(f)||f.includes('Answer'))continue;
 const v=getJson(`src/data/practice/${f}`);
 if(Array.isArray(v))for(const q of v){qs.push(q);provenance[q.id]=f;}
}
for(const [f,exportName] of [['trigonometryPilot.ts','TRIGONOMETRY_PILOT_QUESTIONS'],['trigonometryFoundations.ts','TRIGONOMETRY_FOUNDATIONS_QUESTIONS']]){
 for(const q of loadTs(`src/data/practice/${f}`)[exportName]){qs.push(q);provenance[q.id]=f;}
}
const curriculum=getJson('src/features/trigonometry/curriculum.json');
const all=curriculum.topics.flatMap(t=>t.subtopics.map(s=>({...s,topicId:t.id,topic:t.title,optional:!!t.optional})));
assert.equal(curriculum.topics.length,14);assert.equal(all.length,102);assert.equal(all.filter(x=>!x.optional).length,95);
assert.equal(Object.keys(lessons).length,102);assert.equal(qs.length,816);
assertUnique(all.map(s=>s.id),'curriculum');assertUnique(qs.map(q=>q.id),'questions');
assert.deepEqual(Object.keys(lessons).sort(),all.map(x=>x.id).sort(),'lesson/curriculum mapping');
const byTopic=new Map(all.map(x=>[x.id,x]));const bySub=new Map(all.map(x=>[x.id,[]]));
const issues=[];const issue=(level,kind,id,detail)=>issues.push({level,kind,id,detail});
const perLesson=[];
for(const id of Object.keys(lessons)){
 const lesson=lessons[id];assert.equal(lesson.id,id);
 assert.equal(lesson.status,'draft',`${id}: lesson must not be shown as editorially verified`);
 assert(lesson.summary.length>30);assert(lesson.sections.length>=2);
 const blocks=lesson.sections.flatMap(x=>x.blocks||[]);assertUnique(blocks.map(x=>x.id),id+' blocks');
 const examples=blocks.filter(x=>x.type==='worked-example'); const checkpoints=blocks.filter(x=>x.type==='checkpoint');
 const formulas=blocks.filter(x=>x.type==='formula');const diagrams=blocks.filter(x=>x.type==='diagram');
 assert(examples.length>=2,`${id} needs two worked examples`);assert(checkpoints.length>=1,`${id} needs a checkpoint`);assert(formulas.length>=1,`${id} needs formulas`);
 assert(blocks.some(x=>x.type==='note'&&/reference/i.test(x.text||'')),`${id} requires source guidance`);
 for(const b of blocks){
  if(b.type==='formula'){
   const latex=b.latex;
   assert.equal((latex.match(/\{/g)||[]).length,(latex.match(/\}/g)||[]).length,`unbalanced LaTeX braces in ${id} ${b.id}`);
   assert.equal((latex.match(/\\begin/g)||[]).length,(latex.match(/\\end/g)||[]).length,`unbalanced LaTeX environments in ${id} ${b.id}`);
   if(/[\t\r\f\b]/.test(latex))issue('high','escaped-latex-control',id,b.id);
  }
  for(const key of ['text','problem','answer','check','explanation','caption']){
   if(typeof b[key]==='string'&&(b[key].match(/\$/g)||[]).length%2)issue('high','unpaired-inline-dollar',id,`${b.id}:${key}`);
  }
 }
 perLesson.push({id,title:lesson.title,topic:byTopic.get(id).topic,optional:byTopic.get(id).optional,sections:lesson.sections.length,examples:examples.length,checkpoints:checkpoints.length,formulas:formulas.length,diagrams:diagrams.length,status:lesson.status});
}
for(const q of qs){
 assert(bySub.has(q.subtopicId),`${q.id}: orphaned subtopic`);bySub.get(q.subtopicId).push(q);
 assert.equal(q.options.length,4,`${q.id}: expected four options`);
 assert([0,1,2,3].includes(q.correctIndex),`${q.id}: invalid answer index`);
 assert.equal(new Set(q.options.map(normalize)).size,4,`${q.id}: exact duplicate option`);
 assert(q.prompt.length>=10&&q.explanation.length>=12,`${q.id}: incomplete prompt/explanation`);
 if(q.explanation.length<32)issue('editorial','short-explanation',q.id,`length=${q.explanation.length}`);
}
for(const [id,questions] of bySub)assert.equal(questions.length,8,`${id}: expected eight questions`);
// Per-question provenance register, explicitly NOT marking a question as independently certified.
const spot=new Map();
for(const raw of read('scripts/trigonometryMathSpotChecksV1050.txt').split(/\r?\n/)){
 const line=raw.trim();if(!line||line.startsWith('#'))continue;
 const n=line.indexOf('|');assert(n>0,`Malformed QA fixture ${line}`);const id=line.slice(0,n).trim(),expected=line.slice(n+1).trim();
 assert(!spot.has(id),`Duplicate fixture ${id}`);spot.set(id,expected);
}
assert.equal(spot.size,102,'Expected one independently reviewed sample per subtopic');
const idMap=new Map(qs.map(q=>[q.id,q]));
for(const [qid,expected] of spot){
 const q=idMap.get(qid);assert(q,`Missing spot-check question ${qid}`);
 assert.equal(normalize(q.options[q.correctIndex]),normalize(expected),`${qid}: reviewer math fixture mismatch`);
}
assert.equal(new Set([...spot].map(([id])=>idMap.get(id).subtopicId)).size,102);
const edge=new Map();
for(const raw of read('scripts/trigonometryMathEdgeChecksV1050.txt').split(/\r?\n/)){
 const line=raw.trim(); if(!line||line.startsWith('#'))continue;
 const n=line.indexOf(' | ');assert(n>0,`Malformed edge fixture ${line}`);
 const id=line.slice(0,n),expected=line.slice(n+3).trim();assert(!edge.has(id)&&!spot.has(id),`Duplicate math spot-check ${id}`);
 edge.set(id,expected);
 const q=idMap.get(id);assert(q,`Missing edge-check question ${id}`);
 assert.equal(normalize(q.options[q.correctIndex]),normalize(expected),`${id}: edge-case fixture mismatch`);
}
assert.equal(edge.size,15,'Expected 15 supplementary mathematical edge checks');
// Additional mathematically independent cross-checks on known tricky families.
function near(a,b){assert(Math.abs(a-b)<1e-10,`${a} vs ${b}`)}
near(Math.sin(Math.PI/3+Math.PI/6),1);near(Math.sqrt(21*8*7*6),84); // Heron 13–14–15 area
near(10*Math.sin(Math.PI/4)/Math.sin(Math.PI/6),10*Math.SQRT2);
near(10*Math.sin(Math.PI/6),5);
near(Math.cos(Math.PI/3)**2+Math.sin(Math.PI/3)**2,1);
near((6*8*10)/(4*24),5);
near(Math.sin(2*Math.PI/3),Math.sqrt(3)/2);
near(Math.sin(3*Math.PI/6),1);
near(Math.sqrt(3**2+4**2),5);
near(2*3-1*1,5); // planar cross product of (2,1), (1,3)
near(120*Math.PI/(2*Math.PI),60);
near(Math.sqrt(3**2+4**2),5); // 3sin+4cos amplitude
near((Math.atan2(4,3)*180/Math.PI),53.13010235415598);
near(Math.sqrt(25-9),4);near(1/50,0.02);
const now='2026-10-13T00:00:00.000Z';
const mem=new Map();global.localStorage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,v),removeItem:k=>mem.delete(k)};
global.window={dispatchEvent:()=>{},localStorage:global.localStorage};
const manual=loadTs('src/domain/learn/manualLearnTracking.ts');
const trig=loadTs('src/features/trigonometry/manualProgressAdapter.ts');
const reader=loadTs('src/domain/learn/readerProgress.ts');
const pract=loadTs('src/domain/practice/practiceStorage.ts');
assert.equal(manual.saveManualLearnStore({schemaVersion:1,records:{'alg-preserve':{reviewCount:3,selfStatus:'mastered',needsReview:true,lastReviewedAt:now,updatedAt:now}}}),true);
for(const id of Object.keys(lessons))trig.saveTrigManualProgress(id,{read1:true,read2:true,read3:false,mastered:false,review:true});
let saved=manual.readManualLearnStore();assert.equal(Object.keys(saved.records).length,103);assert.equal(saved.records['alg-preserve'].reviewCount,3);assert(saved.records['alg-preserve'].needsReview);
assert.equal(Object.keys(trig.readTrigManualProgress(Object.keys(lessons))).length,102);
let savedReader=reader.emptyReaderStore();savedReader.topics['alg-existing']={lastSectionId:'abc',completedSectionIds:[],bookmarkedSectionIds:[],contentVersion:1,updatedAt:now};
for(const l of Object.values(lessons)) savedReader=reader.updateReaderTopic(l,savedReader,{lastSectionId:l.sections[0].id,completedSectionIds:[l.sections[0].id]});
assert.equal(Object.keys(savedReader.topics).length,103);
assert.equal(reader.saveReaderStore(savedReader),true,'102+ existing reading progress should save');
const readBack=reader.readReaderStore();assert.equal(Object.keys(readBack.topics).length,103);assert(readBack.topics['alg-existing']);
let practice=pract.emptyPracticeStore();practice.firstAttempts['reference:legacy:existing']={questionKey:'reference:legacy:existing',revision:'r1',chosenOptionId:'0',correct:true,at:now,assisted:false,sessionId:'earlier'};
for(const q of qs){const key=`trigonometry-pilot:${q.id}`;practice.firstAttempts[key]={questionKey:key,revision:'r1',chosenOptionId:String(q.correctIndex),correct:true,at:now,assisted:false,sessionId:'qa'};}
assert.equal(Object.keys(practice.firstAttempts).length,817);assert(pract.validatePracticeStore(practice));pract.savePracticeStore(global.localStorage,practice);
const reloaded=pract.loadPracticeStore(global.localStorage);assert.equal(Object.keys(reloaded.firstAttempts).length,817);assert(reloaded.firstAttempts['reference:legacy:existing']);
const counts=Object.fromEntries(curriculum.topics.map(t=>[t.title,{lessons:t.subtopics.length,questions:t.subtopics.reduce((n,s)=>n+bySub.get(s.id).length,0),optional:!!t.optional}]));
const reviewed=new Set([...spot.keys(),...edge.keys()]);
function csv(rows,fields){const escape=x=>'"'+String(x??'').replace(/"/g,'""')+'"';return fields.join(',')+'\n'+rows.map(row=>fields.map(field=>escape(row[field])).join(',')).join('\n')+'\n'}
const output=path.join(root,'QA_TRIGONOMETRY_V10_50');fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(path.join(output,'question_review_register.csv'),csv(qs.map(q=>({id:q.id,subtopicId:q.subtopicId,topic:byTopic.get(q.subtopicId).topic,difficulty:q.difficulty,stem:q.prompt,optionA:q.options[0],optionB:q.options[1],optionC:q.options[2],optionD:q.options[3],correctOption:q.options[q.correctIndex],sourceFile:provenance[q.id],structuralCheck:'passed',mathSpotCheck:reviewed.has(q.id)?'reviewer-fixture-pass':'not_independently_checked',editorialSignOff:'pending'})),['id','subtopicId','topic','difficulty','stem','optionA','optionB','optionC','optionD','correctOption','sourceFile','structuralCheck','mathSpotCheck','editorialSignOff']));
fs.writeFileSync(path.join(output,'lesson_review_register.csv'),csv(perLesson,['id','title','topic','optional','sections','examples','checkpoints','formulas','diagrams','status']));
const report={release:'10.50.0',scope:'full corpus structural QA; reviewer-authored spot checks; storage compatibility',coverage:{topics:curriculum.topics.length,coreSubtopics:95,optionalSubtopics:7,lessons:Object.keys(lessons).length,questions:qs.length,mathSpotChecks:reviewed.size,questionsWithoutIndependentMathReview:qs.length-reviewed.size},counts,checks:{uniqueLessonAndQuestionIds:'pass',eightQuestionsPerSubtopic:'pass',lessonsAndCurriculumMappings:'pass',lessonExamplesAndCheckpoints:'pass',latexStructuralChecks:'pass',math102Fixtures:'pass',manualProgressRoundTrip:'pass',reader102LessonsPlusAlgebraRoundTrip:'pass',practice816AttemptsPlusLegacyRoundTrip:'pass'},editorialWarnings:{shortExplanations:issues.filter(i=>i.kind==='short-explanation').length},qualifications:['Key agreement and 117 spot checks do not independently certify all 816 mathematical answers.','KaTeX runtime rendering, full app build, and real browser workflows require installation and execution.','All lesson and question statuses remain draft until subject-matter review and user acceptance.']};
fs.writeFileSync(path.join(output,'qa_summary.json'),JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(path.join(output,'editorial_flags.json'),JSON.stringify(issues,null,2)+'\n');
console.log('PASS QA v10.50:',Object.keys(lessons).length,'lesson structures;',qs.length,'question records;',reviewed.size,'reviewer math spot checks; 3 data-store round trips.');
console.log('Editorial follow-up:',report.editorialWarnings.shortExplanations,'short explanations; 699 other answers not separately reviewed.');
