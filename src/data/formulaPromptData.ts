export interface FormulaPromptConfig {
  promptLatex: string;
  question: string;
  hint?: string;
}

export const FORMULA_PROMPTS: Record<string, FormulaPromptConfig> = {
  'diff-squares': {
    promptLatex: 'a^2 - b^2 = \\ ?',
    question: 'Factor the difference of two squares.',
    hint: 'Product of the conjugate sum and difference of the two terms.',
  },
  'square-binomial': {
    promptLatex: '(a \\pm b)^2 = \\ ?',
    question: 'Expand the square of a binomial.',
    hint: 'First squared, twice the product with matching sign, second squared.',
  },
  'sum-diff-cubes': {
    promptLatex: 'a^3 \\pm b^3 = \\ ?',
    question: 'Factor the sum and difference of two cubes.',
    hint: 'SOAP rule: Same sign in binomial factor, Opposite in quadratic middle term, Always Positive last term.',
  },
  'cube-binomial': {
    promptLatex: '(a \\pm b)^3 = \\ ?',
    question: 'Expand the cube of a binomial into standard and symmetric forms.',
    hint: 'Coefficients 1, 3, 3, 1 from Pascal’s triangle.',
  },
  'trinomial-square': {
    promptLatex: '(a + b + c)^2 = \\ ?',
    question: 'Expand the square of a 3-term trinomial.',
    hint: 'Sum of individual squares plus twice the sum of pairwise products.',
  },
  'sophie-germain': {
    promptLatex: 'a^4 + 4b^4 = \\ ?',
    question: 'Factor using the Sophie Germain identity.',
    hint: 'Complete the square by inserting and subtracting 4a²b² = (2ab)²',
  },
  'laws-exponents-product': {
    promptLatex: 'a^m \\cdot a^n = \\ ?, \\quad \\frac{a^m}{a^n} = \\ ?',
    question: 'State the product and quotient rules for powers with the same base.',
    hint: 'Add exponents for multiplication, subtract exponents for division.',
  },
  'power-of-power': {
    promptLatex: '(a^m)^n = \\ ?, \\quad (ab)^n = \\ ?',
    question: 'State the power of a power and power of a product laws.',
    hint: 'Multiply exponents inside parentheses; distribute exponent across factors.',
  },
  'negative-fractional-exp': {
    promptLatex: 'a^{-n} = \\ ?, \\quad a^{m/n} = \\ ?',
    question: 'Express negative and rational exponents in radical / reciprocal form.',
    hint: 'Negative power reciprocates across fraction bar; denominator n is the root index.',
  },
  'radical-rationalization': {
    promptLatex: '\\frac{1}{\\sqrt{a} \\pm \\sqrt{b}} = \\ ?',
    question: 'Rationalize a binomial radical denominator.',
    hint: 'Multiply numerator and denominator by the conjugate (√a ∓ √b).',
  },
  'logarithm-laws': {
    promptLatex: '\\log_b(xy) = \\ ?, \\quad \\log_b(x^k) = \\ ?, \\quad \\log_b x = \\ ?',
    question: 'Recall the logarithmic product, power, and change-of-base identities.',
    hint: 'Log of product is sum of logs; power comes out as multiplier; change of base uses ratio of ln.',
  },
  'quadratic-formula': {
    promptLatex: 'ax^2 + bx + c = 0 \\implies x = \\ ?',
    question: 'State the quadratic formula for roots of a degree-2 polynomial.',
    hint: 'Entire numerator (-b ± √Δ) is divided by 2a.',
  },
  'discriminant-analysis': {
    promptLatex: '\\Delta = \\ ? \\quad (\\text{State 3 root conditions})',
    question: 'Recall the discriminant formula and explain how Δ determines root nature.',
    hint: 'Δ > 0 (2 distinct real), Δ = 0 (1 repeated real), Δ < 0 (2 complex conjugate).',
  },
  'vietas-formulas': {
    promptLatex: 'x_1 + x_2 = \\ ?, \\quad x_1 x_2 = \\ ?',
    question: 'Recall Vieta’s formulas relating quadratic roots to polynomial coefficients.',
    hint: 'Sum has a negative sign (-b/a); product has a positive sign (c/a).',
  },
  'vietas-symmetric-sums': {
    promptLatex: 'x_1^2 + x_2^2 = \\ ?, \\quad \\frac{1}{x_1} + \\frac{1}{x_2} = \\ ?',
    question: 'Express the sum of root squares and reciprocals using Vieta coefficients.',
    hint: 'x₁² + x₂² = (x₁ + x₂)² - 2x₁x₂ = (b² - 2ac)/a².',
  },
  'arithmetic-progression': {
    promptLatex: 'a_n = \\ ?, \\quad S_n = \\ ?',
    question: 'State the nth general term and sum of n terms for an Arithmetic Progression.',
    hint: 'Common difference d adds linearly; sum is average of first and last multiplied by n.',
  },
  'geometric-progression': {
    promptLatex: 'a_n = \\ ?, \\quad S_n = \\ ?, \\quad S_\\infty = \\ ?',
    question: 'State the nth term, finite sum, and infinite sum of a Geometric Progression.',
    hint: 'Common ratio r multiplies; infinite sum requires |r| < 1 with formula a₁/(1 - r).',
  },
  'harmonic-progression': {
    promptLatex: 'HM(a, b) = \\ ?, \\quad (\\text{Inequality between } AM, GM, HM)',
    question: 'Recall Harmonic Mean between two values and the means inequality order.',
    hint: 'HM = 2ab / (a + b). Order: AM ≥ GM ≥ HM with GM² = AM · HM.',
  },
  'binomial-theorem': {
    promptLatex: 'T_{r+1} = \\ ? \\quad \\text{in } (a + b)^n',
    question: 'State the formula for the general (r+1)-th term in binomial expansion.',
    hint: 'The (r+1)-th term uses combination index r: nCr · a^(n-r) · b^r.',
  },
  'ece-parallel-impedance': {
    promptLatex: 'Z_T = Z_1 \\parallel Z_2 = \\ ? \\iff Z_1 = \\ ?',
    question: 'State product-over-sum for parallel impedance and isolate branch Z₁.',
    hint: 'Z_T = (Z₁Z₂)/(Z₁ + Z₂). Isolate branch: Z₁ = (Z_T·Z₂)/(Z₂ - Z_T).',
  },
  'ece-opamp-gain': {
    promptLatex: 'A_v = \\frac{V_{out}}{V_{in}} = \\ ? \\quad (\\text{Non-Inverting Op-Amp})',
    question: 'State the closed-loop voltage gain of a non-inverting op-amp and isolate Rf.',
    hint: 'Non-inverting has a "+1" term: Av = 1 + Rf/R₁. Isolate: Rf = R₁(Av - 1).',
  },
  'ece-lc-resonance': {
    promptLatex: 'f_r = \\ ? \\iff L = \\ ?',
    question: 'State the LC resonant frequency in Hz and isolate inductance L.',
    hint: 'fr = 1 / (2π√(LC)). Squaring gives L = 1 / (4π² fr² C).',
  },
  'ece-capacitor-energy': {
    promptLatex: 'W = \\ ? \\iff V = \\ ?',
    question: 'State the energy stored in a capacitor and isolate voltage V.',
    hint: 'W = (1/2) C V² = Q² / (2C). Isolate: V = √(2W / C).',
  },
  'ece-voltage-divider': {
    promptLatex: 'V_{out} = \\ ? \\iff R_1 = \\ ?',
    question: 'State the voltage divider equation and isolate upper drop resistor R₁.',
    hint: 'Vout = Vin · [R₂ / (R₁ + R₂)]. Isolate: R₁ = R₂ · (Vin / Vout - 1).',
  },
  'unary-minus-trap': {
    promptLatex: '-x^2 \\quad \\text{vs.} \\quad (-x)^2 \\quad (\\text{For } x = -3)',
    question: 'Explain the order of operations between negation and squaring.',
    hint: 'Squaring precedes negation: -3² = -9, while (-3)² = +9.',
  },
  'verbal-inversion-trap': {
    promptLatex: '\\text{"}y\\text{ subtracted from }x\\text{"} \\implies \\ ?',
    question: 'Translate the English phrases "subtracted from" and "less than" into algebra.',
    hint: '"from" and "than" reverse order to x - y. "diminished by" keeps direct order.',
  },
  'casio-subtractive-calc': {
    promptLatex: '[\\text{Problem}] - [\\text{Choice}] \\stackrel{?}{=} 0 \\quad (\\text{At what seeds?})',
    question: 'Explain the Casio [CALC] subtractive equivalence technique for testing algebraic options.',
    hint: 'Substitute prime test values like X = 5, Y = 7. Difference evaluates to 0 if identical.',
  },
  'casio-solve-roots': {
    promptLatex: 'f(X) = 0 \\xrightarrow{[\\text{SHIFT}][\\text{SOLVE}]} \\quad (\\text{Seeding rule})',
    question: 'Explain how initial seed values affect Casio [SOLVE] for multi-root equations.',
    hint: 'Seeding high (e.g. 10) converges to largest root; seeding low (e.g. -10) finds smallest root.',
  },

  // Calculus Prompts
  'calc-power-rule': {
    promptLatex: '\\frac{d}{dx}[x^n] = \\ ?, \\quad \\frac{d}{dx}[c \\cdot f(x)] = \\ ?',
    question: 'State the power rule and linearity of derivatives.',
    hint: 'Multiply by old power, decrement exponent by 1: n·x^(n-1). Constant factor pulls through.',
  },
  'calc-product-quotient': {
    promptLatex: '\\frac{d}{dx}[uv] = \\ ?, \\quad \\frac{d}{dx}\\left[\\frac{u}{v}\\right] = \\ ?',
    question: 'State the product rule and quotient rule for differentiation.',
    hint: 'Product: u\'v + uv\'. Quotient: (u\'v - uv\') / v² (numerator has a MINUS sign).',
  },
  'calc-chain-rule': {
    promptLatex: '\\frac{d}{dx}[f(g(x))] = \\ ?, \\quad \\frac{dy}{dx} = \\ ?',
    question: 'State the chain rule for composite function differentiation.',
    hint: 'Differentiate outer at inner times inner derivative: f\'(g(x)) · g\'(x).',
  },
  'calc-lhopital': {
    promptLatex: '\\lim_{x \\to c} \\frac{f(x)}{g(x)} = \\ ? \\quad \\left[\\text{Indeterminate } \\frac{0}{0} \\text{ or } \\frac{\\pm\\infty}{\\pm\\infty}\\right]',
    question: "State L'Hôpital's rule and its necessary conditions.",
    hint: 'Evaluate limit of ratio of derivatives f\'(x)/g\'(x) directly without quotient rule.',
  },
  'calc-integration-parts': {
    promptLatex: '\\int u \\, dv = \\ ? \\quad [\\text{LIATE order}]',
    question: 'State the integration by parts formula and LIATE priority rule.',
    hint: 'uv - ∫ v du. LIATE: Logarithmic, Inverse Trig, Algebraic, Trigonometric, Exponential.',
  },
  'calc-exp-log-derivatives': {
    promptLatex: '\\frac{d}{dx}[e^{kx}] = \\ ?, \\quad \\frac{d}{dx}[a^x] = \\ ?, \\quad \\frac{d}{dx}[\\ln x] = \\ ?',
    question: 'State derivatives of exponential functions and natural logarithms.',
    hint: 'e^(kx) -> k·e^(kx); general base a^x -> a^x·ln(a); ln(x) -> 1/x.',
  },
  'calc-trig-derivatives-integrals': {
    promptLatex: '\\frac{d}{dx}[\\sin x] = \\ ?, \\quad \\frac{d}{dx}[\\cos x] = \\ ?, \\quad \\int \\sec^2 x \\, dx = \\ ?',
    question: 'State the key derivatives and integrals for basic trigonometric functions.',
    hint: 'd/dx[sin x] = cos x; d/dx[cos x] = -sin x; ∫ sec²(x) dx = tan x + C.',
  },
  'calc-ftc': {
    promptLatex: '\\int_a^b f(x) \\, dx = \\ ? \\quad [\\text{where } F\'(x) = f(x)]',
    question: 'State the Fundamental Theorem of Calculus for definite integrals.',
    hint: 'F(b) - F(a), representing the net accumulated area under f(x) from a to b.',
  },

  // Physics Prompts
  'phys-kinematics': {
    promptLatex: 'v = \\ ?, \\quad s = \\ ?, \\quad v^2 = \\ ? \\quad [\\text{SUVAT}]',
    question: 'State the 3 key kinematic equations for constant linear acceleration.',
    hint: 'v = v₀ + at, s = v₀t + (1/2)at², v² = v₀² + 2as.',
  },
  'phys-newton-2nd': {
    promptLatex: '\\sum \\vec{F} = \\ ?, \\quad \\vec{J} = \\Delta \\vec{p} = \\ ?',
    question: "State Newton's Second Law in terms of acceleration and momentum.",
    hint: 'ΣF = ma = dp/dt. Impulse J = F_avg · Δt = Δp.',
  },
  'phys-work-energy': {
    promptLatex: 'W = \\ ?, \\quad KE = \\ ?, \\quad PE = \\ ?',
    question: 'State the work-energy theorem, kinetic energy, and gravitational potential energy.',
    hint: 'W = F·d·cos(θ) = ΔKE; KE = (1/2)mv²; PE = mgh.',
  },
  'phys-coulombs-law': {
    promptLatex: 'F_e = \\ ? \\quad [\\text{Between } q_1, q_2 \\text{ at distance } r]',
    question: "State Coulomb's Law for the electrostatic force between two point charges.",
    hint: 'Fe = k·|q₁q₂| / r² = (1/(4πε₀)) · |q₁q₂| / r².',
  },
  'phys-snells-law': {
    promptLatex: 'n_1 \\sin\\theta_1 = \\ ? \\iff \\sin\\theta_c = \\ ?',
    question: 'State Snell’s law of refraction and the formula for the critical angle.',
    hint: 'n₁ sin θ₁ = n₂ sin θ₂; critical angle sin θc = n₂ / n₁ (for n₁ > n₂).',
  },
  'phys-doppler-effect': {
    promptLatex: 'f\' = f \\left( \\frac{v \\pm v_D}{v \\mp v_S} \\right) \\quad [\\text{Sign conventions}]',
    question: 'State the Doppler effect frequency equation for sound/waves.',
    hint: 'Numerator has detector/observer speed v_D; denominator has source speed v_S. Upper signs for approaching.',
  },
  'phys-hookes-shm': {
    promptLatex: 'F = \\ ?, \\quad T = \\ ?, \\quad \\omega = \\ ? \\quad [\\text{SHM}]',
    question: 'State Hooke’s Law, period T, and angular frequency ω for a mass-spring oscillator.',
    hint: 'F = -kx; T = 2π√(m/k); ω = √(k/m) = 2πf.',
  },

  // Electronics Prompts
  'ece-ohms-power': {
    promptLatex: 'V = \\ ?, \\quad P = \\ ? \\quad [\\text{In terms of } V, I, R]',
    question: "State Ohm's Law and all 3 expressions for electrical resistive power.",
    hint: 'V = IR; P = VI = I²R = V²/R.',
  },
  'ece-transient-time-constant': {
    promptLatex: '\\tau_{RC} = \\ ?, \\quad \\tau_{RL} = \\ ?, \\quad v_C(t) = \\ ?',
    question: 'State the time constants for RC and RL circuits and the charging curve equation.',
    hint: 'τ_RC = RC; τ_RL = L/R. At t = τ, voltage reaches 63.2% of final value.',
  },
  'ece-bjt-relations': {
    promptLatex: 'I_E = \\ ?, \\quad I_C = \\beta I_B = \\ ?, \\quad \\alpha = \\ ?, \\quad g_m = \\ ?',
    question: 'State the BJT current relations, alpha-beta conversion, and transconductance.',
    hint: 'IE = IB + IC; IC = α·IE; α = β/(β+1); gm = IC / VT (VT ≈ 26 mV).',
  },
};

export function getFormulaPrompt(formulaId: string, formulaName: string, latex: string): FormulaPromptConfig {
  if (FORMULA_PROMPTS[formulaId]) {
    return FORMULA_PROMPTS[formulaId];
  }

  // Fallback heuristic if formulaId not explicitly mapped
  const eqIndex = latex.indexOf('=');
  if (eqIndex > 0) {
    const lhs = latex.substring(0, eqIndex).trim();
    return {
      promptLatex: `${lhs} = \\ ?`,
      question: `Recall the identity and result for: ${formulaName}`,
    };
  }

  return {
    promptLatex: `\\text{Recall: } \\text{${formulaName}} = \\ ?`,
    question: `State the mathematical expression for: ${formulaName}`,
  };
}
