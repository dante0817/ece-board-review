import path from 'node:path';
import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),root=path.resolve(import.meta.dirname,'..');
const pkg=JSON.parse(readFileSync(path.join(root,'package.json'),'utf8'));
const mandatory=['react','react-dom','vite','@vitejs/plugin-react','@tailwindcss/vite','express','ws','@google/genai','esbuild','tsx','typescript'];
const missing=[];
for(const name of mandatory){
 try{
  const pkgPath=path.join(root,'node_modules',...name.split('/'),'package.json');
  if(!existsSync(pkgPath))missing.push(name);
 }catch{missing.push(name)}
}
console.log(`BSECE ${pkg.version} local build preflight`);
console.log(`Node ${process.version} · ${process.platform}/${process.arch}`);
console.log(`Lockfile: ${existsSync(path.join(root,'package-lock.json'))?'present':'MISSING'}`);
if(missing.length){
 console.error(`Cannot certify full build: ${missing.length} project dependency packages are missing.`);
 console.error(`Missing: ${missing.join(', ')}`);
 console.error('Run npm ci on a machine with npm registry access, then npm run lint && npm run build.');
 process.exitCode=2;
}else console.log('Core packages present. Next run npm run lint, npm run build and npm run smoke:browser:v10.23 (a preflight pass alone is NOT certification).');
