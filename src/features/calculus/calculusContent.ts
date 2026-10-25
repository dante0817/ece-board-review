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
  },
  {
    "id": "dc01-03",
    "title": "Fundamental trigonometric limits",
    "summary": "Use the key sine limit with angle arguments in radians.",
    "definition": "The ratio sin(u)/u approaches one as u approaches zero, with u measured in radians.",
    "formula": "\\lim_{u\\to0}\\frac{\\sin u}{u}=1",
    "condition": "This fundamental limit uses radian measure; extract constants correctly.",
    "problem": "Find lim(x→0) sin(3x)/(2x).",
    "strategy": "Rewrite as (3/2)[sin(3x)/(3x)].",
    "steps": [
      "Multiply and divide to obtain (3/2)·sin(3x)/(3x).",
      "The inner ratio tends to one, giving 3/2."
    ],
    "check": "For sufficiently small positive x, numerical values approach 1.5.",
    "checkpoint": "Find lim(x→0) sin(5x)/x.",
    "answer": "5",
    "explanation": "Rewrite as 5·sin(5x)/(5x), then use the fundamental limit."
  },
  {
    "id": "dc01-04",
    "title": "One-sided limits and jump discontinuities",
    "summary": "Test right and left approaches separately at a piecewise boundary.",
    "definition": "The two-sided limit exists at a if and only if both one-sided limits exist and agree.",
    "formula": "\\lim_{x\\to a}f(x)\\ \\text{exists}\\iff\\lim_{x\\to a^-}f(x)=\\lim_{x\\to a^+}f(x)",
    "condition": "The actual function value f(a) may differ from the limit.",
    "problem": "Let f(x)=x+1 for x<0, and f(x)=x²+2 for x≥0. Determine lim(x→0) f(x).",
    "strategy": "Compute each side using the expression valid on that side.",
    "steps": [
      "Approaching from the left gives 0+1=1.",
      "Approaching from the right gives 0²+2=2.",
      "The two-sided limit does not exist because 1≠2."
    ],
    "check": "The function value f(0)=2 does not repair the mismatched limits.",
    "checkpoint": "If the left limit is 3 and the right limit is 4, does the two-sided limit exist?",
    "answer": "No",
    "explanation": "Both one-sided limits must be equal."
  },
  {
    "id": "dc01-05",
    "title": "Limits at infinity",
    "summary": "Compare leading powers to determine horizontal asymptotes of rational functions.",
    "definition": "For equal-degree polynomials, the ratio tends to the quotient of leading coefficients as x grows in magnitude.",
    "formula": "\\lim_{x\\to\\infty}\\frac{ax^n+\\cdots}{bx^n+\\cdots}=\\frac ab,\\quad b\\ne0",
    "condition": "This leading-coefficient rule assumes equal highest degrees and a nonzero denominator leading coefficient.",
    "problem": "Compute lim(x→∞) (3x²+1)/(x²+2).",
    "strategy": "Divide numerator and denominator by x².",
    "steps": [
      "The quotient becomes (3+1/x²)/(1+2/x²).",
      "Both fractions involving 1/x² approach zero.",
      "The limit is 3."
    ],
    "check": "The graph approaches the horizontal asymptote y=3.",
    "checkpoint": "Compute lim(x→∞) (5x²−1)/(2x²+1).",
    "answer": "5/2",
    "explanation": "The leading coefficients have ratio 5:2."
  },
  {
    "id": "dc02-03",
    "title": "Implicit differentiation",
    "summary": "Differentiate relationships where y is not isolated as a function of x.",
    "definition": "Terms involving y produce y' through the chain rule.",
    "formula": "\\frac{d}{dx}(y^2)=2y\\frac{dy}{dx}",
    "condition": "When solving for y', exclude points at which division by its coefficient is invalid.",
    "problem": "For x²+y²=25, find the slope at (3,4).",
    "strategy": "Differentiate the constraint and solve for y'.",
    "steps": [
      "2x+2yy'=0.",
      "For y≠0, y'=−x/y.",
      "At (3,4), the slope is −3/4."
    ],
    "check": "Implicit differentiation agrees with the upper-circle branch y=√(25−x²).",
    "checkpoint": "Find the slope on x²+y²=100 at (6,8).",
    "answer": "−3/4",
    "explanation": "Use y'=−x/y; substitute 6 and 8."
  },
  {
    "id": "dc02-04",
    "title": "Related rates",
    "summary": "Differentiate a physical relationship with respect to time and keep the units explicit.",
    "definition": "For A=πr² with radius changing in time, dA/dt=2πr dr/dt.",
    "formula": "\\frac{dA}{dt}=2\\pi r\\frac{dr}{dt}",
    "condition": "The quantities must refer to the same instant, and all units must be consistent.",
    "problem": "A circular region has radius 3 m growing at 2 m/s. Find its area growth rate.",
    "strategy": "Differentiate A=πr² with respect to time.",
    "steps": [
      "dA/dt=2πr dr/dt.",
      "At r=3 and dr/dt=2, dA/dt=12π m²/s."
    ],
    "check": "A growing radius must yield a positive area rate.",
    "checkpoint": "For r=4 m and dr/dt=1 m/s, find dA/dt.",
    "answer": "8π m²/s",
    "explanation": "Substitute into 2πr dr/dt."
  },
  {
    "id": "dc02-05",
    "title": "Optimization from constraints",
    "summary": "Write the objective using one independent variable before differentiating.",
    "definition": "Interior extrema of a differentiable objective are candidates where its derivative is zero.",
    "formula": "A'(x)=0\\quad\\text{at a differentiable interior optimum}",
    "condition": "Also examine constraints, endpoints and feasibility; zero derivative alone does not prove a maximum.",
    "problem": "A rectangle has perimeter 20. Find its maximum area.",
    "strategy": "Let one side be x and the other 10−x.",
    "steps": [
      "Area A=x(10−x)=10x−x² on 0≤x≤10.",
      "A'=10−2x=0 gives x=5.",
      "A''=−2<0, so maximum A=25."
    ],
    "check": "Square 5×5 satisfies the perimeter and has maximum area.",
    "checkpoint": "What is the maximum rectangle area for perimeter 32?",
    "answer": "64",
    "explanation": "The optimal rectangle is an 8×8 square."
  },
  {
    "id": "dc03-03",
    "title": "Higher derivatives of trigonometric functions",
    "summary": "Apply the chain rule successively while tracking sign changes.",
    "definition": "A sine or cosine derivative includes the derivative of its inner argument.",
    "formula": "\\frac{d^2}{dx^2}\\sin(kx)=-k^2\\sin(kx)",
    "condition": "The coefficient k is constant and the angle is in radians.",
    "problem": "Compute the second derivative of sin(2x) at x=π/4.",
    "strategy": "Differentiate twice, carrying the inner factor.",
    "steps": [
      "The first derivative is 2cos(2x).",
      "The second derivative is −4sin(2x).",
      "At x=π/4, sin(π/2)=1, giving −4."
    ],
    "check": "The result is compatible with the simple harmonic equation y''=−4y.",
    "checkpoint": "Find the second derivative of cos(3x).",
    "answer": "−9cos(3x)",
    "explanation": "Differentiate to −3sin(3x), then −9cos(3x)."
  },
  {
    "id": "dc03-04",
    "title": "Second implicit derivatives",
    "summary": "Differentiate an implicit derivative once more and substitute the first derivative.",
    "definition": "On x²+y²=R², differentiating y'=−x/y gives y''=−R²/y³ where y≠0.",
    "formula": "\\frac{d^2y}{dx^2}=-\\frac{R^2}{y^3}\\quad(x^2+y^2=R^2,\\ y\\ne0)",
    "condition": "The formula describes a locally differentiable branch away from points with y=0.",
    "problem": "Find y'' for x²+y²=25 at (3,4).",
    "strategy": "Start with y'=−x/y and use the quotient rule.",
    "steps": [
      "y''=−(y−xy')/y².",
      "Substitute y'=−x/y to get −(x²+y²)/y³.",
      "Use x²+y²=25 and y=4: y''=−25/64."
    ],
    "check": "The upper semicircle is concave down at the given point.",
    "checkpoint": "On x²+y²=25 at (0,5), find y''.",
    "answer": "−1/5",
    "explanation": "Apply −25/5³=−1/5."
  },
  {
    "id": "dc03-05",
    "title": "Concavity and inflection points",
    "summary": "Interpret the sign of the second derivative on intervals.",
    "definition": "Positive second derivative indicates concavity up, while negative indicates concavity down.",
    "formula": "f''(x)>0\\ \\Rightarrow\\ \\text{concave up}",
    "condition": "A zero second derivative does not itself prove an inflection point; require a change of concavity.",
    "problem": "Find the inflection point of f(x)=x³−3x.",
    "strategy": "Analyze the sign of f''.",
    "steps": [
      "f'(x)=3x²−3 and f''(x)=6x.",
      "f'' changes from negative to positive at x=0.",
      "The inflection point is (0,0)."
    ],
    "check": "The derivative sign changes confirm opposite concavity on either side.",
    "checkpoint": "Find the x-coordinate of the inflection of f(x)=x³−6x.",
    "answer": "0",
    "explanation": "f''=6x changes sign at zero."
  },
  {
    "id": "dc04-03",
    "title": "Parametric tangent lines",
    "summary": "Find a parametric point and slope, then use point-slope form.",
    "definition": "A tangent line is locally y−y₀=m(x−x₀) when its slope is finite.",
    "formula": "y-y_0=\\left.\\frac{dy/dt}{dx/dt}\\right|_{t=t_0}(x-x_0)",
    "condition": "Requires a regular point with dx/dt≠0 for finite slope.",
    "problem": "For x=t²+1,y=t³ at t=1, find the tangent line.",
    "strategy": "Compute coordinates and slope at t=1.",
    "steps": [
      "The point is (2,1).",
      "dx/dt=2t, dy/dt=3t², so slope at 1 is 3/2.",
      "Equation: y−1=(3/2)(x−2)."
    ],
    "check": "Both parametric derivatives are finite and dx/dt=2≠0.",
    "checkpoint": "For x=t,y=t² at t=2, find the tangent line.",
    "answer": "y−4=4(x−2)",
    "explanation": "The point is (2,4); slope is 2t=4."
  },
  {
    "id": "dc04-04",
    "title": "Vertical tangents in parametric curves",
    "summary": "Check both parameter derivatives before deciding whether a vertical tangent is present.",
    "definition": "A regular parametric curve with dx/dt=0 and dy/dt≠0 has a vertical tangent.",
    "formula": "\\frac{dx}{dt}=0,\\quad\\frac{dy}{dt}\\ne0\\quad\\Rightarrow\\quad\\text{vertical tangent}",
    "condition": "At a point where both derivatives vanish, a separate local analysis is required.",
    "problem": "For x=t²,y=t, identify the tangent at t=0.",
    "strategy": "Compute dx/dt and dy/dt at the parameter.",
    "steps": [
      "At t=0, dx/dt=2t=0 and dy/dt=1.",
      "The point is (0,0), and the vertical line x=0 is tangent."
    ],
    "check": "Eliminating t gives x=y², which has vertical tangent at the origin in the x-y orientation.",
    "checkpoint": "For x=t³,y=t at t=0, describe the tangent.",
    "answer": "Vertical: x=0",
    "explanation": "The curve is y=x^(1/3); dx/dt=0 and dy/dt=1 at zero."
  },
  {
    "id": "dc04-05",
    "title": "Velocity and speed in parametric motion",
    "summary": "Differentiate each coordinate with respect to time to form velocity.",
    "definition": "The velocity vector is (x'(t),y'(t)) and speed is its magnitude.",
    "formula": "v(t)=\\sqrt{(x'(t))^2+(y'(t))^2}",
    "condition": "The parameter must represent time, and component units must be consistent.",
    "problem": "A particle moves as x=3t,y=4t². Find its speed at t=1.",
    "strategy": "Compute both velocity components.",
    "steps": [
      "x'=3 and y'=8t.",
      "At t=1, speed is √(3²+8²)=√73."
    ],
    "check": "The velocity vector is (3,8), whose magnitude is √73.",
    "checkpoint": "For x=3t,y=4t, find speed.",
    "answer": "5",
    "explanation": "The constant velocity vector (3,4) has magnitude five."
  },
  {
    "id": "dc05-03",
    "title": "Mixed partial derivatives",
    "summary": "Differentiate sequentially with respect to different coordinates.",
    "definition": "For sufficiently smooth functions, mixed partial derivatives agree where the relevant continuity conditions hold.",
    "formula": "f_{xy}=f_{yx}",
    "condition": "Equality requires conditions such as continuity of the mixed second partials near the point.",
    "problem": "For f=x²y³, find f_xy at (1,2).",
    "strategy": "Differentiate first with respect to x and then with respect to y.",
    "steps": [
      "f_x=2xy³.",
      "Differentiate in y: f_xy=6xy².",
      "At (1,2), f_xy=6·1·4=24."
    ],
    "check": "Reverse order gives the same mixed partial.",
    "checkpoint": "For f=xy², find f_xy.",
    "answer": "2y",
    "explanation": "f_x=y², then differentiate in y."
  },
  {
    "id": "dc05-04",
    "title": "Multivariable chain rule",
    "summary": "When several coordinates depend on a parameter, include every dependence.",
    "definition": "For z=f(x(t),y(t)), dz/dt=f_x x'(t)+f_y y'(t).",
    "formula": "\\frac{dz}{dt}=f_x\\frac{dx}{dt}+f_y\\frac{dy}{dt}",
    "condition": "The necessary partial and ordinary derivatives must exist on the path.",
    "problem": "Let z=x²+y², x=t and y=t². Find dz/dt at t=1.",
    "strategy": "Substitute derivatives of x and y into the multivariable chain rule.",
    "steps": [
      "f_x=2x, f_y=2y, x'=1 and y'=2t.",
      "dz/dt=2t+4t³.",
      "At t=1, dz/dt=6."
    ],
    "check": "Direct substitution z=t²+t⁴ yields derivative 2t+4t³.",
    "checkpoint": "Let z=x²+y²,x=2t,y=t; find dz/dt at t=1.",
    "answer": "10",
    "explanation": "z=5t², so dz/dt=10t."
  },
  {
    "id": "dc05-05",
    "title": "Critical points and the second derivative test",
    "summary": "Classify stationary points of differentiable scalar functions of two variables.",
    "definition": "At a critical point, a positive-definite Hessian implies a strict local minimum.",
    "formula": "D=f_{xx}f_{yy}-(f_{xy})^2,\\quad D>0,\\ f_{xx}>0\\Rightarrow\\text{min}",
    "condition": "The Hessian test is local and assumes suitable second derivatives; a degenerate test is inconclusive.",
    "problem": "Find and classify the stationary point of f=x²+2y²−2x+4y.",
    "strategy": "Set the partial derivatives to zero and inspect the Hessian.",
    "steps": [
      "f_x=2x−2=0 gives x=1; f_y=4y+4=0 gives y=−1.",
      "f_xx=2, f_yy=4, f_xy=0; D=8>0 and f_xx>0.",
      "The point (1,−1) is a strict local (and global) minimum."
    ],
    "check": "Completing squares gives f=(x−1)²+2(y+1)²−3.",
    "checkpoint": "Classify (0,0) for f=x²+y².",
    "answer": "Strict minimum",
    "explanation": "The Hessian is positive definite."
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
