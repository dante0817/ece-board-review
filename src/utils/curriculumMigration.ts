import { ReviewError, Subject, TestRecord, Topic } from '../types';

const LEGACY_TOPIC_ALIASES: Record<string, string> = {
  'top-fund-ops': 'top-real-numbers',
  'top-radicals-rational-exp': 'top-laws-exponents',
  'top-linear-systems': 'top-simultaneous-linear',
  'top-quadratic-eq': 'top-quadratics',
  'top-arithmetic-prog': 'top-arithmetic-seq',
  'top-arithmetic-series': 'top-arithmetic-seq',
  'top-geometric-series': 'top-geometric-seq',
  'top-infinite-series': 'top-geometric-seq',
  'top-binomial-exp': 'top-binomial-theorem',
};

const mergeTopicState = (template: Topic, saved: Topic): Topic => ({
  ...template,
  ...saved,
  id: template.id,
  subjectId: template.subjectId,
  groupId: template.groupId,
  name: template.name,
  canonicalIndex: template.canonicalIndex,
  priorityLevel: template.priorityLevel,
  boardRelevance: template.boardRelevance,
  skillsCovered: template.skillsCovered,
});

/**
 * Merge learner progress stored under an older curriculum snapshot into the
 * current canonical curriculum without discarding newly added topic records.
 * The v10.2 Fundamentals split can only recover the former aggregate record as
 * Real Numbers; the other newly separated skills start from their current
 * canonical seed state because no distinct historic learner evidence existed.
 */
export function migrateSubjectsToCurrentCurriculum(
  savedSubjects: Subject[],
  templateSubjects: Subject[]
): Subject[] {
  const savedTopics = new Map<string, Topic>();
  // Preserve exact canonical records first; then use legacy aliases only when a
  // canonical record does not already exist. This avoids duplicate progress rows
  // while still carrying older learner evidence forward.
  for (const subject of savedSubjects) {
    for (const group of subject.groups) {
      for (const topic of group.topics) {
        if (!LEGACY_TOPIC_ALIASES[topic.id]) savedTopics.set(topic.id, topic);
      }
    }
  }
  for (const subject of savedSubjects) {
    for (const group of subject.groups) {
      for (const topic of group.topics) {
        const canonicalId = LEGACY_TOPIC_ALIASES[topic.id];
        if (canonicalId && !savedTopics.has(canonicalId)) {
          savedTopics.set(canonicalId, { ...topic, id: canonicalId });
        }
      }
    }
  }

  const legacyFundamentals = savedSubjects
    .flatMap((subject) => subject.groups.flatMap((group) => group.topics))
    .find((topic) => topic.id === 'top-fund-ops');
  const templateTopicIds = new Set(
    templateSubjects.flatMap((subject) => subject.groups.flatMap((group) => group.topics.map((topic) => topic.id)))
  );

  const mergedSubjects = templateSubjects.map((templateSubject) => {
    const savedSubject = savedSubjects.find((subject) => subject.id === templateSubject.id);

    const groups = templateSubject.groups.map((templateGroup) => {
      const savedGroup = savedSubject?.groups.find((group) => group.id === templateGroup.id);

      const topics = templateGroup.topics.map((templateTopic) => {
        const exact = savedTopics.get(templateTopic.id);
        if (exact) return mergeTopicState(templateTopic, exact);

        if (templateTopic.id === 'top-real-numbers' && legacyFundamentals) {
          return mergeTopicState(templateTopic, {
            ...legacyFundamentals,
            id: templateTopic.id,
            name: templateTopic.name,
            subjectId: templateTopic.subjectId,
            groupId: templateTopic.groupId,
          });
        }

        return templateTopic;
      });

      // Preserve any legacy/custom records not represented by the current
      // template, except the aggregate topic intentionally replaced in v10.2.
      const extras = (savedGroup?.topics ?? []).filter((topic) => {
        if (topic.id === 'top-fund-ops') return false;
        const canonicalId = LEGACY_TOPIC_ALIASES[topic.id] ?? topic.id;
        return !templateTopicIds.has(canonicalId);
      });

      return {
        ...templateGroup,
        ...(savedGroup ?? {}),
        id: templateGroup.id,
        subjectId: templateGroup.subjectId,
        name: templateGroup.name,
        topics: [...topics, ...extras],
      };
    });

    const templateGroupIds = new Set(templateSubject.groups.map((group) => group.id));
    const extraGroups = (savedSubject?.groups ?? [])
      .filter((group) => !templateGroupIds.has(group.id))
      .map((group) => ({
        ...group,
        topics: group.topics.filter((topic) => {
          if (topic.id === 'top-fund-ops') return false;
          const canonicalId = LEGACY_TOPIC_ALIASES[topic.id] ?? topic.id;
          return !templateTopicIds.has(canonicalId);
        }),
      }))
      .filter((group) => group.topics.length > 0);

    return {
      ...templateSubject,
      ...(savedSubject ?? {}),
      id: templateSubject.id,
      category: templateSubject.category,
      name: templateSubject.name,
      shortCode: templateSubject.shortCode,
      description: templateSubject.description,
      boardWeightPercent: templateSubject.boardWeightPercent,
      groups: [...groups, ...extraGroups],
    };
  });

  const templateSubjectIds = new Set(templateSubjects.map((subject) => subject.id));
  const extraSubjects = savedSubjects.filter((subject) => !templateSubjectIds.has(subject.id));
  return [...mergedSubjects, ...extraSubjects];
}

export function migrateTestRecordsToCurrentCurriculum(records: TestRecord[]): TestRecord[] {
  return records.map((record) => ({
    ...record,
    topicIds: record.topicIds.map((id) => LEGACY_TOPIC_ALIASES[id] ?? id),
  }));
}

export function migrateErrorsToCurrentCurriculum(errors: ReviewError[]): ReviewError[] {
  return errors.map((error) => {
    const topicId = LEGACY_TOPIC_ALIASES[error.topicId] ?? error.topicId;
    if (topicId === error.topicId) return error;
    return {
      ...error,
      topicId,
      topicName: topicId === 'top-real-numbers' ? 'Real Numbers & Number Systems' : error.topicName,
    };
  });
}
