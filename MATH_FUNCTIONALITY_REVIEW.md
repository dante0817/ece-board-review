# Math functionality and study-path review

Reviewed 9 October 2026. Scope: reconsideration of the previous design suggestions against the current v10.8 source, executable data probes, and official examination information. This review changes no application code. It is not a fresh mathematical re-solution of every question or a browser usability test.

## Decision

Keep one comprehensive content library and one recognizable topic interface. Provide two learning paths: Guided Learning and ECE Board Preparation. Add a course-specific profile only when a real syllabus can be mapped. Treat the paths as different recommendations, ordering, and assessment policies rather than separate applications or duplicated lesson screens.

The immediate priority is assessment integrity. A mode selector would currently expose the same unreliable score and readiness paths under two names.

## Reassessment of the original suggestions

| Suggestion | Verdict | Refined recommendation |
| --- | --- | --- |
| One comprehensive library | Keep | Share canonical concepts, original questions, explanations, and prerequisites. Define completeness against a particular syllabus or exam blueprint, not topic count. |
| Engineering Course and Board Review modes | Revise | Start with Guided Learning and ECE Board Preparation. A generic path should not imply alignment with every engineering course. Support an actual course profile later. |
| Different layouts | Limit | Preserve the topic shell, breadcrumbs, and tab locations. Change the main action, lesson density, question selection, and progress summary. Avoid maintaining two complete layouts. |
| Share learner progress | Refine | Share observed skill evidence and the mistake history. Keep course completion, practice performance, verified assessment, and board coverage distinct. Switching paths must not reset or promote mastery. |
| Timed board questions and calculator shortcuts | Revise urgently | Support unassisted assessment, model-specific calculator instruction, and a verified examination policy. A board label or difficult label alone does not establish exam suitability. |
| Hold out unseen questions for assessment | Keep, stage it | Separate instructional examples, guided practice, assessment variants, and mock forms. Track exposure at question-family level. Use explicitly labeled reused questions when independent evidence is unavailable. |
| Board Review as default | Conditional | Preserve it for existing reviewer users. Let new users select their goal once. Do not make every learner configure modes repeatedly. |
| Add an All Topics mode | Avoid | Keep All Topics as a catalog view or filter. It is an access mechanism, not a third learning goal. |

## Confirmed evidence issues

### 1. Readiness has two competing implementations

ReviewContext.tsx:2257 calculates algebraReadiness. It uses 95% coverage, a fallback latest score of 86%, and a fixed timed accuracy of 92%. BoardReadinessScreen.tsx:35 passes that result to MasteryGate.

MasteryGate.tsx:15 names the incoming readiness value _propReadiness and does not use it. Instead, it calculates its own criteria, uses 90% coverage, substitutes 86% when there is no test, and adds an overdue-review criterion. It also uses currentSubject unless an explicit subject prop is supplied. The board screen therefore does not reliably display the central Algebra readiness calculation.

Correction to the earlier review: the fixed 92% exists in the central model, but it is not the timed-accuracy criterion displayed by the current gate. The visible gate still has fabricated no-test evidence and conflicting rules.

MasteryGate also exposes a Test Gate toggle that forces every criterion to pass; the resulting state enables Move to Maintenance, which writes to real learner state. Keep demo simulation inside a demo/development environment or make it unable to mutate learner progress.

Recommended repair: one subject-explicit readiness calculation, null or Not assessed for missing evidence, documented criteria, and no fake performance fallbacks. Treat maintenance as a study-planning recommendation rather than a prediction of licensure success. Any manual maintenance override should remain visibly distinct from satisfying assessment criteria.

### 2. Topic quiz behavior is inconsistent

MathTopicUtilityViews.tsx:33 starts a review session labeled Timed Board Quiz. ActiveSessionView is a study-session interface, and ReviewModal accepts manually entered attempted/correct counts and a mastery override. This is suitable for recording offline work, but does not constitute an automatically graded in-app quiz.

RationalExpressionsScreen.tsx:1037 instead opens rational-expressions/QuizTab.tsx. This component initially shows a result. Its quiz array has five questions, while the introduction advertises ten. The timer is the literal 12:45 remaining. The result is the literal 8 / 10, Overall: 80%, dated 10 September 2024. Submission changes the view without deriving that result from selectedAnswers. Its subskill results and explanation of mastery remaining at 3/5 are static.

This is a stronger defect than the earlier review identified: an interactive answer selector leads to a predetermined result. Real Numbers also has a separate adaptive assessment implementation, so the app already contains useful machinery; reuse and consolidate it where suitable instead of assuming all assessment functionality must be written from scratch.

Recommended repair: one graded topic-assessment runner with explicit question availability, automatic scoring, a functioning timer when timing is requested, persisted results, and an honest empty-history state. Preserve manual offline logging as a separate evidence source.

### 3. Mixed-test scores are assigned to individual topics incorrectly

TimedMockExam.tsx:223 saves an all-subject exam under currentSubject.id. A mixed exam can consequently be treated as an Algebra test simply because Algebra is selected.

ReviewContext.tsx:1761 calculates a test's overall score and copies it into latestScore and potentially bestScore for every topic in topicIds. This happens even when a topic's own answers were all wrong. For example, a 9/10 mixed score can give a topic a 90% latest score despite its sole question being incorrect. These fields affect displayed progress and recommendations, even though this function does not directly set the 1–5 mastery value.

Recommended repair: record the actual exam scope and per-topic correct/attempted counts. Update topic evidence using its own questions. For manual aggregate logs with no breakdown, retain the aggregate result without inventing per-topic scores. Distinguish a topic drill, subject diagnostic, and whole-exam mock in structured data; do not infer those types from a free-text name.

### 4. Shared practice is susceptible to answer-position guessing

An executable probe found 252 of 260 shared practice questions have correctIndex 0. ReferenceInformedTopicScreen displays options in their authored order. The timed reference bank rotates options, which addresses that separate surface but does not repair shared practice.

I simulated choosing the first option once for every shared question, without using question content. The existing readiness function returned Ready for quiz or Strong evidence for 21 of the 23 reference-content entries; 20 were Strong evidence. The two exceptions were Relations & Functions and Rational Expressions. Rational Expressions intentionally has no questions in this shared bank and uses a dedicated bank; its exception is not evidence of a missing lesson.

This probe evaluates the local recommendation function, not canonical mastery or the visible maintenance gate. It demonstrates that local recommendations can be earned by a positional strategy.

Recommended repair: stable option identities and a per-attempt display permutation that remains fixed during rendering and review. Preserve author-defined order for items that require it, and remove letter-dependent option wording before shuffling. Persist the displayed order with assessment attempts so feedback remains reproducible.

### 5. Subskill evidence is much thinner than the totals suggest

The 260 shared questions span 214 topic/subskill groups. Of those groups, 176 contain only one question. Under referencePracticeMastery.ts:110, one correct answer with full coverage can produce the Strong subskill label. Repeated answers also contribute to lifetime aggregate accuracy, without distinguishing first attempts, answer exposure, independent attempts, or delayed retention checks.

Recommended repair: review whether labels represent durable skills or individual problem variants. Group closely related variants under assessable skills while retaining tags for specific traps. Display sample counts and separate Practiced once from stronger evidence. Store first-attempt and recent independent performance, plus delayed rechecks. A precise minimum should be calibrated against real learner data rather than presented as a validated threshold chosen by this review.

Existing 75%/85% thresholds can continue as transparent recommendations during transition. They should not be treated as established measures of board readiness. A diagnostic should remain accessible even when practice evidence is absent.

### 6. Mixed mocks lack the claimed board balance

generateMockExamQuestions draws from 37 curated cross-subject questions and appends Algebra reference questions when a larger set is requested. A 50-question set contains 26 Algebra, 2 Trigonometry, 3 Calculus, 9 Electronics, and 10 Communications questions: 31/50, or 62%, carry Mathematics subject IDs. This count is fixed by the pool construction even though order is randomized.

The default preset and its copy describe a Full ECE Board Simulation. Its preset is 50 questions and 120 minutes, and the active scratchpad includes formula reference material. These features are useful for supported practice, but the label overstates the current fidelity.

The official October 2026 program has four areas: Mathematics 20%, Electronics Engineering 30%, General Engineering and Applied Sciences 20%, and Electronics Systems and Technologies 30%. Mathematics is a four-hour block. The current model instead has Algebra 12%, Trigonometry 10%, Calculus 14%, Electronics 30%, and Communications 34%, with no GEAS subject category. Those stored weights describe neither the official top-level exam nor a complete Mathematics blueprint. See the [October 2026 PRC program](https://www.prc.gov.ph/sites/default/files/BECE%20exam%20program%20Oct%202026.pdf).

Recommended repair: separate teaching modules from official examination areas, and internal study priority from published weight. First label the existing feature Mixed practice mock. Then introduce topic quizzes, an Algebra diagnostic, and a Mathematics mock mapped to a verified blueprint. A whole-ECE simulation should follow adequate coverage of all four areas. When a blueprint quota cannot be met, display the shortfall instead of filling it with another domain.

PRC Resolution 10 (2022) says the enhanced TOS governs item coverage, weights, counts, and difficulty classification. Its [official resolution](https://www.prc.gov.ph/sites/default/files/EE2022-10%20published.pdf) supports making the blueprint an explicit, sourced data artifact. I verified the resolution and current exam program; repeated attempts to retrieve the TOS annex timed out during this follow-up. Exact within-Mathematics allocations remain to be verified before implementation.

### 7. Calculator instruction needs an exam-specific correction

mockExamQuestions.ts:24 recommends Casio 991ES equation mode. chatRoles.ts and the detailed Linear Equations materials likewise recommend fx-991ES/Plus and CW techniques in board contexts.

The [official October 2026 program](https://www.prc.gov.ph/sites/default/files/BECE%20exam%20program%20Oct%202026.pdf), pages 2–3, explicitly prohibits FX991ES and FX-991ES Plus. It includes the calculator-policy resolution and allowed-model list. Do not infer that the fx-991CW is permitted because it is newer or because another model in the family is allowed.

Recommended repair: retain useful calculator instruction for general learning, but tag the exact supported model and restrict board recommendations to verified exam policy. Update tutor prompts as well as visible lessons, so the tutor does not continue recommending a prohibited board model. Teach a valid manual method alongside calculator verification.

### 8. A combined mock pass is not an official passing result

The simulator uses a single score threshold. For an Algebra drill that can be an internal practice target. For a whole-board simulation, a single pooled percentage must not be labeled as equivalent to passing the actual examination.

[RA 9292, Section 16](https://lawphil.net/statutes/repacts/ra2004/ra_9292_2004.html) requires 70% in each subject and provides a conditional removal-examination route in specified circumstances. Therefore, official subject boundaries matter independently of the overall weighted summary. Keep the app's 85% or 90% preparation targets labeled as internal targets.

## Proposed experience

| Element | Guided Learning | ECE Board Preparation |
| --- | --- | --- |
| Starting screen | Prerequisites, current chapter, next objective | Coverage gaps, due review, weakest assessed area |
| Learn tab | Concepts, why a method works, worked steps, graph interpretation | Concise rules, method selection, conditions, traps; fuller explanation remains accessible |
| Practice tab | Progressive hints, numerical answers, step completion, modeling | Representative questions, mixed drills, pacing practice, allowed-model checks |
| Quiz tab | Objective-based independent checks, with timing optional | Independent timed checks and cumulative assessment |
| Progress tab | Syllabus objectives covered, demonstrated skills, remaining prerequisites | Verified domain coverage, subject performance, sample counts, timing, retention |
| Recommendation | Next unmet prerequisite/objective | Evidence gap or weakness balanced with due reviews and exam coverage |

Both paths need understanding and independent solving. Board preparation should not become a shortcut collection; guided learning should not hide timed practice from students who want it. Keep timing and assistance as explicit session policies rather than relying solely on the chosen path.

Start with one persistent goal selector and one primary next-action card. Add a real course profile with its name, version, syllabus topics, and chapter ordering when such a syllabus is supplied. Until then, Guided Learning is an honest label for a general foundation-to-advanced path.

For quadratics, both paths use the same concepts. Guided Learning introduces equivalent transformations, factoring, completing the square, and graph interpretation. Board Preparation begins with a short diagnostic, reviews the appropriate method and restrictions, and checks accuracy and pacing on unfamiliar variants. A failed check links to the corresponding explanation and then a fresh recheck.

## Content and assessment design

Keep three concepts separate: the lesson topic, the assessable skill, and the exam competency. One board competency may draw on several algebra skills; one algebra skill may support calculus, circuits, and control systems. Do not force one-to-one mapping or assign each Algebra row a guessed official percentage.

The current question difficulty field mixes Foundation/Standard/Mixed with ECE Application/Board-review style. Split difficulty, context, and assessment eligibility when expanding the bank. An engineering context does not automatically make an item difficult, and a foundational skill may still be necessary inside a board problem.

Track question families so a changed number does not automatically count as independent evidence. Reserve some original variants for quizzes; reserve separate forms for mocks as capacity grows. Repeated questions remain useful for remediation, but label their evidence accordingly.

For course depth, add worked reasoning and short numerical/step-completion tasks before attempting a general symbolic answer checker. Symbolic equivalence must preserve domain restrictions: x/x and 1 agree only where x is nonzero. Multiple test substitutions alone cannot establish a universal identity. A comprehensive CAS or automatic proof-grading system is a later decision, not a prerequisite for this redesign.

## Implementation order and acceptance criteria

1. Repair result integrity and misleading claims. No result before submission; no fixed score or countdown; no-test readiness is Not assessed; manual evidence is identifiable; a demo toggle cannot change real readiness; board calculator tips follow verified model policy.
2. Correct score recording. Mixed scope survives saving; per-topic scores use per-topic answers; aggregate manual logs do not fabricate topic breakdowns; unanswered questions count consistently; existing learner records retain their provenance where known.
3. Consolidate topic assessment and option handling. Quiz size matches available questions and interface copy; grading survives option permutation; explanations match the displayed attempt; assistance and pauses are recorded when relevant; attempts are saved once.
4. Define skills and coverage. Review single-item subskills; map learning objectives to representative questions; introduce explicit syllabus/board mappings and evidence counts; separate missing content from material merely not yet studied.
5. Add the learning paths. Switching preserves history and current lesson, changes the recommendation and emphasis, and never confers board readiness. Deep explanations remain available in both paths.
6. Expand validated banks and exam forms. Grow representative coverage and independent variants before advertising full simulations. Report unmet blueprint quotas. Evaluate outcomes using learner completion, independent accuracy, delayed checks, and pacing rather than session counts alone.

Do not require full syllabus completion before a learner can run a diagnostic. Do not present a topic average based on one or two items with the same certainty as a substantial assessment. Do not make a layout change a substitute for missing course content or board coverage.

## Verification and limits

This follow-up inspected the scoring, storage, readiness, custom quiz, shared practice, prerequisite, and mock-generation paths. Executable probes imported the real TypeScript content and practice-readiness functions to count questions/subskills and reproduce the first-option strategy and the 50-question subject distribution.

The preceding review ran TypeScript checking successfully. Its v10.8 validation chain failed only two packaging checks because node_modules and dist exist locally. Those directories are normal in a development checkout; packaging validation should run against the export package separately. The source validator checks structural consistency and stored answer-audit manifests. It does not establish empirical learning effectiveness, current PRC fidelity, or mathematical correctness by newly solving every item.

No application code or saved learner data was changed. The recommended design is a proposed direction supported by code findings; readiness thresholds and course alignment still require explicit curriculum definitions and learner validation.
