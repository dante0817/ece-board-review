import { BOARD_CALCULATOR_POLICY } from './src/data/boardCalculatorPolicy';
import {normalizeCalculatorBoardTip,CALCULATOR_AI_GUARDRAIL} from './src/domain/calculator/modelSafety';
import {APP_HEALTH_IDENTITY,parseServerHost,parseServerPort} from './src/domain/runtime/serverConfig';
import http from 'http';
import {canUseAiApi, RequestRateGate, validateAiText} from './src/domain/runtime/requestSafety';
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Type, Modality, LiveServerMessage } from '@google/genai';

// Vite reads .env.local for client settings; the Node API must read it explicitly.
// dotenv never overwrites an environment variable already supplied by the host.
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const app = express();
const PORT = parseServerPort(process.env.PORT);
const HOST = parseServerHost(process.env.HOST);

// Keep learner backup files client-side. No API here needs multi-megabyte JSON bodies.
app.use('/api', express.json({ limit: '1mb' }));
const aiRateGate = new RequestRateGate();
const aiRoutes = ['/api/gemini/generate-flashcards', '/api/gemini/generate-error-flashcards', '/api/chat'];
app.use(aiRoutes, (req, res, next) => {
  if (!canUseAiApi({ remoteAddress: req.socket.remoteAddress, origin: req.get('origin'),
    host: req.get('host'), tokenHeader: req.get('authorization'), configuredToken: process.env.BSECE_API_TOKEN })) {
    return res.status(403).json({error:'AI API access requires the same app origin and LAN authorization.'});
  }
  if (!aiRateGate.allow(`${req.socket.remoteAddress}:http`, Date.now(), 40)) {
    return res.status(429).json({error:'Too many AI requests; retry in a minute.'});
  }
  next();
});

// Validate API inputs before async handlers or their curated fallback paths run.
// All existing UI card-count choices fit within this bound.
app.use(aiRoutes, (req, res, next) => {
  if (req.method !== 'POST') return next();
  const body = req.body;
  const object = (value: any) => value !== null && typeof value === 'object' && !Array.isArray(value);
  const textFields = (value: any, keys: string[]) => keys.every(key => value[key] === undefined || typeof value[key] === 'string');
  if (!object(body)) return res.status(400).json({ error: 'Request body must be a JSON object.' });
  if (req.originalUrl.split('?')[0] === '/api/chat') {
    if (!Array.isArray(body.messages)) return res.status(400).json({error:'Messages must be an array.'});
    if (body.messages?.length > 40 || body.messages?.some((m: any) =>
      typeof m?.content === 'string' && m.content.length > 6000) ||
      !validateAiText(body.systemInstruction, 6000) || !validateAiText(body.model, 80)) {
      return res.status(400).json({error:'Chat input exceeds supported limits.'});
    }
    if (!Array.isArray(body.messages) || !body.messages.length || body.messages.some((m: any) =>
      !object(m) || !['user', 'assistant', 'model', 'system'].includes(m.role) || typeof m.content !== 'string') ||
      !textFields(body, ['model', 'systemInstruction']) || (body.stream !== undefined && typeof body.stream !== 'boolean')) {
      return res.status(400).json({ error: 'Provide valid messages with a role and text content.' });
    }
  } else {
    if ((body.topics !== undefined && !Array.isArray(body.topics)) ||
        (body.errors !== undefined && !Array.isArray(body.errors)) ||
        (Array.isArray(body.topics) && body.topics.some((t: any) =>
          t && t.whyWeakReasons !== undefined && !Array.isArray(t.whyWeakReasons)))) {
      return res.status(400).json({error:'Topics, errors and remediation reasons must be arrays.'});
    }
    if ((body.topics?.length ?? 0) > 40 || (body.errors?.length ?? 0) > 40 ||
      !['material','subjectName','focusArea','focusStyle','difficulty'].every(k => validateAiText(body[k], k === 'material' ? 15000 : 160))) {
      return res.status(400).json({error:'Flashcard input exceeds supported limits.'});
    }
    if (body.topics?.some((t: any) => !validateAiText(t?.id, 120) || !validateAiText(t?.name, 200) ||
      !validateAiText(t?.subjectName, 200) || (t?.whyWeakReasons?.length ?? 0) > 12 ||
      t?.whyWeakReasons?.some((r: any) => !validateAiText(r, 400))) ||
      body.errors?.some((e: any) => !['id','topicName','description','category','solutionOrKeyFormula']
        .every(k => validateAiText(e?.[k], k === 'description' || k === 'solutionOrKeyFormula' ? 2000 : 200)))) {
      return res.status(400).json({error:'Flashcard records exceed supported limits.'});
    }
    if (body.count !== undefined && (!Number.isSafeInteger(body.count) || body.count < 1 || body.count > 50)) {
      return res.status(400).json({ error: 'Card count must be an integer from 1 to 50.' });
    }
    if (!textFields(body, ['material', 'subjectName', 'focusArea', 'focusStyle', 'difficulty'])) {
      return res.status(400).json({ error: 'Flashcard preferences and material must be text.' });
    }
    if (body.topics !== undefined && (!Array.isArray(body.topics) || body.topics.some((t: any) =>
      !object(t) || typeof t.id !== 'string' || typeof t.name !== 'string' ||
      !textFields(t, ['subjectName']) || (t.whyWeakReasons !== undefined &&
        (!Array.isArray(t.whyWeakReasons) || t.whyWeakReasons.some((reason: any) => typeof reason !== 'string')))))) {
      return res.status(400).json({ error: 'Provide valid topic records with an id and name.' });
    }
    if (body.errors !== undefined && (!Array.isArray(body.errors) || body.errors.some((e: any) =>
      !object(e) || typeof e.id !== 'string' || !textFields(e, ['topicName', 'description', 'category', 'solutionOrKeyFormula'])))) {
      return res.status(400).json({ error: 'Provide valid error records with an id and text fields.' });
    }
  }
  return next();
});

// Lazy initialization for Gemini API SDK
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({ status: 'ok', application: APP_HEALTH_IDENTITY, hasGeminiKey, timestamp: new Date().toISOString(),
    ...(HOST === '127.0.0.1' && process.env.BSECE_QA_NONCE ? { qaNonce: process.env.BSECE_QA_NONCE } : {}),
  });
});

// AI-powered Flashcards generation endpoint using Gemini API
app.post('/api/gemini/generate-flashcards', async (req, res) => {
  try {
    const { topics = [], count = 6, focusArea = 'mixed', material = '', subjectName = '' } = req.body;

    if ((!Array.isArray(topics) || topics.length === 0) && (!material || material.trim().length === 0)) {
      return res.status(400).json({
        error: 'Please provide at least one topic or syllabus material to generate flashcards.',
      });
    }

    const effectiveTopics = Array.isArray(topics) && topics.length > 0
      ? topics
      : [{ id: `topic-${Date.now()}`, name: subjectName || 'Subject Review', subjectName: subjectName || 'Subject Review' }];

    const ai = getGeminiClient();

    // If no Gemini API key configured, return fallback high-yield board review cards
    if (!ai) {
      const fallbackCards = generateCuratedFallbackFlashcards(effectiveTopics, count, focusArea);
      return res.json({
        flashcards: fallbackCards.map(card=>({...card,boardExamTip:normalizeCalculatorBoardTip(card.boardExamTip)})),
        source: 'curated_fallback',
        message: 'Generated from ECE Board Exam Syllabus Bank. To enable custom real-time AI generation, configure your GEMINI_API_KEY in Settings > Secrets.',
      });
    }

    // Build prompt for Gemini 3.8 Flash
    const topicsSummary = effectiveTopics
      .map((t: any) => {
        const details = [
          `Topic: ${t.name}`,
          t.subjectName ? `Subject: ${t.subjectName}` : '',
          t.mastery ? `Current Mastery: Level ${t.mastery}/5` : '',
          t.latestScore !== undefined && t.latestScore !== null ? `Recent Score: ${t.latestScore}%` : '',
          t.whyWeakReasons && t.whyWeakReasons.length > 0 ? `Areas for remediation: ${t.whyWeakReasons.join(', ')}` : '',
        ]
          .filter(Boolean)
          .join(' | ');
        return `- ${details}`;
      })
      .join('\n');

    const materialSection = material && material.trim().length > 0
      ? `\nCURRENT SUBJECT MATERIAL & REFERENCE CONTENT TO SUMMARIZE:\n"""\n${material.slice(0, 4500)}\n"""\n`
      : '';

    const promptText = `Generate ${count} high-yield, exam-tested summary flashcards for Philippine PRC Electronics & Communications Engineering (ECE) board exam reviewees based on the following material and topics:
${subjectName ? `Subject Area: ${subjectName}\n` : ''}
${topicsSummary}
${materialSection}
Focus Preference: ${focusArea} (e.g. key formulas, tricky word problem setups, calculator techniques, fundamental principles, and board exam trap distinctions).
Create cards that summarize key concepts, formulas, rules, and problem setups from this material.
Ensure each flashcard has:
1. "front": A clear, concise question, formula prompt, or board-exam style problem scenario based directly on the material.
2. "back": The rigorous, correct answer, formula, or stepwise derivation takeaway.
3. "keyFormulaOrConcept": The single critical formula or definition (e.g. S_n = n/2(2a + (n-1)d), V_out = -(R_f / R_in) * V_in, etc.).
4. "boardExamTip": A high-yield mnemonic, independently valid numerical verification concept, or common trap. Do not invent device keystrokes or Casio-specific menus for Canon F-789SGA.
5. "difficulty": "Easy", "Medium", or "Hard".
6. "topicName": Matching one of the input topics or modules.
7. "topicId": Matching the corresponding topic id if known.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction:
          'You are a premier PRC Electronics and Communications Engineering (ECE) Board Examination reviewer and engineering professor. You craft clear, rigorous, exam-ready flashcards that reinforce active recall, fundamental formulas, and board exam traps.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              topicId: { type: Type.STRING },
              topicName: { type: Type.STRING },
              front: { type: Type.STRING, description: 'Question, scenario prompt, or formula recall question' },
              back: { type: Type.STRING, description: 'Authoritative answer or concise step-by-step solution' },
              keyFormulaOrConcept: { type: Type.STRING, description: 'Essential formula or mathematical rule' },
              boardExamTip: { type: Type.STRING, description: 'Common exam trap, mnemonic, or calculator shortcut' },
              difficulty: { type: Type.STRING, description: 'Easy, Medium, or Hard' },
            },
            required: ['topicName', 'front', 'back', 'keyFormulaOrConcept', 'boardExamTip', 'difficulty'],
          },
        },
      },
    });

    let generatedCards = [];
    try {
      const rawText = response.text || '[]';
      generatedCards = JSON.parse(rawText);
    } catch (parseErr) {
      console.warn('Failed to parse Gemini JSON output, falling back:', parseErr);
      generatedCards = generateCuratedFallbackFlashcards(effectiveTopics, count, focusArea);
    }

    // Ensure IDs and topic bindings
    const sanitizedCards = generatedCards.map((card: any, idx: number) => {
      const matchedTopic = effectiveTopics.find(
        (t: any) =>
          t.name.toLowerCase() === (card.topicName || '').toLowerCase() ||
          t.id === card.topicId
      ) || effectiveTopics[idx % effectiveTopics.length];

      return {
        id: card.id || `card-${Date.now()}-${idx}`,
        topicId: matchedTopic ? matchedTopic.id : (card.topicId || `t-${idx}`),
        topicName: card.topicName || (matchedTopic ? matchedTopic.name : (subjectName || 'Engineering Review')),
        front: card.front || 'What is the governing principle for this topic?',
        back: card.back || 'Consult standard PRC board review handbook.',
        keyFormulaOrConcept: card.keyFormulaOrConcept || 'Refer to syllabus core formula.',
        boardExamTip: normalizeCalculatorBoardTip(card.boardExamTip || 'Verify units and signs carefully.'),
        difficulty: (['Easy', 'Medium', 'Hard'].includes(card.difficulty) ? card.difficulty : 'Medium') as 'Easy' | 'Medium' | 'Hard',
      };
    });

    res.json({
      flashcards: sanitizedCards,
      source: 'gemini-3.8-flash',
      message: `Successfully generated ${sanitizedCards.length} flashcards using Gemini API!`,
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/generate-flashcards:', err);
    // Graceful degradation so student's study session is never interrupted
    const { topics = [], count = 6, focusArea = 'mixed' } = req.body || {};
    const fallbackCards = generateCuratedFallbackFlashcards(topics, count, focusArea);

    res.json({
      flashcards: fallbackCards.map(card=>({...card,boardExamTip:normalizeCalculatorBoardTip(card.boardExamTip)})),
      source: 'curated_fallback',
      message: `AI generation encountered a temporary error (${err.message || 'connection issue'}). Provided high-yield syllabus flashcards so your review session continues smoothly.`,
    });
  }
});

// AI-powered Error Log Flashcards generation endpoint using Gemini API (gemini-3.8-flash)
app.post('/api/gemini/generate-error-flashcards', async (req, res) => {
  try {
    const { errors = [], count = 6, focusStyle = 'targeted-remediation', difficulty = 'mixed' } = req.body;

    if (!Array.isArray(errors) || errors.length === 0) {
      return res.status(400).json({
        error: 'Please provide at least one error log entry to generate flashcards.',
      });
    }

    const ai = getGeminiClient();

    // If no Gemini API key configured, return high-yield curated remediation flashcards
    if (!ai) {
      const fallbackCards = generateCuratedFallbackErrorFlashcards(errors, count, focusStyle);
      return res.json({
        flashcards: fallbackCards.map(card=>({...card,boardExamTip:normalizeCalculatorBoardTip(card.boardExamTip)})),
        source: 'curated_fallback',
        message: 'Generated from Board Exam Error Remediation Bank. To enable custom real-time AI generation, configure your GEMINI_API_KEY in Settings > Secrets.',
      });
    }

    // Build prompt for Gemini 3.8 Flash based on user's logged errors
    const errorsSummary = errors
      .map((e: any, idx: number) => {
        const lines = [
          `[Error #${idx + 1}] ID: ${e.id || `err-${idx}`}`,
          `Topic: ${e.topicName || 'General Engineering Mathematics'}`,
          `Category: ${e.category || 'General Slip'}`,
          `Logged Mistake/Trap: "${e.description}"`,
          e.solutionOrKeyFormula ? `Key Rule/Formula: "${e.solutionOrKeyFormula}"` : '',
          e.occurrenceCount ? `Recurrence Count: ${e.occurrenceCount} time(s)` : '',
        ]
          .filter(Boolean)
          .join('\n  ');
        return `- ${lines}`;
      })
      .join('\n\n');

    const promptText = `Generate ${count} high-yield, active recall digital flashcards specifically engineered from the student's personal error log entries below for Philippine PRC Electronics & Communications Engineering (ECE) board exam reviewees:

${errorsSummary}

Focus Style Preference: ${focusStyle} (targeted-remediation = direct correction & drill; trap-inversion = spot the trap in tricky multiple-choice scenarios; formula-drill = prompt for exact formula and boundary conditions; board-exam-scenario = realistic board exam question designed to catch this specific pitfall).
Target Difficulty: ${difficulty}.

Requirements for each active recall flashcard:
1. "errorId": The matching error ID from the input list that this flashcard remedies.
2. "topicName": The topic name from the error.
3. "errorCategory": The category of the error (e.g. Formula recall, Sign / algebra errors, Wrong method, Question misreading, Speed / calculation slip).
4. "originalMistake": Concise 1-sentence reminder of what mistake the student made.
5. "activeRecallCue": A punchy 2-5 word retrieval cue displayed above the prompt (e.g., "⚠️ Spot the Sign Trap", "🧠 Formula Retrieval", "⚡ Boundary Condition Test", "🎯 Board Scenario Drill").
6. "front": An active recall question, prompt, or challenge. Do NOT simply ask "what did you do wrong?". Frame it as an active cognitive retrieval challenge where the examinee must recall the rule, calculate the answer, or identify the error in a sample problem.
7. "back": Authoritative, stepwise solution and explanation. Explicitly explains WHY the mistake is fatal in the board exam and HOW to solve it correctly.
8. "keyFormulaOrConcept": The exact mathematical formula, identity, or theorem in clean readable notation (LaTeX formatting where helpful, e.g., $S_\\infty = \\frac{a}{1 - r}$, $\\text{Cofactor} = (-1)^{i+j} M_{ij}$).
9. "boardExamTip": A mathematical check or board trap, NOT an unverified device key sequence. Refer device-specific steps to the app's reviewed Canon F-789SGA library.
10. "counterExampleOrCheck": A quick 1-sentence verification check or counter-example (e.g., "Check: if r = 1, the series 1 + 1 + 1... has no finite sum").
11. "difficulty": "Easy", "Medium", or "Hard".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction:
          'You are an elite Philippine PRC Electronics and Communications Engineering (ECE) Licensure Examination professor and cognitive psychologist specializing in active recall and error-driven learning. You transform student error logs and misconceptions into laser-focused, active-recall flashcards that eradicate traps and guarantee board-day retention.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              errorId: { type: Type.STRING },
              topicName: { type: Type.STRING },
              errorCategory: { type: Type.STRING },
              originalMistake: { type: Type.STRING },
              activeRecallCue: { type: Type.STRING },
              front: { type: Type.STRING, description: 'Active recall prompt or scenario question' },
              back: { type: Type.STRING, description: 'Stepwise solution and explanation' },
              keyFormulaOrConcept: { type: Type.STRING, description: 'Governing formula or rule' },
              boardExamTip: { type: Type.STRING, description: 'Mnemonic, calculator technique, or trap avoidance advice' },
              counterExampleOrCheck: { type: Type.STRING, description: 'Quick check or counter-example' },
              difficulty: { type: Type.STRING, description: 'Easy, Medium, or Hard' },
            },
            required: ['topicName', 'front', 'back', 'keyFormulaOrConcept', 'boardExamTip', 'difficulty'],
          },
        },
      },
    });

    let generatedCards: any[] = [];
    try {
      const rawText = response.text || '[]';
      generatedCards = JSON.parse(rawText);
    } catch (parseErr) {
      console.warn('Failed to parse Gemini JSON output for error flashcards, falling back:', parseErr);
      generatedCards = generateCuratedFallbackErrorFlashcards(errors, count, focusStyle);
    }

    // Ensure IDs and error bindings
    const sanitizedCards = generatedCards.map((card: any, idx: number) => {
      const matchedErr = errors.find(
        (e: any) => e.id === card.errorId || (card.topicName && e.topicName && e.topicName.toLowerCase() === card.topicName.toLowerCase())
      ) || errors[idx % errors.length];

      return {
        id: card.id || `err-card-${Date.now()}-${idx}`,
        errorId: matchedErr?.id || card.errorId || `err-${idx}`,
        topicId: matchedErr?.topicId || `top-${idx}`,
        topicName: card.topicName || matchedErr?.topicName || 'Engineering Mathematics',
        errorCategory: card.errorCategory || matchedErr?.category || 'Formula recall',
        originalMistake: card.originalMistake || matchedErr?.description || 'Past calculation or formula slip',
        activeRecallCue: card.activeRecallCue || '🎯 Active Recall Challenge',
        front: card.front || 'How do you correctly solve this problem and avoid the common exam trap?',
        back: card.back || (matchedErr?.solutionOrKeyFormula ? `Apply rule: ${matchedErr.solutionOrKeyFormula}` : 'Review the fundamental syllabus definition.'),
        keyFormulaOrConcept: card.keyFormulaOrConcept || matchedErr?.solutionOrKeyFormula || 'Refer to syllabus core formula.',
        boardExamTip: normalizeCalculatorBoardTip(card.boardExamTip || 'Check signs, units, and boundary conditions.'),
        counterExampleOrCheck: normalizeCalculatorBoardTip(card.counterExampleOrCheck || 'Always verify with simple test values.'),
        difficulty: (['Easy', 'Medium', 'Hard'].includes(card.difficulty) ? card.difficulty : 'Medium') as 'Easy' | 'Medium' | 'Hard',
      };
    });

    res.json({
      flashcards: sanitizedCards,
      source: 'gemini-3.8-flash',
      message: `Successfully generated ${sanitizedCards.length} active recall flashcards from your error log using Gemini 3.8 Flash!`,
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/generate-error-flashcards:', err);
    const { errors = [], count = 6, focusStyle = 'targeted-remediation' } = req.body || {};
    const fallbackCards = generateCuratedFallbackErrorFlashcards(errors, count, focusStyle);

    res.json({
      flashcards: fallbackCards.map(card=>({...card,boardExamTip:normalizeCalculatorBoardTip(card.boardExamTip)})),
      source: 'curated_fallback',
      message: `AI generation encountered a temporary error (${err.message || 'connection issue'}). Provided high-yield error remediation flashcards so your active recall practice continues smoothly.`,
    });
  }
});

// Curated high-yield fallback database for ECE syllabus topics
function generateCuratedFallbackFlashcards(topics: any[], count: number, focusArea: string) {
  const defaultBank = [
    {
      topicKeyword: 'arithmetic',
      front: 'How do you find the nth term and the sum of the first n terms of an Arithmetic Progression (A.P.)?',
      back: '• nth term: a_n = a_1 + (n - 1)d\n• Sum: S_n = (n / 2)[2a_1 + (n - 1)d] = (n / 2)(a_1 + a_n)',
      keyFormulaOrConcept: 'a_n = a_1 + (n-1)d ; S_n = (n/2)(a_1 + a_n)',
      boardExamTip: 'Do not confuse common difference d = a_k - a_(k-1) with common ratio r. If numbers are in AP, the middle term is the arithmetic mean: 2b = a + c.',
      difficulty: 'Easy',
    },
    {
      topicKeyword: 'geometric',
      front: 'What is the condition for an infinite Geometric Progression (G.P.) to converge, and what is its sum formula?',
      back: 'An infinite G.P. converges if and only if |r| < 1. The sum to infinity is: S_∞ = a_1 / (1 - r).',
      keyFormulaOrConcept: 'S_∞ = a_1 / (1 - r) where |r| < 1',
      boardExamTip: 'If |r| ≥ 1, the series diverges and has no finite sum. Board exams frequently test repeating decimals as infinite geometric progressions (e.g. 0.4545... = 45/99).',
      difficulty: 'Medium',
    },
    {
      topicKeyword: 'harmonic',
      front: 'What is a Harmonic Progression (H.P.), and how do you compute the Harmonic Mean (HM) between two numbers a and b?',
      back: 'A sequence is in H.P. if the reciprocals of its terms form an A.P. For two numbers a and b:\nHM = 2ab / (a + b)',
      keyFormulaOrConcept: 'HM = 2ab / (a + b) ; Also AM × HM = (GM)²',
      boardExamTip: 'There is no direct formula for the sum of an H.P. Always invert each term to its A.P. reciprocal to solve for terms.',
      difficulty: 'Medium',
    },
    {
      topicKeyword: 'binomial',
      front: 'What is the formula for the (r + 1)-th term in the binomial expansion of (x + y)^n?',
      back: 'The general (r + 1)-th term is: T_(r+1) = nCr · x^(n - r) · y^r, where nCr = n! / [r!(n - r)!].',
      keyFormulaOrConcept: 'T_(r+1) = C(n, r) · x^(n-r) · y^r',
      boardExamTip: 'To find the term independent of x, set the net exponent of x to zero and solve for r. Remember that the 5th term corresponds to r = 4.',
      difficulty: 'Hard',
    },
    {
      topicKeyword: 'partial fractions',
      front: 'When decomposing rational fraction P(x)/Q(x) into partial fractions, what must be done if degree(P) ≥ degree(Q)?',
      back: 'Perform polynomial long division first to express the fraction as a polynomial quotient plus a proper remainder fraction: P(x)/Q(x) = Q_quotient(x) + R(x)/Q(x).',
      keyFormulaOrConcept: 'Improper Fraction = Quotient + (Remainder / Divisor)',
      boardExamTip: 'Directly applying Heaviside cover-up method on an improper fraction without long division first is a fatal board exam mistake.',
      difficulty: 'Medium',
    },
    {
      topicKeyword: 'logarithm',
      front: 'State the change of base formula and the power rule for logarithms.',
      back: '• Change of base: log_b(a) = ln(a) / ln(b) = log_10(a) / log_10(b)\n• Power rule: log_b(x^k) = k · log_b(x)\n• Product rule: log_b(xy) = log_b(x) + log_b(y)',
      keyFormulaOrConcept: 'log_b(a) = log_c(a) / log_c(b) ; log(a/b) = log a - log b',
      boardExamTip: 'Always check for extraneous solutions in logarithmic equations. The argument of any logarithm must be strictly positive (> 0).',
      difficulty: 'Easy',
    },
    {
      topicKeyword: 'complex',
      front: 'State De Moivre’s Theorem for raising a complex number z = r(cos θ + i sin θ) to power n.',
      back: 'z^n = [r(cos θ + i sin θ)]^n = r^n [cos(nθ) + i sin(nθ)] = r^n · e^(i·nθ)',
      keyFormulaOrConcept: 'z^n = r^n (cos nθ + i sin nθ)',
      boardExamTip: 'Use your scientific calculator in COMPLEX mode (MODE 2 on a calculator VERIFIED PERMITTED under the selected PRC exam program) to quickly convert between rectangular (a + bi) and polar (r ∠ θ) form.',
      difficulty: 'Medium',
    },
    {
      topicKeyword: 'matrix',
      front: 'Under what condition does Cramer’s Rule apply to solve a system of n linear equations with n unknowns?',
      back: 'Cramer’s Rule applies if and only if the determinant of the coefficient matrix D is non-zero (det(D) ≠ 0). The solution for variable x_i is x_i = D_i / D.',
      keyFormulaOrConcept: 'x_i = det(D_i) / det(D), where det(D) ≠ 0',
      boardExamTip: 'If det(D) = 0, Cramer’s Rule cannot classify the system. Compare rank(A) and rank([A|b]): unequal ranks mean no solution; equal ranks below n mean infinitely many solutions.',
      difficulty: 'Medium',
    },
    {
      topicKeyword: 'quadratic',
      front: 'How does the discriminant D = b² - 4ac characterize the roots of ax² + bx + c = 0?',
      back: '• D > 0: Two distinct real roots (rational if D is a perfect square)\n• D = 0: One real repeated root (double root: x = -b / 2a)\n• D < 0: Two complex conjugate roots',
      keyFormulaOrConcept: 'Discriminant: Δ = b² - 4ac ; Sum: -b/a ; Product: c/a',
      boardExamTip: 'If roots are given as r_1 and r_2, quickly reconstruct the equation: x² - (sum)x + (product) = 0.',
      difficulty: 'Easy',
    },
    {
      topicKeyword: 'word problems',
      front: 'How do you formulate a joint work problem where person A completes a job in T_a hours and person B completes it in T_b hours?',
      back: 'Rates add up: Rate_A = 1 / T_a, Rate_B = 1 / T_b. Working together for time T:\n(1 / T_a + 1 / T_b) · T = 1  ⇒  T = (T_a · T_b) / (T_a + T_b)',
      keyFormulaOrConcept: 'Combined Work: 1/T = 1/T_1 + 1/T_2 + ... + 1/T_n',
      boardExamTip: 'If pipe C drains/empties the tank, subtract its rate: (1/T_A + 1/T_B - 1/T_C) · T = 1.',
      difficulty: 'Medium',
    },
  ];

  const results: any[] = [];
  topics.forEach((t, i) => {
    const topicLower = t.name.toLowerCase();
    const matched = defaultBank.find((item) => topicLower.includes(item.topicKeyword));
    if (matched) {
      results.push({
        id: `card-fallback-${t.id}-${i}`,
        topicId: t.id,
        topicName: t.name,
        front: matched.front,
        back: matched.back,
        keyFormulaOrConcept: matched.keyFormulaOrConcept,
        boardExamTip: matched.boardExamTip,
        difficulty: matched.difficulty,
      });
    } else {
      results.push({
        id: `card-fallback-${t.id}-${i}`,
        topicId: t.id,
        topicName: t.name,
        front: `What are the critical formulas, definitions, and boundary conditions for ${t.name}?`,
        back: `Review fundamental definitions, standard derivation steps, and units of measurement for ${t.name}. Check whether calculator shortcuts apply.`,
        keyFormulaOrConcept: `Standard governing equations for ${t.name}`,
        boardExamTip: `Identify whether this problem asks for exact analytical values or rounded decimal approximations.`,
        difficulty: 'Medium',
      });
    }
  });

  // If count is greater than topic count, add extra variations
  while (results.length < count && results.length > 0) {
    const base = results[results.length % topics.length];
    results.push({
      ...base,
      id: `card-fallback-extra-${results.length}`,
      front: `[Active Recall] ${base.front}`,
    });
  }

  return results.slice(0, count);
}

// Curated high-yield fallback database specifically for student error log remediation
function generateCuratedFallbackErrorFlashcards(errors: any[], count: number, focusStyle: string) {
  const errorBank: Record<string, {
    activeRecallCue: string;
    front: string;
    back: string;
    keyFormulaOrConcept: string;
    boardExamTip: string;
    counterExampleOrCheck: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
  }> = {
    'err-1': {
      activeRecallCue: '🧠 Repeated Linear Factor Setup',
      front: 'When decomposing a rational expression with denominator containing a repeated factor like (x - 1)², what is the required partial fraction expansion template?',
      back: 'A repeated linear factor (x - r)^k requires k distinct partial fraction terms with increasing powers:\n\nA/(x - r) + B/(x - r)² + ... + K/(x - r)^k\n\nWriting only A/(x - 1) lacks a degree of freedom and makes algebraic matching impossible.',
      keyFormulaOrConcept: '\\frac{A_1}{x-r} + \\frac{A_2}{(x-r)^2} + \\dots + \\frac{A_k}{(x-r)^k}',
      boardExamTip: 'Board Exam Trap: Remember that repeated linear factors do NOT take a linear numerator (Ax + B). Each power gets a single constant numerator (A, B, etc.).',
      counterExampleOrCheck: 'If you only used A/(x-1) for a 3rd degree denominator, you have only 2 constants for 3 coefficients, resulting in an inconsistent linear system.',
      difficulty: 'Medium',
    },
    'err-2': {
      activeRecallCue: '⚠️ Inapplicable Cover-Up Method Trap',
      front: 'Can Oliver Heaviside’s cover-up shortcut be directly applied to find numerators over irreducible quadratic denominators like (x² + bx + c)?',
      back: 'NO. Heaviside cover-up is strictly valid for non-repeated, linear real roots. For irreducible quadratic factors (x² + bx + c), you must equate polynomial coefficients or substitute convenient values of x (e.g., x = 0, 1).',
      keyFormulaOrConcept: '\\text{Equate coefficients of like powers of } x: x^2, x^1, x^0',
      boardExamTip: 'Heaviside cover-up assumes real roots where a denominator equals zero without complex algebra. Always use coefficient equating for quadratics.',
      counterExampleOrCheck: 'After solving the coefficient system, substitute the constants into the original identity and compare coefficients.',
      difficulty: 'Medium',
    },
    'err-3': {
      activeRecallCue: '🧭 Quadrant Sign & Angle Anchor',
      front: 'A student converts z = -3 + j4 into polar form and obtains -53.13° via arctan(4 / -3). Why is this fatal, and what is the true angle?',
      back: 'Standard calculator arctan only returns angles in Quadrants I and IV (-90° to +90°). Since Re(z) = -3 < 0 and Im(z) = +4 > 0, z lies in Quadrant II!\n\nTrue angle: θ = 180° - 53.13° = 126.87° (or 5 ∠ 126.87°).',
      keyFormulaOrConcept: '\\theta = 180^\\circ - \\arctan\\left|\\frac{y}{x}\\right| \\quad (\\text{Quadrant II})',
      boardExamTip: 'Compute magnitude √(3²+4²)=5 and identify quadrant II from the signs (−,+). Use a model-appropriate complex mode only after verifying its actual keys.',
      counterExampleOrCheck: 'Check: Quadrant II has negative cosine (-3/5 = -0.6) and positive sine (+4/5 = +0.8). cos(-53.13°) = +0.6 (contradiction!).',
      difficulty: 'Easy',
    },
    'err-4': {
      activeRecallCue: '⚡ Cyclic Power of j Recall',
      front: 'What is the exact value of j³ and j⁴⁷ in AC complex engineering mathematics?',
      back: 'Powers of j = √(-1) form a 4-period cycle: j¹ = j, j² = -1, j³ = -j, j⁴ = 1.\n\nFor j⁴⁷: 47 mod 4 = 3 (remainder 3), so j⁴⁷ = j³ = -j.',
      keyFormulaOrConcept: 'j^{4k} = 1, \\; j^{4k+1} = j, \\; j^{4k+2} = -1, \\; j^{4k+3} = -j',
      boardExamTip: 'Always take the exponent modulo 4: remainder 0 → 1, remainder 1 → j, remainder 2 → -1, remainder 3 → -j. Notice remainder 3 is NEGATIVE j!',
      counterExampleOrCheck: 'j³ = j² · j = (-1) · j = -j. Writing +j forgets that j² is negative one.',
      difficulty: 'Easy',
    },
    'err-5': {
      activeRecallCue: '🏛️ Base in the Basement Rule',
      front: 'State the change-of-base identity for log_b(a). How do you guarantee you never invert the numerator and denominator?',
      back: 'log_b(a) = ln(a) / ln(b) = log_10(a) / log_10(b).\n\nUse the universal mnemonic: "The base b goes to the basement (denominator)".',
      keyFormulaOrConcept: '\\log_b(a) = \\frac{\\log_c(a)}{\\log_c(b)} = \\frac{\\ln(a)}{\\ln(b)}',
      boardExamTip: 'Sanity check on your calculator: log₂(8) = 3. Check ln(8)/ln(2) = 3 (correct). If inverted, ln(2)/ln(8) = 1/3 (obviously incorrect).',
      counterExampleOrCheck: 'If b = 10, log₁₀(a) = ln(a)/ln(10). Notice the base 10 is on the bottom.',
      difficulty: 'Easy',
    },
    'err-6': {
      activeRecallCue: '🔊 10-Log vs 20-Log Factor Distinction',
      front: 'When calculating decibel gain (dB) in Communications and Electronics, when must you multiply by 10 versus 20?',
      back: '• Power Gain (Watts): G_dB = 10 · log₁₀(P₂ / P₁)\n• Field Gain (Voltage/Current): A_v(dB) = 20 · log₁₀(V₂ / V₁) across equal resistances, because Power is proportional to Voltage squared (P ∝ V²), pulling down a factor of 2: 10 × 2 = 20.',
      keyFormulaOrConcept: 'P_{\\text{dB}} = 10\\log_{10}(P_2/P_1) \\quad ; \\quad V_{\\text{dB}} = 20\\log_{10}(V_2/V_1)',
      boardExamTip: 'PRC Board Trap: If an amplifier question gives input and output voltages in mV and Volts, NEVER use 10 log. Use 20 log₁₀(V_out / V_in)!',
      counterExampleOrCheck: 'Doubling power is +3 dB (10 log 2 ≈ 3.01 dB). Doubling voltage is +6 dB (20 log 2 ≈ 6.02 dB).',
      difficulty: 'Medium',
    },
    'err-7': {
      activeRecallCue: '♾️ Infinite Series Convergence Prerequisite',
      front: 'What condition MUST be verified before using the infinite geometric progression formula S_∞ = a₁ / (1 - r)? What happens if r = 1.25?',
      back: 'The infinite sum exists if and only if |r| < 1 (-1 < r < 1). If |r| ≥ 1 (e.g. r = 1.25), each successive term grows larger, the series diverges, and NO finite sum exists.',
      keyFormulaOrConcept: 'S_\\infty = \\frac{a_1}{1 - r} \\iff |r| < 1',
      boardExamTip: 'Board Examiners intentionally include a₁ / (1 - 1.25) = -4a₁ as option (A) to trap reviewees who blindly compute without testing convergence.',
      counterExampleOrCheck: 'The series 4 + 5 + 6.25 + 7.8125... has all positive growing terms. It cannot possibly sum to -16!',
      difficulty: 'Medium',
    },
    'err-8': {
      activeRecallCue: '🎯 Geometric Sum Denominator Precision',
      front: 'In the formula for the sum of an infinite geometric progression, what is the denominator, and what is the common slip?',
      back: 'Denominator is (1 - r), NOT r. S_∞ = a₁ / (1 - r).\n\nSlip: Reviewees write a₁ / r or (1 - r) in the numerator. Remember: as r approaches 1, the denominator approaches 0 and the sum explodes to infinity.',
      keyFormulaOrConcept: 'S_\\infty = \\frac{a_1}{1 - r} \\quad (|r| < 1)',
      boardExamTip: 'If r = 1/2 and a₁ = 1: 1 + 1/2 + 1/4 + 1/8... = 1 / (1 - 1/2) = 2. If you divided by r, you would get 1 / (1/2) = 2 by coincidence, but for r = 1/3, a₁/(1-r) = 1.5 while a₁/r = 3!',
      counterExampleOrCheck: 'For 1 + 1/3 + 1/9...: S_∞ = 1 / (2/3) = 1.5. Notice 1 - r = 2/3.',
      difficulty: 'Easy',
    },
    'err-9': {
      activeRecallCue: '♟️ Determinant Checkerboard Sign Rule',
      front: 'What is the cofactor sign pattern when expanding a 3×3 matrix along Row 2? Why do students drop signs here?',
      back: 'Cofactor sign is (-1)^(i + j). For Row 2 (i = 2):\n• Column 1: (-1)^(2+1) = -1 (MINUS)\n• Column 2: (-1)^(2+2) = +1 (PLUS)\n• Column 3: (-1)^(2+3) = -1 (MINUS)\nPattern is: [ - , + , - ]. Dropping the leading minus sign flips the whole determinant!',
      keyFormulaOrConcept: 'C_{ij} = (-1)^{i+j} M_{ij} \\implies \\text{Row 2: } -a_{21}M_{21} + a_{22}M_{22} - a_{23}M_{23}',
      boardExamTip: 'Cross-check determinant calculations with cofactor expansion, row operations, or a manual-verified matrix function on the selected device.',
      counterExampleOrCheck: 'Notice Row 1 starts with (+), but Row 2 starts with (-). Check the row index: 2 + 1 = 3 (odd = negative).',
      difficulty: 'Medium',
    },
    'err-10': {
      activeRecallCue: '🎯 Vieta’s Root Sign Alternation',
      front: 'For ax² + bx + c = 0, state Vieta’s formulas for the sum and product of the roots, emphasizing the sign of each.',
      back: '• Sum of roots: r₁ + r₂ = -b / a (NEGATIVE ratio of linear to leading coefficient)\n• Product of roots: r₁ · r₂ = +c / a (POSITIVE ratio of constant to leading coefficient)\n\nReconstructed equation: x² - (Sum)x + (Product) = 0.',
      keyFormulaOrConcept: 'r_1 + r_2 = -\\frac{b}{a} \\quad ; \\quad r_1 r_2 = \\frac{c}{a}',
      boardExamTip: 'Mnemonic: Signs alternate starting after x²: (+x²), (- sum · x), (+ product). When the board exam asks for "product", do NOT negate c/a!',
      counterExampleOrCheck: 'For (x - 2)(x - 3) = x² - 5x + 6 = 0: a = 1, b = -5, c = 6. Sum = -(-5)/1 = 5 (2+3). Product = 6/1 = 6 (2×3).',
      difficulty: 'Easy',
    },
    'err-11': {
      activeRecallCue: '🔄 Inequality Direction Flip Rule',
      front: 'Solve -3x > 9. What algebraic action is mandatory when multiplying or dividing by a negative number?',
      back: 'You MUST reverse (flip) the inequality symbol when multiplying or dividing both sides by a negative number:\n\n-3x > 9  ==>  x < 9 / (-3)  ==>  x < -3.\n\nKeeping x > -3 is an immediate trap choice.',
      keyFormulaOrConcept: '-kx > c \\implies x < -\\frac{c}{k} \\quad (k > 0)',
      boardExamTip: 'Always test a number in your candidate set: If x > -3 were true, x = 0 would be a solution. But -3(0) = 0 > 9 is FALSE. Testing x = -4: -3(-4) = +12 > 9 (TRUE)!',
      counterExampleOrCheck: '2 < 5 is true. Multiply by -1: -2 < -5 is false, because -2 is greater than -5 (-2 > -5). Hence the sign must flip.',
      difficulty: 'Easy',
    },
    'err-12': {
      activeRecallCue: '⏱️ Combined Work Rate Inversion',
      front: 'Worker A takes 4 hours and Worker B takes 6 hours to finish a job. Why is 4 + 6 = 10 hours wrong, and what is the exact combined time?',
      back: 'Productivity adds, not total time. You must sum their individual rates (jobs/hour):\n\nRate_A = 1/4, Rate_B = 1/6.\nCombined Rate = 1/4 + 1/6 = 5/12 jobs/hour.\nCombined Time = 1 / (Combined Rate) = 12/5 = 2.4 hours (2 hours 24 minutes).',
      keyFormulaOrConcept: '\\frac{1}{T_{\\text{combined}}} = \\frac{1}{T_A} + \\frac{1}{T_B} \\implies T = \\frac{T_A \\cdot T_B}{T_A + T_B}',
      boardExamTip: 'Fast 2-Worker Formula: T = (Product) / (Sum) = (4 × 6) / (4 + 6) = 24 / 10 = 2.4 hrs. Combined time must ALWAYS be strictly less than the fastest individual worker alone!',
      counterExampleOrCheck: 'Worker A alone takes 4 hours. With B helping, it MUST take less than 4 hours. 10 hours would mean adding a helper made them 2.5x slower!',
      difficulty: 'Medium',
    },
    'err-13': {
      activeRecallCue: '🔍 Extraneous Root Detection in Radicals',
      front: 'When solving equations involving radicals (e.g. √(2x + 3) = x), what phenomenon occurs when squaring both sides?',
      back: 'Squaring both sides [A² = B²] introduces potential extraneous roots because (-B)² = B² as well. You MUST substitute all candidate roots back into the original, unsquared radical equation to discard invalid solutions.',
      keyFormulaOrConcept: '\\sqrt{f(x)} = g(x) \\implies g(x) \\ge 0 \\text{ is a required domain restriction}',
      boardExamTip: 'Substitute candidate roots into the ORIGINAL equation and check all domain restrictions; calculator evaluation is a supporting check only.',
      counterExampleOrCheck: '√(x + 2) = -3 has NO real solution because a principal square root cannot be negative. Squaring gives x + 2 = 9 => x = 7, but √(9) = 3 ≠ -3 (extraneous).',
      difficulty: 'Medium',
    },
    'err-14': {
      activeRecallCue: '📐 Variation Proportionality Setup',
      front: 'Distinguish between Inverse Variation and Joint Variation. What are the respective algebraic formulas?',
      back: '• Inverse Variation: y varies inversely with x -> y = k / x (or x · y = k).\n• Joint Variation: y varies jointly with x and z -> y = k · x · z.\n• Combined Variation: y = k · x / z.',
      keyFormulaOrConcept: '\\text{Inverse: } y = \\frac{k}{x} \\quad ; \\quad \\text{Joint: } y = kxz \\quad ; \\quad \\text{Combined: } y = \\frac{kx}{z}',
      boardExamTip: 'In word problems: "jointly" means direct multiplication of multiple variables; "inversely" means the variable goes in the denominator.',
      counterExampleOrCheck: 'If y varies inversely as x, doubling x cuts y in half. If y varies jointly as x and z, doubling both quadruples y.',
      difficulty: 'Easy',
    },
  };

  const results: any[] = [];

  errors.forEach((err, idx) => {
    const matched = errorBank[err.id] || Object.values(errorBank).find((b) =>
      err.topicName && b.front.toLowerCase().includes(err.topicName.toLowerCase().slice(0, 8))
    );

    if (matched) {
      results.push({
        id: `err-card-${err.id}-${idx}`,
        errorId: err.id,
        topicId: err.topicId,
        topicName: err.topicName,
        errorCategory: err.category,
        originalMistake: err.description,
        activeRecallCue: matched.activeRecallCue,
        front: matched.front,
        back: matched.back,
        keyFormulaOrConcept: matched.keyFormulaOrConcept,
        boardExamTip: matched.boardExamTip,
        counterExampleOrCheck: matched.counterExampleOrCheck,
        difficulty: matched.difficulty,
      });
    } else {
      // Dynamic fallback synthesized from the student's logged mistake and solution rule
      const topic = err.topicName || 'Board Topic';
      const rule = err.solutionOrKeyFormula || 'Master fundamental definitions and boundary conditions.';
      const mistake = err.description || 'Misapplied standard algebraic principle.';

      results.push({
        id: `err-card-${err.id || 'err'}-${idx}`,
        errorId: err.id,
        topicId: err.topicId,
        topicName: topic,
        errorCategory: err.category || 'Formula recall',
        originalMistake: mistake,
        activeRecallCue: `⚠️ ${err.category || 'Concept Retrieval'} Drill`,
        front: `[Active Recall] How do you prevent the following board exam trap in ${topic}?\n\nScenario: A reviewee logged this mistake: "${mistake}". What is the governing mathematical principle and stepwise correction?`,
        back: `To correctly resolve this problem:\n\n1. Enforce the canonical rule: ${rule}\n2. Verify all signs, parentheses distributions, and domain restrictions.\n3. Before selecting an answer, eliminate choices that result from common slips.`,
        keyFormulaOrConcept: rule,
        boardExamTip: `Board Tip: Pay special attention to ${err.category || 'exam accuracy'}. Re-read the question stem to confirm exact requirements.`,
        counterExampleOrCheck: 'Verify your calculated answer with simple boundary values or calculator numerical checks.',
        difficulty: 'Medium',
      });
    }
  });

  // If count requested is greater than available error cards, create variations
  while (results.length < count && results.length > 0) {
    const base = results[results.length % errors.length];
    results.push({
      ...base,
      id: `err-card-extra-${results.length}`,
      activeRecallCue: `⚡ Trap Inversion Drill`,
      front: `[Inversion Challenge] You encounter a multiple-choice question in ${base.topicName}. One distractor choice is based on: "${base.originalMistake}". How do you quickly spot and eliminate that trap?`,
      back: `Identify the trap mechanism: Reviewees often fall for this slip. Instead, remember the core rule:\n\n${base.keyFormulaOrConcept}\n\n${base.back}`,
    });
  }

  return results.slice(0, count);
}

// Curated fallback response generator for /api/chat when GEMINI_API_KEY is not configured
function generateCuratedFallbackChatResponse(query: string, model: string, instruction: string): { text: string } {
  const q = (query || '').toLowerCase();

  let body = '';
  if (q.includes('rational') || q.includes('fraction') || q.includes('algebra')) {
    body = `### 🎯 Rational Expressions Review (PRC ECE Syllabus)

1. **Fundamental Rule**:
   $$\\frac{A}{B} \\pm \\frac{C}{D} = \\frac{A \\cdot D \\pm B \\cdot C}{B \\cdot D}$$
   Always factor all denominators completely before finding the Least Common Denominator (LCD).

2. **Common PRC Board Exam Traps**:
   - **Sign Distribution Slip**: When subtracting a composite numerator, e.g. $-\\frac{x - 3}{D}$, you must distribute the negative sign: $-(x - 3) = -x + 3$.
   - **Restricted Values / Extraneous Roots**: Always determine values where the denominator equals zero ($B(x) \\neq 0$). If solving an equation produces a value that makes any original denominator zero, it is an extraneous solution!
   - **Illegal Cancellation**: Never cancel individual terms across a plus or minus sign: $\\frac{x + 5}{x} \\neq 5$. Only common multiplicative factors can be canceled.

3. **Calculator guidance: use only a model verified under current PRC rules**:
   - Compare the original and candidate expressions at valid test inputs (e.g. x=7.3 or x=13.1) to detect discrepancies. Matching a few values does NOT prove an identity; use algebraic simplification to establish equivalence.`;
  } else if (q.includes('bjt') || q.includes('transistor') || q.includes('alpha') || q.includes('beta')) {
    body = `### ⚡ BJT Transistor Relationships & Formulas

1. **Current Equations**:
   $$I_E = I_B + I_C$$
   $$I_C = \\beta I_B = \\alpha I_E$$

2. **Alpha ($\\alpha$) & Beta ($\\beta$) Conversion**:
   $$\\alpha = \\frac{\\beta}{\\beta + 1} \\quad \\Longleftrightarrow \\quad \\beta = \\frac{\\alpha}{1 - \\alpha}$$
   - Typical $\\beta$: $50$ to $300$
   - Typical $\\alpha$: $0.98$ to $0.998$

3. **PRC Trap**:
   - In saturation mode, $I_C \\neq \\beta I_B$. Instead, $I_{C(sat)} = \\frac{V_{CC} - V_{CE(sat)}}{R_C}$, and $\\beta_{forced} = \\frac{I_{C(sat)}}{I_B} < \\beta$.`;
  } else if (q.includes('shannon') || q.includes('capacity') || q.includes('hartley')) {
    body = `### 📡 Shannon-Hartley Channel Capacity Theorem

1. **Formula**:
   $$C = B \\log_2\\left(1 + \\frac{S}{N}\\right)$$
   where:
   - $C$: Channel capacity in bits per second (bps)
   - $B$: Channel bandwidth in Hertz (Hz)
   - $S/N$: Signal-to-Noise power ratio (absolute linear value, **NOT in dB**!)

2. **PRC Trap**:
   Examiners frequently give $SNR$ in decibels (dB), e.g. $30\\text{ dB}$. You must convert it to linear ratio first:
   $$\\frac{S}{N} = 10^{\\frac{SNR_{dB}}{10}} = 10^{\\frac{30}{10}} = 1000$$
   $$C = B \\log_2(1 + 1000) \\approx B \\times 9.97\\text{ bps}$$`;
  } else {
    body = `### 🎓 TopNotch AI ECE Board Reviewer

I received your prompt: **"${query.slice(0, 100)}"**

Here is a focused ECE Licensure Examination breakdown:
- **Core Principle**: In PRC Board exams, ensure you check whether problems ask for exact analytical values, standard metric prefixes (f, p, n, µ, m, k, M, G), or standard RMS values vs Peak values.
- **Calculator Technique**: Master the **MODE** setups on your PRC-allowed calculator (Equation solver, Matrix, Complex MODE for AC Phasors, Vector for Statics).
- **Pro Tip**: Always draw the schematic or free-body diagram before writing equations.

*(Note: To enable live dynamic multi-turn generation with **${model}**, add your \`GEMINI_API_KEY\` in Settings > Secrets.)*`;
  }

  return { text: body };
}

// Multi-turn Gemini Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const {
      messages = [],
      model = 'gemini-3.5-flash',
      systemInstruction,
      stream = true,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Supported models per user requirements:
    // - gemini-3.1-pro-preview (Complex tasks)
    // - gemini-3.5-flash (General tasks)
    // - gemini-3.1-flash-lite (Fast tasks)
    const allowedModels = [
      'gemini-3.1-pro-preview',
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite',
    ];
    const selectedModel = allowedModels.includes(model) ? model : 'gemini-3.5-flash';

    const defaultSystemInstruction =
      'You are TopNotch AI — an elite, encouraging Philippine PRC Electronics and Communications Engineering (ECE) Licensure Examination professor and review mentor. ' +
      'You guide reviewees across Mathematics, Electronics Engineering, Communications (EST), and GEAS. ' +
      'Provide clear, rigorous, and pedagogical explanations. Include explicit formulas, step-by-step problem setups, common PRC board exam traps, mnemonics, and calculator shortcuts (e.g. a calculator VERIFIED PERMITTED under the selected PRC exam program). ' +
      'Format your output cleanly using markdown with clear headings, bullet points, and code blocks for formulas when appropriate.';

    const instruction = `${systemInstruction || defaultSystemInstruction}\nCalculator policy: ${BOARD_CALCULATOR_POLICY.notice} ${CALCULATOR_AI_GUARDRAIL}`;

    const ai = getGeminiClient();

    // If no API key configured, provide a rich fallback response
    if (!ai) {
      const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user')?.content || '';
      const fallbackResponse = generateCuratedFallbackChatResponse(lastUserMsg, selectedModel, instruction);

      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        res.write(`data: ${JSON.stringify({ text: fallbackResponse.text, model: selectedModel, isFallback: true })}\n\n`);
        res.write('data: [DONE]\n\n');
        return res.end();
      } else {
        return res.json({
          text: fallbackResponse.text,
          model: selectedModel,
          isFallback: true,
          message: 'GEMINI_API_KEY is not configured in Settings > Secrets. Provided curated syllabus response.',
        });
      }
    }

    // Format messages for @google/genai SDK
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const responseStream = await ai.models.generateContentStream({
        model: selectedModel,
        contents,
        config: {
          systemInstruction: instruction,
        },
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text, model: selectedModel })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      return res.end();
    } else {
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction: instruction,
        },
      });

      return res.json({
        text: response.text || '',
        model: selectedModel,
      });
    }
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    if (!res.headersSent) {
      return res.status(500).json({
        error: err.message || 'Failed to generate chat response from Gemini.',
      });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message || 'Error occurred during streaming.' })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }
  }
});

// HTTP Server and WebSocket Server for Gemini Live API
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true, maxPayload: 1_048_576 });

server.on('upgrade', (request, socket, head) => {
  const host = request.headers.host || `localhost:${PORT}`;
  const parsedUrl = new URL(request.url || '', `http://${host}`);
  if (parsedUrl.pathname === '/api/live') {
    if (!canUseAiApi({remoteAddress: request.socket.remoteAddress,
      origin: request.headers.origin, host: request.headers.host,
      tokenHeader: request.headers.authorization, configuredToken: process.env.BSECE_API_TOKEN})) {
      socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'); socket.destroy(); return;
    }
    if (!aiRateGate.allow(`${request.socket.remoteAddress}:live`, Date.now(), 12)) {
      socket.write('HTTP/1.1 429 Too Many Requests\r\nConnection: close\r\n\r\n'); socket.destroy(); return;
    }
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

wss.on('connection', (clientWs: WebSocket) => {
  let session: any = null;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    clientWs.send(
      JSON.stringify({
        type: 'error',
        errorType: 'MISSING_API_KEY',
        message:
          'GEMINI_API_KEY is not configured in Settings > Secrets. Please add your key to enable live voice conversations with gemini-3.1-flash-live-preview.',
      })
    );
  } else {
    clientWs.send(
      JSON.stringify({
        type: 'ready_to_start',
        model: 'gemini-3.1-flash-live-preview',
      })
    );
  }

  async function startLiveSession(
    voiceName = 'Zephyr',
    topicName?: string,
    customInstruction?: string
  ) {
    if (session) {
      try {
        session.close();
      } catch {}
      session = null;
    }

    const ai = getGeminiClient();
    if (!ai) {
      clientWs.send(
        JSON.stringify({
          type: 'error',
          errorType: 'MISSING_API_KEY',
          message:
            'GEMINI_API_KEY is missing or invalid. Please configure your key in Settings > Secrets.',
        })
      );
      return;
    }

    const baseInstruction =
      'You are TopNotch AI — an encouraging, world-class Philippine PRC Electronics and Communications Engineering (ECE) Licensure Examination oral reviewer and professor. ' +
      'You are speaking with an examinee in real-time voice mode. ' +
      'Keep your spoken responses concise, natural, and conversational (typically 1 to 3 spoken sentences per turn). ' +
      'Pronounce formulas and units clearly (e.g., "S sub n equals n over 2 times..." or "V sub CC minus I sub C times R sub C"). ' +
      'When quizzing the student, ask one clear question at a time and wait for their spoken reply. ' +
      'If the student gives a correct answer, praise them warmly and provide a quick board-exam tip or mnemonic. If they make a mistake, gently explain the trap or formula and encourage them.';

    const topicInstruction = topicName
      ? ` The current review topic is "${topicName}". Focus your initial greeting and questions on high-yield concepts, formulas, and common exam traps for this topic.`
      : ' Focus on high-yield ECE Board Examination topics across Mathematics, Electronics, Communications (EST), and GEAS.';

    const fullInstruction = customInstruction
      ? `${baseInstruction}${topicInstruction}\nAdditional instruction: ${customInstruction}`
      : `${baseInstruction}${topicInstruction}`;

    try {
      session = await ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName || 'Zephyr',
              },
            },
          },
          systemInstruction: fullInstruction,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: 'session_active',
                  model: 'gemini-3.1-flash-live-preview',
                  voiceName,
                  topicName,
                })
              );
            }
          },
          onmessage: (message: LiveServerMessage) => {
            if (clientWs.readyState !== WebSocket.OPEN) return;

            // Audio parts from model
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  clientWs.send(
                    JSON.stringify({
                      type: 'audio',
                      audio: part.inlineData.data,
                      mimeType: part.inlineData.mimeType || 'audio/pcm;rate=24000',
                    })
                  );
                }
              }
            }

            // Transcriptions
            if (message.serverContent?.outputTranscription?.text) {
              clientWs.send(
                JSON.stringify({
                  type: 'transcription',
                  sender: 'model',
                  text: message.serverContent.outputTranscription.text,
                })
              );
            }
            if (message.serverContent?.inputTranscription?.text) {
              clientWs.send(
                JSON.stringify({
                  type: 'transcription',
                  sender: 'user',
                  text: message.serverContent.inputTranscription.text,
                })
              );
            }
            if (message.serverContent?.interimInputTranscription?.text) {
              clientWs.send(
                JSON.stringify({
                  type: 'interim_transcription',
                  sender: 'user',
                  text: message.serverContent.interimInputTranscription.text,
                })
              );
            }

            // Interruption event
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: 'interrupted' }));
            }

            // Turn complete event
            if (message.serverContent?.turnComplete) {
              clientWs.send(JSON.stringify({ type: 'turn_complete' }));
            }
          },
          onerror: (err: any) => {
            console.error('Gemini Live callback error:', err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: 'error',
                  message: err?.message || 'Gemini Live encountered an error.',
                })
              );
            }
          },
          onclose: (e: any) => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: 'session_closed',
                  reason: e?.reason || 'Live session ended.',
                })
              );
            }
          },
        },
      });

      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            type: 'session_active',
            model: 'gemini-3.1-flash-live-preview',
            voiceName,
            topicName,
          })
        );
      }
    } catch (err: any) {
      console.error('Failed to establish Gemini Live connection:', err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            type: 'error',
            message: `Unable to connect to Gemini Live API: ${err.message || err}`,
          })
        );
      }
    }
  }

  clientWs.on('message', async (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'start') {
        await startLiveSession(msg.voiceName || 'Zephyr', msg.topicName, msg.customInstruction);
      } else if (msg.type === 'audio' && msg.audio) {
        if (!session) {
          await startLiveSession(msg.voiceName || 'Zephyr', msg.topicName);
        }
        if (session) {
          session.sendRealtimeInput({
            audio: {
              data: msg.audio,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
        }
      } else if (msg.type === 'text' && msg.text) {
        if (!session) {
          await startLiveSession(msg.voiceName || 'Zephyr', msg.topicName);
        }
        if (session) {
          session.sendRealtimeInput({
            text: msg.text,
          });
        }
      } else if (msg.type === 'audio_end') {
        if (session) {
          session.sendRealtimeInput({
            audioStreamEnd: true,
          });
        }
      } else if (msg.type === 'stop') {
        if (session) {
          try {
            session.close();
          } catch {}
          session = null;
        }
        clientWs.send(JSON.stringify({ type: 'session_stopped' }));
      }
    } catch (e) {
      console.error('Error handling client message:', e);
    }
  });

  clientWs.on('close', () => {
    if (session) {
      try {
        session.close();
      } catch {}
      session = null;
    }
  });
});

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.on('error', (error: NodeJS.ErrnoException) => {
    console.error(`Failed to bind ${HOST}:${PORT}: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT} with Gemini Live API support`);
  });
}

startServer().catch((error) => {
  console.error('Unable to start the BSECE application server:', error);
  process.exitCode = 1;
});
