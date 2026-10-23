import type { AlgebraReferencePracticeQuestion } from './algebraReferenceContent';

/** Thirty original items across FIFTEEN mathematically distinct problem families.
 * Each family has two numerical/wording variants, one of which is reserved for delayed rechecks.
 * Published client-side items are self-attested only: not secure, proctored or official board content.
 */
export interface IndependentAlgebraQuestion extends AlgebraReferencePracticeQuestion {
  topicId: string;
  familyId: string;
  source: 'original-v10.11';
  check: { kind:'monic-factor'|'root-square'|'nonmonic-factor'|'discriminant-class'|'discriminant-value'|'repeated-coefficient'|'radical-domain'|'rational-domain'|'log-domain'|'linear-isolate'|'linear-bracket'|'linear-two-sides'|'exponent-product'|'exponent-quotient'|'exponent-power'; values:number[] };
}
const q: IndependentAlgebraQuestion[]=[];
function add(topicId:string,family:string,variant:number,skill:string,prompt:string,right:string,wrong:string[],explanation:string,check:IndependentAlgebraQuestion['check']){
  const options=[right,...wrong];
  if(options.length!==4||new Set(options).size!==4)throw Error(`Bad independent choices: ${family}-${variant}`);
  q.push({id:`ind11-${family}-v${variant}`,familyId:`ind11-${family}`,topicId,source:'original-v10.11',subskill:skill,difficulty:'Standard',prompt,options,correctIndex:0,explanation,check});
}
for(const [v,a,b] of [[1,2,7],[2,3,8]]) {
  add('top-quadratics','quadratic-monic-factor',v,'Factoring',`Solve x² − ${a+b}x + ${a*b} = 0.`,
    `x = ${a} or ${b}`,[`x = −${a} or −${b}`,`x = ${a+1} or ${b+1}`,`x = ${a} only`],
    `x² − ${a+b}x + ${a*b} = (x−${a})(x−${b}); zero-product property gives x=${a}, ${b}.`,{kind:'monic-factor',values:[a,b]});
}
for(const [v,h,r] of [[1,5,4],[2,8,3]]) {
  add('top-quadratics','quadratic-square-root',v,'Square-root method',`Solve (x − ${h})² = ${r*r}.`,
    `x = ${h-r} or ${h+r}`,[`x = ${h+r} only`,`x = ${h-r} only`,`x = −${h-r} or −${h+r}`],
    `Set x−${h}=±${r}; adding ${h} gives both x=${h-r} and x=${h+r}.`,{kind:'root-square',values:[h,r]});
}
for(const [v,a,b] of [[1,3,5],[2,4,7]]){
  add('top-quadratics','quadratic-nonmonic-factor',v,'Factoring',`Solve (2x − ${2*a})(x − ${b}) = 0.`,
    `x = ${a} or ${b}`,[`x = −${a} or −${b}`,`x = ${2*a} or ${b}`,`x = ${a} only`],
    `Either 2x−${2*a}=0, giving x=${a}, or x−${b}=0, giving x=${b}.`,{kind:'nonmonic-factor',values:[a,b]});
}
for(const [v,a,b,c] of [[1,1,4,3],[2,2,2,5]]){
  const d=b*b-4*a*c;const nature=d>0?'two distinct real roots':'two nonreal conjugate roots';
  add('top-quadratics','quadratic-discriminant-class',v,'Discriminant',`Classify the roots of ${a}x² + ${b}x + ${c} = 0.`,
    nature,[d>0?'two nonreal conjugate roots':'two distinct real roots','one repeated real root','infinitely many real roots'],
    `Compute Δ=${b}²−4(${a})(${c})=${d}; therefore the equation has ${nature}.`,{kind:'discriminant-class',values:[a,b,c]});
}
for(const [v,a,b,c] of [[1,1,6,9],[2,3,5,2]]) {
  const d=b*b-4*a*c;
  add('top-quadratics','quadratic-discriminant-value',v,'Discriminant',`Calculate the discriminant of ${a}x² + ${b}x + ${c} = 0.`,
    `${d}`,[`${d+4}`,`${d-4}`,`${b*b+4*a*c}`],
    `Use Δ=b²−4ac. Substituting gives ${b*b}−${4*a*c}=${d}.`,{kind:'discriminant-value',values:[a,b,c]});
}
for(const [v,a,b] of [[1,1,6],[2,2,8]]) {
  const c=b*b/(4*a);
  add('top-quadratics','quadratic-repeated-parameter',v,'Discriminant',`Find c so that ${a}x² + ${b}x + c = 0 has a repeated real root.`,
    `c = ${c}`,[`c = ${c+2}`,`c = −${c}`,`c = ${c/2}`],
    `For a repeated real root Δ=0. Solve ${b*b}−4(${a})c=0 to obtain c=${c}.`,{kind:'repeated-coefficient',values:[a,b,c]});
}
for(const [v,k] of [[1,3],[2,8]]){
  add('top-functions','domain-radical',v,'Domain',`Over the reals, determine the domain of f(x)=√(${k}−x).`,
    `x ≤ ${k}`,[`x ≥ ${k}`,`x < ${k}`,'all real numbers'],
    `The radicand ${k}−x must be nonnegative, so x≤${k}.`,{kind:'radical-domain',values:[k]});
}
for(const [v,k] of [[1,7],[2,-2]]){
  add('top-functions','domain-rational',v,'Domain',`Over the reals, determine the domain of f(x)=1/(x−(${k})).`,
    `all real x except x = ${k}`,[`x ≥ ${k}`,`x ≤ ${k}`,'all real numbers'],
    `The denominator cannot be zero: x−(${k})≠0, so x≠${k}.`,{kind:'rational-domain',values:[k]});
}
for(const [v,k] of [[1,4],[2,-3]]){
  add('top-functions','domain-logarithm',v,'Domain',`What is the real domain of f(x)=ln(x−(${k}))?`,
    `x > ${k}`,[`x ≥ ${k}`,`x < ${k}`,'all real numbers'],
    `Natural-logarithm arguments must be strictly positive: x−(${k})>0, so x>${k}.`,{kind:'log-domain',values:[k]});
}
for(const [v,a,x,b] of [[1,3,4,5],[2,4,6,3]]){
  const rhs=a*x+b;
  add('top-linear-eq','linear-isolate',v,'One-variable equations',`Solve ${a}x + ${b} = ${rhs}.`,
    `x = ${x}`,[`x = ${x+1}`,`x = ${x-1}`,`x = −${x}`],
    `Subtract ${b} to get ${a}x=${a*x}; divide by ${a} to obtain x=${x}.`,{kind:'linear-isolate',values:[a,x,b,rhs]});
}
for(const [v,a,x,b] of [[1,5,4,2],[2,3,7,4]]){
  const rhs=a*(x+b);
  add('top-linear-eq','linear-distribute',v,'Distribution',`Solve ${a}(x + ${b}) = ${rhs}.`,
    `x = ${x}`,[`x = ${x+b}`,`x = ${x+1}`,`x = −${x}`],
    `Divide by ${a}: x+${b}=${x+b}. Subtract ${b} to obtain x=${x}.`,{kind:'linear-bracket',values:[a,x,b,rhs]});
}
for(const [v,a,c,x,b] of [[1,5,2,4,3],[2,7,3,5,2]]){
  const d=(a-c)*x+b;
  add('top-linear-eq','linear-both-sides',v,'Multi-step equations',`Solve ${a}x + ${b} = ${c}x + ${d}.`,
    `x = ${x}`,[`x = ${x+1}`,`x = ${x-1}`,`x = −${x}`],
    `Subtract ${c}x and ${b}: (${a}−${c})x=${d}−${b}=${(a-c)*x}; x=${x}.`,{kind:'linear-two-sides',values:[a,c,x,b,d]});
}
for(const [v,m,n] of [[1,3,5],[2,4,7]]){
  add('top-laws-exponents','exponent-product',v,'Exponent laws',`Simplify x^${m} · x^${n}.`,
    `x^${m+n}`,[`x^${m*n}`,`x^${m-n}`,`2x^${m+n}`],
    `For the same base add the exponents: x^(${m}+${n})=x^${m+n}.`,{kind:'exponent-product',values:[m,n]});
}
for(const [v,m,n] of [[1,9,3],[2,12,5]]){
  add('top-laws-exponents','exponent-quotient',v,'Exponent laws',`Simplify x^${m} / x^${n} for x ≠ 0.`,
    `x^${m-n}`,[`x^${m+n}`,`x^${m*n}`,`x^${n-m}`],
    `For a nonzero common base subtract exponents: x^(${m}−${n})=x^${m-n}.`,{kind:'exponent-quotient',values:[m,n]});
}
for(const [v,m,n] of [[1,3,4],[2,4,5]]){
  add('top-laws-exponents','exponent-power',v,'Exponent laws',`Simplify (x^${m})^${n}.`,
    `x^${m*n}`,[`x^${m+n}`,`x^${m-n}`,`x^${n}`],
    `A power raised to a power multiplies exponents: x^(${m}×${n})=x^${m*n}.`,{kind:'exponent-power',values:[m,n]});
}
export const INDEPENDENT_ALGEBRA_QUESTIONS: readonly IndependentAlgebraQuestion[]=Object.freeze(q);
export const independentQuestionsForTopic=(topicId:string)=>INDEPENDENT_ALGEBRA_QUESTIONS.filter(question=>question.topicId===topicId);
