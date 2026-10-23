import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const file = path.join(root, 'src/data/algebraReferenceContent.ts');
const source = fs.readFileSync(file, 'utf8');

const failures = [];
const pass = (condition, message) => { if (!condition) failures.push(message); };

const expectedTopics = [
  'top-alg-fractions',
  'top-quadratics',
  'top-functions',
  'top-factoring',
  'top-polynomial-eq',
  'top-laws-exponents',
  'top-inequalities',
  'top-linear-eq',
  'top-absolute-value',
  'top-rational-radical-eqs',
  'top-logarithms',
  'top-simultaneous-linear',
  'top-complex-numbers',
  'top-arithmetic-seq',
  'top-geometric-seq',
  'top-binomial-theorem',
  'top-matrices',
  'top-partial-fractions',
  'top-word-problems',
  'top-inverse-functions',
  'top-polynomial-functions',
  'top-rational-functions',
  'top-harmonic-seq',
];
for (const topic of expectedTopics) {
  pass(source.includes(`'${topic}': {`), `Missing topic block: ${topic}`);
}

pass(!source.includes('chapter-level topic locator'), 'Unverified chapter-level source locator remains.');
pass(!source.includes('question sets in those chapters'), 'Unverified generic source locator remains.');
const verifiedSources = [...source.matchAll(/verificationStatus:\s*'verified-section-pages'\s*[,}]/g)].length;
pass(verifiedSources === 69, `Expected 69 verified source entries; found ${verifiedSources}.`);

const misconceptionIds = new Set([...source.matchAll(/id:\s*'([A-Z][A-Z0-9_]+)'/g)].map((m) => m[1]));
const questionLines = source.split(/\r?\n/).filter((line) => line.includes("{ id: 'q-"));
const questionIds = [];
const questions = new Map();
for (const line of questionLines) {
  const id = line.match(/id:\s*'([^']+)'/)?.[1];
  const optionsText = line.match(/options:\s*\[(.*)\], correctIndex:/)?.[1];
  const correctIndexText = line.match(/correctIndex:\s*(\d+)/)?.[1];
  if (!id || optionsText == null || correctIndexText == null) {
    failures.push(`Could not parse practice question line: ${line.trim().slice(0, 100)}...`);
    continue;
  }
  const options = [...optionsText.matchAll(/'([^']*)'/g)].map((m) => m[1]);
  const correctIndex = Number(correctIndexText);
  pass(options.length >= 4, `${id}: expected at least 4 options; found ${options.length}.`);
  pass(correctIndex >= 0 && correctIndex < options.length, `${id}: correctIndex ${correctIndex} is out of range.`);
  const misconceptionId = line.match(/misconceptionId:\s*'([^']+)'/)?.[1];
  if (misconceptionId) pass(misconceptionIds.has(misconceptionId), `${id}: unknown misconceptionId ${misconceptionId}.`);
  questionIds.push(id);
  questions.set(id, { options, correctIndex });
}
pass(new Set(questionIds).size === questionIds.length, 'Duplicate practice question IDs found.');
pass(questionIds.length === 260, `Expected 260 reference-screen practice questions; found ${questionIds.length}.`);

// Independent answer-audit manifest. These were re-solved during v10.4.1 rather than copied
// from the stored correctIndex values. The validator confirms the keyed option still matches
// the audited answer after future edits.
const auditedAnswers = {
  'q-quad-1': 'x=3 or 4',
  'q-quad-2': 'x=8 or −4',
  'q-quad-3': 'Two nonreal complex roots',
  'q-quad-4': 'x=2 or −1/2',
  'q-quad-5': 'Square-root method',
  'q-quad-6': 'I=2 A or 3 A',
  'q-func-1': '{(1,2),(1,3),(2,4)}',
  'q-func-2': '10',
  'q-func-3': 'x≠4',
  'q-func-4': '14',
  'q-func-5': '4',
  'q-func-6': '1.00 V',
  'q-fac-1': '8x(x−2)(x+2)',
  'q-fac-2': '(2x+1)(x+3)',
  'q-fac-3': '(x+2)(x−3)(x+3)',
  'q-fac-4': '(x−3)(x²+3x+9)',
  'q-fac-5': '(x−1)(x+1)(x−2)(x+2)',
  'q-fac-6': '(s−5)(s+5)',
  'q-poly-1': '3x²+2x−3',
  'q-poly-2': '2x²+5x−12',
  'q-poly-3': '9',
  'q-poly-4': '6',
  'q-poly-5': '−3',
  'q-poly-6': '13',
  'q-exp-1': 'x²/y⁴',
  'q-exp-2': '6√2',
  'q-exp-3': 'x²',
  'q-exp-4': '7√3',
  'q-exp-5': 'x≥3',
  'q-exp-6': '18',
  'q-ineq-1': 'x<−2',
  'q-ineq-2': '−2<x<4',
  'q-ineq-3': '[−1,2]',
  'q-ineq-4': '(−∞,−2)∪(1,∞)',
  'q-ineq-5': '[−1,3)',
  'q-ineq-6': '4.5≤V≤5.5',
  'q-lin-1': 'x=10',
  'q-lin-2': 'x=11',
  'q-lin-3': 'x=26/5',
  'q-lin-4': '(A−P)/(Pt)',
  'q-lin-5': 'All real numbers',
  'q-lin-6': '4 A',
  'q-abs-1': 'x=−2 or 10',
  'q-abs-2': '−3≤x≤2',
  'q-abs-3': 'x<−1 or x>5',
  'q-abs-4': 'No real solution',
  'q-abs-5': '4.75≤V≤5.25',
  'q-abs-6': 'x<−5 or x>−1',
  'q-rreq-1': 'x=3',
  'q-rreq-2': 'x=±√2',
  'q-rreq-3': 'x=8',
  'q-rreq-4': 'x=3 only',
  'q-rreq-5': 'x=9',
  'q-rreq-6': '12 Ω',
  'q-log-1': 'x=3',
  'q-log-2': '3',
  'q-log-3': '−2',
  'q-log-4': '5',
  'q-log-5': 'x=10',
  'q-log-6': '20 dB',
  'q-sys-1': '(4,3)',
  'q-sys-2': 'Infinitely many solutions',
  'q-sys-3': '(3,1)',
  'q-sys-4': '−5',
  'q-sys-5': '(2,3)',
  'q-sys-6': '(3,2,1)',
  'q-sys-7': '(3,4) and (−3,4)',
  'q-sys-8': 'I₁=2 A, I₂=1 A',
  'q-sys-9': 'No solution',
  'q-sys-10': 'Cramer’s unique-solution ratios cannot be used',
  'q-cx-1': 'i',
  'q-cx-2': '4−3i',
  'q-cx-3': '8−i',
  'q-cx-4': '−2/5+(11/5)i',
  'q-cx-5': '−3−4i',
  'q-cx-6': 'x=±2i',
  'q-cx-7': '7i',
  'q-cx-8': '−2i',
  'q-cx-9': '5+j3',
  'q-cx-10': '29',
  'q-ap-1': '4',
  'q-ap-2': '47',
  'q-ap-3': '4',
  'q-ap-4': '14',
  'q-ap-5': '210',
  'q-ap-6': '315',
  'q-ap-7': '6',
  'q-ap-8': '10th',
  'q-ap-9': '4.25 V',
  'q-ap-10': '7',
  'q-gp-1': '3',
  'q-gp-2': '640',
  'q-gp-3': '45',
  'q-gp-4': '728',
  'q-gp-5': '16',
  'q-gp-6': 'Yes',
  'q-gp-7': '10',
  'q-gp-8': '3',
  'q-gp-9': '6.25',
  'q-gp-10': '1/3',
  'q-bin-1': '21',
  'q-bin-2': '9',
  'q-bin-3': '10',
  'q-bin-4': '15a⁴b²',
  'q-bin-5': '24',
  'q-bin-6': '243',
  'q-bin-7': 'x³−3x²+3x−1',
  'q-bin-8': '60x²y⁴',
  'q-bin-9': '32',
  'q-bin-10': '3',
  'q-quad-7': '5/2',
  'q-quad-8': '10',
  'q-quad-9': 'x=1 or 5',
  'q-quad-10': '1 A or 4 A',
  'q-func-7': '19',
  'q-func-8': '(x+6)/3',
  'q-func-9': 'x≤5',
  'q-func-10': '−1',
  'q-fac-7': '3x²(2x−3)',
  'q-fac-8': '(x−5)²',
  'q-fac-9': '(x+3)(x²−3x+9)',
  'q-fac-10': '(2x+3)(x−2)',
  'q-poly-7': '4',
  'q-poly-8': '−5',
  'q-poly-9': 'x²+2x+4',
  'q-poly-10': '2',
  'q-exp-7': 'x⁶/y⁴',
  'q-exp-8': '6√2',
  'q-exp-9': '9',
  'q-exp-10': '√5',
  'q-ineq-7': 'x≥4',
  'q-ineq-8': 'x>−4',
  'q-ineq-9': '[−1,2]',
  'q-ineq-10': 'x<1 or x>7',
  'q-lin-7': 'x=7',
  'q-lin-8': 'x=12',
  'q-lin-9': 'I=V/R',
  'q-lin-10': 'All real numbers',
  'q-abs-7': 'x=4 or −3',
  'q-abs-8': '−5<x<3',
  'q-abs-9': 'x≤−4 or x≥4',
  'q-abs-10': 'No real solution',
  'q-rreq-7': 'x=2',
  'q-rreq-8': 'x=24',
  'q-rreq-9': 'x=3 only',
  'q-rreq-10': 'x=3',
  'q-log-7': '5',
  'q-log-8': 'x=e²',
  'q-log-9': 'x=100',
  'q-log-10': 't=ln2',
  'q-mat-1': '2×3',
  'q-mat-2': '[[3,3],[3,9]]',
  'q-mat-3': '[[6,−3],[0,12]]',
  'q-mat-4': '11',
  'q-mat-5': '2×4',
  'q-mat-6': '7',
  'q-mat-7': 'det(A)≠0',
  'q-mat-8': '[[1/2,0],[0,1/4]]',
  'q-mat-9': '[[2,3|7],[1,−1|4]]',
  'q-mat-10': '[4,2]ᵀ',
  'q-pf-1': '(x+1)/(x²+3)',
  'q-pf-2': 'A/(x−1)+B/(x+2)',
  'q-pf-3': 'A/x+B/(x−1)+C/(x−1)²',
  'q-pf-4': 'Ax+B',
  'q-pf-5': 'A=3, B=2',
  'q-pf-6': '4/(x−1)−1/(x+1)',
  'q-pf-7': 'Polynomial division',
  'q-pf-8': 'A/x+(Bx+C)/(x²+1)',
  'q-pf-9': '(1/2)/s−(1/2)/(s+2)',
  'q-pf-10': '4',
  'q-wp-1': '3 h',
  'q-wp-2': '8 L',
  'q-wp-3': '2 h',
  'q-wp-4': '12',
  'q-wp-5': '150',
  'q-wp-6': '₱600',
  'q-wp-7': '300 km',
  'q-wp-8': '6 by 12',
  'q-wp-9': '20',
  'q-wp-10': '3 A',
  'q-quad-11': '5/2',
  'q-quad-12': '−1/3',
  'q-quad-13': '0',
  'q-quad-14': 'x=1 or 7',
  'q-quad-15': '16',
  'q-func-11': '2',
  'q-func-12': 'y=3x−2',
  'q-func-13': '−1/2',
  'q-func-14': '3 units right',
  'q-func-15': 'Reflection across the x-axis',
  'q-lin-11': 'x=5',
  'q-lin-12': 'x=9',
  'q-lin-13': 'x=27/5',
  'q-lin-14': 'V=P/I',
  'q-lin-15': 'All real numbers',
  'q-rreq-11': 'x=6',
  'q-rreq-12': 'x=6',
  'q-rreq-13': 'x=15',
  'q-rreq-14': 'x=−2',
  'q-rreq-15': 'x²+6x+9',
  'q-log-11': 'log_b M+log_b N',
  'q-log-12': 'ln7/ln2',
  'q-log-13': 'x>4',
  'q-log-14': 'x=3',
  'q-log-15': '20 dB',
  'q-sys-11': '(4,3)',
  'q-sys-12': 'No solution',
  'q-sys-13': '−3',
  'q-sys-14': '3',
  'q-sys-15': 'I₁=3 A, I₂=2 A',
  'q-mat-11': '2×4',
  'q-mat-12': '5',
  'q-mat-13': '[[1,2],[2,4]]',
  'q-mat-14': '11',
  'q-mat-15': '2×1',
  'q-pf-11': 'A/(x−2)+B/(x+3)',
  'q-pf-12': 'A/(x−1)+B/(x−1)²+C/(x−1)³',
  'q-pf-13': 'Ax+B',
  'q-pf-14': 'Polynomial division',
  'q-pf-15': '1',
  'q-inv-1': '8',
  'q-inv-2': '(x+5)/4',
  'q-inv-3': 'f(x)=x³',
  'q-inv-4': 'x',
  'q-inv-5': '[2,∞)',
  'q-inv-6': 'y=x',
  'q-inv-7': '1',
  'q-inv-8': '16',
  'q-inv-9': '√x',
  'q-inv-10': 'T=(V−0.50)/0.02',
  'q-pfun-1': '5',
  'q-pfun-2': 'x−3',
  'q-pfun-3': 'x²−5x+6',
  'q-pfun-4': '3/2',
  'q-pfun-5': 'The graph touches and turns',
  'q-pfun-6': 'f(x)→−∞ as x→∞',
  'q-pfun-7': '−5',
  'q-pfun-8': '3',
  'q-pfun-9': '−2',
  'q-pfun-10': '−2 and −3',
  'q-rfun-1': 'x=±3',
  'q-rfun-2': 'A hole',
  'q-rfun-3': 'x=4',
  'q-rfun-4': 'y=0',
  'q-rfun-5': 'y=3/2',
  'q-rfun-6': 'x=5',
  'q-rfun-7': '2/3',
  'q-rfun-8': 'Slant (oblique)',
  'q-rfun-9': 'The value is 1 for x≠3',
  'q-rfun-10': 's=−5',
  'q-hp-1': '6',
  'q-hp-2': '1/2, 1/5, 1/8',
  'q-hp-3': '4',
  'q-hp-4': '1/6',
  'q-hp-5': '6.4',
  'q-hp-6': '0',
  'q-hp-7': 'Yes',
  'q-hp-8': '12',
  'q-hp-9': 'H<G<A',
  'q-hp-10': '6 units/s',
};

for (const [id, expected] of Object.entries(auditedAnswers)) {
  const q = questions.get(id);
  pass(Boolean(q), `Audited question missing: ${id}`);
  if (q) pass(q.options[q.correctIndex] === expected, `${id}: keyed answer "${q.options[q.correctIndex]}" does not match audited answer "${expected}".`);
}
pass(Object.keys(auditedAnswers).length === questionIds.length, 'Answer-audit manifest does not cover every reference-screen question.');

// LaTeX commands in TypeScript string literals must use escaped backslashes. A
// single source backslash such as '\frac' is consumed by JavaScript and renders
// as 'frac'; allow only explicit Unicode escapes of the form \uXXXX.
for (const [index, line] of source.split(/\r?\n/).entries()) {
  const match = line.match(/formula:\s*'([^']*)'/);
  if (!match) continue;
  const value = match[1];
  for (let i = 0; i < value.length;) {
    if (value[i] !== '\\') { i += 1; continue; }
    let j = i;
    while (j < value.length && value[j] === '\\') j += 1;
    const runLength = j - i;
    const unicodeEscape = runLength === 1 && /^u[0-9a-fA-F]{4}/.test(value.slice(j, j + 5));
    pass(runLength % 2 === 0 || unicodeEscape, `Unescaped LaTeX backslash in formula string at line ${index + 1}.`);
    i = j;
  }
}

// Specific integrity regressions discovered and fixed in v10.4.1.
pass(!source.includes("'(x+2)(x²−9)'"), 'q-fac-3 still contains an equivalent second correct answer.');
pass(!source.includes("'(x²−1)(x²−4) only'"), 'q-fac-5 still contains an ambiguous mathematically equivalent distractor.');
pass(!source.includes("Over the real numbers, a sum of two positive squares is irreducible."), 'Overbroad sum-of-squares statement remains.');

if (failures.length) {
  console.error(`Algebra reference validation FAILED (${failures.length} issue${failures.length === 1 ? '' : 's'}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Algebra reference validation PASS`);
console.log(`- topics: ${expectedTopics.length}`);
console.log(`- verified source entries: ${verifiedSources}`);
console.log(`- audited reference-screen questions: ${questionIds.length}`);
console.log(`- misconception references: valid`);
console.log(`- formula-string escaping: valid`);
console.log(`- known ambiguity regressions: absent`);
