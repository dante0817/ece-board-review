/** Independently implemented F-789SGA-style mathematics engine. Not a Canon firmware emulator.
 * Never evaluate user expressions as JavaScript source. */
export type AngleUnit='DEG'|'RAD'|'GRAD';
export type CalculatorMode='COMP'|'CPLX'|'STAT'|'BASE'|'EQN'|'TABLE'|'MATX'|'VCTR';
export type Complex={re:number;im:number};
export const complex=(re:number,im=0):Complex=>({re,im});
const EPS=1e-11;
const add=(a:Complex,b:Complex)=>complex(a.re+b.re,a.im+b.im);
const neg=(a:Complex)=>complex(-a.re,a.im===0?0:-a.im);
const sub=(a:Complex,b:Complex)=>add(a,neg(b));
const mul=(a:Complex,b:Complex)=>complex(a.re*b.re-a.im*b.im,a.re*b.im+a.im*b.re);
const div=(a:Complex,b:Complex)=>{const d=b.re*b.re+b.im*b.im;if(d===0)throw Error('Math ERROR: division by zero');return complex((a.re*b.re+a.im*b.im)/d,(a.im*b.re-a.re*b.im)/d)};
const magnitude=(a:Complex)=>Math.hypot(a.re,a.im);
const clog=(z:Complex)=>complex(Math.log(magnitude(z)),Math.atan2(z.im,z.re));
const cexp=(z:Complex)=>complex(Math.exp(z.re)*Math.cos(z.im),Math.exp(z.re)*Math.sin(z.im));
const pow=(a:Complex,b:Complex)=>{if(a.re===0&&a.im===0){if(b.im||b.re<=0)throw Error('Math ERROR: undefined power');return complex(0)}return cexp(mul(b,clog(a)))};
const nearReal=(z:Complex)=>Math.abs(z.im)<=EPS*Math.max(1,Math.abs(z.re));
const real=(z:Complex)=>{if(!nearReal(z))throw Error('Math ERROR: real value required');return z.re};
const nonfinite=(z:Complex)=>{if(!Number.isFinite(z.re)||!Number.isFinite(z.im))throw Error('Math ERROR: result outside supported range');return z};
const factorial=(v:number)=>{if(!Number.isInteger(v)||v<0||v>170)throw Error('Math ERROR: factorial requires an integer from 0 to 170');let out=1;for(let k=2;k<=v;k++)out*=k;return out};
const toRadians=(x:number,u:AngleUnit)=>u==='DEG'?x*Math.PI/180:u==='GRAD'?x*Math.PI/200:x;
const fromRadians=(x:number,u:AngleUnit)=>u==='DEG'?x*180/Math.PI:u==='GRAD'?x*200/Math.PI:x;
export interface EvalOptions {angle?:AngleUnit;mode?:'COMP'|'CPLX';ans?:Complex;memory?:Complex;x?:number;variables?:Record<string,Complex>}
type Token={type:'num'|'name'|'op';value:string};
function tokenize(source:string):Token[]{
 if(source.length>400)throw Error('Syntax ERROR: expression too long');
 const normalized=source.replace(/π/g,'pi').replace(/×/g,'*').replace(/[÷]/g,'/').replace(/[−]/g,'-').replace(/[√]/g,'sqrt').replace(/²/g,'^2').replace(/³/g,'^3');
 const out:Token[]=[];let pos=0;
 while(pos<normalized.length){const rest=normalized.slice(pos);if(/^\s/.test(rest)){pos++;continue}
  const num=rest.match(/^(?:\d+\.?\d*|\.\d+)(?:[Ee][+\-]?\d+)?/);if(num){out.push({type:'num',value:num[0]});pos+=num[0].length;continue}
  const name=rest.match(/^[a-zA-Z_][a-zA-Z_0-9]*/);if(name){out.push({type:'name',value:name[0]});pos+=name[0].length;continue}
  if('+-*/^()!,%'.includes(rest[0])){out.push({type:'op',value:rest[0]});pos++;continue}
  throw Error('Syntax ERROR: unsupported character '+rest[0]);
 }
 return out;
}
const functions=new Set(['sin','cos','tan','asin','acos','atan','sinh','cosh','tanh','asinh','acosh','atanh','ln','log','log10','sqrt','abs','exp','conj','re','im','arg','floor','ceil','round','ncr','npr','min','max']);
function applyFunction(name:string,args:Complex[],angle:AngleUnit):Complex{
 const a=args[0]??complex(NaN);const n=()=>real(a);const radians=()=>toRadians(n(),angle);
 if(args.length===2){const b=real(args[1]);const v=n();if(name==='ncr')return complex(factorial(v)/(factorial(b)*factorial(v-b)));if(name==='npr')return complex(factorial(v)/factorial(v-b));if(name==='min')return complex(Math.min(v,b));if(name==='max')return complex(Math.max(v,b));throw Error('Syntax ERROR: unknown two-argument function')}
 if(args.length!==1)throw Error('Syntax ERROR: expected one argument');
 switch(name){case 'sin':return complex(Math.sin(radians()));case 'cos':return complex(Math.cos(radians()));case 'tan':if(Math.abs(Math.cos(radians()))<1e-13)throw Error('Math ERROR: tangent undefined');return complex(Math.tan(radians()));
 case 'asin':return complex(fromRadians(Math.asin(n()),angle));case 'acos':return complex(fromRadians(Math.acos(n()),angle));case 'atan':return complex(fromRadians(Math.atan(n()),angle));
 case 'sinh':return complex(Math.sinh(n()));case 'cosh':return complex(Math.cosh(n()));case 'tanh':return complex(Math.tanh(n()));
 case 'asinh':return complex(Math.asinh(n()));case 'acosh':return complex(Math.acosh(n()));case 'atanh':return complex(Math.atanh(n()));
 case 'ln':return a.im===0&&a.re>0?complex(Math.log(a.re)):clog(a);
 case 'log':case 'log10':{const z=clog(a);return complex(z.re/Math.LN10,z.im/Math.LN10)}
 case 'sqrt':return pow(a,complex(.5));case 'exp':return cexp(a);case 'abs':return complex(magnitude(a));
 case 'conj':return complex(a.re,-a.im);case 're':return complex(a.re);case 'im':return complex(a.im);
 case 'arg':return complex(fromRadians(Math.atan2(a.im,a.re),angle));
 case 'floor':return complex(Math.floor(n()));case 'ceil':return complex(Math.ceil(n()));case 'round':return complex(Math.round(n()));
 default:throw Error('Syntax ERROR: unknown function '+name)}
}
export function evaluateExpression(input:string,options:EvalOptions={}):Complex{
 const angle=options.angle??'DEG';const tokens=tokenize(input);if(!tokens.length)throw Error('Syntax ERROR: empty expression');let index=0;
 const peek=()=>tokens[index];const match=(s:string)=>{if(peek()?.value===s){index++;return true}return false};
 const constants:Record<string,Complex>={pi:complex(Math.PI),e:complex(Math.E),i:complex(0,1),Ans:options.ans??complex(0),ans:options.ans??complex(0),M:options.memory??complex(0),x:complex(options.x??0),...options.variables};
 function primary():Complex{
  if(match('+'))return primary();if(match('-'))return neg(expression(29));
  if(match('(')){const v=expression(0);if(!match(')'))throw Error('Syntax ERROR: expected )');return v}
  const t=tokens[index++];if(!t)throw Error('Syntax ERROR: incomplete expression');
  if(t.type==='num')return complex(Number(t.value));
  if(t.type==='name'){
    if(functions.has(t.value.toLowerCase())){if(!match('('))throw Error('Syntax ERROR: use '+t.value+'(…)');const args=[expression(0)];while(match(','))args.push(expression(0));if(!match(')'))throw Error('Syntax ERROR: expected )');return applyFunction(t.value.toLowerCase(),args,angle)}
    if(Object.prototype.hasOwnProperty.call(constants,t.value))return constants[t.value];
    throw Error('Syntax ERROR: unknown symbol '+t.value)
  }
  throw Error('Syntax ERROR: unexpected '+t.value);
 }
 function expression(min:number):Complex{
  let left=primary();while(true){const tok=peek();if(!tok)break;
   if(tok.value==='!'||tok.value==='%'){if(40<min)break;index++;left=tok.value==='!'?complex(factorial(real(left))):div(left,complex(100));continue}
   // Implicit multiplication: 2π, 2(3), (2)(3), 3sin(30)
   const implicit=tok.type==='name'||tok.value==='('||tok.type==='num';
   const op=implicit?'*':tok.value;
   const prec=op==='+'||op==='-'?10:op==='*'||op==='/'?20:op==='^'?30:0;
   if(!prec||prec<min)break;
   if(!implicit)index++;
   const right=expression(op==='^'?prec:prec+1);
   left=op==='+'?add(left,right):op==='-'?sub(left,right):op==='*'?mul(left,right):op==='/'?div(left,right):pow(left,right);
  }return left;
 }
 const result=expression(0);if(index!==tokens.length)throw Error('Syntax ERROR: unexpected '+tokens[index].value);
 nonfinite(result);if(options.mode!=='CPLX'&&!nearReal(result))throw Error('Math ERROR: complex result (use CPLX mode)');return result;
}
function numstr(v:number,digits=11){if(Math.abs(v)<5e-12)v=0;if(!Number.isFinite(v))throw Error('Math ERROR: nonfinite result');return Number(v.toPrecision(digits)).toString()}
export function formatValue(z:Complex,mode:'COMP'|'CPLX'='COMP',digits=11):string{
 if(mode==='COMP'||nearReal(z))return numstr(z.re,digits);
 return `${numstr(z.re,digits)} ${z.im<0?'−':'+'} ${numstr(Math.abs(z.im),digits)}i`;
}
export function approximateFraction(x:number,maxDenominator=100000):string|null{
 if(!Number.isFinite(x)||Math.abs(x)>1e9)return null;const sign=x<0?'-':'';let value=Math.abs(x);
 for(let den=1;den<=maxDenominator;den++){const numerator=Math.round(value*den);if(Math.abs(value-numerator/den)<1e-11)return sign+numerator+'/'+den;if(den>1500&&value!==0)break}return null;
}
export function numericalDerivative(expr:string,at:number,options:EvalOptions={}):number{
 if(!Number.isFinite(at))throw Error('Math ERROR: invalid x');const h=Math.cbrt(Number.EPSILON)*Math.max(1,Math.abs(at));
 return (real(evaluateExpression(expr,{...options,x:at+h,mode:'COMP'}))-real(evaluateExpression(expr,{...options,x:at-h,mode:'COMP'})))/(2*h);
}
/** Adaptive Simpson approximation; deliberately not represented as Canon's Gauss–Kronrod firmware. */
export function numericalIntegral(expr:string,lower:number,upper:number,options:EvalOptions={}):number{
 if(!Number.isFinite(lower)||!Number.isFinite(upper))throw Error('Math ERROR: invalid bounds');
 const f=(x:number)=>real(evaluateExpression(expr,{...options,x,mode:'COMP'}));
 const integrate=(a:number,b:number,fa:number,fb:number,fm:number,whole:number,depth:number):number=>{
 const m=(a+b)/2,l=(a+m)/2,r=(m+b)/2,fl=f(l),fr=f(r),left=(m-a)*(fa+4*fl+fm)/6,right=(b-m)*(fm+4*fr+fb)/6;
 if(depth===0||Math.abs(left+right-whole)<1e-9*Math.max(1,Math.abs(left+right)))return left+right+(left+right-whole)/15;
 return integrate(a,m,fa,fm,fl,left,depth-1)+integrate(m,b,fm,fb,fr,right,depth-1);
 };
 const m=(lower+upper)/2,fa=f(lower),fb=f(upper),fm=f(m),whole=(upper-lower)*(fa+4*fm+fb)/6;
 const answer=integrate(lower,upper,fa,fb,fm,whole,16);if(!Number.isFinite(answer))throw Error('Math ERROR: integral could not converge');return answer;
}
export function numericalSolve(expr:string,guess:number,options:EvalOptions={}):number{
 if(!Number.isFinite(guess))throw Error('Math ERROR: invalid initial guess');let x=guess;
 for(let i=0;i<80;i++){
  const fx=real(evaluateExpression(expr,{...options,x,mode:'COMP'}));if(Math.abs(fx)<1e-10)return x;
  const d=numericalDerivative(expr,x,options);if(!Number.isFinite(d)||Math.abs(d)<1e-14)break;
  const next=x-fx/d;if(!Number.isFinite(next)||Math.abs(next)>1e15)break;
  if(Math.abs(next-x)<1e-12*Math.max(1,Math.abs(next)))return next;
  x=next;
 }throw Error('Cannot Solve: adjust the initial guess or inspect the equation');
}
export function solveLinearSystem(A:number[][],b:number[]):number[]{
 const n=A.length;if(n<2||n>4||b.length!==n||A.some(row=>row.length!==n||row.some(v=>!Number.isFinite(v)))||b.some(v=>!Number.isFinite(v)))throw Error('Dimension ERROR');
 const m=A.map((row,i)=>[...row,b[i]]);
 for(let k=0;k<n;k++){let pivot=k;for(let j=k+1;j<n;j++)if(Math.abs(m[j][k])>Math.abs(m[pivot][k]))pivot=j;
 if(Math.abs(m[pivot][k])<1e-12)throw Error('Math ERROR: singular system');[m[k],m[pivot]]=[m[pivot],m[k]];
 const d=m[k][k];for(let j=k;j<=n;j++)m[k][j]/=d;
 for(let i=0;i<n;i++)if(i!==k){const factor=m[i][k];for(let j=k;j<=n;j++)m[i][j]-=factor*m[k][j]}
 }return m.map(row=>row[n]);
}
export function solvePolynomial(coefficients:number[]):Complex[]{
 if(coefficients.length<3||coefficients.length>5||coefficients.some(v=>!Number.isFinite(v))||coefficients[0]===0)throw Error('Coefficient ERROR: degree 2 to 4 required');
 const n=coefficients.length-1,co=coefficients.map(v=>v/coefficients[0]);
 if(n===2){const [_,b,c]=co;const d=b*b-4*c;
  if(d>=0){const q=-(b+Math.sign(b||1)*Math.sqrt(d))/2;const r1=q===0?-b/2:q;const r2=q===0?-b/2:c/q;return [complex(r1),complex(r2)].sort((a,b)=>a.re-b.re)}
  return [complex(-b/2,-Math.sqrt(-d)/2),complex(-b/2,Math.sqrt(-d)/2)]
 }
 // Exact integer root deflation prevents repeated-root instability in common board problems.
 const deflated:Complex[]=[];let coefficientsRemaining=[...co];
 for(let candidate=-30;candidate<=30&&coefficientsRemaining.length>2;candidate++){
  while(coefficientsRemaining.length>2){
   const reduced=[coefficientsRemaining[0]];for(let j=1;j<coefficientsRemaining.length;j++)reduced.push(coefficientsRemaining[j]+reduced[j-1]*candidate);
   const residual=reduced.pop()!;if(Math.abs(residual)>1e-9*Math.max(1,...coefficientsRemaining.map(Math.abs)))break;
   deflated.push(complex(candidate));coefficientsRemaining=reduced;
  }
 }
 if(deflated.length){if(coefficientsRemaining.length===1)return deflated;
  if(coefficientsRemaining.length===2){deflated.push(complex(-coefficientsRemaining[1]/coefficientsRemaining[0]));return deflated.sort((a,b)=>a.re-b.re)}
  const remaining=solvePolynomial(coefficientsRemaining);return [...deflated,...remaining].sort((a,b)=>a.re-b.re||a.im-b.im)
 }
 // Scale the variable to handle coefficients of varied magnitude in a bounded range.
 const radius=1+Math.max(...co.slice(1).map(v=>Math.abs(v)));
 let roots=Array.from({length:n},(_,k)=>complex(radius*.7*Math.cos(2*Math.PI*(k+.15)/n),radius*.7*Math.sin(2*Math.PI*(k+.15)/n)));
 const polynomial=(x:Complex)=>co.slice(1).reduce((a,v)=>add(mul(a,x),complex(v)),complex(1));
 for(let step=0;step<500;step++){
  let movement=0;const next=roots.map((root,k)=>{
   let denom=complex(1);for(let j=0;j<n;j++)if(j!==k)denom=mul(denom,sub(root,roots[j]));
   if(magnitude(denom)<1e-18)denom=add(denom,complex(1e-9,1e-9));
   const change=div(polynomial(root),denom);movement=Math.max(movement,magnitude(change));return sub(root,change);
  });roots=next;if(movement<1e-11)break;
  if(step===499){const residual=Math.max(...roots.map(root=>magnitude(polynomial(root))));if(residual>1e-7)throw Error('Cannot Solve: polynomial iteration did not converge')}
 }
 return roots.map(z=>complex(Math.abs(z.re)<1e-10?0:z.re,Math.abs(z.im)<1e-6?0:z.im)).sort((a,b)=>a.re-b.re||a.im-b.im);
}
export function statistics(xs:number[],ys?:number[]){
 if(xs.length===0||xs.some(v=>!Number.isFinite(v)))throw Error('Data ERROR: provide finite values');
 const n=xs.length,sum=xs.reduce((a,b)=>a+b,0),mean=sum/n,ss=xs.reduce((a,b)=>a+(b-mean)**2,0);
 const result:{n:number;sum:number;mean:number;populationSD:number;sampleSD:number;min:number;max:number;slope?:number;intercept?:number}={n,sum,mean,populationSD:Math.sqrt(ss/n),sampleSD:n>1?Math.sqrt(ss/(n-1)):NaN,min:Math.min(...xs),max:Math.max(...xs)};
 if(ys){if(ys.length!==n||ys.some(v=>!Number.isFinite(v)))throw Error('Data ERROR: x/y counts do not match');const ym=ys.reduce((a,b)=>a+b,0)/n;const covariance=xs.reduce((s,v,i)=>s+(v-mean)*(ys[i]-ym),0);if(ss===0)throw Error('Math ERROR: regression x variance is zero');result.slope=covariance/ss;result.intercept=ym-result.slope*mean}
 return result;
}
export function determinant(matrix:number[][]):number{
 const n=matrix.length;if(n<1||n>4||matrix.some(r=>r.length!==n||r.some(x=>!Number.isFinite(x))))throw Error('Dimension ERROR');
 const a=matrix.map(r=>[...r]);let d=1;for(let k=0;k<n;k++){let p=k;for(let j=k+1;j<n;j++)if(Math.abs(a[j][k])>Math.abs(a[p][k]))p=j;if(Math.abs(a[p][k])<1e-13)return 0;
 if(p!==k){[a[k],a[p]]=[a[p],a[k]];d*=-1}const pivot=a[k][k];d*=pivot;for(let i=k+1;i<n;i++){const r=a[i][k]/pivot;for(let j=k+1;j<n;j++)a[i][j]-=r*a[k][j]}}
 return d;
}
export function multiplyMatrices(a:number[][],b:number[][]):number[][]{
 if(!a.length||!b.length||a[0].length!==b.length||a.some(r=>r.length!==a[0].length)||b.some(r=>r.length!==b[0].length))throw Error('Dimension ERROR');
 return a.map(row=>b[0].map((_,j)=>row.reduce((sum,v,k)=>sum+v*b[k][j],0)));
}
export function invertMatrix(a:number[][]):number[][]{
 const n=a.length;if(n<1||n>4||a.some(row=>row.length!==n))throw Error('Dimension ERROR');
 const cols=Array.from({length:n},(_,k)=>solveLinearSystemForAnySize(a,Array.from({length:n},(_,i)=>i===k?1:0)));
 return Array.from({length:n},(_,i)=>cols.map(col=>col[i]));
}
function solveLinearSystemForAnySize(A:number[][],b:number[]):number[]{
 if(A.length===1){if(A[0][0]===0)throw Error('Math ERROR: singular matrix');return [b[0]/A[0][0]]}
 return solveLinearSystem(A,b);
}
export function baseConversion(input:string,radix:2|8|10|16):Record<'BIN'|'OCT'|'DEC'|'HEX',string>{
 const source=input.trim();const negative=source.startsWith('-');const digits=source.replace(/^[+\-]/,'').toUpperCase();const pattern=radix===2?/^[01]+$/:radix===8?/^[0-7]+$/:radix===10?/^[0-9]+$/:/^[0-9A-F]+$/;
 if(!pattern.test(digits))throw Error('Syntax ERROR: invalid BASE input');
 let unsigned=0n;for(const character of digits){const digit=BigInt(parseInt(character,16));unsigned=unsigned*BigInt(radix)+digit;if(unsigned>0xFFFFFFFFn)throw Error('Math ERROR: signed 32-bit range exceeded')}
 if(negative)unsigned=-unsigned;
 if(radix===10&&(unsigned>2147483647n||unsigned< -2147483648n))throw Error('Math ERROR: signed 32-bit range exceeded');
 const value=BigInt.asIntN(32,unsigned);const u=BigInt.asUintN(32,value);
 return {BIN:u.toString(2).padStart(32,'0'),OCT:u.toString(8),DEC:value.toString(),HEX:u.toString(16).toUpperCase()};
}
export function vectorOperations(a:number[],b:number[]){
 if(a.length!==b.length||![2,3].includes(a.length)||[...a,...b].some(v=>!Number.isFinite(v)))throw Error('Dimension ERROR');
 return {sum:a.map((v,i)=>v+b[i]),dot:a.reduce((s,v,i)=>s+v*b[i],0),normA:Math.hypot(...a),normB:Math.hypot(...b),cross:a.length===3?[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]:a[0]*b[1]-a[1]*b[0]};
}
