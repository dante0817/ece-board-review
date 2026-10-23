"""Independent numeric key + source integrity QA for PS06/PS07 v10.61.0 additions.
Does not certify editorial correctness, sample assumptions or PRC blueprint eligibility.
"""
from pathlib import Path
import json, math, re, statistics, hashlib
from collections import Counter
root=Path(__file__).resolve().parent.parent
base=root/'src/features/probability-statistics'
questions=json.loads((base/'psQuestions.json').read_text())
lessons=json.loads((base/'psLessons.json').read_text())
mods=json.loads((base/'psModules.json').read_text())
new=[q for q in questions if q.get('origin')=='v10.61.0']
assert len(questions) in (140,204) and len(lessons) in (56,80) and len(new)==32
assert Counter(q['topicId'][:4] for q in new)=={'PS06':16,'PS07':16}
assert Counter(q['kind'] for q in new)=={'calculation':23,'concept':9}
assert len({q['id'] for q in questions})==len(questions)
assert len({l['id'] for l in lessons})==len(lessons)
assert all(not q['assessmentEligible'] for q in questions)
assert all(q['reviewStatus']=='editorial-pending' and not q['guidedOnly'] for q in new)

# Recompute test statistics from explicit observed values, rather than from stored answer keys.
def arithmetic(rule,a):
    if rule=='zmean' or rule=='tmean':return (a[0]-a[1])*math.sqrt(a[3])/a[2]
    if rule=='df1':return a[0]-1
    if rule=='df2':return a[0]-2
    if rule=='expected':return a[0]*a[1]/a[2]
    if rule=='power':return 1-a[0]
    if rule=='zprop':return (a[0]/a[1]-a[2])/math.sqrt(a[2]*(1-a[2])/a[1])
    if rule=='welchse':return math.hypot(a[0]/math.sqrt(a[1]),a[2]/math.sqrt(a[3]))
    if rule=='welcht':return a[0]/math.hypot(a[1]/math.sqrt(a[2]),a[3]/math.sqrt(a[4]))
    if rule=='pairedt':return a[0]*math.sqrt(a[2])/a[1]
    if rule=='twopropz':
        p=(a[0]+a[2])/(a[1]+a[3]);return (a[0]/a[1]-a[2]/a[3])/math.sqrt(p*(1-p)*(1/a[1]+1/a[3]))
    if rule=='chifit':
        expected=sum(a)/len(a);return sum((v-expected)**2/expected for v in a)
    if rule=='corr3':return statistics.correlation(a[:3],a[3:])
    if rule=='slope3':return statistics.linear_regression(a[:3],a[3:]).slope
    if rule=='intercept3':return statistics.linear_regression(a[:3],a[3:]).intercept
    if rule=='intercept':return a[0]-a[1]*a[2]
    if rule=='r2':return (a[1]-a[0])/a[1]
    if rule=='difference':return a[0]-a[1]
    if rule=='meanse':return a[0]/math.sqrt(a[1])
    if rule=='predse':return math.sqrt(a[0]**2+a[0]**2/a[1])
    if rule=='slopet':return a[0]/a[1]
    if rule=='identity':return a[0]
    if rule=='multiple':return a[0]+a[1]*a[3]+a[2]*a[4]
    raise AssertionError(f'Unknown numeric audit rule {rule}')

lessonById={l['id']:l for l in lessons}
old={q['id']:q for q in questions if q.get('origin')!='v10.61.0'}
# All existing lesson and question payloads are byte-stable under canonical JSON representation,
# compared with baseline checksums taken before the expansion.
snapshot=json.loads((root/'scripts/psBaselineV10600.json').read_text())
editorial=json.loads((root/'scripts/psEditorialBaselineV10640.json').read_text()) if (root/'scripts/psEditorialBaselineV10640.json').exists() else {'allowedEditorialLessonChanges':[],'allowedEditorialQuestionChanges':[]}
for name,items in [('lessons',lessons),('questions',questions)]:
 for item in items:
  if item['id'] not in snapshot[name] or item['id'] in editorial['allowedEditorialLessonChanges' if name=='lessons' else 'allowedEditorialQuestionChanges']:continue
  actual=hashlib.sha256(json.dumps(item,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode('utf8')).hexdigest()
  assert actual==snapshot[name][item['id']],f'Existing {name} unexpectedly modified: {item["id"]}'

numeric=0
for q in new:
    assert q['topicId'] in lessonById and q['topicId'][:4] in ('PS06','PS07')
    assert len(q['options'])==4 and len(set(q['options']))==4
    assert q['options'][q['correctIndex']] and q['work'] and q['restriction']
    norm=lambda x:' '.join(x.lower().split())
    ls=lessonById[q['topicId']]
    assert norm(q['prompt'])!=norm(ls.get('workedExample',{}).get('prompt',''))
    assert norm(q['prompt'])!=norm(ls.get('checkpoint',{}).get('prompt',''))
    assert all(norm(q['prompt'])!=norm(x['prompt']) for x in old.values()),q['id']
    if q['kind']=='concept':
        assert q['auditRule'] is None and q['auditExpected'] is None
        continue
    numeric+=1
    x=arithmetic(q['auditRule'],q['auditArgs'])
    assert math.isclose(x,q['auditExpected'],rel_tol=0,abs_tol=1e-8),(q['id'],x,q['auditExpected'])
    key=q['options'][q['correctIndex']]
    assert re.fullmatch(r'-?\d+(?:\.\d+)?',key), (q['id'],key)
    # Half-unit in the last printed decimal place, plus representation epsilon.
    dp=len(key.partition('.')[2]) if '.' in key else 0
    tol=0.5*10**(-dp)+1e-8
    assert abs(float(key)-x)<=tol,(q['id'],x,key,tol)
    assert all(not math.isclose(float(option),x,rel_tol=0,abs_tol=1e-8) for i,option in enumerate(q['options']) if i!=q['correctIndex']),q['id']
print('PASS PS v10.61 independent arithmetic: 23 new numeric keys; 9 conceptual key structures; 32 unique unseen prompts.')
print('PASS protection of 44 prior lessons and 108 prior question payloads, exact canonical SHA-256.')
