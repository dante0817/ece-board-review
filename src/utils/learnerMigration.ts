/** Versioned, non-destructive migration. Called before React reads saved state. */
export const LEARNER_SCHEMA = 'ece_board_learner_schema';
export const LEGACY_BACKUP = 'ece_board_v108_pre_migration_backup';
export const DATA_MODE_KEY = 'ece_board_v109_data_mode';
const KEYS = [
 'ece_board_review_subjects_v4', 'ece_board_review_tests_v3',
 'ece_board_review_errors_v3', 'ece_board_review_daily_v3',
 'ece_board_review_daily_date_v1', 'ece_board_review_profile_v3',
 'ece_board_memorized_formulas_v1',
];
export interface KeyStore { getItem(key:string): string|null; setItem(key:string,value:string):void; }
export function migrateLearnerV109(store:KeyStore): 'fresh'|'migrated'|'already'|'blocked' {
  try {
    const schema = store.getItem(LEARNER_SCHEMA);
    if (schema === '10.10') return 'already';
    if (schema === '10.9') { store.setItem(LEARNER_SCHEMA,'10.10'); return 'already'; }
    const backup: Record<string,string> = {};
    for (const key of KEYS) {
      const saved = store.getItem(key);
      if (saved !== null) backup[key] = saved;
    }
    if (Object.keys(backup).length) {
      // Immutable first snapshot; never overwrite the original pre-migration state.
      if (store.getItem(LEGACY_BACKUP) === null) {
        store.setItem(LEGACY_BACKUP, JSON.stringify({ version: '10.8', savedAt: new Date().toISOString(), entries: backup }));
      }
      const oldSubjects = backup.ece_board_review_subjects_v4;
      if (oldSubjects) {
        const subjects: unknown = JSON.parse(oldSubjects);
        if (!Array.isArray(subjects)) return 'blocked';
        store.setItem('ece_board_review_subjects_v4', JSON.stringify(subjects.map((subject:any) => ({
          ...subject, groups:(subject.groups||[]).map((group:any)=>({
            ...group, topics:(group.topics||[]).map((topic:any)=>({
              ...topic, evidenceStatus:'legacy',
            }))
          }))
        }))));
      }
      const testData = backup.ece_board_review_tests_v3;
      if (testData) {
        const tests: unknown = JSON.parse(testData);
        if (!Array.isArray(tests)) return 'blocked';
        // Entries from older releases cannot establish strict, question-level evidence.
        store.setItem('ece_board_review_tests_v3', JSON.stringify(tests.map((t: any) => ({
          ...t, provenance: 'legacy', assessmentMode: 'manual',
          scope: 'legacy', itemResults: undefined,
        }))));
      }
    }
    store.setItem(DATA_MODE_KEY, Object.keys(backup).length ? 'legacy' : 'clean');
    store.setItem(LEARNER_SCHEMA, '10.10');
    return Object.keys(backup).length ? 'migrated' : 'fresh';
  } catch (error) {
    console.error('Learner migration blocked; previously saved records are preserved.', error);
    return 'blocked';
  }
}
