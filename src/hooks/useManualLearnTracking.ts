import { useMemo, useSyncExternalStore } from 'react';
import { MANUAL_LEARN_CHANGED_EVENT, MANUAL_LEARN_STORAGE_KEY, parseManualLearnStore } from '../domain/learn/manualLearnTracking';
const snapshot=()=>{try{return localStorage.getItem(MANUAL_LEARN_STORAGE_KEY)||'';}catch{return '';}};
const serverSnapshot=()=>'';
function subscribe(callback:()=>void):()=>void {
  if(typeof window==='undefined')return ()=>{};
  const onStorage=(event:StorageEvent)=>{if(event.key===MANUAL_LEARN_STORAGE_KEY||event.key===null)callback();};
  window.addEventListener('storage',onStorage);
  window.addEventListener(MANUAL_LEARN_CHANGED_EVENT,callback);
  return ()=>{window.removeEventListener('storage',onStorage);window.removeEventListener(MANUAL_LEARN_CHANGED_EVENT,callback);};
}
/** One snapshot across reader, catalog and other browser tabs. */
export function useManualLearnTracking(){
  const raw=useSyncExternalStore(subscribe,snapshot,serverSnapshot);
  return useMemo(()=>parseManualLearnStore(raw),[raw]);
}
