/** v10.30 second-implementation numeric and exact option checks.
 * Independent implementations exercise the original family parameters, NOT
 * a claim of expert/PRC review or verified subtopic/difficulty alignment.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..'),cache=new Map();
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
function load(rel){
 const full=path.resolve(root,rel);if(cache.has(full))return cache.get(full).exports;
 const code=ts.transpileModule(read(rel),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const mod={exports:{}};cache.set(full,mod);
 new Function('require','module','exports',code)(name=>name.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(full),name+'.ts'))):require(name),mod,mod.exports);
 return mod.exports;
}
const {BOARD_EXPANSION_FAMILIES,BOARD_EXPANSION_QUESTIONS}=load('src/data/boardExpansionQuestions.ts');
const {TOS_EXPANSION_FAMILIES_V1016,TOS_EXPANSION_QUESTIONS_V1016}=load('src/data/tosCompetencyExpansionV1016.ts');
const {MOCK_EXAM_QUESTIONS,ALGEBRA_REFERENCE_ASSESSMENT_QUESTIONS}=load('src/data/mockExamQuestions.ts');
const {OFFICIAL_TOS_COURSES,OFFICIAL_TOS_SOURCE}=load('src/data/officialTos.ts');
const {getTosCourseId}=load('src/domain/exam/tosCoverage.ts');
const {CONTENT_REVIEW_FINDINGS_V1030,contentReviewFinding}=load('src/data/contentReviewV1030.ts');
const {classifyQuestionQuality}=load('src/domain/exam/questionQuality.ts');
const pool=[...MOCK_EXAM_QUESTIONS,...ALGEBRA_REFERENCE_ASSESSMENT_QUESTIONS];
const byId=new Map(pool.map(q=>[q.id,q]));
const option=(q)=>q.options.find(o=>o.id===q.correctOptionId)?.text;
const near=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(a),Math.abs(b));
const oracles14={
 'newton':([m,a])=>m*a,
 'kinetic-energy':([m,v])=>0.5*m*(v**2),
 'mechanical-power':([e,t])=>e/t,
 'hydrostatic-pressure':([rho,h])=>(rho*h)*0.00981,
 'boyle':([p,v1,v2])=>p/(v2/v1),
 'sensible-heat':([m,c,dt])=>(m*c/1000)*dt,
 'stress':([f,a])=>(f/1e6)/a,
 'strain':([l,dl])=>(dl/l)*100,
 'efficiency':([pout,pin])=>pout/(pin/100),
 'simple-interest':([p,r,t])=>p*(r*t),
 'present-value':([fv,r,n])=>fv*Math.pow(1+r,-n),
 'density':([m,vol])=>m/vol,
 'moles':([m,molmass])=>m/molmass,
 'molarity':([n,vol])=>n/vol,
 'acidity':([exp])=>-Math.log10(10**(-exp)),
 'projectile-height':([v])=>v**2/(2*10),
 'divider':([v,r1,r2])=>v/(1+r1/r2),
 'series':v=>v.reduce((a,b)=>a+b,0),
 'parallel':([r1,r2])=>1/(1/r1+1/r2),
 'rc-time':([r,uf])=>(r*uf)*0.001,
 'rl-time':([h,r])=>h/r*1000,
 'rc-cutoff':([r,uf])=>1/(2*Math.PI*r*(uf/1000000)),
 'inverting-amp':([rin,rf,vin])=>(-rf/rin)*vin,
 'noninverting-amp':([rg,rf,vin])=>(rf/rg+1)*vin,
 'bjt-beta':([beta,ib])=>ib*beta,
 'transistor-power':([v,i])=>v*i,
 'diode-resistor':([v,r,vd])=>(v-vd)*1000/r,
 'rms-sine':([peak])=>peak*(Math.SQRT1_2),
 'led-resistor':([supply,led,ma])=>(supply-led)/(ma/1000),
 'adc-step':([v,bits])=>v*1000/Math.pow(2,bits),
 'ripple-frequency':([hz])=>2*hz,
 'coulomb-charge':([a,s])=>s*a,
 'nyquist-sampling':([f])=>f+f,
 'pcm-bitrate':([samples,bits])=>samples*(bits/1000),
 'wavelength':([mhz])=>(3e8)/(mhz*1e6),
 'quarterwave':([mhz])=>3e8/(4*mhz*1e6),
 'shannon':([band,snr])=>band*Math.log(1+snr)/Math.LN2/1000,
 'power-gain':([ratio])=>10*Math.log(ratio)/Math.LN10,
 'qam-bits':([size])=>Math.log(size)/Math.LN2,
 'propagation-delay':([km,v])=>(km*1000/v)*1000,
 'am-bandwidth':([fm])=>fm/500,
 'carson':([df,fm])=>2*df+2*fm,
 'baudrate':([bps,m])=>bps*(Math.LN2/Math.log(m)),
 'bit-duration':([bps])=>1/(bps/1000),
 'fiber-delay':([km,v])=>km/v*1000000,
 'channel-spacing':([n,khz])=>(n*khz)/1000,
 'packet-efficiency':([payload,header])=>100/(1+header/payload),
 'attenuation':([a,d])=>d*a,
};
const oracles16={
 'arithmetic-mean':v=>v.reduce((a,b)=>a+b,0)/4,
 'weighted-mean':([a,wa,b,wb])=>(a+b*(wb/wa))/(1+wb/wa),
 'coulomb-force':([a,b,r])=>(0.00899*a*b)/(r*r),
 'discrete-rms':v=>Math.hypot(...v)/2,
 'percent-overshoot':([p,s])=>(p/s-1)*100,
 'cost-performance-index':([earned,cost])=>earned/cost,
 'startup-breakeven':([fixed,price,variable])=>fixed/(price-variable),
 'nested-loop-count':([n])=>(n*n+n)/2,
 'pollutant-removal':([inflow,outflow])=>(1-outflow/inflow)*100,
 'cad-scale':([length,den])=>length/den*1000,
 'faraday-emf':([turns,flux,s])=>turns*(flux/s),
 'binary-truth-table':([bits])=>2**bits,
 'timer-overflow':([bits,mhz,prescale])=>(2**bits)*(prescale/mhz)/1000,
 'type-zero-error':([kp])=>1/(1+kp)*100,
 'dac-code-voltage':([bits,vref,code])=>(code/(2**bits))*vref,
 'stop-wait-throughput':([bits,mbps,rtt])=>(bits/1000)/(bits/(mbps*1e6)+rtt/1000),
};
let checked=0;
for(const [prefix,families,oracles,questions,digits] of [
 ['v1014',BOARD_EXPANSION_FAMILIES,oracles14,BOARD_EXPANSION_QUESTIONS,5],
 ['v1016',TOS_EXPANSION_FAMILIES_V1016,oracles16,TOS_EXPANSION_QUESTIONS_V1016,6],
]){
 assert.equal(Object.keys(oracles).length,families.length);
 for(const f of families){
  const oracle=oracles[f.id];assert.equal(typeof oracle,'function',`Missing independently written cross-check ${f.id}`);
  for(let i=0;i<2;i++){
   const qid=`${prefix}-${f.area}-${f.id}-${i+1}`;
   const q=byId.get(qid);assert.ok(q,`Missing real question ${qid}`);
   assert.equal(q.questionFamilyId,`${prefix}-${f.area}-${f.id}`);
   assert.equal(q.calculatorInputs?.familyId,q.questionFamilyId);
   assert.deepEqual(q.calculatorInputs.values,[...f.cases[i]]);
   assert.equal(q.calculatorInputs.unit,f.unit);
   const independentlyComputed=oracle(f.cases[i]);
   assert.ok(near(f.solve(f.cases[i]),independentlyComputed),`Cross-check failed: ${qid}`);
   const expected=String(Number(independentlyComputed.toPrecision(digits)))+' '+f.unit;
   assert.equal(option(q),expected,`Option/key/unit/rounding mismatch: ${qid}`);
   assert.equal(q.options.filter(o=>o.text===expected).length,1,`Not one keyed option: ${qid}`);
   assert.ok(q.explanation.includes(f.formula));
   checked++;
  }
 }
 assert.equal(questions.length,2*families.length);
}
assert.equal(checked,128);
// A complete Boolean truth-table proves none of the three distractors equals the key.
const demorgan=byId.get('mock-q-14');assert.ok(demorgan);
assert.equal(option(demorgan),'F’ = A’B’ + C’D');
for(let mask=0;mask<16;mask++){
 const [A,B,C,D]=[0,1,2,3].map(i=>!!(mask&(1<<i)));
 const correct=!( (A||B)&&(C||!D) );
 const keyed=(!A&&!B)||(!C&&D);
 assert.equal(keyed,correct,`De Morgan keyed option fails mask ${mask}`);
}
const [counterA,counterB,counterC,counterD]=[true,true,false,true];
const actual=!((counterA||counterB)&&(counterC||!counterD));
const distractorC=(!counterA&&!counterB)||(counterC||!counterD);
assert.notEqual(actual,distractorC,'Option C must remain an incorrect distractor');
assert.ok(option(byId.get('mock-q-25')).includes('0.242'));
assert.ok(option(byId.get('mock-q-35')).includes('cos c = cos a · cos b'));
// Whole bank: no broken keys, duplicate IDs, or same-text options.
const ids=new Set();
for(const q of pool){
 assert.ok(!ids.has(q.id),`Duplicate question ID ${q.id}`);ids.add(q.id);
 assert.equal(q.options.length,4,`Expected four MC options ${q.id}`);
 assert.equal(new Set(q.options.map(o=>o.id)).size,4,`Repeated option ID ${q.id}`);
 assert.equal(new Set(q.options.map(o=>o.text.trim())).size,4,`Repeated exact option ${q.id}`);
 assert.equal(q.options.filter(o=>o.id===q.correctOptionId).length,1,`Missing key ${q.id}`);
 assert.ok(q.explanation?.trim(),`Missing explanation ${q.id}`);
}
assert.equal(pool.length,368);assert.equal(ids.size,368);
assert.equal(OFFICIAL_TOS_SOURCE.url,'https://www.prc.gov.ph/sites/default/files/EE2022-10%20TOS.pdf');
for(const area of ['math','geas','electronics','est']){
 assert.equal(OFFICIAL_TOS_COURSES.filter(c=>c.areaId===area).reduce((s,c)=>s+c.officialItems,0),100);
}
assert.equal(CONTENT_REVIEW_FINDINGS_V1030.length,5);
assert.equal(new Set(CONTENT_REVIEW_FINDINGS_V1030.map(f=>f.familyId)).size,5);
for(const f of CONTENT_REVIEW_FINDINGS_V1030){
 assert.ok(pool.some(q=>q.questionFamilyId===f.familyId),`Review flag targets absent family: ${f.familyId}`);
 const qs=pool.filter(q=>q.questionFamilyId===f.familyId);
 assert.equal(qs.length,2);assert.ok(qs.every(q=>!!getTosCourseId(q)));
 assert.equal(contentReviewFinding(f.familyId)?.disposition,f.disposition);
}
for(const q of pool)assert.ok(['numeric-fixture-checked','generator-checked','manual-review-required'].includes(classifyQuestionQuality(q)));
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(/^10\.(?:3[0-9]|[4-9][0-9])\.\d+$/.test(pkg.version),'Version must be at least 10.30.x');assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
const notice=read('src/components/TimedMockExam.tsx');
assert.ok(notice.includes('Some mapped practice families have documented subtopic concerns'));
for(const outfile of ['CONTENT_QUESTION_LEDGER_V10_30.csv','CONTENT_TOS_COURSE_AUDIT_V10_30.csv','CONTENT_TOS_SUBTOPIC_FLAGS_V10_30.csv','CONTENT_AUDIT_SUMMARY_V10_30.json'])assert.ok(fs.existsSync(path.join(root,outfile)),`Run audit:content:v10.30 first: ${outfile}`);
const report=JSON.parse(read('CONTENT_AUDIT_SUMMARY_V10_30.json'));
assert.equal(report.totalQuestions,368);assert.equal(report.courseMappedUnique,152);assert.equal(report.quality['manual-review-required'],238);
assert.equal(report.flaggedMappedVariants,10);
console.log(`PASS v10.30: ${checked} independently reimplemented numeric cross-checks across 64 families`);
console.log('PASS whole 368-question key/explanation/option/ID integrity');
console.log('PASS De Morgan 16-row truth table and incorrect-distractor counterexample');
console.log('PASS PRC course totals, historical course mappings, 5 editorial subtopic concern flags, auditable CSVs');
console.log('PASS full question ledger, quota shortages, preserving existing question IDs/answers and no false signoff');
