/** Pure session-only practice selector. No persistent tracking or board-score changes.
 * Each canonical GEO topic receives both foundation and challenge coverage.
 */
export function practiceIndices(questions, filters, answers, lessons) {
  return questions.flatMap((q, index) => {
    const lesson = lessons.find(l => l.topic_id === q.topic_id);
    if (filters.topic !== 'all' && q.topic_id !== filters.topic) return [];
    if (filters.unit !== 'all' && lesson?.unit_id !== filters.unit) return [];
    if (filters.difficulty !== 'all' && q.level !== filters.difficulty) return [];
    const attempted = Object.hasOwn(answers, q.id);
    if (filters.status === 'unanswered' && attempted) return [];
    if (filters.status === 'missed' && (!attempted || answers[q.id] === q.correctIndex)) return [];
    return [index];
  });
}

/** Prioritize weak topic retries and readiness-adjusted difficulty; deterministic, no randomness. */
export function recommendedPracticeIndex(questions, indices, answers, currentIndex) {
  const remaining = indices.filter(index => !Object.hasOwn(answers, questions[index].id) && index !== currentIndex);
  if (!remaining.length) return null;
  const attempts = Object.keys(answers).length;
  const wins = questions.filter(q => Object.hasOwn(answers, q.id) && answers[q.id] === q.correctIndex).length;
  const accuracy = attempts ? wins / attempts : 0;
  const topicMistakes = new Map();
  const topicAttempts = new Map();
  for (const q of questions) {
    if (!Object.hasOwn(answers, q.id)) continue;
    topicAttempts.set(q.topic_id, (topicAttempts.get(q.topic_id) ?? 0) + 1);
    if (answers[q.id] !== q.correctIndex) topicMistakes.set(q.topic_id, (topicMistakes.get(q.topic_id) ?? 0) + 1);
  }
  const target = attempts < 4 ? 'Foundation' : accuracy >= 0.75 ? 'Challenge' : accuracy >= 0.5 ? 'Applied' : 'Foundation';
  const weights = {'Foundation': 0, 'Applied': 1, 'Challenge': 2};
  const targetWeight = weights[target];
  return remaining
    .map(index => {
      const q = questions[index];
      const mistakes = topicMistakes.get(q.topic_id) ?? 0;
      const seen = topicAttempts.get(q.topic_id) ?? 0;
      const difference = Math.abs(weights[q.level] - targetWeight);
      return {index, score: mistakes * 20 - difference * 8 - seen * 3};
    })
    .sort((a,b) => b.score - a.score || a.index - b.index)[0].index;
}
