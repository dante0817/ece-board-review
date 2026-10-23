import {shuffledOptionIds} from '../assessment/optionOrder';
/** One item from each distinct conceptual family; different numeric variants of a family do not add independent breadth. */
export function selectReservedQuestionIds<T extends {id:string;familyId:string}>(available:readonly T[], count=3, random:()=>number=Math.random):string[]{
  if(!Number.isSafeInteger(count)||count<1)throw Error('Invalid assessment question count');
  const itemIds=shuffledOptionIds(available.map(item=>({id:item.id,text:''})),false,random);
  const byId=new Map(available.map(item=>[item.id,item]));
  const usedFamilies=new Set<string>();const selected:string[]=[];
  for(const id of itemIds){
    const item=byId.get(id)!;
    if(usedFamilies.has(item.familyId))continue;
    usedFamilies.add(item.familyId);selected.push(id);
    if(selected.length===count)break;
  }
  return selected;
}
export function countReservedFamilies<T extends {familyId:string}>(items:readonly T[]):number {
  return new Set(items.map(item=>item.familyId)).size;
}
