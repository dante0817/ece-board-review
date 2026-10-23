import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);const ts=require('typescript');
const files=[
 'src/App.tsx','src/context/ReviewContext.tsx','src/components/Sidebar.tsx',
 'src/features/geometry/GeometryScreen.tsx','src/features/geometry/geometryCatalog.ts',
 'src/domain/learn/manualLearnTracking.ts',
 'src/features/analytic-geometry/analyticGeometryContent.ts',
 'src/features/analytic-geometry/AnalyticGeometryIllustration.tsx',
 'src/features/analytic-geometry/AnalyticGeometryScreen.tsx',
 'src/features/analytic-geometry/AnalyticPracticePanel.tsx',
];
for(const file of files){
 const src=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
 const type=file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS;
 const sf=ts.createSourceFile(file,src,ts.ScriptTarget.ES2022,true,type);
 assert.equal(sf.parseDiagnostics.length,0,`${file}: ${sf.parseDiagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')).join(' / ')}`);
 const result=ts.transpileModule(src,{fileName:file,compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true});
 assert(!(result.diagnostics??[]).some(d=>d.category===ts.DiagnosticCategory.Error),file);
}
console.log(`PASS Analytic Geometry source syntax: ${files.length} TS/TSX files parse/transpile cleanly (not a complete typecheck)`);
