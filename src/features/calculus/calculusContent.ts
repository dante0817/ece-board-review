import type {LearnLesson} from '../../domain/learn/lessonTypes';

/** Original editorial draft lessons. Research bibliography is a locator, not permission to copy passages. */
export type CalculusSubject='differential'|'integral';
export interface CalculusModule {
 id:string;subject:CalculusSubject;title:string;tos:string;items:number;topics:string[];sources:string[];
}
export const CALCULUS_MODULES:CalculusModule[]=[
  {
    "id": "DC01",
    "subject": "differential",
    "title": "Functions, Continuity and Limits",
    "tos": "1.1",
    "items": 2,
    "topics": [
      "Function domains and graphs",
      "Algebraic and one-sided limits",
      "Continuity and removable discontinuities"
    ],
    "sources": [
      "Thomas 12e Ch. 2",
      "Larson 10e Ch. 1",
      "Passow Ch. 2"
    ]
  },
  {
    "id": "DC02",
    "subject": "differential",
    "title": "Derivatives and Applications",
    "tos": "1.2",
    "items": 3,
    "topics": [
      "Derivative rules",
      "Chain and implicit differentiation",
      "Related rates and optimization"
    ],
    "sources": [
      "Thomas 12e Chs. 3-4",
      "Larson 10e Chs. 2-3",
      "Banner Chs. 4-13"
    ]
  },
  {
    "id": "DC03",
    "subject": "differential",
    "title": "Higher-Order Derivatives",
    "tos": "1.3",
    "items": 3,
    "topics": [
      "Successive differentiation",
      "Velocity, acceleration and concavity",
      "Higher-order implicit differentiation"
    ],
    "sources": [
      "Thomas 12e Chs. 3-4",
      "Stewart Calculus 8e Ch. 3"
    ]
  },
  {
    "id": "DC04",
    "subject": "differential",
    "title": "Parametric Equations",
    "tos": "1.4",
    "items": 4,
    "topics": [
      "Parametric curves and tangent lines",
      "First and second parametric derivatives",
      "Parametric motion"
    ],
    "sources": [
      "Stewart Calculus 8e Ch. 10",
      "Larson 10e Ch. 10",
      "Banner Ch. 27"
    ]
  },
  {
    "id": "DC05",
    "subject": "differential",
    "title": "Partial Differentiation",
    "tos": "1.5",
    "items": 3,
    "topics": [
      "First and higher partial derivatives",
      "Multivariable chain rule and total differential",
      "Optimization and applications"
    ],
    "sources": [
      "Thomas 12e Ch. 14",
      "Stewart Calculus 8e Ch. 14"
    ]
  },
  {
    "id": "IC01",
    "subject": "integral",
    "title": "Integration Concepts and Formulas",
    "tos": "2.1",
    "items": 2,
    "topics": [
      "Antiderivatives and integration constants",
      "Definite integrals and Riemann sums",
      "Fundamental Theorem of Calculus"
    ],
    "sources": [
      "Thomas 12e Ch. 5",
      "Larson 10e Ch. 4",
      "Passow Ch. 4"
    ]
  },
  {
    "id": "IC02",
    "subject": "integral",
    "title": "Integration Techniques",
    "tos": "2.2",
    "items": 4,
    "topics": [
      "Substitution",
      "Integration by parts",
      "Trigonometric methods and partial fractions"
    ],
    "sources": [
      "Larson 10e Ch. 8",
      "Rohde Introduction to Integral Calculus",
      "Schaum's Calculus 5e"
    ]
  },
  {
    "id": "IC03",
    "subject": "integral",
    "title": "Improper Integrals",
    "tos": "2.3",
    "items": 3,
    "topics": [
      "Infinite intervals",
      "Singular integrands",
      "Convergence and divergence"
    ],
    "sources": [
      "Thomas 12e Ch. 8",
      "Stewart Calculus 8e Ch. 7"
    ]
  },
  {
    "id": "IC04",
    "subject": "integral",
    "title": "Applications of Integration",
    "tos": "2.4",
    "items": 4,
    "topics": [
      "Areas between curves",
      "Volumes by disk, washer and shell",
      "Arc length, work and average value"
    ],
    "sources": [
      "Larson 10e Chs. 6-7",
      "Thomas 12e Ch. 6",
      "Don and Don"
    ]
  },
  {
    "id": "IC05",
    "subject": "integral",
    "title": "Multiple Integration and Applications",
    "tos": "2.5",
    "items": 2,
    "topics": [
      "Double integrals and iterated bounds",
      "Triple integrals",
      "Polar coordinates and Jacobians"
    ],
    "sources": [
      "Thomas 12e Ch. 15",
      "Stewart Calculus 8e Ch. 15",
      "Swokowski 5e Ch. 17"
    ]
  }
];
export const CALCULUS_BLUEPRINT={
 version:'PRC EE Mathematics TOS, Resolution No. 10 (2022), subject areas 1 and 2',
 differential:{knowledge:1,comprehension:3,application:8,analysis:3,total:15},
 integral:{knowledge:2,comprehension:4,application:6,analysis:3,total:15},
} as const;
interface RawLesson {id:string;title:string;summary:string;definition:string;formula:string;condition:string;problem:string;strategy:string;steps:string[];check:string;checkpoint:string;answer:string;explanation:string;}
const raw:RawLesson[]=[
  {
    "id": "dc01-01",
    "title": "Direct limits and continuity",
    "summary": "Evaluate limits using the laws of limits and inspect function domains.",
    "definition": "For a function continuous at a, its limit as x approaches a equals the function value at a.",
    "formula": "\\lim_{x\\to a}f(x)=f(a)",
    "condition": "Apply direct substitution only when continuity at a has been established.",
    "problem": "Find lim as x→2 of (3x²+1).",
    "strategy": "Polynomials are continuous on the real numbers.",
    "steps": [
      "Substitute x=2 because the polynomial is continuous.",
      "Compute 3(2²)+1=13."
    ],
    "check": "Nearby values approach 13 from either side.",
    "checkpoint": "Evaluate lim as x→3 of (2x+5).",
    "answer": "11",
    "explanation": "Substitution gives 2·3+5=11."
  },
  {
    "id": "dc01-02",
    "title": "Removable discontinuities",
    "summary": "Simplify factorable expressions without losing restrictions on the original function.",
    "definition": "Cancel a common factor only for x values where the factor is nonzero; the simplified expression may determine the original limit.",
    "formula": "\\lim_{x\\to a}\\frac{x^2-a^2}{x-a}=2a",
    "condition": "The original expression is undefined at x=a, but its limit may exist.",
    "problem": "Find lim as x→4 of (x²−16)/(x−4).",
    "strategy": "Factor before substituting.",
    "steps": [
      "Factor the numerator as (x−4)(x+4).",
      "For x≠4, cancel x−4.",
      "The limit of x+4 as x→4 is 8."
    ],
    "check": "The one-sided limits both equal 8.",
    "checkpoint": "Find lim as x→5 of (x²−25)/(x−5).",
    "answer": "10",
    "explanation": "The quotient equals x+5 away from x=5, hence its limit is 10."
  },
  {
    "id": "dc02-01",
    "title": "Derivative rules",
    "summary": "Differentiate polynomial combinations using linearity and the power rule.",
    "definition": "The derivative measures instantaneous rate of change. Differentiate each polynomial term separately.",
    "formula": "\\frac{d}{dx}(a x^n)=anx^{n-1}",
    "condition": "Use the power rule for real exponents on intervals where the expression is differentiable.",
    "problem": "Differentiate f(x)=3x³−2x+4.",
    "strategy": "Apply the power rule term by term.",
    "steps": [
      "d(3x³)/dx=9x².",
      "d(−2x)/dx=−2.",
      "The constant differentiates to zero; f'(x)=9x²−2."
    ],
    "check": "Differentiate 9x²−2 again to obtain 18x.",
    "checkpoint": "Differentiate 5x²−7x+1.",
    "answer": "10x−7",
    "explanation": "The derivative of 5x² is 10x; derivative of −7x is −7."
  },
  {
    "id": "dc02-02",
    "title": "The chain rule and composite functions",
    "summary": "Recognize nested functions and apply the inner derivative.",
    "definition": "For f(g(x)), differentiate the outer expression and multiply by g'(x).",
    "formula": "\\frac{d}{dx}f(g(x))=f'(g(x))g'(x)",
    "condition": "Check differentiability of both parts at the evaluated point.",
    "problem": "Differentiate (x²+3)⁴.",
    "strategy": "Choose u=x²+3, then apply the outer power rule.",
    "steps": [
      "The derivative with respect to u is 4u³.",
      "du/dx=2x.",
      "Multiply to obtain 8x(x²+3)³."
    ],
    "check": "Differentiate the expanded expression for a separate check.",
    "checkpoint": "Differentiate (3x+1)⁵.",
    "answer": "15(3x+1)⁴",
    "explanation": "Outer derivative is 5(3x+1)⁴; inner derivative is 3."
  },
  {
    "id": "dc03-01",
    "title": "Successive derivatives",
    "summary": "Compute second and higher derivatives in a consistent sequence.",
    "definition": "The second derivative is the derivative of the first derivative.",
    "formula": "f''(x)=\\frac{d}{dx}\\left(f'(x)\\right)",
    "condition": "Higher derivatives require sufficient smoothness on the interval of interest.",
    "problem": "Find the second derivative of f(x)=2x⁴+3x².",
    "strategy": "Differentiate twice.",
    "steps": [
      "f'(x)=8x³+6x.",
      "f''(x)=24x²+6."
    ],
    "check": "At x=0, f''=6.",
    "checkpoint": "Find the second derivative of x³+4x².",
    "answer": "6x+8",
    "explanation": "The first derivative is 3x²+8x."
  },
  {
    "id": "dc03-02",
    "title": "Velocity and acceleration",
    "summary": "Interpret derivatives of position and use consistent units.",
    "definition": "The first derivative of position is velocity and the second is acceleration.",
    "formula": "v(t)=s'(t),\\qquad a(t)=s''(t)",
    "condition": "Time and position units determine the units of velocity and acceleration.",
    "problem": "Given s(t)=4t²+3t meters, find acceleration.",
    "strategy": "Differentiate position twice with respect to time.",
    "steps": [
      "v(t)=8t+3 m/s.",
      "a(t)=8 m/s²."
    ],
    "check": "Acceleration is constant, as expected for a quadratic position function.",
    "checkpoint": "For s(t)=5t²+2t, find acceleration.",
    "answer": "10",
    "explanation": "Twice differentiating gives 10 in distance/time² units."
  },
  {
    "id": "dc04-01",
    "title": "Parametric tangent slopes",
    "summary": "Find dy/dx from a parameterization without necessarily eliminating the parameter.",
    "definition": "Provided dx/dt≠0, dy/dx is the ratio of the parameter derivatives.",
    "formula": "\\frac{dy}{dx}=\\frac{dy/dt}{dx/dt}",
    "condition": "If dx/dt=0, examine the geometry separately; do not divide by zero.",
    "problem": "x=t², y=t³; find dy/dx at t=2.",
    "strategy": "Differentiate both coordinates with respect to t.",
    "steps": [
      "dx/dt=2t and dy/dt=3t².",
      "For t≠0, dy/dx=3t/2.",
      "At t=2, the slope is 3."
    ],
    "check": "At t=2, the point is (4,8); implicit y=x^(3/2) gives slope 3.",
    "checkpoint": "x=t², y=2t³; find dy/dx at t=1.",
    "answer": "3",
    "explanation": "The derivative ratio is (6t²)/(2t)=3t for t≠0."
  },
  {
    "id": "dc04-02",
    "title": "Second parametric derivative",
    "summary": "Differentiate a parametric slope again with respect to the underlying x coordinate.",
    "definition": "Divide the parameter derivative of dy/dx by dx/dt.",
    "formula": "\\frac{d^2y}{dx^2}=\\frac{d}{dt}(dy/dx)\\big/\\frac{dx}{dt}",
    "condition": "Requires dx/dt≠0 and differentiability of the slope on the parameter interval.",
    "problem": "x=t, y=t³; find d²y/dx² at t=2.",
    "strategy": "Compute first derivative and divide its t-derivative by dx/dt.",
    "steps": [
      "dy/dx=3t²/1=3t².",
      "d/dt(3t²)=6t and dx/dt=1.",
      "At t=2, d²y/dx²=12."
    ],
    "check": "Since x=t, y=x³; differentiating twice gives 6x=12 at x=2.",
    "checkpoint": "x=t, y=t⁴; find d²y/dx² at t=1.",
    "answer": "12",
    "explanation": "The second derivative of x⁴ is 12x²."
  },
  {
    "id": "dc05-01",
    "title": "Partial derivatives",
    "summary": "Hold other independent variables constant when differentiating with respect to one variable.",
    "definition": "For f(x,y), ∂f/∂x treats y as constant while ∂f/∂y treats x as constant.",
    "formula": "f_x=\\frac{\\partial f}{\\partial x},\\qquad f_y=\\frac{\\partial f}{\\partial y}",
    "condition": "Assume x and y are independent coordinates unless a relationship is specified.",
    "problem": "Find ∂f/∂x and ∂f/∂y for f=3x²y+y³.",
    "strategy": "Differentiate independently with respect to each coordinate.",
    "steps": [
      "f_x=6xy.",
      "f_y=3x²+3y²."
    ],
    "check": "Cross-differentiating gives f_xy=f_yx=6x.",
    "checkpoint": "Find ∂/∂x of 4x²y at (1,2).",
    "answer": "16",
    "explanation": "∂/∂x=8xy, and 8·1·2=16."
  },
  {
    "id": "dc05-02",
    "title": "Total differentials and chain rule",
    "summary": "Approximate small changes in a multivariable output.",
    "definition": "The first-order total differential uses each partial derivative and its input differential.",
    "formula": "dz=f_x\\,dx+f_y\\,dy",
    "condition": "This is a first-order approximation when partial derivatives are continuous near the point.",
    "problem": "If z=x²+y², estimate dz for x=1,y=2,dx=.1,dy=.2.",
    "strategy": "Apply the partial derivatives at the base point.",
    "steps": [
      "f_x=2x=2 and f_y=2y=4.",
      "dz≈2(0.1)+4(0.2)=1."
    ],
    "check": "The exact finite change is 1.05; the first-order approximation is 1.",
    "checkpoint": "At x=1,y=1, dx=0.1,dy=0.2, estimate dz for z=x²+y².",
    "answer": "0.6",
    "explanation": "dz=2(1)(0.1)+2(1)(0.2)=0.6."
  },
  {
    "id": "ic01-01",
    "title": "Antiderivatives and constants",
    "summary": "Understand why indefinite integrals represent a family of functions.",
    "definition": "An indefinite integral contains an arbitrary constant because differentiation removes constants.",
    "formula": "\\int x^n dx=\\frac{x^{n+1}}{n+1}+C,\\quad n\\ne-1",
    "condition": "The displayed power rule excludes n=−1; use ln|x|+C for 1/x on intervals excluding 0.",
    "problem": "Find ∫3x² dx.",
    "strategy": "Increase the exponent, then divide by the new exponent.",
    "steps": [
      "∫3x² dx=x³+C."
    ],
    "check": "Differentiate x³+C to recover 3x².",
    "checkpoint": "Find ∫4x³ dx.",
    "answer": "x⁴+C",
    "explanation": "Increase 3 to 4 and divide 4x⁴ by 4."
  },
  {
    "id": "ic01-02",
    "title": "Definite integrals and the FTC",
    "summary": "Evaluate a definite integral by an antiderivative.",
    "definition": "For continuous f, the Fundamental Theorem of Calculus relates definite integration to endpoint differences.",
    "formula": "\\int_a^b f(x)\\,dx=F(b)-F(a)\\quad(F'=f)",
    "condition": "The integrand must be integrable, and the antiderivative must be valid on the interval.",
    "problem": "Find ∫₀² 3x² dx.",
    "strategy": "Find F=x³ and evaluate at both endpoints.",
    "steps": [
      "F(2)−F(0)=8−0=8."
    ],
    "check": "The signed integral is nonnegative because f≥0 on [0,2].",
    "checkpoint": "Compute ∫₀³ 2x dx.",
    "answer": "9",
    "explanation": "An antiderivative is x²; evaluate 3²−0."
  },
  {
    "id": "ic02-01",
    "title": "Substitution",
    "summary": "Identify compositions whose inner derivative appears in the integrand.",
    "definition": "Substitution reverses the chain rule: choose u as the inner expression.",
    "formula": "\\int f(g(x))g'(x)\\,dx=\\int f(u)\\,du,\\quad u=g(x)",
    "condition": "For definite integrals transform the integration bounds along with the variable.",
    "problem": "Find ∫2x(x²+1)³ dx.",
    "strategy": "Set u=x²+1 and du=2x dx.",
    "steps": [
      "The integral becomes ∫u³ du=u⁴/4+C.",
      "Substitute back: (x²+1)⁴/4+C."
    ],
    "check": "Differentiate the result to obtain 2x(x²+1)³.",
    "checkpoint": "Find ∫2x(x²+3)² dx.",
    "answer": "(x²+3)³/3+C",
    "explanation": "Take u=x²+3, du=2x dx."
  },
  {
    "id": "ic02-02",
    "title": "Integration by parts",
    "summary": "Choose factors for integration by parts and verify the result.",
    "definition": "Integration by parts follows from the product rule.",
    "formula": "\\int u\\,dv=uv-\\int v\\,du",
    "condition": "Choose u and dv so the remaining integral is simpler.",
    "problem": "Compute ∫x e^x dx.",
    "strategy": "Set u=x, dv=e^x dx.",
    "steps": [
      "du=dx, v=e^x.",
      "∫x e^x dx=x e^x−∫e^x dx.",
      "The result is e^x(x−1)+C."
    ],
    "check": "Differentiation gives x e^x.",
    "checkpoint": "Find ∫x cos x dx.",
    "answer": "x sin x+cos x+C",
    "explanation": "Take u=x, dv=cos x dx and v=sin x."
  },
  {
    "id": "ic03-01",
    "title": "Improper integrals over infinite intervals",
    "summary": "Define an improper integral by a limit before evaluating.",
    "definition": "Integrating to infinity means taking a finite-bound integral and then a limit.",
    "formula": "\\int_a^\\infty f(x)\\,dx=\\lim_{b\\to\\infty}\\int_a^b f(x)\\,dx",
    "condition": "An improper integral converges only if the defining limit exists and is finite.",
    "problem": "Evaluate ∫₁∞ 1/x² dx.",
    "strategy": "Integrate to a finite endpoint b, then take b→∞.",
    "steps": [
      "∫₁ᵇ x⁻² dx=[−1/x]₁ᵇ=1−1/b.",
      "As b→∞, this tends to 1."
    ],
    "check": "The p-test converges here because p=2>1.",
    "checkpoint": "Evaluate ∫₂∞ 1/x² dx.",
    "answer": "1/2",
    "explanation": "Compute lim_{b→∞}(1/2−1/b)=1/2."
  },
  {
    "id": "ic03-02",
    "title": "Improper integrals near singularities",
    "summary": "Split integrals at problematic endpoints and test convergence.",
    "definition": "An integrand that diverges at an endpoint requires a one-sided limit.",
    "formula": "\\int_0^1 x^{-p}\\,dx=\\frac1{1-p}\\;\\;(p<1)",
    "condition": "For p≥1 the integral diverges; at p=1 the logarithm diverges.",
    "problem": "Evaluate ∫₀¹ 1/√x dx.",
    "strategy": "Rewrite the integrand as x^(−1/2).",
    "steps": [
      "An antiderivative is 2√x.",
      "Evaluate lim_{a→0+}[2√x]ₐ¹=2."
    ],
    "check": "Because p=1/2<1, the integral converges.",
    "checkpoint": "Does ∫₀¹ 1/x dx converge?",
    "answer": "No, it diverges.",
    "explanation": "The lower-limit logarithm tends to −infinity."
  },
  {
    "id": "ic04-01",
    "title": "Areas between curves",
    "summary": "Find area from the difference of top and bottom functions.",
    "definition": "Where f≥g on [a,b], the area is the integral of f−g.",
    "formula": "A=\\int_a^b\\big(f(x)-g(x)\\big)\\,dx",
    "condition": "If curves cross, split the interval so the integrand is nonnegative on each piece.",
    "problem": "Find the area between y=x and y=x² for 0≤x≤1.",
    "strategy": "The line is above the parabola on this interval.",
    "steps": [
      "A=∫₀¹(x−x²)dx.",
      "Evaluate [x²/2−x³/3]₀¹=1/2−1/3=1/6."
    ],
    "check": "The area is positive and less than the unit square.",
    "checkpoint": "Find the area under y=2x on [0,2].",
    "answer": "4",
    "explanation": "Integrate 2x to x² and evaluate at 2."
  },
  {
    "id": "ic04-02",
    "title": "Volumes of revolution",
    "summary": "Select disk or washer methods from cross-sectional geometry.",
    "definition": "A disk perpendicular to the x-axis has area πR(x)².",
    "formula": "V=\\pi\\int_a^b R(x)^2\\,dx",
    "condition": "The region, axis and outer/inner radii must be specified; washers subtract the inner radius squared.",
    "problem": "Rotate the region under y=x on 0≤x≤1 about the x-axis.",
    "strategy": "Disk radius R(x)=x.",
    "steps": [
      "V=π∫₀¹x² dx.",
      "Therefore V=π/3."
    ],
    "check": "Cone formula V=πr²h/3 with r=h=1 agrees.",
    "checkpoint": "Volume under y=2x, 0≤x≤1, rotated about x-axis?",
    "answer": "4π/3",
    "explanation": "Use π∫₀¹(2x)²dx=4π/3."
  },
  {
    "id": "ic05-01",
    "title": "Double integrals over rectangles",
    "summary": "Evaluate iterated integrals one variable at a time.",
    "definition": "Fubini's theorem permits iterated integration for continuous functions on rectangles.",
    "formula": "\\iint_R f(x,y)\\,dA=\\int_a^b\\int_c^d f(x,y)\\,dy\\,dx",
    "condition": "The stated form assumes R=[a,b]×[c,d] and appropriate integrability.",
    "problem": "Find ∫₀¹∫₀² x dy dx.",
    "strategy": "Integrate in y while treating x as constant.",
    "steps": [
      "Inner integral ∫₀²x dy=2x.",
      "Outer integral ∫₀¹2x dx=1."
    ],
    "check": "Reversing the order over the same rectangle gives the same value.",
    "checkpoint": "Evaluate ∫₀¹∫₀¹ 4 dx dy.",
    "answer": "4",
    "explanation": "The integrand is constant 4 over a unit-square area."
  },
  {
    "id": "ic05-02",
    "title": "Polar change of variables",
    "summary": "Use r and theta for circular domains and include the Jacobian.",
    "definition": "Area elements transform as dA=r dr dθ in polar coordinates.",
    "formula": "dA=r\\,dr\\,d\\theta",
    "condition": "The factor r is required; bounds must describe the region without unintended overlap.",
    "problem": "Find the area of the disk x²+y²≤9 by double integration.",
    "strategy": "Use 0≤r≤3 and 0≤θ≤2π.",
    "steps": [
      "A=∫₀²π∫₀³r dr dθ.",
      "Inner integral =9/2; multiply by 2π to obtain 9π."
    ],
    "check": "The result matches the circle formula πr².",
    "checkpoint": "Find the area of x²+y²≤4.",
    "answer": "4π",
    "explanation": "The disk radius is 2 and its area is π·2²."
  }
];
export const CALCULUS_LESSONS:Record<string,LearnLesson>=Object.fromEntries(raw.map(p=>{
 const sectionId=p.id;
 const lesson:LearnLesson={id:p.id,title:p.title,summary:p.summary,contentVersion:1,status:'draft',sections:[
  {id:sectionId+'-concept',title:'Meaning and method',objectiveIds:[p.id],blocks:[
   {id:sectionId+'-definition',type:'definition',text:p.definition},
   {id:sectionId+'-formula',type:'formula',latex:p.formula,description:p.condition},
   {id:sectionId+'-condition',type:'note',text:'Conditions: '+p.condition},
  ]},
  {id:sectionId+'-example',title:'Original worked example',objectiveIds:[p.id],blocks:[
   {id:sectionId+'-worked',type:'worked-example',title:p.title,problem:p.problem,strategy:p.strategy,steps:p.steps,check:p.check,takeaway:'Check assumptions and verify the final result.'},
  ]},
  {id:sectionId+'-practice',title:'Independent checkpoint',objectiveIds:[p.id],blocks:[
   {id:sectionId+'-checkpoint',type:'checkpoint',prompt:p.checkpoint,answer:p.answer,explanation:p.explanation},
   {id:sectionId+'-sources',type:'note',text:'Original editorial draft. Suggested research references: '+(CALCULUS_MODULES.find(m=>m.id.toLowerCase()===p.id.slice(0,4))?.sources.join('; ')??'standard calculus references')+'. No external text or restricted instructor solutions are embedded. This is not an approved PRC examination question.'},
  ]}
 ]}; return [p.id,lesson] as const;
}));
export const CALCULUS_LESSON_COUNT=Object.keys(CALCULUS_LESSONS).length;
