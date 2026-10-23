import React,{createContext,useCallback,useContext,useMemo,useState} from 'react';
import type {AngleUnit,CalculatorMode,Complex} from '../../domain/calculator/simulator/engine';
import {complex} from '../../domain/calculator/simulator/engine';
export interface CalculatorContextValue{
 open:boolean;setOpen:(value:boolean)=>void;mode:CalculatorMode;setMode:(value:CalculatorMode)=>void;
 angle:AngleUnit;setAngle:(value:AngleUnit)=>void;ans:Complex;setAns:(value:Complex)=>void;
 memory:Complex;setMemory:(value:Complex)=>void;
}
const Context=createContext<CalculatorContextValue|null>(null);
export const CALCULATOR_SIMULATOR_PREFS_KEY='bsece.f789sga.simulator.settings.v1';
function storedAngle():AngleUnit{try{const a=JSON.parse(localStorage.getItem(CALCULATOR_SIMULATOR_PREFS_KEY)||'{}').angle;return a==='RAD'||a==='GRAD'?a:'DEG'}catch{return 'DEG'}}
export const CalculatorProvider:React.FC<React.PropsWithChildren>=({children})=>{
 const [open,setOpen]=useState(false);const [mode,setMode]=useState<CalculatorMode>('COMP');
 const [angle,updateAngle]=useState<AngleUnit>(storedAngle);const [ans,setAns]=useState<Complex>(complex(0));const [memory,setMemory]=useState<Complex>(complex(0));
 const setAngle=useCallback((value:AngleUnit)=>{updateAngle(value);try{localStorage.setItem(CALCULATOR_SIMULATOR_PREFS_KEY,JSON.stringify({angle:value}))}catch{/* private storage is optional */}},[]);
 const value=useMemo(()=>({open,setOpen,mode,setMode,angle,setAngle,ans,setAns,memory,setMemory}),[open,mode,angle,ans,memory,setAngle]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
};
export function useCalculator(){const context=useContext(Context);if(!context)throw Error('CalculatorProvider missing');return context}
