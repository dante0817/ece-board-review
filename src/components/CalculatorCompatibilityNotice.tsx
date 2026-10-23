import React from 'react';
import {AlertTriangle} from 'lucide-react';
import {useReview} from '../context/ReviewContext';
/** Legacy tutorials deliberately remain Casio-specific rather than inventing Canon key substitutions. */
export function CalculatorCompatibilityNotice(){
 const {userProfile,setCurrentScreen}=useReview();
 return <aside className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-950" role="note">
  <div className="font-bold flex gap-2 items-center"><AlertTriangle className="w-4 h-4"/> Calculator model compatibility</div>
  <p className="mt-1">This legacy tutorial demonstrates <strong>Casio-specific</strong> menus, keys or screen behavior.
   Your selected profile is <strong>{userProfile.calculatorModel||'Canon F-789SGA'}</strong>. Do <strong>not</strong> follow the Casio keystrokes as Canon instructions.
   The fx-991ES and fx-991ES Plus are prohibited by the October 2026 PRC ECE examination program. Check the exact model and current rules before board use.</p>
  <p className="mt-1">Numerical substitutions can catch mistakes but do not generally prove an algebraic identity.</p>
  <button type="button" onClick={()=>setCurrentScreen('calculator-skills')} className="mt-2 text-amber-950 underline font-semibold">Open Canon calculator skills</button>
 </aside>;
}
