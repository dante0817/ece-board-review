"""Repeatable source-focused release QA. Full runtime/browser checks require npm dependencies."""
import os,subprocess,json,datetime,sys,pathlib
root=pathlib.Path(__file__).resolve().parent.parent
node_path=subprocess.check_output(['npm','root','-g'],text=True).strip()
env=os.environ.copy();env['NODE_PATH']=node_path
checks=[
 ('Trigonometry v10.37 pilot','node scripts/validateTrigonometryPilotV1037.mjs'),
 ('Trigonometry v10.36 regression','node scripts/validateTrigonometryV1036.mjs'),
 ('Manual learning v10.35.1','node scripts/validateManualLearnV10351.mjs'),
 ('Learn Reader v10.31','node scripts/validateLearnReaderV1031.mjs'),
 ('Practice v10.32','node scripts/validatePracticeV1032.mjs'),
 ('Practice v10.33','node scripts/validatePracticeV1033.mjs'),
 ('Practice v10.34','node scripts/validatePracticeV1034.mjs'),
 ('Algebra reference validation','node scripts/validateAlgebraReferenceContent.mjs'),
 ('Content v10.30 validation','node scripts/validateContentV1030.mjs'),
 ('Source import scan','node scripts/scanSourceImportsV1023.mjs'),
 ('Practice data-layer TypeScript','tsc --project tsconfig.practice.v1032.json'),
 ('Reader data-layer TypeScript','tsc --project tsconfig.learn-reader.json'),
 ('Pilot data-layer TypeScript','tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler --lib ES2022,DOM --skipLibCheck src/domain/learn/lessonTypes.ts src/domain/learn/manualLearnTracking.ts src/domain/learn/readerProgress.ts src/features/trigonometry/types.ts src/features/trigonometry/manualProgressAdapter.ts src/data/lessons/trigonometryPilot.ts src/data/practice/trigonometryPilot.ts'),
]
results=[]
for name,command in checks:
    proc=subprocess.run(command,shell=True,cwd=root,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,timeout=55)
    results.append({'check':name,'result':'PASS' if proc.returncode==0 else 'FAIL','exitCode':proc.returncode,'outputTail':'\n'.join(proc.stdout.strip().splitlines()[-5:])})
report={'version':'10.37.0','checkCount':len(results),'passed':sum(x['result']=='PASS' for x in results),'failed':sum(x['result']=='FAIL' for x in results),'results':results,'runtimeLimitations':{'npmInstall':'No access to npm registry (EAI_AGAIN) and required packages not cached','lint':'Unable to complete full-app lint: missing Node/React type declarations and packages','build':'Unable to complete full build: vite executable missing','browserSmoke':'Not run without built app/runtime'},'claims':{'curriculumTopics':14,'curriculumSubtopics':102,'pilotDraftLessons':4,'pilotOriginalQuestions':32,'pilotDiagrams':3,'previousBroadTrigTopicsPreserved':2,'practiceCatalogTotal':454}}
(root/'VALIDATION_V10_37_0.json').write_text(json.dumps(report,indent=2)+'\n')
lines=['# v10.37.0 Trigonometry release QA','',f"Source checks: **{report['passed']}/{report['checkCount']} passed**.",'','| Check | Status |','|---|---|']
lines.extend(f"| {x['check']} | {x['result']} |" for x in results)
lines.extend(['','## Runtime limitations','', 'Package installation via npm failed because the registry could not be reached (EAI_AGAIN). Full-app lint fails on missing dependencies, `npm run build` fails because `vite` is not installed, and browser smoke tests could not be performed. These are **unverified**, not successful tests.','', '## Educational scope','', 'Four draft, originally authored pilot lessons are mapped to the Trigonometry curriculum; 98 subtopics are still unlinked. Thirty-two question keys are checked structurally and against separate expected answers, with quantitative spot checks. No independent mathematics expert review has been represented as completed.',''])
(root/'VALIDATION_REPORT_V10_37_0.md').write_text('\n'.join(lines))
print(f"Checks: {report['passed']}/{report['checkCount']} PASS")
for x in results: print(x['result'],x['check'])
if report['failed']:sys.exit(1)
