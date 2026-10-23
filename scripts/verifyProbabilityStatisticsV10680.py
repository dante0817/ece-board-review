"""v10.68 numerical QA; reuses three separately authored historical arithmetic checkers.
Independent of npm/TypeScript. This does not certify question statistical models."""
from pathlib import Path
from collections import Counter
import json, math, statistics, ast, hashlib, re
ROOT=Path(__file__).resolve().parent.parent
SOURCE=ROOT/'src/features/probability-statistics'
load=lambda p:json.loads((SOURCE/p).read_text())
questions=load('psQuestions.json');concepts=load('psV10680PreliminaryConceptReview.json')
base=json.loads((ROOT/'scripts/psBaselineV10680.json').read_text())
H=lambda x:hashlib.sha256(json.dumps(x,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
checks={}
for version,name in [('10600','calc'),('10610','arithmetic'),('10620','recompute')]:
    filename=ROOT/'scripts'/f'verifyProbabilityStatisticsV{version}.py'
    module=ast.parse(filename.read_text())
    fn=next(t for t in module.body if isinstance(t,ast.FunctionDef) and t.name==name)
    namespace={'math':math,'statistics':statistics}
    exec(compile(ast.Module(body=[fn],type_ignores=[]),str(filename),'exec'),namespace)
    checks[{'10600':'v10.60.0','10610':'v10.61.0','10620':'v10.62.0'}[version]]=namespace[name]
count=Counter();near_duplicate=[];norm=[]
for q in questions:
    if q['guidedOnly']:continue
    count[q['kind']]+=1
    assert 0<=q['correctIndex']<4 and len(set(q['options']))==4,(q['id'],'options')
    norm.append((q['id'],' '.join(q['prompt'].lower().split())))
    if q['kind']=='concept':continue
    value=checks[q['origin']](q['auditRule'],q['auditArgs'])
    assert math.isclose(value,q['auditExpected'],abs_tol=1e-9,rel_tol=0),(q['id'],value)
    answer=q['options'][q['correctIndex']]
    nums=re.findall(r'[-+]?\d+(?:\.\d+)?',answer)
    assert nums,(q['id'],answer)
    rendered=float(nums[-1]);precision=len(nums[-1].split('.')[-1]) if '.' in nums[-1] else 0
    assert abs(value-rendered)<=.5*10**(-precision)+1e-8,(q['id'],value,rendered)
assert count=={'calculation':99,'concept':41},count
assert len({prompt for _,prompt in norm})==len(norm),'duplicate independent practice prompts'
assert len(concepts)==41
for q in questions:
 if q['id'] not in {'PS02-01-P02','PS02-04-P02','PS06-01-P01','PS08-03-P01','PS08-08-P01'}:
  assert H(q)==base['questionHashes'][q['id']],q['id']
 else:
  assert H(q)!=base['questionHashes'][q['id']],q['id']
assert all(c['qualifiedExpertApproved'] is False for c in concepts)
print('PASS: 99 independently recomputed arithmetic keys, tolerances, and 41 preliminary concept record integrity checks')
print('PASS: only 5 controlled question edits and no duplicated independent prompts')
