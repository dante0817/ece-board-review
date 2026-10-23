/** v10.10 accidentally keyed Absolute Value practice as top-inequalities.
 * Split only identifiable q-abs-* items and ABS_* misconception counters.
 * Keep a complete pre-split snapshot and never reinterpret unknown keys.
 */
const PREFIX='ece_reference_practice_evidence_v1:';
const MARKER='ece_reference_absolute_value_split_v10.11';
const BACKUP=`${PREFIX}legacy-inequalities-abs-backup-v10.11`;
export interface ReferenceEvidenceStore {getItem(key:string):string|null;setItem(key:string,value:string):void}
type ItemEvidence={attempts:number;correct:number;lastCorrect:boolean;lastAttemptAt:string};
interface Stored {version:number;questions:Record<string,ItemEvidence>;misconceptionMisses:Record<string,number>}
function safeParse(value:string|null):Stored|null {
  if(!value)return null;
  try {
    const data=JSON.parse(value);
    if(data.version!==1||!data.questions||typeof data.questions!=='object'||Array.isArray(data.questions)||
      !data.misconceptionMisses||typeof data.misconceptionMisses!=='object'||Array.isArray(data.misconceptionMisses))return null;
    return data;
  }catch{return null;}
}
export function migrateAbsoluteValuePracticeEvidence(store:ReferenceEvidenceStore):'already'|'not-needed'|'migrated'|'invalid'|'failed'{
  if(store.getItem(MARKER))return 'already';
  const sourceKey=`${PREFIX}top-inequalities`,targetKey=`${PREFIX}top-absolute-value`;
  const raw=store.getItem(sourceKey);if(!raw)return 'not-needed';
  const source=safeParse(raw);if(!source)return 'invalid';
  const absEntries=Object.entries(source.questions).filter(([id])=>id.startsWith('q-abs-'));
  const absMisses=Object.entries(source.misconceptionMisses).filter(([id])=>id.startsWith('ABS_'));
  if(!absEntries.length&&!absMisses.length)return 'not-needed';
  const oldTarget=store.getItem(targetKey),target=oldTarget?safeParse(oldTarget):{version:1,questions:{},misconceptionMisses:{}};
  if(!target)return 'invalid';
  const sourceCopy:Stored={...source,questions:{...source.questions},misconceptionMisses:{...source.misconceptionMisses}};
  const targetCopy:Stored={...target,questions:{...target.questions},misconceptionMisses:{...target.misconceptionMisses}};
  for(const [id,evidence] of absEntries){
    // Never merge duplicate IDs with unknown prior provenance; retain target evidence and backup instead.
    if(!targetCopy.questions[id])targetCopy.questions[id]=evidence;
    delete sourceCopy.questions[id];
  }
  for(const [id,count] of absMisses){
    if(targetCopy.misconceptionMisses[id]===undefined)targetCopy.misconceptionMisses[id]=count;
    delete sourceCopy.misconceptionMisses[id];
  }
  try{
    if(!store.getItem(BACKUP))store.setItem(BACKUP,raw);
    store.setItem(targetKey,JSON.stringify(targetCopy));
    store.setItem(sourceKey,JSON.stringify(sourceCopy));
    store.setItem(MARKER,'1');
    return 'migrated';
  }catch {return 'failed';}
}
