import { useEffect, useState } from 'react';
import { useReview } from '../context/ReviewContext';
import { chapterTrackingId, moduleTrackingId } from '../domain/learn/manualLearnTracking';

/** Retains catalog-module identity for legacy dedicated Learn screens. */
export function useAlgebraLearnTrackingIdentity(canonicalTopicId:string, chapterTitle:string, alsoHandledTopicIds:readonly string[]=[]){
  const { topicLaunchIntent,clearTopicLaunchIntent }=useReview();
  const fromIntent=()=>{
    const intent=topicLaunchIntent;
    if(!intent || (intent.topicId!==canonicalTopicId && !alsoHandledTopicIds.includes(intent.topicId)) || intent.source!=='catalog' || !intent.catalogModuleId || !intent.catalogModuleName)return null;
    return {id:moduleTrackingId(intent.catalogModuleId),label:intent.catalogModuleName};
  };
  const [source,setSource]=useState<{id:string;label:string}|null>(fromIntent);
  useEffect(()=>{
    if(!topicLaunchIntent || (topicLaunchIntent.topicId!==canonicalTopicId && !alsoHandledTopicIds.includes(topicLaunchIntent.topicId)))return;
    setSource(fromIntent());
    clearTopicLaunchIntent();
  },[topicLaunchIntent,canonicalTopicId,clearTopicLaunchIntent]);
  return {trackingId:source?.id??chapterTrackingId(canonicalTopicId),trackingScopeLabel:source?.label??`${chapterTitle} (whole chapter)`};
}
