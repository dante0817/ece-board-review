/** Dependency-free regression of fail-closed UI disclosure scope and packaging contract. */
import assert from 'node:assert/strict';
import path from 'node:path';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..');
const source=readFileSync(path.join(root,'src/domain/calculator/disclosureScope.ts'),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},reportDiagnostics:true});
assert.equal(code.diagnostics?.length??0,0);
const module={exports:{}};
new Function('module','exports',code.outputText)(module,module.exports);
const {calculatorDisclosureScope,visibleCalculatorTab,selectCalculatorTab}=module.exports;
const ctx={questionId:'mock-q-04',questionFingerprint:'coefficients:1,2,-35',assessmentStatus:'study-active',attemptId:'a1',disclosure:'after-answer',techniqueId:'canon-quadratic'};
const scope=calculatorDisclosureScope(ctx),state=selectCalculatorTab(scope,'shortcut',true);
assert.ok(state);assert.equal(visibleCalculatorTab(state,scope,true),'shortcut');
assert.equal(visibleCalculatorTab(state,scope,false),'closed');
assert.equal(selectCalculatorTab(scope,'shortcut',false),null);
assert.equal(visibleCalculatorTab({scopeKey:scope,tab:'invalid'},scope,true),'closed');
for(const change of [
 {questionId:'mock-q-05'}, {questionFingerprint:'coefficients:1,0,-35'},
 {assessmentStatus:'strict-active'}, {assessmentStatus:'finalizing'},
 {assessmentStatus:'finalized'}, {attemptId:'a2'}, {disclosure:'skills-center'},
 {techniqueId:'other-template'}]){
 assert.equal(visibleCalculatorTab(state,calculatorDisclosureScope({...ctx,...change}),true),'closed',JSON.stringify(change));
}
assert.notEqual(calculatorDisclosureScope({...ctx,questionId:'a|b'}),calculatorDisclosureScope({...ctx,questionId:'a',questionFingerprint:'b|coefficients:1,2,-35'}));
const component=readFileSync(path.join(root,'src/components/CalculatorTechniqueCard.tsx'),'utf8');
for(const expression of ['visibleCalculatorTab(tabState,scopeKey,allowed&&Boolean(active))','selectCalculatorTab(scopeKey,kind,allowed&&Boolean(active))','recordAidDisclosure','canRevealCalculator(assessmentSession,disclosure)'])assert.ok(component.includes(expression),expression);
assert.ok(!component.includes("useState<'closed'|'shortcut'|'verify'>('closed')"));
const pkg=JSON.parse(readFileSync(path.join(root,'package.json'),'utf8'));
const lock=JSON.parse(readFileSync(path.join(root,'package-lock.json'),'utf8'));
assert.match(pkg.version,/^10\.(?:2[7-9]|[3-9]\d)\.\d+$/);assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
assert.equal(pkg.scripts['certify:runtime:v10.27'],'node scripts/checkRuntimeCertificationV1027.mjs');
console.log('PASS: calculator tabs fail closed on question/answer, attempt, mode, technique and disclosure transitions');
console.log('PASS: failed permissions cannot select tabs; logged aid disclosure remains explicit');
console.log('PASS: compatible v10.27+ package/lockfile synchronized and runtime certification gate registered');
console.log('NOTE: No physical Canon device approval or full build certification is implied.');
