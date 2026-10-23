"""Independent symbolic/structural QA of original v10.34 Algebra practice items.
The checks are algorithmic, NOT human editorial sign-off.
"""
import json,re,collections
from pathlib import Path
import sympy as s
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application
x=s.Symbol('x',real=True)
path=Path(__file__).resolve().parents[1]/'src/data/practice/algebraExpansionV1034.json'
items=json.loads(path.read_text(encoding='utf8'))
assert len(items)==100 and len({q['id'] for q in items})==100
assert len({q['topicId'] for q in items})==10
assert len({q['family'] for q in items})==50
assert all(len([q for q in items if q['topicId']==topic])==10 for topic in set(q['topicId'] for q in items))
xf=(standard_transformations+(implicit_multiplication_application,))

def mexpr(z):
    z=str(z).replace('−','-').replace('²','**2').replace('³','**3').replace('^','**')
    return parse_expr(z,transformations=xf,local_dict={'x':x,'i':s.I},evaluate=True)

def num_response(option):
    txt=option.strip().replace('−','-')
    txt=re.sub(r'(?<=\d)i\b','*I',txt).replace('i','I')
    return s.sympify(txt)

def symbolic_expected(check):
    kind=check['kind']
    if kind=='linear2':
        a,b,c,d=check['coeffs'];e,f=check['rhs'];mat=s.Matrix([[a,b],[c,d]]);assert mat.det()!=0
        return (mat.inv()*s.Matrix([e,f]))[check['component']]
    if kind=='linear3':
        A=s.Matrix(check['matrix']);return A.inv()*s.Matrix(check['rhs']) if False else (A.inv()*s.Matrix(check['rhs']))[check['component']]
    if kind=='det2':
        a,b,c,d=check['entries'];return s.det(s.Matrix([[a,b],[c,d]]))
    if kind=='log-evaluation':
        return s.log(check['argument'],check['base'])
    if kind=='log-sum':
        return sum(s.log(a,check['base']) for a in check['arguments'])
    if kind=='exp-eq':
        return check['power']-check['shift']
    if kind=='log-eq':
        result=check['base']**check['power']-check['shift'];assert result>-check['shift'];return result
    if kind=='power-db':
        return 10*s.log(check['ratio'],10)
    if kind=='trace2':
        a,b,c,d=check['entries'];return a+d
    if kind=='mat-product':
        A=s.Matrix(check['left']);B=s.Matrix(check['right']);r,c=check['component'];return (A*B)[r,c]
    if kind=='inverse-entry':
        a,b,c,d=check['entries'];r,col=check['component'];return s.Matrix([[a,b],[c,d]]).inv()[r,col]
    if kind=='scale-entry':
        a,b,c,d=check['entries'];r,col=check['component'];return (check['scalar']*s.Matrix([[a,b],[c,d]]))[r,col]
    if kind=='complex-power':return s.I**check['power']
    if kind=='complex-operation':
        a,b,c,d=check['values'];first=a+b*s.I;second=c+d*s.I
        return first+second if check['op']=='add' else first*second
    if kind=='complex-division':
        a,b=check['numerator'];c,d=check['denominator'];return s.simplify((a+b*s.I)/(c+d*s.I))
    if kind=='modulus-squared':
        a,b=check['parts'];return a*a+b*b
    if kind=='arithmetic-nth':return check['a']+(check['n']-1)*check['d']
    if kind=='arithmetic-sum':return s.Rational(check['n']*(2*check['a']+(check['n']-1)*check['d']),2)
    if kind=='arithmetic-recover-d':return s.Rational(check['last']-check['a'],check['n']-1)
    if kind=='arithmetic-mean':return s.Rational(sum(check['endpoints']),2)
    if kind=='arithmetic-index':return 1+s.Rational(check['term']-check['a'],check['d'])
    if kind=='geometric-nth':return check['a']*s.sympify(check['r'])**(check['n']-1)
    if kind=='geometric-sum':
        ratio=s.sympify(check['r']);return check['a']*(1-ratio**check['n'])/(1-ratio)
    if kind=='geometric-ratio':return s.sympify(check['second'])/check['a']
    if kind=='geometric-infinite':
        ratio=s.sympify(check['r']);assert abs(ratio)<1
        return check['a']/(1-ratio)
    if kind=='poly-eval':
        a,b,c=check['coeffs'];t=check['at'];return a*t*t+b*t+c
    if kind=='leading-product':return check['a']*check['t']
    if kind=='degree-product':return sum(check['degrees'])
    if kind=='poly-division':
        quotient,remainder=s.div(mexpr(check['dividend']),mexpr(check['divisor']),x)
        assert s.simplify(remainder-check['remainder'])==0
        return quotient.coeff(x,0)
    if kind=='exponent-law':
        a,b=check['powers'];return a+b if check['operation']=='multiply' else a-b
    if kind=='rational-exponent':return s.sympify(check['base'])**s.sympify(check['power'])
    if kind=='root':return s.sqrt(check['radicand'])
    if kind=='rationalized-denominator':
        root=s.sqrt(check['radicand']);coef,rest=root.as_coeff_Mul()
        return int(coef * (check['radicand']/coef**2))
    raise AssertionError((kind,'unhandled numeric check'))

def condition_set(txt):
    txt=txt.strip()
    if ' or ' in txt:
        return s.Union(*[condition_set(part) for part in txt.split(' or ')])
    def make_ineq(a,op,b):
        lhs=mexpr(a);rhs=mexpr(b)
        return {'<':s.Lt,'>':s.Gt,'≤':s.Le,'≥':s.Ge}[op](lhs,rhs)
    if txt.startswith('[') or txt.startswith('('):
        match=re.fullmatch(r'([\[(])\s*(-?\d+)\s*,\s*(-?\d+)\s*([\])])',txt)
        if not match:raise AssertionError(('bad interval',txt))
        l,lo,hi,r=match.groups();return s.Interval(int(lo),int(hi),left_open=l=='(',right_open=r==')')
    parts=re.split(r'\s*([<>≤≥])\s*',txt)
    if len(parts)==3:
        return s.solve_univariate_inequality(make_ineq(*parts),x,relational=False)
    if len(parts)==5:
        left=s.solve_univariate_inequality(make_ineq(parts[0],parts[1],parts[2]),x,relational=False)
        right=s.solve_univariate_inequality(make_ineq(parts[2],parts[3],parts[4]),x,relational=False)
        return s.Intersection(left,right)
    raise AssertionError(('unknown set notation',txt))

errors=[]
for q in items:
    c=q['check'];kind=c['kind'];answer=q['options'][q['correctIndex']]
    try:
        assert q['family'] and q['objectiveId'] and len(q['explanation'])>=20
        assert 0<=q['correctIndex']<4 and len(set(q['options']))==4
        assert answer==c['answer'] or kind not in ('linear2','linear3') # string correct checks below
        if kind=='linear-classification':
            (a,b,d),(e,f,g)=c['equations'];assert a*f==b*e and a*g!=d*e
            assert answer=='No solution'
        elif kind=='factorization':
            poly=mexpr(c['expanded'])
            for k,option in enumerate(q['options']):
                is_same=s.simplify(mexpr(option)-poly)==0
                assert is_same==(k==q['correctIndex']),(q['id'],option,is_same)
        elif kind in ('interval','inequality'):
            expected=s.sympify(c['solution'],locals={'x':x})
            assert condition_set(answer)==expected,(q['id'],condition_set(answer),expected)
            for i,option in enumerate(q['options']):
                assert (condition_set(option)==expected)==(i==q['correctIndex']), (q['id'],option)
            if kind=='inequality':
                condition=s.sympify(c['expression'],locals={'x':x})
                assert s.solve_univariate_inequality(condition,x,relational=False)==expected
        else:
            expected=s.simplify(symbolic_expected(c));recorded=s.sympify(c['answer'])
            assert s.simplify(expected-recorded)==0,(q['id'],expected,recorded)
            for k,option in enumerate(q['options']):
                matches=s.simplify(num_response(option)-expected)==0
                assert matches==(k==q['correctIndex']),(q['id'],option,expected)
    except Exception as e:errors.append((q['id'],repr(e),len(q['explanation'])))
if errors:
    for err in errors:print('FAIL',*err)
    raise SystemExit(f'{len(errors)} failures')
print(f'PASS: {len(items)} original Algebra items, {len({q["family"] for q in items})} families, {len({q["topicId"] for q in items})} topics, independent numerical, symbolic factoring, inequality interval and distractor checks. Human editorial certification remains pending.')
