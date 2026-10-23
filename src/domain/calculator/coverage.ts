import type {MockExamQuestion} from '../../types';
import {getCanonTechnique} from './canonTechniques';
import {resolveFamilyTechnique} from './familyTechniques';

/** Question availability != TOS mastery or physical-device verification. */
export interface CalculatorCoverageArea {id:string;label:string;available:number;total:number}
export interface CalculatorCoverageSnapshot {
 total:number;available:number;pending:number;
 pilot:number;familyVariants:number;areas:CalculatorCoverageArea[];
}
const areaLabels:Readonly<Record<string,string>>={
 'subj-math-algebra':'Mathematics',
 'subj-geas':'General Engineering and Applied Sciences',
 'subj-electronics':'Electronics Engineering',
 'subj-communications':'Electronics Systems and Technologies',
};
export function summarizeCalculatorCoverage(questions:readonly MockExamQuestion[]):CalculatorCoverageSnapshot {
 const unique=new Map(questions.map(q=>[q.id,q]));
 const areas=new Map<string,CalculatorCoverageArea>();
 for(const [id,label] of Object.entries(areaLabels))areas.set(id,{id,label,available:0,total:0});
 let available=0,pilot=0,familyVariants=0;
 for(const q of unique.values()){
  const found=areas.get(q.subjectId)??{id:q.subjectId,label:q.subjectName||'Other',available:0,total:0};
  found.total++;
  const exact=!!getCanonTechnique(q.id);
  const family=!exact&&resolveFamilyTechnique(q).kind==='available';
  if(exact||family){found.available++;available++;if(exact)pilot++;else familyVariants++;}
  areas.set(q.subjectId,found);
 }
 return {total:unique.size,available,pending:unique.size-available,pilot,familyVariants,areas:[...areas.values()]};
}
