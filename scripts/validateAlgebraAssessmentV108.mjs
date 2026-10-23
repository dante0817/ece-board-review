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
const evidence = read('src/utils/referencePracticeMastery.ts');
const lesson = read('src/components/math/ReferenceInformedTopicScreen.tsx');
const mock = read('src/data/mockExamQuestions.ts');
const timedMock = read('src/components/TimedMockExam.tsx');

const newTopics = [
  'top-inverse-functions',
  'top-polynomial-functions',
  'top-rational-functions',
  'top-harmonic-seq',
];
for (const topic of newTopics) {
  expect(data.includes(`'${topic}': {`), `Missing v10.8 topic content: ${topic}`);
  expect(initial.includes(`id: '${topic}'`), `Canonical learner record missing: ${topic}`);
}

for (const prefix of ['q-inv-', 'q-pfun-', 'q-rfun-', 'q-hp-']) {
  const count = [...data.matchAll(new RegExp(`id: '${prefix}\\d+'`, 'g'))].length;
  expect(count === 10, `${prefix} expected 10 questions; found ${count}`);
}
for (const prefix of ['q-quad-', 'q-func-', 'q-lin-', 'q-rreq-', 'q-log-', 'q-sys-', 'q-mat-', 'q-pf-']) {
  const count = [...data.matchAll(new RegExp(`id: '${prefix}\\d+'`, 'g'))].length;
  expect(count === 15, `${prefix} expected 15 high-priority questions; found ${count}`);
}
const allQuestionCount = [...data.matchAll(/\{ id: 'q-/g)].length;
expect(allQuestionCount === 260, `Expected 260 shared reference questions; found ${allQuestionCount}.`);

const v108Start = data.indexOf("  'top-inverse-functions': {");
const v108Block = v108Start >= 0 ? data.slice(v108Start) : '';
const newVerified = [...v108Block.matchAll(/verificationStatus:\s*'verified-section-pages'/g)].length;
expect(newVerified === 12, `Expected 12 verified v10.8 source entries; found ${newVerified}.`);
expect(!v108Block.includes("verificationStatus: 'provisional'"), 'A v10.8 source locator remains provisional.');
expect(v108Block.includes('approved books do not provide a full standalone harmonic-progression chapter'), 'Harmonic source limitation is not stated.');
expect(v108Block.includes('Reference-summary support only'), 'Larson harmonic support is not explicitly limited to its reference summary.');
expect(v108Block.includes('Used to document the source gap'), 'Sterling harmonic scope gap is not documented.');

const routes = [
  ['top-inverse-functions', 'inverse-functions', 'InverseFunctionsScreen'],
  ['top-polynomial-functions', 'polynomial-functions', 'PolynomialFunctionsScreen'],
  ['top-rational-functions', 'rational-functions', 'RationalFunctionsScreen'],
  ['top-harmonic-seq', 'harmonic-progressions', 'HarmonicProgressionsScreen'],
];
for (const [topic, route, exportName] of routes) {
  expect(nav.includes(`'${topic}': '${route}'`), `Navigation mapping missing ${topic} -> ${route}`);
  expect(context.includes(`| '${route}'`), `ScreenType missing ${route}`);
  expect(app.includes(`currentScreen === '${route}'`), `App render branch missing ${route}`);
  expect(sidebar.includes(`'${route}'`), `Sidebar Mathematics descendant set missing ${route}`);
  expect(screens.includes(`export const ${exportName}`), `Reference topic screen export missing ${exportName}`);
}

// Every Algebra catalog row should now open a working learning surface.
const topicBlocks = [...catalog.matchAll(/\{\n\s*id: '(alg-[^']+)'([\s\S]*?)\n\s*\},/g)];
const missingRoutes = topicBlocks
  .filter((match) => !/interactiveScreen:\s*'[^']+'/.test(match[0]))
  .map((match) => match[1]);
expect(missingRoutes.length === 0, `Algebra catalog rows still lack interactive routes: ${missingRoutes.join(', ')}`);
expect(catalog.includes("'alg-quadratic-ineq': 'top-inequalities'"), 'Quadratic/rational sign-chart row is not aligned with the inequalities canonical mastery record.');
expect(catalog.includes("id: 'alg-signed-numbers'") && catalog.includes("interactiveScreen: 'real-numbers'"), 'Signed Numbers row is not routed to a working fundamentals lesson.');

// Supplemental evidence may guide next actions, but it must not silently mutate canonical mastery.
expect(evidence.includes('getReferenceAssessmentReadiness'), 'Assessment-readiness derivation is missing.');
expect(evidence.includes("status: 'No evidence'"), 'No-evidence assessment state is missing.');
expect(evidence.includes("status: 'Ready for quiz'"), 'Ready-for-quiz assessment state is missing.');
expect(lesson.includes('assessmentReadiness.canTakeAssessment'), 'Lesson primary action is not gated by local assessment readiness.');
expect(lesson.includes('Local evidence changes the recommended next action only'), 'Canonical/local mastery separation is not explicit in the lesson UI.');
expect(lesson.includes('Take Mastery Quiz'), 'Assessment-ready primary action is missing.');
expect(!evidence.includes('mastery:'), 'Supplemental practice-evidence utility must not directly write canonical mastery.');

// Reference-informed timed-assessment pool.
const practiceLines = data.split(/\r?\n/).filter((line) => line.includes("{ id: 'q-"));
const eligibleReferenceQuestions = practiceLines.filter((line) => !line.includes("difficulty: 'Foundation'"));
expect(eligibleReferenceQuestions.length === 203, `Expected 203 non-Foundation reference assessment items; found ${eligibleReferenceQuestions.length}.`);
expect(mock.includes('ALGEBRA_REFERENCE_ASSESSMENT_QUESTIONS'), 'Reference assessment pool export missing.');
expect(mock.includes(".filter((question) => question.difficulty !== 'Foundation')"), 'Foundation practice items are not excluded from timed assessment.');
expect(mock.includes('rotateAssessmentOptions'), 'Deterministic option rotation is missing from generated assessment items.');
expect(mock.includes('getAvailableMockQuestionCount'), 'Unique-question availability helper is missing.');
expect(!mock.includes('-repeat-'), 'Mock generator still creates repeat-ID clones.');
expect(!mock.includes('[Part II Diagnostic]'), 'Mock generator still labels cycled duplicate questions.');
expect(!mock.includes('while (result.length < count)'), 'Mock generator still cycles questions to force the target count.');
expect(mock.includes('const fillerNeeded = target - base.length'), 'Comprehensive unique-filler policy is missing.');
expect(mock.includes('return [...base, ...filler]'), 'Comprehensive mock does not append unique reference filler as designed.');

// Timed Mock UI must disclose availability and cap rather than repeat questions.
expect(timedMock.includes('Question-bank integrity'), 'Timed Mock setup lacks the question-bank integrity disclosure.');
expect(timedMock.includes('does not clone or cycle questions'), 'Timed Mock setup does not explain the no-duplication policy.');
expect(timedMock.includes('effectiveQuestionCount'), 'Timed Mock setup does not cap requested count to unique availability.');
expect(timedMock.includes('UNIQUE QUESTIONS'), 'Timed Mock start button does not display the effective unique count.');

// Algebra base mock regression audit: source-scope and canonical topic IDs.
const q03 = mock.slice(mock.indexOf("id: 'mock-q-03'"), mock.indexOf("id: 'mock-q-04'"));
expect(q03.includes("correctOptionId: 'A'"), 'Mock q03 coefficient key regressed from verified answer 672 (A).');
expect(q03.includes("text: '672'"), 'Mock q03 verified coefficient 672 is missing.');
const q05 = mock.slice(mock.indexOf("id: 'mock-q-05'"), mock.indexOf("id: 'mock-q-06'"));
expect(q05.includes("text: '11 - 10i'"), 'Mock q05 rectangular complex-number answer is missing.');
expect(!q05.includes("De Moivre"), 'Mock q05 still depends on De Moivre/polar scope outside the approved Algebra reference lesson.');
const q32 = mock.slice(mock.indexOf("id: 'mock-q-32'"), mock.indexOf("id: 'mock-q-33'"));
expect(q32.includes("topicId: 'top-word-problems'"), 'Mock q32 is not mapped to the canonical Word Problems topic.');

// All curated Algebra mock topic IDs must resolve to canonical curriculum entries.
const baseMock = mock.slice(0, mock.indexOf('];\n\n/**\n * Reference-informed'));
const algebraBlocks = [...baseMock.matchAll(/\{\n\s*id: '(mock-q-\d+)'([\s\S]*?)\n\s*\},/g)]
  .filter((match) => match[0].includes("subjectId: 'subj-math-algebra'"));
for (const match of algebraBlocks) {
  const topicId = match[0].match(/topicId:\s*'([^']+)'/)?.[1];
  expect(Boolean(topicId) && initial.includes(`id: '${topicId}'`), `${match[1]} references noncanonical Algebra topic ${topicId ?? '(missing)'}.`);
}
expect(algebraBlocks.length === 13, `Expected 13 curated Algebra mock questions; found ${algebraBlocks.length}.`);

// Packaging hygiene.
if (process.env.BSECE_QA_INSTALLED_APP !== '1') {
  for (const dir of ['node_modules', 'dist', '.vite']) {
    expect(!fs.existsSync(path.join(root, dir)), `${dir} should not be included in the portable source package.`);
  }
} else {
  console.log('Installed-app QA: portable source-package hygiene is a separate release check.');
}

if (failures.length) {
  console.error(`Algebra v10.8 validation FAILED (${failures.length} issue${failures.length === 1 ? '' : 's'}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Algebra v10.8 structural validation PASS');
console.log('- reference-informed topics: 23');
console.log('- audited shared practice questions: 260');
console.log('- timed reference assessment candidates: 203');
console.log('- high-priority banks expanded to 15 items: 8');
console.log('- final Algebra catalog routes: complete');
console.log('- assessment readiness: recommendation-only; canonical mastery remains scored-review owned');
console.log('- mock generator: unique questions only; no clone/cycle fallback');
console.log('- curated Algebra mock topic IDs: canonical');
console.log('- approved-reference complex-number scope: preserved');
