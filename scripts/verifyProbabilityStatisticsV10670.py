"""v10.67 independent arithmetic and key validation, plus immutable 10.66 baseline comparison."""
from pathlib import Path
from collections import defaultdict,Counter
import json,ast,math,statistics,re,hashlib
root=Path(__file__).resolve().parent.parent
p=root/'src/features/probability-statistics'
load=lambda x:json.loads((p/x).read_text())
lessons=load('psLessons.json');qs=load('psQuestions.json');ev=load('psLessonEvidence.json');qr=load('psQuestionReview.json')
base=json.loads((root/'scripts/psBaselineV10670.json').read_text())
H=lambda x:hashlib.sha256(json.dumps(x,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
assert set(x['id'] for x in lessons)==set(base['lessonSHA256'])
assert set(x['id'] for x in qs)==set(base['questionSHA256'])
assert {x['id'] for x in lessons if H(x)!=base['lessonSHA256'][x['id']]}==set(base['expectedChangedLessons'])
assert {x['id'] for x in qs if H(x)!=base['questionSHA256'][x['id']]}==set(base['expectedChangedQuestions'])
assert {lid for lid,v in ev.items() if H(v)!=base['evidenceSHA256'][lid]}==set(base['expectedChangedEvidence'])
calc={}
for ver,fn in [('10.60.0','calc'),('10.61.0','arithmetic'),('10.62.0','recompute')]:
 f=root/'scripts'/('verifyProbabilityStatisticsV'+ver.replace('.','')+'.py')
 module=ast.parse(f.read_text())
 function=next(node for node in module.body if isinstance(node,ast.FunctionDef) and node.name==fn)
 env={'math':math,'statistics':statistics}
 exec(compile(ast.Module(body=[function],type_ignores=[]),str(f),'exec'),env)
 calc['v'+ver]=env[fn]
count=Counter();seen=set();scenarios=defaultdict(list)
for q in qs:
 if q['guidedOnly']:continue
 count[q['kind']]+=1
 assert q['id'] in qr
 assert not q['assessmentEligible']
 assert len(q['options'])==4 and len(set(q['options']))==4
 norm=' '.join(q['prompt'].lower().split());assert norm not in seen,q['id'];seen.add(norm)
 assert 0<=q['correctIndex']<4 and q['work']
 if q['kind']=='concept':
  assert q['auditRule'] is None and q['auditExpected'] is None,q['id'];continue
 value=calc[q['origin']](q['auditRule'],q['auditArgs'])
 assert math.isclose(value,q['auditExpected'],abs_tol=1e-9,rel_tol=0),(q['id'],value,q['auditExpected'])
 correct=q['options'][q['correctIndex']]
 nums=re.findall(r'[-+]?\d+(?:\.\d+)?',correct)
 assert nums,(q['id'],correct)
 printed=float(nums[-1]);decimal_places=len(nums[-1].split('.')[1]) if '.' in nums[-1] else 0
 assert abs(value-printed)<=.5*10**(-decimal_places)+1e-8,(q['id'],value,printed)
 for i,d in enumerate(q['options']):
  if i!=q['correctIndex']:
   try: assert abs(float(d)-value)>1e-8,(q['id'],i)
   except ValueError:pass
 scenarios[(q['topicId'],q['auditRule'],tuple(q['auditArgs']))].append(q['id'])
assert count=={'calculation':99,'concept':41},count
assert not [v for v in scenarios.values() if len(v)>1]
assert all(not r['expertApproved'] and not r['independentEditorialSignoff'] for r in qr.values())
print('PASS: 99 independently recomputed numeric answers and displayed precision; 41 concept items structurally reviewed')
print('PASS: all legacy question content unchanged; controlled 2-lesson/3-reference corrections only')
print('PASS: all assessment and independent editorial approvals remain false')
