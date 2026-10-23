import React from 'react';
/** Topic-specific, original vector schematics. They explain structures, NOT the numeric coordinates in questions. */
export const AnalyticGeometryIllustration: React.FC<{topicId:string;compact?:boolean}> = ({topicId,compact}) => {
  const id=Number(topicId.slice(-3));
  const ink='#475569', purple='#6d28d9', cyan='#0891b2', soft='#c4b5fd';
  const P=(x:number,y:number):[number,number]=>[140+22*x,110-22*y];
  const lab=(x:number,y:number,t:string)=><text x={x} y={y} fill="#4c1d95" fontSize="12" fontWeight="650">{t}</text>;
  const dot=(x:number,y:number,label:string)=><React.Fragment><circle cx={P(x,y)[0]} cy={P(x,y)[1]} r="4" fill={purple}/>{lab(P(x,y)[0]+5,P(x,y)[1]-5,label)}</React.Fragment>;
  const axes=<g><path d="M12 110H268M140 8V210" stroke={ink} strokeWidth="1.5"/><path d="M258 104L268 110L258 116M134 18L140 8L146 18" stroke={ink} fill="none"/>{lab(260,126,'x')}{lab(149,16,'y')}{lab(147,126,'O')}</g>;
  let plot:React.ReactNode;
  if(id<=81){
    plot=<>{dot(-3,2,'A')}{dot(2,-1,'B')}{id===80||id===81?<><line x1={P(-3,2)[0]} y1={P(-3,2)[1]} x2={P(2,-1)[0]} y2={P(2,-1)[1]} stroke={cyan} strokeWidth="2.5"/>{dot(-.5,.5,'M')}</>:null}</>;
  }else if(id<=87){
    plot=<><path d="M34 188L244 37" stroke={purple} strokeWidth="2.5"/>{id===83?<path d="M40 32L248 184" stroke={cyan} strokeWidth="2.5"/>:id===87?<path d="M30 64L250 164" stroke={cyan} strokeWidth="2.5"/>:<line x1={P(1,0)[0]} y1={P(1,0)[1]} x2={P(3,0)[0]} y2={P(3,0)[1]} stroke={cyan} strokeWidth="3"/>}{dot(1,1,'P')}{lab(192,35,'line ℓ')}</>;
  }else if(id<=90){
    plot=<><circle cx="140" cy="110" r="68" fill="#ede9fe" fillOpacity=".4" stroke={purple} strokeWidth="2.5"/>{dot(0,0,'C')}{id===90?<><path d="M140 110L208 110L249 62" stroke={cyan} fill="none" strokeWidth="2"/><path d="M205 107L210 111L214 106" fill="none" stroke={ink}/>{lab(218,54,'tangent')}</>:<><path d="M140 110L208 110" stroke={cyan} strokeWidth="2"/>{lab(170,100,'r')}</> }</>;
  }else if(id===91){
    plot=<><path d="M48 24Q140 110 48 196" stroke={purple} strokeWidth="2.5" fill="none" transform="translate(65 0)"/>{dot(0,0,'V')}{dot(1,0,'F')}<path d="M118 18V205" stroke={cyan} strokeDasharray="5 4" strokeWidth="1.7"/>{lab(93,30,'d')}</>;
  }else if(id===92){
    plot=<><ellipse cx="140" cy="110" rx="98" ry="58" fill="#ede9fe" fillOpacity=".4" stroke={purple} strokeWidth="2.5"/>{dot(-3,0,'F₁')}{dot(3,0,'F₂')}{lab(218,101,'a')}{lab(149,53,'b')}</>;
  }else if(id===93){
    plot=<><path d="M15 24L265 196M15 196L265 24" stroke={cyan} strokeDasharray="5 5" strokeWidth="1.5"/><path d="M10 22Q105 110 10 198M270 22Q175 110 270 198" fill="none" stroke={purple} strokeWidth="3"/>{lab(25,51,'asymptotes')}</>;
  }else if(id===94){
    plot=<><ellipse cx="140" cy="110" rx="70" ry="42" fill="none" stroke={purple} strokeWidth="2.2"/><path d="M90 70Q140 110 90 150M200 70Q160 110 200 150" fill="none" stroke={cyan} strokeWidth="2"/>{lab(204,45,'conics')}</>;
  }else if(id===95){
    plot=<><path d="M48 172L231 47M56 42L224 178" stroke={cyan} strokeWidth="2"/><path d="M173 110A33 33 0 0 0 162 85" stroke={purple} fill="none" strokeWidth="2"/>{lab(177,96,'θ')}{lab(230,48,"x′")}{lab(52,38,"y′")}</>;
  }else if(id===96){
    plot=<><circle cx="140" cy="110" r="86" stroke={soft} strokeWidth="1.3" fill="none" strokeDasharray="6 6"/><path d="M140 110L210 62" stroke={purple} strokeWidth="2.5"/>{dot(3,2,'P')}{lab(170,102,'r')}{lab(165,124,'θ')}</>;
  }else if(id===97){
    plot=<><path d="M38 177Q90 24 144 108T249 44" stroke={purple} strokeWidth="3" fill="none"/><path d="M136 92L144 108L126 112" stroke={cyan} strokeWidth="2.5" fill="none"/>{lab(205,57,'t →')}</>;
  }else if(id===98||id===99){
    plot=<><path d="M140 110L219 54M140 110L76 50M140 110L225 145" strokeWidth="3" stroke={purple} fill="none"/><path d="M208 58L219 54L215 66M82 63L76 50L89 53M211 145L225 145L215 135" stroke={purple} fill="none" strokeWidth="2.5"/>{lab(218,47,'u')}{lab(60,44,'v')}{lab(226,148,'u+v')}</>;
  }else if(id<=104){
    plot=<><path d="M140 157L245 157M140 157L140 16M140 157L56 197" stroke={ink} strokeWidth="2" fill="none"/>{lab(248,161,'x')}{lab(147,20,'z')}{lab(45,203,'y')}{id===103?<><ellipse cx="150" cy="111" rx="53" ry="41" stroke={purple} fill="#ede9fe" fillOpacity=".6" strokeWidth="2"/><ellipse cx="150" cy="111" rx="53" ry="15" stroke={cyan} fill="none" strokeDasharray="5 4"/>{lab(208,100,'sphere')}</>:id===104?<><path d="M109 98Q154 24 202 98M109 98Q154 164 202 98" stroke={purple} strokeWidth="2.5" fill="none"/><ellipse cx="155" cy="98" rx="46" ry="17" fill="none" stroke={cyan}/>{lab(186,60,'quadric')}</>:<><path d="M140 157L203 107L177 57" stroke={purple} strokeWidth="2.3" fill="none"/>{lab(211,104,'P')}</>}</>;
  }else{
    plot=<><path d="M67 164L203 164L118 51Z" stroke={purple} strokeWidth="2.5" fill="#ede9fe" fillOpacity=".65"/>{lab(50,174,'A')}{lab(206,174,'B')}{lab(119,40,'C')}{lab(142,187,'area')}</>;
  }
  return <svg viewBox="0 0 280 220" className={`w-full mx-auto ${compact?'max-h-36':'max-h-48'}`} role="img" aria-label={`Schematic Analytic Geometry figure for topic ${topicId}; not to scale`}>
    <title>Analytic Geometry educational schematic; not to scale</title><rect x="1" y="1" width="278" height="218" rx="16" fill="#faf9ff" stroke="#ddd6fe"/>{axes}{plot}
  </svg>;
};
