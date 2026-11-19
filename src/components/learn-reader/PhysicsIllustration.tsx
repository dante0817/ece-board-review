import React from 'react';
import type { PhysicsDiagramKind } from '../../domain/learn/lessonTypes';

/** Original lightweight instructional SVGs. Not copied from the reference PDFs. */
export const PhysicsIllustration:React.FC<{kind:PhysicsDiagramKind;caption:string}>=({kind,caption})=>{
  const markerId=React.useId().replace(/:/g,'');
  const title:Record<PhysicsDiagramKind,string>={
    'vector-components':'Vector components along orthogonal axes',
    'projectile':'Ideal projectile trajectory',
    'free-body':'Horizontal free-body force diagram',
    'wave':'Traveling wave displacement profile',
    'fluid-flow':'Steady flow through a narrowing pipe',
    'refraction':'Light refraction into a denser optical medium',
  };
  const arrow=(id:string)=><marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"/></marker>;
  return <figure className="rounded-xl border border-slate-200 bg-white p-3 sm:p-5 space-y-2" aria-label={title[kind]}>
    <div className="w-full overflow-x-auto">
      <svg viewBox="0 0 640 260" role="img" aria-label={title[kind]} className="block w-full h-auto max-h-[300px] text-blue-700" xmlns="http://www.w3.org/2000/svg">
        <defs>{arrow(markerId)}</defs>
        {kind==='vector-components'&&<>
          <line x1="72" y1="208" x2="565" y2="208" stroke="#94a3b8" strokeWidth="2"/><line x1="100" y1="232" x2="100" y2="22" stroke="#94a3b8" strokeWidth="2"/>
          <line x1="100" y1="208" x2="450" y2="60" stroke="#2563eb" strokeWidth="4" markerEnd={`url(#${markerId})`}/>
          <line x1="100" y1="208" x2="450" y2="208" stroke="#059669" strokeWidth="3" strokeDasharray="8 6"/>
          <line x1="450" y1="208" x2="450" y2="60" stroke="#d97706" strokeWidth="3" strokeDasharray="8 6"/>
          <path d="M 162 208 Q 160 178 154 180" fill="none" stroke="#64748b" strokeWidth="1.5"/>
          <g fill="#334155" fontSize="19"><text x="571" y="213">x</text><text x="88" y="20">y</text><text x="285" y="200">Fₓ</text><text x="461" y="145">Fᵧ</text><text x="460" y="55">F</text><text x="161" y="192">θ</text></g>
        </>}
        {kind==='projectile'&&<>
          <line x1="43" y1="212" x2="604" y2="212" stroke="#64748b" strokeWidth="3"/>
          <path d="M 82 210 Q 310 -44 560 210" fill="none" stroke="#2563eb" strokeWidth="4"/>
          <line x1="82" y1="210" x2="150" y2="144" stroke="#059669" strokeWidth="3" markerEnd={`url(#${markerId})`}/>
          <line x1="319" y1="84" x2="319" y2="212" stroke="#94a3b8" strokeDasharray="5 6"/>
          <g fill="#334155" fontSize="18"><text x="148" y="132">v₀</text><text x="280" y="72">Apex (vᵧ = 0)</text><text x="280" y="240">Range R</text><text x="45" y="240">Launch</text><text x="544" y="240">Landing</text></g>
        </>}
        {kind==='free-body'&&<>
          <line x1="76" y1="198" x2="567" y2="198" stroke="#64748b" strokeWidth="4"/>
          <rect x="246" y="141" width="106" height="56" rx="5" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="2"/>
          <line x1="300" y1="141" x2="300" y2="40" stroke="#059669" strokeWidth="3.5" markerEnd={`url(#${markerId})`}/>
          <line x1="300" y1="169" x2="300" y2="238" stroke="#d97706" strokeWidth="3.5" markerEnd={`url(#${markerId})`}/>
          <line x1="352" y1="171" x2="485" y2="171" stroke="#2563eb" strokeWidth="3.5" markerEnd={`url(#${markerId})`}/>
          <line x1="246" y1="171" x2="115" y2="171" stroke="#be123c" strokeWidth="3.5" markerEnd={`url(#${markerId})`}/>
          <g fill="#334155" fontSize="19"><text x="313" y="56">N</text><text x="314" y="249">mg</text><text x="488" y="164">F</text><text x="89" y="161">f</text><text x="264" y="176">Block</text></g>
        </>}
        {kind==='wave'&&<>
          <line x1="50" y1="133" x2="597" y2="133" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 5"/>
          <path d="M 50 133 C 97 15 152 15 200 133 S 302 251 350 133 S 452 15 500 133 S 552 245 593 133" fill="none" stroke="#2563eb" strokeWidth="4"/>
          <line x1="126" y1="40" x2="425" y2="40" stroke="#059669" strokeWidth="2.5" markerEnd={`url(#${markerId})`}/>
          <g fill="#334155" fontSize="18"><text x="270" y="29">Wavelength λ</text><text x="52" y="117">Equilibrium</text><text x="555" y="244">x</text></g>
        </>}
        {kind==='fluid-flow'&&<>
          <path d="M 45 56 H 210 L 300 106 H 390 L 470 56 H 595 V 211 H 470 L 390 162 H 300 L 210 211 H 45 Z" fill="#e0f2fe" stroke="#0e7490" strokeWidth="3"/>
          <path d="M 60 132 H 565" stroke="#0f766e" strokeWidth="3" strokeDasharray="10 7" fill="none" markerEnd={`url(#${markerId})`}/>
          <line x1="102" y1="132" x2="180" y2="132" stroke="#2563eb" strokeWidth="3" markerEnd={`url(#${markerId})`}/>
          <line x1="318" y1="132" x2="396" y2="132" stroke="#2563eb" strokeWidth="3" markerEnd={`url(#${markerId})`}/>
          <g fill="#334155" fontSize="19"><text x="96" y="45">Area A₁</text><text x="325" y="88">A₂</text><text x="110" y="119">v₁</text><text x="335" y="120">v₂</text><text x="245" y="238">For steady incompressible flow: A₁v₁ = A₂v₂</text></g>
        </>}
        {kind==='refraction'&&<>
          <rect x="40" y="133" width="560" height="105" fill="#dbeafe"/>
          <line x1="40" y1="133" x2="600" y2="133" stroke="#0891b2" strokeWidth="3"/>
          <line x1="322" y1="15" x2="322" y2="245" stroke="#64748b" strokeWidth="2" strokeDasharray="6 6"/>
          <line x1="220" y1="28" x2="322" y2="133" stroke="#d97706" strokeWidth="4" markerEnd={`url(#${markerId})`}/>
          <line x1="322" y1="133" x2="385" y2="239" stroke="#2563eb" strokeWidth="4" markerEnd={`url(#${markerId})`}/>
          <g fill="#334155" fontSize="19"><text x="52" y="30">Air (n₁)</text><text x="52" y="168">Glass (n₂ &gt; n₁)</text><text x="337" y="31">Normal</text><text x="261" y="89">θ₁</text><text x="332" y="172">θ₂</text></g>
        </>}
      </svg>
    </div>
    <figcaption className="text-xs sm:text-sm text-slate-600 leading-relaxed">{caption} · Original schematic; not to scale.</figcaption>
  </figure>;
};
