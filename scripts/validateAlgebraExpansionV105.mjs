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
const linear = read('src/components/LinearEquationsScreen.tsx');
const screens = read('src/components/ReferenceAlgebraTopicScreens.tsx');
const nav = read('src/utils/mathTopicNavigation.ts');

const newTopics = [
  'top-linear-eq',
  'top-absolute-value',
  'top-rational-radical-eqs',
  'top-logarithms',
];
for (const topic of newTopics) expect(data.includes(`'${topic}': {`), `Missing v10.5 topic content: ${topic}`);

const qPrefixes = ['q-lin-', 'q-abs-', 'q-rreq-', 'q-log-'];
for (const prefix of qPrefixes) {
  const count = [...data.matchAll(new RegExp(`id: '${prefix}\\d+'`, 'g'))].length;
  expect(count >= 6, `${prefix} expected at least the original 6 practice questions; found ${count}`);
}

expect(catalog.includes("interactiveScreen: 'rational-radical-equations'"), 'Radical/Fractional catalog route missing.');
expect(catalog.includes("id: 'alg-literal-eq'") && catalog.includes("interactiveScreen: 'linear-equations'"), 'Literal equation route missing.');
expect(catalog.includes("id: 'alg-abs-value'") && catalog.includes("interactiveScreen: 'absolute-value'"), 'Absolute-value catalog route missing.');
expect((catalog.match(/interactiveScreen: 'exponential-logarithmic'/g) || []).length === 4, 'All four exponential/log catalog rows must route to the shared lesson.');

for (const screen of ['absolute-value', 'rational-radical-equations', 'exponential-logarithmic']) {
  expect(context.includes(`| '${screen}'`), `ScreenType missing ${screen}`);
  expect(app.includes(`currentScreen === '${screen}'`), `App render branch missing ${screen}`);
  expect(sidebar.includes(`'${screen}'`), `Sidebar Mathematics descendant set missing ${screen}`);
}
expect(sidebar.includes("'factoring'") && sidebar.includes("'polynomials'") && sidebar.includes("'exponents-radicals'") && sidebar.includes("'inequalities'"), 'v10.4 reference screens missing from Mathematics active-state set.');

expect(screens.includes('AbsoluteValueScreen'), 'AbsoluteValueScreen export missing.');
expect(screens.includes('RationalRadicalEquationsScreen'), 'RationalRadicalEquationsScreen export missing.');
expect(screens.includes('ExponentialLogarithmicScreen'), 'ExponentialLogarithmicScreen export missing.');
expect(linear.includes('<ReferenceStudyBlueprint content={referenceContent} />'), 'Linear custom screen is not using the reference-informed blueprint.');
expect(nav.includes("'top-rational-radical-eqs': 'rational-radical-equations'"), 'Rational/radical canonical navigation missing.');
expect(nav.includes("'top-logarithms': 'exponential-logarithmic'"), 'Exponential/log canonical navigation missing.');

// Ensure every new source entry is precise and verified, not provisional.
const newStart = data.indexOf("  'top-linear-eq': {");
const nextStart = data.indexOf("  'top-simultaneous-linear': {", newStart);
const newBlock = newStart >= 0 ? data.slice(newStart, nextStart >= 0 ? nextStart : undefined) : '';
const newVerified = [...newBlock.matchAll(/verificationStatus:\s*'verified-section-pages'/g)].length;
expect(newVerified === 12, `Expected 12 verified v10.5 source entries; found ${newVerified}.`);
expect(!newBlock.includes("verificationStatus: 'provisional'"), 'A v10.5 source locator is still provisional.');

if (failures.length) {
  console.error(`Algebra v10.5 structural validation FAILED (${failures.length} issue${failures.length === 1 ? '' : 's'}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Algebra v10.5 structural validation PASS');
console.log('- expansion topics: 4');
console.log('- new practice questions: 24');
console.log('- verified new source entries: 12');
console.log('- catalog and canonical routes: present');
console.log('- Mathematics sidebar active-state coverage: present');
console.log('- Linear custom lesson: reference blueprint integrated');
