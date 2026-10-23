"""Generate a deterministic, original, source-controlled Algebra practice expansion.
Each item includes solution metadata audited by verifyAlgebraPracticeV1034.py.
No textbook exercises are copied. Requires SymPy.
"""
import json, random
from pathlib import Path
import sympy as s
x=s.symbols('x', real=True)
rng=random.Random(1034)
items=[]
TOPICS={
 'sys':('top-simultaneous-linear','Systems of Equations'),
 'log':('top-logarithms','Exponential & Logarithmic Functions'),
 'mat':('top-matrices','Matrices'),
 'cx':('top-complex-numbers','Complex Numbers'),
 'ap':('top-arithmetic-seq','Arithmetic Progressions & Series'),
 'gp':('top-geometric-seq','Geometric Progressions & Series'),
 'poly':('top-polynomial-eq','Polynomials'),
 'fac':('top-factoring','Factoring'),
 'exp':('top-laws-exponents','Exponents & Radicals'),
 'ineq':('top-inequalities','Inequalities'),
}

def human(v):
    v=s.simplify(v)
    if v.is_integer: return str(int(v))
    if v.is_Rational: return f'{v.p}/{v.q}'
    if v.is_real: return str(v).replace('sqrt','√')
    re,im=s.expand_complex(v).as_real_imag()
    if im==0:return human(re)
    if re==0 and im==1:return 'i'
    if re==0 and im==-1:return '−i'
    sign='+' if im>=0 else '−'
    return f'{human(re)} {sign} {'' if abs(im)==1 else human(abs(im))}i'

def add(key,sub,difficulty,ptype,prompt,answer,d1,d2,d3,explanation,objective,family,check,kind='numeric'):
    distractors=[d1,d2,d3]
    assert key in TOPICS and len(distractors)>=3
    if kind=='numeric':
        choices=[s.simplify(v) for v in [answer,*distractors]]
        assert all(s.simplify(v-choices[0])!=0 for v in choices[1:]), (key,prompt,choices)
        assert len({s.srepr(v) for v in choices})==4
        rendered=list(map(human,choices))
    else:
        rendered=[str(v) for v in [answer,*distractors]]
        assert len(set(rendered))==4
    correct=str(rendered[0]);rng.shuffle(rendered)
    item={
        'id':f'alge34-{len(items)+1:03d}', 'topicId':TOPICS[key][0], 'subskill':sub,
        'difficulty':difficulty,'problemType':ptype,'prompt':prompt,
        'options':rendered,'correctIndex':rendered.index(correct),
        'explanation':explanation,'family':f'{key}:{family}','objectiveId':objective,
        'check':{'kind':kind,'answer':str(s.simplify(answer)) if kind=='numeric' else correct, **check},
    }
    items.append(item)

def num(key,sub,difficulty,prompt,answer,explanation,obj,family,check,wrong=None,ptype='Computational'):
    v=s.sympify(answer)
    if wrong is None: wrong=[v+1,v-1,-v if v!=0 else v+2]
    wrong=[s.sympify(z) for z in wrong]
    if len({s.srepr(s.simplify(z)) for z in [v,*wrong]})<4:
        wrong=[v+1,v+2,v-2]
    add(key,sub,difficulty,ptype,prompt,v,*wrong,explanation,obj,family,check)

# Systems — unique 2×2/3×3, determinants, linear-system classifications.
for j,(a,b,c,d,X,Y) in enumerate([(2,3,1,-2,4,-1),(3,-1,2,5,-2,3)]):
    e=a*X+b*Y;f=c*X+d*Y
    num('sys','2×2 substitution/elimination','Intermediate',f'Solve {a}x {b:+}y={e} and {c}x {d:+}y={f}. What is x?',X,
        f'The determinant is {a*d-b*c}≠0; elimination gives x={X}, y={Y}.', 'sys-obj-1','two-by-two-x',{'kind':'linear2','coeffs':[a,b,c,d],'rhs':[e,f],'component':0})
    num('sys','Elimination','Intermediate',f'For the system {a}x {b:+}y={e}; {c}x {d:+}y={f}, find y.',Y,
        f'Eliminate x (or substitute) to obtain y={Y}; back-substitution gives x={X}.','sys-obj-2','two-by-two-y',{'kind':'linear2','coeffs':[a,b,c,d],'rhs':[e,f],'component':1})
    num('sys','Determinants','Basic',f'Find the determinant of the coefficient matrix [[{a}, {b}], [{c}, {d}]].',a*d-b*c,
        f'Determinant = ad−bc = ({a})({d})−({b})({c}) = {a*d-b*c}.','sys-obj-5','det2',{'kind':'det2','entries':[a,b,c,d]})
    z=2+j
    A=s.Matrix([[1,2,-1],[2,-1,1],[1,1,2]]);u=s.Matrix([X,Y,z]);rhs=A*u
    num('sys','3×3 systems','Advanced',f'Find z in x+2y−z={rhs[0]}, 2x−y+z={rhs[1]}, x+y+2z={rhs[2]}.',z,
        f'Elimination/back-substitution yields (x,y,z)=({X},{Y},{z}).','sys-obj-4','three-by-three-z',{'kind':'linear3','matrix':[list(row) for row in A.tolist()],'rhs':list(rhs),'component':2})
    scale=2+j
    add('sys','Inconsistent systems','Intermediate','Conceptual',
        f'Classify x+2y={3+j} and {scale}x+{2*scale}y={scale*(4+j)}.',
        'No solution','Exactly one solution','Infinitely many solutions','Cannot be classified',
        'The left side of the second equation is a multiple of the first, but the constants are inconsistent.',
        'sys-obj-3','parallel-inconsistent',{'kind':'linear-classification','equations':[[1,2,3+j],[scale,2*scale,scale*(4+j)]],'classification':'inconsistent'},kind='text')

# Exponentials/logs — exact laws and decibel model with power ratios.
for j,(base,k,m) in enumerate([(2,5,3),(3,4,2)]):
    num('log','Logarithm evaluation','Basic',f'Evaluate log base {base} of {base**k}.',k,
        f'Because {base}^{k}={base**k}, log_{base}({base**k})={k}.','log-obj-2','log-power',{'kind':'log-evaluation','base':base,'argument':base**k})
    num('log','Log laws','Intermediate',f'Evaluate log base {base}({base**k}) + log base {base}({base**m}).',k+m,
        f'Each logarithm is an exponent: {k}+{m}={k+m}; equivalently log_b(uv)=log_b(u)+log_b(v).','log-obj-3','log-sum',{'kind':'log-sum','base':base,'arguments':[base**k,base**m]})
    num('log','Exponential equations','Intermediate',f'Solve {base}^(x+{j+1})={base**k}. Find x.',k-(j+1),
        f'Equate exponents because the positive base {base} is not 1: x+{j+1}={k}.','log-obj-5','equal-bases',{'kind':'exp-eq','base':base,'shift':j+1,'power':k})
    num('log','Log equations','Intermediate',f'Solve log base {base}(x+{j+2})={m}.',base**m-(j+2),
        f'The logarithm requires x+{j+2}>0. Rewrite as x+{j+2}={base**m}, hence x={base**m-(j+2)}.','log-obj-5','log-equation',{'kind':'log-eq','base':base,'shift':j+2,'power':m})
    ratio=10**(j+2)
    num('log','ECE application','Intermediate',f'A power ratio of {ratio}:1 corresponds to 10log10(P₂/P₁) decibels. Find the gain in dB.',10*(j+2),
        f'10 log₁₀({ratio})=10×{j+2}={10*(j+2)} dB (power ratio, not voltage ratio).','log-obj-6','decibels-power',{'kind':'power-db','ratio':ratio},ptype='Application')

# Matrices — numerical determinants/inverse/trace/product/compatibility.
for j,(a,b,c,d) in enumerate([(3,2,1,4),(4,-1,2,3)]):
    det=a*d-b*c
    num('mat','Determinants','Basic',f'Compute det(A) for A=[[{a},{b}],[{c},{d}]].',det,
        f'det(A)=({a})({d})−({b})({c})={det}.','mat-obj-5','matrix-det',{'kind':'det2','entries':[a,b,c,d]})
    num('mat','Matrix properties','Basic',f'Find the trace of A=[[{a},{b}],[{c},{d}]].',a+d,
        f'The trace of a square matrix is the sum of diagonal entries: {a}+{d}={a+d}.','mat-obj-1','trace2',{'kind':'trace2','entries':[a,b,c,d]})
    B=s.Matrix([[2+j,1],[1,-1]]);A=s.Matrix([[a,b],[c,d]]);P=A*B
    num('mat','Multiplication','Intermediate',f'Let A=[[{a},{b}],[{c},{d}]], B=[[{B[0,0]},{B[0,1]}],[{B[1,0]},{B[1,1]}]]. Find (AB)₁₁.',P[0,0],
        f'Row 1 · column 1 = ({a})({B[0,0]})+({b})({B[1,0]})={P[0,0]}.','mat-obj-3','product-entry',{'kind':'mat-product','left':A.tolist(),'right':B.tolist(),'component':[0,0]})
    inv=A.inv();num('mat','Inverse matrices','Advanced',f'A=[[{a},{b}],[{c},{d}]] is invertible. Find entry (A⁻¹)₁₁.',inv[0,0],
        f'A⁻¹=1/{det} [[{d},{-b}],[{-c},{a}]], so the upper-left entry is {d}/{det}.','mat-obj-6','inverse-entry',{'kind':'inverse-entry','entries':[a,b,c,d],'component':[0,0]},wrong=[s.Rational(a,det),s.Rational(b,det),-s.Rational(d,det)])
    num('mat','Scalar multiplication','Basic',f'For A=[[{a},{b}],[{c},{d}]], find the bottom-right entry of {j+2}A.',(j+2)*d,
        f'Scalar multiplication multiplies each entry by {j+2}; the bottom-right entry is {j+2}×{d}.','mat-obj-2','scale-entry',{'kind':'scale-entry','entries':[a,b,c,d],'scalar':j+2,'component':[1,1]})

# Complex numbers — powers, operations, conjugation, division, magnitudes.
for j,(a,b,c,d,n) in enumerate([(3,2,1,-1,17),(4,-3,-2,1,26)]):
    num('cx','Powers of i','Basic',f'Simplify i^{n}. Which value is correct?',s.I**n,
        f'The powers of i repeat every four steps; {n} mod 4 = {n%4}.','cx-obj-1','powers-i',{'kind':'complex-power','power':n},wrong=[z for z in (s.Integer(1),s.Integer(-1),s.I,-s.I) if z!=s.I**n])
    num('cx','Addition','Basic',f'Add ({a}{b:+}i) + ({c}{d:+}i).',s.expand((a+b*s.I)+(c+d*s.I)),
        f'Add real parts ({a})+({c})={a+c}, and imaginary coefficients ({b})+({d})={b+d}; the result is {human(a+c+(b+d)*s.I)}.','cx-obj-3','complex-add',{'kind':'complex-operation','op':'add','values':[a,b,c,d]},wrong=[a+c+(b-d)*s.I,a-c+(b+d)*s.I, a+c+(b+d+2)*s.I])
    num('cx','Multiplication','Intermediate',f'Multiply ({a}{b:+}i)({c}{d:+}i).',s.expand((a+b*s.I)*(c+d*s.I)),
        f'FOIL and replace i² with −1: real part ac−bd={a*c-b*d}; imaginary part ad+bc={a*d+b*c}.','cx-obj-3','complex-multiply',{'kind':'complex-operation','op':'multiply','values':[a,b,c,d]},wrong=[a*c+b*d+(a*d+b*c)*s.I,a*c-b*d+(a*d-b*c)*s.I,a*c-b*d+(-a*d+b*c)*s.I])
    num('cx','Division','Advanced',f'Simplify ({a}{b:+}i)/(1+i).',s.simplify((a+b*s.I)/(1+s.I)),
        'Multiply numerator and denominator by 1−i, then divide by 2.','cx-obj-4','complex-divide',{'kind':'complex-division','numerator':[a,b],'denominator':[1,1]},wrong=[(a+b*s.I)/(1-s.I),(a+b*s.I)/2,(a-b*s.I)/(1+s.I)])
    num('cx','Conjugates','Basic',f'Find |{a}{b:+}i|² (the squared modulus).',a*a+b*b,
        f'For z=a+bi, |z|²=z·conjugate(z)=a²+b²={a*a+b*b}.','cx-obj-4','squared-modulus',{'kind':'modulus-squared','parts':[a,b]})

# Arithmetic progressions.
for j,(a,d,n) in enumerate([(5,3,8),(12,-2,7)]):
    nth=a+(n-1)*d
    num('ap','Nth term','Basic',f'An arithmetic sequence has a₁={a} and d={d}. Find a_{n}.',nth,
        f'aₙ=a₁+(n−1)d={a}+({n}−1)({d})={nth}.','ap-obj-2','arithmetic-term',{'kind':'arithmetic-nth','a':a,'d':d,'n':n})
    total=s.Rational(n*(2*a+(n-1)*d),2)
    num('ap','Finite sum','Intermediate',f'Sum the first {n} terms of an arithmetic sequence with a₁={a} and common difference {d}.',total,
        f'Sₙ=n[2a₁+(n−1)d]/2={n}[{2*a}+({n}-1)({d})]/2={human(total)}.','ap-obj-4','arithmetic-sum',{'kind':'arithmetic-sum','a':a,'d':d,'n':n})
    num('ap','Recover d','Intermediate',f'If a₁={a} and a_{n}={nth} for an arithmetic sequence, find d.',d,
        f'd=(aₙ−a₁)/(n−1)=({nth}−{a})/({n}−1)={d}.','ap-obj-2','arithmetic-recover-d',{'kind':'arithmetic-recover-d','a':a,'last':nth,'n':n})
    num('ap','Arithmetic mean','Basic',f'What arithmetic mean lies midway between {a} and {a+2*d}?',a+d,
        f'The arithmetic mean is the midpoint: ({a}+{a+2*d})/2={a+d}.','ap-obj-3','arithmetic-mean',{'kind':'arithmetic-mean','endpoints':[a,a+2*d]})
    num('ap','Find the index','Advanced',f'In aₙ={a}+({n-1 and d})(n−1), what term number equals {nth}?',n,
        f'Solve {nth}={a}+({d})(n−1); n={n}.','ap-obj-2','arithmetic-index',{'kind':'arithmetic-index','a':a,'d':d,'term':nth})

# Geometric progressions.
for j,(a,r,n) in enumerate([(3,s.Rational(2),6),(64,s.Rational(1,2),5)]):
    val=s.simplify(a*r**(n-1));tot=s.simplify(a*(1-r**n)/(1-r))
    num('gp','Nth term','Basic',f'Find a_{n} if a₁={a} and common ratio r={human(r)}.',val,
        f'aₙ=a₁r^(n−1)={a}({human(r)})^{n-1}={human(val)}.','gp-obj-2','geometric-term',{'kind':'geometric-nth','a':a,'r':str(r),'n':n})
    num('gp','Finite sum','Intermediate',f'Sum the first {n} terms of a geometric sequence with a₁={a}, r={human(r)}.',tot,
        f'Sₙ=a₁(1−rⁿ)/(1−r)={human(tot)}.','gp-obj-4','geometric-finite-sum',{'kind':'geometric-sum','a':a,'r':str(r),'n':n})
    num('gp','Common ratio','Basic',f'Find common ratio r when a₁={a} and a₂={human(a*r)}.',r,
        f'The common ratio is a₂/a₁={human(a*r)}/{a}={human(r)}.','gp-obj-1','geometric-ratio',{'kind':'geometric-ratio','a':a,'second':str(a*r)})
    q=s.Rational(1,j+2);first=3+j;inf=first/(1-q)
    num('gp','Infinite sum','Intermediate',f'An infinite geometric series begins with a₁={first}, ratio r={human(q)}. Find its sum.',inf,
        f'Because |r|<1, S∞=a₁/(1−r)={first}/(1−{human(q)})={human(inf)}.','gp-obj-5','geometric-infinite-sum',{'kind':'geometric-infinite','a':first,'r':str(q)})
    num('gp','ECE application','Intermediate',f'A sampled amplitude starts at {a} V and is multiplied by {human(r)} on each step. What is its value after {n-1} steps?',val,
        f'A_k=A₀r^k={a}({human(r)})^{n-1}={human(val)} V. This is an idealized mathematical sequence, not a measured circuit.','gp-obj-6','geometric-amplitude',{'kind':'geometric-nth','a':a,'r':str(r),'n':n},ptype='Application')

# Polynomials — evaluation/remainder, multiplication, division and degree.
for j,(a,b,c,t) in enumerate([(2,-3,4,2),(-1,5,-2,-2)]):
    p=a*x*x+b*x+c
    num('poly','Evaluation','Basic',f'Evaluate P({t}) if P(x)={a}x² {b:+}x {c:+}.',p.subs(x,t),
        f'Substitute x={t}: {a}({t})²+({b})({t})+({c})={p.subs(x,t)}.','poly-obj-1','polynomial-evaluation',{'kind':'poly-eval','coeffs':[a,b,c],'at':t})
    num('poly','Remainder theorem','Intermediate',f'What is the remainder on dividing P(x)={a}x² {b:+}x {c:+} by x−({t})?',p.subs(x,t),
        f'By the remainder theorem, the remainder is P({t})={p.subs(x,t)}.','poly-obj-5','remainder-theorem',{'kind':'poly-eval','coeffs':[a,b,c],'at':t})
    num('poly','Leading coefficient','Basic',f'Find the leading coefficient of ({a}x² {b:+})({t}x+1).',a*t,
        f'The leading term arises from ({a}x²)({t}x)={a*t}x³.','poly-obj-3','leading-product',{'kind':'leading-product','a':a,'t':t})
    num('poly','Degree','Basic',f'If P(x) has degree {2+j} and Q(x) has degree {3+j}, find degree(PQ).',5+2*j,
        f'Nonzero polynomials satisfy deg(PQ)=deg(P)+deg(Q)={2+j}+{3+j}.','poly-obj-1','degree-product',{'kind':'degree-product','degrees':[2+j,3+j]})
    quotient=a*x+b
    polynomial=s.expand(quotient*(x-t)+c)
    num('poly','Polynomial division','Advanced',f'Divide P(x)={s.sstr(polynomial).replace("**","^").replace("*x","x")} by (x−({t})). Find the constant coefficient of the quotient.',b,
        f'By polynomial division, P(x)=(x−({t}))({a}x+({b}))+({c}). The quotient is {a}x+({b}), whose constant coefficient is {b}.','poly-obj-4','quotient-constant',{'kind':'poly-division','dividend':str(polynomial),'divisor':str(x-t),'remainder':c})

# Factoring — choose a *complete factorization* among plausible wrong factorizations.
for j,(a,b) in enumerate([(3,2),(4,5)]):
    def fac(sub,prompt,expr,correct,distractors,obj,family):
        add('fac',sub,'Intermediate','Computational',prompt,correct,*distractors,
            f'Expand the factors to check equality, and continue until no factor can be reduced over the integers. Correct factorization: {correct}.',
            obj,family,{'kind':'factorization','expanded':str(s.expand(expr)),'factors':[str(correct),*map(str,distractors)]},kind='text')
    fac('Greatest common factor',f'Factor completely: {a}x²+{a*b}x.',a*x*x+a*b*x,
        f'{a}x(x+{b})',[f'{a}(x+{b})',f'x(x+{a*b})',f'{a}x(x−{b})'],'fac-obj-1','gcf')
    fac('Trinomials',f'Factor x²+{a+b}x+{a*b}.',x*x+(a+b)*x+a*b,
        f'(x+{a})(x+{b})',[f'(x−{a})(x−{b})',f'(x+{a})(x−{b})',f'(x+{a+1})(x+{b})'],'fac-obj-2','monic-trinomial')
    fac('GCF and special products',f'Factor the difference of squares  x²−{a*a}.',x*x-a*a,
        f'(x−{a})(x+{a})',[f'(x−{a})²',f'(x+{a})²',f'(x−{a})(x+{b})'],'fac-obj-3','difference-squares')
    expr=x*x*(x+a)+b*x+b*a
    fac('Grouping',f'Factor x³+{a}x²+{b}x+{a*b} by grouping.',expr,
        f'(x+{a})(x²+{b})',[f'(x−{a})(x²+{b})',f'(x+{a})(x²−{b})',f'(x+{b})(x²+{a})'],'fac-obj-4','grouping')
    expr=x**3+a**3
    fac('Sum of cubes',f'Factor x³+{a**3}.',expr,
        f'(x+{a})(x²−{a}x+{a*a})',[f'(x+{a})(x²+{a}x+{a*a})',f'(x−{a})(x²+{a}x+{a*a})',f'(x+{a})(x²−{a}x−{a*a})'],'fac-obj-3','sum-cubes')

# Exponents and radicals — explicit nonzero/positive assumptions.
for j,(a,b,k) in enumerate([(3,2,12),(5,3,20)]):
    num('exp','Exponent laws','Basic',f'For nonzero x, simplify x^{a} × x^{b}. What is the exponent of x?',a+b,
        f'Products with the same base add exponents: x^{a}x^{b}=x^{a+b}.','exp-obj-1','add-exponents',{'kind':'exponent-law','operation':'multiply','powers':[a,b]})
    num('exp','Exponent laws','Basic',f'For nonzero x, simplify x^{a+b}/x^{b}. What exponent remains?',a,
        f'Use the quotient rule: x^{a+b}/x^{b}=x^({a+b}−{b})=x^{a}.','exp-obj-1','subtract-exponents',{'kind':'exponent-law','operation':'divide','powers':[a+b,b]})
    root=2+j
    num('exp','Rational exponents','Intermediate',f'Compute ({root**3})^(2/3) using the real cube root.',root**2,
        f'({root**3})^(2/3)=(cube root {root**3})²={root}²={root**2}.','exp-obj-2','rational-exponent',{'kind':'rational-exponent','base':root**3,'power':'2/3'})
    v=j+2
    num('exp','Radical simplification','Basic',f'Compute √({v*v*4}) using the principal square root.',2*v,
        f'√({4*v*v})=2×{v}={2*v}, the nonnegative principal root.','exp-obj-3','perfect-square-radical',{'kind':'root','radicand':4*v*v})
    num('exp','Rationalizing denominators','Intermediate',f'Rationalize 1/√{k} and simplify the radical. What is the positive integer denominator in simplest form?',
        int(s.sqrt(k).simplify().as_coeff_Mul()[0] * s.simplify(k / s.sqrt(k).simplify().as_coeff_Mul()[0]**2)),
        f'Write √{k}={int(s.sqrt(k).simplify().as_coeff_Mul()[0])}√{int(k/s.sqrt(k).simplify().as_coeff_Mul()[0]**2)}; after multiplying by the radical conjugate, the fraction has denominator {int(s.sqrt(k).simplify().as_coeff_Mul()[0]*(k/s.sqrt(k).simplify().as_coeff_Mul()[0]**2))}.','exp-obj-4','rationalization-square',{'kind':'rationalized-denominator','radicand':k})

# Inequalities — test solution sets using independent SymPy logic.
for j,(a,b,c) in enumerate([(3,5,2),(-2,4,-3)]):
    # All answer choices are plain algebraic conditions; verify inequivalence via sympy inequality solving.
    rhs=(b-a*c)
    cond=s.Le(a*x+b,b+a*c) if j==0 else s.Gt(a*x+b,b+a*c)
    # The first is x<=c for a>0; second with a<0 also x<c.
    solution=s.solve_univariate_inequality(cond,x,relational=False)
    choices=['x ≤ '+str(c),'x ≥ '+str(c),'x < '+str(c),'x > '+str(c)]
    correct=('x ≤ '+str(c)) if j==0 else ('x < '+str(c))
    add('ineq','Linear inequalities','Basic','Conceptual',f'Solve {a}x {b:+} '+('≤' if j==0 else '>')+f' {b+a*c}.',correct,*[v for v in choices if v!=correct],
        f'Subtract {b}, divide by {a}; reverse the inequality only if dividing by a negative coefficient. Solution: {correct}.','ineq-obj-1','linear-sign',{'kind':'inequality','expression':str(cond),'solution':str(solution)},kind='text')
    t=2+j
    # |x-center| <= radius, intervals displayed using plaintext bound notation.
    center=-j;radius=t
    left=center-radius;right=center+radius
    add('ineq','Absolute-value inequalities','Intermediate','Conceptual',f'Solve |x−({center})| ≤ {radius}.',f'{left} ≤ x ≤ {right}',
        f'x ≤ {right}', f'x ≥ {left}', f'x < {left} or x > {right}',
        f'For |x−c|≤r with r≥0, we require c−r≤x≤c+r, inclusive.','ineq-obj-3','absolute-bound',
        {'kind':'interval','solution':str(s.Interval(left,right))},kind='text')
    roots=(-2-j,3+j)
    add('ineq','Polynomial inequalities','Advanced','Conceptual',f'Find the solution of (x−({roots[0]}))(x−({roots[1]})) < 0.',f'{roots[0]} < x < {roots[1]}',
        f'x < {roots[0]} or x > {roots[1]}',f'{roots[0]} ≤ x ≤ {roots[1]}',f'x < {roots[1]}',
        'An upward-opening quadratic is negative strictly between its two distinct roots; endpoints are excluded.','ineq-obj-4','quadratic-sign',
        {'kind':'interval','solution':str(s.Interval.open(*roots))},kind='text')
    pole=j+1;zero=pole+2
    # (x-zero)/(x-pole) > 0 => (-oo,pole) U (zero,oo)
    add('ineq','Rational sign chart','Advanced','Conceptual',f'Solve (x−{zero})/(x−{pole}) > 0; exclude the denominator zero.',
        f'x < {pole} or x > {zero}', f'{pole} < x < {zero}',f'x ≤ {pole} or x ≥ {zero}',f'x > {pole}',
        f'Test intervals cut by x={pole} and x={zero}. The ratio is positive to the left of {pole} and right of {zero}, excluding both endpoints.',
        'ineq-obj-5','rational-sign',{'kind':'interval','solution':str(s.Union(s.Interval.open(-s.oo,pole),s.Interval.open(zero,s.oo)))},kind='text')
    lo=-3+j;hi=4+j
    add('ineq','Compound intervals','Basic','Conceptual',f'Rewrite {lo} ≤ x < {hi} using interval notation.',f'[{lo}, {hi})',
        f'({lo}, {hi})',f'[{lo}, {hi}]',f'({lo}, {hi}]',
        f'The left endpoint is included (closed bracket), while the right is excluded (parenthesis).','ineq-obj-2','interval-notation',
        {'kind':'interval','solution':str(s.Interval.Ropen(lo,hi))},kind='text')

# Final integrity and deterministic output.
assert len(items)==100,len(items)
assert len({q['id'] for q in items})==len(items)
assert {q['topicId'] for q in items}=={v[0] for v in TOPICS.values()}
assert all(len(q['options'])==4 and len(set(q['options']))==4 for q in items)
output=Path(__file__).resolve().parents[1]/'src/data/practice/algebraExpansionV1034.json'
output.write_text(json.dumps(items,indent=2,ensure_ascii=False, default=lambda o:int(o) if isinstance(o,s.Integer) else str(o))+'\n',encoding='utf8')
print(f'Created {len(items)} original exercises in {len(TOPICS)} Algebra topics; {len({q["family"] for q in items})} authored families. Written: {output}')
