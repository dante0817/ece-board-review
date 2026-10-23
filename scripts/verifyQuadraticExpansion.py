"""Automated independent algebraic check for ORIGINAL expanded Quadratic items.
Requires `pip install sympy`. This is NOT third-party editorial certification.
"""
import json
from pathlib import Path
import sympy as sp
x=sp.Symbol('x')
path=Path(__file__).resolve().parents[1]/'src/data/practice/quadraticExpansion.json'
questions=json.loads(path.read_text(encoding='utf-8'))
assert len(questions)==40 and len({q['id'] for q in questions})==40
subskills={q['subskill'] for q in questions}
assert len(subskills)==10
families={q['family'] for q in questions}
assert len(families)>=25
checked=0
for q in questions:
    assert len(q['options'])==4 and len(set(q['options']))==4
    assert 0<=q['correctIndex']<4
    assert q['objectiveId'] in {f'quad-obj-{i}' for i in range(1,8)}
    assert q['explanation'] and q['check']['family']==q['family']
    c=q['check'];kind=c['kind']
    if kind=='roots':
        a,b,d=c['coeffs']
        actual=set(sp.solve(a*x*x+b*x+d,x))
        expected={sp.sympify(r) for r in c['roots']}
        assert actual==expected,(q['id'],actual,expected)
    elif kind=='coefficients':
        a,b,d=c['coeffs'];assert a!=0 and all(isinstance(t,int) for t in (a,b,d))
        left,right=map(sp.sympify,c['originalSides'])
        expression=sp.Poly(sp.expand(left-right),x)
        assert [expression.coeff_monomial(x**power) for power in (2,1,0)]==[a,b,d],q['id']
    elif kind=='real-none':assert c['rhs']<0
    elif kind=='half-square':assert sp.Rational(c['b'],2)**2==c['answer']
    elif kind=='discriminant':
        a,b,d=c['coeffs'];delta=b*b-4*a*d
        assert delta==c['delta']
        assert {'two-real':delta>0,'repeated':delta==0,'nonreal':delta<0}[c['category']]
    elif kind=='vieta':
        a,b,d=c['coeffs'];actual=sp.Rational(-b,a) if c['metric']=='sum' else sp.Rational(d,a)
        assert actual==sp.sympify(c['expected'])
    elif kind=='substitution':
        a,b,d=c['coeffs'];actual=set(sp.solve(a*x**4+b*x**2+d,x))
        assert actual=={sp.sympify(r) for r in c['roots']}
    elif kind=='method':
        # Conceptual method-selection reasoning needs independent human review.
        assert len(q['explanation'])>=30
    else:raise AssertionError((q['id'],kind))
    checked+=1
print(f'Quadratic expansion check passed: {checked} question records, {len(subskills)} subskills, {len(families)} authored problem families. Method-choice and wording still require editorial review.')
