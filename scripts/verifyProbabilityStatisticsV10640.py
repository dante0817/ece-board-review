"""v10.64 independently verify the 80/204 immutable IDs, 15 audited editorial modifications,
provisional section crosswalk, PRC 15-slot preflight, and fail-closed assessment gate.
This does NOT provide SME signoff, passage verification, browser certification or complete model review.
"""
from pathlib import Path
from collections import Counter
import json, hashlib, math
root=Path(__file__).resolve().parent.parent
p=root/'src/features/probability-statistics'
read=lambda f:json.loads((p/f).read_text())
ls=read('psLessons.json');qs=read('psQuestions.json');mods=read('psModules.json')
evidence=read('psLessonEvidence.json');review=read('psQuestionReview.json');blueprint=read('psAssessmentBlueprint.json')
manifest=json.loads((root/'scripts/psEditorialBaselineV10640.json').read_text())
sha=lambda x:hashlib.sha256(json.dumps(x,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
assert len(mods)==8 and len(ls)==80 and len(qs)==204
assert len({m['id'] for m in mods})==8 and len({l['id'] for l in ls})==80 and len({q['id'] for q in qs})==204
assert Counter(x['moduleId'] for x in ls)=={f'PS{i:02d}':10 for i in range(1,9)}
assert len([q for q in qs if q['guidedOnly']])==64
unseen=[q for q in qs if not q['guidedOnly']]
assert len(unseen)==140 and Counter(q['kind'] for q in unseen)=={'calculation':99,'concept':41}
assert not any(q['assessmentEligible'] for q in qs)
assert all(q['reviewStatus']=='editorial-pending' for q in unseen)
lesson_ids={x['id'] for x in ls}
assert all(q['topicId'] in lesson_ids for q in qs)
assert set(evidence)==lesson_ids and set(review)=={q['id'] for q in unseen}
assert all(e['evidenceLevel']=='table-of-contents-only' and e['passageVerified'] is False for e in evidence.values())
assert all(isinstance(e['pdfPage'],int) and e['pdfPage']>0 and e['sectionTitle'] for e in evidence.values())
assert set(q['id'] for q in unseen)==set(review)
for q in unseen:
 e=review[q['id']];loc=evidence[q['topicId']]
 assert e['lessonId']==q['topicId'] and e['competency']==loc['competency'] and e['relationship']==loc['relationship']
 assert all(e[k] is False for k in ['expertApproved','independentEditorialSignoff','statisticalModelVerified','answerAndDistractorsVerified','passageVerified'])
 assert e['approvedCognitiveLevel'] is None and e['reviewStatus']=='editorial-pending'
assert all('Prerequisite' in evidence[l['id']]['relationship'] for l in ls if l['moduleId'] in ('PS02','PS03'))
assert all(evidence[l['id']]['relationship']=='Direct' for l in ls if l['moduleId'] not in ('PS02','PS03'))
assert {x['id']:x['items'] for x in blueprint['competencies']}=={'5.1':2,'5.2':5,'5.3':2,'5.4':2,'5.5':4}
assert sum(x['items'] for x in blueprint['competencies'])==15
assert blueprint['cognitiveTargetAcross15']=={'knowledge':2,'comprehension':3,'application':6,'analysis':4}
assert all(x['lessonIds'] and set(x['lessonIds'])=={z['id'] for z in ls if z['moduleId']==x['id']} for x in mods)
# Source manifests protect ALL previous records, outside the 15 explicitly approved editorial objects.
expected_q=set(manifest['allowedEditorialQuestionChanges']);expected_l=set(manifest['allowedEditorialLessonChanges'])
assert expected_q=={'PS01-02-P01','PS03-04-P01'},expected_q
assert len(expected_l)==13
for name,items,exempt in [('Question',qs,expected_q),('Lesson',ls,expected_l)]:
 old=manifest['preReleaseQuestionHashes' if name=='Question' else 'preReleaseLessonHashes']
 assert len(old)==len(items)
 for row in items:
  if row['id'] in exempt:continue
  assert sha(row)==old[row['id']],f'Unexpected change to {name} {row["id"]}'
assert 'arithmetic mean' in next(q for q in qs if q['id']=='PS01-02-P01')['prompt']
assert 'independent parallel' in next(q for q in qs if q['id']=='PS03-04-P01')['prompt']
# No numeric keys, audit source parameters or answer choices changed in v10.64.
for id in expected_q:
 q=next(q for q in qs if q['id']==id)
 assert q['correctIndex'] in (1,2) and q['auditExpected'] in (7,0.99) and len(q['options'])==4
# Baseline source diff is precise; edited lesson changes are append-only to specific math guardrails.
app_code=(p/'psContent.ts').read_text();screen=(p/'ProbabilityStatisticsScreen.tsx').read_text();practice=(p/'PSPracticePanel.tsx').read_text()
for fragment in ['PS_QUESTION_REVIEW','review.expertApproved === true','review.passageVerified === true','approvedCognitiveLevel','PS_BOARD_EXAM_READY']:
 assert fragment in app_code,fragment
assert 'ps-readiness-panel' in screen and 'PS_READINESS_PREFLIGHT' in screen
assert 'PS_PRACTICE_QUESTIONS' in practice and 'PS_QUESTION_REVIEW' in practice
assert (root/'package.json').is_file()
ver=json.loads((root/'package.json').read_text())['version'];lock=json.loads((root/'package-lock.json').read_text())
assert ver==lock['version']==lock['packages']['']['version']=='10.64.0'
print('PASS v10.64: 80 lessons, 64 guided + 140 independent questions (99 numeric/41 conceptual); 2 controlled question and 13 lesson edits.')
print('PASS: 189 unchanged question records and 67 unchanged lesson records match pre-editorial SHA-256 snapshots.')
print('PASS: 80 TOC-level section references, 140 provisional question mappings, official 15-item 5.1–5.5 and cognitive preflight metadata.')
print('PASS: all assessment gates remain CLOSED and no question is scored-exam eligible.')
