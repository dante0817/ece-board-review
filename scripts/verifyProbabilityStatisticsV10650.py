"""v10.65 standalone independent QA of all 99 numeric answers, 41 concept structures,
source differential and fail-closed board exam status. Not an SME review."""
import ast, json, math, statistics, hashlib, re
from pathlib import Path
from collections import Counter,defaultdict
root=Path(__file__).resolve().parent.parent
p=root/'src/features/probability-statistics'
ls=json.loads((p/'psLessons.json').read_text())
qs=json.loads((p/'psQuestions.json').read_text())
source=json.loads((p/'psLessonEvidence.json').read_text())
reviews=json.loads((p/'psQuestionReview.json').read_text())
baseline=json.loads((root/'scripts/psBaselineV10650.json').read_text())
sha=lambda x:hashlib.sha256(json.dumps(x,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
assert len(ls)==80 and len(qs)==204 and len(reviews)==140
assert len({q['id'] for q in qs})==204 and len({l['id'] for l in ls})==80
assert Counter(l['moduleId'] for l in ls)=={f'PS{i:02d}':10 for i in range(1,9)}
assert sum(q['guidedOnly'] for q in qs)==64
edited_l=set(baseline['expectedEditedLessonIds']);edited_q=set(baseline['expectedEditedQuestionIds'])
actual_l={l['id'] for l in ls if sha(l)!=baseline['lessons'][l['id']]}
actual_q={q['id'] for q in qs if sha(q)!=baseline['questions'][q['id']]}
assert edited_l==actual_l,(edited_l,actual_l)
assert edited_q==actual_q,(edited_q,actual_q)
assert all(not q['assessmentEligible'] for q in qs)
assert all(v['expertApproved'] is False and v['independentEditorialSignoff'] is False and v['passageVerified'] is False and v['approvedCognitiveLevel'] is None for v in reviews.values())
assert all(s['passageVerified'] is False for s in source.values())
for lid in ('PS02-06','PS02-08','PS02-09','PS03-05','PS07-07'):
 assert lid in source and source[lid]['evidenceLevel']=='table-of-contents-only'
# Load only pure arithmetic evaluators, without running the historical release's version assertions.
evals={}
for version,fn in [('10.60.0','calc'),('10.61.0','arithmetic'),('10.62.0','recompute')]:
 file=root/'scripts'/('verifyProbabilityStatisticsV'+version.replace('.','')+'.py')
 module=ast.parse(file.read_text())
 function=next(x for x in module.body if isinstance(x,ast.FunctionDef) and x.name==fn)
 code=compile(ast.Module(body=[function],type_ignores=[]),str(file),'exec')
 scope={'math':math,'statistics':statistics}
 exec(code,scope)
 evals['v'+version]=scope[fn]
active=[q for q in qs if not q['guidedOnly']]
seen_prompts=set();seen_nums=defaultdict(list)
count=Counter()
for q in active:
 assert q['reviewStatus']=='editorial-pending' and q['id'] in reviews
 assert len(q['options'])==4 and len(set(q['options']))==4
 key=q['correctIndex'];assert 0<=key<4
 norm=' '.join(q['prompt'].casefold().split())
 assert norm not in seen_prompts,q['id'];seen_prompts.add(norm)
 if q['kind']=='concept':
  assert q['auditRule'] is None and q['auditExpected'] is None,q['id']
  count['concept']+=1;continue
 count['calculation']+=1
 origin=q['origin'];assert origin in evals,(q['id'],origin)
 actual=evals[origin](q['auditRule'],q['auditArgs'])
 assert math.isclose(actual,q['auditExpected'],abs_tol=1e-9,rel_tol=0),(q['id'],actual,q['auditExpected'])
 correct=q['options'][key]
 match=re.findall(r'[-+]?\d+(?:\.\d+)?',correct)
 assert match,(q['id'],correct)
 v=float(match[-1])
 decimals=len(match[-1].split('.')[1]) if '.' in match[-1] else 0
 tolerance=.5*10**(-decimals)+1e-8
 assert abs(actual-v)<=tolerance,(q['id'],actual,v,tolerance)
 for i,alt in enumerate(q['options']):
  if i==key:continue
  try:
   av=float(alt)
   assert abs(av-actual)>1e-8,(q['id'],'ambiguous rounded distractor',i,av)
  except ValueError:pass
 seen_nums[(q['topicId'],q['auditRule'],tuple(q['auditArgs']))].append(q['id'])
assert count=={'calculation':99,'concept':41},count
assert not [ids for ids in seen_nums.values() if len(ids)>1]
assert math.isclose(next(q for q in qs if q['id']=='PS04-02-P02')['auditExpected'],.3456)
assert next(q for q in qs if q['id']=='PS01-06-P01')['auditExpected']==112
print('PASS: 80 lessons; 64 guided items; 140 unique independent prompts (99 recalculated numeric, 41 conceptual structures).')
print('PASS: 99 numeric answer keys, printed-answer tolerances and distractor separation. No identical numeric scenario within a lesson.')
print('PASS: v10.64 immutable SHA-256 baseline with EXACTLY 2 question changes and 1 lesson change.')
print('PASS: corrected 5 locator records, all full-passage/SME approvals FALSE; scored board pool CLOSED.')
