export type AlgebraReferenceTopicId =
  | 'top-alg-fractions'
  | 'top-quadratics'
  | 'top-functions'
  | 'top-factoring'
  | 'top-polynomial-eq'
  | 'top-laws-exponents'
  | 'top-inequalities'
  | 'top-linear-eq'
  | 'top-absolute-value'
  | 'top-rational-radical-eqs'
  | 'top-logarithms'
  | 'top-simultaneous-linear'
  | 'top-complex-numbers'
  | 'top-arithmetic-seq'
  | 'top-geometric-seq'
  | 'top-binomial-theorem'
  | 'top-matrices'
  | 'top-partial-fractions'
  | 'top-word-problems'
  | 'top-inverse-functions'
  | 'top-polynomial-functions'
  | 'top-rational-functions'
  | 'top-harmonic-seq';
/** @deprecated Kept as a source-compatible alias while earlier pilot screens migrate. */
export type AlgebraPilotTopicId = AlgebraReferenceTopicId;

export interface AlgebraSourceReference {
  book: string;
  role: 'Concept backbone' | 'Instructional design' | 'Practice taxonomy';
  section: string;
  locator: string;
  use: string;
  verificationStatus: 'verified-section-pages' | 'provisional';
  verificationNote?: string;
}

export interface AlgebraLearningObjective {
  id: string;
  text: string;
}

export interface AlgebraPrerequisite {
  id: string;
  label: string;
  checkPrompt: string;
  answer: string;
}

export interface AlgebraRuleCard {
  title: string;
  formula?: string;
  meaning: string;
  condition?: string;
  commonError?: string;
}

export interface AlgebraMisconception {
  id: string;
  label: string;
  symptom: string;
  correction: string;
  quickCheck: string;
}

export interface AlgebraWorkedExample {
  title: string;
  problem: string;
  strategy: string;
  steps: string[];
  check: string;
  takeaway: string;
}

export interface AlgebraReferencePracticeQuestion {
  id: string;
  subskill: string;
  difficulty: 'Foundation' | 'Standard' | 'Mixed' | 'ECE Application' | 'Board-review style';
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  misconceptionId?: string;
}

/** @deprecated The practice model now covers all reference-informed topics. */
export type AlgebraPilotPracticeQuestion = AlgebraReferencePracticeQuestion;

export interface AlgebraReferenceTopicContent {
  canonicalTopicId: string;
  title: string;
  groupLabel: string;
  shortDescription: string;
  boardPriority: 'High' | 'Medium' | 'Supporting';
  objectives: AlgebraLearningObjective[];
  prerequisites: AlgebraPrerequisite[];
  rules: AlgebraRuleCard[];
  misconceptions: AlgebraMisconception[];
  workedExamples: AlgebraWorkedExample[];
  practiceQuestions: AlgebraReferencePracticeQuestion[];
  eceBridge: Array<{ title: string; description: string; formula?: string }>;
  sources: AlgebraSourceReference[];
}

/** @deprecated The model now serves every reference-informed Algebra topic. */
export type AlgebraPilotTopicContent = AlgebraReferenceTopicContent;

export const ALGEBRA_REFERENCE_CONTENT: Record<AlgebraReferenceTopicId, AlgebraReferenceTopicContent> = {
  'top-alg-fractions': {
    canonicalTopicId: 'top-alg-fractions',
    title: 'Rational Expressions',
    groupLabel: 'Expressions & Polynomials',
    shortDescription: 'Domain restrictions, simplification, operations, complex rational expressions, and error-resistant algebraic manipulation.',
    boardPriority: 'High',
    objectives: [
      { id: 'rat-obj-1', text: 'Identify excluded values from every original denominator.' },
      { id: 'rat-obj-2', text: 'Reduce rational expressions by factoring completely and cancelling factors only.' },
      { id: 'rat-obj-3', text: 'Multiply and divide rational expressions using factoring and reciprocals.' },
      { id: 'rat-obj-4', text: 'Add and subtract rational expressions using the least common denominator.' },
      { id: 'rat-obj-5', text: 'Simplify complex rational expressions without losing domain restrictions.' },
      { id: 'rat-obj-6', text: 'Recognize invalid cancellation and sign-distribution traps.' },
    ],
    prerequisites: [
      { id: 'rat-pre-1', label: 'Factoring', checkPrompt: 'Factor x² − 9.', answer: '(x − 3)(x + 3)' },
      { id: 'rat-pre-2', label: 'Least common denominator', checkPrompt: 'LCD of 1/(x−1) and 1/(x+2)?', answer: '(x − 1)(x + 2)' },
      { id: 'rat-pre-3', label: 'Sign control', checkPrompt: 'Simplify −(x − 5).', answer: '−x + 5' },
    ],
    rules: [
      {
        title: 'Domain restriction',
        formula: 'Q(x) \\neq 0',
        meaning: 'A rational expression is defined only where its original denominator is nonzero.',
        condition: 'State restrictions before cancelling factors.',
        commonError: 'A cancelled denominator factor still contributes an excluded value from the original expression.',
      },
      {
        title: 'Cancellation property',
        formula: '\\frac{A(x)C(x)}{B(x)C(x)}=\\frac{A(x)}{B(x)}',
        meaning: 'Cancel common factors, not terms joined by addition or subtraction.',
        condition: 'C(x) must be nonzero, and all original restrictions remain.',
        commonError: 'Cancelling x across x+3 or x−3 is invalid because x is not a factor of the whole sum/difference.',
      },
      {
        title: 'Division of rational expressions',
        formula: '\\frac{A}{B}\\div\\frac{C}{D}=\\frac{A}{B}\\cdot\\frac{D}{C}',
        meaning: 'Multiply by the reciprocal of the divisor, then factor and simplify.',
        condition: 'The divisor itself must not equal zero.',
        commonError: 'Flipping the first fraction or cancelling before forming a valid product.',
      },
    ],
    misconceptions: [
      {
        id: 'RAT_CANCEL_TERMS',
        label: 'Cancelling terms instead of factors',
        symptom: 'Treating (x+2)/x as if the x could cancel from only part of the numerator.',
        correction: 'Factor the complete numerator and denominator first; cancellation only applies to common multiplicative factors.',
        quickCheck: '(x+2)/x cannot simplify by cancellation because x+2 is a sum, not a product containing x.',
      },
      {
        id: 'RAT_LOST_RESTRICTION',
        label: 'Losing excluded values after simplification',
        symptom: 'Reporting only restrictions visible in the simplified form.',
        correction: 'Record all values that make any original denominator zero before simplifying.',
        quickCheck: '(x−3)(x+2)/[(x−3)(x+1)] still excludes x=3 after cancelling x−3.',
      },
      {
        id: 'RAT_SIGN_DISTRIBUTION',
        label: 'Subtraction sign error',
        symptom: 'Subtracting numerators without distributing the negative sign through the second numerator.',
        correction: 'Use parentheses around the numerator being subtracted, then distribute the minus sign to every term.',
        quickCheck: '(5x+2)−(2x−10)=3x+12, not 3x−8.',
      },
    ],
    workedExamples: [
      {
        title: 'Reduce and preserve restrictions',
        problem: 'Simplify (x² − 9)/(x² − 2x − 3).',
        strategy: 'Factor both polynomials completely, record the original excluded values, then cancel only common factors.',
        steps: [
          'x² − 9 = (x − 3)(x + 3).',
          'x² − 2x − 3 = (x − 3)(x + 1).',
          'Original restrictions: x ≠ 3 and x ≠ −1.',
          'Cancel the factor (x − 3) to get (x + 3)/(x + 1).',
        ],
        check: 'Substitute a safe value such as x=2 into both the original and simplified forms; both evaluate to 5/3.',
        takeaway: 'Simplification changes the form, not the original domain restrictions.',
      },
    ],
    practiceQuestions: [],
    eceBridge: [
      {
        title: 'Equivalent-resistance rearrangement',
        description: 'Rational-expression skills support rearranging parallel-resistance relationships and checking forbidden denominator values.',
        formula: 'R_T=\\frac{R_1R_2}{R_1+R_2}',
      },
    ],
    sources: [
      { book: 'College Algebra, 9th ed. — Michael Sullivan', role: 'Concept backbone', section: 'R.7 Rational Expressions', locator: 'pp. 62–72', use: 'Objectives, domain restrictions, reduction, operations, least-common-multiple method, and complex rational expressions.', verificationStatus: 'verified-section-pages' },
      { book: 'College Algebra and Calculus: An Applied Approach, 2nd ed. — Larson & Hodgkins', role: 'Instructional design', section: '0.7 Fractional Expressions', locator: 'pp. 55–62', use: 'Domain-first teaching sequence, immediate examples/checkpoints, and concise review structure.', verificationStatus: 'verified-section-pages' },
      { book: '1,001 Algebra II Practice Problems For Dummies — Mary Jane Sterling', role: 'Practice taxonomy', section: 'Ch. 3 Solving Radical and Rational Equations; Ch. 8 Rational Functions', locator: 'pp. 21–26; 51–56', use: 'Problem-type variation for rational equations/functions, restrictions and extraneous-root traps, and repeated practice patterns.', verificationStatus: 'verified-section-pages' },
    ],
  },

  'top-quadratics': {
    canonicalTopicId: 'top-quadratics',
    title: 'Quadratic Equations',
    groupLabel: 'Equations & Inequalities',
    shortDescription: 'Standard form, factoring, square-root method, completing the square, quadratic formula, discriminant, and efficient method selection.',
    boardPriority: 'High',
    objectives: [
      { id: 'quad-obj-1', text: 'Recognize and rewrite a quadratic equation in standard form ax² + bx + c = 0.' },
      { id: 'quad-obj-2', text: 'Solve factorable quadratics using the zero-product property.' },
      { id: 'quad-obj-3', text: 'Use the square-root method when the squared expression is isolated.' },
      { id: 'quad-obj-4', text: 'Complete the square and recognize the resulting perfect-square trinomial.' },
      { id: 'quad-obj-5', text: 'Apply the quadratic formula accurately and simplify exact roots.' },
      { id: 'quad-obj-6', text: 'Use the discriminant to classify the nature and number of roots.' },
      { id: 'quad-obj-7', text: 'Choose the most efficient valid solution method for a given equation.' },
    ],
    prerequisites: [
      { id: 'quad-pre-1', label: 'Factoring', checkPrompt: 'Factor x² + 5x + 6.', answer: '(x + 2)(x + 3)' },
      { id: 'quad-pre-2', label: 'Square roots', checkPrompt: 'If x²=49, what are the real solutions?', answer: 'x=±7' },
      { id: 'quad-pre-3', label: 'Perfect squares', checkPrompt: 'Complete x²+6x+__ as a perfect square.', answer: '9, giving (x+3)²' },
    ],
    rules: [
      {
        title: 'Standard form',
        formula: 'ax^2+bx+c=0,\\quad a\\neq 0',
        meaning: 'Place all terms on one side before factoring, discriminant work, or the quadratic formula.',
      },
      {
        title: 'Quadratic formula',
        formula: 'x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}',
        meaning: 'A universal real/complex solution method for quadratic equations.',
        condition: 'Substitute a, b, and c with their signs exactly as they appear in standard form.',
        commonError: 'The entire numerator is divided by 2a, not only the radical term.',
      },
      {
        title: 'Discriminant',
        formula: '\\Delta=b^2-4ac',
        meaning: 'Δ>0 gives two distinct real roots; Δ=0 gives one repeated real root; Δ<0 gives a complex-conjugate pair.',
        commonError: 'Dropping the sign of b or c when evaluating b²−4ac.',
      },
    ],
    misconceptions: [
      {
        id: 'QUAD_MISSING_PM',
        label: 'Missing ± in square-root solutions',
        symptom: 'Solving x²=k with only the positive square root.',
        correction: 'When x²=k>0, both x=√k and x=−√k satisfy the equation.',
        quickCheck: 'x²=25 has x=5 and x=−5.',
      },
      {
        id: 'QUAD_FORMULA_SIGNS',
        label: 'Quadratic-formula sign substitution',
        symptom: 'Using b instead of −b or losing the sign of c inside the discriminant.',
        correction: 'Identify a, b, c from standard form first; write −b and b²−4ac before inserting numbers.',
        quickCheck: 'For 2x²−3x−2=0: a=2, b=−3, c=−2, so −b=3.',
      },
      {
        id: 'QUAD_FACTOR_SIGNS',
        label: 'Choosing the wrong factor signs',
        symptom: 'Using factor signs whose product or middle-term sum does not match the quadratic.',
        correction: 'For x²+bx+c, choose constants whose product is c and whose sum is b, then multiply back to verify.',
        quickCheck: 'x²−6x+5=(x−1)(x−5): the constants multiply to +5 and add to −6.',
      },
      {
        id: 'QUAD_STOPPING_EARLY',
        label: 'Stopping before all roots are found',
        symptom: 'Factoring correctly but reporting only one factor equation.',
        correction: 'Apply the zero-product property to every factor that can equal zero.',
        quickCheck: '(x−4)(x+1)=0 gives x=4 or x=−1.',
      },
      {
        id: 'QUAD_VIETA_SWAP',
        label: 'Swapping sum and product of roots',
        symptom: 'Using c/a when the question asks for the sum, or −b/a when it asks for the product.',
        correction: 'For ax²+bx+c=0, sum of roots = −b/a and product of roots = c/a.',
        quickCheck: 'For x²−5x+6=0, sum=5 and product=6.',
      },
    ],
    workedExamples: [
      {
        title: 'Choose factoring when it is efficient',
        problem: 'Solve 2x² − 5x − 3 = 0.',
        strategy: 'Try factoring first because the integer coefficients produce a simple factor pair.',
        steps: [
          'Factor: 2x² − 5x − 3 = (2x + 1)(x − 3).',
          'Apply zero-product property: 2x+1=0 or x−3=0.',
          'Therefore x=−1/2 or x=3.',
        ],
        check: 'Substitute both roots into the original equation; each gives zero.',
        takeaway: 'Method selection matters: factoring is faster here than completing the square or using the formula.',
      },
      {
        title: 'Use the discriminant before computing roots',
        problem: 'Classify the roots of 3x² + 4x + 5 = 0.',
        strategy: 'Compute Δ=b²−4ac before attempting exact roots.',
        steps: ['Δ=4²−4(3)(5)=16−60=−44.', 'Because Δ<0, there are no real roots and there is one complex-conjugate pair.'],
        check: 'A graph of y=3x²+4x+5 stays above the x-axis, consistent with no real x-intercepts.',
        takeaway: 'The discriminant answers the root-type question without fully solving the equation.',
      },
    ],
    practiceQuestions: [
      { id: 'q-quad-1', subskill: 'Factoring', difficulty: 'Foundation', prompt: 'Solve x² − 7x + 12 = 0.', options: ['x=3 or 4', 'x=−3 or −4', 'x=2 or 6', 'x=−2 or −6'], correctIndex: 0, explanation: 'x²−7x+12=(x−3)(x−4), so x=3 or x=4.', misconceptionId: 'QUAD_STOPPING_EARLY' },
      { id: 'q-quad-2', subskill: 'Square-root method', difficulty: 'Standard', prompt: 'Solve (x−2)²=36.', options: ['x=8 only', 'x=−4 only', 'x=8 or −4', 'x=6 or −6'], correctIndex: 2, explanation: 'x−2=±6, so x=8 or x=−4.', misconceptionId: 'QUAD_MISSING_PM' },
      { id: 'q-quad-3', subskill: 'Discriminant', difficulty: 'Standard', prompt: 'What is the nature of the roots of 2x²+4x+5=0?', options: ['Two distinct real roots', 'One repeated real root', 'Two nonreal complex roots', 'Infinitely many roots'], correctIndex: 2, explanation: 'Δ=4²−4(2)(5)=16−40=−24<0, so the roots are nonreal complex conjugates.' },
      { id: 'q-quad-4', subskill: 'Quadratic formula', difficulty: 'Board-review style', prompt: 'Solve 2x²−3x−2=0.', options: ['x=2 or −1/2', 'x=−2 or 1/2', 'x=3/2 or −1', 'x=1 or −2'], correctIndex: 0, explanation: 'Using the formula gives x=(3±5)/4, so x=2 or x=−1/2.', misconceptionId: 'QUAD_FORMULA_SIGNS' },
      { id: 'q-quad-5', subskill: 'Method selection', difficulty: 'Mixed', prompt: 'Which method is most direct for x²=45?', options: ['Square-root method', 'Synthetic division', 'Cramer’s rule', 'Logarithms'], correctIndex: 0, explanation: 'The squared term is already isolated, so x=±√45=±3√5.' },
      { id: 'q-quad-6', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'A design relation reduces to I²−5I+6=0. What possible positive current values satisfy it?', options: ['I=1 A or 6 A', 'I=2 A or 3 A', 'I=−2 A or −3 A', 'I=5 A or 6 A'], correctIndex: 1, explanation: '(I−2)(I−3)=0, so I=2 A or I=3 A. Both are positive and satisfy the algebraic model.' },
      { id: 'q-quad-7', subskill: 'Root relationships', difficulty: 'Standard', prompt: 'For 2x²−5x−3=0, what is the sum of the roots?', options: ['5/2', '−5/2', '−3/2', '3/2'], correctIndex: 0, explanation: 'For ax²+bx+c=0, the sum of the roots is −b/a=−(−5)/2=5/2.' },
      { id: 'q-quad-8', subskill: 'Root relationships', difficulty: 'Standard', prompt: 'For x²+7x+10=0, what is the product of the roots?', options: ['10', '−10', '7', '−7'], correctIndex: 0, explanation: 'The product of the roots is c/a=10/1=10.' },
      { id: 'q-quad-9', subskill: 'Factoring', difficulty: 'Mixed', prompt: 'Solve x²−6x+5=0.', options: ['x=1 or 5', 'x=−1 or −5', 'x=2 or 3', 'x=−2 or −3'], correctIndex: 0, explanation: 'x²−6x+5=(x−1)(x−5), so x=1 or x=5.', misconceptionId: 'QUAD_FACTOR_SIGNS' },
      { id: 'q-quad-10', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'A simplified current model gives I²−5I+4=0. What current values satisfy the model?', options: ['1 A or 4 A', '−1 A or −4 A', '2 A or 3 A', '1 A or 5 A'], correctIndex: 0, explanation: '(I−1)(I−4)=0, so I=1 A or I=4 A.', misconceptionId: 'QUAD_FACTOR_SIGNS' },

      { id: 'q-quad-11', subskill: 'Root relationships', difficulty: 'Standard', prompt: 'For 2x²−5x+3=0, what is the sum of the roots?', options: ['5/2', '3/2', '−5/2', '−3/2'], correctIndex: 0, explanation: 'By Vieta, r₁+r₂=−b/a=5/2.', misconceptionId: 'QUAD_VIETA_SWAP' },
      { id: 'q-quad-12', subskill: 'Root relationships', difficulty: 'Standard', prompt: 'For 6x²+x−2=0, what is the product of the roots?', options: ['−1/3', '1/6', '−2', '1/3'], correctIndex: 0, explanation: 'By Vieta, r₁r₂=c/a=−2/6=−1/3.', misconceptionId: 'QUAD_VIETA_SWAP' },
      { id: 'q-quad-13', subskill: 'Discriminant', difficulty: 'Foundation', prompt: 'What is the discriminant of x²+6x+9=0?', options: ['0', '36', '−36', '9'], correctIndex: 0, explanation: 'b²−4ac=36−36=0, indicating a repeated real root.' },
      { id: 'q-quad-14', subskill: 'Square-root method', difficulty: 'Standard', prompt: 'Solve (x−4)²=9.', options: ['x=1 or 7', 'x=7 only', 'x=1 only', 'x=−1 or 7'], correctIndex: 0, explanation: 'x−4=±3, so x=1 or 7.', misconceptionId: 'QUAD_MISSING_PM' },
      { id: 'q-quad-15', subskill: 'Completing the square', difficulty: 'Board-review style', prompt: 'What number completes the square in x²+8x+___?', options: ['16', '8', '4', '64'], correctIndex: 0, explanation: 'Half of 8 is 4; 4²=16.' },
    ],
    eceBridge: [
      { title: 'Parameter roots in design equations', description: 'Quadratic equations can appear after eliminating variables or forming power/geometry constraints. The algebraic roots must still be checked against the physical domain.' },
    ],
    sources: [
      { book: 'College Algebra, 9th ed. — Michael Sullivan', role: 'Concept backbone', section: '1.2 Quadratic Equations', locator: 'pp. 92–103', use: 'Prerequisite checks; factoring, completing-the-square, quadratic-formula methods, and modeling objectives.', verificationStatus: 'verified-section-pages' },
      { book: 'College Algebra and Calculus: An Applied Approach, 2nd ed. — Larson & Hodgkins', role: 'Instructional design', section: '1.3 Quadratic Equations; 1.4 The Quadratic Formula', locator: 'pp. 93–114', use: 'Method sequence, immediate checkpoints, study/review pattern, and application framing.', verificationStatus: 'verified-section-pages' },
      { book: '1,001 Algebra II Practice Problems For Dummies — Mary Jane Sterling', role: 'Practice taxonomy', section: 'Ch. 2 Solving Quadratic Equations and Nonlinear Inequalities', locator: 'pp. 13–20', use: 'Square-root, factoring, formula, quadratic-like, completing-square, mixed-method, and inequality problem families plus recurring traps.', verificationStatus: 'verified-section-pages' },
    ],
  },

  'top-functions': {
    canonicalTopicId: 'top-functions',
    title: 'Relations & Functions',
    groupLabel: 'Functions & Graphs',
    shortDescription: 'Function definition, notation, evaluation, domain/range, representations, piecewise rules, and basic composition.',
    boardPriority: 'High',
    objectives: [
      { id: 'func-obj-1', text: 'Determine whether a relation is a function from mappings, ordered pairs, equations, or graphs.' },
      { id: 'func-obj-2', text: 'Use function notation and evaluate a function at numerical or algebraic inputs.' },
      { id: 'func-obj-3', text: 'Determine domain restrictions and describe the range from a rule or graph.' },
      { id: 'func-obj-4', text: 'Interpret functions as input-output rules represented symbolically, numerically, graphically, or verbally.' },
      { id: 'func-obj-5', text: 'Evaluate piecewise-defined functions using the correct branch.' },
      { id: 'func-obj-6', text: 'Form basic compositions and distinguish f(g(x)) from g(f(x)).' },
      { id: 'func-obj-7', text: 'Compute slope and use point-slope or slope-intercept forms for lines.' },
      { id: 'func-obj-8', text: 'Recognize vertical/horizontal shifts, reflections, and basic stretches/compressions from function notation.' },
    ],
    prerequisites: [
      { id: 'func-pre-1', label: 'Substitution', checkPrompt: 'If P(x)=2x+3, evaluate P(4).', answer: '11' },
      { id: 'func-pre-2', label: 'Intervals/inequalities', checkPrompt: 'Write x≥2 in interval notation.', answer: '[2, ∞)' },
      { id: 'func-pre-3', label: 'Domain restrictions', checkPrompt: 'For 1/(x−5), which x is excluded?', answer: 'x=5' },
    ],
    rules: [
      {
        title: 'Function rule',
        formula: 'x\\mapsto f(x)',
        meaning: 'Each allowed input corresponds to exactly one output.',
        commonError: 'Different inputs may share an output; what is forbidden is one input producing two different outputs in the same function.',
      },
      {
        title: 'Composition',
        formula: '(f\\circ g)(x)=f(g(x))',
        meaning: 'Evaluate the inner function first, then use its output as the input of the outer function.',
        commonError: 'Function composition is generally not commutative: f(g(x)) need not equal g(f(x)).',
      },
      {
        title: 'Rational-function domain',
        formula: 'Q(x)\\neq 0',
        meaning: 'If a function contains a rational expression P(x)/Q(x), exclude any input that makes Q(x)=0.',
      },
      { title: 'Slope of a line', formula: 'm=\\frac{y_2-y_1}{x_2-x_1}', meaning: 'Slope measures vertical change per unit horizontal change.', condition: 'For a nonvertical line, x₂−x₁ must be nonzero.', commonError: 'Reversing only one subtraction order instead of keeping numerator and denominator consistent.' },
      { title: 'Point-slope form', formula: 'y-y_1=m(x-x_1)', meaning: 'A line is determined by a point and its slope.', commonError: 'Losing the signs inside x−x₁ or y−y₁.' },
      { title: 'Graph transformations', formula: 'g(x)=a f(b(x-h))+k', meaning: 'h and k shift the graph; a and b control reflection and scale.', commonError: 'Horizontal changes act opposite the sign inside the function: f(x−h) shifts right h.' },
    ],
    misconceptions: [
      {
        id: 'FUNC_MULTI_OUTPUT',
        label: 'Misreading the function definition',
        symptom: 'Rejecting a relation because two different inputs have the same output.',
        correction: 'Repeated outputs are allowed. A relation fails to be a function only when the same input has more than one output.',
        quickCheck: '{(1,3),(2,3)} is a function; {(1,3),(1,4)} is not.',
      },
      {
        id: 'FUNC_COMPOSITION_ORDER',
        label: 'Reversing composition order',
        symptom: 'Computing g(f(x)) when asked for f(g(x)).',
        correction: 'Read f(g(x)) from inside out: compute g first, then feed that result into f.',
        quickCheck: 'If f(x)=x² and g(x)=x+1, then f(g(x))=(x+1)², while g(f(x))=x²+1.',
      },
      {
        id: 'FUNC_PIECEWISE_BRANCH',
        label: 'Wrong piecewise branch',
        symptom: 'Substituting into the first rule without checking the input condition.',
        correction: 'Locate the interval/condition containing the requested input before evaluating.',
        quickCheck: 'At a boundary, check whether < or ≤ includes the endpoint.',
      },
      { id: 'FUNC_INVERSE_RECIPROCAL', label: 'Treating inverse as reciprocal', symptom: 'Writing f⁻¹(x)=1/f(x).', correction: 'Interchange input/output variables and solve for the new output; an inverse function is not generally a reciprocal.', quickCheck: 'For f(x)=2x, f⁻¹(x)=x/2, not 1/(2x).' },
      { id: 'FUNC_DOMAIN_RESTRICTION', label: 'Missing domain restriction', symptom: 'Using values that make a denominator zero or an even radical negative.', correction: 'Determine the real-domain condition before evaluating or composing functions.', quickCheck: '√(5−x) requires x≤5.' },
      { id: 'FUNC_SLOPE_ORDER', label: 'Slope subtraction-order mismatch', symptom: 'Using y₂−y₁ over x₁−x₂.', correction: 'Use the same point order in numerator and denominator.', quickCheck: 'From (1,2) to (3,6), slope=(6−2)/(3−1)=2.' },
      { id: 'FUNC_SHIFT_DIRECTION', label: 'Horizontal shift direction reversed', symptom: 'Reading f(x−3) as a shift left 3.', correction: 'Inside horizontal shifts use the opposite sign: f(x−h) shifts right h.', quickCheck: 'y=(x−3)² has vertex at x=3.' },

    ],
    workedExamples: [
      {
        title: 'Test a relation for the function property',
        problem: 'Is {(−1,2),(0,3),(2,3),(4,5)} a function?',
        strategy: 'Inspect the first coordinate of every ordered pair.',
        steps: ['Inputs −1, 0, 2, and 4 each appear exactly once.', 'The repeated output 3 is allowed because it comes from different inputs.'],
        check: 'No input is paired with two different outputs.',
        takeaway: 'The function rule restricts outputs per input, not inputs per output.',
      },
      {
        title: 'Evaluate a composition',
        problem: 'Let f(x)=2x−1 and g(x)=x²+3. Find f(g(2)).',
        strategy: 'Evaluate from the inside outward.',
        steps: ['g(2)=2²+3=7.', 'f(7)=2(7)−1=13.'],
        check: 'Direct substitution into f(g(x))=2(x²+3)−1=2x²+5 gives 13 at x=2.',
        takeaway: 'Write the intermediate value to prevent composition-order errors.',
      },
      { title: 'Find a line from slope and point', problem: 'Find the line with slope 2 through (3,−1).', strategy: 'Use point-slope form, then simplify if desired.', steps: ['y−(−1)=2(x−3).', 'y+1=2x−6.', 'y=2x−7.'], check: 'At x=3, y=−1; the coefficient of x is slope 2.', takeaway: 'Point-slope form reduces sign errors when a point and slope are given.' },
      { title: 'Read a horizontal shift', problem: 'Describe the transformation from y=x² to y=(x−4)²+2.', strategy: 'Read the inside horizontal shift and outside vertical shift separately.', steps: ['x−4 shifts the parabola 4 units right.', '+2 shifts it 2 units up.', 'The vertex moves from (0,0) to (4,2).'], check: 'Substituting x=4 gives y=2, confirming the new vertex.', takeaway: 'Horizontal signs act opposite inside the function; vertical signs act directly outside.' },
    ],
    practiceQuestions: [
      { id: 'q-func-1', subskill: 'Function definition', difficulty: 'Foundation', prompt: 'Which relation is NOT a function?', options: ['{(1,2),(2,2),(3,4)}', '{(1,2),(1,3),(2,4)}', '{(−1,0),(0,0),(1,0)}', '{(2,5),(3,6),(4,7)}'], correctIndex: 1, explanation: 'Input 1 is paired with two different outputs, 2 and 3, so the relation is not a function.', misconceptionId: 'FUNC_MULTI_OUTPUT' },
      { id: 'q-func-2', subskill: 'Evaluation', difficulty: 'Foundation', prompt: 'If f(x)=3x²−2, find f(−2).', options: ['−14', '10', '14', '−10'], correctIndex: 1, explanation: 'f(−2)=3(4)−2=10.' },
      { id: 'q-func-3', subskill: 'Domain', difficulty: 'Standard', prompt: 'What is the domain restriction of f(x)=1/(x−4)?', options: ['x≠0', 'x≠1', 'x≠4', 'x≥4'], correctIndex: 2, explanation: 'The denominator cannot be zero, so x−4≠0 and x≠4.' },
      { id: 'q-func-4', subskill: 'Composition', difficulty: 'Mixed', prompt: 'If f(x)=x+2 and g(x)=3x, find f(g(4)).', options: ['14', '18', '20', '24'], correctIndex: 0, explanation: 'g(4)=12, then f(12)=14.', misconceptionId: 'FUNC_COMPOSITION_ORDER' },
      { id: 'q-func-5', subskill: 'Piecewise', difficulty: 'Board-review style', prompt: 'Let h(x)=x+1 for x<2 and h(x)=x² for x≥2. Find h(2).', options: ['3', '4', '2', 'Undefined'], correctIndex: 1, explanation: 'Because 2 satisfies x≥2, use h(x)=x², giving h(2)=4.', misconceptionId: 'FUNC_PIECEWISE_BRANCH' },
      { id: 'q-func-6', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'A sensor model is V(T)=0.02T+0.50. What output is predicted at T=25?', options: ['0.50 V', '0.75 V', '1.00 V', '1.50 V'], correctIndex: 2, explanation: 'V(25)=0.02(25)+0.50=0.50+0.50=1.00 V.' },
      { id: 'q-func-7', subskill: 'Composition', difficulty: 'Standard', prompt: 'If f(x)=2x+1 and g(x)=x², find (f∘g)(3).', options: ['19', '49', '10', '13'], correctIndex: 0, explanation: 'g(3)=9, then f(9)=2(9)+1=19.', misconceptionId: 'FUNC_COMPOSITION_ORDER' },
      { id: 'q-func-8', subskill: 'Inverse functions', difficulty: 'Standard', prompt: 'If f(x)=3x−6, which is f⁻¹(x)?', options: ['(x+6)/3', '(x−6)/3', '3x+6', '1/(3x−6)'], correctIndex: 0, explanation: 'Let y=3x−6, interchange x and y, then solve: y=(x+6)/3.', misconceptionId: 'FUNC_INVERSE_RECIPROCAL' },
      { id: 'q-func-9', subskill: 'Domain', difficulty: 'Mixed', prompt: 'What is the real domain of f(x)=√(5−x)?', options: ['x≤5', 'x≥5', 'x<5', 'All real numbers'], correctIndex: 0, explanation: 'The radicand must be nonnegative: 5−x≥0, so x≤5.', misconceptionId: 'FUNC_DOMAIN_RESTRICTION' },
      { id: 'q-func-10', subskill: 'Piecewise functions', difficulty: 'Board-review style', prompt: 'Let f(x)=x+2 for x<0 and f(x)=x² for x≥0. Find f(−3).', options: ['−1', '9', '1', '−9'], correctIndex: 0, explanation: 'Because −3<0, use x+2: −3+2=−1.', misconceptionId: 'FUNC_PIECEWISE_BRANCH' },

      { id: 'q-func-11', subskill: 'Line slope', difficulty: 'Foundation', prompt: 'What is the slope through (1,2) and (3,6)?', options: ['2', '1/2', '4', '−2'], correctIndex: 0, explanation: 'm=(6−2)/(3−1)=4/2=2.', misconceptionId: 'FUNC_SLOPE_ORDER' },
      { id: 'q-func-12', subskill: 'Line equation', difficulty: 'Standard', prompt: 'Which line has slope 3 and y-intercept −2?', options: ['y=3x−2', 'y=−2x+3', 'y=3x+2', 'x=3y−2'], correctIndex: 0, explanation: 'Slope-intercept form is y=mx+b.' },
      { id: 'q-func-13', subskill: 'Parallel/perpendicular lines', difficulty: 'Standard', prompt: 'What slope is perpendicular to a line with slope 2?', options: ['−1/2', '1/2', '−2', '2'], correctIndex: 0, explanation: 'Nonvertical perpendicular slopes are negative reciprocals.' },
      { id: 'q-func-14', subskill: 'Graph transformations', difficulty: 'Mixed', prompt: 'The graph of y=(x−3)² is y=x² shifted:', options: ['3 units right', '3 units left', '3 units up', '3 units down'], correctIndex: 0, explanation: 'f(x−3) shifts the parent function right 3.', misconceptionId: 'FUNC_SHIFT_DIRECTION' },
      { id: 'q-func-15', subskill: 'Graph transformations', difficulty: 'Board-review style', prompt: 'What transformation does y=−f(x) apply to y=f(x)?', options: ['Reflection across the x-axis', 'Reflection across the y-axis', 'Shift up 1', 'Horizontal compression'], correctIndex: 0, explanation: 'Multiplying the output by −1 reflects all y-values across the x-axis.' },
    ],
    eceBridge: [
      { title: 'Transfer relationships', description: 'ECE models often express one measured or computed quantity as a function of another. Function notation makes the input-output relationship explicit.' },
      { title: 'Calibration models', description: 'Linear or nonlinear calibration rules can be evaluated as functions, while valid operating ranges act like domain restrictions.' },
    ],
    sources: [
      { book: 'College Algebra, 9th ed. — Michael Sullivan', role: 'Concept backbone', section: '2.3 Lines; 3.1–3.5 Functions and Their Graphs', locator: 'pp. 167–181; 200–256', use: 'Slope/line forms plus relation/function definition, domain, graph properties, piecewise functions, and transformations.', verificationStatus: 'verified-section-pages' },
      { book: 'College Algebra and Calculus: An Applied Approach, 2nd ed. — Larson & Hodgkins', role: 'Instructional design', section: '2.2 Lines in the Plane; 2.4–2.7 Functions and Graphs', locator: 'pp. 172–182; 195–239', use: 'Line slope/equation checkpoints, input-output framing, graphs, transformations, and algebra of functions.', verificationStatus: 'verified-section-pages' },
      { book: '1,001 Algebra II Practice Problems For Dummies — Mary Jane Sterling', role: 'Practice taxonomy', section: 'Ch. 4 Graphs and Equations of Lines; Ch. 5 Functions', locator: 'pp. 27–38', use: 'Line-equation/slope drills plus domain/range, inverses, composition, and piecewise-evaluation practice families.', verificationStatus: 'verified-section-pages' },
    ],
  },

  'top-factoring': {
    canonicalTopicId: 'top-factoring',
    title: 'Factoring',
    groupLabel: 'Expressions & Polynomials',
    shortDescription: 'Factor completely using GCF, special products, trinomials, grouping, and a reliable strategy sequence.',
    boardPriority: 'High',
    objectives: [
      { id: 'fac-obj-1', text: 'Extract the greatest common factor before applying another factoring pattern.' },
      { id: 'fac-obj-2', text: 'Factor trinomials using inspection or the ac method and verify by expansion.' },
      { id: 'fac-obj-3', text: 'Recognize difference of squares and sum/difference of cubes.' },
      { id: 'fac-obj-4', text: 'Factor four-term expressions by grouping and identify common binomial factors.' },
      { id: 'fac-obj-5', text: 'Continue until every factor is irreducible over the requested number system.' },
    ],
    prerequisites: [
      { id: 'fac-pre-1', label: 'Greatest common factor', checkPrompt: 'What is the GCF of 12x³ and 18x²?', answer: '6x²' },
      { id: 'fac-pre-2', label: 'Distributive property', checkPrompt: 'Expand 3(x−2).', answer: '3x−6' },
      { id: 'fac-pre-3', label: 'Integer factor pairs', checkPrompt: 'Find two integers with product −12 and sum 1.', answer: '4 and −3' },
    ],
    rules: [
      { title: 'Factor out the GCF first', formula: 'ab+ac=a(b+c)', meaning: 'Find the greatest shared numerical and variable factor before testing special patterns.', commonError: 'Stopping after the GCF when the remaining factor can still be factored.' },
      { title: 'Difference of squares', formula: 'a^2-b^2=(a-b)(a+b)', meaning: 'A difference of two perfect squares factors into conjugates.', condition: 'The expression must be a difference; a²+b² does not factor over the reals.', commonError: 'Using the pattern on a sum of squares.' },
      { title: 'Sum and difference of cubes', formula: 'a^3\u00b1b^3=(a\u00b1b)(a^2\u2213ab+b^2)', meaning: 'The quadratic cofactor uses the opposite middle sign and a positive final term.', commonError: 'Giving the quadratic cofactor real roots by changing its final plus sign.' },
      { title: 'Trinomial check', formula: 'ac= a\u00b7c,\\quad m+n=b,\\quad mn=ac', meaning: 'For ax²+bx+c, split the middle term using a pair with product ac and sum b.', condition: 'After grouping, both groups must expose the same binomial factor.', commonError: 'Choosing a factor pair with the right product but the wrong sum.' },
    ],
    misconceptions: [
      { id: 'FAC_MISSING_GCF', label: 'Skipping the GCF', symptom: 'Applying a pattern while a common factor remains outside.', correction: 'Check coefficients and variable powers first, factor the GCF, then continue.', quickCheck: '6x²−24=6(x²−4)=6(x−2)(x+2).' },
      { id: 'FAC_SUM_SQUARES', label: 'Factoring a sum of squares over the reals', symptom: 'Treating a²+b² like a difference of squares.', correction: 'The difference-of-squares identity does not apply to a²+b². Do not force a conjugate factorization; test other identities only when the expression has additional structure.', quickCheck: 'x²+9 cannot be written as (x−3)(x+3); that product is x²−9.' },
      { id: 'FAC_CUBE_SIGNS', label: 'Wrong cube cofactor signs', symptom: 'Copying the same sign into every term of the quadratic cofactor.', correction: 'For a³+b³ use (a+b)(a²−ab+b²); for a³−b³ use (a−b)(a²+ab+b²).', quickCheck: 'x³−8=(x−2)(x²+2x+4).' },
      { id: 'FAC_NOT_COMPLETE', label: 'Stopping before factoring completely', symptom: 'Leaving a factor such as x²−9 after the first factorization step.', correction: 'Inspect every resulting factor for GCF and special products until none remain.', quickCheck: 'x⁴−16=(x²−4)(x²+4)=(x−2)(x+2)(x²+4).' },
    ],
    workedExamples: [
      { title: 'Factor a trinomial completely', problem: 'Factor 6x²−x−2.', strategy: 'Use the ac method, split the middle term, then group.', steps: ['Compute ac=6(−2)=−12; a pair with product −12 and sum −1 is 3 and −4.', 'Rewrite 6x²+3x−4x−2.', 'Group: 3x(2x+1)−2(2x+1).', 'Factor the common binomial: (3x−2)(2x+1).'], check: 'Expansion gives 6x²+3x−4x−2=6x²−x−2.', takeaway: 'Grouping verifies that the chosen middle-term split exposes a common factor.' },
      { title: 'Combine GCF and difference of squares', problem: 'Factor 3x³−27x.', strategy: 'Take out the GCF before testing the remaining expression.', steps: ['Factor 3x: 3x(x²−9).', 'Recognize x²−9 as x²−3².', 'Factor the difference of squares: 3x(x−3)(x+3).'], check: 'The factors multiply back to 3x³−27x.', takeaway: 'A factoring pattern may appear only after the GCF is removed.' },
    ],
    practiceQuestions: [
      { id: 'q-fac-1', subskill: 'GCF and special products', difficulty: 'Foundation', prompt: 'Factor 8x³−32x completely.', options: ['8x(x−2)(x+2)', '8x(x²−4x+4)', '4x(2x−4)', '8(x−2)(x+2)'], correctIndex: 0, explanation: 'Factor 8x to get 8x(x²−4), then factor the difference of squares.', misconceptionId: 'FAC_MISSING_GCF' },
      { id: 'q-fac-2', subskill: 'Trinomials', difficulty: 'Standard', prompt: 'Factor 2x²+7x+3.', options: ['(2x+1)(x+3)', '(2x+3)(x+1)', '(x+7)(2x+3)', '(2x−1)(x−3)'], correctIndex: 0, explanation: '(2x+1)(x+3)=2x²+7x+3.' },
      { id: 'q-fac-3', subskill: 'Grouping', difficulty: 'Standard', prompt: 'Factor x³+2x²−9x−18.', options: ['(x+2)(x−3)(x+3)', '(x−2)(x−3)(x+3)', '(x+2)(x²+9)', '(x−3)(x²+6)'], correctIndex: 0, explanation: 'Group x²(x+2)−9(x+2), then factor (x+2)(x²−9)=(x+2)(x−3)(x+3).' },
      { id: 'q-fac-4', subskill: 'Cubes', difficulty: 'Mixed', prompt: 'Factor x³−27 over the reals.', options: ['(x−3)(x²+3x+9)', '(x−3)(x²−3x+9)', '(x+3)(x²−3x+9)', 'Prime'], correctIndex: 0, explanation: 'Use a³−b³=(a−b)(a²+ab+b²).' , misconceptionId: 'FAC_CUBE_SIGNS' },
      { id: 'q-fac-5', subskill: 'Complete factoring', difficulty: 'Board-review style', prompt: 'Which is the complete real factorization of x⁴−5x²+4?', options: ['(x−1)(x+1)(x−2)(x+2)', '(x²+1)(x²−4)', '(x²−5)(x²+1)', '(x²−2)²'], correctIndex: 0, explanation: 'Treat it as a quadratic in x²: (x²−1)(x²−4), then factor each difference of squares.', misconceptionId: 'FAC_NOT_COMPLETE' },
      { id: 'q-fac-6', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'A model has gain numerator G(s)=s²−25. Which factorization exposes its two real zero locations?', options: ['(s−5)(s+5)', '(s−25)(s+1)', '(s−5)²', 'It is irreducible over the reals'], correctIndex: 0, explanation: 'The numerator is a difference of squares, so its zeros are s=5 and s=−5.' },
      { id: 'q-fac-7', subskill: 'Greatest common factor', difficulty: 'Foundation', prompt: 'Factor 6x³−9x² completely.', options: ['3x²(2x−3)', '3x(2x²−3x)', 'x²(6x−9)', '3x²(2x+3)'], correctIndex: 0, explanation: 'The greatest common factor is 3x², giving 3x²(2x−3).', misconceptionId: 'FAC_NOT_COMPLETE' },
      { id: 'q-fac-8', subskill: 'Perfect-square trinomials', difficulty: 'Standard', prompt: 'Factor x²−10x+25.', options: ['(x−5)²', '(x+5)²', '(x−25)(x+1)', '(x−5)(x+5)'], correctIndex: 0, explanation: 'x²−10x+25=x²−2(5)x+5²=(x−5)².', misconceptionId: 'FAC_NOT_COMPLETE' },
      { id: 'q-fac-9', subskill: 'Sum of cubes', difficulty: 'Standard', prompt: 'Factor x³+27 completely.', options: ['(x+3)(x²−3x+9)', '(x+3)(x²+3x+9)', '(x−3)(x²+3x+9)', '(x+9)(x²−3)'], correctIndex: 0, explanation: 'a³+b³=(a+b)(a²−ab+b²), so x³+3³=(x+3)(x²−3x+9).', misconceptionId: 'FAC_CUBE_SIGNS' },
      { id: 'q-fac-10', subskill: 'General trinomials', difficulty: 'Board-review style', prompt: 'Factor 2x²−x−6 completely.', options: ['(2x+3)(x−2)', '(2x−3)(x+2)', '(2x+1)(x−6)', '(x+3)(2x−2)'], correctIndex: 0, explanation: '(2x+3)(x−2)=2x²−4x+3x−6=2x²−x−6.', misconceptionId: 'FAC_NOT_COMPLETE' },

    ],
    eceBridge: [{ title: 'Transfer-function zeros', description: 'Factoring a numerator helps identify zeros of a transfer function. Model constraints still determine which roots are physically meaningful.' }, { title: 'Circuit polynomial simplification', description: 'GCF and special-product factoring can expose shared factors before algebraic cancellation; domain restrictions must be retained.' }],
    sources: [
      { book: 'College Algebra, 9th ed. — Michael Sullivan', role: 'Concept backbone', section: 'R.5 Factoring Polynomials', locator: 'pp. 49–57', use: 'Factoring objectives and sequence: special products, trinomials, grouping, and completing the square.', verificationStatus: 'verified-section-pages' },
      { book: 'College Algebra and Calculus: An Applied Approach, 2nd ed. — Larson & Hodgkins', role: 'Instructional design', section: '0.6 Factoring', locator: 'pp. 48–54', use: 'Worked-example progression from common factors through special forms, trinomials, grouping, and complete-factor checks.', verificationStatus: 'verified-section-pages' },
      { book: '1,001 Algebra II Practice Problems For Dummies — Mary Jane Sterling', role: 'Practice taxonomy', section: 'Ch. 2 factoring practice; Ch. 7 polynomial functions/equations', locator: 'p. 14; pp. 45–49', use: 'Practice support for factorable quadratics, grouping, roots, and synthetic division. GCF and special-product scope is verified primarily against Sullivan and Larson.', verificationStatus: 'verified-section-pages' },
    ],
  },

  'top-polynomial-eq': {
    canonicalTopicId: 'top-polynomial-eq',
    title: 'Polynomials',
    groupLabel: 'Expressions & Polynomials',
    shortDescription: 'Classify, combine, multiply, divide, and evaluate polynomials with structure and sign control.',
    boardPriority: 'High',
    objectives: [
      { id: 'poly-obj-1', text: 'Classify polynomials by degree and number of terms and write them in standard form.' },
      { id: 'poly-obj-2', text: 'Add and subtract polynomials by combining like powers.' },
      { id: 'poly-obj-3', text: 'Multiply polynomials and use special-product patterns accurately.' },
      { id: 'poly-obj-4', text: 'Use long or synthetic division when the divisor permits it.' },
      { id: 'poly-obj-5', text: 'Apply the remainder and factor theorems to evaluate or test factors.' },
    ],
    prerequisites: [
      { id: 'poly-pre-1', label: 'Like terms', checkPrompt: 'Simplify 4x²−x²+3x.', answer: '3x²+3x' },
      { id: 'poly-pre-2', label: 'Exponent addition', checkPrompt: 'Simplify x³·x².', answer: 'x⁵' },
      { id: 'poly-pre-3', label: 'Distributive property', checkPrompt: 'Expand (x+2)(x−3).', answer: 'x²−x−6' },
    ],
    rules: [
      { title: 'Standard form and degree', formula: 'a_nx^n+\u22ef+a_1x+a_0', meaning: 'Write terms in descending powers; the degree is the highest exponent with a nonzero coefficient.', condition: 'Polynomial exponents are nonnegative integers.', commonError: 'Calling a missing term the degree or retaining a zero leading coefficient.' },
      { title: 'Polynomial operations', formula: '(a_nx^n+\u22ef)+(b_nx^n+\u22ef)', meaning: 'Combine coefficients only for matching powers; multiplication distributes every term across every term.', commonError: 'Combining unlike powers or omitting one product in a binomial expansion.' },
      { title: 'Remainder theorem', formula: 'P(x)=(x-c)Q(x)+P(c)', meaning: 'The remainder upon division by x−c is P(c).', condition: 'For synthetic division, use the zero c corresponding to divisor x−c.', commonError: 'Using the opposite sign from the divisor root.' },
      { title: 'Degree rules', formula: '\\deg(PQ)=\\deg(P)+\\deg(Q)', meaning: 'For nonzero polynomials, product degrees add; sum degrees may decrease through cancellation.', commonError: 'Assuming the degree of a sum always equals the larger degree.' },
    ],
    misconceptions: [
      { id: 'POLY_UNLIKE_TERMS', label: 'Combining unlike powers', symptom: 'Adding coefficients of x² and x as if they were like terms.', correction: 'Group terms by the exact exponent before combining coefficients.', quickCheck: '2x²+3x²−x=5x²−x.' },
      { id: 'POLY_SUBTRACTION_SIGN', label: 'Lost signs in subtraction', symptom: 'Subtracting only the first term of the second polynomial.', correction: 'Distribute the negative sign through every term in parentheses.', quickCheck: '(3x²+x)−(x²−4x)=2x²+5x.' },
      { id: 'POLY_MISSING_PRODUCT', label: 'Incomplete multiplication', symptom: 'Using FOIL but missing a cross product or sign.', correction: 'Write each term-by-term product once, then collect like terms.', quickCheck: '(x+2)(x−3)=x²−x−6.' },
      { id: 'POLY_REMAINDER_SIGN', label: 'Wrong synthetic-division value', symptom: 'Using c with the wrong sign for divisor x+c.', correction: 'Set the divisor equal to zero: x+c=0 gives c-value −c.', quickCheck: 'For x+2, synthetic division uses −2.' },
      { id: 'POLY_NEGATIVE_INPUT', label: 'Negative-input sign error', symptom: 'Substituting a negative value without parentheses and losing the effect of odd/even powers.', correction: 'Substitute the entire negative input in parentheses before applying exponents.', quickCheck: 'If x=−2, then x³=(−2)³=−8 but x²=4.' },

      { id: 'POLY_MISSING_TERMS', label: 'Missing zero coefficients in division', symptom: 'Skipping a missing power when setting up long or synthetic division.', correction: 'Insert a zero coefficient for every missing degree so columns remain aligned.', quickCheck: 'x³−8 is x³+0x²+0x−8 for division.' },
    ],
    workedExamples: [
      { title: 'Add and subtract in standard form', problem: '(4x³−2x²+5x−7)−(x³+3x²−2x+4).', strategy: 'Distribute the subtraction sign, align like powers, then combine coefficients.', steps: ['Rewrite as 4x³−2x²+5x−7−x³−3x²+2x−4.', 'Combine: (4−1)x³+(−2−3)x²+(5+2)x+(−7−4).', 'Result: 3x³−5x²+7x−11.'], check: 'Substitute x=1 in both the original expression and the result; both equal −6.', takeaway: 'The parentheses on the subtracted polynomial protect every sign.' },
      { title: 'Use the remainder theorem', problem: 'Find the remainder when P(x)=x³−2x+5 is divided by x−2.', strategy: 'Evaluate P at the zero of the divisor.', steps: ['Set x−2=0, so c=2.', 'Compute P(2)=2³−2(2)+5.', 'P(2)=8−4+5=9; the remainder is 9.'], check: 'Polynomial division gives quotient x²+2x+2 and remainder 9.', takeaway: 'Remainder evaluation avoids a full division when only the remainder is needed.' },
    ],
    practiceQuestions: [
      { id: 'q-poly-1', subskill: 'Addition and subtraction', difficulty: 'Foundation', prompt: 'Simplify (2x²−3x+1)+(x²+5x−4).', options: ['3x²+2x−3', '3x²−8x+5', 'x²+2x−3', '3x²+2x+5'], correctIndex: 0, explanation: 'Combine matching powers: 3x²+2x−3.', misconceptionId: 'POLY_UNLIKE_TERMS' },
      { id: 'q-poly-2', subskill: 'Multiplication', difficulty: 'Standard', prompt: 'Expand (2x−3)(x+4).', options: ['2x²+5x−12', '2x²+11x−12', '2x²−5x+12', '2x²−x−12'], correctIndex: 0, explanation: 'The products are 2x²+8x−3x−12=2x²+5x−12.', misconceptionId: 'POLY_MISSING_PRODUCT' },
      { id: 'q-poly-3', subskill: 'Remainder theorem', difficulty: 'Standard', prompt: 'What is the remainder when x³−2x+5 is divided by x−2?', options: ['9', '5', '1', '−9'], correctIndex: 0, explanation: 'Evaluate P(2)=8−4+5=9.' },
      { id: 'q-poly-4', subskill: 'Degree', difficulty: 'Mixed', prompt: 'What is the degree of (x²+1)(3x⁴−x+2)?', options: ['6', '5', '4', '8'], correctIndex: 0, explanation: 'The factors have degrees 2 and 4, so their nonzero product has degree 6.' },
      { id: 'q-poly-5', subskill: 'Synthetic division', difficulty: 'Board-review style', prompt: 'Which value is used in synthetic division by x+3?', options: ['−3', '3', '1/3', '0'], correctIndex: 0, explanation: 'The divisor root solves x+3=0, so use −3.', misconceptionId: 'POLY_REMAINDER_SIGN' },
      { id: 'q-poly-6', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'A polynomial model P(f)=2f²+3f−1 is evaluated at f=2. What is P(2)?', options: ['13', '9', '11', '15'], correctIndex: 0, explanation: 'P(2)=2(4)+3(2)−1=8+6−1=13.' },
      { id: 'q-poly-7', subskill: 'Degree', difficulty: 'Foundation', prompt: 'What is the degree of 7−3x⁴+2x²?', options: ['4', '3', '2', '7'], correctIndex: 0, explanation: 'The highest exponent with nonzero coefficient is 4.' },
      { id: 'q-poly-8', subskill: 'Leading coefficient', difficulty: 'Foundation', prompt: 'What is the leading coefficient of −5x³+2x−9?', options: ['−5', '5', '3', '−9'], correctIndex: 0, explanation: 'In standard form, the highest-degree term is −5x³, so the leading coefficient is −5.' },
      { id: 'q-poly-9', subskill: 'Polynomial division', difficulty: 'Mixed', prompt: 'Divide x³−8 by x−2. What is the quotient?', options: ['x²+2x+4', 'x²−2x+4', 'x²+4', 'x²+2x−4'], correctIndex: 0, explanation: 'x³−8=(x−2)(x²+2x+4), so the quotient is x²+2x+4.', misconceptionId: 'POLY_MISSING_TERMS' },
      { id: 'q-poly-10', subskill: 'Evaluation', difficulty: 'Standard', prompt: 'If P(x)=2x³−x+3, find P(−1).', options: ['2', '0', '−4', '6'], correctIndex: 0, explanation: 'P(−1)=2(−1)³−(−1)+3=−2+1+3=2.', misconceptionId: 'POLY_NEGATIVE_INPUT' },

    ],
    eceBridge: [{ title: 'Polynomial transfer models', description: 'Polynomial algebra supports evaluating and simplifying transfer-function numerators and denominators before factoring or root analysis.' }],
    sources: [
      { book: 'College Algebra, 9th ed. — Michael Sullivan', role: 'Concept backbone', section: 'R.4 Polynomials; R.6 Synthetic Division', locator: 'pp. 39–48; 58–61', use: 'Definitions, degree, operations, long division, synthetic division, and remainder structure.', verificationStatus: 'verified-section-pages' },
      { book: 'College Algebra and Calculus: An Applied Approach, 2nd ed. — Larson & Hodgkins', role: 'Instructional design', section: '0.5 Polynomials and Special Products; 3.3 Polynomial Division', locator: 'pp. 40–47; 272–281', use: 'Examples/checkpoints for standard form and operations, then long/synthetic division, Remainder Theorem, and Factor Theorem.', verificationStatus: 'verified-section-pages' },
      { book: '1,001 Algebra II Practice Problems For Dummies — Mary Jane Sterling', role: 'Practice taxonomy', section: 'Ch. 7 Polynomial Functions and Equations', locator: 'pp. 45–50', use: 'Practice support for polynomial roots/intercepts, grouping, rational-root work, synthetic division, evaluation, and graph behavior. Basic polynomial operations are verified against Sullivan and Larson.', verificationStatus: 'verified-section-pages' },
    ],
  },

  'top-laws-exponents': {
    canonicalTopicId: 'top-laws-exponents',
    title: 'Exponents & Radicals',
    groupLabel: 'Algebra Fundamentals',
    shortDescription: 'Apply integer and rational exponent laws, simplify radicals, and rationalize denominators with domain care.',
    boardPriority: 'High',
    objectives: [
      { id: 'exp-obj-1', text: 'Simplify products, quotients, powers, zero exponents, and negative exponents.' },
      { id: 'exp-obj-2', text: 'Convert rational exponents to radical form and simplify using real-domain conditions.' },
      { id: 'exp-obj-3', text: 'Simplify radicals by extracting perfect powers and combining like radicals.' },
      { id: 'exp-obj-4', text: 'Rationalize monomial and binomial denominators using conjugates when needed.' },
      { id: 'exp-obj-5', text: 'Preserve restrictions and distinguish even-root and odd-root behavior.' },
    ],
    prerequisites: [
      { id: 'exp-pre-1', label: 'Integer exponents', checkPrompt: 'Simplify 2³·2².', answer: '2⁵=32' },
      { id: 'exp-pre-2', label: 'Perfect squares', checkPrompt: 'Simplify √72.', answer: '6√2' },
      { id: 'exp-pre-3', label: 'Fraction reduction', checkPrompt: 'Reduce 6/8.', answer: '3/4' },
    ],
    rules: [
      { title: 'Product and quotient rules', formula: 'a^m a^n=a^{m+n},\\quad a^m/a^n=a^{m-n}', meaning: 'For the same nonzero base, add exponents when multiplying and subtract when dividing.', condition: 'The quotient rule requires a≠0.', commonError: 'Adding exponents when bases differ or applying quotient rules to a zero base.' },
      { title: 'Zero and negative exponents', formula: 'a^0=1,\\quad a^{-n}=1/a^n', meaning: 'A zero exponent gives one for a nonzero base; a negative exponent means reciprocal.', condition: 'a≠0.', commonError: 'Interpreting a negative exponent as a negative value.' },
      { title: 'Rational exponents', formula: 'a^{m/n}=\\sqrt[n]{a^m}', meaning: 'The denominator n indicates the root and the numerator m indicates the power.', condition: 'In real-number work, reduce the rational exponent first; when the reduced denominator n is even, require a≥0. Negative exponents additionally require a≠0.', commonError: 'Ignoring the real-domain restriction or misreading m/n as n/m.' },
      { title: 'Conjugate rationalization', formula: '(a+b)(a-b)=a^2-b^2', meaning: 'Multiply a binomial radical denominator by its conjugate to remove the radical term.', condition: 'Multiply numerator and denominator by the same conjugate.', commonError: 'Multiplying only the denominator or changing the value of the fraction.' },
    ],
    misconceptions: [
      { id: 'EXP_ADD_EXPONENTS', label: 'Adding exponents across unlike bases', symptom: 'Applying a^m a^n when the bases are different.', correction: 'Combine exponents only when the bases match; simplify bases first if possible.', quickCheck: '2³·3³=(2·3)³=216, not 6⁶.' },
      { id: 'EXP_NEGATIVE_POWER', label: 'Treating negative exponent as negative value', symptom: 'Changing the sign of the expression instead of taking a reciprocal.', correction: 'Move the factor across the fraction bar and make its exponent positive.', quickCheck: 'x⁻³=1/x³ for x≠0.' },
      { id: 'EXP_POWER_RULE', label: 'Misapplying the power rules', symptom: 'Failing to multiply exponents in a power of a power or applying the rule to only part of a product.', correction: 'Apply the outer exponent to every factor, and multiply exponents: (a^m)^n=a^{mn}.', quickCheck: '(x³y⁻²)²=x⁶y⁻⁴.' },
      { id: 'EXP_RATIONAL_EXPONENT', label: 'Reversing a rational exponent', symptom: 'Treating a^{m/n} as an nth power followed by an mth root or swapping m and n.', correction: 'The denominator is the root index and the numerator is the power: a^{m/n}=(\\sqrt[n]{a})^m.', quickCheck: '27^(2/3)=(∛27)²=9.' },
      { id: 'RADICAL_SIMPLIFICATION', label: 'Missing a perfect-power factor', symptom: 'Leaving a radical unsimplified or extracting a non-perfect factor.', correction: 'Factor the radicand and extract the largest perfect square (or perfect nth power) available.', quickCheck: '√72=√(36·2)=6√2.' },
      { id: 'RADICAL_RATIONALIZE', label: 'Rationalizing only one side of a fraction', symptom: 'Changing the denominator without multiplying the numerator by the same factor.', correction: 'Multiply numerator and denominator by the same radical or conjugate so the fraction keeps its value.', quickCheck: '5/√5 · √5/√5 = √5.' },
      { id: 'RADICAL_DOMAIN', label: 'Dropping even-root restrictions', symptom: 'Combining radicals without checking real radicands.', correction: 'State restrictions before simplification; an even real root needs a nonnegative radicand.', quickCheck: '√(x−2) is real only for x≥2.' },
      { id: 'RADICAL_SUM', label: 'Combining unlike radicals', symptom: 'Adding √2 and √3 as if they were like terms.', correction: 'Simplify each radical first; combine only identical radical parts.', quickCheck: '2√3+5√3=7√3, while √2+√3 stays as written.' },
    ],
    workedExamples: [
      { title: 'Simplify powers with negative exponents', problem: '(x³y⁻²)²/x⁴, for x≠0 and y≠0.', strategy: 'Apply the power rule first, divide matching bases, then write positive exponents.', steps: ['Raise each factor: x⁶y⁻⁴/x⁴.', 'Subtract x exponents: x²y⁻⁴.', 'Rewrite the negative exponent: x²/y⁴.'], check: 'At x=2,y=1 the original and simplified expressions both equal 4.', takeaway: 'The order of exponent rules matters less than keeping bases and restrictions explicit.' },
      { title: 'Rationalize a binomial radical denominator', problem: 'Simplify 1/(√5−2).', strategy: 'Multiply by the conjugate so the denominator becomes a difference of squares.', steps: ['Multiply numerator and denominator by (√5+2).', 'Denominator: (√5−2)(√5+2)=5−4=1.', 'Result: √5+2.'], check: '(√5−2)(√5+2)=1, so multiplying by √5+2 gives a reciprocal denominator of 1.', takeaway: 'Conjugates remove the radical cross terms.' },
    ],
    practiceQuestions: [
      { id: 'q-exp-1', subskill: 'Exponent laws', difficulty: 'Foundation', prompt: 'Simplify (x³y⁻²)²/x⁴, assuming x,y≠0.', options: ['x²/y⁴', 'x²y⁴', '1/(x²y⁴)', 'x⁶/y²'], correctIndex: 0, explanation: 'Raise powers to get x⁶y⁻⁴/x⁴=x²y⁻⁴=x²/y⁴.', misconceptionId: 'EXP_NEGATIVE_POWER' },
      { id: 'q-exp-2', subskill: 'Radical simplification', difficulty: 'Foundation', prompt: 'Simplify √72.', options: ['6√2', '8√2', '3√8', '36√2'], correctIndex: 0, explanation: '√72=√(36·2)=6√2.' },
      { id: 'q-exp-3', subskill: 'Rational exponents', difficulty: 'Standard', prompt: 'For x≥0, simplify x^(3/2)·x^(1/2).', options: ['x²', 'x³', 'x', 'x^(3/4)'], correctIndex: 0, explanation: 'The bases match, so add exponents: x^(3/2+1/2)=x².' },
      { id: 'q-exp-4', subskill: 'Like radicals', difficulty: 'Standard', prompt: 'Simplify 2√12+√27.', options: ['7√3', '5√3', '7√39', '3√39'], correctIndex: 0, explanation: '√12=2√3 and √27=3√3, so 2(2√3)+3√3=7√3.', misconceptionId: 'RADICAL_SUM' },
      { id: 'q-exp-5', subskill: 'Radical domains', difficulty: 'Mixed', prompt: 'For which real x is √(2x−6) defined?', options: ['x≥3', 'x≤3', 'x>−3', 'all real x'], correctIndex: 0, explanation: 'Require 2x−6≥0, giving x≥3.', misconceptionId: 'RADICAL_DOMAIN' },
      { id: 'q-exp-6', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'A power expression is P=V²/R. If V=12 and R=8, what is P?', options: ['18', '12', '24', '36'], correctIndex: 0, explanation: 'P=12²/8=144/8=18.' },
      { id: 'q-exp-7', subskill: 'Exponent laws', difficulty: 'Standard', prompt: 'Simplify (x³y⁻²)² using positive exponents.', options: ['x⁶/y⁴', 'x⁵/y⁴', 'x⁶/y²', 'x⁹/y⁴'], correctIndex: 0, explanation: 'Apply the power rule: x⁶y⁻⁴=x⁶/y⁴.', misconceptionId: 'EXP_POWER_RULE' },
      { id: 'q-exp-8', subskill: 'Radical simplification', difficulty: 'Foundation', prompt: 'Simplify √72.', options: ['6√2', '8√2', '3√8', '12√2'], correctIndex: 0, explanation: '72=36·2, so √72=6√2.', misconceptionId: 'RADICAL_SIMPLIFICATION' },
      { id: 'q-exp-9', subskill: 'Rational exponents', difficulty: 'Standard', prompt: 'Evaluate 27^(2/3).', options: ['9', '6', '18', '3'], correctIndex: 0, explanation: '27^(2/3)=(∛27)²=3²=9.', misconceptionId: 'EXP_RATIONAL_EXPONENT' },
      { id: 'q-exp-10', subskill: 'Rationalizing denominators', difficulty: 'Board-review style', prompt: 'Rationalize 5/√5.', options: ['√5', '5√5', '1/√5', '25/√5'], correctIndex: 0, explanation: 'Multiply numerator and denominator by √5: 5√5/5=√5.', misconceptionId: 'RADICAL_RATIONALIZE' },

    ],
    eceBridge: [{ title: 'Power and gain calculations', description: 'Exponent rules appear in power, inverse-square, and signal scaling formulas; unit and domain checks remain part of the calculation.' }, { title: 'Radical impedances', description: 'Radical simplification and conjugates support exact-form manipulation in AC circuit expressions.' }],
    sources: [
      { book: 'College Algebra, 9th ed. — Michael Sullivan', role: 'Concept backbone', section: 'R.2 Algebra Essentials; R.8 nth Roots; Rational Exponents', locator: 'pp. 21–24; 73–80', use: 'Laws of exponents, square roots, nth roots, radical simplification, rationalizing denominators, and rational exponents.', verificationStatus: 'verified-section-pages' },
      { book: 'College Algebra and Calculus: An Applied Approach, 2nd ed. — Larson & Hodgkins', role: 'Instructional design', section: '0.3 Integer Exponents; 0.4 Radicals and Rational Exponents', locator: 'pp. 20–39', use: 'Warm-up, example, checkpoint, and mixed sequencing for exponent properties, radicals, rational exponents, and rationalization.', verificationStatus: 'verified-section-pages' },
      { book: '1,001 Algebra II Practice Problems For Dummies — Mary Jane Sterling', role: 'Practice taxonomy', section: 'Ch. 1 Reviewing Algebra Basics — Making Radical Expressions Simpler', locator: 'pp. 10–11', use: 'Supplementary practice for radical simplification and related algebraic manipulation. General exponent-law coverage is verified against Sullivan and Larson.', verificationStatus: 'verified-section-pages' },
    ],
  },

  'top-inequalities': {
    canonicalTopicId: 'top-inequalities',
    title: 'Inequalities',
    groupLabel: 'Equations & Inequalities',
    shortDescription: 'Solve and represent linear, compound, absolute-value, polynomial, and rational inequalities.',
    boardPriority: 'High',
    objectives: [
      { id: 'ineq-obj-1', text: 'Solve linear inequalities and reverse the sign when multiplying or dividing by a negative.' },
      { id: 'ineq-obj-2', text: 'Translate compound inequalities into interval notation and number-line meaning.' },
      { id: 'ineq-obj-3', text: 'Solve absolute-value inequalities using distance cases and endpoint inclusion.' },
      { id: 'ineq-obj-4', text: 'Use critical points and sign charts for polynomial and rational inequalities.' },
      { id: 'ineq-obj-5', text: 'Respect excluded denominator values and strict versus inclusive endpoints.' },
    ],
    prerequisites: [
      { id: 'ineq-pre-1', label: 'Signed arithmetic', checkPrompt: 'Solve −2x=6.', answer: 'x=−3' },
      { id: 'ineq-pre-2', label: 'Interval notation', checkPrompt: 'Write x≥−1 and x<4 as an interval.', answer: '[−1,4)' },
      { id: 'ineq-pre-3', label: 'Factoring', checkPrompt: 'Factor x²−x−6.', answer: '(x−3)(x+2)' },
    ],
    rules: [
      { title: 'Negative multiplication rule', formula: 'a<b\\;\\Longrightarrow\\;-a>-b', meaning: 'Multiplying or dividing both sides by a negative reverses the inequality direction.', commonError: 'Keeping the same sign after dividing by a negative coefficient.' },
      { title: 'Absolute-value distance', formula: '|u|<a\\;\\Longleftrightarrow\\;-a<u<a', meaning: 'A strict absolute-value bound describes points within a distance a of zero.', condition: 'For a>0, |u|>a means u<−a or u>a. If a<0, |u|<a has no real solution while |u|>a is true for every real u.', commonError: 'Using AND for the outside case or OR for the inside case.' },
      { title: 'Sign-chart method', formula: '(x-r_1)(x-r_2)\\gtrless0', meaning: 'Critical zeros divide the real line into intervals where each factor sign is constant.', condition: 'Include zeros only for non-strict inequalities; rational denominator zeros are always excluded.', commonError: 'Including a denominator zero or checking only one interval.' },
      { title: 'Interval endpoints', formula: '[a,b],\\;(a,b),\\;(-\\infty,a)', meaning: 'Use brackets for included finite endpoints and parentheses for excluded endpoints or infinity.', commonError: 'Including a root for a strict inequality or a forbidden rational value.' },
    ],
    misconceptions: [
      { id: 'INEQ_NO_FLIP', label: 'Not reversing after a negative division', symptom: 'Dividing by a negative but leaving the inequality sign unchanged.', correction: 'Reverse < to > (or ≤ to ≥) whenever multiplying or dividing both sides by a negative.', quickCheck: '−3x>6 gives x<−2.' },
      { id: 'INEQ_AND_OR', label: 'Mixing inside and outside absolute-value cases', symptom: 'Using a union for |u|<a or an intersection for |u|>a.', correction: 'Less-than is between the boundaries (AND); greater-than is outside (OR).', quickCheck: '|x|<3 gives (−3,3); |x|>3 gives (−∞,−3)∪(3,∞).' },
      { id: 'INEQ_ENDPOINTS', label: 'Wrong endpoint inclusion', symptom: 'Using a bracket at a strict boundary or including a denominator zero.', correction: 'Test equality in the original inequality; denominator zeros remain excluded in every case.', quickCheck: 'x²−1<0 gives (−1,1), not [−1,1].' },
      { id: 'INEQ_SIGN_CHART', label: 'Assuming signs without testing intervals', symptom: 'Choosing regions from roots alone without checking factor signs.', correction: 'Mark every critical point, test one point per interval, and respect strictness.', quickCheck: '(x−2)(x+1)≤0 holds between its roots: [−1,2].' },
    ],
    workedExamples: [
      { title: 'Reverse the sign when dividing by a negative', problem: 'Solve −3x+4>10.', strategy: 'Isolate the variable, then reverse the direction when dividing by −3.', steps: ['Subtract 4: −3x>6.', 'Divide both sides by −3 and reverse > to <.', 'Solution: x<−2, or (−∞,−2).'], check: 'x=−3 satisfies the inequality; x=0 does not.', takeaway: 'The sign reversal is tied to multiplying or dividing both sides by a negative.' },
      { title: 'Use a sign chart for a polynomial inequality', problem: 'Solve (x−2)(x+1)≤0.', strategy: 'Find critical zeros, test interval signs, and include zeros because equality is allowed.', steps: ['Critical values are x=−1 and x=2.', 'The product is negative between the roots and zero at each root.', 'Solution: [−1,2].'], check: 'At x=0 the product is −2, so the middle interval is included.', takeaway: 'Closed endpoints come from ≤ and both critical values are defined.' },
    ],
    practiceQuestions: [
      { id: 'q-ineq-1', subskill: 'Linear inequalities', difficulty: 'Foundation', prompt: 'Solve −3x+4>10.', options: ['x<−2', 'x>−2', 'x<2', 'x>2'], correctIndex: 0, explanation: '−3x>6; dividing by −3 reverses the sign, so x<−2.', misconceptionId: 'INEQ_NO_FLIP' },
      { id: 'q-ineq-2', subskill: 'Absolute value', difficulty: 'Standard', prompt: 'Solve |x−1|<3.', options: ['−2<x<4', 'x<−2 or x>4', '−4<x<2', 'x≤−2 or x≥4'], correctIndex: 0, explanation: '−3<x−1<3; add 1 to get −2<x<4.', misconceptionId: 'INEQ_AND_OR' },
      { id: 'q-ineq-3', subskill: 'Polynomial sign chart', difficulty: 'Standard', prompt: 'Solve (x−2)(x+1)≤0.', options: ['[−1,2]', '(−∞,−1]∪[2,∞)', '(−1,2)', '[−2,1]'], correctIndex: 0, explanation: 'The product is nonpositive between the zeros and includes both zeros.' },
      { id: 'q-ineq-4', subskill: 'Rational sign chart', difficulty: 'Mixed', prompt: 'Solve (x−1)/(x+2)>0.', options: ['(−∞,−2)∪(1,∞)', '(−2,1)', '[−2,1]', '(−∞,−2]∪[1,∞)'], correctIndex: 0, explanation: 'The quotient is positive when numerator and denominator have the same sign. x=−2 is excluded and x=1 is not included.', misconceptionId: 'INEQ_ENDPOINTS' },
      { id: 'q-ineq-5', subskill: 'Compound intervals', difficulty: 'Board-review style', prompt: 'Solve −2≤3x+1<10.', options: ['[−1,3)', '(−1,3]', '[−3,1)', '(−1,3)'], correctIndex: 0, explanation: 'Subtract 1 and divide by 3: −1≤x<3.' },
      { id: 'q-ineq-6', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'A safe input range requires |V−5|≤0.5 volts. Which range satisfies it?', options: ['4.5≤V≤5.5', 'V<4.5 or V>5.5', '5≤V≤5.5', '4.5<V<5.5'], correctIndex: 0, explanation: 'A distance at most 0.5 from 5 gives 4.5≤V≤5.5.' },
      { id: 'q-ineq-7', subskill: 'Linear inequalities', difficulty: 'Foundation', prompt: 'Solve 3x−7≥5.', options: ['x≥4', 'x≤4', 'x>4', 'x<4'], correctIndex: 0, explanation: '3x≥12, so x≥4.' },
      { id: 'q-ineq-8', subskill: 'Sign reversal', difficulty: 'Standard', prompt: 'Solve −2x+1<9.', options: ['x>−4', 'x<−4', 'x>4', 'x<4'], correctIndex: 0, explanation: '−2x<8; dividing by −2 reverses the inequality, giving x>−4.', misconceptionId: 'INEQ_NO_FLIP' },
      { id: 'q-ineq-9', subskill: 'Polynomial inequalities', difficulty: 'Mixed', prompt: 'Solve (x−2)(x+1)≤0.', options: ['[−1,2]', '(−∞,−1]∪[2,∞)', '(−1,2)', '[−2,1]'], correctIndex: 0, explanation: 'The product is nonpositive between the zeros −1 and 2, including both endpoints.', misconceptionId: 'INEQ_SIGN_CHART' },
      { id: 'q-ineq-10', subskill: 'Absolute-value inequalities', difficulty: 'Board-review style', prompt: 'Solve |x−4|>3.', options: ['x<1 or x>7', '1<x<7', 'x≤1 or x≥7', '−7<x<−1'], correctIndex: 0, explanation: '|u|>a means u<−a or u>a for a>0. Thus x−4<−3 or x−4>3.', misconceptionId: 'INEQ_AND_OR' },

    ],
    eceBridge: [{ title: 'Tolerance bands', description: 'Absolute-value inequalities model allowed deviation from a nominal voltage, frequency, or component value.' }, { title: 'Operating regions', description: 'Polynomial and rational sign charts help identify parameter ranges that satisfy stability, power, or denominator constraints.' }],
    sources: [
      { book: 'College Algebra, 9th ed. — Michael Sullivan', role: 'Concept backbone', section: '1.5 Solving Inequalities; 1.6 Absolute Value; 5.4 Polynomial and Rational Inequalities', locator: 'pp. 119–133; 368–373', use: 'Solution-set and interval conventions, linear/compound inequalities, absolute-value cases, and polynomial/rational sign analysis.', verificationStatus: 'verified-section-pages' },
      { book: 'College Algebra and Calculus: An Applied Approach, 2nd ed. — Larson & Hodgkins', role: 'Instructional design', section: '1.6 Linear Inequalities; 1.7 Other Types of Inequalities', locator: 'pp. 126–147', use: 'Number-line/interval work, linear and absolute-value inequalities, then critical-number test intervals for polynomial and rational inequalities.', verificationStatus: 'verified-section-pages' },
      { book: '1,001 Algebra II Practice Problems For Dummies — Mary Jane Sterling', role: 'Practice taxonomy', section: 'Ch. 1 linear inequalities; Ch. 2 quadratic inequalities', locator: 'pp. 9–10; 18–20', use: 'Practice support for linear/compound inequalities and quadratic inequalities. Absolute-value and rational sign-chart coverage is verified against Sullivan and Larson.', verificationStatus: 'verified-section-pages' },
    ],
  },

  'top-linear-eq': {
    canonicalTopicId: 'top-linear-eq',
    title: 'Linear & Literal Equations',
    groupLabel: 'Equations & Inequalities',
    shortDescription: 'Solve one-variable linear equations, clear fractional equations safely, and rearrange engineering formulas for a target variable.',
    boardPriority: 'High',
    objectives: [
      { id: 'lin-obj-1', text: 'Solve linear equations using equivalent operations while controlling signs and distribution.' },
      { id: 'lin-obj-2', text: 'Clear numerical and algebraic denominators without changing the solution set.' },
      { id: 'lin-obj-3', text: 'Recognize identities, contradictions, and conditional equations.' },
      { id: 'lin-obj-4', text: 'Rearrange literal equations and formulas to isolate a specified variable.' },
      { id: 'lin-obj-5', text: 'State restrictions introduced when division by an expression is required.' },
      { id: 'lin-obj-6', text: 'Translate short ECE relationships into linear equations and verify the result by substitution.' },
    ],
    prerequisites: [
      { id: 'lin-pre-1', label: 'Distributive property', checkPrompt: 'Expand 3(2x−5).', answer: '6x−15' },
      { id: 'lin-pre-2', label: 'Signed arithmetic', checkPrompt: 'Compute −7+12.', answer: '5' },
      { id: 'lin-pre-3', label: 'Fraction arithmetic', checkPrompt: 'What is the LCD of 2 and 3?', answer: '6' },
    ],
    rules: [
      { title: 'Equivalent-operation principle', formula: 'a=b\\;\\Longrightarrow\\;a+c=b+c', meaning: 'Apply the same valid operation to both sides to preserve equality.', condition: 'When multiplying or dividing by a variable expression, account for values that make that expression zero.', commonError: 'Moving a term across the equals sign by changing its sign without understanding the equivalent operation.' },
      { title: 'Clear fractions with the LCD', formula: 'L\\left(\\frac{A}{m}+\\frac{B}{n}\\right)=L\\,C', meaning: 'Multiply every term on both sides by a common denominator before simplifying.', condition: 'Use an LCD that is nonzero on the admitted domain.', commonError: 'Multiplying only selected terms by the denominator.' },
      { title: 'Literal-equation isolation', formula: 'V=IR\\;\\Longrightarrow\\;I=\\frac{V}{R}', meaning: 'Treat all symbols except the requested one as constants and undo operations in a valid order.', condition: 'The displayed rearrangement assumes R≠0.', commonError: 'Dividing only one term of a sum or forgetting the condition created by division.' },
      { title: 'Identity versus contradiction', formula: '0=0\\Rightarrow\\text{all admitted values};\\qquad 0=k\\;(k\\neq0)\\Rightarrow\\varnothing', meaning: 'After simplification, a true identity means every admitted value works; a false statement means no solution.', commonError: 'Reporting x=0 when the variable cancels completely.' },
    ],
    misconceptions: [
      { id: 'LIN_DISTRIBUTION', label: 'Incomplete distribution', symptom: 'Multiplying the outside factor by only the first term inside parentheses.', correction: 'Distribute the factor to every term before combining like terms.', quickCheck: '3(x−4)=3x−12, not 3x−4.' },
      { id: 'LIN_LCD_MISAPPLY', label: 'Partial LCD clearing', symptom: 'Multiplying only fractional terms, or only one side, by the LCD.', correction: 'Multiply every term on both sides by the LCD as one equivalent operation.', quickCheck: 'For x/2+1=5, multiplying by 2 gives x+2=10.' },
      { id: 'LIN_TARGET_VARIABLE', label: 'Wrong variable isolated', symptom: 'Stopping with the target variable still appearing on both sides or inside a grouped term.', correction: 'Collect every target-variable term first, factor the target, then divide by its coefficient expression.', quickCheck: 'A=P+Prt gives A−P=Prt, then r=(A−P)/(Pt) when Pt≠0.' },
      { id: 'LIN_IDENTITY_CONTRADICTION', label: 'Identity/contradiction confusion', symptom: 'Reporting a numeric solution after the variable cancels.', correction: 'Interpret the final constant statement: true means all admitted values, false means no solution.', quickCheck: '2(x+3)=2x+6 reduces to 6=6, so every real x works.' },
    ],
    workedExamples: [
      { title: 'Solve a distributed linear equation', problem: 'Solve 3(2x−5)−4=2(x+7).', strategy: 'Distribute, combine like terms, collect x terms on one side, then isolate x.', steps: ['Expand: 6x−15−4=2x+14.', 'Combine constants: 6x−19=2x+14.', 'Subtract 2x: 4x−19=14.', 'Add 19 and divide by 4: x=33/4.'], check: 'Substituting x=33/4 makes both sides equal 61/2.', takeaway: 'Distribution and sign control usually determine whether the rest of the solution stays clean.' },
      { title: 'Rearrange an engineering formula', problem: 'Solve A=P+Prt for r.', strategy: 'Remove the P term, factor the coefficient of r, then divide by that coefficient.', steps: ['Subtract P: A−P=Prt.', 'The coefficient multiplying r is Pt.', 'Divide by Pt: r=(A−P)/(Pt), assuming Pt≠0.'], check: 'Multiplying the result by Pt and adding P returns A.', takeaway: 'Literal equations use exactly the same inverse-operation logic as numeric equations.' },
    ],
    practiceQuestions: [
      { id: 'q-lin-1', subskill: 'One-variable equations', difficulty: 'Foundation', prompt: 'Solve 2x−7=13.', options: ['x=10', 'x=3', 'x=20', 'x=−10'], correctIndex: 0, explanation: 'Add 7 to get 2x=20, then divide by 2.', misconceptionId: 'LIN_DISTRIBUTION' },
      { id: 'q-lin-2', subskill: 'Distribution', difficulty: 'Foundation', prompt: 'Solve 3(x−2)=2x+5.', options: ['x=11', 'x=1', 'x=−11', 'x=7'], correctIndex: 0, explanation: '3x−6=2x+5, so x=11.', misconceptionId: 'LIN_DISTRIBUTION' },
      { id: 'q-lin-3', subskill: 'Fractional linear equations', difficulty: 'Standard', prompt: 'Solve (x−1)/3+(x+2)/2=5.', options: ['x=26/5', 'x=5', 'x=6', 'x=13/5'], correctIndex: 0, explanation: 'Multiply by 6: 2(x−1)+3(x+2)=30, so 5x+4=30 and x=26/5.', misconceptionId: 'LIN_LCD_MISAPPLY' },
      { id: 'q-lin-4', subskill: 'Literal equations', difficulty: 'Standard', prompt: 'Solve A=P+Prt for r.', options: ['(A−P)/(Pt)', '(A+P)/(Pt)', '(A−P)t/P', 'Pt/(A−P)'], correctIndex: 0, explanation: 'A−P=Prt, so divide by Pt to isolate r.', misconceptionId: 'LIN_TARGET_VARIABLE' },
      { id: 'q-lin-5', subskill: 'Equation classification', difficulty: 'Mixed', prompt: 'What is the solution set of 2(x+3)=2x+6?', options: ['All real numbers', 'No solution', 'x=0', 'x=3'], correctIndex: 0, explanation: 'Both sides simplify to 2x+6, so the equation is an identity.', misconceptionId: 'LIN_IDENTITY_CONTRADICTION' },
      { id: 'q-lin-6', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'Using V=IR, what current I flows when V=24 V and R=6 Ω?', options: ['4 A', '6 A', '18 A', '144 A'], correctIndex: 0, explanation: 'I=V/R=24/6=4 A.' },
      { id: 'q-lin-7', subskill: 'Multi-step equations', difficulty: 'Foundation', prompt: 'Solve 4(x−2)=2x+6.', options: ['x=7', 'x=5', 'x=−7', 'x=3'], correctIndex: 0, explanation: '4x−8=2x+6, so 2x=14 and x=7.', misconceptionId: 'LIN_DISTRIBUTION' },
      { id: 'q-lin-8', subskill: 'Fractional coefficients', difficulty: 'Standard', prompt: 'Solve (2/3)x−5=3.', options: ['x=12', 'x=8', 'x=6', 'x=15'], correctIndex: 0, explanation: '(2/3)x=8, so x=12.', misconceptionId: 'LIN_LCD_MISAPPLY' },
      { id: 'q-lin-9', subskill: 'Literal equations', difficulty: 'ECE Application', prompt: 'Solve V=IR for I.', options: ['I=V/R', 'I=VR', 'I=R/V', 'I=V−R'], correctIndex: 0, explanation: 'Divide both sides by R (R≠0): I=V/R.' },
      { id: 'q-lin-10', subskill: 'Equation classification', difficulty: 'Board-review style', prompt: 'What is the solution set of 3(x+2)=3x+6?', options: ['All real numbers', 'No solution', 'x=0 only', 'x=2 only'], correctIndex: 0, explanation: 'Both sides simplify to 3x+6, so the equation is an identity.', misconceptionId: 'LIN_IDENTITY_CONTRADICTION' },

      { id: 'q-lin-11', subskill: 'Linear equation', difficulty: 'Foundation', prompt: 'Solve 7x−5=30.', options: ['x=5', 'x=25/7', 'x=35', 'x=−5'], correctIndex: 0, explanation: '7x=35, so x=5.' },
      { id: 'q-lin-12', subskill: 'Distribution', difficulty: 'Standard', prompt: 'Solve 3(x−2)+4=2x+7.', options: ['x=9', 'x=5', 'x=1', 'x=−9'], correctIndex: 0, explanation: '3x−6+4=2x+7 gives x=9.', misconceptionId: 'LIN_DISTRIBUTION' },
      { id: 'q-lin-13', subskill: 'Fractional equation', difficulty: 'Mixed', prompt: 'Solve x/3+(x−1)/2=4.', options: ['x=27/5', 'x=5', 'x=9/2', 'x=3'], correctIndex: 0, explanation: 'Multiply by 6: 2x+3x−3=24, so 5x=27 and x=27/5.', misconceptionId: 'LIN_LCD_MISAPPLY' },
      { id: 'q-lin-14', subskill: 'Literal equations', difficulty: 'ECE Application', prompt: 'Solve P=VI for V.', options: ['V=P/I', 'V=PI', 'V=I/P', 'V=P−I'], correctIndex: 0, explanation: 'Divide both sides by I, assuming I≠0.', misconceptionId: 'LIN_TARGET_VARIABLE' },
      { id: 'q-lin-15', subskill: 'Identity or contradiction', difficulty: 'Board-review style', prompt: 'What solution set results from 4(x+1)=4x+4?', options: ['All real numbers', 'No solution', 'x=0', 'x=1'], correctIndex: 0, explanation: 'Both sides simplify to 4x+4, so the equation is an identity.', misconceptionId: 'LIN_IDENTITY_CONTRADICTION' },
    ],
    eceBridge: [
      { title: 'Formula transposition', description: 'Board problems often require isolating voltage, current, resistance, power, capacitance, frequency, or time before numerical substitution.', formula: 'V=IR\\Rightarrow I=V/R' },
      { title: 'Dimensional sanity check', description: 'After rearranging, use units as a quick check that the isolated expression has the expected physical dimension.' },
    ],
    sources: [
      { book: 'College Algebra, 9th ed. — Michael Sullivan', role: 'Concept backbone', section: '1.1 Linear Equations', locator: 'pp. 82–91', use: 'Equivalent equation procedures, linear equations, equations with fractions, and modeling with linear equations.', verificationStatus: 'verified-section-pages' },
      { book: 'College Algebra and Calculus: An Applied Approach, 2nd ed. — Larson & Hodgkins', role: 'Instructional design', section: '1.1 Linear Equations', locator: 'pp. 70–79', use: 'Identity/conditional-equation framing, linear solution procedures, fractional equations, and application examples.', verificationStatus: 'verified-section-pages' },
      { book: '1,001 Algebra II Practice Problems For Dummies — Mary Jane Sterling', role: 'Practice taxonomy', section: 'Ch. 1 Reviewing Algebra Basics — Linear Equations and Solving for Variables', locator: 'pp. 8–9', use: 'Practice patterns for linear equations and literal/formula rearrangements, plus common sign/distribution traps.', verificationStatus: 'verified-section-pages' },
    ],
  },

  'top-absolute-value': {
    canonicalTopicId: 'top-absolute-value',
    title: 'Absolute Value Equations & Inequalities',
    groupLabel: 'Equations & Inequalities',
    shortDescription: 'Interpret absolute value as distance, split equations into valid branches, and distinguish inside-versus-outside inequality cases.',
    boardPriority: 'High',
    objectives: [
      { id: 'abs-obj-1', text: 'Interpret |u| as a nonnegative distance and identify impossible negative-distance equations.' },
      { id: 'abs-obj-2', text: 'Solve |u|=a using two branches when a>0.' },
      { id: 'abs-obj-3', text: 'Solve |u|<a or |u|≤a as an inside compound inequality.' },
      { id: 'abs-obj-4', text: 'Solve |u|>a or |u|≥a as an outside union of intervals.' },
      { id: 'abs-obj-5', text: 'Handle the special cases a=0 and a<0 correctly.' },
    ],
    prerequisites: [
      { id: 'abs-pre-1', label: 'Distance meaning', checkPrompt: 'What is |−7|?', answer: '7' },
      { id: 'abs-pre-2', label: 'Linear solving', checkPrompt: 'Solve 2x−3=7.', answer: 'x=5' },
      { id: 'abs-pre-3', label: 'Interval notation', checkPrompt: 'Write −2≤x<4 as an interval.', answer: '[−2,4)' },
    ],
    rules: [
      { title: 'Absolute-value equation', formula: '|u|=a\\;\\Longleftrightarrow\\;u=a\\;\\text{or}\\;u=-a', meaning: 'A positive distance a from zero occurs at two symmetric values.', condition: 'For a<0 there is no real solution; for a=0, require u=0.', commonError: 'Keeping only the positive branch.' },
      { title: 'Inside inequality', formula: '|u|<a\\;\\Longleftrightarrow\\;-a<u<a', meaning: 'Values whose distance from zero is less than a lie between −a and a.', condition: 'Assume a>0; use closed endpoints for ≤.', commonError: 'Using OR instead of AND for the inside case.' },
      { title: 'Outside inequality', formula: '|u|>a\\;\\Longleftrightarrow\\;u<-a\\;\\text{or}\\;u>a', meaning: 'Values farther than a units from zero lie outside the central interval.', condition: 'Assume a≥0; use closed endpoints for ≥.', commonError: 'Writing one continuous interval across the excluded middle.' },
    ],
    misconceptions: [
      { id: 'ABS_SINGLE_BRANCH', label: 'Missing the negative branch', symptom: 'Solving |u|=a as only u=a.', correction: 'For positive a, write both u=a and u=−a before solving.', quickCheck: '|x|=5 has x=5 and x=−5.' },
      { id: 'ABS_AND_OR', label: 'AND/OR reversal', symptom: 'Using OR for |u|<a or AND for |u|>a.', correction: 'Inside is AND; outside is OR.', quickCheck: '|x|<3 means −3<x<3, while |x|>3 means x<−3 or x>3.' },
      { id: 'ABS_NEGATIVE_BOUND', label: 'Ignoring nonnegative absolute value', symptom: 'Creating branches for |u| equal to a negative number.', correction: 'Absolute value cannot be negative in the real numbers.', quickCheck: '|x+1|=−2 has no real solution.' },
    ],
    workedExamples: [
      { title: 'Two-branch absolute-value equation', problem: 'Solve |2x−3|=7.', strategy: 'Set the interior equal to +7 and −7, then solve both linear equations.', steps: ['2x−3=7 gives 2x=10, so x=5.', '2x−3=−7 gives 2x=−4, so x=−2.', 'Solution set: {−2,5}.'], check: '|2(5)−3|=7 and |2(−2)−3|=7.', takeaway: 'A positive absolute-value equation normally produces two branches.' },
      { title: 'Inside absolute-value inequality', problem: 'Solve |3x+1|<8.', strategy: 'Translate the distance condition into a compound inequality, then solve all three parts together.', steps: ['Write −8<3x+1<8.', 'Subtract 1: −9<3x<7.', 'Divide by 3: −3<x<7/3.'], check: 'x=0 satisfies the original inequality, while x=3 does not.', takeaway: 'A “less than” absolute-value inequality describes one interval between two endpoints.' },
    ],
    practiceQuestions: [
      { id: 'q-abs-1', subskill: 'Absolute-value equations', difficulty: 'Foundation', prompt: 'Solve |x−4|=6.', options: ['x=−2 or 10', 'x=2 or 10', 'x=−10 or 2', 'x=10 only'], correctIndex: 0, explanation: 'x−4=±6, so x=10 or x=−2.', misconceptionId: 'ABS_SINGLE_BRANCH' },
      { id: 'q-abs-2', subskill: 'Inside inequalities', difficulty: 'Standard', prompt: 'Solve |2x+1|≤5.', options: ['−3≤x≤2', 'x≤−3 or x≥2', '−2≤x≤3', '−3<x<2'], correctIndex: 0, explanation: '−5≤2x+1≤5 gives −6≤2x≤4, hence −3≤x≤2.', misconceptionId: 'ABS_AND_OR' },
      { id: 'q-abs-3', subskill: 'Outside inequalities', difficulty: 'Standard', prompt: 'Solve |3x−6|>9.', options: ['x<−1 or x>5', '−1<x<5', 'x≤−1 or x≥5', 'x<1 or x>3'], correctIndex: 0, explanation: '3x−6<−9 or 3x−6>9, giving x<−1 or x>5.', misconceptionId: 'ABS_AND_OR' },
      { id: 'q-abs-4', subskill: 'Boundary cases', difficulty: 'Mixed', prompt: 'Solve |x+2|=−4 over the real numbers.', options: ['No real solution', 'x=2', 'x=−6 or 2', 'All real numbers'], correctIndex: 0, explanation: 'An absolute value is never negative.', misconceptionId: 'ABS_NEGATIVE_BOUND' },
      { id: 'q-abs-5', subskill: 'ECE tolerance', difficulty: 'ECE Application', prompt: 'A 5 V signal must satisfy |V−5|≤0.25. What range is allowed?', options: ['4.75≤V≤5.25', 'V≤4.75 or V≥5.25', '4.75<V<5.25', '5≤V≤5.25'], correctIndex: 0, explanation: 'The voltage may differ from 5 V by at most 0.25 V.' },
      { id: 'q-abs-6', subskill: 'Distance interpretation', difficulty: 'Board-review style', prompt: 'Which describes points more than 2 units from −3?', options: ['x<−5 or x>−1', '−5<x<−1', 'x≤−5 or x≥−1', '−1<x<5'], correctIndex: 0, explanation: '|x+3|>2 means x+3<−2 or x+3>2, so x<−5 or x>−1.' },
      { id: 'q-abs-7', subskill: 'Absolute-value equations', difficulty: 'Foundation', prompt: 'Solve |2x−1|=7.', options: ['x=4 or −3', 'x=3 or −4', 'x=4 only', 'x=−3 only'], correctIndex: 0, explanation: '2x−1=7 gives x=4; 2x−1=−7 gives x=−3.', misconceptionId: 'ABS_SINGLE_BRANCH' },
      { id: 'q-abs-8', subskill: 'Inside inequality', difficulty: 'Standard', prompt: 'Solve |x+1|<4.', options: ['−5<x<3', 'x<−5 or x>3', '−3<x<5', '−5≤x≤3'], correctIndex: 0, explanation: '−4<x+1<4, so −5<x<3.', misconceptionId: 'ABS_AND_OR' },
      { id: 'q-abs-9', subskill: 'Outside inequality', difficulty: 'Standard', prompt: 'Solve |3x|≥12.', options: ['x≤−4 or x≥4', '−4≤x≤4', 'x<−4 or x>4', 'x≤4'], correctIndex: 0, explanation: '|3x|≥12 means 3x≤−12 or 3x≥12, so x≤−4 or x≥4.', misconceptionId: 'ABS_AND_OR' },
      { id: 'q-abs-10', subskill: 'Feasibility', difficulty: 'Board-review style', prompt: 'Solve |x−2|=−1.', options: ['No real solution', 'x=1 or 3', 'x=1', 'x=3'], correctIndex: 0, explanation: 'An absolute value is never negative, so it cannot equal −1.', misconceptionId: 'ABS_NEGATIVE_BOUND' },

    ],
    eceBridge: [
      { title: 'Tolerance bands', description: 'Absolute-value inequalities naturally model maximum allowed deviation from a nominal voltage, resistance, frequency, or calibration value.', formula: '|x-x_0|\\le \\Delta' },
      { title: 'Error magnitude', description: 'Absolute error is a distance, so its sign is discarded while the magnitude remains meaningful.' },
    ],
    sources: [
      { book: 'College Algebra, 9th ed. — Michael Sullivan', role: 'Concept backbone', section: '1.6 Equations and Inequalities Involving Absolute Value', locator: 'pp. 130–133', use: 'Distance interpretation, two-branch equations, and inside/outside absolute-value inequalities.', verificationStatus: 'verified-section-pages' },
      { book: 'College Algebra and Calculus: An Applied Approach, 2nd ed. — Larson & Hodgkins', role: 'Instructional design', section: '1.6 Linear Inequalities', locator: 'pp. 126–137', use: 'Interval/number-line presentation, inequality properties, absolute-value inequalities, and applications.', verificationStatus: 'verified-section-pages' },
      { book: '1,001 Algebra II Practice Problems For Dummies — Mary Jane Sterling', role: 'Practice taxonomy', section: 'Ch. 1 Reviewing Algebra Basics — linear/absolute-value equations and linear inequalities', locator: 'pp. 8–10', use: 'Supplementary practice for absolute-value equations, linear inequalities, and sign-reversal traps. Absolute-value inequality rules are verified against Sullivan and Larson.', verificationStatus: 'verified-section-pages' },
    ],
  },

  'top-rational-radical-eqs': {
    canonicalTopicId: 'top-rational-radical-eqs',
    title: 'Rational & Radical Equations',
    groupLabel: 'Equations & Inequalities',
    shortDescription: 'Solve equations containing variable denominators or radicals while protecting domain restrictions and rejecting extraneous solutions.',
    boardPriority: 'High',
    objectives: [
      { id: 'rreq-obj-1', text: 'Identify forbidden denominator values before clearing a rational equation.' },
      { id: 'rreq-obj-2', text: 'Solve rational equations using an LCD or a valid proportion strategy.' },
      { id: 'rreq-obj-3', text: 'Isolate radical expressions before raising both sides to a power.' },
      { id: 'rreq-obj-4', text: 'Solve equations with one or multiple radical terms in a controlled sequence.' },
      { id: 'rreq-obj-5', text: 'Check every candidate in the original equation and reject extraneous or forbidden values.' },
      { id: 'rreq-obj-6', text: 'Apply these skills to rational engineering relationships.' },
    ],
    prerequisites: [
      { id: 'rreq-pre-1', label: 'Factoring', checkPrompt: 'Factor x²−1.', answer: '(x−1)(x+1)' },
      { id: 'rreq-pre-2', label: 'LCD', checkPrompt: 'LCD of 1/(x−1) and 1/(x+1)?', answer: '(x−1)(x+1)' },
      { id: 'rreq-pre-3', label: 'Squaring a binomial', checkPrompt: 'Expand (x−2)².', answer: 'x²−4x+4' },
    ],
    rules: [
      { title: 'Rational-equation restrictions', formula: 'Q(x)\\neq0', meaning: 'Values that make an original denominator zero are excluded before any algebraic cancellation or LCD clearing.', commonError: 'Accepting a value that solves the transformed equation but makes an original denominator zero.' },
      { title: 'LCD clearing', formula: 'L\\cdot\\left(\\frac{A}{B}+\\frac{C}{D}\\right)=L\\cdot E', meaning: 'Multiply every term by a common denominator to remove fractions while preserving original restrictions.', condition: 'L must be nonzero on the admitted domain.', commonError: 'Failing to distribute the LCD to every term.' },
      { title: 'Radical isolation and power', formula: '\\sqrt[n]{u}=v\\;\\Longrightarrow\\;u=v^n', meaning: 'Isolate the radical first, then raise both sides to the radical index.', condition: 'Even powers may create extraneous solutions, so candidates must be checked in the original equation.', commonError: 'Squaring a sum incorrectly or failing to isolate the radical first.' },
    ],
    misconceptions: [
      { id: 'RREQ_DENOM_ZERO', label: 'Forbidden denominator accepted', symptom: 'A candidate makes an original denominator zero but is still reported as a solution.', correction: 'Write restrictions before clearing denominators and compare every candidate against them.', quickCheck: 'For 1/(x−2), x=2 can never be a solution.' },
      { id: 'RREQ_EXTRANEOUS', label: 'Extraneous radical root retained', symptom: 'A root from the squared equation fails the original radical equation.', correction: 'Substitute every candidate back into the original unsquared equation.', quickCheck: '√(x+5)=x−1 produces x=4 and −1 after squaring, but only x=4 works.' },
      { id: 'RREQ_BINOMIAL_SQUARE', label: 'Incorrect binomial square', symptom: 'Using (a+b)²=a²+b².', correction: 'Include the middle term: (a+b)²=a²+2ab+b².', quickCheck: '(x−1)²=x²−2x+1.' },
      { id: 'RREQ_LCD_DISTRIBUTION', label: 'Incomplete denominator clearing', symptom: 'The LCD is applied to only some terms.', correction: 'Treat LCD multiplication as acting on the entire equation.', quickCheck: 'If L is the LCD, every addend on both sides is multiplied by L.' },
    ],
    workedExamples: [
      { title: 'Rational equation with restrictions', problem: 'Solve 1/(x−1)+1/(x+1)=1.', strategy: 'Record restrictions, multiply by the LCD, solve the resulting quadratic, then check the candidates.', steps: ['Restrictions: x≠1 and x≠−1.', 'Multiply by (x−1)(x+1): (x+1)+(x−1)=x²−1.', 'Simplify: 2x=x²−1, so x²−2x−1=0.', 'Quadratic formula gives x=1±√2.', 'Neither candidate equals ±1, so both are valid.'], check: 'Substituting either 1+√2 or 1−√2 into the original equation gives 1.', takeaway: 'Restrictions belong to the original equation and survive all transformations.' },
      { title: 'Radical equation with an extraneous candidate', problem: 'Solve √(x+5)=x−1.', strategy: 'Use the implicit condition x−1≥0, square both sides, then test every algebraic candidate.', steps: ['Because the left side is nonnegative, require x≥1.', 'Square: x+5=(x−1)²=x²−2x+1.', 'Rearrange: x²−3x−4=0=(x−4)(x+1).', 'Candidates: x=4 and x=−1.', 'x=−1 violates x≥1 and fails the original equation; x=4 works.'], check: '√9=3 and 4−1=3.', takeaway: 'Squaring can enlarge the solution set; checking is part of the solution, not an optional extra.' },
    ],
    practiceQuestions: [
      { id: 'q-rreq-1', subskill: 'Rational equations', difficulty: 'Foundation', prompt: 'Solve 2/(x−1)=1.', options: ['x=3', 'x=2', 'x=1', 'x=−1'], correctIndex: 0, explanation: '2=x−1, so x=3; x=1 is excluded.', misconceptionId: 'RREQ_DENOM_ZERO' },
      { id: 'q-rreq-2', subskill: 'Rational equations', difficulty: 'Standard', prompt: 'Solve 1/x+1/(x+2)=1.', options: ['x=±√2', 'x=2 only', 'x=−2 only', 'x=0 or −2'], correctIndex: 0, explanation: 'Multiply by x(x+2): (x+2)+x=x(x+2), so x²=2. Both ±√2 satisfy the restrictions x≠0,−2.', misconceptionId: 'RREQ_LCD_DISTRIBUTION' },
      { id: 'q-rreq-3', subskill: 'Single-radical equations', difficulty: 'Foundation', prompt: 'Solve √(x+1)=3.', options: ['x=8', 'x=2', 'x=10', 'x=−8'], correctIndex: 0, explanation: 'Square both sides: x+1=9, so x=8.' },
      { id: 'q-rreq-4', subskill: 'Extraneous roots', difficulty: 'Standard', prompt: 'Solve √(2x+3)=x over the real numbers.', options: ['x=3 only', 'x=−1 only', 'x=3 or −1', 'No real solution'], correctIndex: 0, explanation: 'Squaring gives x²−2x−3=0, so x=3 or −1. The original equation requires x≥0, so only x=3 remains.', misconceptionId: 'RREQ_EXTRANEOUS' },
      { id: 'q-rreq-5', subskill: 'Odd radicals', difficulty: 'Mixed', prompt: 'Solve ∛(x−1)=2.', options: ['x=9', 'x=7', 'x=8', 'x=3'], correctIndex: 0, explanation: 'Cube both sides: x−1=8, so x=9.' },
      { id: 'q-rreq-6', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'For two parallel resistors, R_T=R₁R₂/(R₁+R₂). If R_T=4 Ω and R₁=6 Ω, find R₂.', options: ['12 Ω', '10 Ω', '8 Ω', '24 Ω'], correctIndex: 0, explanation: '4(6+R₂)=6R₂, so 24+4R₂=6R₂ and R₂=12 Ω.' },
      { id: 'q-rreq-7', subskill: 'Rational equations', difficulty: 'Foundation', prompt: 'Solve 1/x+1/2=1.', options: ['x=2', 'x=1', 'x=−2', 'x=4'], correctIndex: 0, explanation: '1/x=1/2, so x=2; x=0 is excluded.', misconceptionId: 'RREQ_DENOM_ZERO' },
      { id: 'q-rreq-8', subskill: 'Radical equations', difficulty: 'Foundation', prompt: 'Solve √(x+1)=5.', options: ['x=24', 'x=26', 'x=4', 'x=25'], correctIndex: 0, explanation: 'Square both sides: x+1=25, so x=24.', misconceptionId: 'RREQ_BINOMIAL_SQUARE' },
      { id: 'q-rreq-9', subskill: 'Extraneous roots', difficulty: 'Mixed', prompt: 'Solve √(2x+3)=x over the reals.', options: ['x=3 only', 'x=−1 or 3', 'x=−1 only', 'No real solution'], correctIndex: 0, explanation: 'Squaring gives x²−2x−3=0, so x=3 or −1; x=−1 fails the original equation.', misconceptionId: 'RREQ_EXTRANEOUS' },
      { id: 'q-rreq-10', subskill: 'Restrictions and solving', difficulty: 'Board-review style', prompt: 'Solve 2/(x−1)=1.', options: ['x=3', 'x=2', 'x=−1', 'x=1'], correctIndex: 0, explanation: '2=x−1 gives x=3; the excluded value x=1 is not a candidate.', misconceptionId: 'RREQ_DENOM_ZERO' },

      { id: 'q-rreq-11', subskill: 'Rational restrictions', difficulty: 'Foundation', prompt: 'Which value is excluded from 1/(x−6)=2?', options: ['x=6', 'x=1/2', 'x=0', 'x=−6'], correctIndex: 0, explanation: 'The original denominator x−6 cannot be zero.', misconceptionId: 'RREQ_DENOM_ZERO' },
      { id: 'q-rreq-12', subskill: 'Rational equations', difficulty: 'Standard', prompt: 'Solve 2/x=1/3.', options: ['x=6', 'x=2/3', 'x=3/2', 'x=−6'], correctIndex: 0, explanation: 'Cross-multiplication gives 6=x.', misconceptionId: 'RREQ_LCD_DISTRIBUTION' },
      { id: 'q-rreq-13', subskill: 'Radical equations', difficulty: 'Standard', prompt: 'Solve √(x+1)=4.', options: ['x=15', 'x=17', 'x=3', 'x=−15'], correctIndex: 0, explanation: 'Square both sides: x+1=16, so x=15.' },
      { id: 'q-rreq-14', subskill: 'Extraneous roots', difficulty: 'Mixed', prompt: 'Which candidate fails the original equation √(x+6)=x?', options: ['x=−2', 'x=3', 'Both −2 and 3', 'Neither'], correctIndex: 0, explanation: 'Squaring gives x²−x−6=0, candidates 3 and −2; only x=3 satisfies √9=3.', misconceptionId: 'RREQ_EXTRANEOUS' },
      { id: 'q-rreq-15', subskill: 'Binomial squaring', difficulty: 'Board-review style', prompt: 'Which is (x+3)²?', options: ['x²+6x+9', 'x²+9', 'x²+3x+9', 'x²−6x+9'], correctIndex: 0, explanation: '(x+3)²=x²+6x+9.', misconceptionId: 'RREQ_BINOMIAL_SQUARE' },
    ],
    eceBridge: [
      { title: 'Parallel-resistance relationships', description: 'Equivalent-resistance formulas produce rational equations when an unknown component value appears in numerator and denominator.', formula: 'R_T=\\frac{R_1R_2}{R_1+R_2}' },
      { title: 'Root-bearing formulas', description: 'Engineering magnitude and geometry relations can produce radical equations; domain and unit checks help reject impossible roots.' },
    ],
    sources: [
      { book: 'College Algebra, 9th ed. — Michael Sullivan', role: 'Concept backbone', section: '1.1 Linear Equations (fractional equations); 1.4 Radical Equations', locator: 'pp. 82–91; 113–118', use: 'Equation equivalence, clearing fractional equations, radical-equation isolation, and explicit extraneous-solution checks.', verificationStatus: 'verified-section-pages' },
      { book: 'College Algebra and Calculus: An Applied Approach, 2nd ed. — Larson & Hodgkins', role: 'Instructional design', section: '1.1 Linear Equations; 1.5 Other Types of Equations', locator: 'pp. 70–79; 115–125', use: 'Fractional-equation workflow plus rewriting and solving radical, rational-exponent, fractional, and absolute-value equations.', verificationStatus: 'verified-section-pages' },
      { book: '1,001 Algebra II Practice Problems For Dummies — Mary Jane Sterling', role: 'Practice taxonomy', section: 'Ch. 3 Solving Radical and Rational Equations', locator: 'pp. 21–26', use: 'Practice families for rational equations, one- and multi-radical equations, denominator restrictions, and extraneous-root detection.', verificationStatus: 'verified-section-pages' },
    ],
  },

  'top-logarithms': {
    canonicalTopicId: 'top-logarithms',
    title: 'Exponential & Logarithmic Functions',
    groupLabel: 'Functions & Advanced Behaviors',
    shortDescription: 'Evaluate, graph, transform, and solve exponential/logarithmic expressions and equations, including growth/decay and ECE decibel applications.',
    boardPriority: 'High',
    objectives: [
      { id: 'log-obj-1', text: 'Evaluate exponential functions and recognize growth versus decay from the base.' },
      { id: 'log-obj-2', text: 'Convert between logarithmic and exponential forms and enforce the logarithm domain.' },
      { id: 'log-obj-3', text: 'Apply product, quotient, and power properties of logarithms correctly.' },
      { id: 'log-obj-4', text: 'Use common logarithms, natural logarithms, and the change-of-base formula.' },
      { id: 'log-obj-5', text: 'Solve exponential and logarithmic equations and check logarithmic candidates against domain restrictions.' },
      { id: 'log-obj-6', text: 'Use exponential/logarithmic models in growth, decay, and engineering-level ratio calculations.' },
    ],
    prerequisites: [
      { id: 'log-pre-1', label: 'Exponent laws', checkPrompt: 'Simplify 2³·2².', answer: '2⁵=32' },
      { id: 'log-pre-2', label: 'Inverse operations', checkPrompt: 'If 2ˣ=8, what is x?', answer: '3' },
      { id: 'log-pre-3', label: 'Function domains', checkPrompt: 'For 1/(x−4), which value is excluded?', answer: 'x=4' },
    ],
    rules: [
      { title: 'Exponential function', formula: 'f(x)=Ca^x', meaning: 'For a>1 the basic factor a^x grows; for 0<a<1 it decays.', condition: 'Use a>0 and a≠1 for a nonconstant real exponential base.', commonError: 'Treating the variable as the base instead of the exponent.' },
      { title: 'Logarithm definition', formula: 'y=\\log_a x\\;\\Longleftrightarrow\\;a^y=x', meaning: 'A logarithm is the exponent required on base a to produce x.', condition: 'a>0, a≠1, and x>0.', commonError: 'Allowing zero or a negative logarithm argument.' },
      { title: 'Logarithm properties', formula: '\\log_a(MN)=\\log_aM+\\log_aN', meaning: 'Products become sums, quotients become differences, and powers become coefficients.', condition: 'Arguments involved in real logarithms must remain positive.', commonError: 'Inventing a false sum rule such as log(M+N)=log M+log N.' },
      { title: 'Change of base', formula: '\\log_a x=\\frac{\\ln x}{\\ln a}', meaning: 'Any valid logarithm can be evaluated using another logarithm base.', condition: 'a>0, a≠1, x>0.', commonError: 'Flipping numerator and denominator.' },
    ],
    misconceptions: [
      { id: 'LOG_SUM_SPLIT', label: 'Splitting a logarithm of a sum', symptom: 'Writing log(M+N)=log M+log N.', correction: 'Only products, quotients, and powers have standard expansion properties.', quickCheck: 'log10(10+90)=2, but log10 10+log10 90 is not 2.' },
      { id: 'LOG_CHANGE_BASE_FLIP', label: 'Change-of-base inversion', symptom: 'Using ln(a)/ln(x) instead of ln(x)/ln(a).', correction: 'The argument stays on top; the base goes to the denominator.', quickCheck: 'log₂8=ln8/ln2=3.' },
      { id: 'LOG_DOMAIN', label: 'Invalid logarithm argument', symptom: 'Keeping a solution that makes a logarithm zero or negative inside.', correction: 'State the log-domain restriction before solving and verify every candidate.', quickCheck: 'log(x−3) requires x>3.' },
      { id: 'EXP_BASE_MATCH', label: 'Incorrect exponent matching', symptom: 'Equating exponents before rewriting both sides with the same valid base.', correction: 'Match bases first, or take logarithms when a common base is not practical.', quickCheck: '3^(2x−1)=27 becomes 3^(2x−1)=3³ before setting exponents equal.' },
    ],
    workedExamples: [
      { title: 'Solve by matching exponential bases', problem: 'Solve 3^(2x−1)=27.', strategy: 'Rewrite 27 as a power of 3, then use one-to-one behavior of the exponential function.', steps: ['27=3³.', 'So 3^(2x−1)=3³.', 'Set exponents equal: 2x−1=3.', 'Therefore x=2.'], check: '3^(2·2−1)=3³=27.', takeaway: 'Equal positive bases (not 1) allow direct exponent comparison.' },
      { title: 'Solve a logarithmic equation with a domain check', problem: 'Solve log₂(x−1)+log₂(x−3)=3.', strategy: 'State the domain, combine the logs into a product, convert to exponential form, and reject invalid candidates.', steps: ['Domain: x>3.', 'Combine: log₂[(x−1)(x−3)]=3.', 'Convert: (x−1)(x−3)=8.', 'Expand: x²−4x+3=8, so x²−4x−5=0.', 'Factor: (x−5)(x+1)=0, giving x=5 or −1.', 'Domain x>3 leaves x=5 only.'], check: 'log₂4+log₂2=2+1=3.', takeaway: 'A correct algebraic root is still invalid if it violates a logarithm domain restriction.' },
    ],
    practiceQuestions: [
      { id: 'q-log-1', subskill: 'Exponential equations', difficulty: 'Foundation', prompt: 'Solve 2^(x+1)=16.', options: ['x=3', 'x=4', 'x=2', 'x=5'], correctIndex: 0, explanation: '16=2⁴, so x+1=4 and x=3.', misconceptionId: 'EXP_BASE_MATCH' },
      { id: 'q-log-2', subskill: 'Logarithm definition', difficulty: 'Foundation', prompt: 'Evaluate log₁₀(1000).', options: ['3', '2', '10', '100'], correctIndex: 0, explanation: '10³=1000, so log₁₀(1000)=3.' },
      { id: 'q-log-3', subskill: 'Natural logarithms', difficulty: 'Standard', prompt: 'Simplify ln(e^(−2)).', options: ['−2', '2', 'e²', '1/2'], correctIndex: 0, explanation: 'ln and e^x are inverse functions, so ln(e^(−2))=−2.' },
      { id: 'q-log-4', subskill: 'Log properties', difficulty: 'Standard', prompt: 'Evaluate log₂8+log₂4.', options: ['5', '6', '12', '2'], correctIndex: 0, explanation: 'log₂8=3 and log₂4=2, so the sum is 5.', misconceptionId: 'LOG_SUM_SPLIT' },
      { id: 'q-log-5', subskill: 'Log equations', difficulty: 'Mixed', prompt: 'Solve log₃(x−1)=2.', options: ['x=10', 'x=9', 'x=8', 'x=4'], correctIndex: 0, explanation: 'x−1=3²=9, so x=10; the domain x>1 is satisfied.', misconceptionId: 'LOG_DOMAIN' },
      { id: 'q-log-6', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'Power gain in decibels is G=10 log₁₀(P₂/P₁). If P₂/P₁=100, what is G?', options: ['20 dB', '10 dB', '40 dB', '100 dB'], correctIndex: 0, explanation: 'G=10 log₁₀(100)=10·2=20 dB.' },
      { id: 'q-log-7', subskill: 'Logarithm evaluation', difficulty: 'Foundation', prompt: 'Evaluate log₂32.', options: ['5', '4', '16', '6'], correctIndex: 0, explanation: '2⁵=32, so log₂32=5.' },
      { id: 'q-log-8', subskill: 'Natural-log equations', difficulty: 'Standard', prompt: 'Solve ln x=2.', options: ['x=e²', 'x=2e', 'x=ln2', 'x=e/2'], correctIndex: 0, explanation: 'Exponentiate both sides with base e: x=e².', misconceptionId: 'LOG_DOMAIN' },
      { id: 'q-log-9', subskill: 'Log properties', difficulty: 'Mixed', prompt: 'Solve log₁₀x+log₁₀10=3.', options: ['x=100', 'x=1000', 'x=10', 'x=2'], correctIndex: 0, explanation: 'log₁₀10=1, so log₁₀x=2 and x=100.', misconceptionId: 'LOG_SUM_SPLIT' },
      { id: 'q-log-10', subskill: 'Exponential equations', difficulty: 'Board-review style', prompt: 'Solve 5e^(2t)=20.', options: ['t=ln2', 't=ln4', 't=2ln2', 't=1/2'], correctIndex: 0, explanation: 'e^(2t)=4, so 2t=ln4=2ln2 and t=ln2.', misconceptionId: 'EXP_BASE_MATCH' },

      { id: 'q-log-11', subskill: 'Log laws', difficulty: 'Foundation', prompt: 'Simplify log_b(MN).', options: ['log_b M+log_b N', 'log_b M−log_b N', '(log_b M)(log_b N)', 'log_b(M+N)'], correctIndex: 0, explanation: 'The product rule converts a product inside a logarithm to a sum of logs.' },
      { id: 'q-log-12', subskill: 'Change of base', difficulty: 'Standard', prompt: 'Which equals log₂7?', options: ['ln7/ln2', 'ln2/ln7', 'ln14', 'ln7−ln2'], correctIndex: 0, explanation: 'Change of base: log_a b=ln b/ln a.', misconceptionId: 'LOG_CHANGE_BASE_FLIP' },
      { id: 'q-log-13', subskill: 'Log domain', difficulty: 'Standard', prompt: 'For log(x−4), what is the real-domain condition?', options: ['x>4', 'x≥4', 'x≠4', 'x<4'], correctIndex: 0, explanation: 'The logarithm argument must be positive: x−4>0.', misconceptionId: 'LOG_DOMAIN' },
      { id: 'q-log-14', subskill: 'Exponential equations', difficulty: 'Mixed', prompt: 'Solve 3^(x+1)=81.', options: ['x=3', 'x=4', 'x=2', 'x=1'], correctIndex: 0, explanation: '81=3⁴, so x+1=4 and x=3.', misconceptionId: 'EXP_BASE_MATCH' },
      { id: 'q-log-15', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'A power ratio is 100. What is 10log₁₀(100)?', options: ['20 dB', '10 dB', '40 dB', '100 dB'], correctIndex: 0, explanation: 'log₁₀(100)=2, so 10×2=20 dB.' },
    ],
    eceBridge: [
      { title: 'Decibel ratios', description: 'Logarithms compress multiplicative power ratios into additive decibel measures.', formula: 'G_P=10\\log_{10}(P_2/P_1)' },
      { title: 'Growth and decay', description: 'Exponential models support attenuation, charging/decay-style mathematics, half-life, and repeated-percentage processes.' },
    ],
    sources: [
      { book: 'College Algebra, 9th ed. — Michael Sullivan', role: 'Concept backbone', section: '6.3–6.6 Exponential/Logarithmic Functions and Equations; 6.8 Growth/Decay Models', locator: 'pp. 421–465; 476–485', use: 'Exponential and logarithmic definitions/graphs, log properties, equation-solving strategies, domain checks, and growth/decay models.', verificationStatus: 'verified-section-pages' },
      { book: 'College Algebra and Calculus: An Applied Approach, 2nd ed. — Larson & Hodgkins', role: 'Instructional design', section: '4.2–4.6 Exponential and Logarithmic Functions', locator: 'pp. 346–399', use: 'Evaluation and graphing, natural base e, logarithm properties, equation strategies, modeling, checkpoints, and review sequencing.', verificationStatus: 'verified-section-pages' },
      { book: '1,001 Algebra II Practice Problems For Dummies — Mary Jane Sterling', role: 'Practice taxonomy', section: 'Ch. 9 Exponential and Logarithmic Functions', locator: 'pp. 57–64', use: 'Practice families for evaluation, graphs, inverse conversion, exponential/logarithmic equations, and common log-law/domain mistakes.', verificationStatus: 'verified-section-pages' },
    ],
  },


  'top-simultaneous-linear': {
    canonicalTopicId: 'top-simultaneous-linear',
    title: 'Systems of Equations',
    groupLabel: 'Systems, Sequences & Applications',
    shortDescription: 'Solve and classify 2-variable and 3-variable systems using substitution, elimination, determinants/Cramer’s Rule, and selected nonlinear-system techniques.',
    boardPriority: 'High',
    objectives: [
      { id: 'sys-obj-1', text: 'Solve a 2×2 linear system by substitution and verify the ordered-pair solution.' },
      { id: 'sys-obj-2', text: 'Solve a 2×2 linear system by elimination using equivalent equations.' },
      { id: 'sys-obj-3', text: 'Classify a linear system as unique, inconsistent, or dependent from algebraic or graphical evidence.' },
      { id: 'sys-obj-4', text: 'Solve a 3-variable linear system using systematic elimination and back-substitution.' },
      { id: 'sys-obj-5', text: 'Evaluate 2×2 determinants and apply Cramer’s Rule when the coefficient determinant is nonzero.' },
      { id: 'sys-obj-6', text: 'Solve basic nonlinear systems by substitution or elimination and interpret solutions as intersections.' },
      { id: 'sys-obj-7', text: 'Translate simple engineering relations into simultaneous equations and check the resulting solution.' },
    ],
    prerequisites: [
      { id: 'sys-pre-1', label: 'Linear equations', checkPrompt: 'Solve 2x+3=11.', answer: 'x=4' },
      { id: 'sys-pre-2', label: 'Substitution', checkPrompt: 'If y=2x+1, evaluate y when x=3.', answer: '7' },
      { id: 'sys-pre-3', label: '2×2 determinant', checkPrompt: 'Evaluate |2  3; 1  −1|.', answer: '−5' },
    ],
    rules: [
      { title: 'Linear-system solution types', formula: '1\\;solution,\\;0\\;solutions,\\;or\\;infinitely\\;many', meaning: 'Two linear equations can represent intersecting, parallel, or coincident lines.', condition: 'A unique solution satisfies every equation in the system.', commonError: 'Treating a contradiction such as 0=5 as a numerical solution instead of no solution.' },
      { title: 'Elimination', formula: 'k_1E_1+k_2E_2\\rightarrow\\text{one variable eliminated}', meaning: 'Multiply equations by nonzero constants when needed, then add or subtract to remove one variable.', condition: 'Operations must be applied to both sides of an equation.', commonError: 'Changing only one term instead of the entire equation when multiplying by a constant.' },
      { title: 'Cramer’s Rule for 2×2 systems', formula: 'x=D_x/D,\\quad y=D_y/D', meaning: 'Replace one coefficient column at a time by the constants column.', condition: 'Use only when the coefficient determinant D is nonzero.', commonError: 'Using Cramer’s Rule as if D=0 guaranteed no solution; D=0 can mean no solution or infinitely many.' },
      { title: 'Nonlinear-system intersections', formula: 'f(x,y)=0,\\;g(x,y)=0', meaning: 'Every solution must satisfy both equations, so solutions are intersection points of their graphs.', commonError: 'Keeping an algebraic candidate without substituting it into both original equations.' },
    ],
    misconceptions: [
      { id: 'SYS_PARTIAL_MULTIPLY', label: 'Partial equation multiplication', symptom: 'Multiplying only one term while preparing coefficients for elimination.', correction: 'Multiply every term on both sides of the selected equation by the same nonzero constant.', quickCheck: '2(x+y=5) becomes 2x+2y=10.' },
      { id: 'SYS_SOLUTION_TYPE', label: 'Misclassifying no/infinite solutions', symptom: 'Reading 0=0 or 0=constant as an ordinary equation for a variable.', correction: '0=0 means dependent equations and infinitely many solutions; 0=c with c≠0 means inconsistent and no solution.', quickCheck: '2x+4y=6 and x+2y=3 describe the same line.' },
      { id: 'SYS_CRAMER_ZERO', label: 'Misusing Cramer’s Rule when D=0', symptom: 'Dividing by zero or declaring a unique solution from determinant ratios.', correction: 'If D=0, stop the determinant ratio method and classify the system another way.', quickCheck: 'D=0 never gives a unique Cramer-rule solution.' },
      { id: 'SYS_ORDERED_TUPLE', label: 'Wrong variable order', symptom: 'Reporting coordinates or ordered triples in a different order from the variable convention.', correction: 'Keep the declared order (x,y) or (x,y,z) throughout elimination, substitution, and checking.', quickCheck: 'If x=2 and y=3, the ordered pair is (2,3), not (3,2).' },
      { id: 'SYS_NONLINEAR_UNCHECKED', label: 'Unchecked nonlinear candidate', symptom: 'Accepting a root created during substitution without verifying both equations.', correction: 'Substitute each candidate pair into every original equation.', quickCheck: 'A value satisfying the reduced equation may fail the original system.' },
    ],
    workedExamples: [
      { title: 'Solve a 2×2 system by elimination', problem: 'Solve 2x+y=7 and x−y=2.', strategy: 'Add the equations so y cancels, solve for x, then back-substitute.', steps: ['Add: (2x+y)+(x−y)=7+2, so 3x=9.', 'Thus x=3.', 'Use x−y=2: 3−y=2, so y=1.', 'Solution: (3,1).'], check: '2(3)+1=7 and 3−1=2.', takeaway: 'Choose elimination when opposite coefficients already appear or can be created easily.' },
      { title: 'Use Cramer’s Rule', problem: 'Solve x+y=5 and 2x−y=1.', strategy: 'Compute D, Dₓ, and Dᵧ, then divide because D≠0.', steps: ['D=|1  1; 2  −1|=−1−2=−3.', 'Dₓ=|5  1; 1  −1|=−5−1=−6, so x=Dₓ/D=2.', 'Dᵧ=|1  5; 2  1|=1−10=−9, so y=Dᵧ/D=3.', 'Solution: (2,3).'], check: '2+3=5 and 2(2)−3=1.', takeaway: 'Cramer’s Rule is compact for small square systems when D is nonzero.' },
    ],
    practiceQuestions: [
      { id: 'q-sys-1', subskill: '2×2 substitution/elimination', difficulty: 'Foundation', prompt: 'Solve x+y=7 and x−y=1.', options: ['(4,3)', '(3,4)', '(4,2)', '(5,2)'], correctIndex: 0, explanation: 'Adding the equations gives 2x=8, so x=4; then y=3.', misconceptionId: 'SYS_ORDERED_TUPLE' },
      { id: 'q-sys-2', subskill: 'System classification', difficulty: 'Foundation', prompt: 'Classify the system 2x+4y=6 and x+2y=3.', options: ['Infinitely many solutions', 'No solution', 'Exactly one solution', 'Exactly two solutions'], correctIndex: 0, explanation: 'The first equation is exactly twice the second, so both describe the same line.', misconceptionId: 'SYS_SOLUTION_TYPE' },
      { id: 'q-sys-3', subskill: 'Elimination', difficulty: 'Standard', prompt: 'Solve 2x+y=7 and x−y=2.', options: ['(3,1)', '(1,3)', '(2,3)', '(4,−1)'], correctIndex: 0, explanation: 'Adding gives 3x=9, so x=3; then y=1.', misconceptionId: 'SYS_PARTIAL_MULTIPLY' },
      { id: 'q-sys-4', subskill: 'Determinants', difficulty: 'Standard', prompt: 'For the coefficient matrix [[2,3],[1,−1]], what is D?', options: ['−5', '5', '−1', '1'], correctIndex: 0, explanation: 'D=2(−1)−3(1)=−5.' },
      { id: 'q-sys-5', subskill: 'Cramer’s Rule', difficulty: 'Standard', prompt: 'Solve x+y=5 and 2x−y=1.', options: ['(2,3)', '(3,2)', '(1,4)', '(4,1)'], correctIndex: 0, explanation: 'Cramer’s Rule or elimination gives x=2 and y=3.', misconceptionId: 'SYS_CRAMER_ZERO' },
      { id: 'q-sys-6', subskill: '3×3 systems', difficulty: 'Mixed', prompt: 'Solve x+y+z=6, x−y+z=2, and x+y−z=4.', options: ['(3,2,1)', '(2,3,1)', '(3,1,2)', '(1,2,3)'], correctIndex: 0, explanation: 'Subtracting equations gives y=2 and z=1; then x=3.', misconceptionId: 'SYS_ORDERED_TUPLE' },
      { id: 'q-sys-7', subskill: 'Nonlinear systems', difficulty: 'Mixed', prompt: 'If x²+y²=25 and y=4, what are the real intersection points?', options: ['(3,4) and (−3,4)', '(4,3) and (4,−3)', '(5,4) only', '(3,−4) and (−3,−4)'], correctIndex: 0, explanation: 'x²+16=25 gives x²=9, so x=±3 while y remains 4.', misconceptionId: 'SYS_NONLINEAR_UNCHECKED' },
      { id: 'q-sys-8', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'A simplified current model gives 2I₁−I₂=3 and I₁+I₂=3. What are the currents?', options: ['I₁=2 A, I₂=1 A', 'I₁=1 A, I₂=2 A', 'I₁=3 A, I₂=0 A', 'I₁=2 A, I₂=2 A'], correctIndex: 0, explanation: 'Adding the equations gives 3I₁=6, so I₁=2 A and I₂=1 A.' },
      { id: 'q-sys-9', subskill: 'Inconsistent systems', difficulty: 'Board-review style', prompt: 'What is the solution type of 2x−y=1 and 4x−2y=5?', options: ['No solution', 'Infinitely many solutions', 'One solution', 'Two solutions'], correctIndex: 0, explanation: 'Doubling the first gives 4x−2y=2, which contradicts 4x−2y=5.', misconceptionId: 'SYS_SOLUTION_TYPE' },
      { id: 'q-sys-10', subskill: 'Cramer’s Rule condition', difficulty: 'Board-review style', prompt: 'If the coefficient determinant D of a 2×2 system is zero, which statement is always correct?', options: ['Cramer’s unique-solution ratios cannot be used', 'The system has no solution', 'The system has infinitely many solutions', 'x=0 and y=0'], correctIndex: 0, explanation: 'D=0 blocks the unique-solution Cramer ratios; further analysis is needed to distinguish no solution from infinitely many.', misconceptionId: 'SYS_CRAMER_ZERO' },
      { id: 'q-sys-11', subskill: 'Elimination', difficulty: 'Foundation', prompt: 'Solve x+y=7 and x−y=1.', options: ['(4,3)', '(3,4)', '(7,1)', '(1,6)'], correctIndex: 0, explanation: 'Adding gives 2x=8, so x=4 and y=3.' },
      { id: 'q-sys-12', subskill: 'System classification', difficulty: 'Standard', prompt: 'The equations 2x+4y=6 and x+2y=5 represent:', options: ['No solution', 'One solution', 'Infinitely many solutions', 'A nonlinear system'], correctIndex: 0, explanation: 'Doubling the second left side gives 2x+4y but the constant would be 10, so the lines are parallel and inconsistent.', misconceptionId: 'SYS_SOLUTION_TYPE' },
      { id: 'q-sys-13', subskill: 'Cramer determinant', difficulty: 'Standard', prompt: 'For x+y=5 and 2x−y=1, what is the coefficient determinant D?', options: ['−3', '3', '−1', '1'], correctIndex: 0, explanation: 'D=1(−1)−1(2)=−3.' },
      { id: 'q-sys-14', subskill: 'Three variables', difficulty: 'Mixed', prompt: 'If x+y+z=6, x=1, and y=2, what is z?', options: ['3', '2', '1', '6'], correctIndex: 0, explanation: '1+2+z=6, so z=3.' },
      { id: 'q-sys-15', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'Two branch currents satisfy I₁+I₂=5 and I₁−I₂=1. What are the currents?', options: ['I₁=3 A, I₂=2 A', 'I₁=2 A, I₂=3 A', 'I₁=4 A, I₂=1 A', 'I₁=5 A, I₂=0 A'], correctIndex: 0, explanation: 'Add equations: 2I₁=6, so I₁=3 and I₂=2.' },
    ],
    eceBridge: [
      { title: 'Simultaneous circuit equations', description: 'Linear systems are the algebraic core of many node-voltage, mesh-current, and calibration models.' },
      { title: 'Determinant checks', description: 'For small square systems, a nonzero determinant guarantees a unique algebraic solution before Cramer’s Rule is applied.', formula: 'D\\neq0\\Rightarrow\\text{unique solution}' },
    ],
    sources: [
      { book: 'College Algebra, 9th ed. — Michael Sullivan', role: 'Concept backbone', section: '8.1 Systems by Substitution/Elimination; 8.3 Determinants; 8.6 Nonlinear Systems', locator: 'pp. 541–555; 571–579; 605–610', use: 'Linear-system solution types, 2- and 3-variable methods, Cramer’s Rule, determinants, and substitution/elimination for nonlinear intersections.', verificationStatus: 'verified-section-pages' },
      { book: 'College Algebra and Calculus: An Applied Approach, 2nd ed. — Larson & Hodgkins', role: 'Instructional design', section: '5.1–5.3 Systems of Equations', locator: 'pp. 410–443', use: 'Substitution, elimination, graphical interpretation, row-echelon form, Gaussian elimination, checkpoints, and applications.', verificationStatus: 'verified-section-pages' },
      { book: '1,001 Algebra II Practice Problems For Dummies — Mary Jane Sterling', role: 'Practice taxonomy', section: 'Ch. 11 Systems of Linear Equations; Ch. 12 Systems of Nonlinear Equations and Inequalities', locator: 'pp. 73–84', use: 'Practice families for 2-variable systems, row operations/echelon forms, nonlinear intersections, and common sign/order mistakes.', verificationStatus: 'verified-section-pages' },
    ],
  },

  'top-complex-numbers': {
    canonicalTopicId: 'top-complex-numbers',
    title: 'Complex Numbers',
    groupLabel: 'Systems, Sequences & Applications',
    shortDescription: 'Imaginary-unit powers, rectangular-form arithmetic, conjugates, division, and quadratic equations with nonreal complex roots.',
    boardPriority: 'High',
    objectives: [
      { id: 'cx-obj-1', text: 'Use i²=−1 and the four-step cycle of powers of i.' },
      { id: 'cx-obj-2', text: 'Write complex numbers in standard rectangular form a+bi.' },
      { id: 'cx-obj-3', text: 'Add, subtract, and multiply complex numbers accurately.' },
      { id: 'cx-obj-4', text: 'Use complex conjugates to divide complex numbers and obtain a+bi form.' },
      { id: 'cx-obj-5', text: 'Simplify square roots of negative real numbers using i.' },
      { id: 'cx-obj-6', text: 'Solve quadratic equations whose discriminants are negative.' },
    ],
    prerequisites: [
      { id: 'cx-pre-1', label: 'Radicals', checkPrompt: 'Simplify √49.', answer: '7' },
      { id: 'cx-pre-2', label: 'Binomial multiplication', checkPrompt: 'Expand (a+b)(a−b).', answer: 'a²−b²' },
      { id: 'cx-pre-3', label: 'Quadratic formula', checkPrompt: 'What expression determines the nature of quadratic roots?', answer: 'b²−4ac' },
    ],
    rules: [
      { title: 'Imaginary unit', formula: 'i^2=-1', meaning: 'Powers of i repeat every four exponents: i, −1, −i, 1.', commonError: 'Treating i² as +1 or forgetting the modulo-4 cycle.' },
      { title: 'Standard form', formula: 'z=a+bi', meaning: 'Combine real parts with real parts and imaginary coefficients with imaginary coefficients.', commonError: 'Combining unlike real and imaginary components.' },
      { title: 'Complex conjugate', formula: '\\overline{a+bi}=a-bi', meaning: 'Multiplying conjugates removes the imaginary term: (a+bi)(a−bi)=a²+b².', condition: 'For division, multiply numerator and denominator by the denominator’s conjugate.', commonError: 'Changing the sign of the real part instead of the imaginary part.' },
      { title: 'Negative square roots', formula: '\\sqrt{-a}=i\\sqrt{a}\\;(a>0)', meaning: 'Separate the factor −1 before simplifying a negative radicand.', commonError: 'Writing √(−a)=−√a.' },
    ],
    misconceptions: [
      { id: 'CX_I_CYCLE', label: 'Incorrect power of i', symptom: 'Reporting i³=+i or i⁴=−1.', correction: 'Reduce the exponent modulo 4 using i, −1, −i, 1.', quickCheck: 'i³=−i and i⁴=1.' },
      { id: 'CX_COMPONENTS', label: 'Mixing real and imaginary parts', symptom: 'Combining a real term directly with a coefficient of i.', correction: 'Collect real parts separately from imaginary coefficients.', quickCheck: '(3+2i)+(1−5i)=4−3i.' },
      { id: 'CX_CONJUGATE_SIGN', label: 'Wrong conjugate', symptom: 'Changing the real-part sign or changing both signs.', correction: 'The conjugate of a+bi is a−bi: only the sign of the imaginary term changes.', quickCheck: 'conj(−3+4i)=−3−4i.' },
      { id: 'CX_DIVIDE_REAL_DEN', label: 'Leaving i in the denominator', symptom: 'Stopping division before converting the denominator to a real number.', correction: 'Multiply by the denominator conjugate, simplify i²=−1, then divide real and imaginary parts.', quickCheck: '(a+bi)/(c+di)·(c−di)/(c−di).' },
    ],
    workedExamples: [
      { title: 'Multiply complex numbers', problem: 'Simplify (2+i)(3−2i).', strategy: 'Distribute all products, replace i² by −1, then collect real and imaginary terms.', steps: ['(2+i)(3−2i)=6−4i+3i−2i².', 'Since i²=−1, −2i²=+2.', 'Combine: 8−i.'], check: 'Real part 8 and imaginary part −1 are already in standard form.', takeaway: 'Treat i algebraically, then apply i²=−1 whenever it appears.' },
      { title: 'Divide using a conjugate', problem: 'Write (4+3i)/(1−2i) in a+bi form.', strategy: 'Multiply numerator and denominator by the conjugate 1+2i.', steps: ['Numerator: (4+3i)(1+2i)=4+8i+3i+6i²=−2+11i.', 'Denominator: (1−2i)(1+2i)=1+4=5.', 'Result: −2/5+(11/5)i.'], check: 'Multiplying the result by 1−2i returns 4+3i.', takeaway: 'The denominator becomes the positive real number c²+d².' },
    ],
    practiceQuestions: [
      { id: 'q-cx-1', subskill: 'Powers of i', difficulty: 'Foundation', prompt: 'Simplify i³⁷.', options: ['i', '−i', '1', '−1'], correctIndex: 0, explanation: '37 leaves remainder 1 modulo 4, so i³⁷=i.', misconceptionId: 'CX_I_CYCLE' },
      { id: 'q-cx-2', subskill: 'Addition', difficulty: 'Foundation', prompt: 'Simplify (3+2i)+(1−5i).', options: ['4−3i', '4+7i', '2−3i', '3−5i'], correctIndex: 0, explanation: 'Add real parts and imaginary coefficients separately: 4−3i.', misconceptionId: 'CX_COMPONENTS' },
      { id: 'q-cx-3', subskill: 'Multiplication', difficulty: 'Standard', prompt: 'Simplify (2+i)(3−2i).', options: ['8−i', '4−i', '8+i', '6−i'], correctIndex: 0, explanation: '6−4i+3i−2i²=8−i.' },
      { id: 'q-cx-4', subskill: 'Division', difficulty: 'Standard', prompt: 'Write (4+3i)/(1−2i) in standard form.', options: ['−2/5+(11/5)i', '2/5+(11/5)i', '−2/5−(11/5)i', '2+(11)i'], correctIndex: 0, explanation: 'Multiply by 1+2i; numerator becomes −2+11i and denominator becomes 5.', misconceptionId: 'CX_DIVIDE_REAL_DEN' },
      { id: 'q-cx-5', subskill: 'Conjugates', difficulty: 'Foundation', prompt: 'What is the conjugate of −3+4i?', options: ['−3−4i', '3−4i', '3+4i', '−4−3i'], correctIndex: 0, explanation: 'Only the imaginary-term sign changes.', misconceptionId: 'CX_CONJUGATE_SIGN' },
      { id: 'q-cx-6', subskill: 'Complex quadratic roots', difficulty: 'Standard', prompt: 'Solve x²+4=0.', options: ['x=±2i', 'x=±2', 'x=−4i', 'No solutions in the complex numbers'], correctIndex: 0, explanation: 'x²=−4, so x=±2i.' },
      { id: 'q-cx-7', subskill: 'Negative radicals', difficulty: 'Standard', prompt: 'Simplify √(−49).', options: ['7i', '−7', '−7i', '49i'], correctIndex: 0, explanation: '√(−49)=√49·√(−1)=7i.' },
      { id: 'q-cx-8', subskill: 'Powers', difficulty: 'Mixed', prompt: 'Simplify (1−i)².', options: ['−2i', '2i', '2', '−2'], correctIndex: 0, explanation: '1−2i+i²=1−2i−1=−2i.', misconceptionId: 'CX_I_CYCLE' },
      { id: 'q-cx-9', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'In rectangular impedance notation, (3+j4)+(2−j1) equals:', options: ['5+j3', '1+j5', '5+j5', '1+j3'], correctIndex: 0, explanation: 'Add real parts 3+2=5 and imaginary parts 4−1=3. Here j plays the same algebraic role as i.' },
      { id: 'q-cx-10', subskill: 'Conjugate product', difficulty: 'Board-review style', prompt: 'Evaluate (5+2i)(5−2i).', options: ['29', '21', '25−4i', '25+4i'], correctIndex: 0, explanation: 'Conjugate product: 5²+2²=29.', misconceptionId: 'CX_CONJUGATE_SIGN' },
    ],
    eceBridge: [
      { title: 'Rectangular impedance arithmetic', description: 'The same a+bi arithmetic applies to engineering notation R+jX for impedance and phasor components.' },
      { title: 'Scope note for this reference lesson', description: 'The three selected Algebra references support rectangular-form complex arithmetic and complex quadratic roots. Polar conversion and De Moivre’s theorem should be added later from a trigonometry/ECE reference rather than silently attributed to these Algebra books.' },
    ],
    sources: [
      { book: 'College Algebra, 9th ed. — Michael Sullivan', role: 'Concept backbone', section: '1.3 Complex Numbers; Quadratic Equations in the Complex Number System', locator: 'pp. 104–112', use: 'Imaginary unit, standard form, arithmetic, conjugates/division, powers of i, and nonreal quadratic roots.', verificationStatus: 'verified-section-pages' },
      { book: 'College Algebra and Calculus: An Applied Approach, 2nd ed. — Larson & Hodgkins', role: 'Instructional design', section: '3.5 Complex Numbers', locator: 'pp. 297–305', use: 'Imaginary-unit foundation, operations/checkpoints, conjugates, complex polynomial roots, and complex-plane interpretation.', verificationStatus: 'verified-section-pages' },
      { book: '1,001 Algebra II Practice Problems For Dummies — Mary Jane Sterling', role: 'Practice taxonomy', section: 'Ch. 13 Working with Complex Numbers', locator: 'pp. 85–90', use: 'Practice families for powers of i, rectangular arithmetic, multiplication, conjugate division, and complex quadratic solutions.', verificationStatus: 'verified-section-pages' },
    ],
  },

  'top-arithmetic-seq': {
    canonicalTopicId: 'top-arithmetic-seq',
    title: 'Arithmetic Progressions & Series',
    groupLabel: 'Systems, Sequences & Applications',
    shortDescription: 'Recognize constant-difference sequences, find general terms and arithmetic means, and sum finite arithmetic series.',
    boardPriority: 'Medium',
    objectives: [
      { id: 'ap-obj-1', text: 'Recognize an arithmetic sequence from a constant common difference.' },
      { id: 'ap-obj-2', text: 'Use the nth-term formula to find any term or unknown parameter.' },
      { id: 'ap-obj-3', text: 'Insert or compute arithmetic means between given values.' },
      { id: 'ap-obj-4', text: 'Find the sum of the first n terms of an arithmetic sequence.' },
      { id: 'ap-obj-5', text: 'Translate evenly changing engineering or measurement patterns into arithmetic-sequence models.' },
    ],
    prerequisites: [
      { id: 'ap-pre-1', label: 'Signed subtraction', checkPrompt: 'Compute 7−12.', answer: '−5' },
      { id: 'ap-pre-2', label: 'Linear equations', checkPrompt: 'Solve 4+3(n−1)=31.', answer: 'n=10' },
      { id: 'ap-pre-3', label: 'Sigma/sum meaning', checkPrompt: 'What does 1+2+3 represent?', answer: 'The sum of the first three positive integers' },
    ],
    rules: [
      { title: 'Arithmetic nth term', formula: 'a_n=a_1+(n-1)d', meaning: 'Each step changes by the same common difference d.', commonError: 'Using nd instead of (n−1)d and shifting every term by one difference.' },
      { title: 'Arithmetic finite sum', formula: 'S_n=\\frac{n}{2}(a_1+a_n)=\\frac{n}{2}[2a_1+(n-1)d]', meaning: 'Pair the first and last terms, then multiply their average by the number of terms.', condition: 'Use n as the actual number of terms.', commonError: 'Substituting the common difference where the last term belongs.' },
      { title: 'Arithmetic mean of two numbers', formula: 'A=\\frac{a+b}{2}', meaning: 'A single inserted arithmetic mean lies halfway between two values.', commonError: 'Using the geometric-mean formula √(ab) instead.' },
    ],
    misconceptions: [
      { id: 'AP_OFF_BY_ONE', label: 'Using nd instead of (n−1)d', symptom: 'The first-term check fails because the formula changes a₁.', correction: 'The first term has zero difference steps, so use (n−1)d.', quickCheck: 'At n=1, a₁+(1−1)d=a₁.' },
      { id: 'AP_WRONG_DIFFERENCE', label: 'Incorrect common difference', symptom: 'Subtracting terms in inconsistent order and changing the sign of d.', correction: 'Use later term minus preceding term consistently.', quickCheck: 'For 10,7,4,…, d=7−10=−3.' },
      { id: 'AP_SUM_TERM_COUNT', label: 'Wrong number of terms in a sum', symptom: 'Applying Sₙ with an endpoint count that does not match the sequence.', correction: 'Solve for n from the nth-term formula when n is not explicitly given.', quickCheck: '4,7,…,31 has 10 terms because 31=4+9(3).' },
      { id: 'AP_MEAN_TYPE', label: 'Confusing arithmetic and geometric means', symptom: 'Using √ab for an additive progression.', correction: 'Arithmetic means preserve equal differences; geometric means preserve equal ratios.', quickCheck: 'The arithmetic mean of 8 and 20 is 14.' },
    ],
    workedExamples: [
      { title: 'Find an nth term and finite sum', problem: 'For 5,8,11,… find a₁₂ and S₁₂.', strategy: 'Identify a₁=5 and d=3, then use the nth-term and sum formulas.', steps: ['a₁₂=5+(12−1)(3)=38.', 'S₁₂=12/2(5+38).', 'S₁₂=6(43)=258.'], check: 'The last term follows the +3 pattern, and the average term value is (5+38)/2=21.5; 12·21.5=258.', takeaway: 'Find the endpoint first when the sum formula uses aₙ.' },
      { title: 'Recover the sequence from two terms', problem: 'Given a₄=14 and a₉=34, find the common difference.', strategy: 'Write the nth-term equation twice and subtract.', steps: ['a₄=a₁+3d=14.', 'a₉=a₁+8d=34.', 'Subtract: 5d=20.', 'Therefore d=4.'], check: 'Five term-steps separate a₄ and a₉, and 34−14=20=5(4).', takeaway: 'Differences between known terms scale with the difference in their indices.' },
    ],
    practiceQuestions: [
      { id: 'q-ap-1', subskill: 'Common difference', difficulty: 'Foundation', prompt: 'What is the common difference of 3,7,11,15,…?', options: ['4', '3', '7', '−4'], correctIndex: 0, explanation: 'Each term increases by 4.', misconceptionId: 'AP_WRONG_DIFFERENCE' },
      { id: 'q-ap-2', subskill: 'Nth term', difficulty: 'Foundation', prompt: 'If a₁=2 and d=5, what is a₁₀?', options: ['47', '52', '45', '42'], correctIndex: 0, explanation: 'a₁₀=2+9(5)=47.', misconceptionId: 'AP_OFF_BY_ONE' },
      { id: 'q-ap-3', subskill: 'Recover d', difficulty: 'Standard', prompt: 'If a₄=14 and a₉=34 in an arithmetic sequence, what is d?', options: ['4', '5', '20', '−4'], correctIndex: 0, explanation: 'The index gap is 5 and the term difference is 20, so d=4.' },
      { id: 'q-ap-4', subskill: 'Arithmetic mean', difficulty: 'Standard', prompt: 'What arithmetic mean lies between 8 and 20?', options: ['14', '12', '√160', '16'], correctIndex: 0, explanation: '(8+20)/2=14.', misconceptionId: 'AP_MEAN_TYPE' },
      { id: 'q-ap-5', subskill: 'Finite sum', difficulty: 'Standard', prompt: 'What is 1+2+3+⋯+20?', options: ['210', '200', '220', '190'], correctIndex: 0, explanation: 'S=20(1+20)/2=210.' },
      { id: 'q-ap-6', subskill: 'Finite sum', difficulty: 'Mixed', prompt: 'For a₁=7, d=2, find S₁₅.', options: ['315', '300', '330', '285'], correctIndex: 0, explanation: 'a₁₅=35, so S₁₅=15(7+35)/2=315.', misconceptionId: 'AP_SUM_TERM_COUNT' },
      { id: 'q-ap-7', subskill: 'Recover first term', difficulty: 'Mixed', prompt: 'If a₅=18 and d=3, what is a₁?', options: ['6', '3', '9', '12'], correctIndex: 0, explanation: '18=a₁+4(3), so a₁=6.', misconceptionId: 'AP_OFF_BY_ONE' },
      { id: 'q-ap-8', subskill: 'Find the index', difficulty: 'Board-review style', prompt: 'In 4,7,10,… which term is 31?', options: ['10th', '9th', '11th', '8th'], correctIndex: 0, explanation: '31=4+(n−1)3 gives n−1=9, so n=10.', misconceptionId: 'AP_SUM_TERM_COUNT' },
      { id: 'q-ap-9', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'Calibration thresholds start at 0.50 V and rise by 0.25 V each step. What is the 16th threshold?', options: ['4.25 V', '4.00 V', '4.50 V', '3.75 V'], correctIndex: 0, explanation: 'a₁₆=0.50+15(0.25)=4.25 V.' },
      { id: 'q-ap-10', subskill: 'Solve from a sum', difficulty: 'Board-review style', prompt: 'For a₁=3 and d=4, Sₙ=105. What is n?', options: ['7', '6', '8', '5'], correctIndex: 0, explanation: 'Sₙ=n[2(3)+(n−1)4]/2=n(2n+1)=105, giving n=7.' },
    ],
    eceBridge: [
      { title: 'Uniform calibration steps', description: 'Evenly spaced thresholds, test points, or programmed increments form arithmetic progressions.' },
      { title: 'Linear indexing', description: 'The nth-term formula is the discrete analogue of a linear relation between index n and measured value.' },
    ],
    sources: [
      { book: 'College Algebra, 9th ed. — Michael Sullivan', role: 'Concept backbone', section: '9.1 Sequences; 9.2 Arithmetic Sequences', locator: 'pp. 637–652', use: 'Sequence notation, summation, arithmetic-sequence definition, nth term, and finite arithmetic sums.', verificationStatus: 'verified-section-pages' },
      { book: 'College Algebra and Calculus: An Applied Approach, 2nd ed. — Larson & Hodgkins', role: 'Instructional design', section: '15.1 Sequences and Summation Notation; 15.2 Arithmetic Sequences and Partial Sums', locator: 'pp. 1056–1073', use: 'Sequence notation, checkpoints, arithmetic nth terms, partial sums, and applications.', verificationStatus: 'verified-section-pages' },
      { book: '1,001 Algebra II Practice Problems For Dummies — Mary Jane Sterling', role: 'Practice taxonomy', section: 'Ch. 15 Sequences and Series', locator: 'pp. 97–102', use: 'Practice families for sequence rules, arithmetic/general terms, finite sums, pattern recognition, and common summation mistakes.', verificationStatus: 'verified-section-pages' },
    ],
  },

  'top-geometric-seq': {
    canonicalTopicId: 'top-geometric-seq',
    title: 'Geometric Progressions & Series',
    groupLabel: 'Systems, Sequences & Applications',
    shortDescription: 'Recognize constant-ratio sequences, find nth terms and finite sums, and evaluate convergent infinite geometric series.',
    boardPriority: 'Medium',
    objectives: [
      { id: 'gp-obj-1', text: 'Recognize a geometric sequence from a constant nonzero common ratio.' },
      { id: 'gp-obj-2', text: 'Use the nth-term formula to find terms or unknown parameters.' },
      { id: 'gp-obj-3', text: 'Find geometric means between positive quantities.' },
      { id: 'gp-obj-4', text: 'Find finite geometric-series sums.' },
      { id: 'gp-obj-5', text: 'Determine whether an infinite geometric series converges and compute its sum when |r|<1.' },
      { id: 'gp-obj-6', text: 'Model repeated multiplication, attenuation, or growth with a geometric sequence.' },
    ],
    prerequisites: [
      { id: 'gp-pre-1', label: 'Ratios', checkPrompt: 'Compute 18/6.', answer: '3' },
      { id: 'gp-pre-2', label: 'Exponents', checkPrompt: 'Evaluate 2⁵.', answer: '32' },
      { id: 'gp-pre-3', label: 'Fractions', checkPrompt: 'Evaluate 1/(1−1/2).', answer: '2' },
    ],
    rules: [
      { title: 'Geometric nth term', formula: 'a_n=a_1r^{n-1}', meaning: 'Each step multiplies by the constant common ratio r.', condition: 'For the standard recursive definition, r is nonzero.', commonError: 'Using rⁿ instead of rⁿ⁻¹.' },
      { title: 'Finite geometric sum', formula: 'S_n=a_1\\frac{1-r^n}{1-r}', meaning: 'Sum the first n terms without writing every term.', condition: 'Formula form shown assumes r≠1.', commonError: 'Reversing 1−rⁿ and 1−r inconsistently, which changes the sign.' },
      { title: 'Infinite geometric sum', formula: 'S_\\infty=\\frac{a_1}{1-r}', meaning: 'The partial sums approach a finite limit only when the terms shrink fast enough.', condition: '|r|<1.', commonError: 'Using the infinite-sum formula when |r|≥1.' },
      { title: 'Geometric mean', formula: 'G=\\sqrt{ab}', meaning: 'For positive a and b, inserting G gives equal adjacent ratios.', condition: 'This real-valued form assumes a,b>0.', commonError: 'Using the arithmetic mean (a+b)/2.' },
    ],
    misconceptions: [
      { id: 'GP_RATIO_DIRECTION', label: 'Inconsistent ratio direction', symptom: 'Alternating between later/earlier and earlier/later when finding r.', correction: 'Use each later term divided by its immediately preceding term.', quickCheck: '2,6,18,… has r=6/2=18/6=3.' },
      { id: 'GP_OFF_BY_ONE', label: 'Using rⁿ instead of rⁿ⁻¹', symptom: 'The formula fails at n=1.', correction: 'The first term has undergone zero multiplications by r.', quickCheck: 'a₁=a₁r⁰=a₁.' },
      { id: 'GP_INF_CONVERGENCE', label: 'Ignoring |r|<1', symptom: 'Applying S∞ to a series whose terms do not approach zero.', correction: 'Check |r| before using the infinite geometric sum.', quickCheck: '1+2+4+… diverges because |r|=2.' },
      { id: 'GP_MEAN_TYPE', label: 'Confusing geometric and arithmetic means', symptom: 'Using an average of endpoints for a multiplicative sequence.', correction: 'For positive endpoints, the geometric mean is √ab.', quickCheck: 'Between 4 and 25, the geometric mean is 10.' },
    ],
    workedExamples: [
      { title: 'Find a finite geometric sum', problem: 'Find the first six-term sum for a₁=2, r=3.', strategy: 'Use the finite geometric-sum formula with n=6.', steps: ['S₆=2(1−3⁶)/(1−3).', '3⁶=729, so S₆=2(−728)/(−2).', 'S₆=728.'], check: 'Direct sum 2+6+18+54+162+486=728.', takeaway: 'The sign cancels naturally when r>1 if the same 1−r convention is used in numerator and denominator.' },
      { title: 'Sum a convergent infinite series', problem: 'Find 8+4+2+1+⋯.', strategy: 'Identify a₁=8 and r=1/2, verify |r|<1, then apply S∞.', steps: ['r=4/8=1/2.', '|r|=1/2<1, so the series converges.', 'S∞=8/(1−1/2)=16.'], check: 'Partial sums 8,12,14,15,… approach 16.', takeaway: 'Always perform the convergence check before using the infinite formula.' },
    ],
    practiceQuestions: [
      { id: 'q-gp-1', subskill: 'Common ratio', difficulty: 'Foundation', prompt: 'What is the common ratio of 2,6,18,54,…?', options: ['3', '2', '6', '1/3'], correctIndex: 0, explanation: 'Consecutive terms have the same ratio, 6/2=18/6=54/18=3; thus r=3.', misconceptionId: 'GP_RATIO_DIRECTION' },
      { id: 'q-gp-2', subskill: 'Nth term', difficulty: 'Foundation', prompt: 'If a₁=5 and r=2, what is a₈?', options: ['640', '1280', '320', '80'], correctIndex: 0, explanation: 'Use aₙ=a₁r⁽ⁿ⁻¹⁾. For n=8, a₈=5·2⁷=640, since the exponent is n−1.', misconceptionId: 'GP_OFF_BY_ONE' },
      { id: 'q-gp-3', subskill: 'Finite sum', difficulty: 'Standard', prompt: 'Find 3+6+12+24.', options: ['45', '42', '48', '36'], correctIndex: 0, explanation: 'This is a four-term geometric series with sum 45.' },
      { id: 'q-gp-4', subskill: 'Finite sum', difficulty: 'Standard', prompt: 'For a₁=2, r=3, find S₆.', options: ['728', '729', '364', '486'], correctIndex: 0, explanation: 'S₆=2(1−3⁶)/(1−3)=728.' },
      { id: 'q-gp-5', subskill: 'Infinite sum', difficulty: 'Standard', prompt: 'Find the sum 8+4+2+1+⋯.', options: ['16', '15', '8', 'The series diverges'], correctIndex: 0, explanation: 'r=1/2, so S∞=8/(1−1/2)=16.', misconceptionId: 'GP_INF_CONVERGENCE' },
      { id: 'q-gp-6', subskill: 'Convergence', difficulty: 'Mixed', prompt: 'Does a geometric series with r=−1/2 converge?', options: ['Yes', 'No', 'Only if a₁=0', 'Only for an even number of terms'], correctIndex: 0, explanation: '|−1/2|<1, so the infinite geometric series converges.', misconceptionId: 'GP_INF_CONVERGENCE' },
      { id: 'q-gp-7', subskill: 'Geometric mean', difficulty: 'Standard', prompt: 'What positive geometric mean lies between 4 and 25?', options: ['10', '14.5', '√29', '20'], correctIndex: 0, explanation: 'G=√(4·25)=10.', misconceptionId: 'GP_MEAN_TYPE' },
      { id: 'q-gp-8', subskill: 'Recover first term', difficulty: 'Mixed', prompt: 'If a₃=12 and r=2, what is a₁?', options: ['3', '6', '12', '24'], correctIndex: 0, explanation: '12=a₁·2²=4a₁, so a₁=3.', misconceptionId: 'GP_OFF_BY_ONE' },
      { id: 'q-gp-9', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'A signal magnitude is halved each stage: 100,50,25,… What is the 5th-stage magnitude?', options: ['6.25', '12.5', '3.125', '25'], correctIndex: 0, explanation: 'a₅=100(1/2)⁴=6.25.' },
      { id: 'q-gp-10', subskill: 'Recurring decimal', difficulty: 'Board-review style', prompt: 'The series 0.3+0.03+0.003+⋯ sums to:', options: ['1/3', '3/10', '3/11', '1/9'], correctIndex: 0, explanation: 'a₁=0.3 and r=0.1, so S∞=0.3/(0.9)=1/3.', misconceptionId: 'GP_INF_CONVERGENCE' },
    ],
    eceBridge: [
      { title: 'Stage-by-stage attenuation or growth', description: 'Repeated multiplication by a fixed factor produces a geometric sequence, which appears in idealized cascaded gain/attenuation calculations.' },
      { title: 'Convergent repeated contributions', description: 'The infinite geometric formula models idealized repeated effects only when the magnitude ratio is below one.', formula: '|r|<1' },
    ],
    sources: [
      { book: 'College Algebra, 9th ed. — Michael Sullivan', role: 'Concept backbone', section: '9.1 Sequences; 9.3 Geometric Sequences; Geometric Series', locator: 'pp. 637–646; 653–663', use: 'Sequence notation, common ratio, nth terms, finite geometric sums, convergence, and infinite sums.', verificationStatus: 'verified-section-pages' },
      { book: 'College Algebra and Calculus: An Applied Approach, 2nd ed. — Larson & Hodgkins', role: 'Instructional design', section: '15.1 Sequences and Summation Notation; 15.3 Geometric Sequences and Series', locator: 'pp. 1056–1065; 1074–1082', use: 'Checkpoints for geometric nth terms, finite sums, infinite sums, and applications.', verificationStatus: 'verified-section-pages' },
      { book: '1,001 Algebra II Practice Problems For Dummies — Mary Jane Sterling', role: 'Practice taxonomy', section: 'Ch. 15 Sequences and Series', locator: 'pp. 97–102', use: 'Practice families for general terms, geometric sequences, finite/infinite sums, pattern recognition, and common sequence/series mistakes.', verificationStatus: 'verified-section-pages' },
    ],
  },

  'top-binomial-theorem': {
    canonicalTopicId: 'top-binomial-theorem',
    title: 'Binomial Theorem',
    groupLabel: 'Expressions & Polynomials',
    shortDescription: 'Use binomial coefficients, Pascal’s Triangle, and the general term to expand powers and extract specific coefficients efficiently.',
    boardPriority: 'Medium',
    objectives: [
      { id: 'bin-obj-1', text: 'Evaluate binomial coefficients using nCr or factorial notation.' },
      { id: 'bin-obj-2', text: 'Use Pascal’s Triangle to obtain binomial coefficients.' },
      { id: 'bin-obj-3', text: 'Expand (a+b)^n and (a−b)^n using the Binomial Theorem.' },
      { id: 'bin-obj-4', text: 'Find a specified term or coefficient without expanding the entire binomial.' },
      { id: 'bin-obj-5', text: 'Track the decreasing/increasing powers and sign pattern of each term.' },
    ],
    prerequisites: [
      { id: 'bin-pre-1', label: 'Factorials', checkPrompt: 'Evaluate 5!.', answer: '120' },
      { id: 'bin-pre-2', label: 'Exponent laws', checkPrompt: 'Simplify x⁵/x².', answer: 'x³' },
      { id: 'bin-pre-3', label: 'Binomial products', checkPrompt: 'Expand (x+y)².', answer: 'x²+2xy+y²' },
    ],
    rules: [
      { title: 'Binomial coefficient', formula: '\\binom{n}{r}=\\frac{n!}{r!(n-r)!}', meaning: 'Choose the coefficient associated with the rth power of the second binomial term.', condition: '0≤r≤n for nonnegative integer n.', commonError: 'Using r! twice in the denominator instead of r!(n−r)!.' },
      { title: 'Binomial Theorem', formula: '(a+b)^n=\\sum_{r=0}^{n}\\binom{n}{r}a^{n-r}b^r', meaning: 'The power of a decreases while the power of b increases; every term has total degree n.', condition: 'This algebraic expansion is stated here for nonnegative integer n.', commonError: 'Keeping both powers increasing or forgetting the coefficient.' },
      { title: 'General term', formula: 'T_{r+1}=\\binom{n}{r}a^{n-r}b^r', meaning: 'The (r+1)th term corresponds to index r.', condition: 'For a requested kth term, use r=k−1.', commonError: 'Off-by-one indexing: using r=k.' },
      { title: 'Difference sign pattern', formula: '(a-b)^n=\\sum_{r=0}^{n}\\binom{n}{r}a^{n-r}(-b)^r', meaning: 'Odd powers of the negative second term produce alternating signs.', commonError: 'Using all-positive coefficients for a binomial difference.' },
    ],
    misconceptions: [
      { id: 'BIN_OFF_BY_ONE', label: 'General-term off-by-one', symptom: 'Using r equal to the term number instead of one less.', correction: 'The formula is Tᵣ₊₁; for the kth term set r=k−1.', quickCheck: 'The 3rd term uses r=2.' },
      { id: 'BIN_POWER_DIRECTION', label: 'Wrong exponent directions', symptom: 'Both variable powers increase or decrease together.', correction: 'The first-term exponent starts at n and decreases; the second starts at 0 and increases.', quickCheck: 'In (x+y)⁵, x powers go 5,4,3,… while y powers go 0,1,2,…' },
      { id: 'BIN_SIGN_PATTERN', label: 'Ignoring alternating signs', symptom: 'Expanding (a−b)^n with all positive middle terms.', correction: 'Treat the second term as (−b) inside the theorem.', quickCheck: '(x−1)³=x³−3x²+3x−1.' },
      { id: 'BIN_COEFFICIENT', label: 'Wrong nCr value', symptom: 'Using n/r or an incorrect factorial denominator.', correction: 'Use n!/[r!(n−r)!] or the corresponding Pascal row.', quickCheck: '5C2=10.' },
    ],
    workedExamples: [
      { title: 'Expand with the theorem', problem: 'Expand (x+2)⁴.', strategy: 'Use coefficients 1,4,6,4,1 and pair them with descending x powers and ascending powers of 2.', steps: ['x⁴ term: x⁴.', 'Next: 4x³(2)=8x³.', 'Middle: 6x²(2²)=24x².', 'Next: 4x(2³)=32x.', 'Last: 2⁴=16.', 'Result: x⁴+8x³+24x²+32x+16.'], check: 'Substitute x=1: expansion gives 81=(1+2)⁴.', takeaway: 'Coefficient pattern, power direction, and total degree provide three independent error checks.' },
      { title: 'Find one term directly', problem: 'Find the 4th term of (2x−y)⁵.', strategy: 'Use r=3 because the 4th term is T₄=Tᵣ₊₁.', steps: ['T₄=C(5,3)(2x)^(5−3)(−y)³.', 'C(5,3)=10 and (2x)²=4x².', 'T₄=10·4x²·(−y³)=−40x²y³.'], check: 'The term has total degree 5 and a negative sign because r=3 is odd.', takeaway: 'Direct term extraction avoids a full expansion.' },
    ],
    practiceQuestions: [
      { id: 'q-bin-1', subskill: 'Binomial coefficient', difficulty: 'Foundation', prompt: 'Evaluate 7C2.', options: ['21', '14', '35', '42'], correctIndex: 0, explanation: '7C2=7!/(2!5!)=21.', misconceptionId: 'BIN_COEFFICIENT' },
      { id: 'q-bin-2', subskill: 'Number of terms', difficulty: 'Foundation', prompt: 'How many terms are in the expanded form of (x+y)⁸ before like-term simplification?', options: ['9', '8', '10', '16'], correctIndex: 0, explanation: 'A binomial raised to nonnegative integer n has n+1 terms in its standard expansion.' },
      { id: 'q-bin-3', subskill: 'Coefficient extraction', difficulty: 'Standard', prompt: 'What is the coefficient of x³y² in (x+y)⁵?', options: ['10', '5', '20', '15'], correctIndex: 0, explanation: 'x exponent 3 means r=2, so the coefficient is 5C2=10.', misconceptionId: 'BIN_COEFFICIENT' },
      { id: 'q-bin-4', subskill: 'General term', difficulty: 'Standard', prompt: 'What is the 3rd term of (a+b)⁶?', options: ['15a⁴b²', '20a³b³', '6a⁵b', '15a²b⁴'], correctIndex: 0, explanation: 'The 3rd term uses r=2: 6C2 a⁴b²=15a⁴b².', misconceptionId: 'BIN_OFF_BY_ONE' },
      { id: 'q-bin-5', subskill: 'Coefficient extraction', difficulty: 'Standard', prompt: 'What is the coefficient of x² in (x+2)⁴?', options: ['24', '12', '16', '6'], correctIndex: 0, explanation: 'The x² term is 4C2 x²·2²=24x².', misconceptionId: 'BIN_POWER_DIRECTION' },
      { id: 'q-bin-6', subskill: 'Constant term', difficulty: 'Mixed', prompt: 'What is the constant term in (x+3)⁵?', options: ['243', '81', '15', '729'], correctIndex: 0, explanation: 'The constant term occurs at r=5 and equals 3⁵=243.' },
      { id: 'q-bin-7', subskill: 'Signs', difficulty: 'Mixed', prompt: 'Which is the correct expansion of (x−1)³?', options: ['x³−3x²+3x−1', 'x³+3x²+3x+1', 'x³−x²+x−1', 'x³−3x²−3x−1'], correctIndex: 0, explanation: 'Use coefficients 1,3,3,1 with powers of −1 producing alternating signs.', misconceptionId: 'BIN_SIGN_PATTERN' },
      { id: 'q-bin-8', subskill: 'Specific term', difficulty: 'Board-review style', prompt: 'What is the 5th term of (2x+y)⁶?', options: ['60x²y⁴', '15x²y⁴', '120x²y⁴', '60x⁴y²'], correctIndex: 0, explanation: 'For the 5th term r=4: 6C4(2x)²y⁴=15·4x²y⁴=60x²y⁴.', misconceptionId: 'BIN_OFF_BY_ONE' },
      { id: 'q-bin-9', subskill: 'Coefficient sum', difficulty: 'Board-review style', prompt: 'What is the sum of the coefficients of (x+y)⁵?', options: ['32', '25', '16', '10'], correctIndex: 0, explanation: 'Set x=1 and y=1: (1+1)⁵=32.' },
      { id: 'q-bin-10', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'In (1+ε)³, what is the coefficient of ε²?', options: ['3', '1', '6', '9'], correctIndex: 0, explanation: '(1+ε)³=1+3ε+3ε²+ε³, so the ε² coefficient is 3.' },
    ],
    eceBridge: [
      { title: 'Small-parameter expansions', description: 'Finite binomial expansions organize exact powers such as (1+ε)^n and help identify first-, second-, and higher-order contributions.' },
      { title: 'Combinatorial coefficients', description: 'The same nCr coefficients recur in counting and probability, so this topic connects Algebra to later probability review.' },
    ],
    sources: [
      { book: 'College Algebra, 9th ed. — Michael Sullivan', role: 'Concept backbone', section: '9.5 The Binomial Theorem', locator: 'pp. 668–673', use: 'Binomial coefficients, theorem statement, Pascal-style coefficient structure, expansions, and specific-term extraction.', verificationStatus: 'verified-section-pages' },
      { book: 'College Algebra and Calculus: An Applied Approach, 2nd ed. — Larson & Hodgkins', role: 'Instructional design', section: '16.6 The Binomial Theorem', locator: 'pp. 1193–1199', use: 'Objectives, factorial/nCr work, Pascal’s Triangle, full expansion, specific-term checkpoints, and summary prompts.', verificationStatus: 'verified-section-pages' },
      { book: '1,001 Algebra II Practice Problems For Dummies — Mary Jane Sterling', role: 'Practice taxonomy', section: 'Ch. 1 Pascal’s Triangle practice; Ch. 17 Counting Techniques and Probability — binomial expansion', locator: 'p. 8; pp. 109–116', use: 'Repeated practice using Pascal’s Triangle, combinations, and binomial expansion patterns.', verificationStatus: 'verified-section-pages' },
    ],
  },


  'top-matrices': {
    canonicalTopicId: 'top-matrices',
    title: 'Matrices',
    groupLabel: 'Systems, Sequences & Applications',
    shortDescription: 'Matrix dimensions, operations, multiplication, row reduction, inverses, determinants, and linear-system applications.',
    boardPriority: 'High',
    objectives: [
      { id: 'mat-obj-1', text: 'Identify matrix dimensions and locate entries by row and column.' },
      { id: 'mat-obj-2', text: 'Add, subtract, and scale matrices when dimensions permit.' },
      { id: 'mat-obj-3', text: 'Multiply compatible matrices using row-by-column products.' },
      { id: 'mat-obj-4', text: 'Represent linear systems with augmented matrices and perform elementary row operations.' },
      { id: 'mat-obj-5', text: 'Evaluate 2×2 determinants and determine whether a square matrix is invertible.' },
      { id: 'mat-obj-6', text: 'Use inverse matrices or row reduction to solve small linear systems.' },
    ],
    prerequisites: [
      { id: 'mat-pre-1', label: 'Ordered arithmetic', checkPrompt: 'Evaluate 2(3)+4(−1).', answer: '2' },
      { id: 'mat-pre-2', label: 'Linear systems', checkPrompt: 'What ordered pair solves x+y=5 and x−y=1?', answer: '(3,2)' },
      { id: 'mat-pre-3', label: 'Determinant arithmetic', checkPrompt: 'Evaluate 2·5−3·1.', answer: '7' },
    ],
    rules: [
      { title: 'Matrix dimension', formula: 'm\\times n', meaning: 'An m×n matrix has m rows and n columns.', commonError: 'Reversing rows and columns when naming the dimension.' },
      { title: 'Addition and subtraction', formula: 'C=A\\pm B', meaning: 'Corresponding entries are combined element by element.', condition: 'A and B must have the same dimensions.', commonError: 'Adding matrices of unlike dimensions.' },
      { title: 'Matrix multiplication compatibility', formula: '(m\\times n)(n\\times p)\\rightarrow(m\\times p)', meaning: 'The inner dimensions must match; the product uses row-by-column dot products.', condition: 'Number of columns of the first matrix equals number of rows of the second.', commonError: 'Multiplying corresponding entries instead of row by column.' },
      { title: '2×2 determinant', formula: '\\det\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix}=ad-bc', meaning: 'The determinant identifies singularity and supports inverse/Cramer calculations.', condition: 'A 2×2 inverse exists only when ad−bc≠0.', commonError: 'Using ad+bc or reversing the subtraction.' },
      { title: '2×2 inverse', formula: 'A^{-1}=\\frac{1}{ad-bc}\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}', meaning: 'Swap the diagonal entries, negate the off-diagonal entries, then divide by the determinant.', condition: 'det(A)≠0.', commonError: 'Attempting to invert a singular matrix.' },
    ],
    misconceptions: [
      { id: 'MAT_DIM_ORDER', label: 'Reversing matrix dimensions', symptom: 'Calling a 2-row, 3-column matrix a 3×2 matrix.', correction: 'Always report rows first, then columns.', quickCheck: '[[1,2,3],[4,5,6]] is 2×3.' },
      { id: 'MAT_MULT_ELEMENTWISE', label: 'Elementwise matrix multiplication', symptom: 'Multiplying entries in matching positions for ordinary matrix multiplication.', correction: 'Each product entry is a row-by-column dot product.', quickCheck: 'For AB, c₁₁=row 1 of A · column 1 of B.' },
      { id: 'MAT_PRODUCT_ORDER', label: 'Assuming AB=BA', symptom: 'Swapping matrix multiplication order without checking.', correction: 'Matrix multiplication is generally not commutative and one order may even be undefined.', quickCheck: 'A 2×3 times B 3×2 is defined, but BA has a different size.' },
      { id: 'MAT_SINGULAR_INVERSE', label: 'Inverting a singular matrix', symptom: 'Applying the inverse formula when det(A)=0.', correction: 'Compute the determinant first; det(A)=0 means no inverse exists.', quickCheck: '[[1,2],[2,4]] has determinant 0.' },
    ],
    workedExamples: [
      { title: 'Multiply two matrices', problem: 'Find AB for A=[[1,2],[3,4]] and B=[[2,0],[1,5]].', strategy: 'Compute every entry using a row of A dotted with a column of B.', steps: ['c₁₁=1(2)+2(1)=4 and c₁₂=1(0)+2(5)=10.', 'c₂₁=3(2)+4(1)=10 and c₂₂=3(0)+4(5)=20.', 'Therefore AB=[[4,10],[10,20]].'], check: 'Both factors are 2×2, so the product must also be 2×2.', takeaway: 'Dimension checks catch many matrix-multiplication errors before arithmetic starts.' },
      { title: 'Solve with an augmented matrix', problem: 'Solve x+y=5 and 2x−y=1.', strategy: 'Write the augmented matrix and eliminate one variable with a row operation.', steps: ['Start with [[1,1|5],[2,−1|1]].', 'R₂←R₂−2R₁ gives [[1,1|5],[0,−3|−9]].', 'Thus y=3, then x=2.'], check: '2+3=5 and 2(2)−3=1.', takeaway: 'Row operations preserve the solution set when applied correctly.' },
    ],
    practiceQuestions: [
      { id: 'q-mat-1', subskill: 'Dimensions', difficulty: 'Foundation', prompt: 'What is the dimension of [[1,2,3],[4,5,6]]?', options: ['2×3', '3×2', '2×2', '3×3'], correctIndex: 0, explanation: 'There are 2 rows and 3 columns.', misconceptionId: 'MAT_DIM_ORDER' },
      { id: 'q-mat-2', subskill: 'Addition', difficulty: 'Foundation', prompt: 'If A=[[1,2],[3,4]] and B=[[2,1],[0,5]], what is A+B?', options: ['[[3,3],[3,9]]', '[[2,2],[0,20]]', '[[−1,1],[3,−1]]', '[[3,2],[3,20]]'], correctIndex: 0, explanation: 'Add corresponding entries: [[1+2,2+1],[3+0,4+5]].' },
      { id: 'q-mat-3', subskill: 'Scalar multiplication', difficulty: 'Foundation', prompt: 'Compute 3[[2,−1],[0,4]].', options: ['[[6,−3],[0,12]]', '[[5,2],[3,7]]', '[[6,−1],[0,12]]', '[[6,3],[0,12]]'], correctIndex: 0, explanation: 'Multiply every entry by 3.' },
      { id: 'q-mat-4', subskill: 'Multiplication', difficulty: 'Standard', prompt: 'If A=[[1,2],[0,1]] and B=[[3,1],[4,2]], what is the (1,1) entry of AB?', options: ['11', '7', '3', '5'], correctIndex: 0, explanation: 'Row 1 of A dotted with column 1 of B: 1(3)+2(4)=11.', misconceptionId: 'MAT_MULT_ELEMENTWISE' },
      { id: 'q-mat-5', subskill: 'Compatibility', difficulty: 'Standard', prompt: 'A is 2×3 and B is 3×4. What is the dimension of AB?', options: ['2×4', '3×3', '4×2', '2×3'], correctIndex: 0, explanation: 'The inner dimensions 3 and 3 match; the outer dimensions give 2×4.', misconceptionId: 'MAT_DIM_ORDER' },
      { id: 'q-mat-6', subskill: 'Determinants', difficulty: 'Standard', prompt: 'Evaluate det([[2,3],[1,5]]).', options: ['7', '13', '−7', '10'], correctIndex: 0, explanation: 'det=2(5)−3(1)=7.' },
      { id: 'q-mat-7', subskill: 'Invertibility', difficulty: 'Mixed', prompt: 'Which condition guarantees that a 2×2 matrix A has an inverse?', options: ['det(A)≠0', 'det(A)=0', 'A has equal rows', 'A has a zero entry'], correctIndex: 0, explanation: 'A square matrix is invertible exactly when its determinant is nonzero.', misconceptionId: 'MAT_SINGULAR_INVERSE' },
      { id: 'q-mat-8', subskill: 'Inverse matrices', difficulty: 'Mixed', prompt: 'What is the inverse of [[2,0],[0,4]]?', options: ['[[1/2,0],[0,1/4]]', '[[2,0],[0,4]]', '[[4,0],[0,2]]', '[[−2,0],[0,−4]]'], correctIndex: 0, explanation: 'For a diagonal matrix with nonzero diagonal entries, invert each diagonal entry.', misconceptionId: 'MAT_SINGULAR_INVERSE' },
      { id: 'q-mat-9', subskill: 'Augmented matrices', difficulty: 'Board-review style', prompt: 'For 2x+3y=7 and x−y=4, which augmented matrix is correct?', options: ['[[2,3|7],[1,−1|4]]', '[[2,7|3],[1,4|−1]]', '[[2,3|1],[7,−1|4]]', '[[3,2|7],[−1,1|4]]'], correctIndex: 0, explanation: 'Coefficients remain aligned by variable, with constants in the augmented column.' },
      { id: 'q-mat-10', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'If A=[[1,1],[1,−1]] and x=[3,1]ᵀ, what is Ax?', options: ['[4,2]ᵀ', '[3,−1]ᵀ', '[2,4]ᵀ', '[4,−2]ᵀ'], correctIndex: 0, explanation: 'First output is 3+1=4; second is 3−1=2.', misconceptionId: 'MAT_MULT_ELEMENTWISE' },
      { id: 'q-mat-11', subskill: 'Matrix multiplication dimensions', difficulty: 'Standard', prompt: 'If A is 2×3 and B is 3×4, what is the dimension of AB?', options: ['2×4', '3×3', '4×2', 'AB is undefined'], correctIndex: 0, explanation: 'The inner dimensions 3 match; the product keeps the outer dimensions 2×4.' },
      { id: 'q-mat-12', subskill: 'Determinant', difficulty: 'Foundation', prompt: 'Find det([[2,1],[3,4]]).', options: ['5', '11', '8', '−5'], correctIndex: 0, explanation: 'For a 2×2 matrix [[a,b],[c,d]], the determinant is ad−bc. Here, 2(4)−1(3)=8−3=5.' },
      { id: 'q-mat-13', subskill: 'Inverse existence', difficulty: 'Standard', prompt: 'Which 2×2 matrix has no inverse?', options: ['[[1,2],[2,4]]', '[[1,0],[0,1]]', '[[2,0],[0,3]]', '[[1,1],[0,1]]'], correctIndex: 0, explanation: 'Its determinant is 1·4−2·2=0, so it is singular.', misconceptionId: 'MAT_SINGULAR_INVERSE' },
      { id: 'q-mat-14', subskill: 'Matrix product', difficulty: 'Mixed', prompt: 'For row [1,2] times column [3,4]ᵀ, what is the product?', options: ['11', '7', '[3,8]', '14'], correctIndex: 0, explanation: 'A row times a column is a dot product: multiply corresponding entries and add. Thus 1(3)+2(4)=3+8=11.', misconceptionId: 'MAT_MULT_ELEMENTWISE' },
      { id: 'q-mat-15', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'For [V]=[R][I], if [R] is 2×2 and [I] is 2×1, what is the dimension of [V]?', options: ['2×1', '1×2', '2×2', '1×1'], correctIndex: 0, explanation: '(2×2)(2×1) produces a 2×1 vector.' },
    ],
    eceBridge: [
      { title: 'Nodal and mesh systems', description: 'Small circuit equation sets can be organized as Ax=b, then solved by elimination, inverse methods, or computational tools.' },
      { title: 'State-space preparation', description: 'Row-by-column multiplication and matrix dimensions become essential later in state-space and signal-processing models.' },
    ],
    sources: [
      { book: 'College Algebra, 9th ed. — Michael Sullivan', role: 'Concept backbone', section: '8.2 Systems of Linear Equations: Matrices; 8.4 Matrix Algebra', locator: 'pp. 556–570; 580–596', use: 'Augmented matrices, row operations, row-reduction solving, matrix operations, products, inverses, and inverse-matrix solutions.', verificationStatus: 'verified-section-pages' },
      { book: 'College Algebra and Calculus: An Applied Approach, 2nd ed. — Larson & Hodgkins', role: 'Instructional design', section: '6.1–6.4 Matrices and Determinants', locator: 'pp. 474–520', use: 'Dimensions, Gaussian/Gauss-Jordan elimination, matrix operations, inverses, determinants, and checkpoint-based practice.', verificationStatus: 'verified-section-pages' },
      { book: '1,001 Algebra II Practice Problems For Dummies — Mary Jane Sterling', role: 'Practice taxonomy', section: 'Ch. 14 Matrices', locator: 'pp. 91–96', use: 'Practice families for dimensions, arithmetic, multiplication, inverses, and solving systems, including common matrix-error patterns.', verificationStatus: 'verified-section-pages' },
    ],
  },

  'top-partial-fractions': {
    canonicalTopicId: 'top-partial-fractions',
    title: 'Partial Fractions Decomposition',
    groupLabel: 'Systems, Sequences & Applications',
    shortDescription: 'Decompose proper rational expressions across distinct, repeated, and irreducible quadratic factors, with coefficient-solving and ECE transfer-function applications.',
    boardPriority: 'High',
    objectives: [
      { id: 'pf-obj-1', text: 'Distinguish proper from improper rational expressions and divide first when necessary.' },
      { id: 'pf-obj-2', text: 'Write the correct decomposition template for distinct linear factors.' },
      { id: 'pf-obj-3', text: 'Include every required power for repeated linear factors.' },
      { id: 'pf-obj-4', text: 'Use linear numerators over irreducible quadratic factors.' },
      { id: 'pf-obj-5', text: 'Determine coefficients by strategic substitution or coefficient matching.' },
      { id: 'pf-obj-6', text: 'Check a decomposition by recombining the fractions.' },
    ],
    prerequisites: [
      { id: 'pf-pre-1', label: 'Factoring', checkPrompt: 'Factor x²−x−6.', answer: '(x−3)(x+2)' },
      { id: 'pf-pre-2', label: 'Rational expressions', checkPrompt: 'When is P(x)/Q(x) proper?', answer: 'When degree(P)<degree(Q)' },
      { id: 'pf-pre-3', label: 'Systems', checkPrompt: 'Solve A+B=5 and A−B=1.', answer: 'A=3, B=2' },
    ],
    rules: [
      { title: 'Proper-first rule', formula: '\\deg P<\\deg Q', meaning: 'Partial-fraction decomposition is applied to the proper rational remainder.', condition: 'If degree(P)≥degree(Q), perform polynomial division first.', commonError: 'Trying to decompose an improper rational expression directly.' },
      { title: 'Distinct linear factors', formula: '\\frac{P(x)}{(x-a)(x-b)}=\\frac{A}{x-a}+\\frac{B}{x-b}', meaning: 'Each distinct linear factor receives one constant numerator.', condition: 'The displayed form assumes distinct factors.', commonError: 'Omitting one denominator factor or giving a linear numerator unnecessarily.' },
      { title: 'Repeated linear factor', formula: '\\frac{P(x)}{(x-a)^k}=\\frac{A_1}{x-a}+\\frac{A_2}{(x-a)^2}+\\cdots+\\frac{A_k}{(x-a)^k}', meaning: 'Every power from 1 through k must appear.', commonError: 'Writing only the highest-power term.' },
      { title: 'Irreducible quadratic factor', formula: '\\frac{Ax+B}{x^2+px+q}', meaning: 'A nonrepeated irreducible quadratic factor requires a linear numerator.', condition: 'The quadratic does not factor over the reals.', commonError: 'Using only a constant numerator over an irreducible quadratic.' },
    ],
    misconceptions: [
      { id: 'PF_IMPROPER_FIRST', label: 'Skipping polynomial division', symptom: 'Decomposing when the numerator degree is not less than the denominator degree.', correction: 'Divide first, then decompose only the proper remainder.', quickCheck: '(x²+1)/(x−1) is improper.' },
      { id: 'PF_REPEAT_MISSING', label: 'Missing repeated-factor terms', symptom: 'Using only A/(x−a)^k for a repeated factor.', correction: 'Include A₁/(x−a)+...+A_k/(x−a)^k.', quickCheck: '(x−1)² requires both 1/(x−1) and 1/(x−1)² terms.' },
      { id: 'PF_QUAD_NUMERATOR', label: 'Wrong quadratic numerator', symptom: 'Putting a constant numerator over an irreducible quadratic.', correction: 'Use a general linear numerator Ax+B.', quickCheck: 'x²+1 requires (Ax+B)/(x²+1).' },
      { id: 'PF_COEFFICIENT_SIGN', label: 'Coefficient sign error', symptom: 'Strategic substitution is correct but the final coefficient sign is reversed.', correction: 'Substitute back or recombine to verify the original numerator exactly.', quickCheck: 'Always expand A(x−b)+B(x−a) and compare.' },
    ],
    workedExamples: [
      { title: 'Distinct linear factors', problem: 'Decompose (5x−1)/[(x−2)(x+1)].', strategy: 'Write A/(x−2)+B/(x+1), clear denominators, then use x-values that zero one term at a time.', steps: ['5x−1=A(x+1)+B(x−2).', 'Set x=2: 9=3A, so A=3.', 'Set x=−1: −6=−3B, so B=2.', 'Result: 3/(x−2)+2/(x+1).'], check: '3(x+1)+2(x−2)=5x−1.', takeaway: 'Strategic substitution is fast when the denominator has distinct linear factors.' },
      { title: 'Repeated-factor template', problem: 'Set up the decomposition for (2x+1)/[(x−1)²(x+3)].', strategy: 'List every power of the repeated factor and one term for the distinct factor.', steps: ['Repeated (x−1)² contributes A/(x−1)+B/(x−1)².', 'Distinct (x+3) contributes C/(x+3).', 'Template: A/(x−1)+B/(x−1)²+C/(x+3).'], check: 'The template has one unknown coefficient for each required partial-fraction term.', takeaway: 'Correct setup is often the highest-value step in board-style decomposition questions.' },
    ],
    practiceQuestions: [
      { id: 'q-pf-1', subskill: 'Proper expressions', difficulty: 'Foundation', prompt: 'Which rational expression is proper?', options: ['(x+1)/(x²+3)', '(x²+1)/(x−2)', '(x³+1)/(x²+1)', '(2x²+1)/(x²−4)'], correctIndex: 0, explanation: 'A proper rational expression has numerator degree lower than denominator degree.', misconceptionId: 'PF_IMPROPER_FIRST' },
      { id: 'q-pf-2', subskill: 'Distinct linear setup', difficulty: 'Foundation', prompt: 'What is the correct setup for 1/[(x−1)(x+2)]?', options: ['A/(x−1)+B/(x+2)', '(Ax+B)/[(x−1)(x+2)]', 'A/(x−1)²+B/(x+2)²', '(Ax+B)/(x−1)+C/(x+2)'], correctIndex: 0, explanation: 'Each distinct linear factor receives one constant numerator.' },
      { id: 'q-pf-3', subskill: 'Repeated linear setup', difficulty: 'Standard', prompt: 'What is the correct partial-fraction template for 1/[x(x−1)²]?', options: ['A/x+B/(x−1)+C/(x−1)²', 'A/x+B/(x−1)²', 'A/x²+B/(x−1)²', '(Ax+B)/[x(x−1)²]'], correctIndex: 0, explanation: 'The repeated factor (x−1)² requires terms for powers 1 and 2.', misconceptionId: 'PF_REPEAT_MISSING' },
      { id: 'q-pf-4', subskill: 'Irreducible quadratic setup', difficulty: 'Standard', prompt: 'What numerator form belongs over the irreducible factor x²+1?', options: ['Ax+B', 'A only', 'Ax²+B', 'A/x+B'], correctIndex: 0, explanation: 'An irreducible quadratic factor requires a general linear numerator Ax+B.', misconceptionId: 'PF_QUAD_NUMERATOR' },
      { id: 'q-pf-5', subskill: 'Coefficient solving', difficulty: 'Standard', prompt: 'Decompose (5x−1)/[(x−2)(x+1)]. What are A and B in A/(x−2)+B/(x+1)?', options: ['A=3, B=2', 'A=2, B=3', 'A=3, B=−2', 'A=−3, B=2'], correctIndex: 0, explanation: 'Setting x=2 gives A=3; setting x=−1 gives B=2.', misconceptionId: 'PF_COEFFICIENT_SIGN' },
      { id: 'q-pf-6', subskill: 'Coefficient solving', difficulty: 'Mixed', prompt: 'Decompose (3x+5)/(x²−1). What is the result?', options: ['4/(x−1)−1/(x+1)', '1/(x−1)+4/(x+1)', '4/(x−1)+1/(x+1)', '−4/(x−1)+1/(x+1)'], correctIndex: 0, explanation: 'With A/(x−1)+B/(x+1), x=1 gives A=4 and x=−1 gives B=−1.', misconceptionId: 'PF_COEFFICIENT_SIGN' },
      { id: 'q-pf-7', subskill: 'Improper expressions', difficulty: 'Mixed', prompt: 'What should be done first to (x²+1)/(x−1) before partial-fraction decomposition?', options: ['Polynomial division', 'Differentiate the numerator', 'Square the denominator', 'Use a constant numerator immediately'], correctIndex: 0, explanation: 'The numerator degree is at least the denominator degree, so divide first.', misconceptionId: 'PF_IMPROPER_FIRST' },
      { id: 'q-pf-8', subskill: 'Mixed-factor setup', difficulty: 'Board-review style', prompt: 'What is the correct template for 1/[x(x²+1)]?', options: ['A/x+(Bx+C)/(x²+1)', 'A/x+B/(x²+1)', '(Ax+B)/x+C/(x²+1)', 'A/x²+(Bx+C)/(x²+1)'], correctIndex: 0, explanation: 'The linear factor x gets a constant numerator; irreducible x²+1 gets Bx+C.', misconceptionId: 'PF_QUAD_NUMERATOR' },
      { id: 'q-pf-9', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'Decompose 1/[s(s+2)].', options: ['(1/2)/s−(1/2)/(s+2)', '(1/2)/s+(1/2)/(s+2)', '1/s−1/(s+2)', '2/s−2/(s+2)'], correctIndex: 0, explanation: '1=A(s+2)+Bs. Setting s=0 gives A=1/2; s=−2 gives B=−1/2.', misconceptionId: 'PF_COEFFICIENT_SIGN' },
      { id: 'q-pf-10', subskill: 'Repeated-factor setup', difficulty: 'Board-review style', prompt: 'How many partial-fraction terms are required for denominator (x−2)³(x+1)?', options: ['4', '3', '2', '5'], correctIndex: 0, explanation: 'The repeated cubic factor needs three terms, plus one for x+1, for a total of four.', misconceptionId: 'PF_REPEAT_MISSING' },
      { id: 'q-pf-11', subskill: 'Distinct linear factors', difficulty: 'Standard', prompt: 'Which template fits 1/[(x−2)(x+3)]?', options: ['A/(x−2)+B/(x+3)', 'A/(x−2)²+B/(x+3)', '(Ax+B)/[(x−2)(x+3)]', 'A/x+B/x²'], correctIndex: 0, explanation: 'Each distinct linear factor receives a constant numerator term.' },
      { id: 'q-pf-12', subskill: 'Repeated linear factors', difficulty: 'Standard', prompt: 'Which terms are required for a repeated factor (x−1)³?', options: ['A/(x−1)+B/(x−1)²+C/(x−1)³', 'A/(x−1)³ only', 'A/(x−1)+B/(x−1)³', '(Ax+B)/(x−1)³'], correctIndex: 0, explanation: 'Include every power from 1 through 3 for a repeated linear factor.', misconceptionId: 'PF_REPEAT_MISSING' },
      { id: 'q-pf-13', subskill: 'Irreducible quadratic', difficulty: 'Standard', prompt: 'What numerator form belongs above x²+4?', options: ['Ax+B', 'A', 'Ax²+B', 'A/(x+B)'], correctIndex: 0, explanation: 'An irreducible quadratic factor receives a linear numerator Ax+B.', misconceptionId: 'PF_QUAD_NUMERATOR' },
      { id: 'q-pf-14', subskill: 'Improper rational expression', difficulty: 'Mixed', prompt: 'What should be done first when numerator degree is at least denominator degree?', options: ['Polynomial division', 'Cover-up immediately', 'Cancel any unlike terms', 'Differentiate'], correctIndex: 0, explanation: 'Convert the expression to polynomial plus a proper rational remainder first.', misconceptionId: 'PF_IMPROPER_FIRST' },
      { id: 'q-pf-15', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'Decompose 2/[s(s+2)]. What is the coefficient of 1/s?', options: ['1', '−1', '2', '1/2'], correctIndex: 0, explanation: '2/[s(s+2)]=1/s−1/(s+2), so the 1/s coefficient is 1.' },
    ],
    eceBridge: [
      { title: 'Laplace-domain decomposition', description: 'Transfer functions with factored denominators are often decomposed before inverse Laplace transformation.', formula: '\\frac{1}{s(s+a)}=\\frac{1/a}{s}-\\frac{1/a}{s+a}' },
      { title: 'Pole-aware setup', description: 'Repeated poles and irreducible quadratic factors determine the required decomposition structure before coefficients are solved.' },
    ],
    sources: [
      { book: 'College Algebra, 9th ed. — Michael Sullivan', role: 'Concept backbone', section: '8.5 Partial Fraction Decomposition', locator: 'pp. 597–604', use: 'Proper/improper preparation and the standard cases for distinct linear, repeated linear, and irreducible quadratic factors.', verificationStatus: 'verified-section-pages' },
      { book: 'College Algebra and Calculus: An Applied Approach, 2nd ed. — Larson & Hodgkins', role: 'Instructional design', section: 'Preface — Table of Contents Changes', locator: 'p. x', use: 'Scope note only: this edition explicitly states that the former Partial Fractions section was removed, so it is not used as a content source for this lesson.', verificationStatus: 'verified-section-pages' },
      { book: '1,001 Algebra II Practice Problems For Dummies — Mary Jane Sterling', role: 'Practice taxonomy', section: 'Ch. 11 Systems of Linear Equations — Decomposing Fractions Using Systems', locator: 'pp. 77–78', use: 'Practice support for solving decomposition coefficients through systems of linear equations; the full case taxonomy is supplied by Sullivan.', verificationStatus: 'verified-section-pages' },
    ],
  },

  'top-word-problems': {
    canonicalTopicId: 'top-word-problems',
    title: 'Algebraic Modeling & Word Problems',
    groupLabel: 'Systems, Sequences & Applications',
    shortDescription: 'Translate verbal conditions into equations for rate, work, mixture, age, percent, geometry, variation, and engineering-formula problems.',
    boardPriority: 'High',
    objectives: [
      { id: 'wp-obj-1', text: 'Define unknowns with units before writing equations.' },
      { id: 'wp-obj-2', text: 'Translate verbal relationships into algebraic equalities without reversing quantities.' },
      { id: 'wp-obj-3', text: 'Solve uniform-motion problems using distance=rate×time.' },
      { id: 'wp-obj-4', text: 'Solve work-rate and mixture/concentration models.' },
      { id: 'wp-obj-5', text: 'Solve age, percent, geometry, and variation models.' },
      { id: 'wp-obj-6', text: 'Check the algebraic answer against the original physical or verbal constraints.' },
    ],
    prerequisites: [
      { id: 'wp-pre-1', label: 'Linear equations', checkPrompt: 'Solve 3x+5=20.', answer: 'x=5' },
      { id: 'wp-pre-2', label: 'Percent conversion', checkPrompt: 'Write 35% as a decimal.', answer: '0.35' },
      { id: 'wp-pre-3', label: 'Literal formulas', checkPrompt: 'From d=rt, solve for t.', answer: 't=d/r' },
    ],
    rules: [
      { title: 'Modeling workflow', formula: '\\text{words}\\rightarrow\\text{variables}\\rightarrow\\text{equation}\\rightarrow\\text{solve}\\rightarrow\\text{check}', meaning: 'Translate the actual relationship before manipulating symbols.', commonError: 'Starting algebra before defining what the unknown represents.' },
      { title: 'Uniform motion', formula: 'd=rt', meaning: 'Distance equals rate times time.', condition: 'Use consistent units and distinguish relative/individual rates.', commonError: 'Adding times when the problem requires adding distances or relative speeds.' },
      { title: 'Work rate', formula: '\\frac{1}{T}=\\frac{1}{t_1}+\\frac{1}{t_2}+\\cdots', meaning: 'If one worker completes one job in t hours, its rate is 1/t job per hour.', condition: 'Subtract a rate for draining/removing work when appropriate.', commonError: 'Adding completion times instead of rates.' },
      { title: 'Mixture balance', formula: 'c_1V_1+c_2V_2=c_f(V_1+V_2)', meaning: 'Amount of pure component before mixing equals amount after mixing.', condition: 'Express percentages as decimals.', commonError: 'Averaging concentrations without weighting by quantity.' },
      { title: 'Direct variation', formula: 'y=kx', meaning: 'The ratio y/x is constant in direct variation.', commonError: 'Confusing direct variation with inverse variation y=k/x.' },
    ],
    misconceptions: [
      { id: 'WP_REVERSED_RELATION', label: 'Reversed verbal relationship', symptom: 'Translating “5 less than x” as 5−x.', correction: '“5 less than x” means start with x and subtract 5: x−5.', quickCheck: 'Three more than n is n+3.' },
      { id: 'WP_RATE_TIME_ADD', label: 'Adding times instead of rates', symptom: 'For two workers, using T=t₁+t₂.', correction: 'Convert each completion time into a work rate before combining.', quickCheck: '6 h and 3 h workers have combined rate 1/6+1/3=1/2 job/h.' },
      { id: 'WP_MIXTURE_UNWEIGHTED', label: 'Unweighted mixture average', symptom: 'Averaging two concentrations without considering volumes.', correction: 'Balance pure amount: concentration×quantity.', quickCheck: 'Equal concentrations can be averaged directly; unequal quantities require weighting.' },
      { id: 'WP_UNIT_MISMATCH', label: 'Unit inconsistency', symptom: 'Combining minutes with hours or percent with whole-number concentration.', correction: 'Convert all quantities to compatible units before forming the equation.', quickCheck: '30 min=0.5 h.' },
    ],
    workedExamples: [
      { title: 'Combined work', problem: 'A can finish a job in 6 h and B in 3 h. How long together?', strategy: 'Convert times to rates, add rates, then invert the combined rate.', steps: ['A rate=1/6 job/h.', 'B rate=1/3 job/h.', 'Combined rate=1/6+1/3=1/2 job/h.', 'Time=1/(1/2)=2 h.'], check: 'In 2 h, A completes 1/3 and B completes 2/3; total=1 job.', takeaway: 'Work problems combine rates, not completion times.' },
      { title: 'Concentration mixture', problem: 'How much pure concentrate must be added to 20 L of 30% solution to obtain 50% solution?', strategy: 'Balance the amount of pure solute before and after.', steps: ['Initial pure amount=0.30(20)=6 L.', 'Let x L of pure concentrate be added.', '6+x=0.50(20+x).', '6+x=10+0.5x, so 0.5x=4 and x=8 L.'], check: 'Final volume=28 L and pure amount=14 L; 14/28=50%.', takeaway: 'Mixture equations are weighted amount balances.' },
    ],
    practiceQuestions: [
      { id: 'q-wp-1', subskill: 'Uniform motion', difficulty: 'Foundation', prompt: 'How long does it take to travel 180 km at 60 km/h?', options: ['3 h', '2 h', '4 h', '120 h'], correctIndex: 0, explanation: 't=d/r=180/60=3 h.' },
      { id: 'q-wp-2', subskill: 'Mixture', difficulty: 'Standard', prompt: 'How many liters of pure concentrate must be added to 20 L of 30% solution to make a 50% solution?', options: ['8 L', '5 L', '10 L', '12 L'], correctIndex: 0, explanation: '0.30(20)+x=0.50(20+x) gives x=8.', misconceptionId: 'WP_MIXTURE_UNWEIGHTED' },
      { id: 'q-wp-3', subskill: 'Work rate', difficulty: 'Standard', prompt: 'A finishes a job in 6 h and B in 3 h. How long do they take together?', options: ['2 h', '4.5 h', '9 h', '3 h'], correctIndex: 0, explanation: 'Combined rate=1/6+1/3=1/2 job/h, so time=2 h.', misconceptionId: 'WP_RATE_TIME_ADD' },
      { id: 'q-wp-4', subskill: 'Age', difficulty: 'Foundation', prompt: 'A father is three times his son’s age. Their ages total 48. How old is the son?', options: ['12', '16', '24', '36'], correctIndex: 0, explanation: 'Let son=x; father=3x. Then 4x=48, so x=12.' },
      { id: 'q-wp-5', subskill: 'Percent', difficulty: 'Foundation', prompt: '30 is 20% of what number?', options: ['150', '60', '120', '6'], correctIndex: 0, explanation: '0.20x=30, so x=150.' },
      { id: 'q-wp-6', subskill: 'Simple interest', difficulty: 'Standard', prompt: 'Find simple interest on ₱5,000 at 6% per year for 2 years.', options: ['₱600', '₱300', '₱5,600', '₱6,000'], correctIndex: 0, explanation: 'I=Prt=5000(0.06)(2)=600.' },
      { id: 'q-wp-7', subskill: 'Relative motion', difficulty: 'Mixed', prompt: 'Two vehicles leave the same point in opposite directions at 40 km/h and 60 km/h. How far apart are they after 3 h?', options: ['300 km', '180 km', '120 km', '100 km'], correctIndex: 0, explanation: 'Relative speed=40+60=100 km/h; separation=100(3)=300 km.', misconceptionId: 'WP_UNIT_MISMATCH' },
      { id: 'q-wp-8', subskill: 'Geometry model', difficulty: 'Mixed', prompt: 'A rectangle has length twice its width and perimeter 36. What are its dimensions?', options: ['6 by 12', '9 by 18', '4 by 8', '12 by 24'], correctIndex: 0, explanation: '2(L+W)=36 and L=2W, so 2(3W)=36, W=6 and L=12.' },
      { id: 'q-wp-9', subskill: 'Direct variation', difficulty: 'Board-review style', prompt: 'If y varies directly as x and y=12 when x=3, find y when x=5.', options: ['20', '15', '4', '60'], correctIndex: 0, explanation: 'y=kx; k=12/3=4, so y=4(5)=20.' },
      { id: 'q-wp-10', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'Using V=IR, what current flows when V=12 V and R=4 Ω?', options: ['3 A', '48 A', '8 A', '0.33 A'], correctIndex: 0, explanation: 'I=V/R=12/4=3 A.' },
    ],
    eceBridge: [
      { title: 'Formula modeling', description: 'Many ECE problems first require translating a verbal condition into a familiar relation such as V=IR, P=VI, or d=rt before solving for the requested quantity.' },
      { title: 'Units as an error check', description: 'Dimensional consistency can expose an incorrect model even when the algebra itself is valid.' },
    ],
    sources: [
      { book: 'College Algebra, 9th ed. — Michael Sullivan', role: 'Concept backbone', section: '1.7 Problem Solving: Interest, Mixture, Uniform Motion, Constant Rate Job Applications', locator: 'pp. 134–142', use: 'Translation from verbal descriptions, modeling workflow, interest, mixtures, motion, work-rate applications, and answer checking.', verificationStatus: 'verified-section-pages' },
      { book: 'College Algebra and Calculus: An Applied Approach, 2nd ed. — Larson & Hodgkins', role: 'Instructional design', section: '1.2 Mathematical Modeling', locator: 'pp. 80–92', use: 'Verbal-model-to-equation workflow, percent/distance/mixture/formula models, structured checks, and study-strategy sequencing.', verificationStatus: 'verified-section-pages' },
      { book: '1,001 Algebra II Practice Problems For Dummies — Mary Jane Sterling', role: 'Practice taxonomy', section: 'Ch. 1 Reviewing Algebra Basics — linear and literal equations', locator: 'pp. 8–11', use: 'Limited supporting role for equation manipulation and solving-for-a-variable drills; the applied word-problem taxonomy for this lesson comes primarily from Sullivan and Larson.', verificationStatus: 'verified-section-pages' },
    ],
  },


  'top-inverse-functions': {
    canonicalTopicId: 'top-inverse-functions',
    title: 'Composite & Inverse Functions',
    groupLabel: 'Functions & Graphs',
    shortDescription: 'Composition order and domain, one-to-one tests, inverse construction, domain-range swaps, and graphical verification.',
    boardPriority: 'High',
    objectives: [
      { id: 'inv-obj-1', text: 'Form composite functions and determine valid composite-domain restrictions.' },
      { id: 'inv-obj-2', text: 'Determine whether a function is one-to-one using algebra or the horizontal-line test.' },
      { id: 'inv-obj-3', text: 'Find an inverse function algebraically by interchanging input and output and solving.' },
      { id: 'inv-obj-4', text: 'Verify inverse pairs using composition.' },
      { id: 'inv-obj-5', text: 'Relate the domain/range of a function to the range/domain of its inverse.' },
      { id: 'inv-obj-6', text: 'Interpret inverse graphs as reflections across y=x.' },
    ],
    prerequisites: [
      { id: 'inv-pre-1', label: 'Function evaluation', checkPrompt: 'If f(x)=2x+1, find f(3).', answer: '7' },
      { id: 'inv-pre-2', label: 'Equation solving', checkPrompt: 'Solve y=3x−6 for x.', answer: 'x=(y+6)/3' },
      { id: 'inv-pre-3', label: 'Domain restrictions', checkPrompt: 'What value is excluded from 1/(x−4)?', answer: 'x=4' },
    ],
    rules: [
      { title: 'Composition', formula: '(f\\circ g)(x)=f(g(x))', meaning: 'Apply the inner function first, then feed its output into the outer function.', condition: 'x must be in the domain of g and g(x) must be in the domain of f.', commonError: 'Reversing the order and computing g(f(x)).' },
      { title: 'Inverse verification', formula: 'f(f^{-1}(x))=x', meaning: 'A valid inverse undoes the original function on the appropriate domains.', condition: 'The original function must be one-to-one on the domain being inverted.', commonError: 'Treating f⁻¹(x) as 1/f(x).' },
      { title: 'Domain-range swap', formula: 'Dom(f^{-1})=Range(f)', meaning: 'Inputs of the inverse are outputs of the original function, and vice versa.', commonError: 'Keeping the original domain unchanged after inversion.' },
    ],
    misconceptions: [
      { id: 'INV_COMPOSITION_ORDER', label: 'Reversing composition order', symptom: 'Treating f∘g and g∘f as the same.', correction: 'Work from the inside out; composition is generally not commutative.', quickCheck: 'If f(x)=x+1 and g(x)=2x, then f(g(1))=3 but g(f(1))=4.' },
      { id: 'INV_RECIPROCAL', label: 'Inverse confused with reciprocal', symptom: 'Writing f⁻¹(x)=1/f(x).', correction: 'Swap x and y, then solve for y; reciprocal notation applies to numbers, not function inversion.', quickCheck: 'For f(x)=2x, f⁻¹(x)=x/2.' },
      { id: 'INV_NOT_ONE_TO_ONE', label: 'Ignoring the one-to-one requirement', symptom: 'Declaring an inverse function for a rule that fails the horizontal-line test on its full domain.', correction: 'Restrict the domain when appropriate or state that the inverse relation is not a function.', quickCheck: 'f(x)=x² on all real numbers is not one-to-one.' },
      { id: 'INV_DOMAIN_SWAP', label: 'Ignoring inverse domain/range', symptom: 'Using inverse inputs outside the original range.', correction: 'Swap domain and range when moving from f to f⁻¹.', quickCheck: 'For f(x)=x² with x≥0, f⁻¹(x)=√x has domain x≥0.' },
    ],
    workedExamples: [
      { title: 'Find and verify an inverse', problem: 'Find the inverse of f(x)=3x−6.', strategy: 'Write y=f(x), interchange x and y, solve for y, then verify by composition.', steps: ['Start with y=3x−6.', 'Interchange variables: x=3y−6.', 'Solve: y=(x+6)/3, so f⁻¹(x)=(x+6)/3.', 'Check f(f⁻¹(x))=3[(x+6)/3]−6=x.'], check: 'The reverse composition f⁻¹(f(x)) also simplifies to x.', takeaway: 'An inverse undoes the original mapping; it is not a reciprocal.' },
      { title: 'Find a composite domain', problem: 'Let f(x)=1/(x−2) and g(x)=x+1. Find the domain of f∘g.', strategy: 'Require the inner output g(x) to lie in the domain of f.', steps: ['(f∘g)(x)=1/[(x+1)−2]=1/(x−1).', 'The denominator cannot be zero.', 'Therefore x≠1.'], check: 'At x=1, g(1)=2, which is excluded from the domain of f.', takeaway: 'Composite-domain checks must consider both the inner function and the outer function input restriction.' },
    ],
    practiceQuestions: [
      { id: 'q-inv-1', subskill: 'Composition', difficulty: 'Foundation', prompt: 'If f(x)=x+2 and g(x)=3x, what is (f∘g)(2)?', options: ['8', '12', '10', '6'], correctIndex: 0, explanation: 'g(2)=6, then f(6)=8.', misconceptionId: 'INV_COMPOSITION_ORDER' },
      { id: 'q-inv-2', subskill: 'Inverse algebra', difficulty: 'Standard', prompt: 'If f(x)=4x−5, what is f⁻¹(x)?', options: ['(x+5)/4', '(x−5)/4', '4x+5', '1/(4x−5)'], correctIndex: 0, explanation: 'Swap x and y in y=4x−5 and solve: y=(x+5)/4.', misconceptionId: 'INV_RECIPROCAL' },
      { id: 'q-inv-3', subskill: 'One-to-one test', difficulty: 'Standard', prompt: 'Which function is one-to-one on all real numbers?', options: ['f(x)=x³', 'f(x)=x²', 'f(x)=|x|', 'f(x)=x²+1'], correctIndex: 0, explanation: 'x³ is strictly increasing and passes the horizontal-line test.', misconceptionId: 'INV_NOT_ONE_TO_ONE' },
      { id: 'q-inv-4', subskill: 'Inverse verification', difficulty: 'Mixed', prompt: 'For f(x)=2x+3 and g(x)=(x−3)/2, what is f(g(x))?', options: ['x', '2x', 'x+3', 'x−3'], correctIndex: 0, explanation: '2[(x−3)/2]+3=x.' },
      { id: 'q-inv-5', subskill: 'Domain-range swap', difficulty: 'Standard', prompt: 'If f has domain [0,∞) and range [2,∞), what is the domain of f⁻¹?', options: ['[2,∞)', '[0,∞)', '(−∞,2]', 'All real numbers'], correctIndex: 0, explanation: 'The domain of the inverse equals the range of the original.', misconceptionId: 'INV_DOMAIN_SWAP' },
      { id: 'q-inv-6', subskill: 'Graph interpretation', difficulty: 'Board-review style', prompt: 'The graph of f⁻¹ is obtained from the graph of f by reflection across:', options: ['y=x', 'x-axis', 'y-axis', 'y=−x'], correctIndex: 0, explanation: 'Inverse ordered pairs swap coordinates, which reflects the graph across y=x.' },
      { id: 'q-inv-7', subskill: 'Composite domain', difficulty: 'Mixed', prompt: 'For f(x)=1/(x−2) and g(x)=x+1, what value is excluded from the domain of f∘g?', options: ['1', '2', '−1', '3'], correctIndex: 0, explanation: 'f(g(x))=1/(x−1), so x≠1.', misconceptionId: 'INV_DOMAIN_SWAP' },
      { id: 'q-inv-8', subskill: 'Inverse algebra', difficulty: 'Standard', prompt: 'If f(x)=(x−1)/3, find f⁻¹(5).', options: ['16', '14', '4/3', '2'], correctIndex: 0, explanation: 'f⁻¹(x)=3x+1, so f⁻¹(5)=16.' },
      { id: 'q-inv-9', subskill: 'Restricted inverse', difficulty: 'Mixed', prompt: 'For f(x)=x² restricted to x≥0, which is f⁻¹(x)?', options: ['√x', '−√x', 'x²', '1/x²'], correctIndex: 0, explanation: 'On x≥0, the inverse of squaring is the principal square root.', misconceptionId: 'INV_NOT_ONE_TO_ONE' },
      { id: 'q-inv-10', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'A calibration law is V=0.02T+0.50. Which inverse gives T from V?', options: ['T=(V−0.50)/0.02', 'T=0.02V+0.50', 'T=1/(0.02V+0.50)', 'T=(V+0.50)/0.02'], correctIndex: 0, explanation: 'Solve the linear calibration equation for T.' },
    ],
    eceBridge: [
      { title: 'Sensor calibration inversion', description: 'Inverse functions convert a measured output back into the physical input when the calibration mapping is one-to-one.' },
      { title: 'Cascaded mappings', description: 'Composition models sequential transformations, such as sensor response followed by scaling or conversion.' },
    ],
    sources: [
      { book: 'College Algebra, 9th ed. — Michael Sullivan', role: 'Concept backbone', section: '6.1 Composite Functions; 6.2 One-to-One Functions; Inverse Functions', locator: 'pp. 401–407; 408–420', use: 'Composition, composite domains, one-to-one tests, inverse construction, inverse verification, and graph reflection.', verificationStatus: 'verified-section-pages' },
      { book: 'College Algebra and Calculus: An Applied Approach, 2nd ed. — Larson & Hodgkins', role: 'Instructional design', section: '2.7 The Algebra of Functions; 4.1 Inverse Functions', locator: 'pp. 230–239; 336–345', use: 'Checkpoint-based composition, domain work, inverse recognition, algebraic inversion, and graphical interpretation.', verificationStatus: 'verified-section-pages' },
      { book: '1,001 Algebra II Practice Problems For Dummies — Mary Jane Sterling', role: 'Practice taxonomy', section: 'Ch. 5 Functions', locator: 'pp. 33–38', use: 'Practice families for inverses, composition, domain/range, piecewise rules, and common function errors.', verificationStatus: 'verified-section-pages' },
    ],
  },

  'top-polynomial-functions': {
    canonicalTopicId: 'top-polynomial-functions',
    title: 'Polynomial Functions, Zeros & Theorems',
    groupLabel: 'Expressions & Polynomials',
    shortDescription: 'Zeros and multiplicity, end behavior, Remainder and Factor Theorems, rational-zero candidates, and synthetic-division factor reduction.',
    boardPriority: 'High',
    objectives: [
      { id: 'pfun-obj-1', text: 'Relate zeros, roots, x-intercepts, and linear factors of a polynomial function.' },
      { id: 'pfun-obj-2', text: 'Use multiplicity to predict whether a graph crosses or touches the x-axis.' },
      { id: 'pfun-obj-3', text: 'Use the Remainder and Factor Theorems efficiently.' },
      { id: 'pfun-obj-4', text: 'Generate rational-zero candidates and test them with substitution or synthetic division.' },
      { id: 'pfun-obj-5', text: 'Use leading degree/coefficient to determine end behavior.' },
      { id: 'pfun-obj-6', text: 'Use synthetic division to reduce a polynomial after a zero is found.' },
    ],
    prerequisites: [
      { id: 'pfun-pre-1', label: 'Polynomial evaluation', checkPrompt: 'If P(x)=x²−3x+2, find P(1).', answer: '0' },
      { id: 'pfun-pre-2', label: 'Factoring', checkPrompt: 'Factor x²−5x+6.', answer: '(x−2)(x−3)' },
      { id: 'pfun-pre-3', label: 'Synthetic setup', checkPrompt: 'Which number is used to divide synthetically by x+4?', answer: '−4' },
    ],
    rules: [
      { title: 'Remainder Theorem', formula: 'P(x)=(x-c)Q(x)+P(c)', meaning: 'The remainder from division by x−c equals P(c).', commonError: 'Using the sign appearing in the divisor instead of its zero.' },
      { title: 'Factor Theorem', formula: 'P(c)=0\\iff (x-c)\\text{ is a factor}', meaning: 'A zero and its corresponding linear factor are equivalent statements.', commonError: 'Concluding that x+c is a factor when P(c)=0; the factor is x−c.' },
      { title: 'Rational-zero candidates', formula: '\\pm p/q', meaning: 'For integer coefficients, rational zeros must have numerator dividing the constant term and denominator dividing the leading coefficient.', condition: 'This generates candidates, not guaranteed zeros.', commonError: 'Treating every candidate as an actual root.' },
      { title: 'Multiplicity behavior', meaning: 'At an odd-multiplicity real zero the graph crosses the x-axis; at an even multiplicity it touches and turns.', commonError: 'Ignoring multiplicity when sketching intercept behavior.' },
    ],
    misconceptions: [
      { id: 'PFUN_FACTOR_SIGN', label: 'Factor sign reversed', symptom: 'A zero c is paired with x+c.', correction: 'A zero c corresponds to factor x−c.', quickCheck: 'Zero −3 corresponds to factor x+3.' },
      { id: 'PFUN_CANDIDATE_AS_ROOT', label: 'Candidate treated as guaranteed zero', symptom: 'Listing ±p/q as final roots without testing.', correction: 'Test candidates using P(c) or synthetic division.', quickCheck: 'A rational-zero candidate can produce a nonzero remainder.' },
      { id: 'PFUN_MULTIPLICITY', label: 'Multiplicity ignored', symptom: 'Drawing every intercept as a crossing.', correction: 'Odd multiplicity crosses; even multiplicity touches/turns.', quickCheck: '(x−2)² has an even-multiplicity zero at x=2.' },
      { id: 'PFUN_END_BEHAVIOR', label: 'End behavior based on wrong term', symptom: 'Using a lower-degree term to decide the graph ends.', correction: 'Use only the leading term for far-left/far-right behavior.', quickCheck: 'For −2x⁵+..., odd degree with negative leading coefficient gives left up, right down.' },
    ],
    workedExamples: [
      { title: 'Use Factor Theorem and synthetic division', problem: 'Show that x−2 is a factor of P(x)=x³−3x²−4x+12, then factor completely.', strategy: 'Evaluate P(2); if zero, divide by x−2 and factor the quotient.', steps: ['P(2)=8−12−8+12=0, so x−2 is a factor.', 'Synthetic division by 2 gives x²−x−6.', 'Factor x²−x−6=(x−3)(x+2).', 'P(x)=(x−2)(x−3)(x+2).'], check: 'The roots 2, 3, and −2 each make P(x)=0.', takeaway: 'Factor Theorem identifies a factor; synthetic division efficiently lowers the degree.' },
      { title: 'Interpret multiplicity', problem: 'Describe the x-axis behavior of f(x)=(x+1)²(x−4)³.', strategy: 'Read each zero and classify its multiplicity as even or odd.', steps: ['x=−1 has multiplicity 2, so the graph touches and turns.', 'x=4 has multiplicity 3, so the graph crosses the x-axis.'], check: 'The total degree is 5, consistent with multiplicities 2+3.', takeaway: 'Multiplicity controls local intercept behavior without requiring a full graph.' },
    ],
    practiceQuestions: [
      { id: 'q-pfun-1', subskill: 'Remainder theorem', difficulty: 'Foundation', prompt: 'What is the remainder when P(x)=x³−2x+1 is divided by x−2?', options: ['5', '3', '1', '−5'], correctIndex: 0, explanation: 'P(2)=8−4+1=5.' },
      { id: 'q-pfun-2', subskill: 'Factor theorem', difficulty: 'Standard', prompt: 'If P(3)=0, which is a factor of P(x)?', options: ['x−3', 'x+3', '3x−1', 'x'], correctIndex: 0, explanation: 'By the Factor Theorem, P(3)=0 means x−3 is a factor.', misconceptionId: 'PFUN_FACTOR_SIGN' },
      { id: 'q-pfun-3', subskill: 'Synthetic division', difficulty: 'Standard', prompt: 'After dividing x³−6x²+11x−6 by x−1, the quotient is:', options: ['x²−5x+6', 'x²−7x+18', 'x²−6x+11', 'x²+5x+6'], correctIndex: 0, explanation: 'Synthetic division by 1 gives coefficients 1,−5,6 and remainder 0.' },
      { id: 'q-pfun-4', subskill: 'Rational zeros', difficulty: 'Mixed', prompt: 'For 2x³−3x²−8x+12, which is a rational-zero candidate?', options: ['3/2', '√2', 'π', '1/3'], correctIndex: 0, explanation: 'p divides 12 and q divides 2; 3/2 is an allowed candidate.', misconceptionId: 'PFUN_CANDIDATE_AS_ROOT' },
      { id: 'q-pfun-5', subskill: 'Multiplicity', difficulty: 'Standard', prompt: 'For f(x)=(x−2)²(x+1), what happens at x=2?', options: ['The graph touches and turns', 'The graph crosses', 'There is a vertical asymptote', 'There is a hole'], correctIndex: 0, explanation: 'x=2 has even multiplicity 2.', misconceptionId: 'PFUN_MULTIPLICITY' },
      { id: 'q-pfun-6', subskill: 'End behavior', difficulty: 'Board-review style', prompt: 'What is the right-end behavior of f(x)=−3x⁴+2x−1?', options: ['f(x)→−∞ as x→∞', 'f(x)→∞ as x→∞', 'f(x)→0', 'Cannot be determined'], correctIndex: 0, explanation: 'The leading term −3x⁴ dominates; even power is positive and the negative coefficient sends the right end downward.', misconceptionId: 'PFUN_END_BEHAVIOR' },
      { id: 'q-pfun-7', subskill: 'Zeros and factors', difficulty: 'Foundation', prompt: 'If x+5 is a factor, which number is a zero?', options: ['−5', '5', '1/5', '0'], correctIndex: 0, explanation: 'Set x+5=0, giving x=−5.', misconceptionId: 'PFUN_FACTOR_SIGN' },
      { id: 'q-pfun-8', subskill: 'Multiplicity', difficulty: 'Mixed', prompt: 'For f(x)=x³(x−1)², what is the multiplicity of zero x=0?', options: ['3', '2', '1', '5'], correctIndex: 0, explanation: 'The factor x³ gives zero multiplicity 3.' },
      { id: 'q-pfun-9', subskill: 'Synthetic division', difficulty: 'Mixed', prompt: 'Which synthetic value is used for divisor x+2?', options: ['−2', '2', '1/2', '0'], correctIndex: 0, explanation: 'x+2=x−(−2), so use −2.' },
      { id: 'q-pfun-10', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'A characteristic polynomial is P(s)=s²+5s+6. Which pair gives its real zeros?', options: ['−2 and −3', '2 and 3', '−1 and −6', '1 and 6'], correctIndex: 0, explanation: 'P(s)=(s+2)(s+3), so the zeros are −2 and −3.' },
    ],
    eceBridge: [
      { title: 'Characteristic polynomials', description: 'Factoring polynomial models and locating zeros prepares for later pole/root analysis in circuits, controls, and signals.' },
      { title: 'Fast zero verification', description: 'The Factor and Remainder Theorems let a reviewer quickly test candidate roots without full expansion.' },
    ],
    sources: [
      { book: 'College Algebra, 9th ed. — Michael Sullivan', role: 'Concept backbone', section: '5.1 Polynomial Functions and Models; 5.5 The Real Zeros of a Polynomial Function', locator: 'pp. 320–341; 374–386', use: 'Polynomial-function degree, zeros and multiplicity, graph behavior, Remainder/Factor Theorems, rational-zero candidates, and equation solving.', verificationStatus: 'verified-section-pages' },
      { book: 'College Algebra and Calculus: An Applied Approach, 2nd ed. — Larson & Hodgkins', role: 'Instructional design', section: '3.2 Polynomial Functions of Higher Degree; 3.3 Polynomial Division; 3.4 Real Zeros', locator: 'pp. 262–296', use: 'End-behavior checkpoints, long/synthetic division, Remainder/Factor Theorems, and real-zero workflow.', verificationStatus: 'verified-section-pages' },
      { book: '1,001 Algebra II Practice Problems For Dummies — Mary Jane Sterling', role: 'Practice taxonomy', section: 'Ch. 7 Polynomial Functions and Equations', locator: 'pp. 45–50', use: 'Practice families for intercepts, grouping, rational-root testing, synthetic division, evaluation, end behavior, and graphing.', verificationStatus: 'verified-section-pages' },
    ],
  },

  'top-rational-functions': {
    canonicalTopicId: 'top-rational-functions',
    title: 'Rational Functions, Holes & Asymptotes',
    groupLabel: 'Functions & Graphs',
    shortDescription: 'Domains, intercepts, removable discontinuities, vertical/horizontal/slant asymptotes, and qualitative graph behavior.',
    boardPriority: 'High',
    objectives: [
      { id: 'rfun-obj-1', text: 'Find the real domain and preserve exclusions from the original denominator.' },
      { id: 'rfun-obj-2', text: 'Distinguish removable discontinuities from vertical asymptotes after reduction.' },
      { id: 'rfun-obj-3', text: 'Find x- and y-intercepts when defined.' },
      { id: 'rfun-obj-4', text: 'Determine vertical asymptotes from zeros of the reduced denominator.' },
      { id: 'rfun-obj-5', text: 'Determine horizontal or slant asymptotes from degree comparison or division.' },
      { id: 'rfun-obj-6', text: 'Use sign/limit behavior to sketch a rational function qualitatively.' },
    ],
    prerequisites: [
      { id: 'rfun-pre-1', label: 'Factoring', checkPrompt: 'Factor x²−4.', answer: '(x−2)(x+2)' },
      { id: 'rfun-pre-2', label: 'Rational restrictions', checkPrompt: 'What values are excluded from 1/(x²−4)?', answer: 'x=±2' },
      { id: 'rfun-pre-3', label: 'Polynomial division', checkPrompt: 'What is the quotient of x² by x?', answer: 'x' },
    ],
    rules: [
      { title: 'Vertical asymptote', meaning: 'After cancelling common factors, a real zero of the remaining denominator is a vertical-asymptote candidate.', condition: 'Work with the reduced form but preserve the original domain.', commonError: 'Calling a cancelled factor a vertical asymptote instead of a hole.' },
      { title: 'Horizontal asymptote by degree', meaning: 'If numerator degree < denominator degree, y=0; if equal, use the ratio of leading coefficients.', condition: 'If numerator degree is exactly one more, polynomial division gives a slant asymptote.', commonError: 'Using coefficient ratios when the degrees are unequal.' },
      { title: 'Hole from cancelled factor', meaning: 'A common factor that cancels creates a removable discontinuity at its excluded zero.', condition: 'The hole y-value comes from the reduced function at that x-value.', commonError: 'Restoring the cancelled point into the domain.' },
    ],
    misconceptions: [
      { id: 'RFUN_HOLE_VA', label: 'Hole confused with vertical asymptote', symptom: 'A cancelled denominator zero is labeled a vertical asymptote.', correction: 'Cancel common factors first: cancelled zeros are holes; remaining denominator zeros can be vertical asymptotes.', quickCheck: '(x−1)/(x−1)(x+2) has a hole at x=1 and vertical asymptote x=−2.' },
      { id: 'RFUN_DOMAIN_LOSS', label: 'Original exclusion lost', symptom: 'A cancelled input is treated as valid after simplification.', correction: 'Keep every original denominator restriction.', quickCheck: '(x−3)/(x−3) is 1 only for x≠3.' },
      { id: 'RFUN_HA_DEGREE', label: 'Wrong horizontal-asymptote rule', symptom: 'Using leading-coefficient ratio when numerator degree is smaller.', correction: 'Compare degrees first; only equal degrees use the leading-coefficient ratio.', quickCheck: '(2x+1)/(x²+1) has y=0.' },
      { id: 'RFUN_INTERCEPT_RESTRICTION', label: 'Invalid intercept', symptom: 'A numerator zero that is excluded from the domain is reported as an x-intercept.', correction: 'An intercept must be a point in the domain.', quickCheck: 'A cancelled zero produces a hole, not an x-intercept.' },
    ],
    workedExamples: [
      { title: 'Classify a hole and vertical asymptote', problem: 'Analyze R(x)=(x²−1)/(x²+x−2).', strategy: 'Factor numerator and denominator, preserve original exclusions, reduce, then classify each excluded value.', steps: ['Factor: (x−1)(x+1)/[(x+2)(x−1)].', 'Original exclusions: x≠1,−2.', 'Reduce to (x+1)/(x+2).', 'x=1 is a hole; x=−2 remains a vertical asymptote.'], check: 'The reduced value at x=1 is 2/3, so the hole is at (1,2/3).', takeaway: 'Cancellation removes a factor algebraically but does not restore its excluded input.' },
      { title: 'Find a horizontal asymptote', problem: 'Find the horizontal asymptote of R(x)=(3x²−1)/(2x²+5x+4).', strategy: 'Compare numerator and denominator degrees.', steps: ['Both degrees are 2.', 'Use the ratio of leading coefficients 3/2.', 'Horizontal asymptote: y=3/2.'], check: 'For very large |x|, lower-degree terms are small relative to x², so the ratio approaches 3/2.', takeaway: 'Equal degrees use the leading-coefficient ratio.' },
    ],
    practiceQuestions: [
      { id: 'q-rfun-1', subskill: 'Domain', difficulty: 'Foundation', prompt: 'What values are excluded from f(x)=1/(x²−9)?', options: ['x=±3', 'x=3 only', 'x=−3 only', 'x=0'], correctIndex: 0, explanation: 'x²−9=(x−3)(x+3), so x≠±3.' },
      { id: 'q-rfun-2', subskill: 'Hole vs asymptote', difficulty: 'Standard', prompt: 'For f(x)=(x−1)/[(x−1)(x+2)], what happens at x=1?', options: ['A hole', 'A vertical asymptote', 'An x-intercept', 'No special behavior'], correctIndex: 0, explanation: 'The x−1 factor cancels, so the excluded input x=1 is a removable discontinuity.', misconceptionId: 'RFUN_HOLE_VA' },
      { id: 'q-rfun-3', subskill: 'Vertical asymptote', difficulty: 'Standard', prompt: 'What is the vertical asymptote of f(x)=(x+1)/(x−4)?', options: ['x=4', 'x=−1', 'y=4', 'y=1'], correctIndex: 0, explanation: 'The reduced denominator is zero at x=4.' },
      { id: 'q-rfun-4', subskill: 'Horizontal asymptote', difficulty: 'Standard', prompt: 'What is the horizontal asymptote of (2x+1)/(x²+4)?', options: ['y=0', 'y=2', 'y=1', 'None'], correctIndex: 0, explanation: 'The numerator degree is smaller than the denominator degree, so y=0.', misconceptionId: 'RFUN_HA_DEGREE' },
      { id: 'q-rfun-5', subskill: 'Horizontal asymptote', difficulty: 'Mixed', prompt: 'What is the horizontal asymptote of (3x²+1)/(2x²−5)?', options: ['y=3/2', 'y=2/3', 'y=0', 'x=3/2'], correctIndex: 0, explanation: 'Equal degrees give the ratio of leading coefficients, 3/2.', misconceptionId: 'RFUN_HA_DEGREE' },
      { id: 'q-rfun-6', subskill: 'Intercepts', difficulty: 'Standard', prompt: 'What is the x-intercept of f(x)=(x−5)/(x+1)?', options: ['x=5', 'x=−1', 'x=0', 'No x-intercept'], correctIndex: 0, explanation: 'The numerator is zero at x=5 and the denominator is nonzero there.' },
      { id: 'q-rfun-7', subskill: 'Hole coordinate', difficulty: 'Mixed', prompt: 'For f(x)=(x²−1)/(x²+x−2), what is the y-coordinate of the hole at x=1?', options: ['2/3', '0', '1', 'Undefined with no limiting value'], correctIndex: 0, explanation: 'Reduce to (x+1)/(x+2), then evaluate at x=1 to get 2/3.', misconceptionId: 'RFUN_DOMAIN_LOSS' },
      { id: 'q-rfun-8', subskill: 'Slant asymptote', difficulty: 'Board-review style', prompt: 'A rational function has numerator degree 3 and denominator degree 2 with no cancellation. Which asymptote type is expected from polynomial division?', options: ['Slant (oblique)', 'Horizontal y=0', 'No asymptote at all', 'Vertical only'], correctIndex: 0, explanation: 'A numerator degree exactly one larger than denominator degree produces a linear quotient/slant asymptote.' },
      { id: 'q-rfun-9', subskill: 'Domain preservation', difficulty: 'Mixed', prompt: 'Simplify (x−3)/(x−3). Which statement is correct?', options: ['The value is 1 for x≠3', 'The value is 1 for all real x', 'The value is 0 at x=3', 'The value is undefined for every x'], correctIndex: 0, explanation: 'The original denominator excludes x=3 even though the factor cancels.', misconceptionId: 'RFUN_DOMAIN_LOSS' },
      { id: 'q-rfun-10', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'For H(s)=(s+2)/(s+5), which real value makes the denominator zero?', options: ['s=−5', 's=5', 's=−2', 's=2'], correctIndex: 0, explanation: 's+5=0 gives s=−5; algebraically this is the denominator zero to track.' },
    ],
    eceBridge: [
      { title: 'Transfer-function structure', description: 'Rational-function factoring and denominator-zero awareness prepare for later analysis of transfer-function forms.' },
      { title: 'Removable vs nonremovable behavior', description: 'Cancelling a common algebraic factor differs from retaining a denominator factor, an important distinction in model simplification.' },
    ],
    sources: [
      { book: 'College Algebra, 9th ed. — Michael Sullivan', role: 'Concept backbone', section: '5.2 Properties of Rational Functions; 5.3 The Graph of a Rational Function', locator: 'pp. 342–367', use: 'Domain, holes, vertical/horizontal/oblique asymptotes, intercepts, and graph analysis.', verificationStatus: 'verified-section-pages' },
      { book: 'College Algebra and Calculus: An Applied Approach, 2nd ed. — Larson & Hodgkins', role: 'Instructional design', section: '3.7 Rational Functions', locator: 'pp. 314–325', use: 'Domain-first examples, vertical/horizontal/slant asymptotes, graphing, and application modeling.', verificationStatus: 'verified-section-pages' },
      { book: '1,001 Algebra II Practice Problems For Dummies — Mary Jane Sterling', role: 'Practice taxonomy', section: 'Ch. 8 Rational Functions', locator: 'pp. 51–56', use: 'Practice families for domain, removable discontinuities, asymptotes, intercepts, and graph behavior.', verificationStatus: 'verified-section-pages' },
    ],
  },

  'top-harmonic-seq': {
    canonicalTopicId: 'top-harmonic-seq',
    title: 'Harmonic Progressions & Means',
    groupLabel: 'Systems, Sequences & Applications',
    shortDescription: 'Reference-limited coverage of harmonic means and reciprocal sequence relationships; the approved books do not provide a full standalone harmonic-progression chapter.',
    boardPriority: 'Supporting',
    objectives: [
      { id: 'hp-obj-1', text: 'Recognize a harmonic sequence as one whose nonzero reciprocals form an arithmetic sequence.' },
      { id: 'hp-obj-2', text: 'Compute the harmonic mean of two positive numbers.' },
      { id: 'hp-obj-3', text: 'Use the reciprocal relationship to insert a harmonic mean or find a missing harmonic term.' },
      { id: 'hp-obj-4', text: 'Relate arithmetic, geometric, and harmonic means for positive numbers where supported by the references.' },
    ],
    prerequisites: [
      { id: 'hp-pre-1', label: 'Reciprocals', checkPrompt: 'What is the reciprocal of 4?', answer: '1/4' },
      { id: 'hp-pre-2', label: 'Arithmetic mean', checkPrompt: 'Find the arithmetic mean of 4 and 8.', answer: '6' },
      { id: 'hp-pre-3', label: 'Arithmetic progression', checkPrompt: 'Are 2,5,8 arithmetic?', answer: 'Yes, d=3' },
    ],
    rules: [
      { title: 'Two-number harmonic mean', formula: 'H=\\frac{2ab}{a+b}', meaning: 'For positive a and b, H is the reciprocal of the arithmetic mean of their reciprocals.', condition: 'a and b must be nonzero; this reviewer uses the positive-number form supported by the mean comparison exercises.', commonError: 'Using (a+b)/2, which is the arithmetic mean.' },
      { title: 'Reciprocal progression', meaning: 'A nonzero sequence is harmonic when its reciprocals form an arithmetic sequence.', condition: 'Every term used must be nonzero.', commonError: 'Checking constant differences in the original terms rather than in their reciprocals.' },
      { title: 'Mean relation', formula: 'H=G^2/A', meaning: 'For two positive numbers, the harmonic mean equals the square of the geometric mean divided by the arithmetic mean.', condition: 'This relation is explicitly supported by Sullivan’s mean exercises.', commonError: 'Interchanging A and H.' },
    ],
    misconceptions: [
      { id: 'HP_ARITHMETIC_CONFUSION', label: 'Using arithmetic mean instead of harmonic mean', symptom: 'Averaging the two values directly.', correction: 'Average the reciprocals, then take the reciprocal; equivalently use 2ab/(a+b).', quickCheck: 'For 4 and 12, H=6, not 8.' },
      { id: 'HP_RECIPROCAL_PATTERN', label: 'Checking the wrong sequence', symptom: 'Looking for a constant difference in harmonic terms themselves.', correction: 'Take reciprocals first and check whether those form an arithmetic progression.', quickCheck: '1/2,1/4,1/6 is not arithmetic, but 2,4,6 are reciprocals of a harmonic sequence.' },
      { id: 'HP_ZERO_TERM', label: 'Ignoring zero restriction', symptom: 'Trying to form a reciprocal of a zero term.', correction: 'A reciprocal-based harmonic progression cannot include zero.', quickCheck: '1/0 is undefined.' },
    ],
    workedExamples: [
      { title: 'Find a harmonic mean', problem: 'Find the harmonic mean of 4 and 12.', strategy: 'Use H=2ab/(a+b).', steps: ['H=2(4)(12)/(4+12).', 'H=96/16.', 'H=6.'], check: 'Reciprocals 1/4, 1/6, 1/12 form an arithmetic progression because 1/6 is the average of 1/4 and 1/12.', takeaway: 'The harmonic mean is tied to arithmetic behavior of reciprocals.' },
      { title: 'Recognize a harmonic progression', problem: 'Is 1/2, 1/5, 1/8 harmonic?', strategy: 'Take reciprocals and inspect their differences.', steps: ['Reciprocals are 2,5,8.', 'The differences are 3 and 3.', 'Therefore the original sequence is harmonic.'], check: 'All terms are nonzero, so the reciprocal test is valid.', takeaway: 'Harmonic progression is defined through an arithmetic progression of reciprocals.' },
    ],
    practiceQuestions: [
      { id: 'q-hp-1', subskill: 'Harmonic mean', difficulty: 'Foundation', prompt: 'What is the harmonic mean of 4 and 12?', options: ['6', '8', '√48', '16'], correctIndex: 0, explanation: 'H=2(4)(12)/(4+12)=96/16=6.', misconceptionId: 'HP_ARITHMETIC_CONFUSION' },
      { id: 'q-hp-2', subskill: 'Reciprocal pattern', difficulty: 'Foundation', prompt: 'Which sequence is harmonic because its reciprocals are 2,5,8?', options: ['1/2, 1/5, 1/8', '2,5,8', '1/2, 1/3, 1/4', '2,4,8'], correctIndex: 0, explanation: 'A harmonic sequence is obtained by taking reciprocals of an arithmetic sequence.', misconceptionId: 'HP_RECIPROCAL_PATTERN' },
      { id: 'q-hp-3', subskill: 'Harmonic mean', difficulty: 'Standard', prompt: 'What is the harmonic mean of 6 and 3?', options: ['4', '4.5', '√18', '9'], correctIndex: 0, explanation: 'H=2(6)(3)/(6+3)=36/9=4.', misconceptionId: 'HP_ARITHMETIC_CONFUSION' },
      { id: 'q-hp-4', subskill: 'Missing harmonic term', difficulty: 'Mixed', prompt: 'If 1/3, x, 1/9 are consecutive harmonic terms, what is x?', options: ['1/6', '1/5', '1/4', '1/12'], correctIndex: 0, explanation: 'Reciprocals 3, 1/x, 9 must be arithmetic, so 1/x=6 and x=1/6.' },
      { id: 'q-hp-5', subskill: 'Mean relation', difficulty: 'Standard', prompt: 'For positive a and b, if arithmetic mean A=10 and geometric mean G=8, what is H using H=G²/A?', options: ['6.4', '8', '12.5', '2'], correctIndex: 0, explanation: 'H=64/10=6.4.' },
      { id: 'q-hp-6', subskill: 'Validity', difficulty: 'Standard', prompt: 'Which value cannot appear as a term of a reciprocal-defined harmonic progression?', options: ['0', '1/2', '−1', '3'], correctIndex: 0, explanation: 'Zero has no reciprocal.', misconceptionId: 'HP_ZERO_TERM' },
      { id: 'q-hp-7', subskill: 'Reciprocal pattern', difficulty: 'Mixed', prompt: 'Is 1, 1/2, 1/3, 1/4 harmonic?', options: ['Yes', 'No', 'Only the first three terms', 'Only for positive even indices'], correctIndex: 0, explanation: 'The reciprocals 1,2,3,4 form an arithmetic sequence.', misconceptionId: 'HP_RECIPROCAL_PATTERN' },
      { id: 'q-hp-8', subskill: 'Harmonic mean', difficulty: 'Board-review style', prompt: 'Two positive rates are 10 and 15. Their two-number harmonic mean is:', options: ['12', '12.5', '25/2', '√150'], correctIndex: 0, explanation: 'H=2(10)(15)/(25)=300/25=12.' },
      { id: 'q-hp-9', subskill: 'Mean ordering', difficulty: 'Mixed', prompt: 'For unequal positive numbers, which ordering is consistent with the supported mean relations?', options: ['H<G<A', 'A<G<H', 'G<A<H', 'H<A<G'], correctIndex: 0, explanation: 'For unequal positive numbers, harmonic mean is below geometric mean, which is below arithmetic mean.' },
      { id: 'q-hp-10', subskill: 'ECE application', difficulty: 'ECE Application', prompt: 'Two positive rates are 4 units/s and 12 units/s. What is their harmonic mean?', options: ['6 units/s', '8 units/s', '4√3 units/s', '16 units/s'], correctIndex: 0, explanation: 'H=2(4)(12)/(4+12)=6 units/s.' },
    ],
    eceBridge: [
      { title: 'Rate averaging caution', description: 'Harmonic means arise when averaging certain rates over equal-distance or reciprocal-weight settings; use only when the model actually has the reciprocal structure.' },
    ],
    sources: [
      { book: 'College Algebra, 9th ed. — Michael Sullivan', role: 'Concept backbone', section: '1.5 Solving Inequalities — Applications and Extensions (mean exercises)', locator: 'p. 129', use: 'Defines the two-number harmonic mean and relates it to arithmetic and geometric means for positive numbers.', verificationStatus: 'verified-section-pages' },
      { book: 'College Algebra and Calculus: An Applied Approach, 2nd ed. — Larson & Hodgkins', role: 'Instructional design', section: 'Reference formulas — Sequences', locator: 'reference summary near p. 1278', use: 'Lists general harmonic and harmonic sequence forms; used only as supporting structure, not as a full teaching section.', verificationStatus: 'verified-section-pages', verificationNote: 'Reference-summary support only; no standalone harmonic-progression lesson was located in the approved Larson text.' },
      { book: '1,001 Algebra II Practice Problems For Dummies — Mary Jane Sterling', role: 'Practice taxonomy', section: 'Ch. 15 Sequences and Series', locator: 'pp. 97–102', use: 'Scope check: the chapter covers arithmetic/geometric/special sequences and series but does not provide a dedicated harmonic-progression drill set; no Sterling harmonic exercises were imported.', verificationStatus: 'verified-section-pages', verificationNote: 'Used to document the source gap rather than to claim harmonic-progression coverage.' },
    ],
  },

};

export const getAlgebraReferenceContent = (topicId: string): AlgebraReferenceTopicContent | undefined =>
  ALGEBRA_REFERENCE_CONTENT[topicId as AlgebraReferenceTopicId];

/** @deprecated Use getAlgebraReferenceContent. */
export const getAlgebraPilotContent = getAlgebraReferenceContent;
