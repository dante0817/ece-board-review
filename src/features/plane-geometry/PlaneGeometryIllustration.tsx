import React from 'react';
/** Authored vector schematics: deliberately not drawn to the numerical question scale. */
export const PlaneGeometryIllustration:React.FC<{topicId:string;compact?:boolean}>=({topicId,compact})=>{
 const id=Number(topicId.slice(-3));
 const axis='#475569',primary='#4f46e5',faint='#a5b4fc';
 const text=(x:number,y:number,label:string)=><text x={x} y={y} fill="#3730a3" fontSize="12" fontWeight="600">{label}</text>;
 let content:React.ReactNode;
 if(id>=26&&id<=32){
   content=<><circle cx="130" cy="106" r="75" stroke={primary} strokeWidth="2.5" fill="#e0e7ff" fillOpacity=".32"/><circle cx="130" cy="106" r="3" fill={primary}/>
    <path d="M130 106L205 106M130 106L180 50" stroke={primary} strokeWidth="2"/>
    {id===27||id===29?<path d="M130 106L205 106A75 75 0 0 0 180 50Z" fill="#c7d2fe" stroke={primary} strokeWidth="2"/>:null}
    {id===28||id===31?<><path d="M70 60L193 149M105 33L154 176" stroke={axis} strokeWidth="1.8"/></>:null}
    {id===30?<><path d="M202 32L196 180" stroke={axis} strokeWidth="2"/>{text(202,25,'tangent')}</>:null}
    {text(135,92,'O')}{text(167,101,'r')}{text(120,201,'Not to scale')}
   </>;
 }else if(id>=17&&id<=25){
   content=<><path d="M53 61L181 61L209 160L81 160Z" fill="#dbeafe" stroke={primary} strokeWidth="2.5"/>
   <path d="M181 61V160" stroke={primary} strokeDasharray="5 4"/>
   {id===18||id===24?<path d="M53 61L209 160M181 61L81 160" stroke={faint} strokeWidth="1.8"/>:null}
   {id===23||id===19||id===20?<path d="M124 110L53 61M124 110L181 61M124 110L209 160M124 110L81 160" stroke={primary} strokeDasharray="5 4"/>:null}
   {text(114,52,'base')}{text(189,105,'h')}{text(120,201,'Schematic polygon')}</>;
 }else if(id>=7&&id<=16||id===35){
   content=<><path d="M47 169L131 30L213 169Z" fill="#ede9fe" fillOpacity=".6" stroke={primary} strokeWidth="2.6"/>
   <path d="M131 30V169" stroke={primary} strokeDasharray="5 4"/>
   <path d="M119 169V158H131" stroke={axis} fill="none"/>
   {id===10||id===14?<><circle cx="131" cy="169" r="3" fill={primary}/><path d="M47 169L174 99" stroke={faint} strokeDasharray="5 4"/></>:null}
   {text(126,20,'A')}{text(34,186,'B')}{text(215,186,'C')}{text(138,108,'h')}{text(120,204,'Not to scale')}</>;
 }else if(id===33||id===34){
   content=<><line x1="20" y1="109" x2="230" y2="109" stroke={axis}/><line x1="125" y1="20" x2="125" y2="210" stroke={axis}/>
   <circle cx="125" cy="109" r="64" stroke={faint} strokeWidth="2" fill="none" strokeDasharray="7 5"/>
   <path d="M153 75L183 97L160 125Z" stroke={primary} strokeWidth="2.5" fill="#c7d2fe"/><path d="M97 143L67 121L90 93Z" stroke="#7c3aed" strokeWidth="2" fill="#ddd6fe"/>
   {text(234,113,'x')}{text(130,25,'y')}{text(164,65,'P')}</>;
 }else{
   content=<><line x1="32" y1="159" x2="216" y2="58" stroke={primary} strokeWidth="2.5"/>
   <line x1="32" y1="57" x2="216" y2="158" stroke="#7c3aed" strokeWidth="2.5"/>
   <circle cx="124" cy="109" r="3.5" fill={axis}/>
   <path d="M124 109L194 109" stroke={axis} strokeDasharray="5 4"/>
   <path d="M136 100Q147 110 136 119" fill="none" stroke={primary} strokeWidth="2"/>
   {text(24,48,'l')}{text(217,162,'m')}{text(159,99,'θ')}{text(100,198,'Lines and angles')}</>;
 }
 return <svg viewBox="0 0 260 218" className={`w-full mx-auto ${compact?'max-h-36':'max-h-48'}`} role="img" aria-label={`Original educational schematic for ${topicId}; not to scale`}>
 <title>Plane geometry schematic; not to scale</title>{content}</svg>;
};
