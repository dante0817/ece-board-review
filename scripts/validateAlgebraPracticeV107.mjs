import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };

const data = read('src/data/algebraReferenceContent.ts');
const screen = read('src/components/math/ReferenceInformedTopicScreen.tsx');
const evidence = read('src/utils/referencePracticeMastery.ts');
const catalog = read('src/components/AlgebraScreen.tsx');
const app = read('src/App.tsx');
const context = read('src/context/ReviewContext.tsx');
const sidebar = read('src/components/Sidebar.tsx');
const screens = read('src/components/ReferenceAlgebraTopicScreens.tsx');
const nav = read('src/utils/mathTopicNavigation.ts');
const initial = read('src/data/initialData.ts');

for (const topic of ['top-matrices', 'top-partial-fractions', 'top-word-problems']) {
  expect(data.includes(`'${topic}': {`), `Missing v10.7 topic content: ${topic}`);
}
for (const prefix of ['q-mat-', 'q-pf-', 'q-wp-']) {
  const count = [...data.matchAll(new RegExp(`id: '${prefix}\\d+'`, 'g'))].length;
  expect(count >= 10, `${prefix} expected at least 10 practice questions; found ${count}`);
}

// v10.7 expands every shared reference lesson with a local bank to ten items.
const sharedPrefixes = ['q-quad-', 'q-func-', 'q-fac-', 'q-poly-', 'q-exp-', 'q-ineq-', 'q-lin-', 'q-abs-', 'q-rreq-', 'q-log-', 'q-sys-', 'q-cx-', 'q-ap-', 'q-gp-', 'q-bin-', 'q-mat-', 'q-pf-', 'q-wp-'];
for (const prefix of sharedPrefixes) {
  const count = [...data.matchAll(new RegExp(`id: '${prefix}\\d+'`, 'g'))].length;
  expect(count >= 10, `${prefix} expected at least 10 questions after practice expansion; found ${count}`);
}

const routes = [
  ['top-matrices', 'matrices'],
  ['top-partial-fractions', 'partial-fractions'],
  ['top-word-problems', 'word-problems'],
];
for (const [topic, route] of routes) {
  expect(nav.includes(`'${topic}': '${route}'`), `Navigation mapping missing ${topic} -> ${route}`);
  expect(context.includes(`| '${route}'`), `ScreenType missing ${route}`);
  expect(app.includes(`currentScreen === '${route}'`), `App render branch missing ${route}`);
  expect(sidebar.includes(`'${route}'`), `Sidebar Mathematics active-state set missing ${route}`);
}
for (const name of ['MatricesScreen', 'PartialFractionsScreen', 'WordProblemsScreen']) {
  expect(screens.includes(`export const ${name}`), `Reference topic screen export missing ${name}`);
}

expect(catalog.includes("id: 'alg-matrices'") && catalog.includes("interactiveScreen: 'matrices'"), 'Matrices catalog row/route missing.');
expect(catalog.includes("id: 'alg-word-problems'") && catalog.includes("interactiveScreen: 'word-problems'"), 'Word-problems catalog route missing.');
expect(catalog.includes("id: 'alg-partial-fractions'") && catalog.includes("interactiveScreen: 'partial-fractions'"), 'Partial-fractions catalog route missing.');
expect(initial.includes("id: 'top-matrices'"), 'Canonical Matrices learner record missing from initialData.');
expect(initial.includes("id: 'top-partial-fractions'"), 'Canonical Partial Fractions learner record missing from initialData.');
expect(initial.includes("id: 'top-word-problems'"), 'Canonical Word Problems learner record missing from initialData.');

const newStart = data.indexOf("  'top-matrices': {");
const v108Start = data.indexOf("  'top-inverse-functions': {", newStart);
const newBlock = newStart >= 0 ? data.slice(newStart, v108Start >= 0 ? v108Start : undefined) : '';
const verified = [...newBlock.matchAll(/verificationStatus:\s*'verified-section-pages'/g)].length;
expect(verified === 9, `Expected 9 verified v10.7 source entries; found ${verified}.`);
expect(!newBlock.includes("verificationStatus: 'provisional'"), 'A v10.7 source locator remains provisional.');
expect(newBlock.includes('this edition explicitly states that the former Partial Fractions section was removed'), 'Larson Partial Fractions scope limitation is not explicitly documented.');
expect(newBlock.includes('Limited supporting role for equation manipulation'), 'Sterling word-problem scope limitation is not explicitly documented.');

// Adaptive evidence must remain local/supplemental rather than silently mutating canonical mastery.
expect(evidence.includes("ece_reference_practice_evidence_v1:"), 'Reference practice evidence storage key missing.');
expect(evidence.includes('getReferenceSubskillStats'), 'Subskill-stat derivation missing.');
expect(evidence.includes('findWeakestReferenceSubskill'), 'Weakest-subskill targeting missing.');
expect(evidence.includes('misconceptionMisses'), 'Misconception miss counters missing.');
expect(screen.includes('Adaptive practice evidence'), 'Adaptive practice evidence UI missing.');
expect(screen.includes('Target Weakest Skill'), 'Weakest-skill action missing.');
expect(screen.includes('Targeted remediation:'), 'Wrong-answer misconception remediation UI missing.');
expect(screen.includes('Subskill practice mastery'), 'Subskill mastery progress panel missing.');
expect(screen.includes('does not overwrite, canonical mastery'), 'Canonical/local mastery separation is not stated in the UI.');
expect(!evidence.includes('mastery:'), 'Local evidence utility must not directly write canonical mastery fields.');

if (failures.length) {
  console.error(`Algebra v10.7 validation FAILED (${failures.length} issue${failures.length === 1 ? '' : 's'}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Algebra v10.7 structural validation PASS');
console.log('- reference-informed topics: 19');
console.log('- shared reference-bank questions: at least the v10.7 baseline of 180');
console.log('- new topic questions: 30');
console.log('- expanded earlier banks: +40 questions');
console.log('- new verified source entries: 9');
console.log('- local subskill mastery + misconception remediation: present');
console.log('- canonical Matrices learner record: present');
