import type { LearnLesson } from '../../domain/learn/lessonTypes';
import curriculumJson from './deCurriculum.json';

/** Source locations are TOC mappings, not passage verification or independent editorial approval. */
export type DECompetency = 'Foundation' | '3.1' | '3.2' | '3.3';
export interface DESyllabusEntry {
  id:string; moduleId:string; title:string; runtimeLessonId:string;
  tos:string; relationship:string; objective:string;
  primary_supporting_sources:string; formula:string;
  validation_requirements:string; proposedTrackingId:string;
}
export const DE_SYLLABUS:readonly DESyllabusEntry[]=curriculumJson as DESyllabusEntry[];
export const DE_MODULES=[
  {id:'DE01',title:'Fundamentals of Differential Equations',tos:'Foundation'},
  {id:'DE02',title:'First-Order Methods I',tos:'3.1'},
  {id:'DE03',title:'First-Order Methods II & Applications',tos:'3.1'},
  {id:'DE04',title:'Higher-Order Homogeneous ODEs',tos:'3.2'},
  {id:'DE05',title:'Higher-Order Nonhomogeneous ODEs & Applications',tos:'3.2'},
  {id:'DE06',title:'Laplace Transforms & Inverses',tos:'3.3'},
  {id:'DE07',title:'Laplace Applications',tos:'3.3'},
] as const;
export const DE_PILOT_IDS=['de02-02','de04-02','de06-02'] as const;
export const DE_TOS_BLUEPRINT={
  version:'PRC EE TOS Resolution No. 10 (2022) · DE subsection 3.0',
  cells:[
    {tos:'3.1',knowledge:1,comprehension:1,application:4,analysis:0,total:6},
    {tos:'3.2',knowledge:0,comprehension:1,application:2,analysis:1,total:4},
    {tos:'3.3',knowledge:0,comprehension:0,application:4,analysis:1,total:5},
  ],
} as const;

const draft=(id:string,summary:string,sections:LearnLesson['sections']):LearnLesson=>({id,title:DE_SYLLABUS.find(x=>x.runtimeLessonId===id)!.title,summary,contentVersion:1,status:'draft',sections});
/** Three ORIGINAL pilot lessons. Research TOC mappings only; content awaits independent subject review. */
export const DE_PILOT_LESSONS:Readonly<Record<string,LearnLesson>>={
  'de02-02':draft('de02-02','Solve a separable first-order initial-value problem, including domain and a substitution check.',[
    {id:'de02-02-s1',title:'Recognize & separate',objectiveIds:['de02-02'],blocks:[
      {id:'de02-02-def',type:'definition',text:'An equation $y\u0027=f(x)g(y)$ is separable when its variables can be separated before integration. Inspect zero-factor solutions before dividing by $g(y)$.'},
      {id:'de02-02-formula',type:'formula',latex:String.raw`\int\frac{1}{g(y)}\,dy=\int f(x)\,dx+C`,description:'Valid on intervals where g(y) does not vanish; check omitted constant solutions separately.'},
      {id:'de02-02-caution',type:'note',text:'The substitution $\\ln|y|$ requires $y\\ne0$. If $g(y)=y$, the equilibrium solution $y=0$ must be checked separately. An initial condition fixes the integration constant.'},
    ]},
    {id:'de02-02-s2',title:'Worked initial-value example',objectiveIds:['de02-02'],blocks:[
      {id:'de02-02-example',type:'worked-example',title:'First-order separation',problem:'Solve $y\u0027=2xy$ with $y(0)=3$.',strategy:'Check the zero solution, separate variables for the nonzero branch, then apply the initial condition.',steps:[
        'The constant solution $y=0$ satisfies the equation, but not $y(0)=3$. For the nonzero branch, divide by $y$: $dy/y=2x\\,dx$.',
        'Integrate: $\\ln|y|=x^2+C$. Hence $y=Ae^{x^2}$ for nonzero constant $A$.',
        'Apply $y(0)=3$: $A=3$, so $y(x)=3e^{x^2}$ for all real $x$.',
      ],check:'Differentiate: $y\u0027=6xe^{x^2}=2x(3e^{x^2})=2xy$; and $y(0)=3$.',takeaway:'Method recognition, nonzero-branch assumptions, initial condition, and substitution check must all be explicit.'},
    ]},
    {id:'de02-02-s3',title:'Independent checkpoint & source',objectiveIds:['de02-02'],blocks:[
      {id:'de02-02-check',type:'checkpoint',prompt:'Solve $y\u0027=xy$ with $y(0)=2$.',answer:'$y(x)=2e^{x^2/2}$ for real $x$.',explanation:'Integrating $dy/y=x\\,dx$ yields $y=Ae^{x^2/2}$ and $A=2$. Verify by differentiating.'},
      {id:'de02-02-ref',type:'note',text:'Research TOC locators: Zill–Wright–Cullen (8e) §2.2; Edwards–Penney (6e) §1.4. Specific passage and example review are pending. This is an ungraded editorial draft.'},
    ]},
  ]),
  'de04-02':draft('de04-02','Solve constant-coefficient homogeneous equations using distinct real characteristic roots.',[
    {id:'de04-02-s1',title:'Recognize the characteristic equation',objectiveIds:['de04-02'],blocks:[
      {id:'de04-02-def',type:'definition',text:'For constant-coefficient linear homogeneous ODEs, trying $y=e^{rx}$ converts the differential equation into a polynomial equation for $r$.'},
      {id:'de04-02-formula',type:'formula',latex:String.raw`ay''+by'+cy=0\;\Longrightarrow\;ar^2+br+c=0`,description:'For two distinct real roots r₁ and r₂, the general solution is a linear combination of independent exponentials.'},
      {id:'de04-02-sol',type:'formula',latex:String.raw`y(x)=C_1e^{r_1x}+C_2e^{r_2x}\qquad(r_1\ne r_2)`,description:'Requires a constant-coefficient homogeneous equation with two distinct real characteristic roots.'},
    ]},
    {id:'de04-02-s2',title:'Worked characteristic-root example',objectiveIds:['de04-02'],blocks:[
      {id:'de04-02-example',type:'worked-example',title:'Two distinct real roots',problem:"Find the general solution to $y\u0027\u0027-3y\u0027+2y=0$.",strategy:'Form the characteristic polynomial, factor it, and verify each exponential basis solution.',steps:[
        'Assume $y=e^{rx}$. The characteristic equation is $r^2-3r+2=0$.',
        'Factor $(r-1)(r-2)=0$, giving distinct roots $r_1=1$ and $r_2=2$.',
        'Therefore $y=C_1e^x+C_2e^{2x}$, with arbitrary constants $C_1,C_2$.',
      ],check:'Substitution for $e^x$ gives $(1-3+2)e^x=0$ and for $e^{2x}$ gives $(4-6+2)e^{2x}=0$. Distinct exponentials are independent.',takeaway:'Repeated and complex roots require different solution forms; they will be covered in later lessons.'},
    ]},
    {id:'de04-02-s3',title:'Independent checkpoint & source',objectiveIds:['de04-02'],blocks:[
      {id:'de04-02-check',type:'checkpoint',prompt:"Solve $y\u0027\u0027-5y\u0027+6y=0$.",answer:'$y=C_1e^{2x}+C_2e^{3x}$.',explanation:'Characteristic polynomial $(r-2)(r-3)=0$ has two distinct real roots. Each exponential has zero residual.'},
      {id:'de04-02-ref',type:'note',text:'Research TOC locators: Zill–Wright–Cullen (8e) §4.3; Boyce–DiPrima (10e) §3.1. Passage-level review and independent editorial signoff pending.'},
    ]},
  ]),
  'de06-02':draft('de06-02','Apply linearity and the most common direct Laplace-transform pairs.',[
    {id:'de06-02-s1',title:'Direct transforms and convergence',objectiveIds:['de06-02'],blocks:[
      {id:'de06-02-def',type:'definition',text:'The one-sided Laplace transform is $\\mathcal{L}\\{f(t)\\}(s)=\\int_0^\\infty e^{-st}f(t)\\,dt$, provided the integral converges. Linearity lets us transform each sum term separately.'},
      {id:'de06-02-formula',type:'formula',latex:String.raw`\mathcal L\{t^n\}=\frac{n!}{s^{n+1}},\quad \mathcal L\{e^{at}\}=\frac{1}{s-a}`,description:'n is a nonnegative integer. For real parameters, the first pair requires s>0 and the exponential pair requires s>a.'},
      {id:'de06-02-lin',type:'formula',latex:String.raw`\mathcal L\{af+bg\}=a\mathcal L\{f\}+b\mathcal L\{g\}`,description:'Valid when the constituent transforms converge on a common region.'},
    ]},
    {id:'de06-02-s2',title:'Worked transform example',objectiveIds:['de06-02'],blocks:[
      {id:'de06-02-example',type:'worked-example',title:'Polynomial plus exponential',problem:'Find $\\mathcal{L}\\{2+3t+e^{-2t}\\}(s)$.',strategy:'Use transform-table pairs on each term and take the intersection of their convergence regions.',steps:[
        'By linearity, transform $2$, $3t$, and $e^{-2t}$ separately.',
        '$\\mathcal L\\{2\\}=2/s$, $\\mathcal L\\{3t\\}=3/s^2$, and $\\mathcal L\\{e^{-2t}\\}=1/(s+2)$.',
        'Add the terms: $F(s)=2/s+3/s^2+1/(s+2)$. The common real convergence condition is $s>0$.',
      ],check:'The inverse of each term recovers $2$, $3t$, and $e^{-2t}$. Check the common region $s>0$ against all three.',takeaway:'Do not use transform pairs outside their convergence assumptions.'},
    ]},
    {id:'de06-02-s3',title:'Independent checkpoint & source',objectiveIds:['de06-02'],blocks:[
      {id:'de06-02-check',type:'checkpoint',prompt:'Find the transform of $t^2+2e^{t}$ and state its real convergence condition.',answer:'$F(s)=2/s^3+2/(s-1)$, valid for $s>1$.',explanation:'Use $2!/s^3$ and $2/(s-1)$; the common region is the intersection of $s>0$ and $s>1$.'},
      {id:'de06-02-ref',type:'note',text:'Research TOC locators: Zill–Wright–Cullen (8e) §7.1; Edwards–Penney (6e) §4.1. Passage-level review and independent editorial signoff pending.'},
    ]},
  ]),
};
export const DE_PILOT_COUNT=Object.keys(DE_PILOT_LESSONS).length;
/** No independent expert-approved DE questions exist in this pilot; exams stay disabled. */
export const DE_APPROVED_EXAM_QUESTION_IDS:readonly string[]=[];
export const DE_EXAM_READY=false;
