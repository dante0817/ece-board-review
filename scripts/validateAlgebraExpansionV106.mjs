import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };

const data = read('src/data/algebraReferenceContent.ts');
const catalog = read('src/components/AlgebraScreen.tsx');
const app = read('src/App.tsx');
const context = read('src/context/ReviewContext.tsx');
const sidebar = read('src/components/Sidebar.tsx');
const screens = read('src/components/ReferenceAlgebraTopicScreens.tsx');
const nav = read('src/utils/mathTopicNavigation.ts');
const initial = read('src/data/initialData.ts');
const migration = read('src/utils/curriculumMigration.ts');
const mock = read('src/data/mockExamQuestions.ts');
const roadmap = read('src/data/prerequisiteRoadmapData.ts');
const roadmapTree = read('src/components/SubjectRoadmapTree.tsx');

const newTopics = [
  'top-simultaneous-linear',
  'top-complex-numbers',
  'top-arithmetic-seq',
  'top-geometric-seq',
  'top-binomial-theorem',
];
for (const topic of newTopics) expect(data.includes(`'${topic}': {`), `Missing v10.6 topic content: ${topic}`);

for (const prefix of ['q-sys-', 'q-cx-', 'q-ap-', 'q-gp-', 'q-bin-']) {
  const count = [...data.matchAll(new RegExp(`id: '${prefix}\\d+'`, 'g'))].length;
  expect(count >= 10, `${prefix} expected at least 10 practice questions; found ${count}`);
}

const routes = [
  ['top-simultaneous-linear', 'systems-equations'],
  ['top-complex-numbers', 'complex-numbers'],
  ['top-arithmetic-seq', 'arithmetic-progressions'],
  ['top-geometric-seq', 'geometric-progressions'],
  ['top-binomial-theorem', 'binomial-theorem'],
];
for (const [topic, screen] of routes) {
  expect(nav.includes(`'${topic}': '${screen}'`), `Navigation mapping missing ${topic} -> ${screen}`);
  expect(context.includes(`| '${screen}'`), `ScreenType missing ${screen}`);
  expect(app.includes(`currentScreen === '${screen}'`), `App render branch missing ${screen}`);
  expect(sidebar.includes(`'${screen}'`), `Sidebar Mathematics descendant set missing ${screen}`);
}

expect(catalog.includes("id: 'alg-linear-systems'") && catalog.includes("interactiveScreen: 'systems-equations'"), 'Systems catalog route missing.');
expect(catalog.includes("id: 'alg-complex-numbers'") && catalog.includes("interactiveScreen: 'complex-numbers'"), 'Complex Numbers catalog row/route missing.');
expect(catalog.includes("id: 'alg-arithmetic-prog'") && catalog.includes("interactiveScreen: 'arithmetic-progressions'"), 'Arithmetic progression route missing.');
expect(catalog.includes("id: 'alg-geometric-prog'") && catalog.includes("interactiveScreen: 'geometric-progressions'"), 'Geometric progression route missing.');
expect(catalog.includes("id: 'alg-binomial-theorem'") && catalog.includes("interactiveScreen: 'binomial-theorem'"), 'Binomial theorem route missing.');

for (const exportName of ['SystemsEquationsScreen', 'ComplexNumbersScreen', 'ArithmeticProgressionsScreen', 'GeometricProgressionsScreen', 'BinomialTheoremScreen']) {
  expect(screens.includes(`export const ${exportName}`), `Screen export missing: ${exportName}`);
}

expect(initial.includes("id: 'top-binomial-theorem'"), 'Canonical Binomial Theorem topic missing from current curriculum.');
expect(initial.includes("id: 'top-complex-numbers'"), 'Canonical Complex Numbers topic missing from current curriculum.');
expect(initial.includes("canonicalIndex: 28") && initial.includes("id: 'top-partial-fractions'"), 'Stage-4 canonical indexes were not extended for the restored topics.');

for (const alias of ["'top-radicals-rational-exp': 'top-laws-exponents'", "'top-linear-systems': 'top-simultaneous-linear'", "'top-quadratic-eq': 'top-quadratics'", "'top-arithmetic-prog': 'top-arithmetic-seq'", "'top-arithmetic-series': 'top-arithmetic-seq'", "'top-geometric-series': 'top-geometric-seq'", "'top-infinite-series': 'top-geometric-seq'", "'top-binomial-exp': 'top-binomial-theorem'"]) {
  expect(migration.includes(alias), `Legacy curriculum alias missing: ${alias}`);
}

expect(mock.includes("id: 'mock-q-03'") && mock.includes("topicId: 'top-binomial-theorem'"), 'Mock q03 is not mapped to the canonical binomial topic.');
const mockQ03 = mock.slice(mock.indexOf("id: 'mock-q-03'"), mock.indexOf("id: 'mock-q-04'"));
expect(mockQ03.includes("correctOptionId: 'A'"), 'Mock q03 known answer-key bug is not fixed to option A (672).');
expect(mockQ03.includes('Therefore the coefficient is 672'), 'Mock q03 explanation does not end with the verified coefficient 672.');
expect(!mock.includes("topicId: 'top-arithmetic-prog'"), 'Legacy arithmetic progression topic ID remains in mock bank.');
expect(!mock.includes("topicId: 'top-binomial-exp'"), 'Legacy binomial topic ID remains in mock bank.');
expect(!mock.includes("topicId: 'top-quadratic-eq'"), 'Legacy quadratic topic ID remains in mock bank.');

expect(roadmap.includes("id: 'top-simultaneous-linear'"), 'Roadmap is not linked to canonical Systems topic.');
expect(roadmap.includes("id: 'top-quadratics'"), 'Roadmap is not linked to canonical Quadratics topic.');
expect(roadmap.includes("id: 'top-arithmetic-seq'"), 'Roadmap is not linked to canonical Arithmetic Sequence topic.');
expect(roadmap.includes("id: 'top-binomial-theorem'"), 'Roadmap is not linked to canonical Binomial topic.');
expect(roadmap.includes("id: 'top-radicals-rational-exp'") && roadmap.includes("canonicalTopicId: 'top-laws-exponents'"), 'Granular Radicals roadmap node is not linked to canonical Exponents/Radicals learner state.');
expect(roadmapTree.includes('node.canonicalTopicId ?? node.id'), 'Roadmap tree does not resolve canonical learner-topic aliases.');
expect(migration.includes('LEGACY_TOPIC_ALIASES[topic.id] ?? topic.id'), 'Saved-subject migration does not suppress legacy alias duplicates.');

const newStart = data.indexOf("  'top-simultaneous-linear': {");
const v107Start = data.indexOf("  'top-matrices': {", newStart);
const newBlock = newStart >= 0 ? data.slice(newStart, v107Start >= 0 ? v107Start : undefined) : '';
const verified = [...newBlock.matchAll(/verificationStatus:\s*'verified-section-pages'/g)].length;
expect(verified === 15, `Expected 15 verified v10.6 source entries; found ${verified}.`);
expect(!newBlock.includes("verificationStatus: 'provisional'"), 'A v10.6 source locator is still provisional.');
expect(newBlock.includes('Polar conversion and De Moivre’s theorem should be added later'), 'Complex-number scope boundary is not documented.');

if (failures.length) {
  console.error(`Algebra v10.6 structural validation FAILED (${failures.length} issue${failures.length === 1 ? '' : 's'}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Algebra v10.6 structural validation PASS');
console.log('- expansion topics: 5');
console.log('- new practice questions: 50');
console.log('- verified new source entries: 15');
console.log('- canonical curriculum restorations: Complex Numbers + Binomial Theorem');
console.log('- legacy Algebra IDs: migrated without duplicate saved-topic rows');
console.log('- prerequisite roadmap: canonical learner-topic links verified');
console.log('- known mock-q-03 answer key: corrected to 672 (A)');
