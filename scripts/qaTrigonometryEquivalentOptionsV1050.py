import json,re,collections,math,csv,pathlib,sys
import sympy as sp
from sympy.parsing.sympy_parser import parse_expr,standard_transformations,implicit_multiplication_application,convert_xor
trans=standard_transformations+(implicit_multiplication_application,convert_xor)
p=pathlib.Path(__file__).resolve().parent.parent/'QA_TRIGONOMETRY_V10_50/question_review_register.csv'
assert p.exists(), 'Run npm run qa:trigonometry:v10.50 first'
Q=[]
for row in csv.DictReader(p.open(encoding='utf-8')):
 Q.append({'id':row['id'],'options':[row['optionA'],row['optionB'],row['optionC'],row['optionD']],'correctIndex':next(i for i,k in enumerate(('optionA','optionB','optionC','optionD')) if row[k]==row['correctOption']),'prompt':row['stem']})
def val(s):
 s=s.strip().replace('−','-').replace('π','pi').replace('√','sqrt').replace('²','^2').replace('³','^3').replace('⁴','^4')
 s=s.replace('×','*').replace('÷','/')
 s=re.sub(r'\s+','',s)
 s=re.sub(r'([0-9]|\))sqrt','\\1*sqrt',s)
 s=re.sub(r'sqrt(\d+)',r'sqrt(\1)',s)
 # Only scalar numeric mathematical expressions; not expressions involving variables or units
 s=re.sub(r'(rad/s|rad|Hz|m/s²|m/s|m²|cm²|cm|km|m|N|J|s|V|°)$','',s)
 if not re.fullmatch(r'[0-9a-z+*/()^.\-]+',s) or re.search(r'[a-hj-oq-z]',s.replace('sqrt','').replace('pi','')):return None
 if 'cis' in s or 'e^' in s:return None
 try:
  f=parse_expr(s, transformations=trans, local_dict={'pi':sp.pi,'sqrt':sp.sqrt},evaluate=True)
  if len(f.free_symbols):return None
  v=complex(sp.N(f,15))
  if abs(v.imag)>1e-8:return None
  return v.real
 except:return None
arr=[]; parsed=0
for q in Q:
 opts=q['options'];vs=[val(x) for x in opts];parsed+=sum(x is not None for x in vs)
 for i in range(4):
  for j in range(i+1,4):
   if vs[i] is not None and vs[j] is not None and abs(vs[i]-vs[j])<1e-7:
    arr.append((q['id'],i,j,opts[i],opts[j],q['correctIndex'],q['prompt']))
print('parsed options',parsed,'out of',len(Q)*4,'candidate equivalent options',len(arr))
for r in arr[:60]:print(r)
summary={'parsed_option_expressions':parsed,'total_options':len(Q)*4,'equivalent_numeric_option_pairs':len(arr),'note':'This partial numeric parser does not cover all symbolic expressions, domains, graphical or verbal equivalences.'}
out=p.parent/'numeric_equivalence_summary.json'
out.write_text(json.dumps(summary,indent=2)+'\n',encoding='utf-8')
if arr:sys.exit(1)
