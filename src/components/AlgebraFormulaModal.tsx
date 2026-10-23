import { AppArtwork } from './common/AppArtwork';
import React, { useState, useMemo } from 'react';
import { X, Check, Search, Palette, Moon, Sun, AlertTriangle } from 'lucide-react';
import { MathView } from './MathView';

export type FormulaColorTheme = 'vivid' | 'blueprint' | 'mono';

export interface FormulaVariableLegend {
  symbol: string;
  name: string;
  colorClass: string; // Tailwind color styling
  hexColor: string;
}

export interface FormulaEntry {
  id: string;
  title: string;
  category: 'quadratic' | 'rational' | 'exponents-logs' | 'progressions' | 'systems-polynomials';
  categoryLabel: string;
  categoryBadgeColor: string;
  categoryAccent: string;
  latexVivid: string;
  latexBlueprint: string;
  latexMono: string;
  copyLatex: string;
  copyText: string;
  variables: FormulaVariableLegend[];
  notes: string;
  examinerTrap?: string;
  example?: {
    problem: string;
    solution: string;
  };
}

interface AlgebraFormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ALGEBRA_FORMULAS: FormulaEntry[] = [
  {
    id: 'quadratic',
    title: 'Quadratic Formula & Discriminant Analysis',
    category: 'quadratic',
    categoryLabel: 'Quadratic & Roots',
    categoryBadgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    categoryAccent: 'border-emerald-300/80 hover:border-emerald-400 bg-emerald-50/20',
    latexVivid:
      '\\mathbf{\\textcolor{#2563eb}{x}} = \\frac{-\\textcolor{#0284c7}{b} \\pm \\sqrt{\\textcolor{#0284c7}{b}^2 - 4\\textcolor{#059669}{a}\\textcolor{#d97706}{c}}}{2\\textcolor{#059669}{a}} \\quad \\Big| \\quad \\textcolor{#e11d48}{\\Delta} = \\textcolor{#0284c7}{b}^2 - 4\\textcolor{#059669}{a}\\textcolor{#d97706}{c}',
    latexBlueprint:
      '\\mathbf{\\textcolor{#38bdf8}{x}} = \\frac{-\\textcolor{#67e8f9}{b} \\pm \\sqrt{\\textcolor{#67e8f9}{b}^2 - 4\\textcolor{#4ade80}{a}\\textcolor{#fde047}{c}}}{2\\textcolor{#4ade80}{a}} \\quad \\Big| \\quad \\textcolor{#f43f5e}{\\Delta} = \\textcolor{#67e8f9}{b}^2 - 4\\textcolor{#4ade80}{a}\\textcolor{#fde047}{c}',
    latexMono: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\quad \\Big| \\quad \\Delta = b^2 - 4ac',
    copyLatex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    copyText: 'x = (-b ± √(b² - 4ac)) / (2a) | Δ = b² - 4ac',
    variables: [
      { symbol: 'x', name: 'Roots / Unknowns', colorClass: 'bg-blue-100 text-blue-800 border-blue-200', hexColor: '#2563eb' },
      { symbol: 'a', name: 'Leading Coeff (x²)', colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200', hexColor: '#059669' },
      { symbol: 'b', name: 'Linear Coeff (x)', colorClass: 'bg-sky-100 text-sky-800 border-sky-200', hexColor: '#0284c7' },
      { symbol: 'c', name: 'Constant Term', colorClass: 'bg-amber-100 text-amber-800 border-amber-200', hexColor: '#d97706' },
      { symbol: 'Δ', name: 'Discriminant', colorClass: 'bg-rose-100 text-rose-800 border-rose-200', hexColor: '#e11d48' },
    ],
    notes: 'Roots nature: Δ > 0 (2 distinct real roots), Δ = 0 (1 real repeated root), Δ < 0 (2 complex conjugate roots).',
    examinerTrap: 'Dropping the negative sign in front of -b when b itself is already negative (e.g., -(-6) = +6).',
    example: {
      problem: '2x^2 - 5x + 2 = 0',
      solution: 'x = \\frac{-(-5) \\pm \\sqrt{25 - 4(2)(2)}}{2(2)} = \\frac{5 \\pm 3}{4} \\implies x = 2, \\; \\frac{1}{2}',
    },
  },
  {
    id: 'vietas',
    title: "Vieta's Formulas & Polynomial Root Relations",
    category: 'quadratic',
    categoryLabel: 'Quadratic & Roots',
    categoryBadgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    categoryAccent: 'border-emerald-300/80 hover:border-emerald-400 bg-emerald-50/20',
    latexVivid:
      '\\textcolor{#2563eb}{x_1} + \\textcolor{#059669}{x_2} = -\\frac{\\textcolor{#0284c7}{b}}{\\textcolor{#059669}{a}}, \\quad \\textcolor{#2563eb}{x_1}\\textcolor{#059669}{x_2} = \\frac{\\textcolor{#d97706}{c}}{\\textcolor{#059669}{a}} \\quad \\Big| \\quad \\textcolor{#7c3aed}{x_1^2 + x_2^2} = (\\textcolor{#2563eb}{x_1} + \\textcolor{#059669}{x_2})^2 - 2\\textcolor{#2563eb}{x_1}\\textcolor{#059669}{x_2}',
    latexBlueprint:
      '\\textcolor{#38bdf8}{x_1} + \\textcolor{#4ade80}{x_2} = -\\frac{\\textcolor{#67e8f9}{b}}{\\textcolor{#4ade80}{a}}, \\quad \\textcolor{#38bdf8}{x_1}\\textcolor{#4ade80}{x_2} = \\frac{\\textcolor{#fde047}{c}}{\\textcolor{#4ade80}{a}} \\quad \\Big| \\quad \\textcolor{#c084fc}{x_1^2 + x_2^2} = (\\textcolor{#38bdf8}{x_1} + \\textcolor{#4ade80}{x_2})^2 - 2\\textcolor{#38bdf8}{x_1}\\textcolor{#4ade80}{x_2}',
    latexMono: 'x_1 + x_2 = -\\frac{b}{a}, \\quad x_1 x_2 = \\frac{c}{a} \\quad \\Big| \\quad x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1 x_2',
    copyLatex: 'x_1 + x_2 = -\\frac{b}{a}, \\quad x_1 x_2 = \\frac{c}{a}',
    copyText: 'Sum of roots: x₁ + x₂ = -b/a | Product of roots: x₁·x₂ = c/a | x₁² + x₂² = (x₁+x₂)² - 2x₁x₂',
    variables: [
      { symbol: 'x₁ + x₂', name: 'Sum of Roots', colorClass: 'bg-blue-100 text-blue-800 border-blue-200', hexColor: '#2563eb' },
      { symbol: 'x₁·x₂', name: 'Product of Roots', colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200', hexColor: '#059669' },
      { symbol: 'x₁² + x₂²', name: 'Sum of Squares', colorClass: 'bg-purple-100 text-purple-800 border-purple-200', hexColor: '#7c3aed' },
    ],
    notes: 'For higher-order polynomials P(x) = a_n x^n + ... + a_0, sum of roots is always -a_{n-1}/a_n.',
    examinerTrap: 'Forgetting the leading coefficient "a" in the denominator when calculating the sum (-b/a) or product (c/a).',
    example: {
      problem: 'If roots of 3x^2 + 7x - 6 = 0 are r and s, find r² + s²',
      solution: 'r + s = -\\frac{7}{3}, \\; rs = -\\frac{6}{3} = -2 \\implies r^2 + s^2 = \\left(-\\frac{7}{3}\\right)^2 - 2(-2) = \\frac{49}{9} + 4 = \\frac{85}{9}',
    },
  },
  {
    id: 'rational',
    title: 'Rational Decomposition & Partial Fractions',
    category: 'rational',
    categoryLabel: 'Fractions & Decomposition',
    categoryBadgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    categoryAccent: 'border-indigo-300/80 hover:border-indigo-400 bg-indigo-50/20',
    latexVivid:
      '\\frac{\\textcolor{#2563eb}{P(x)}}{\\textcolor{#7c3aed}{Q(x)}} = \\frac{\\textcolor{#059669}{A_1}}{\\textcolor{#0284c7}{x - r_1}} + \\frac{\\textcolor{#059669}{A_2}}{\\textcolor{#0284c7}{x - r_2}} + \\dots + \\frac{\\textcolor{#d97706}{Bx + C}}{\\textcolor{#e11d48}{ax^2 + bx + c}}',
    latexBlueprint:
      '\\frac{\\textcolor{#38bdf8}{P(x)}}{\\textcolor{#c084fc}{Q(x)}} = \\frac{\\textcolor{#4ade80}{A_1}}{\\textcolor{#67e8f9}{x - r_1}} + \\frac{\\textcolor{#4ade80}{A_2}}{\\textcolor{#67e8f9}{x - r_2}} + \\dots + \\frac{\\textcolor{#fde047}{Bx + C}}{\\textcolor{#f43f5e}{ax^2 + bx + c}}',
    latexMono:
      '\\frac{P(x)}{Q(x)} = \\frac{A_1}{x - r_1} + \\frac{A_2}{x - r_2} + \\dots + \\frac{Bx + C}{ax^2 + bx + c}',
    copyLatex: '\\frac{P(x)}{Q(x)} = \\frac{A}{x - r_1} + \\frac{B}{x - r_2} + \\frac{Cx + D}{ax^2 + bx + c}',
    copyText: 'P(x)/Q(x) = A/(x - r₁) + B/(x - r₂) + ... + (Cx + D)/(ax² + bx + c)',
    variables: [
      { symbol: 'P(x)', name: 'Numerator Polynomial', colorClass: 'bg-blue-100 text-blue-800 border-blue-200', hexColor: '#2563eb' },
      { symbol: 'Q(x)', name: 'Denominator Polynomial', colorClass: 'bg-purple-100 text-purple-800 border-purple-200', hexColor: '#7c3aed' },
      { symbol: 'A₁, A₂', name: 'Linear Numerators', colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200', hexColor: '#059669' },
      { symbol: 'x - r', name: 'Linear Denominators', colorClass: 'bg-sky-100 text-sky-800 border-sky-200', hexColor: '#0284c7' },
      { symbol: 'Bx + C', name: 'Quadratic Numerator', colorClass: 'bg-amber-100 text-amber-800 border-amber-200', hexColor: '#d97706' },
    ],
    notes: 'Deg(P) must be strictly less than Deg(Q). If improper (deg P ≥ deg Q), perform polynomial long division first.',
    examinerTrap: 'Using a single constant "A" over an irreducible quadratic denominator instead of the linear form (Ax + B).',
    example: {
      problem: '\\frac{5x - 1}{(x - 1)(x + 2)} = \\frac{A}{x - 1} + \\frac{B}{x + 2}',
      solution: 'x = 1 \\implies A = \\frac{4}{3}; \\quad x = -2 \\implies B = \\frac{-11}{-3} = \\frac{11}{3}',
    },
  },
  {
    id: 'special-products',
    title: 'Special Products & Factoring Identities',
    category: 'rational',
    categoryLabel: 'Fractions & Decomposition',
    categoryBadgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    categoryAccent: 'border-indigo-300/80 hover:border-indigo-400 bg-indigo-50/20',
    latexVivid:
      '\\textcolor{#2563eb}{a}^2 - \\textcolor{#059669}{b}^2 = (\\textcolor{#2563eb}{a} - \\textcolor{#059669}{b})(\\textcolor{#2563eb}{a} + \\textcolor{#059669}{b}) \\quad \\Big| \\quad \\textcolor{#2563eb}{a}^3 \\pm \\textcolor{#059669}{b}^3 = (\\textcolor{#2563eb}{a} \\pm \\textcolor{#059669}{b})(\\textcolor{#2563eb}{a}^2 \\mp \\textcolor{#2563eb}{a}\\textcolor{#059669}{b} + \\textcolor{#059669}{b}^2)',
    latexBlueprint:
      '\\textcolor{#38bdf8}{a}^2 - \\textcolor{#4ade80}{b}^2 = (\\textcolor{#38bdf8}{a} - \\textcolor{#4ade80}{b})(\\textcolor{#38bdf8}{a} + \\textcolor{#4ade80}{b}) \\quad \\Big| \\quad \\textcolor{#38bdf8}{a}^3 \\pm \\textcolor{#4ade80}{b}^3 = (\\textcolor{#38bdf8}{a} \\pm \\textcolor{#4ade80}{b})(\\textcolor{#38bdf8}{a}^2 \\mp \\textcolor{#38bdf8}{a}\\textcolor{#4ade80}{b} + \\textcolor{#4ade80}{b}^2)',
    latexMono:
      'a^2 - b^2 = (a - b)(a + b) \\quad \\Big| \\quad a^3 \\pm b^3 = (a \\pm b)(a^2 \\mp ab + b^2)',
    copyLatex: 'a^2 - b^2 = (a - b)(a + b), \\quad a^3 \\pm b^3 = (a \\pm b)(a^2 \\mp ab + b^2)',
    copyText: 'a² - b² = (a - b)(a + b) | a³ ± b³ = (a ± b)(a² ∓ ab + b²)',
    variables: [
      { symbol: 'a² - b²', name: 'Difference of Squares', colorClass: 'bg-blue-100 text-blue-800 border-blue-200', hexColor: '#2563eb' },
      { symbol: 'a³ + b³', name: 'Sum of Cubes: (a+b)(a²-ab+b²)', colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200', hexColor: '#059669' },
      { symbol: 'a³ - b³', name: 'Diff of Cubes: (a-b)(a²+ab+b²)', colorClass: 'bg-amber-100 text-amber-800 border-amber-200', hexColor: '#d97706' },
    ],
    notes: 'Remember SOAP for cubes: Same sign, Opposite sign, Always Positive (a³ - b³ = (a-b)(a² + ab + b²)).',
    examinerTrap: 'Mistaking a² + b² as factorable over reals; it is prime over real numbers ℝ.',
    example: {
      problem: '8x^3 - 27',
      solution: '(2x)^3 - 3^3 = (2x - 3)(4x^2 + 6x + 9)',
    },
  },
  {
    id: 'exponents',
    title: 'Laws of Exponents & Radical Operations',
    category: 'exponents-logs',
    categoryLabel: 'Powers & Logarithms',
    categoryBadgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    categoryAccent: 'border-amber-300/80 hover:border-amber-400 bg-amber-50/20',
    latexVivid:
      '\\textcolor{#059669}{a}^{\\textcolor{#2563eb}{m}} \\cdot \\textcolor{#059669}{a}^{\\textcolor{#7c3aed}{n}} = \\textcolor{#059669}{a}^{\\textcolor{#2563eb}{m}+\\textcolor{#7c3aed}{n}}, \\quad (\\textcolor{#059669}{a}^{\\textcolor{#2563eb}{m}})^{\\textcolor{#7c3aed}{n}} = \\textcolor{#059669}{a}^{\\textcolor{#2563eb}{m}\\textcolor{#7c3aed}{n}}, \\quad \\sqrt[\\textcolor{#7c3aed}{n}]{\\textcolor{#059669}{a}^{\\textcolor{#2563eb}{m}}} = \\textcolor{#059669}{a}^{\\frac{\\textcolor{#2563eb}{m}}{\\textcolor{#7c3aed}{n}}}, \\quad \\textcolor{#059669}{a}^{-\\textcolor{#2563eb}{m}} = \\frac{1}{\\textcolor{#059669}{a}^{\\textcolor{#2563eb}{m}}}',
    latexBlueprint:
      '\\textcolor{#4ade80}{a}^{\\textcolor{#38bdf8}{m}} \\cdot \\textcolor{#4ade80}{a}^{\\textcolor{#c084fc}{n}} = \\textcolor{#4ade80}{a}^{\\textcolor{#38bdf8}{m}+\\textcolor{#c084fc}{n}}, \\quad (\\textcolor{#4ade80}{a}^{\\textcolor{#38bdf8}{m}})^{\\textcolor{#c084fc}{n}} = \\textcolor{#4ade80}{a}^{\\textcolor{#38bdf8}{m}\\textcolor{#c084fc}{n}}, \\quad \\sqrt[\\textcolor{#c084fc}{n}]{\\textcolor{#4ade80}{a}^{\\textcolor{#38bdf8}{m}}} = \\textcolor{#4ade80}{a}^{\\frac{\\textcolor{#38bdf8}{m}}{\\textcolor{#c084fc}{n}}}',
    latexMono:
      'a^m \\cdot a^n = a^{m+n}, \\quad (a^m)^n = a^{mn}, \\quad \\sqrt[n]{a^m} = a^{m/n}, \\quad a^{-m} = \\frac{1}{a^m}',
    copyLatex: 'a^m \\cdot a^n = a^{m+n}, \\quad (a^m)^n = a^{mn}, \\quad \\sqrt[n]{a^m} = a^{m/n}',
    copyText: 'a^m · a^n = a^(m+n) | (a^m)^n = a^(mn) | ⁿ√(a^m) = a^(m/n) | a^(-m) = 1/a^m',
    variables: [
      { symbol: 'a', name: 'Base (a > 0)', colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200', hexColor: '#059669' },
      { symbol: 'm', name: 'Power Numerator', colorClass: 'bg-blue-100 text-blue-800 border-blue-200', hexColor: '#2563eb' },
      { symbol: 'n', name: 'Power Denominator / Index', colorClass: 'bg-purple-100 text-purple-800 border-purple-200', hexColor: '#7c3aed' },
    ],
    notes: 'Valid for all real base a > 0 and rational exponents m, n. Division subtracts powers: a^m / a^n = a^(m-n).',
    examinerTrap: 'Adding bases instead of multiplying (e.g. 2^3 · 2^4 = 2^7, NOT 4^7).',
    example: {
      problem: '\\frac{(x^3 y^2)^4}{x^5 y^9}',
      solution: '\\frac{x^{12} y^8}{x^5 y^9} = x^{12-5} y^{8-9} = x^7 y^{-1} = \\frac{x^7}{y}',
    },
  },
  {
    id: 'logarithms',
    title: 'Logarithmic Laws & Change of Base Formula',
    category: 'exponents-logs',
    categoryLabel: 'Powers & Logarithms',
    categoryBadgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    categoryAccent: 'border-amber-300/80 hover:border-amber-400 bg-amber-50/20',
    latexVivid:
      '\\log_{\\textcolor{#d97706}{b}}(\\textcolor{#2563eb}{x}\\textcolor{#059669}{y}) = \\log_{\\textcolor{#d97706}{b}}\\textcolor{#2563eb}{x} + \\log_{\\textcolor{#d97706}{b}}\\textcolor{#059669}{y}, \\quad \\log_{\\textcolor{#d97706}{b}}\\left(\\frac{\\textcolor{#2563eb}{x}}{\\textcolor{#059669}{y}}\\right) = \\log_{\\textcolor{#d97706}{b}}\\textcolor{#2563eb}{x} - \\log_{\\textcolor{#d97706}{b}}\\textcolor{#059669}{y}, \\quad \\log_{\\textcolor{#d97706}{b}}\\textcolor{#2563eb}{x} = \\frac{\\ln\\textcolor{#2563eb}{x}}{\\ln\\textcolor{#d97706}{b}}',
    latexBlueprint:
      '\\log_{\\textcolor{#fde047}{b}}(\\textcolor{#38bdf8}{x}\\textcolor{#4ade80}{y}) = \\log_{\\textcolor{#fde047}{b}}\\textcolor{#38bdf8}{x} + \\log_{\\textcolor{#fde047}{b}}\\textcolor{#4ade80}{y}, \\quad \\log_{\\textcolor{#fde047}{b}}\\left(\\frac{\\textcolor{#38bdf8}{x}}{\\textcolor{#4ade80}{y}}\\right) = \\log_{\\textcolor{#fde047}{b}}\\textcolor{#38bdf8}{x} - \\log_{\\textcolor{#fde047}{b}}\\textcolor{#4ade80}{y}, \\quad \\log_{\\textcolor{#fde047}{b}}\\textcolor{#38bdf8}{x} = \\frac{\\ln\\textcolor{#38bdf8}{x}}{\\ln\\textcolor{#fde047}{b}}',
    latexMono:
      '\\log_b(xy) = \\log_b x + \\log_b y, \\quad \\log_b\\left(\\frac{x}{y}\\right) = \\log_b x - \\log_b y, \\quad \\log_b(x) = \\frac{\\ln x}{\\ln b}',
    copyLatex: '\\log_b(xy) = \\log_b x + \\log_b y, \\quad \\log_b(x) = \\frac{\\ln x}{\\ln b}',
    copyText: 'log_b(xy) = log_b(x) + log_b(y) | log_b(x/y) = log_b(x) - log_b(y) | log_b(x) = ln(x)/ln(b)',
    variables: [
      { symbol: 'b', name: 'Log Base (b > 0, b ≠ 1)', colorClass: 'bg-amber-100 text-amber-800 border-amber-200', hexColor: '#d97706' },
      { symbol: 'x', name: 'First Argument (x > 0)', colorClass: 'bg-blue-100 text-blue-800 border-blue-200', hexColor: '#2563eb' },
      { symbol: 'y', name: 'Second Argument (y > 0)', colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200', hexColor: '#059669' },
    ],
    notes: 'Power rule: log_b(x^k) = k · log_b(x). Change of base allows direct evaluation using natural log (ln) or common log (log10).',
    examinerTrap: 'Mistaking log(x + y) as log x + log y. The log of a sum CANNOT be split.',
    example: {
      problem: '\\text{Evaluate } \\log_4(32)',
      solution: '\\log_4(32) = \\frac{\\ln 32}{\\ln 4} = \\frac{\\ln(2^5)}{\\ln(2^2)} = \\frac{5\\ln 2}{2\\ln 2} = \\frac{5}{2} = 2.5',
    },
  },
  {
    id: 'binomial',
    title: 'Binomial Theorem & General Term Expansion',
    category: 'systems-polynomials',
    categoryLabel: 'Systems & Polynomials',
    categoryBadgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    categoryAccent: 'border-purple-300/80 hover:border-purple-400 bg-purple-50/20',
    latexVivid:
      '(\\textcolor{#2563eb}{x} + \\textcolor{#059669}{y})^{\\textcolor{#7c3aed}{n}} = \\sum_{\\textcolor{#d97706}{k}=0}^{\\textcolor{#7c3aed}{n}} \\binom{\\textcolor{#7c3aed}{n}}{\\textcolor{#d97706}{k}} \\textcolor{#2563eb}{x}^{\\textcolor{#7c3aed}{n}-\\textcolor{#d97706}{k}} \\textcolor{#059669}{y}^{\\textcolor{#d97706}{k}} \\quad \\Big| \\quad \\textcolor{#0284c7}{T_r} = \\binom{\\textcolor{#7c3aed}{n}}{\\textcolor{#d97706}{r-1}} \\textcolor{#2563eb}{x}^{\\textcolor{#7c3aed}{n}-(\\textcolor{#d97706}{r}-1)} \\textcolor{#059669}{y}^{\\textcolor{#d97706}{r}-1}',
    latexBlueprint:
      '(\\textcolor{#38bdf8}{x} + \\textcolor{#4ade80}{y})^{\\textcolor{#c084fc}{n}} = \\sum_{\\textcolor{#fde047}{k}=0}^{\\textcolor{#c084fc}{n}} \\binom{\\textcolor{#c084fc}{n}}{\\textcolor{#fde047}{k}} \\textcolor{#38bdf8}{x}^{\\textcolor{#c084fc}{n}-\\textcolor{#fde047}{k}} \\textcolor{#4ade80}{y}^{\\textcolor{#fde047}{k}} \\quad \\Big| \\quad \\textcolor{#67e8f9}{T_r} = \\binom{\\textcolor{#c084fc}{n}}{\\textcolor{#fde047}{r-1}} \\textcolor{#38bdf8}{x}^{\\textcolor{#c084fc}{n}-(\\textcolor{#fde047}{r}-1)} \\textcolor{#4ade80}{y}^{\\textcolor{#fde047}{r}-1}',
    latexMono:
      '(x + y)^n = \\sum_{k=0}^{n} \\binom{n}{k} x^{n-k} y^k \\quad \\Big| \\quad T_r = \\binom{n}{r-1} x^{n-r+1} y^{r-1}',
    copyLatex: '(x + y)^n = \\sum_{k=0}^{n} \\binom{n}{k} x^{n-k} y^k, \\quad T_r = \\binom{n}{r-1} x^{n-r+1} y^{r-1}',
    copyText: '(x + y)ⁿ = ∑ [n!/(k!(n-k)!)] · x^(n-k) · y^k | r-th term: T_r = nC(r-1) · x^(n-r+1) · y^(r-1)',
    variables: [
      { symbol: 'n', name: 'Power / Degree', colorClass: 'bg-purple-100 text-purple-800 border-purple-200', hexColor: '#7c3aed' },
      { symbol: 'k / (r-1)', name: 'Step Index', colorClass: 'bg-amber-100 text-amber-800 border-amber-200', hexColor: '#d97706' },
      { symbol: 'T_r', name: 'The r-th Term', colorClass: 'bg-sky-100 text-sky-800 border-sky-200', hexColor: '#0284c7' },
      { symbol: 'nCr', name: 'Combinations: n! / [r!(n-r)!]', colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200', hexColor: '#059669' },
    ],
    notes: 'Total terms in expansion is n + 1. The sum of powers of x and y in every term always equals n.',
    examinerTrap: 'Confusing the 5th term (r = 5) with k = 5. For the 5th term, the combination index is k = r - 1 = 4.',
    example: {
      problem: 'Find the 4th term of (2x - 3y)^6',
      solution: 'T_4 = \\binom{6}{3}(2x)^3(-3y)^3 = 20(8x^3)(-27y^3) = -4,320 x^3 y^3',
    },
  },
  {
    id: 'arithmetic-progression',
    title: 'Arithmetic Progression (AP) Formulas',
    category: 'progressions',
    categoryLabel: 'Series & Progressions',
    categoryBadgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    categoryAccent: 'border-cyan-300/80 hover:border-cyan-400 bg-cyan-50/20',
    latexVivid:
      '\\textcolor{#059669}{a_n} = \\textcolor{#2563eb}{a_1} + (\\textcolor{#7c3aed}{n} - 1)\\textcolor{#d97706}{d}, \\quad \\textcolor{#0284c7}{S_n} = \\frac{\\textcolor{#7c3aed}{n}}{2}\\left[2\\textcolor{#2563eb}{a_1} + (\\textcolor{#7c3aed}{n}-1)\\textcolor{#d97706}{d}\\right] = \\frac{\\textcolor{#7c3aed}{n}}{2}(\\textcolor{#2563eb}{a_1} + \\textcolor{#059669}{a_n})',
    latexBlueprint:
      '\\textcolor{#4ade80}{a_n} = \\textcolor{#38bdf8}{a_1} + (\\textcolor{#c084fc}{n} - 1)\\textcolor{#fde047}{d}, \\quad \\textcolor{#67e8f9}{S_n} = \\frac{\\textcolor{#c084fc}{n}}{2}\\left[2\\textcolor{#38bdf8}{a_1} + (\\textcolor{#c084fc}{n}-1)\\textcolor{#fde047}{d}\\right]',
    latexMono:
      'a_n = a_1 + (n - 1)d, \\quad S_n = \\frac{n}{2}[2a_1 + (n-1)d] = \\frac{n}{2}(a_1 + a_n)',
    copyLatex: 'a_n = a_1 + (n - 1)d, \\quad S_n = \\frac{n}{2}[2a_1 + (n-1)d]',
    copyText: 'a_n = a₁ + (n - 1)d | S_n = (n/2)[2a₁ + (n - 1)d] = (n/2)(a₁ + a_n)',
    variables: [
      { symbol: 'a_n', name: 'n-th Term', colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200', hexColor: '#059669' },
      { symbol: 'a₁', name: 'First Term', colorClass: 'bg-blue-100 text-blue-800 border-blue-200', hexColor: '#2563eb' },
      { symbol: 'd', name: 'Common Difference (a_{k+1} - a_k)', colorClass: 'bg-amber-100 text-amber-800 border-amber-200', hexColor: '#d97706' },
      { symbol: 'n', name: 'Total Terms Count', colorClass: 'bg-purple-100 text-purple-800 border-purple-200', hexColor: '#7c3aed' },
      { symbol: 'S_n', name: 'Sum of n Terms', colorClass: 'bg-sky-100 text-sky-800 border-sky-200', hexColor: '#0284c7' },
    ],
    notes: 'Arithmetic Mean between x and y is (x + y)/2. Consecutive terms form an arithmetic progression.',
    examinerTrap: 'Using "n" instead of "n - 1" when calculating a_n.',
    example: {
      problem: 'Find the 20th term and sum of 20 terms for: 3, 7, 11, 15...',
      solution: 'a_1 = 3, d = 4 \\implies a_{20} = 3 + 19(4) = 79; \\quad S_{20} = \\frac{20}{2}(3 + 79) = 10(82) = 820',
    },
  },
  {
    id: 'geometric-progression',
    title: 'Geometric Progression (GP) & Infinite Series',
    category: 'progressions',
    categoryLabel: 'Series & Progressions',
    categoryBadgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    categoryAccent: 'border-cyan-300/80 hover:border-cyan-400 bg-cyan-50/20',
    latexVivid:
      '\\textcolor{#059669}{g_n} = \\textcolor{#2563eb}{g_1} \\textcolor{#d97706}{r}^{\\textcolor{#7c3aed}{n}-1}, \\quad \\textcolor{#0284c7}{S_n} = \\frac{\\textcolor{#2563eb}{g_1}(1 - \\textcolor{#d97706}{r}^{\\textcolor{#7c3aed}{n}})}{1 - \\textcolor{#d97706}{r}} \\quad \\Big| \\quad \\textcolor{#e11d48}{S_\\infty} = \\frac{\\textcolor{#2563eb}{g_1}}{1 - \\textcolor{#d97706}{r}} \\quad (|\\textcolor{#d97706}{r}| < 1)',
    latexBlueprint:
      '\\textcolor{#4ade80}{g_n} = \\textcolor{#38bdf8}{g_1} \\textcolor{#fde047}{r}^{\\textcolor{#c084fc}{n}-1}, \\quad \\textcolor{#67e8f9}{S_n} = \\frac{\\textcolor{#38bdf8}{g_1}(1 - \\textcolor{#fde047}{r}^{\\textcolor{#c084fc}{n}})}{1 - \\textcolor{#fde047}{r}} \\quad \\Big| \\quad \\textcolor{#f43f5e}{S_\\infty} = \\frac{\\textcolor{#38bdf8}{g_1}}{1 - \\textcolor{#fde047}{r}}',
    latexMono:
      'g_n = g_1 r^{n-1}, \\quad S_n = \\frac{g_1(1 - r^n)}{1 - r} \\quad \\Big| \\quad S_\\infty = \\frac{g_1}{1 - r} \\quad (|r| < 1)',
    copyLatex: 'g_n = g_1 r^{n-1}, \\quad S_n = \\frac{g_1(1 - r^n)}{1 - r}, \\quad S_\\infty = \\frac{g_1}{1 - r}',
    copyText: 'g_n = g₁·r^(n-1) | S_n = g₁(1 - rⁿ)/(1 - r) | S_∞ = g₁/(1 - r) for |r| < 1',
    variables: [
      { symbol: 'g_n', name: 'n-th Term', colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200', hexColor: '#059669' },
      { symbol: 'g₁', name: 'First Term', colorClass: 'bg-blue-100 text-blue-800 border-blue-200', hexColor: '#2563eb' },
      { symbol: 'r', name: 'Common Ratio (g_{k+1}/g_k)', colorClass: 'bg-amber-100 text-amber-800 border-amber-200', hexColor: '#d97706' },
      { symbol: 'S_∞', name: 'Infinite Series Sum', colorClass: 'bg-rose-100 text-rose-800 border-rose-200', hexColor: '#e11d48' },
    ],
    notes: 'Geometric Mean between x and y is √(xy). Infinite series only converges if and only if |r| < 1.',
    examinerTrap: 'Attempting to calculate infinite sum S_∞ when ratio |r| ≥ 1. The series diverges without a finite sum.',
    example: {
      problem: 'Evaluate the infinite geometric series: 12 + 6 + 3 + 1.5 + ...',
      solution: 'g_1 = 12, r = \\frac{6}{12} = 0.5 \\implies S_\\infty = \\frac{12}{1 - 0.5} = \\frac{12}{0.5} = 24',
    },
  },
  {
    id: 'cramers-rule',
    title: "Cramer's Rule & Determinants for Linear Systems",
    category: 'systems-polynomials',
    categoryLabel: 'Systems & Polynomials',
    categoryBadgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    categoryAccent: 'border-purple-300/80 hover:border-purple-400 bg-purple-50/20',
    latexVivid:
      '\\textcolor{#2563eb}{x} = \\frac{\\textcolor{#0284c7}{\\Delta_x}}{\\textcolor{#7c3aed}{\\Delta}}, \\quad \\textcolor{#059669}{y} = \\frac{\\textcolor{#059669}{\\Delta_y}}{\\textcolor{#7c3aed}{\\Delta}} \\quad \\Big| \\quad \\textcolor{#7c3aed}{\\Delta} = \\begin{vmatrix} \\textcolor{#2563eb}{a_1} & \\textcolor{#059669}{b_1} \\\\ \\textcolor{#2563eb}{a_2} & \\textcolor{#059669}{b_2} \\end{vmatrix} = \\textcolor{#2563eb}{a_1}\\textcolor{#059669}{b_2} - \\textcolor{#2563eb}{a_2}\\textcolor{#059669}{b_1}',
    latexBlueprint:
      '\\textcolor{#38bdf8}{x} = \\frac{\\textcolor{#67e8f9}{\\Delta_x}}{\\textcolor{#c084fc}{\\Delta}}, \\quad \\textcolor{#4ade80}{y} = \\frac{\\textcolor{#4ade80}{\\Delta_y}}{\\textcolor{#c084fc}{\\Delta}} \\quad \\Big| \\quad \\textcolor{#c084fc}{\\Delta} = \\begin{vmatrix} \\textcolor{#38bdf8}{a_1} & \\textcolor{#4ade80}{b_1} \\\\ \\textcolor{#38bdf8}{a_2} & \\textcolor{#4ade80}{b_2} \\end{vmatrix}',
    latexMono:
      'x = \\frac{\\Delta_x}{\\Delta}, \\quad y = \\frac{\\Delta_y}{\\Delta}, \\quad \\Delta = a_1 b_2 - a_2 b_1 \\neq 0',
    copyLatex: 'x = \\frac{\\Delta_x}{\\Delta}, \\quad y = \\frac{\\Delta_y}{\\Delta}, \\quad \\Delta = a_1 b_2 - a_2 b_1',
    copyText: 'x = Δ_x / Δ | y = Δ_y / Δ | Δ = a₁b₂ - a₂b₁ (requires Δ ≠ 0)',
    variables: [
      { symbol: 'Δ', name: 'Coefficient Determinant', colorClass: 'bg-purple-100 text-purple-800 border-purple-200', hexColor: '#7c3aed' },
      { symbol: 'Δ_x', name: 'Determinant with x-constants', colorClass: 'bg-sky-100 text-sky-800 border-sky-200', hexColor: '#0284c7' },
      { symbol: 'Δ_y', name: 'Determinant with y-constants', colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200', hexColor: '#059669' },
    ],
    notes: 'If Δ = 0, Cramer’s Rule does not decide consistency. Compare rank(A) with rank([A|b]): different ranks mean no solution; equal ranks below the number of variables mean infinitely many solutions.',
    examinerTrap: 'Forgetting the negative sign on the off-diagonal product (-a2·b1) when expanding the 2x2 determinant.',
    example: {
      problem: 'Solve: 2x + 3y = 7 and x - 2y = -7',
      solution: '\\Delta = (2)(-2) - (3)(1) = -7; \\; \\Delta_x = (7)(-2) - (3)(-7) = 7 \\implies x = \\frac{7}{-7} = -1, \\; y = 3',
    },
  },
  {
    id: 'remainder-factor',
    title: 'Remainder Theorem & Synthetic Division Factor Identity',
    category: 'systems-polynomials',
    categoryLabel: 'Systems & Polynomials',
    categoryBadgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    categoryAccent: 'border-purple-300/80 hover:border-purple-400 bg-purple-50/20',
    latexVivid:
      '\\textcolor{#2563eb}{P(x)} = (\\textcolor{#0284c7}{x - c})\\textcolor{#059669}{Q(x)} + \\textcolor{#e11d48}{R} \\implies \\textcolor{#e11d48}{R} = \\textcolor{#2563eb}{P(c)}, \\quad (\\textcolor{#0284c7}{x - c} \\text{ is a factor} \\iff \\textcolor{#e11d48}{P(c)} = 0)',
    latexBlueprint:
      '\\textcolor{#38bdf8}{P(x)} = (\\textcolor{#67e8f9}{x - c})\\textcolor{#4ade80}{Q(x)} + \\textcolor{#f43f5e}{R} \\implies \\textcolor{#f43f5e}{R} = \\textcolor{#38bdf8}{P(c)}',
    latexMono:
      'P(x) = (x - c)Q(x) + R \\implies R = P(c), \\quad (x - c) \\text{ is a factor} \\iff P(c) = 0',
    copyLatex: 'P(x) = (x - c)Q(x) + R \\implies R = P(c)',
    copyText: 'Remainder Theorem: When P(x) is divided by (x - c), Remainder R = P(c). Factor theorem: (x - c) is factor iff P(c) = 0.',
    variables: [
      { symbol: 'P(x)', name: 'Dividend Polynomial', colorClass: 'bg-blue-100 text-blue-800 border-blue-200', hexColor: '#2563eb' },
      { symbol: 'x - c', name: 'Linear Divisor (test at x = c)', colorClass: 'bg-sky-100 text-sky-800 border-sky-200', hexColor: '#0284c7' },
      { symbol: 'Q(x)', name: 'Quotient Polynomial', colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200', hexColor: '#059669' },
      { symbol: 'R = P(c)', name: 'Remainder Constant', colorClass: 'bg-rose-100 text-rose-800 border-rose-200', hexColor: '#e11d48' },
    ],
    notes: 'If divisor is (ax - b), evaluate remainder at x = b/a (i.e., R = P(b/a)). A numerical substitution can check a proposed remainder; consult your selected calculator manual for its evaluation mode.',
    examinerTrap: 'Plugging in x = -c instead of x = +c when dividing by (x - c).',
    example: {
      problem: 'Find the remainder when P(x) = 2x^3 - 5x^2 + 4x - 7 is divided by x - 2',
      solution: 'R = P(2) = 2(2)^3 - 5(2)^2 + 4(2) - 7 = 16 - 20 + 8 - 7 = -3',
    },
  },
];

export const CATEGORIES = [
  { id: 'all', label: 'All Formulas (10)' },
  { id: 'quadratic', label: 'Quadratic & Roots' },
  { id: 'rational', label: 'Fractions & Decomposition' },
  { id: 'exponents-logs', label: 'Powers & Logarithms' },
  { id: 'progressions', label: 'Series & Progressions' },
  { id: 'systems-polynomials', label: 'Systems & Polynomials' },
] as const;

export const AlgebraFormulaModal: React.FC<AlgebraFormulaModalProps> = ({ isOpen, onClose }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [colorTheme, setColorTheme] = useState<FormulaColorTheme>('vivid');

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredFormulas = ALGEBRA_FORMULAS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    if (!matchesCategory) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.notes.toLowerCase().includes(q) ||
      item.categoryLabel.toLowerCase().includes(q) ||
      item.copyText.toLowerCase().includes(q) ||
      item.variables.some((v) => v.name.toLowerCase().includes(q) || v.symbol.toLowerCase().includes(q))
    );
  });

  return (
    <div
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="algebra-formula-title"
    >
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-linear-to-r from-slate-50 via-white to-blue-50/40">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0 app-artwork-tile">
                <AppArtwork name="exam" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 id="algebra-formula-title" className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                    Algebra High-Yield Formula Sheet
                  </h3>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100/80 text-blue-800 border border-blue-200">
                    <AppArtwork name="star" inline className="w-3 h-3 text-blue-600" />
                    PRC ECE Syllabus
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Semantic color-coded equations with variable anatomy & exam traps
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close formula sheet (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls Bar: Theme Selector & Quick Stats */}
          <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5">
            {/* Theme Toggle Group */}
            <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-slate-500" />
                <span>Color Style:</span>
              </span>

              <button
                type="button"
                onClick={() => setColorTheme('vivid')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  colorTheme === 'vivid'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Vivid semantic multi-color formula rendering"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-linear-to-tr from-blue-500 via-emerald-500 to-amber-500" />
                <span>Vivid Color</span>
              </button>

              <button
                type="button"
                onClick={() => setColorTheme('blueprint')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  colorTheme === 'blueprint'
                    ? 'bg-slate-900 text-cyan-300 shadow-xs border border-slate-800'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Deep dark blueprint chalkboard with neon symbols"
              >
                <Moon className="w-3 h-3 text-cyan-400" />
                <span>Blueprint</span>
              </button>

              <button
                type="button"
                onClick={() => setColorTheme('mono')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  colorTheme === 'mono'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Standard textbook monochrome black and white"
              >
                <Sun className="w-3 h-3 text-slate-600" />
                <span>Monochrome</span>
              </button>
            </div>

            {/* Quick Helper Tip */}
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{filteredFormulas.length} formulas displayed</span>
            </div>
          </div>

          {/* Search & Category Pills */}
          <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search formulas, variables (e.g. discriminant, roots, series)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder:text-slate-400 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100/90 hover:bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content List of Formula Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
          {filteredFormulas.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-semibold">No formulas found matching &quot;{searchQuery}&quot;</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredFormulas.map((item) => {
              const isCopied = copiedId === item.id;
              const latexString =
                colorTheme === 'vivid'
                  ? item.latexVivid
                  : colorTheme === 'blueprint'
                  ? item.latexBlueprint
                  : item.latexMono;

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 shadow-2xs ${
                    colorTheme === 'blueprint'
                      ? 'bg-slate-900 border-slate-800 text-slate-100 hover:border-cyan-700/60'
                      : `bg-white ${item.categoryAccent}`
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${item.categoryBadgeColor}`}>
                          {item.categoryLabel}
                        </span>
                        <h4
                          className={`font-bold text-sm sm:text-base tracking-tight ${
                            colorTheme === 'blueprint' ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {item.title}
                        </h4>
                      </div>
                    </div>

                    {/* Copy Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopy(item.id, item.copyText)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : colorTheme === 'blueprint'
                            ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                        title="Copy formula text to clipboard"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <AppArtwork name="cards" inline className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Math Formula Display Box */}
                  <div
                    className={`rounded-xl p-3 sm:p-4 my-3 text-center transition-colors overflow-x-auto ${
                      colorTheme === 'blueprint'
                        ? 'bg-slate-950/90 border border-cyan-900/60 shadow-inner text-cyan-100'
                        : colorTheme === 'vivid'
                        ? 'bg-white border border-slate-200/90 shadow-2xs'
                        : 'bg-white border border-slate-200 shadow-2xs'
                    }`}
                  >
                    <MathView math={latexString} block />
                  </div>

                  {/* Anatomy / Variable Legend Chips (When in Vivid or Blueprint mode) */}
                  {colorTheme !== 'mono' && item.variables.length > 0 && (
                    <div className="mb-3 space-y-1.5">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <AppArtwork name="cards" inline className="w-3 h-3" />
                        <span>Variable Anatomy Key:</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.variables.map((variable, idx) => (
                          <span
                            key={idx}
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border flex items-center gap-1.5 ${
                              colorTheme === 'blueprint'
                                ? 'bg-slate-800/80 text-slate-200 border-slate-700'
                                : variable.colorClass
                            }`}
                          >
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: variable.hexColor }}
                            />
                            <strong className="font-bold">{variable.symbol}:</strong>
                            <span>{variable.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes & Examiner Traps */}
                  <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
                    <p className={colorTheme === 'blueprint' ? 'text-slate-300' : 'text-slate-600'}>
                      {item.notes}
                    </p>

                    {item.examinerTrap && (
                      <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold text-amber-950">PRC Examiner Trap: </strong>
                          <span>{item.examinerTrap}</span>
                        </div>
                      </div>
                    )}

                    {/* Example Box */}
                    {item.example && (
                      <div
                        className={`p-2.5 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 border ${
                          colorTheme === 'blueprint'
                            ? 'bg-slate-800/60 border-slate-700 text-slate-300'
                            : 'bg-slate-50 border-slate-200/80 text-slate-700'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400 block sm:inline mr-2">
                            Quick Exam Test:
                          </span>
                          <span className="font-mono text-xs">{item.example.problem}</span>
                        </div>
                        <div className="font-mono text-[11px] text-blue-600 font-semibold bg-white px-2 py-1 rounded-md border border-slate-200/80 self-start sm:self-auto">
                          <MathView math={item.example.solution} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="text-[11px] text-slate-500 hidden sm:flex items-center gap-1.5">
            <AppArtwork name="bulb" inline className="w-3.5 h-3.5 text-amber-500" />
            <span>
              Tip: Switch to <strong>Vivid Color</strong> for quick visual recall during practice sessions.
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgebraFormulaModal;
