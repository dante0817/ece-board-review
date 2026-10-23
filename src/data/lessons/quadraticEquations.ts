import { LearnLesson } from '../../domain/learn/lessonTypes';

/** Original explanations informed by the section map in algebraReferenceContent.ts.
 * Editorial status deliberately 'draft', pending independent expert sign-off.
 */
export const quadraticEquationsLesson:LearnLesson = {
  id:'top-quadratics', title:'Quadratic Equations', contentVersion:1, status:'draft',
  summary:'Recognize, solve, classify and check quadratic equations, choosing a method that fits the problem.',
  sections:[
    {id:'introduction',title:'What is a quadratic equation?',objectiveIds:['quad-obj-1'],blocks:[
      {id:'intro-1',type:'definition',text:'A quadratic equation is an equation in one variable whose highest power is two after simplifying. Its standard form is shown below.'},
      {id:'intro-2',type:'formula',latex:'ax^2+bx+c=0,\\qquad a\\ne 0',description:'a, b and c are coefficients; a cannot be zero because that would make the equation linear.'},
      {id:'intro-3',type:'paragraph',text:'Move every term to one side and combine like terms before deciding how to solve. Roots (solutions) are values of x that make the original equation true.'},
      {id:'intro-4',type:'worked-example',title:'Identify the coefficients',problem:'Rewrite 3x² + 5 = 7x in standard form.',steps:['Subtract 7x from both sides: 3x² − 7x + 5 = 0.','Identify a = 3, b = −7, and c = 5.'],check:'Move −7x back to the right side to recover the original equation.'},
      {id:'intro-5',type:'checkpoint',prompt:'In −2x² + 3x − 8 = 0, what are a, b and c?',answer:'a = −2, b = 3, c = −8.',explanation:'Include each coefficient’s sign.'},
    ]},
    {id:'factoring',title:'Solving by factoring',objectiveIds:['quad-obj-2'],blocks:[
      {id:'fact-1',type:'paragraph',text:'When an expression can be factored, set each factor equal to zero. This works because a product is zero only when at least one factor is zero.'},
      {id:'fact-2',type:'formula',latex:'AB=0\\quad\\Longrightarrow\\quad A=0\\;\\text{or}\\;B=0'},
      {id:'fact-3',type:'worked-example',title:'Factor and solve',problem:'Solve 2x² − 5x − 3 = 0.',strategy:'Look for factors of −6 whose sum is −5.',steps:['Factor: (2x + 1)(x − 3) = 0.','Set 2x + 1 = 0 or x − 3 = 0.','Solve: x = −1/2 or x = 3.'],check:'At x = 3: 18 − 15 − 3 = 0. At x = −1/2: 1/2 + 5/2 − 3 = 0.',takeaway:'Both factor equations must be solved; never report only one root.'},
      {id:'fact-4',type:'checkpoint',prompt:'Solve x² − 7x + 12 = 0 by factoring.',answer:'x = 3 or x = 4.',explanation:'(x − 3)(x − 4) = 0.'},
    ]},
    {id:'square-root',title:'The square-root method',objectiveIds:['quad-obj-3'],blocks:[
      {id:'root-1',type:'paragraph',text:'Use this when a squared expression is isolated. For a positive right side, include BOTH positive and negative square roots. For a negative right side, the solutions are nonreal complex numbers.'},
      {id:'root-2',type:'formula',latex:'(x-h)^2=k\\quad\\Longrightarrow\\quad x=h\\pm\\sqrt{k}'},
      {id:'root-3',type:'worked-example',title:'Remember both signs',problem:'Solve (x − 2)² = 36.',steps:['Take square roots: x − 2 = ±6.','Add 2: x = 2 ± 6.','Thus x = 8 or x = −4.'],check:'(8 − 2)² = 36 and (−4 − 2)² = 36.',takeaway:'The ± is part of the solution, not an optional notation.'},
      {id:'root-4',type:'checkpoint',prompt:'Solve (x + 3)² = 16.',answer:'x = 1 or x = −7.',explanation:'x + 3 = ±4, then subtract 3.'},
    ]},
    {id:'completing-square',title:'Completing the square',objectiveIds:['quad-obj-4'],blocks:[
      {id:'complete-1',type:'paragraph',text:'Turn a quadratic expression into a perfect square. For x² + px, add (p/2)² to BOTH sides. If the leading coefficient is not 1, first divide the entire equation by that coefficient.'},
      {id:'complete-2',type:'formula',latex:'x^2+px+\\left(\\frac{p}{2}\\right)^2=\\left(x+\\frac{p}{2}\\right)^2'},
      {id:'complete-3',type:'worked-example',title:'Build a perfect square',problem:'Solve x² + 6x + 1 = 0.',steps:['Rearrange: x² + 6x = −1.','Half of 6 is 3, and 3² = 9; add 9 to both sides.','x² + 6x + 9 = 8, so (x + 3)² = 8.','Take square roots: x + 3 = ±2√2.','Therefore x = −3 ± 2√2.'],check:'These roots satisfy (x + 3)² = 8 and therefore the original equation.',takeaway:'Whatever is added to the left must also be added to the right.'},
      {id:'complete-4',type:'checkpoint',prompt:'What number completes x² + 8x + ___ as a perfect square?',answer:'16, giving (x + 4)².',explanation:'Take half of 8 and square it.'},
    ]},
    {id:'quadratic-formula',title:'The quadratic formula',objectiveIds:['quad-obj-5'],blocks:[
      {id:'formula-1',type:'paragraph',text:'The quadratic formula solves every quadratic equation, including those that do not factor over the integers. Always identify signed a, b and c from standard form.'},
      {id:'formula-2',type:'formula',latex:'x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}'},
      {id:'formula-3',type:'note',text:'The formula comes from completing the square on ax² + bx + c = 0. The entire numerator is divided by 2a.'},
      {id:'formula-4',type:'worked-example',title:'Exact irrational answers',problem:'Solve 2x² − 4x − 1 = 0.',steps:['Read a = 2, b = −4, c = −1.','Substitute: x = [4 ± √(16 + 8)] / 4.','Simplify: x = (4 ± 2√6) / 4.','Hence x = 1 ± √6/2.'],check:'Use x = 1 ± √6/2 in 2x² − 4x − 1; each substitution simplifies to zero.',takeaway:'Keep exact radicals unless the problem requests a decimal approximation.'},
      {id:'formula-5',type:'checkpoint',prompt:'For 2x² − 3x − 2 = 0, identify a, b, c, then solve.',answer:'a = 2, b = −3, c = −2; x = 2 or x = −1/2.',explanation:'The discriminant is 9 + 16 = 25, so x = (3 ± 5)/4.'},
    ]},
    {id:'discriminant',title:'The discriminant and root types',objectiveIds:['quad-obj-6'],blocks:[
      {id:'disc-1',type:'paragraph',text:'The quantity under the square root in the quadratic formula tells you how many different real roots exist and whether complex solutions occur.'},
      {id:'disc-2',type:'formula',latex:'\\Delta=b^2-4ac'},
      {id:'disc-3',type:'paragraph',text:'If Δ > 0, there are two distinct real roots. If Δ = 0, there is one repeated real root. If Δ < 0, there are two nonreal complex-conjugate roots (assuming real coefficients).'},
      {id:'disc-4',type:'worked-example',title:'Classify without solving',problem:'Classify the roots of 3x² + 4x + 5 = 0.',steps:['Here a = 3, b = 4 and c = 5.','Δ = 4² − 4(3)(5) = 16 − 60 = −44.','Since Δ < 0, the equation has no real roots and two nonreal complex-conjugate roots.'],check:'The parabola y = 3x² + 4x + 5 has no real x-intercepts.'},
      {id:'disc-5',type:'checkpoint',prompt:'What kind of roots does x² − 6x + 9 = 0 have?',answer:'One repeated real root x = 3.',explanation:'Δ = 36 − 36 = 0; equivalently (x − 3)² = 0.'},
    ]},
    {id:'method-choice',title:'Method selection and applications',objectiveIds:['quad-obj-7'],blocks:[
      {id:'choice-1',type:'paragraph',text:'Choose the simplest reliable method: factoring for easy integer factors, square-root method for isolated squares, completing the square for vertex form, and the quadratic formula for a general equation. Check every answer in the original equation.'},
      {id:'choice-2',type:'worked-example',title:'A modeled current constraint',problem:'An illustrative algebraic model gives I² − 5I + 4 = 0 with a physical operating constraint I > 2 A. Determine the allowed current.',steps:['Factor: (I − 1)(I − 4) = 0.','Algebraic candidates are I = 1 A and I = 4 A.','Both satisfy the equation, but only 4 A satisfies the separate requirement I > 2 A.'],check:'Substitution of I = 4 gives 16 − 20 + 4 = 0, and 4 > 2.',takeaway:'An algebraic solution may be physically inadmissible; always apply given units and constraints.'},
      {id:'choice-3',type:'checkpoint',prompt:'What method would you choose for (2x − 1)² = 25?',answer:'Square-root method; x = 3 or x = −2.',explanation:'2x − 1 = ±5 gives x = 3 or x = −2.'},
      {id:'choice-4',type:'note',text:'Supporting topic — root relationships: for roots r₁ and r₂ of ax² + bx + c = 0, r₁ + r₂ = −b/a and r₁r₂ = c/a. These are useful for problems that ask only for a sum or product.'},
      {id:'choice-5',type:'formula',latex:'r_1+r_2=-\\frac{b}{a},\\qquad r_1r_2=\\frac{c}{a}'},
    ]},
  ]
};
