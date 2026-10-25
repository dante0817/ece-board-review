import modulesJson from './calculusModules.json';
import lessonsJson from './calculusLessons.json';
import type {LearnLesson} from '../../domain/learn/lessonTypes';
export type CalculusSubject='differential-calculus'|'integral-calculus';
export interface CalculusModule {id:string;title:string;subject:CalculusSubject;items:number;ref:string;lessonIds:string[]}
export interface CalculusDraft {id:string;moduleId:string;title:string;summary:string;concept:string;formula:string;example:{prompt:string;steps:string[];check:string};guardrail:string;status:'draft';reference:string}
export const CALCULUS_MODULES=modulesJson as CalculusModule[];
export const CALCULUS_LESSONS=lessonsJson as CalculusDraft[];
export const CALCULUS_LESSON_BY_ID:Record<string,CalculusDraft>=Object.fromEntries(CALCULUS_LESSONS.map(l=>[l.id,l]));
export const calculusTrackingId=(id:string)=>'chapter-top-calc-'+id.toLowerCase();
export const CALCULUS_READER_LESSONS:Record<string,LearnLesson>=Object.fromEntries(CALCULUS_LESSONS.map(l=>[l.id,{
  id:'calculus-'+l.id.toLowerCase(),title:l.title,summary:l.summary,contentVersion:1,status:'draft' as const,
  sections:[
    {id:l.id+'-concept',title:'Concept and method',objectiveIds:[l.id],blocks:[
      {id:l.id+'-definition',type:'definition' as const,text:l.concept},
      {id:l.id+'-formula',type:'formula' as const,latex:l.formula,description:l.guardrail},
    ]},
    {id:l.id+'-example',title:'Guided worked example',objectiveIds:[l.id],blocks:[
      {id:l.id+'-worked',type:'worked-example' as const,title:l.title,problem:l.example.prompt,strategy:'Identify the structure, apply the relevant rule, and verify the result.',steps:l.example.steps,check:l.example.check,takeaway:l.guardrail},
    ]},
    {id:l.id+'-check',title:'Further study and sources',objectiveIds:[l.id],blocks:[
      {id:l.id+'-note',type:'note' as const,text:'Editorial draft: mathematical and independent source review are still required before scored examination use.'},
      {id:l.id+'-reference',type:'paragraph' as const,text:'Suggested references for independent verification: '+l.reference+'. These are bibliographic pointers, not claims of passage-level verification.'},
    ]},
  ],
}]));
export interface CalculusPracticeQuestion{id:string;lessonId:string;moduleId:string;prompt:string;options:string[];correctIndex:number;solution:string;status:'draft';assessmentEligible:false}
const practice:CalculusPracticeQuestion[]=[
{id:'DC01-Q01',lessonId:'DC01-01',moduleId:'DC01',prompt:'Evaluate the limit of 3x² − x + 1 as x approaches 2.',options:['9','10','11','12'],correctIndex:2,solution:'Continuity permits direct substitution: 3(2²) − 2 + 1 = 11.',status:'draft',assessmentEligible:false},
{id:'DC01-Q02',lessonId:'DC01-02',moduleId:'DC01',prompt:'Find lim (x² − 9)/(x − 3) as x approaches 3.',options:['0','3','6','Undefined limit'],correctIndex:2,solution:'Factor to (x−3)(x+3). For x ≠ 3, cancel and take the limit to get 6.',status:'draft',assessmentEligible:false},
{id:'DC02-Q01',lessonId:'DC02-01',moduleId:'DC02',prompt:'Differentiate (2x² + 1)³.',options:['6(2x²+1)²','12x(2x²+1)²','4x(2x²+1)³','6x(2x²+1)²'],correctIndex:1,solution:'By the chain rule, 3(2x²+1)²·4x = 12x(2x²+1)².',status:'draft',assessmentEligible:false},
{id:'DC02-Q02',lessonId:'DC02-02',moduleId:'DC02',prompt:'For x² + y² = 25, what is dy/dx where y ≠ 0?',options:['x/y','−x/y','−y/x','2x+2y'],correctIndex:1,solution:'Implicit differentiation: 2x+2yy′=0, hence y′=−x/y.',status:'draft',assessmentEligible:false},
{id:'DC03-Q01',lessonId:'DC03-01',moduleId:'DC03',prompt:'Find the second derivative of x⁴ − 3x².',options:['4x³−6x','12x²−6','12x²−3','24x'],correctIndex:1,solution:'First derivative 4x³−6x; second derivative 12x²−6.',status:'draft',assessmentEligible:false},
{id:'DC04-Q01',lessonId:'DC04-01',moduleId:'DC04',prompt:'For x=t²+1 and y=t³, what is dy/dx at t=2?',options:['1','2','3','4'],correctIndex:2,solution:'(dy/dt)/(dx/dt) = 3t²/(2t) = 3t/2; at t=2 it is 3.',status:'draft',assessmentEligible:false},
{id:'DC05-Q01',lessonId:'DC05-01',moduleId:'DC05',prompt:'For f(x,y)=x²y+y³, calculate ∂f/∂x at (2,3).',options:['6','12','27','31'],correctIndex:1,solution:'∂f/∂x=2xy, so 2·2·3=12.',status:'draft',assessmentEligible:false},
{id:'IC01-Q01',lessonId:'IC01-01',moduleId:'IC01',prompt:'Evaluate the indefinite integral of 6x² dx.',options:['2x³+C','6x³+C','3x²+C','12x+C'],correctIndex:0,solution:'Apply the power rule: 6x³/3+C = 2x³+C.',status:'draft',assessmentEligible:false},
{id:'IC01-Q02',lessonId:'IC01-02',moduleId:'IC01',prompt:'Evaluate the definite integral of 3x² from 0 to 2.',options:['6','8','10','12'],correctIndex:1,solution:'Antiderivative x³. At 2 minus at 0: 8.',status:'draft',assessmentEligible:false},
{id:'IC02-Q01',lessonId:'IC02-01',moduleId:'IC02',prompt:'Find an antiderivative of 2x(x²+1)³.',options:['(x²+1)⁴/4+C','(x²+1)⁴+C','2(x²+1)³+C','(x²+1)³/3+C'],correctIndex:0,solution:'Let u=x²+1 so du=2x dx. Then ∫u³du=u⁴/4+C.',status:'draft',assessmentEligible:false},
{id:'IC02-Q02',lessonId:'IC02-02',moduleId:'IC02',prompt:'Integrate x·eˣ with respect to x.',options:['x·eˣ+C','(x−1)eˣ+C','(x+1)eˣ+C','eˣ/x+C'],correctIndex:1,solution:'Integration by parts, u=x and dv=eˣ dx: x·eˣ−eˣ+C.',status:'draft',assessmentEligible:false},
{id:'IC03-Q01',lessonId:'IC03-01',moduleId:'IC03',prompt:'Evaluate the improper integral from 1 to ∞ of 1/x² dx.',options:['Diverges','1/2','1','2'],correctIndex:2,solution:'Limit as b→∞ of [−1/x] from 1 to b is 1.',status:'draft',assessmentEligible:false},
{id:'IC04-Q01',lessonId:'IC04-01',moduleId:'IC04',prompt:'Find the area between y=2x and y=x² on [0,2].',options:['2/3','1','4/3','2'],correctIndex:2,solution:'Integrate 2x−x² from 0 to 2: [x²−x³/3] = 4/3.',status:'draft',assessmentEligible:false},
{id:'IC04-Q02',lessonId:'IC04-03',moduleId:'IC04',prompt:'Current i(t)=2t amperes from t=0 to 3 seconds. How much charge passes?',options:['3 C','6 C','9 C','12 C'],correctIndex:2,solution:'Q=∫₀³ 2t dt=[t²]₀³=9 coulombs.',status:'draft',assessmentEligible:false},
{id:'IC05-Q01',lessonId:'IC05-01',moduleId:'IC05',prompt:'Evaluate ∫ from 0 to 2 ∫ from 0 to 3 of (x+y) dy dx.',options:['9','12','15','18'],correctIndex:2,solution:'Inner integral 3x+9/2; outer integral [3x²/2+9x/2]₀²=15.',status:'draft',assessmentEligible:false}
];
export const CALCULUS_PRACTICE_QUESTIONS=practice;
export const CALCULUS_BOARD_EXAM_QUESTIONS:readonly CalculusPracticeQuestion[]=[];
export const CALCULUS_BOARD_EXAM_READY=false;
