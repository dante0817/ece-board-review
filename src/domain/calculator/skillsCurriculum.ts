/** v10.20 learning curriculum. Educational explanations, NOT certified physical keystrokes.
 * All quiz keys are authored independently of the question generator.
 */
export type CalculatorSkillLevel = 'Foundations' | 'Solving' | 'Engineering' | 'Verification';
export interface SkillCheck {
  id: string;
  prompt: string;
  options: readonly [string,string,string];
  correctIndex: 0|1|2;
  explanation: string;
}
export interface CalculatorSkillLesson {
  id: string;
  level: CalculatorSkillLevel;
  title: string;
  objective: string;
  manualSection: string;
  estimatedMinutes: number;
  prerequisites: readonly string[];
  concept: string;
  steps: readonly string[];
  example: {problem:string; input:string; expected:string; independentCheck:string; trap:string};
  checks: readonly [SkillCheck,SkillCheck];
}
export const CANON_SKILLS_CURRICULUM:readonly CalculatorSkillLesson[] = [
  {
    id:'setup-modes',level:'Foundations',title:'Reset, modes, and angle units',estimatedMinutes:7,
    objective:'Recognize the mode and angle-unit settings before beginning an exam problem.',manualSection:'Before Starting / Calculator Modes / Angle Unit',prerequisites:[],
    concept:'The same expression can give different values in degrees and radians. Follow the examination reset/inspection rules and check settings after clearing.',
    steps:['Inspect the display indicators before a trig computation.','Decide whether the given angle is in degrees or radians.','Set the matching angle unit using the model manual; do not assume the last learner’s settings.','After a reset, verify the required mode and any memory-dependent setup.'],
    example:{problem:'Find sin(30°).',input:'Evaluate sin(30) with degree mode selected.',expected:'0.5',independentCheck:'A 30°–60°–90° triangle has opposite/hypotenuse = 1/2.',trap:'30 radians is not 30 degrees; a mode error may look like a plausible decimal.'},
    checks:[{id:'unit1',prompt:'For sin(π/6), what angle setting directly matches the input?',options:['Degree mode','Radian mode','STAT mode'],correctIndex:1,explanation:'π/6 is an angle measured in radians.'},{id:'unit2',prompt:'After an exam-day calculator reset, what should you verify first?',options:['Previous stored variables are intact','Current mode and angle-unit indicators','That an old answer is still in memory'],correctIndex:1,explanation:'A reset may change settings and clear stored values.'}],
  },
  {
    id:'parentheses',level:'Foundations',title:'Parentheses and calculation order',estimatedMinutes:6,
    objective:'Enter grouped numerators, denominators and signed numbers without precedence mistakes.',manualSection:'Basic Calculations / Order of Operations',prerequisites:['setup-modes'],
    concept:'Group complete denominators and negative bases explicitly. A calculator can process incorrectly entered expressions flawlessly.',
    steps:['Write the intended mathematical expression first.','Parenthesize the entire multi-term numerator and denominator.','Use parentheses around negative bases before squaring.','Re-evaluate with an alternate rearrangement to check the result.'],
    example:{problem:'Evaluate (12 + 6)/(3 + 3).',input:'(12+6) ÷ (3+3)',expected:'3',independentCheck:'18 divided by 6 equals 3.',trap:'Entering 12+6÷3+3 does not represent the same expression.'},
    checks:[{id:'group1',prompt:'Which entry correctly evaluates 10/(2+3)?',options:['10÷2+3','10÷(2+3)','(10÷2)+3'],correctIndex:1,explanation:'The complete denominator 2+3 must be grouped.'},{id:'group2',prompt:'What is (−3)²?',options:['9','−9','−6'],correctIndex:0,explanation:'The negative sign belongs inside the squared parentheses.'}],
  },
  {
    id:'engineering-notation',level:'Foundations',title:'SCI/ENG notation and unit scales',estimatedMinutes:7,
    objective:'Check powers of ten and engineering prefixes before and after calculator evaluation.',manualSection:'Scientific Calculations / ENG Notation',prerequisites:['parentheses'],
    concept:'Engineering notation uses exponents divisible by 3; the calculator does not automatically know whether your source value was entered in kHz, MHz, Ω or kΩ.',
    steps:['Convert source quantities into consistent base units.','Track power-of-ten factors on paper.','Use scientific/engineering display only as a presentation aid.','Attach the resulting unit and verify the order of magnitude.'],
    example:{problem:'Convert 0.000047 F into μF.',input:'0.000047 × 10^6',expected:'47 μF',independentCheck:'47 × 10^−6 F equals 0.000047 F.',trap:'A factor of 1000 error often comes from mixing milli and micro.'},
    checks:[{id:'eng1',prompt:'0.000022 F is equivalent to which capacitance?',options:['22 μF','22 mF','0.22 nF'],correctIndex:0,explanation:'0.000022 F = 22×10^-6 F = 22 μF.'},{id:'eng2',prompt:'Which exponent is in engineering notation?',options:['10^−4','10^−6','10^5'],correctIndex:1,explanation:'Engineering-notation exponents are multiples of three.'}],
  },
  {
    id:'eqn-linear',level:'Solving',title:'EQN mode: simultaneous equations',estimatedMinutes:9,
    objective:'Arrange a system into coefficients and independently verify both equations.',manualSection:'Equation Calculations / Simultaneous Linear Equations',prerequisites:['parentheses'],
    concept:'The equation mode solves the coefficient system supplied to it; setting up the correct equations is still the learner’s responsibility.',
    steps:['Convert the problem to a₁x+b₁y=c₁ and a₂x+b₂y=c₂.','Use the simultaneous-equation function documented for F-789SGA.','Enter coefficient rows in the exact on-screen order.','Substitute all returned unknowns into both ORIGINAL equations.'],
    example:{problem:'2x+y=7 and x−y=2.',input:'Coefficient rows: 2, 1, 7 and 1, −1, 2',expected:'x=3, y=1',independentCheck:'2×3+1=7 and 3−1=2.',trap:'Entering the right-hand side as a coefficient or swapping x/y silently changes the problem.'},
    checks:[{id:'eqn1',prompt:'For 3x−2y=8, what is the row in ax+by=c?',options:['3, −2, 8','3, 2, 8','8, 3, −2'],correctIndex:0,explanation:'Keep the coefficient −2 with y and 8 as the constant.'},{id:'eqn2',prompt:'If EQN returns x=3,y=1 above, what is the best independent check?',options:['Run the same EQN menu again','Substitute in both original equations','Check only x+y'],correctIndex:1,explanation:'Substitution tests both original constraints independently of the solver.'}],
  },
  {
    id:'eqn-quadratic',level:'Solving',title:'EQN mode: roots and domain',estimatedMinutes:9,
    objective:'Use supported polynomial equations without accepting invalid original-domain roots.',manualSection:'Equation Calculations / Polynomial Equations',prerequisites:['eqn-linear'],
    concept:'A transformed polynomial may have roots excluded by denominators, logarithms or radicals in the original problem.',
    steps:['Rearrange to ax²+bx+c=0 and identify a, b, c.','Use the documented quadratic-equation function.','Inspect both solutions and any restrictions inherited from the original problem.','Verify accepted roots in the original problem, not only in the polynomial.'],
    example:{problem:'log₂(x+3)+log₂(x−1)=5.',input:'Quadratic coefficients: 1, 2, −35',expected:'Polynomial roots: 5 and −7; valid x=5 only',independentCheck:'x>1 is required; log₂8+log₂4=3+2=5.',trap:'A displayed polynomial root can be extraneous in the original logarithmic equation.'},
    checks:[{id:'quad1',prompt:'For x²+2x−35=0, which coefficients belong in quadratic EQN?',options:['1, −2, −35','1, 2, −35','2, 1, 35'],correctIndex:1,explanation:'The coefficients are a=1, b=2, c=−35.'},{id:'quad2',prompt:'Why must x=−7 be rejected in the example?',options:['It is not a quadratic root','It makes a logarithm argument negative','The calculator cannot show negative roots'],correctIndex:1,explanation:'For the original logarithms x−1 and x+3 must both be positive.'}],
  },
  {
    id:'calc-solve',level:'Solving',title:'CALC and numerical SOLVE: what they prove',estimatedMinutes:8,
    objective:'Distinguish substitution, approximate root-finding and a complete algebraic solution.',manualSection:'CALC Function / SOLVE Function',prerequisites:['eqn-quadratic'],
    concept:'CALC evaluates an expression at supplied numeric inputs. Numerical SOLVE is iterative; it may find one root or fail depending on its starting value.',
    steps:['Use CALC to evaluate at a chosen input value.','Use SOLVE only for an equation the mode supports.','Check the initial guess, convergence, and whether other roots may exist.','Substitute any result into the original equation and consider other intervals.'],
    example:{problem:'Does x=2 satisfy x²−4=0?',input:'CALC evaluation at x=2: 2²−4',expected:'0 (candidate verified)',independentCheck:'Manual factorization gives (x−2)(x+2)=0, so −2 is also a root.',trap:'Finding a root at x=2 does not show that there are no other roots.'},
    checks:[{id:'solve1',prompt:'Numerical SOLVE returning one root means:',options:['All roots have been found','A candidate root has been found','An algebraic identity is proven'],correctIndex:1,explanation:'Iterative numerical solving does not guarantee all roots.'},{id:'solve2',prompt:'If f(2)=0, what can you conclude?',options:['2 is a root if f is defined there','f(x)=0 for every x','There are no other roots'],correctIndex:0,explanation:'It verifies a single candidate only.'}],
  },
  {
    id:'decibels',level:'Engineering',title:'Logarithms, decibels and ratios',estimatedMinutes:8,
    objective:'Convert between decibel and linear power ratios for communications problems.',manualSection:'Logarithm Calculations / Powers',prerequisites:['engineering-notation'],
    concept:'For power ratios, dB = 10log₁₀(P₂/P₁). Do not confuse this with 20log₁₀ used for appropriate amplitude ratios.',
    steps:['Identify whether the problem asks for power or amplitude.','For a power ratio in dB, enter 10^(dB/10).','Use the linear ratio in Shannon and other nonlinear formulas.','Verify the decibel value by applying 10log₁₀ again.'],
    example:{problem:'Convert 20 dB of power gain to a linear ratio.',input:'10^(20 ÷ 10)',expected:'100',independentCheck:'10 × log₁₀(100)=20 dB.',trap:'20 dB of power gain is ×100, not ×20 or ×10.'},
    checks:[{id:'db1',prompt:'A 30 dB power ratio is:',options:['30','1000','300'],correctIndex:1,explanation:'10^(30/10) = 10³ = 1000.'},{id:'db2',prompt:'Which formula represents a power ratio in decibels?',options:['10 log₁₀(P₂/P₁)','20 log₁₀(P₂/P₁)','log₂(P₂/P₁)'],correctIndex:0,explanation:'Power-ratio dB uses factor 10.'}],
  },
  {
    id:'complex-matrix',level:'Engineering',title:'Complex numbers and matrices: independent checks',estimatedMinutes:9,
    objective:'Check rectangular complex calculations and the meaning of a matrix inverse.',manualSection:'Complex Number Calculations / Matrix Calculations',prerequisites:['eqn-linear'],
    concept:'Complex numbers and matrices require the appropriate calculator modes. A calculated inverse is meaningful only when the determinant is nonzero.',
    steps:['Choose rectangular or polar representation deliberately.','Confirm DEG/RAD before phase-angle work.','Check complex outputs through a second representation or arithmetic identity.','For matrix inverses, verify A·A⁻¹≈I and confirm nonsingularity.'],
    example:{problem:'Compute (3+4i)(3−4i).',input:'Multiply conjugates or evaluate with complex-number mode.',expected:'25',independentCheck:'(3+4i)(3−4i)=9−(4i)²=9+16=25.',trap:'i²=−1; also check the correct angle setting when converting to polar.'},
    checks:[{id:'complex1',prompt:'What is |3+4i|?',options:['7','5','25'],correctIndex:1,explanation:'√(3²+4²)=5.'},{id:'complex2',prompt:'A matrix with determinant zero:',options:['Has a unique inverse','Has no inverse','Has identity as its inverse'],correctIndex:1,explanation:'A singular square matrix cannot be inverted.'}],
  },
  {
    id:'numeric-calculus',level:'Engineering',title:'Numerical derivatives and definite integrals',estimatedMinutes:9,
    objective:'Use numerical results as checks, not as replacements for symbolic methods.',manualSection:'Differential and Integration Calculations',prerequisites:['calc-solve'],
    concept:'Numerical differentiation estimates a derivative at one point; numerical integration approximates a definite integral over limits.',
    steps:['Find the symbolic derivative or antiderivative where practical.','Supply the specified evaluation point or integration bounds.','Compare the numerical output with an independent analytic value.','Use extra care near discontinuities, steep slopes or undefined values.'],
    example:{problem:'Find d(x²)/dx at x=3.',input:'Numerical derivative of x² evaluated at 3.',expected:'Approximately 6',independentCheck:'Symbolically d(x²)/dx=2x; at x=3 this equals 6.',trap:'A numerical derivative at 3 is not the full function 2x.'},
    checks:[{id:'calc1',prompt:'Numerical differentiation at x=3 gives:',options:['A whole symbolic derivative','An estimate of the derivative at x=3','An indefinite integral'],correctIndex:1,explanation:'It estimates one derivative value.'},{id:'calc2',prompt:'What is ∫₀² 2x dx?',options:['2','4','8'],correctIndex:1,explanation:'The antiderivative is x²; 2²−0²=4.'}],
  },
  {
    id:'answer-verification',level:'Verification',title:'Independent checking and exam traps',estimatedMinutes:8,
    objective:'Verify candidate results with a mathematically independent method and recognize what a calculator cannot prove.',manualSection:'CALC Function / Basic Calculations',prerequisites:['setup-modes','parentheses'],
    concept:'A numerical check can expose a mistake or eliminate a candidate answer, but finite sample points do not generally prove an algebraic identity.',
    steps:['Restate the ORIGINAL problem and all domain/unit requirements.','Choose an independent check, such as substitution or inverse operation.','Compare to the requested rounding and dimensional units.','For an identity, use algebraic reasoning; testing a few numbers is not a proof.'],
    example:{problem:'Does x=4 solve 3x−5=7?',input:'3×4−5',expected:'7 (candidate verified)',independentCheck:'Rearrange: x=(7+5)/3=4.',trap:'Substitution tests x=4, not every possible claim or equation transformation.'},
    checks:[{id:'check1',prompt:'A proposed identity holds at x=0 and x=1. What follows?',options:['It is proven for every x','Only those test values passed','All other values must fail'],correctIndex:1,explanation:'Finite numeric tests cannot generally prove an identity.'},{id:'check2',prompt:'Which best checks a quadratic root from a transformed logarithm equation?',options:['Substitute in the original logarithmic equation','Trust EQN display without restrictions','Substitute only into the derived quadratic'],correctIndex:0,explanation:'The original equation includes domain requirements absent in the polynomial.'}],
  },
] as const;
export const CANON_SKILL_BY_ID = new Map(CANON_SKILLS_CURRICULUM.map(lesson=>[lesson.id,lesson]));
export function gradeCalculatorSkill(lessonId:string, answers:readonly number[]):{correct:number;total:number;passed:boolean;feedback:readonly boolean[]}|null{
 const lesson=CANON_SKILL_BY_ID.get(lessonId);
 if(!lesson||answers.length!==lesson.checks.length||answers.some((answer)=>!Number.isInteger(answer)||answer<0||answer>2))return null;
 const feedback=lesson.checks.map((check,index)=>check.correctIndex===answers[index]);
 const correct=feedback.filter(Boolean).length;
 return {correct,total:lesson.checks.length,passed:correct===lesson.checks.length,feedback};
}
