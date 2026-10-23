/** Focused, no-dependency checks of the independent calculator simulation engine.
 * Use Node 22+ with --experimental-strip-types; Node 24 supports this syntax natively. */
import assert from 'node:assert/strict';
import {
 evaluateExpression as evaluate,formatValue,approximateFraction,
 numericalDerivative,numericalIntegral,numericalSolve,solveLinearSystem,solvePolynomial,
 statistics,determinant,invertMatrix,multiplyMatrices,baseConversion,vectorOperations
} from '../src/domain/calculator/simulator/engine.ts';
let count=0;
const near=(actual,expected,tolerance=1e-8)=>{assert.ok(Math.abs(actual-expected)<=tolerance*Math.max(1,Math.abs(expected)),`${actual} not within tolerance of ${expected}`);count++};
const equal=(actual,expected)=>{assert.deepEqual(actual,expected);count++};
const bad=(work,regex)=>{assert.throws(work,regex);count++};
near(evaluate('2+3*4').re,14);near(evaluate('(2+3)*4').re,20);near(evaluate('2^3^2').re,512);
near(evaluate('-2^2').re,-4);near(evaluate('(-2)^2').re,4);near(evaluate('2pi').re,2*Math.PI);
near(evaluate('2(3+2)').re,10);near(evaluate('(2+3)(4+5)').re,45);
near(evaluate('sin(30)').re,.5);near(evaluate('cos(60)').re,.5);near(evaluate('sin(pi/2)',{angle:'RAD'}).re,1);
near(evaluate('asin(0.5)').re,30);near(evaluate('tan(50)',{angle:'GRAD'}).re,1);
near(evaluate('sqrt(9)').re,3);near(evaluate('log(100)').re,2);near(evaluate('ln(e)').re,1);
near(evaluate('5!').re,120);near(evaluate('ncr(5,2)').re,10);near(evaluate('npr(5,2)').re,20);
near(evaluate('3i+2',{mode:'CPLX'}).im,3);near(evaluate('3i+2',{mode:'CPLX'}).re,2);
near(evaluate('i*i',{mode:'CPLX'}).re,-1);near(evaluate('sqrt(-1)',{mode:'CPLX'}).im,1);
near(evaluate('conj(2+3i)',{mode:'CPLX'}).im,-3);near(evaluate('abs(3+4i)',{mode:'CPLX'}).re,5);
near(evaluate('Ans+M',{ans:{re:3,im:0},memory:{re:7,im:0}}).re,10);
near(evaluate('x^2',{x:3}).re,9);near(evaluate('2E3').re,2000);
equal(formatValue({re:2,im:3},'CPLX'),'2 + 3i');equal(approximateFraction(.75),'3/4');
bad(()=>evaluate('1/0'),/division by zero/);bad(()=>evaluate('sqrt(-1)'),/complex result/);
bad(()=>evaluate('unknown(1)'),/unknown symbol/);bad(()=>evaluate('1; process.exit(1)'),/unsupported character/);
bad(()=>evaluate('asin(2)'),/outside supported range/);bad(()=>evaluate('2(3'),/expected \)/);
bad(()=>evaluate('5.5!'),/factorial requires/);
near(numericalDerivative('x^2',3),6,1e-6);near(numericalIntegral('x^2',0,2),8/3,1e-8);
near(numericalIntegral('sin(x)',0,Math.PI,{angle:'RAD'}),2,1e-7);near(numericalSolve('x^2-2',1),Math.SQRT2,1e-8);
bad(()=>numericalSolve('1',0),/Cannot Solve/);
equal(solveLinearSystem([[2,1],[1,-1]],[5,1]).map(Math.round),[2,1]);
bad(()=>solveLinearSystem([[1,2],[2,4]],[3,6]),/singular/);
const quadratic=solvePolynomial([1,-2,1]);near(quadratic[0].re,1);near(quadratic[1].re,1);
const cubic=solvePolynomial([1,-6,11,-6]);equal(cubic.map(v=>Math.round(v.re)),[1,2,3]);
const quartic=solvePolynomial([1,-4,6,-4,1]);equal(quartic.map(v=>Math.round(v.re)),[1,1,1,1]);
const z4=solvePolynomial([1,0,0,0,1]);equal(z4.length,4);for(const z of z4)near(z.re**4-6*z.re*z.re*z.im*z.im+z.im**4,-1,1e-7);
const stats=statistics([1,2,3]);near(stats.mean,2);near(stats.sampleSD,1);
const regression=statistics([1,2,3],[3,5,7]);near(regression.slope,2);near(regression.intercept,1);
near(determinant([[1,2],[3,4]]),-2);equal(multiplyMatrices([[1,2],[3,4]],[[1,0],[0,1]]),[[1,2],[3,4]]);
const inv=invertMatrix([[1,2],[3,4]]);const identity=multiplyMatrices([[1,2],[3,4]],inv);near(identity[0][0],1);near(identity[1][1],1);near(identity[0][1],0);
equal(baseConversion('FF',16).DEC,'255');equal(baseConversion('FFFFFFFF',16).DEC,'-1');equal(baseConversion('11111111',2).HEX,'FF');
bad(()=>baseConversion('29',8),/invalid BASE/);
const v=vectorOperations([1,2,3],[4,5,6]);near(v.dot,32);equal(v.cross,[-3,6,-3]);
bad(()=>vectorOperations([1,2],[1,2,3]),/Dimension ERROR/);
console.log(`PASS F-789SGA-style simulator engine: ${count} assertions`);
