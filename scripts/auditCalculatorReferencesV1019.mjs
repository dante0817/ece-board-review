import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const rows=[['file','line','classification','excerpt']];
const skip=new Set(['CalculatorCompatibilityNotice.tsx','CalculatorTechniqueCard.tsx','CalculatorSkillsScreen.tsx']);
function scan(dir){for(const d of readdirSync(dir,{withFileTypes:true})){
 const full=path.join(dir,d.name);
 if(d.isDirectory()){scan(full);continue;}
 if(!/\.(ts|tsx)$/.test(d.name)||skip.has(d.name))continue;
 const rel=path.relative(root,full).replaceAll('\\','/');
 readFileSync(full,'utf8').split(/\r?\n/).forEach((line,i)=>{
  if(!/\bcasio\b|\bfx-991(?:ES|CW|EX)?\b/i.test(line))return;
  const classification=/\b(board exam|prc|licensure|board technique|board shortcut)\b/i.test(line)?'board-context-review':
   /\b(keystroke|shift|solve|mode|calc|menu|calculator|syntax)\b/i.test(line)?'model-specific-instruction':'legacy-model-mention';
  rows.push([rel,i+1,classification,line.trim().slice(0,170)]);
 });
}}
scan(path.join(root,'src'));
const quote=x=>'"'+String(x).replaceAll('"','""')+'"';
writeFileSync(path.join(root,'CALCULATOR_CASIO_AUDIT_V10_19.csv'),rows.map(r=>r.map(quote).join(',')).join('\n')+'\n');
const totals={};for(const row of rows.slice(1)){totals[row[2]]=(totals[row[2]]??0)+1;}
console.log(JSON.stringify({occurrences:rows.length-1,files:new Set(rows.slice(1).map(r=>r[0])).size,classifications:totals}));
