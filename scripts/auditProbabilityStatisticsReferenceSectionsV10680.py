"""Re-check 80 research-section locators against the original user-supplied PDFs.

Requires `pip install pymupdf` and all five named PDF files in --pdf-dir.
This proves a readable page/section-topic match, NOT verification of formulas,
worked examples, question keys or subject-matter expertise.
"""
from pathlib import Path
import argparse, hashlib, json, re, sys
try: import fitz
except ImportError: sys.exit('Missing PyMuPDF. Install with: python -m pip install pymupdf')
P=Path(__file__).resolve().parent.parent/'src/features/probability-statistics'
load=lambda x:json.loads((P/x).read_text())
stop={'that','with','from','the','and','for','statistical','statistics','probability','introduction','basic','simple','other','of','an','to','on','into','under','between','using','theory'}
manual={'PS02-06','PS02-09','PS03-05','PS03-08','PS06-03','PS07-07'}
parser=argparse.ArgumentParser();parser.add_argument('--pdf-dir',required=True,type=Path);parser.add_argument('--report',type=Path);args=parser.parse_args()
original=load('psV10670SourceLocatorChecks.json');extended=load('psV10680SectionEvidence.json')
failures=[];report=[];cached={}
for lid,record in extended.items():
 filename=record['sourcePdf'];target=args.pdf_dir/filename
 if not target.is_file():failures.append((lid,'PDF not found',str(target)));continue
 if filename not in cached:
  digest=hashlib.sha256(target.read_bytes()).hexdigest()
  cached[filename]=(fitz.open(target),digest)
 doc,digest=cached[filename];pg=record['page1Based']
 if not (0<pg<=len(doc)):failures.append((lid,'page outside book',pg));continue
 txt=doc[pg-1].get_text();low=' '.join(txt.lower().split());terms=record['sectionTitleTopicTerms']
 found=[x for x in terms if x in low]
 section=record['sectionLocator'];marker=bool(re.search(r'(?<![0-9])'+re.escape(section.lower())+r'(?![0-9])',low))
 passed=len(txt)>100 and bool(found) and (marker or lid in manual) and digest==original[lid]['sourcePdfSHA256']
 rec={'lessonId':lid,'file':filename,'page':pg,'pdfDigestMatches':digest==original[lid]['sourcePdfSHA256'],
      'extractableText':len(txt)>100,'topicTermsFound':found,'sectionMarkerOnPage':marker,
      'specialCase':lid in manual,'corroborationPass':passed,'qualifiedExpertSignoff':False}
 report.append(rec)
 if not passed:failures.append((lid,'section/topic/fingerprint check failed',rec))
summary={'checks':len(report),'pass':sum(x['corroborationPass'] for x in report),'failureCount':len(failures),
 'scope':'Research section/page corroboration only. No lesson-passage, formula, worked-example or expert validation.'}
if args.report:args.report.write_text(json.dumps({'summary':summary,'results':report,'failures':failures},indent=2)+'\n')
print(summary)
for fail in failures[:12]:print('FAIL:',fail,file=sys.stderr)
sys.exit(bool(failures))
