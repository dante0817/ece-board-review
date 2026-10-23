import {readFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url),ts=require('typescript');
const root=path.resolve(import.meta.dirname,'..');
const extensions=['','.tsx','.ts','.jsx','.js','.mjs','.json','.css','.scss','.svg','.png','.jpg','.webp','.woff2'];
const sources=[];
function visit(dir){for(const name of readdirSync(dir)){if(['node_modules','dist','.git'].includes(name))continue;const f=path.join(dir,name),s=statSync(f);if(s.isDirectory())visit(f);else if(/\.tsx?$/.test(f))sources.push(f);}}
visit(path.join(root,'src'));sources.push(path.join(root,'server.ts'),path.join(root,'vite.config.ts'));
let parseDiagnostics=0,imports=0;const missing=[];
for(const file of sources){
 const data=readFileSync(file,'utf8');
 const tree=ts.createSourceFile(file,data,ts.ScriptTarget.Latest,true,file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 parseDiagnostics+=tree.parseDiagnostics.length;
 function inspect(node){
  const spec=(ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier&&ts.isStringLiteral(node.moduleSpecifier)?node.moduleSpecifier.text:null;
  if(spec&&(spec.startsWith('.')||spec.startsWith('@/'))){
   imports++;
   const cleaned=spec.split('?')[0];
   const candidate=spec.startsWith('@/')?path.join(root,cleaned.slice(2)):path.resolve(path.dirname(file),cleaned);
   const found=extensions.some(ext=>existsSync(candidate+ext)&&statSync(candidate+ext).isFile())||
    ['index.ts','index.tsx','index.js'].some(name=>existsSync(path.join(candidate,name)));
   if(!found)missing.push(`${path.relative(root,file)}: ${spec}`);
  }
  ts.forEachChild(node,inspect);
 }
 inspect(tree);
}
console.log(`TypeScript/TSX source files parsed: ${sources.length}`);
console.log(`Source parsing errors: ${parseDiagnostics}`);
console.log(`Relative/alias imports checked: ${imports}`);
console.log(`Unresolved local imports: ${missing.length}`);
for(const line of missing.slice(0,25))console.log(`MISSING ${line}`);
if(parseDiagnostics||missing.length)process.exitCode=1;
