/**
 * ECE Board Review Mastery Tracker - Seed Script
 * 
 * Populates the complete official list of 34 ECE Algebra syllabus topics (across 6 groups)
 * along with rich mock progress data, test records, error logs, and review activities.
 * 
 * Run with: npm run seed
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_SUBJECTS, INITIAL_TEST_RECORDS, INITIAL_ERRORS, INITIAL_DAILY_TARGET, INITIAL_USER_PROFILE } from '../src/data/initialData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runSeed() {
  console.log('================================================================');
  console.log('🚀 ECE Board Review Mastery Tracker - Seeding Initial Dataset');
  console.log('================================================================\n');

  const algebraSubject = INITIAL_SUBJECTS.find((s) => s.id === 'subj-math-algebra');
  if (!algebraSubject) {
    console.error('❌ Error: Subject subj-math-algebra not found in initialData.');
    process.exit(1);
  }

  let totalTopics = 0;
  let coveredTopics = 0;
  const masteryCounts: Record<string, number> = {
    'Level 5 (BOARD READY)': 0,
    'Level 4 (SOLID)': 0,
    'Level 3 (DEVELOPING)': 0,
    'Level 2 (NEEDS WORK)': 0,
    'Level 1 (NOVICE)': 0,
    'Unranked / Uncovered': 0,
  };

  console.log(`📚 Syllabus Subject: ${algebraSubject.name} (${algebraSubject.shortCode})`);
  console.log(`🎯 Board Target: ${algebraSubject.boardTarget}% | Weight: ${algebraSubject.boardWeightPercent}%\n`);

  algebraSubject.groups.forEach((grp, idx) => {
    console.log(`📁 Group ${idx + 1}: ${grp.name} (${grp.topics.length} topics)`);
    grp.topics.forEach((t) => {
      totalTopics++;
      if (t.initialCovered) coveredTopics++;
      
      let tag = 'UNREVIEWED';
      if (t.mastery === 5) {
        masteryCounts['Level 5 (BOARD READY)']++;
        tag = '⭐ L5 (BOARD READY)';
      } else if (t.mastery === 4) {
        masteryCounts['Level 4 (SOLID)']++;
        tag = '🟢 L4 (SOLID)';
      } else if (t.mastery === 3) {
        masteryCounts['Level 3 (DEVELOPING)']++;
        tag = '🟡 L3 (DEVELOPING)';
      } else if (t.mastery === 2) {
        masteryCounts['Level 2 (NEEDS WORK)']++;
        tag = '🔴 L2 (NEEDS WORK)';
      } else if (t.mastery === 1) {
        masteryCounts['Level 1 (NOVICE)']++;
        tag = '⚠️ L1 (NOVICE)';
      } else {
        masteryCounts['Unranked / Uncovered']++;
      }

      const overdueBadge = t.nextReviewDate && t.nextReviewDate < '2026-09-09' ? ' [OVERDUE]' : '';
      const priorityBadge = t.isHighPriority ? ' [HIGH PRIORITY]' : '';
      const scoreStr = t.latestScore !== null ? `${t.latestScore}%` : 'N/A';
      console.log(`   • [${t.initialCovered ? '✓' : ' '}] ${t.name.padEnd(45)} | Score: ${scoreStr.padStart(4)} | ${tag}${overdueBadge}${priorityBadge}`);
    });
    console.log('');
  });

  console.log('----------------------------------------------------------------');
  console.log('📊 CURRICULUM MASTERY SUMMARY:');
  console.log(`   • Total Topics Seeded:       ${totalTopics}`);
  console.log(`   • Initial Syllabus Covered:   ${coveredTopics}/${totalTopics} (${Math.round((coveredTopics / totalTopics) * 100)}%)`);
  Object.entries(masteryCounts).forEach(([k, v]) => {
    console.log(`   • ${k.padEnd(28)}: ${v} topics`);
  });

  console.log('\n📝 DIAGNOSTIC TESTS & ERROR LOGS:');
  console.log(`   • Mock Tests Logged:         ${INITIAL_TEST_RECORDS.length} tests`);
  INITIAL_TEST_RECORDS.forEach((tr) => {
    console.log(`     - [${tr.date}] ${tr.testType} | Score: ${tr.scorePercent}% (${tr.correct}/${tr.questions})`);
  });

  console.log(`   • Error Log Entries:         ${INITIAL_ERRORS.length} active errors`);
  const errCategories = INITIAL_ERRORS.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  Object.entries(errCategories).forEach(([cat, count]) => {
    console.log(`     - ${cat.padEnd(25)}: ${count} recorded mistakes`);
  });

  // Write a backup seed JSON file for testing / reference
  const seedPayload = {
    version: '3.0.0',
    generatedAt: new Date().toISOString(),
    profile: INITIAL_USER_PROFILE,
    dailyTarget: INITIAL_DAILY_TARGET,
    subjects: INITIAL_SUBJECTS,
    testRecords: INITIAL_TEST_RECORDS,
    errors: INITIAL_ERRORS,
  };

  const outputPath = path.join(__dirname, '..', 'src', 'data', 'seedData.json');
  fs.writeFileSync(outputPath, JSON.stringify(seedPayload, null, 2), 'utf-8');
  console.log(`\n💾 Exported seed snapshot to: src/data/seedData.json`);
  console.log('✅ Seed verification completed successfully!\n');
}

runSeed();
