"""Dependency-free item-bank preservation + historical 99 calculation recomputations.
Does not establish statistical-model suitability or expert editorial certification.
"""
import ast, hashlib, json, math, statistics, re
from pathlib import Path
from collections import Counter
root=Path(__file__).resolve().parent.parent
p=root/'src/features/probability-statistics'
qs=json.loads((p/'psQuestions.json').read_text()); ls=json.loads((p/'psLessons.json').read_text())
reviews=json.loads((p/'psQuestionReview.json').read_text()); evidence=json.loads((p/'psLessonEvidence.json').read_text())
checks={}
for v,name in [('10600','calc'),('10610','arithmetic'),('10620','recompute')]:
    path=root/'scripts'/f'verifyProbabilityStatisticsV{v}.py'
    tree=ast.parse(path.read_text())
    fn=next(t for t in tree.body if isinstance(t,ast.FunctionDef) and t.name==name)
    ns={'math':math,'statistics':statistics}
    exec(compile(ast.Module(body=[fn],type_ignores=[]),str(path),'exec'),ns)
    checks[{'10600':'v10.60.0','10610':'v10.61.0','10620':'v10.62.0'}[v]]=ns[name]
counts=Counter()
for q in qs:
    if q['guidedOnly']:continue
    counts[q['kind']]+=1
    if q['kind']=='calculation':
        val=checks[q['origin']](q['auditRule'],q['auditArgs'])
        assert math.isclose(val,q['auditExpected'],abs_tol=1e-9,rel_tol=0),(q['id'],val)
        nums=re.findall(r'[-+]?\d+(?:\.\d+)?',q['options'][q['correctIndex']])
        assert nums,q['id'];num=nums[-1];prec=len(num.split('.')[-1]) if '.' in num else 0
        assert abs(float(num)-val)<=.5*10**(-prec)+1e-8,(q['id'],val,num)
    assert reviews[q['id']]['expertApproved'] is False
assert counts=={'calculation':99,'concept':41},counts
assert len(ls)==80 and len(evidence)==80
assert all(not x['passageVerified'] for x in evidence.values())
print('PASS v10.69: 99 independent numerical recomputations and 41 conceptual items still awaiting qualified review')
