import {
  Topic,
  Flashcard,
  FlashcardGenerationOptions,
  ReviewError,
  ErrorFlashcard,
  ErrorFlashcardGenerationOptions,
} from '../types';

export interface FlashcardResponse {
  flashcards: Flashcard[];
  source: string;
  message: string;
}

export interface ErrorFlashcardResponse {
  flashcards: ErrorFlashcard[];
  source: string;
  message: string;
}

export async function generateFlashcardsFromGemini(
  topics: Topic[] = [],
  options: Partial<FlashcardGenerationOptions> = {}
): Promise<FlashcardResponse> {
  const count = options.count ?? Math.min(12, Math.max(4, topics.length > 0 ? topics.length * 2 : 6));
  const focusArea = options.focusArea ?? 'mixed';
  const material = options.material;
  const subjectName = options.subjectName;

  const payload = {
    count,
    focusArea,
    material,
    subjectName,
    topics: topics.map((t) => ({
      id: t.id,
      name: t.name,
      subjectId: t.subjectId,
      groupId: t.groupId,
      mastery: t.mastery,
      latestScore: t.latestScore,
      whyWeakReasons: t.whyWeakReasons,
    })),
  };

  try {
    const res = await fetch('/api/gemini/generate-flashcards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with ${res.status}`);
    }

    const data = await res.json();
    return {
      flashcards: data.flashcards || [],
      source: data.source || 'gemini-3.8-flash',
      message: data.message || 'Flashcards generated successfully!',
    };
  } catch (err: any) {
    console.warn('Network call to /api/gemini/generate-flashcards failed, using client fallback:', err);
    // Client-side fallback if server is offline
    const fallbackCards = generateClientFallbackCards(topics, count, material, subjectName);
    return {
      flashcards: fallbackCards,
      source: 'offline_fallback',
      message: `Generated syllabus study cards for ${subjectName || 'your selected topics'} (${err.message || 'offline mode'}).`,
    };
  }
}

/**
 * Generate active recall flashcards specifically targeted at remediating logged errors
 * utilizing the Gemini API (/api/gemini/generate-error-flashcards).
 */
export async function generateFlashcardsFromErrors(
  errors: ReviewError[],
  options: Partial<ErrorFlashcardGenerationOptions> = {}
): Promise<ErrorFlashcardResponse> {
  const count = options.count ?? Math.min(12, Math.max(3, errors.length));
  const focusStyle = options.focusStyle ?? 'targeted-remediation';
  const difficulty = options.difficulty ?? 'mixed';

  const payload = {
    count,
    focusStyle,
    difficulty,
    errors: errors.map((e) => ({
      id: e.id,
      topicId: e.topicId,
      topicName: e.topicName,
      subjectId: e.subjectId,
      category: e.category,
      description: e.description,
      solutionOrKeyFormula: e.solutionOrKeyFormula,
      occurrenceCount: e.occurrenceCount,
      lastOccurred: e.lastOccurred,
    })),
  };

  try {
    const res = await fetch('/api/gemini/generate-error-flashcards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with ${res.status}`);
    }

    const data = await res.json();
    return {
      flashcards: data.flashcards || [],
      source: data.source || 'gemini-3.8-flash',
      message: data.message || 'Active recall error flashcards generated successfully!',
    };
  } catch (err: any) {
    console.warn('Network call to /api/gemini/generate-error-flashcards failed, using client fallback:', err);
    const fallbackCards = generateClientFallbackErrorCards(errors, count);
    return {
      flashcards: fallbackCards,
      source: 'offline_fallback',
      message: `Generated error-remediation flashcards (${err.message || 'offline mode'}).`,
    };
  }
}

function generateClientFallbackErrorCards(errors: ReviewError[], count: number): ErrorFlashcard[] {
  const cards: ErrorFlashcard[] = [];
  errors.forEach((err, i) => {
    cards.push({
      id: `client-err-card-${err.id}-${i}`,
      errorId: err.id,
      topicId: err.topicId,
      topicName: err.topicName,
      errorCategory: err.category,
      originalMistake: err.description,
      activeRecallCue: `⚠️ ${err.category} Drill`,
      front: `[Active Recall] How do you prevent this mistake in ${err.topicName}?\n\nMistake: "${err.description}"`,
      back: `Correct Method & Rule:\n\n${err.solutionOrKeyFormula || 'Carefully verify rules, signs, and algebraic domain constraints.'}`,
      keyFormulaOrConcept: err.solutionOrKeyFormula || 'Refer to governing formula.',
      boardExamTip: 'Always verify candidate answers using simple values or calculator CALC checks.',
      difficulty: 'Medium',
      knownStatus: null,
    });
  });

  while (cards.length < count && cards.length > 0) {
    const base = cards[cards.length % errors.length];
    cards.push({
      ...base,
      id: `client-err-card-extra-${cards.length}`,
      front: `[Trap Inversion] What distractor trap typically stems from: "${base.originalMistake}"?`,
      back: `Review the essential rule:\n\n${base.keyFormulaOrConcept}\n\n${base.back}`,
    });
  }

  return cards.slice(0, count);
}

function generateClientFallbackCards(
  topics: Topic[],
  count: number,
  material?: string,
  subjectName?: string
): Flashcard[] {
  const cards: Flashcard[] = [];

  if (topics.length > 0) {
    topics.forEach((t, i) => {
      cards.push({
        id: `client-card-${t.id}-${i}`,
        topicId: t.id,
        topicName: t.name,
        front: `What is the core principle and governing formula for ${t.name}?`,
        back: `For ${t.name}, identify given boundary conditions and choose the canonical standard formula. Keep careful track of signs and fractional exponents.`,
        keyFormulaOrConcept: `Standard canonical equations for ${t.name}`,
        boardExamTip: `Double-check unit consistency and eliminate obvious outliers using answer choices.`,
        difficulty: 'Medium',
        knownStatus: null,
      });
    });

    while (cards.length < count && cards.length > 0) {
      const base = cards[cards.length % topics.length];
      cards.push({
        ...base,
        id: `client-card-extra-${cards.length}`,
        front: `[Problem Recall] How do you solve for unknown parameters in ${base.topicName}?`,
        back: `Substitute given constraints into the general equation and solve via system substitution or matrix determinant.`,
      });
    }
  } else if (material) {
    const lines = material
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 10 && !l.startsWith('#'));

    const items = lines.slice(0, count);
    items.forEach((line, idx) => {
      cards.push({
        id: `client-mat-${Date.now()}-${idx}`,
        topicId: `topic-mat-${idx}`,
        topicName: subjectName || 'Material Review',
        front: `What key concept or governing equation is derived from this syllabus area?\n\n"${line.slice(0, 120)}"`,
        back: `Core rule: ${line}\nEnsure accurate parameter values, unit dimensions, and correct algebraic sign conventions.`,
        keyFormulaOrConcept: line.length > 60 ? line.slice(0, 60) + '...' : line,
        boardExamTip: 'Commit this standard relation to memory and verify with dimensional analysis.',
        difficulty: idx % 2 === 0 ? 'Medium' : 'Hard',
        knownStatus: null,
      });
    });

    if (cards.length === 0) {
      cards.push({
        id: `client-mat-default`,
        topicId: `topic-default`,
        topicName: subjectName || 'Engineering Review',
        front: `What is the governing methodology for ${subjectName || 'this subject'}?`,
        back: `Analyze the boundary conditions, state the governing equations, and solve with standard PRC board exam calculator techniques.`,
        keyFormulaOrConcept: `Fundamental laws and relationships of ${subjectName || 'the subject'}`,
        boardExamTip: 'Look out for unit conversion traps (e.g. dB vs ratio, Hz vs rad/s).',
        difficulty: 'Medium',
        knownStatus: null,
      });
    }
  }

  return cards.slice(0, count);
}
