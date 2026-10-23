"""Independent Python arithmetic checks for the NEW, UNSEEN v10.60 practice questions.
This does not certify the underlying statistical assumptions, topic applicability or editorial quality.
"""
import json, math, pathlib, re, sys, collections
base=pathlib.Path(__file__).resolve().parent.parent/'src/features/probability-statistics'
qs=json.loads((base/'psQuestions.json').read_text(encoding='utf8'))
new=[q for q in qs if q['origin']=='v10.60.0']
assert len(new)==44, len(new)

def calc(rule,a):
    if rule=='mean': return sum(a)/len(a)
    if rule=='choose': return math.comb(int(a[0]),int(a[1]))
    if rule=='product': return math.prod(a)
    if rule=='divide': return a[0]/a[1]
    if rule=='parallel': return 1-math.prod((1-p for p in a))
    if rule=='binomial': return math.comb(int(a[0]),int(a[1]))*a[2]**a[1]*(1-a[2])**(a[0]-a[1])
    if rule=='zscore': return (a[0]-a[1])/a[2]
    if rule=='line': return a[0]+a[1]*a[2]
    if rule=='difference': return a[0]-a[1]
    if rule=='se': return a[0]/math.sqrt(a[1])
    if rule=='zupper': return a[0]+a[3]*a[1]/math.sqrt(a[2])
    if rule in ('tmargin','pairedmargin'): return a[2]*a[0]/math.sqrt(a[1])
    if rule=='nmean': return math.ceil((a[0]*a[1]/a[2])**2)
    if rule=='blockdf': return (a[0]-1)*(a[1]-1)
    if rule=='interaction': return (a[3]-a[2])-(a[1]-a[0])
    if rule=='welchse': return math.sqrt(a[0]*a[0]/a[1]+a[2]*a[2]/a[3])
    if rule=='proportiondiff': return a[0]/a[1]-a[2]/a[3]
    if rule=='nprop': return math.ceil(a[0]*a[0]*a[1]*(1-a[1])/a[2]**2)
    if rule=='identity': return a[0]
    if rule=='anovaedf': return a[0]-a[1]
    if rule=='anovaF': return (a[0]/a[1])/(a[2]/a[3])
    if rule=='factorA': return (a[1]+a[3]-a[0]-a[2])/2
    if rule=='factorialruns': return a[1]*2**int(a[0])
    raise AssertionError(f'Unrecognized numeric rule {rule}')

numbers=[]
for q in new:
    assert len(q['options'])==4 and len(set(q['options']))==4, q['id']
    assert q['assessmentEligible'] is False and q['guidedOnly'] is False,q['id']
    if q['kind']=='calculation':
        actual=calc(q['auditRule'],q['auditArgs'])
        assert math.isclose(actual,q['auditExpected'],rel_tol=0,abs_tol=1e-9),(q['id'],actual,q['auditExpected'])
        txt=q['options'][q['correctIndex']].split('≈')[-1].strip()
        match=re.match(r'[+\-]?\d+(?:\.\d+)?',txt)
        assert match,(q['id'],txt)
        selected=float(match.group(0))
        assert math.isclose(actual,selected,rel_tol=0,abs_tol=0.00055),(q['id'],actual,selected)
        numbers.append(q['id'])
    else:
        assert q['auditRule'] is None and q['auditExpected'] is None,q['id']
count=collections.Counter(q['topicId'][:4] for q in new)
assert set(count)=={f'PS{i:02d}' for i in range(1,9)}, count
assert count['PS05']==16 and count['PS08']==16, count
assert all(count[f'PS{i:02d}']==2 for i in (1,2,3,4,6,7)),count
print('PASS Python independent PS v10.60 arithmetic:',len(numbers),'new numerical keys checked; ',len(new)-len(numbers),'concept key structures checked, 44 unseen prompts across all 8 modules.')
# Verify exact original record values except four intentionally amended wording records.
import hashlib
manifest=json.loads((base.parent.parent.parent/'scripts/psLegacyBaselineV10580.json').read_text())
legacy={q['id']:q for q in qs if q['origin']=='v10.58.0'}
legacy_keys=['id','topicId','kind','level','prompt','options','correctIndex','work','restriction','auditRule','auditArgs','auditExpected']
for qid,q in legacy.items():
    if qid in manifest['intentionalWordingCorrections']:continue
    payload={k:q[k] for k in legacy_keys}
    digest=hashlib.sha256(json.dumps(payload,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
    assert digest==manifest['originalRecordDigests'][qid],f'Legacy v10.58 content changed unexpectedly: {qid}'
print('PASS protected source consistency:',len(legacy)-len(manifest['intentionalWordingCorrections']),'exact original records; 4 approved wording corrections.')
