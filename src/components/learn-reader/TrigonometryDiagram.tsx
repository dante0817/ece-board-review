import React from 'react';

type Diagram='radian'|'right-triangle'|'unit-circle'|'sine-graph'|'tangent-graph'|'reciprocal-graph'|'transform-graph'|'inverse-graphs'|'oblique-triangle'|'ssa-ambiguity'|'vector-components'|'vector-cross-product'|'complex-plane'|'roots-of-unity'|'polar-grid'|'parametric-circle'|'wave-sinusoid'|'wave-damped'|'wave-phasor'|'advanced-sphere'|'advanced-hyperbola';
/** Accessible, scalable original figures; no external assets or copied textbook plates. */
export const TrigonometryDiagram:React.FC<{diagram:Diagram;caption:string}>=({diagram,caption})=>{
  const common={viewBox:'0 0 360 245',role:'img' as const,'aria-label':caption,className:'w-full h-auto max-h-[300px]'};
  const ink='#1e3a8a',accent='#0891b2',sub='#475569';
  const line=(x1:number,y1:number,x2:number,y2:number,stroke=ink)=><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth="2.5"/>;
  const label=(x:number,y:number,t:string,color=ink)=><text x={x} y={y} fill={color} fontSize="13" fontFamily="system-ui" fontWeight="600">{t}</text>;
  return <figure className="border border-slate-200 rounded-xl bg-gradient-to-br from-slate-50 to-cyan-50 p-3 sm:p-4 space-y-2">
    {diagram==='wave-sinusoid'?<WaveSinusoidDiagram/>:diagram==='wave-damped'?<DampedWaveDiagram/>:diagram==='wave-phasor'?<WavePhasorDiagram/>:diagram==='advanced-sphere'?<AdvancedSphereDiagram/>:diagram==='advanced-hyperbola'?<AdvancedHyperbolaDiagram/>:diagram==='polar-grid'?<PolarGridDiagram/>:diagram==='parametric-circle'?<ParametricCircleDiagram/>:diagram==='complex-plane'?<ComplexPlaneDiagram/>:diagram==='roots-of-unity'?<RootsOfUnityDiagram/>:diagram==='oblique-triangle'? <svg {...common}>
      <path d="M65 195 L295 195 L208 48 Z" fill="#ecfeff" stroke={ink} strokeWidth="2.5"/>
      <path d="M89 195 A24 24 0 0 0 77 175" fill="none" stroke={accent} strokeWidth="2"/>
      <path d="M271 195 A24 24 0 0 1 282 174" fill="none" stroke={accent} strokeWidth="2"/>
      {label(44,211,'A')}{label(301,211,'B')}{label(207,36,'C')}
      {label(256,118,'a')}{label(122,117,'b')}{label(170,213,'c')}
      {label(97,178,'A',accent)}{label(254,179,'B',accent)}{label(219,79,'C',accent)}
      <text x="44" y="236" fill={sub} fontSize="11">Side a is opposite angle A; likewise for b and c.</text>
    </svg>:diagram==='ssa-ambiguity'?<svg {...common}>
      <path d="M53 195 H333" stroke={ink} strokeWidth="2.5"/>
      <path d="M53 195 L252 80" stroke={ink} strokeWidth="2.5"/>
      <path d="M252 80 L197 195" stroke={accent} strokeWidth="2.6"/>
      <path d="M252 80 L307 195" stroke="#7c3aed" strokeWidth="2.6"/>
      <path d="M252 80 V195" stroke="#d97706" strokeDasharray="5 4" strokeWidth="1.8"/>
      <path d="M78 195 A25 25 0 0 0 75 182" stroke={accent} fill="none" strokeWidth="2"/>
      {label(34,211,'A')}{label(186,213,'B₁',accent)}{label(300,213,'B₂','#7c3aed')}{label(252,68,'C')}
      {label(152,113,'b')}{label(204,133,'a',accent)}{label(295,130,'a','#7c3aed')}{label(260,174,'h','#d97706')}
      <text x="45" y="236" fontSize="11" fill={sub}>Acute SSA with h &lt; a &lt; b permits two triangles.</text>
    </svg>:diagram==='vector-components'?<VectorComponentsDiagram/>:diagram==='vector-cross-product'?<VectorCrossProductDiagram/>:diagram==='inverse-graphs'? <InverseTrigonometricGraph/> : ['sine-graph','tangent-graph','reciprocal-graph','transform-graph'].includes(diagram)? <TrigFunctionGraph diagram={diagram as 'sine-graph'|'tangent-graph'|'reciprocal-graph'|'transform-graph'}/>:diagram==='right-triangle'?<svg {...common}>
      {line(60,198,292,198)}{line(292,198,292,36)}{line(60,198,292,36)}
      <path d="M274 198 V180 H292" fill="none" stroke={sub} strokeWidth="1.5"/>
      <path d="M90 198 A30 30 0 0 0 84.5 181" fill="none" stroke={accent} strokeWidth="2"/>
      {label(82,188,'θ',accent)}{label(169,217,'adjacent = 4')}{label(300,118,'3')}{label(163,102,'hypotenuse = 5')}{label(59,236,'opposite side = 3 (vertical)',sub)}
    </svg>:diagram==='unit-circle'?<svg {...common}>
      {line(35,120,325,120,sub)}{line(180,12,180,230,sub)}<circle cx="180" cy="120" r="96" fill="#e0f2fe" stroke={ink} strokeWidth="2"/>
      {line(180,120,248,52,accent)}<path d="M207 120 A27 27 0 0 0 199 101" fill="none" stroke={accent} strokeWidth="2"/>
      <circle cx="248" cy="52" r="4" fill="#0891b2"/>
      <path d="M248 52 V120 H180" fill="none" strokeDasharray="4 4" stroke={sub} strokeWidth="1.3"/>
      {label(212,106,'45°',accent)}{label(207,35,'(√2/2, √2/2)')}{label(277,138,'1')}{label(186,20,'y')}{label(329,114,'x')}{label(90,140,'−1')}
    </svg>:<svg {...common}>
      {line(45,125,322,125,sub)}{line(180,20,180,225,sub)}<circle cx="180" cy="125" r="83" fill="#e0f2fe" stroke={ink} strokeWidth="2"/>
      {line(180,125,225,55,accent)}<path d="M225 55 A83 83 0 0 1 263 125" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round"/>
      <path d="M205 125 A25 25 0 0 0 194 104" fill="none" stroke={accent} strokeWidth="2"/>
      {label(202,106,'θ')}{label(216,42,'arc s = r')}{label(134,93,'radius r')}{label(327,142,'x')}{label(188,17,'y')}{label(165,141,'O')}
    </svg>}
    <figcaption className="text-xs text-slate-600 leading-relaxed text-center">{caption}</figcaption>
  </figure>;
};

/** Mathematical SVG charts with exact plotted function values; no copied figures. */
const TrigFunctionGraph: React.FC<{diagram:'sine-graph'|'tangent-graph'|'reciprocal-graph'|'transform-graph'}>=({diagram})=>{
 const x0=38, x1=332, yc=125, unit=42;
 const axis='#64748b', ink='#0e7490', light='#d97706';
 const isTan=diagram==='tangent-graph';
 const f=(theta:number)=> diagram==='sine-graph'?Math.sin(theta):isTan?Math.tan(theta):diagram==='reciprocal-graph'?1/Math.cos(theta):2*Math.sin(theta-Math.PI/4)+1;
 const domain=isTan?[-Math.PI/2,Math.PI/2]:[0,2*Math.PI];
 const toX=(t:number)=>x0+(t-domain[0])/(domain[1]-domain[0])*(x1-x0);
 const toY=(v:number)=>yc-unit*v;
 const breaks=diagram==='reciprocal-graph'?[0,Math.PI/2,3*Math.PI/2,2*Math.PI]:[domain[0],domain[1]];
 const lines:string[]=[];
 for(let k=0;k<breaks.length-1;k++){
   const a=breaks[k],b=breaks[k+1];let arr:string[]=[];
   for(let i=0;i<=100;i++){
     const t=a+(b-a)*(i/100);const y=f(t);
     if(!Number.isFinite(y)||Math.abs(y)>3.3){if(arr.length>1)lines.push(arr.join(' '));arr=[];continue;}
     arr.push(`${toX(t).toFixed(2)},${toY(y).toFixed(2)}`);
   }
   if(arr.length>1)lines.push(arr.join(' '));
 }
 const asymptotes=isTan?[domain[0],domain[1]]:diagram==='reciprocal-graph'?[Math.PI/2,3*Math.PI/2]:[];
 const title=diagram==='sine-graph'?'y = sin(x)':isTan?'y = tan(x)':diagram==='reciprocal-graph'?'y = sec(x)':'y = 2sin(x − π/4) + 1';
 return <svg viewBox="0 0 360 245" role="img" aria-label={`Graph of ${title}`} className="w-full h-auto max-h-[300px]">
   <path d={`M${x0} ${yc}H${x1} M${x0} 13V234`} stroke={axis} strokeWidth="1.4" fill="none"/>
   {[1,-1,2,-2].map(y=><g key={y}><line x1={x0} y1={toY(y)} x2={x1} y2={toY(y)} stroke="#cbd5e1" strokeDasharray="3 5"/><text x="7" y={toY(y)+4} fontSize="10" fill={axis}>{y}</text></g>)}
   {diagram==='transform-graph'&&<line x1={x0} y1={toY(1)} x2={x1} y2={toY(1)} stroke={light} strokeDasharray="5 3" strokeWidth="2"/>}
   {asymptotes.map((v,i)=><line key={i} x1={toX(v)} x2={toX(v)} y1="14" y2="229" stroke={light} strokeDasharray="4 4" strokeWidth="1.8"/>)}
   {lines.map((points,i)=><polyline key={i} points={points} stroke={ink} strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>)}
   {!isTan&&[0,Math.PI/2,Math.PI,3*Math.PI/2,2*Math.PI].map((t,i)=><text key={i} x={toX(t)} y="240" fill={axis} fontSize="10" textAnchor="middle">{['0','π/2','π','3π/2','2π'][i]}</text>)}
   {isTan&&<text x={toX(0)} y="240" fill={axis} fontSize="11" textAnchor="middle">0</text>}
   <text x="58" y="20" fill="#0f172a" fontSize="13" fontWeight="600">{title}</text>
 </svg>;
};

/** Three principal inverse graphs shown in radians, with real domains and output branches. */
const InverseTrigonometricGraph:React.FC=()=>{
  const xMin=-3.25,xMax=3.25,yMin=-2.15,yMax=3.35;
  const px=(x:number)=>36+(x-xMin)/(xMax-xMin)*290;
  const py=(y:number)=>214-(y-yMin)/(yMax-yMin)*183;
  const curve=(fn:(x:number)=>number,a:number,b:number)=>{
    const path:string[]=[];
    for(let i=0;i<=140;i++){
      const x=a+(b-a)*i/140,y=fn(x);
      path.push(`${i===0?'M':'L'}${px(x).toFixed(2)},${py(y).toFixed(2)}`);
    }
    return path.join(' ');
  };
  return <svg viewBox="0 0 360 245" role="img" aria-label="Principal arcsin, arccos and arctan graphs in radians, with arctan horizontal asymptotes" className="w-full h-auto max-h-[300px]">
    <rect x="0" y="0" width="360" height="245" rx="12" fill="#f8fafc"/>
    <line x1={px(xMin)} y1={py(0)} x2={px(xMax)} y2={py(0)} stroke="#64748b" strokeWidth="1.2"/>
    <line x1={px(0)} y1={py(yMin)} x2={px(0)} y2={py(yMax)} stroke="#64748b" strokeWidth="1.2"/>
    {[-1,1].map(x=><text key={x} x={px(x)} y={py(0)+12} textAnchor="middle" fontSize="11" fill="#475569">{x}</text>)}
    {[Math.PI/2,-Math.PI/2,Math.PI].map((y,i)=><text key={i} x="6" y={py(y)+4} fontSize="10" fill="#475569">{['π/2','−π/2','π'][i]}</text>)}
    {[-Math.PI/2,Math.PI/2].map(y=><line key={y} x1={px(xMin)} y1={py(y)} x2={px(xMax)} y2={py(y)} stroke="#d97706" strokeDasharray="4 4" strokeWidth="1" opacity="0.8"/>)}
    <path d={curve(Math.asin,-1,1)} stroke="#0f766e" strokeWidth="2.8" fill="none"/>
    <path d={curve(Math.acos,-1,1)} stroke="#7c3aed" strokeWidth="2.8" fill="none"/>
    <path d={curve(Math.atan,-3.25,3.25)} stroke="#d97706" strokeWidth="2.8" fill="none"/>
    {[[-1,-Math.PI/2],[1,Math.PI/2]].map(([x,y],i)=><circle key={'s'+i} cx={px(x)} cy={py(y)} r="3" fill="#0f766e"/>)}
    {[[-1,Math.PI],[1,0]].map(([x,y],i)=><circle key={'c'+i} cx={px(x)} cy={py(y)} r="3" fill="#7c3aed"/>)}
    <text x="40" y="18" fontSize="12" fontWeight="600" fill="#0f172a">Principal inverse trigonometric functions</text>
    <text x="50" y="237" fill="#0f766e" fontSize="11">● arcsin x</text>
    <text x="142" y="237" fill="#7c3aed" fontSize="11">● arccos x</text>
    <text x="247" y="237" fill="#d97706" fontSize="11">● arctan x</text>
  </svg>;
};

/** Original accessible vector/component figure; Cartesian mathematical orientation. */
const VectorComponentsDiagram:React.FC=()=> <svg viewBox="0 0 360 245" role="img" aria-label="A vector from the origin into quadrant one, with labeled horizontal and vertical component arrows and direction angle" className="w-full h-auto max-h-[300px]">
  <rect width="360" height="245" fill="#f8fafc" rx="12"/>
  <defs><marker id="trig-vector-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#0e7490"/></marker></defs>
  <path d="M35 203H332 M68 225V20" stroke="#64748b" strokeWidth="1.8"/>
  <path d="M68 203L279 65" stroke="#0e7490" strokeWidth="3.5" markerEnd="url(#trig-vector-arrow)"/>
  <path d="M68 203H279V65" fill="none" stroke="#d97706" strokeWidth="2.2" strokeDasharray="6 4"/>
  <path d="M110 203 A42 42 0 0 0 102 180" fill="none" stroke="#7c3aed" strokeWidth="2"/>
  <circle cx="279" cy="65" r="4.5" fill="#0e7490"/>
  <text x="93" y="192" fill="#7c3aed" fontSize="14">θ</text>
  <text x="165" y="224" fill="#d97706" fontSize="14">vₓ = v cos θ</text>
  <text x="284" y="141" fill="#d97706" fontSize="14">vᵧ</text>
  <text x="164" y="100" fill="#0e7490" fontSize="15" fontWeight="700">v</text>
  <text x="58" y="219" fill="#475569" fontSize="12">O</text>
  <text x="336" y="207" fill="#475569" fontSize="12">x</text>
  <text x="73" y="19" fill="#475569" fontSize="12">y</text>
  <text x="50" y="240" fill="#475569" fontSize="10">Illustrative quadrant-I vector; component signs change by quadrant.</text>
</svg>;

/** Right-handed basis orientation: i×j=k; projected axes are illustrative. */
const VectorCrossProductDiagram:React.FC=()=> <svg viewBox="0 0 360 245" role="img" aria-label="Right-handed three-dimensional basis showing i cross j equals k, with x right, y diagonal and z upward" className="w-full h-auto max-h-[300px]">
  <rect width="360" height="245" fill="#f8fafc" rx="12"/>
  <defs><marker id="trig-cross-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#0e7490"/></marker></defs>
  <path d="M156 166L320 166" stroke="#0e7490" strokeWidth="3.5" markerEnd="url(#trig-cross-arrow)"/>
  <path d="M156 166L60 224" stroke="#7c3aed" strokeWidth="3.5" markerEnd="url(#trig-cross-arrow)"/>
  <path d="M156 166L156 22" stroke="#d97706" strokeWidth="3.5" markerEnd="url(#trig-cross-arrow)"/>
  <circle cx="156" cy="166" r="4" fill="#334155"/>
  <text x="321" y="157" fontSize="15" fill="#0e7490" fontWeight="700">+x: i</text>
  <text x="20" y="227" fontSize="15" fill="#7c3aed" fontWeight="700">+y: j</text>
  <text x="161" y="21" fontSize="15" fill="#d97706" fontWeight="700">+z: k</text>
  <text x="177" y="104" fontSize="17" fill="#1e3a8a" fontWeight="700">i × j = k</text>
  <text x="177" y="130" fontSize="13" fill="#475569">j × i = −k</text>
  <text x="15" y="238" fontSize="10" fill="#475569">Coordinate sketch (not to scale); use the right-hand rule.</text>
</svg>;


/** Original Argand-plane drawing; coordinates are a concrete z=-3+4i example. */
const ComplexPlaneDiagram:React.FC=()=> <svg viewBox="0 0 360 245" role="img" aria-label="Complex plane showing minus three plus four i in quadrant two and its conjugate reflected over the real axis" className="w-full h-auto max-h-[300px]">
  <rect width="360" height="245" rx="12" fill="#f8fafc"/>
  <defs><marker id="trig-complex-tip" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#0891b2"/></marker></defs>
  <path d="M25 133H335 M177 225V19" stroke="#64748b" strokeWidth="1.5"/>
  <circle cx="177" cy="133" r="94" fill="none" stroke="#e2e8f0" strokeWidth="1.4" strokeDasharray="4 4"/>
  <path d="M177 133L120 57" stroke="#0891b2" strokeWidth="3" markerEnd="url(#trig-complex-tip)"/>
  <path d="M177 133L120 209" stroke="#a855f7" strokeWidth="2.5" strokeDasharray="5 4"/>
  <path d="M120 57V209" stroke="#94a3b8" strokeDasharray="3 5"/>
  <circle cx="120" cy="57" r="5" fill="#0891b2"/><circle cx="120" cy="209" r="5" fill="#a855f7"/>
  <path d="M204 133 A27 27 0 0 0 160.8 111.4" fill="none" stroke="#d97706" strokeWidth="2"/>
  <text x="192" y="104" fontSize="12" fill="#b45309">Arg z</text>
  <text x="59" y="45" fontSize="13" fill="#0e7490" fontWeight="600">z = −3 + 4i</text>
  <text x="12" y="223" fontSize="12" fill="#7e22ce">conjugate: −3 − 4i</text>
  <text x="310" y="128" fontSize="12" fill="#475569">Re</text><text x="185" y="24" fontSize="12" fill="#475569">Im</text>
  <text x="182" y="149" fontSize="11" fill="#475569">0</text>
  <text x="237" y="222" fontSize="10" fill="#475569">|z| = 5</text>
</svg>;

/** Three equally spaced cube roots of unity; 0, 120, and 240 degree arguments. */
const RootsOfUnityDiagram:React.FC=()=> <svg viewBox="0 0 360 245" role="img" aria-label="Unit circle with cube roots of unity at zero, one hundred twenty and two hundred forty degrees" className="w-full h-auto max-h-[300px]">
  <rect width="360" height="245" rx="12" fill="#f8fafc"/>
  <path d="M35 128H329 M167 225V28" stroke="#64748b" strokeWidth="1.3"/>
  <circle cx="167" cy="128" r="88" stroke="#0e7490" strokeWidth="1.7" fill="#ecfeff"/>
  <path d="M167 128 L255 128 M167 128L123 51.79 M167 128L123 204.21" stroke="#0e7490" strokeWidth="2.2"/>
  <path d="M255 128L123 51.79L123 204.21Z" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="6 4"/>
  <circle cx="255" cy="128" r="4.5" fill="#0e7490"/><circle cx="123" cy="51.79" r="4.5" fill="#0e7490"/><circle cx="123" cy="204.21" r="4.5" fill="#0e7490"/>
  <text x="262" y="121" fontSize="12" fill="#0e7490" fontWeight="600">1 (0°)</text>
  <text x="13" y="45" fontSize="12" fill="#0e7490">cis 120°</text>
  <text x="11" y="218" fontSize="12" fill="#0e7490">cis 240°</text>
  <text x="192" y="28" fontSize="12" fill="#334155">w³ = 1</text>
  <text x="217" y="235" fontSize="10" fill="#64748b">Angles separated by 120°</text>
</svg>;

/** Original scalable polar grid: negative r ends on the opposite ray. */
const PolarGridDiagram:React.FC=()=> <svg viewBox="0 0 360 245" role="img" aria-label="Polar plane with angle thirty degrees and a negative radius pointing to the opposite quadrant" className="w-full h-auto max-h-[300px]">
  <rect width="360" height="245" rx="12" fill="#f8fafc"/>
  {[40,80,115].map(r=><circle key={r} cx="180" cy="122" r={r} fill="none" stroke="#cbd5e1" strokeWidth="1.2"/>)}
  <path d="M20 122H340 M180 12V232 M99 41L261 203 M99 203L261 41" fill="none" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="4 5"/>
  <path d="M180 122L265 73" stroke="#0f766e" strokeWidth="3" fill="none"/>
  <path d="M180 122L95 171" stroke="#7c3aed" strokeWidth="3" fill="none"/>
  <circle cx="265" cy="73" r="4" fill="#0f766e"/><circle cx="95" cy="171" r="4" fill="#7c3aed"/>
  <path d="M206 122 A26 26 0 0 0 202.5 109" fill="none" stroke="#d97706" strokeWidth="2"/>
  <text x="210" y="119" fill="#92400e" fontSize="12">θ</text>
  <text x="270" y="62" fill="#0f766e" fontSize="12">(r, θ)</text>
  <text x="12" y="192" fill="#7c3aed" fontSize="12">(−r, θ)</text>
  <text x="326" y="138" fill="#475569" fontSize="12">x</text><text x="190" y="19" fill="#475569" fontSize="12">y</text>
  <text x="113" y="237" fill="#334155" fontSize="11">A negative radius reverses the ray.</text>
</svg>;
/** Original parameter-direction sketch of one counterclockwise circle. */
const ParametricCircleDiagram:React.FC=()=> <svg viewBox="0 0 360 245" role="img" aria-label="Circle parametrized by cosine and sine, moving counterclockwise from positive x-axis" className="w-full h-auto max-h-[300px]">
  <rect width="360" height="245" rx="12" fill="#f8fafc"/>
  <path d="M40 122H320 M180 18V224" stroke="#94a3b8" strokeWidth="1.5"/>
  <circle cx="180" cy="122" r="91" fill="#ecfeff" stroke="#0e7490" strokeWidth="2.5"/>
  <path d="M271 122A91 91 0 0 0 180 31" fill="none" stroke="#7c3aed" strokeWidth="4"/>
  <path d="M180 31L181 45L196 36Z" fill="#7c3aed"/>
  <path d="M180 122L180 31" stroke="#d97706" strokeDasharray="4 3" strokeWidth="2"/>
  <circle cx="271" cy="122" r="5" fill="#0e7490"/>
  <text x="275" y="140" fontSize="11" fill="#0f766e">t=0</text>
  <text x="187" y="25" fontSize="11" fill="#7c3aed">t=π/2</text>
  <text x="28" y="237" fontSize="12" fill="#334155">x=a cos t, y=a sin t; positive t runs CCW</text>
  <text x="324" y="139" fill="#475569" fontSize="12">x</text><text x="190" y="16" fill="#475569" fontSize="12">y</text>
</svg>;

/** Original idealized equal-frequency signals; advance/lead is a leftward shift for positive angular frequency. */
const WaveSinusoidDiagram:React.FC=()=>{
 const left=35,right=331,mid=125,scale=59;
 const x=(t:number)=>left+(right-left)*t/(2*Math.PI);
 const y=(t:number,phase:number)=>mid-scale*Math.sin(t+phase);
 const p=(phase:number)=>Array.from({length:170},(_,i)=>{const t=2*Math.PI*i/169;return `${x(t).toFixed(2)},${y(t,phase).toFixed(2)}`}).join(' ');
 return <svg viewBox="0 0 360 245" role="img" aria-label="Sine waveform and a second waveform leading by a quarter cycle, with phase angle pi over two" className="w-full h-auto max-h-[300px]">
  <rect width="360" height="245" rx="12" fill="#f8fafc"/>
  <path d={`M${left} ${mid}H${right}M${left} 25V220`} stroke="#64748b" strokeWidth="1.4"/>
  <line x1={left} x2={right} y1={mid-scale} y2={mid-scale} stroke="#cbd5e1" strokeDasharray="4 4"/>
  <line x1={left} x2={right} y1={mid+scale} y2={mid+scale} stroke="#cbd5e1" strokeDasharray="4 4"/>
  <polyline points={p(0)} fill="none" stroke="#0e7490" strokeWidth="2.7"/>
  <polyline points={p(Math.PI/2)} fill="none" stroke="#d97706" strokeWidth="2.7" strokeDasharray="7 3"/>
  <text x="43" y="22" fontSize="13" fill="#0e7490" fontWeight="700">sin θ</text>
  <text x="174" y="22" fontSize="13" fill="#d97706" fontWeight="700">sin(θ+π/2) leads</text>
  {['0','π/2','π','3π/2','2π'].map((v,i)=><text key={v} x={x(i*Math.PI/2)} y="232" fontSize="11" fill="#475569" textAnchor="middle">{v}</text>)}
  <text x="6" y={mid-scale+5} fontSize="11" fill="#475569">+1</text><text x="9" y={mid+scale+5} fontSize="11" fill="#475569">−1</text>
 </svg>;
};

/** Damped cosine plus correct exponential envelopes ±A0 exp(-kt), schematic A0=1, k=0.35. */
const DampedWaveDiagram:React.FC=()=>{
 const left=38,right=331,mid=125,amplitude=77;
 const pt=(fn:(t:number)=>number)=>Array.from({length:230},(_,i)=>{const t=i*9/229,x=left+t/9*(right-left),y=mid-amplitude*fn(t);return `${x.toFixed(2)},${y.toFixed(2)}`}).join(' ');
 const envelope=(t:number)=>Math.exp(-0.35*t);
 return <svg viewBox="0 0 360 245" role="img" aria-label="Damped sinusoidal displacement bounded by exponentially decreasing positive and negative envelopes" className="w-full h-auto max-h-[300px]">
  <rect width="360" height="245" rx="12" fill="#f8fafc"/>
  <line x1={left} x2={right} y1={mid} y2={mid} stroke="#64748b" strokeWidth="1.4"/>
  <line x1={left} x2={left} y1="26" y2="220" stroke="#64748b" strokeWidth="1.4"/>
  <polyline points={pt(t=>envelope(t))} fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="6 4"/>
  <polyline points={pt(t=>-envelope(t))} fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="6 4"/>
  <polyline points={pt(t=>envelope(t)*Math.cos(8*t))} fill="none" stroke="#0e7490" strokeWidth="2.8"/>
  <text x="47" y="22" fontSize="12" fill="#0f172a" fontWeight="700">Damped cosine; decreasing envelope</text>
  <text x="179" y="91" fontSize="11" fill="#d97706">+A₀e⁻ᵏᵗ</text>
  <text x="180" y="167" fontSize="11" fill="#d97706">−A₀e⁻ᵏᵗ</text>
  <text x="315" y="231" fontSize="11" fill="#475569">time</text>
 </svg>;
};

/** Cosine-reference complex phasor sketch; magnitude and phase are labeled independently. */
const WavePhasorDiagram:React.FC=()=> <svg viewBox="0 0 360 245" role="img" aria-label="Cosine-reference phasor at 30 degrees with positive real and imaginary components, peak or RMS magnitude as labeled by lesson" className="w-full h-auto max-h-[300px]">
 <rect width="360" height="245" rx="12" fill="#f8fafc"/>
 <defs><marker id="wave-phasor-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#0e7490"/></marker></defs>
 <line x1="30" y1="188" x2="334" y2="188" stroke="#64748b" strokeWidth="1.7"/><line x1="79" y1="225" x2="79" y2="18" stroke="#64748b" strokeWidth="1.7"/>
 <line x1="79" y1="188" x2="274" y2="75" stroke="#0e7490" strokeWidth="3.7" markerEnd="url(#wave-phasor-head)"/>
 <path d="M125 188 A46 46 0 0 0 119 165" stroke="#d97706" strokeWidth="2.1" fill="none"/>
 <line x1="274" y1="75" x2="274" y2="188" stroke="#d97706" strokeWidth="1.9" strokeDasharray="5 4"/>
 <text x="121" y="181" fill="#d97706" fontSize="14">+30°</text>
 <text x="175" y="106" fill="#0e7490" fontSize="15" fontWeight="700">V∠φ</text>
 <text x="298" y="203" fill="#475569" fontSize="12">Re</text>
 <text x="83" y="23" fill="#475569" fontSize="12">Im</text>
 <text x="31" y="235" fill="#475569" fontSize="11">Define peak/RMS and cosine/sine reference in the text.</text>
</svg>;

/** Original schematic of an octant spherical triangle with three right spherical angles. */
const AdvancedSphereDiagram:React.FC=()=> <svg viewBox="0 0 360 245" role="img" aria-label="Sphere with highlighted positive x y z octant spherical triangle bounded by great-circle arcs" className="w-full h-auto max-h-[300px]">
  <rect width="360" height="245" rx="12" fill="#f8fafc"/>
  <ellipse cx="180" cy="123" rx="99" ry="99" fill="#e0f2fe" stroke="#1e3a8a" strokeWidth="2"/>
  <ellipse cx="180" cy="123" rx="99" ry="31" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5 4"/>
  <path d="M180 24 C244 52 245 181 180 222" stroke="#94a3b8" fill="none" strokeWidth="1.4" strokeDasharray="5 4"/>
  <path d="M180 24 C227 36 258 69 279 123 C246 139 211 152 180 153 C190 105 190 61 180 24Z" fill="#14b8a6" fillOpacity="0.29" stroke="#0f766e" strokeWidth="2.6"/>
  <circle cx="180" cy="24" r="4" fill="#0f766e"/><circle cx="279" cy="123" r="4" fill="#0f766e"/><circle cx="180" cy="153" r="4" fill="#0f766e"/>
  <text x="188" y="20" fill="#0f766e" fontSize="13">N</text><text x="283" y="122" fill="#0f766e" fontSize="13">E</text>
  <text x="142" y="172" fill="#0f766e" fontSize="13">Q</text>
  <text x="18" y="230" fill="#475569" fontSize="11">Spherical arcs (schematic); excess for octant = π/2.</text>
</svg>;

/** Original plot of the right branch x²−y²=1 parametrized by cosh(t),sinh(t). */
const AdvancedHyperbolaDiagram:React.FC=()=> {
 const xx=(v:number)=>150+v*70, yy=(v:number)=>124-v*45;
 const poly=Array.from({length:101},(_,i)=>{const t=-1.3+i*2.6/100;return `${xx(Math.cosh(t)).toFixed(2)},${yy(Math.sinh(t)).toFixed(2)}`}).join(' ');
 return <svg viewBox="0 0 360 245" role="img" aria-label="Right hyperbola branch showing x equals cosh t and y equals sinh t, with vertex at one zero" className="w-full h-auto max-h-[300px]">
  <rect width="360" height="245" rx="12" fill="#f8fafc"/>
  <path d="M22 124H340 M150 17V230" stroke="#64748b" strokeWidth="1.5" fill="none"/>
  <polyline points={poly} fill="none" stroke="#0f766e" strokeWidth="3.5" strokeLinecap="round"/>
  <circle cx={xx(1)} cy={yy(0)} r="4.5" fill="#d97706"/>
  <text x={xx(1)+7} y="138" fontSize="12" fill="#92400e">(1,0)</text>
  <text x="179" y="28" fontSize="13" fill="#0f766e" fontWeight="600">(cosh t, sinh t)</text>
  <text x="12" y="236" fontSize="11" fill="#475569">Right branch: x² − y² = 1, x ≥ 1</text>
 </svg>;
};
