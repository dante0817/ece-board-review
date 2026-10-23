/** Legacy Linear Equations daily credit, deduplicated across retries and reloads. */
export const LINEAR_DAILY_CREDIT_KEY='ece_linear_daily_credit_v1';
export interface LinearDailyCredit {version:1;date:string;questionIds:string[]}
const DATE=/^\d{4}-\d{2}-\d{2}$/;
export function validateLinearCredit(x:unknown):x is LinearDailyCredit {
  if(!x||typeof x!=='object'||Array.isArray(x))return false;
  const o=x as Partial<LinearDailyCredit>;
  return o.version===1&&typeof o.date==='string'&&DATE.test(o.date)&&
    Array.isArray(o.questionIds)&&o.questionIds.length<=1000&&
    o.questionIds.every(id=>typeof id==='string'&&id.length>0&&id.length<=100)&&
    new Set(o.questionIds).size===o.questionIds.length;
}
/** Claims first daily credit BEFORE context counters are incremented. If storage is
 * inaccessible, deny the credit; never invent another unique attempt. */
export function claimLinearDailyCredit(store:Pick<Storage,'getItem'|'setItem'>,date:string,questionId:string):boolean {
  if(!DATE.test(date)||!questionId||questionId.length>100)return false;
  try {
    const raw=store.getItem(LINEAR_DAILY_CREDIT_KEY);
    const parsed:unknown=raw?JSON.parse(raw):null;
    if(raw&&!validateLinearCredit(parsed))return false;
    const ledger:LinearDailyCredit=parsed&&validateLinearCredit(parsed)&&parsed.date===date ? parsed : {version:1,date,questionIds:[]};
    if(ledger.questionIds.includes(questionId))return false;
    if(ledger.questionIds.length>=1000)return false;
    store.setItem(LINEAR_DAILY_CREDIT_KEY,JSON.stringify({...ledger,questionIds:[...ledger.questionIds,questionId]}));
    return true;
  }catch{return false;}
}
