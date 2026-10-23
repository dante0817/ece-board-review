import { MockExamQuestion } from '../types';
import { ALGEBRA_REFERENCE_CONTENT } from './algebraReferenceContent';
import { BOARD_EXPANSION_QUESTIONS } from './boardExpansionQuestions';
import { TOS_EXPANSION_QUESTIONS_V1016 } from './tosCompetencyExpansionV1016';

const ORIGINAL_MOCK_EXAM_QUESTIONS: MockExamQuestion[] = [
  // --- MATHEMATICS: ALGEBRA & ADVANCED MATH ---
  {
    id: 'mock-q-01',
    subjectId: 'subj-math-algebra',
    subjectName: 'Algebra & Engineering Mathematics',
    topicId: 'top-arithmetic-seq',
    topicName: 'Arithmetic & Geometric Progressions',
    question:
      'The sum of the first 10 terms of an arithmetic progression is 155, and the sum of the first 20 terms is 610. Find the first term (a₁) and the common difference (d).',
    options: [
      { id: 'A', text: 'a₁ = 2, d = 3' },
      { id: 'B', text: 'a₁ = 3, d = 2' },
      { id: 'C', text: 'a₁ = 5, d = 4' },
      { id: 'D', text: 'a₁ = 1, d = 5' },
    ],
    correctOptionId: 'A',
    explanation:
      'Using S_n = (n/2)[2a₁ + (n-1)d]:\nFor n=10: 155 = 5(2a₁ + 9d)  => 2a₁ + 9d = 31\nFor n=20: 610 = 10(2a₁ + 19d) => 2a₁ + 19d = 61\nSubtracting the first from the second: 10d = 30  => d = 3.\nSubstituting back: 2a₁ + 27 = 31 => 2a₁ = 4 => a₁ = 2.',
    keyFormula: 'S_n = (n/2)[2a₁ + (n-1)d]',
    boardTip: 'Set up two linear equations for a₁ and d and solve by elimination or a verified permitted calculator method; do not use prohibited fx-991ES / fx-991ES Plus models in the October 2026 PRC examination.',
    difficulty: 'Easy',
  },
  {
    id: 'mock-q-02',
    subjectId: 'subj-math-algebra',
    subjectName: 'Algebra & Engineering Mathematics',
    topicId: 'top-geometric-seq',
    topicName: 'Geometric Sequences',
    question:
      'A ball is dropped from a height of 18 meters. Each time it bounces, it rebounds to 2/3 of its previous height. Find the total vertical distance traveled by the ball until it comes to rest.',
    options: [
      { id: 'A', text: '54 meters' },
      { id: 'B', text: '72 meters' },
      { id: 'C', text: '90 meters' },
      { id: 'D', text: '108 meters' },
    ],
    correctOptionId: 'C',
    explanation:
      'Total distance = Initial downward drop + 2 × (rebound heights).\nInitial drop = 18 m.\nRebounds form an infinite geometric series: 18(2/3) + 18(2/3)² + ... with a = 12 and r = 2/3.\nSum of rebounds = a / (1 - r) = 12 / (1 - 2/3) = 36 m.\nTotal distance = 18 + 2(36) = 18 + 72 = 90 meters.\nAlternative formula: D = H * (1 + r) / (1 - r) = 18 * (5/3) / (1/3) = 90 m.',
    keyFormula: 'Total Distance = H * (1 + r) / (1 - r)',
    boardTip: 'Do not forget that every bounce travels both upward and downward except the initial drop.',
    difficulty: 'Medium',
  },
  {
    id: 'mock-q-03',
    subjectId: 'subj-math-algebra',
    subjectName: 'Algebra & Engineering Mathematics',
    topicId: 'top-binomial-theorem',
    topicName: 'Binomial Theorem & Expansions',
    question:
      'Find the term independent of x in the expansion of (2x² - 1/x)⁹.',
    options: [
      { id: 'A', text: '672' },
      { id: 'B', text: '-672' },
      { id: 'C', text: '5376' },
      { id: 'D', text: '-5376' },
    ],
    correctOptionId: 'A',
    explanation:
      'General term: T_(r+1) = C(9, r) * (2x²)^(9 - r) * (-x⁻¹)^r = C(9, r) * 2^(9-r) * (-1)^r * x^(18 - 2r - r).\nFor term independent of x: 18 - 3r = 0  => r = 6.\nCoefficient = C(9, 6) * 2^(9 - 6) * (-1)⁶ = C(9, 3) * 2³ * 1 = 84 * 8 * 1 = 672.\nTherefore the coefficient is 672, which is option A.',
    keyFormula: 'T_(r+1) = C(n, r) * a^(n-r) * b^r',
    boardTip: 'Equate net power of x to 0 to solve for index r. Remember r starts at 0 for the 1st term.',
    difficulty: 'Medium',
  },
  {
    id: 'mock-q-04',
    subjectId: 'subj-math-algebra',
    subjectName: 'Algebra & Engineering Mathematics',
    topicId: 'top-logarithms',
    topicName: 'Logarithms & Exponential Equations',
    question:
      'Solve for x in the equation: log₂(x + 3) + log₂(x - 1) = 5.',
    options: [
      { id: 'A', text: 'x = 5' },
      { id: 'B', text: 'x = -7 and x = 5' },
      { id: 'C', text: 'x = 7' },
      { id: 'D', text: 'x = 2' },
    ],
    correctOptionId: 'A',
    explanation:
      'Combine logs: log₂[(x + 3)(x - 1)] = 5\n(x + 3)(x - 1) = 2⁵ = 32\nx² + 2x - 3 = 32  => x² + 2x - 35 = 0\n(x + 7)(x - 5) = 0  => x = -7 or x = 5.\nSince log requires positive arguments, x = -7 is extraneous (log₂(-4) is undefined in reals). Thus only x = 5 is valid.',
    keyFormula: 'log_b(A) + log_b(B) = log_b(AB) ; Argument > 0',
    boardTip: 'Always reject extraneous solutions where the inside of any logarithm becomes negative or zero.',
    difficulty: 'Easy',
  },
  {
    id: 'mock-q-05',
    subjectId: 'subj-math-algebra',
    subjectName: 'Algebra & Engineering Mathematics',
    topicId: 'top-complex-numbers',
    topicName: 'Complex Numbers',
    question:
      'Simplify (3 + 2i)(1 - 4i) and write the result in rectangular form a + bi.',
    options: [
      { id: 'A', text: '11 - 10i' },
      { id: 'B', text: '-5 - 10i' },
      { id: 'C', text: '11 + 10i' },
      { id: 'D', text: '-5 + 10i' },
    ],
    correctOptionId: 'A',
    explanation:
      'Multiply term by term: 3 - 12i + 2i - 8i². Since i² = -1, -8i² = +8. Combine real and imaginary parts: 3 + 8 - 10i = 11 - 10i.',
    keyFormula: 'i² = -1 ; (a+bi)(c+di) = (ac-bd) + (ad+bc)i',
    boardTip: 'Keep real and imaginary parts separate and replace every i² with -1 before combining terms.',
    difficulty: 'Medium',
  },
  {
    id: 'mock-q-06',
    subjectId: 'subj-math-algebra',
    subjectName: 'Algebra & Engineering Mathematics',
    topicId: 'top-partial-fractions',
    topicName: 'Partial Fractions & Polynomial Division',
    question:
      'In resolving (7x - 1) / (x² - x - 6) into partial fractions A/(x - 3) + B/(x + 2), what are the values of A and B?',
    options: [
      { id: 'A', text: 'A = 4, B = 3' },
      { id: 'B', text: 'A = 3, B = 4' },
      { id: 'C', text: 'A = 5, B = 2' },
      { id: 'D', text: 'A = -3, B = 10' },
    ],
    correctOptionId: 'A',
    explanation:
      'Denominator factorizes as (x - 3)(x + 2).\nBy Heaviside cover-up method:\nA = (7(3) - 1) / (3 + 2) = (21 - 1) / 5 = 20 / 5 = 4.\nB = (7(-2) - 1) / (-2 - 3) = (-14 - 1) / (-5) = -15 / -5 = 3.',
    keyFormula: 'Heaviside Cover-Up: A = numerator / remaining factors evaluated at pole',
    boardTip: 'For linear distinct factors, Heaviside cover-up method saves 3-4 minutes compared to expanding coefficients.',
    difficulty: 'Easy',
  },
  {
    id: 'mock-q-07',
    subjectId: 'subj-math-algebra',
    subjectName: 'Algebra & Engineering Mathematics',
    topicId: 'top-matrices',
    topicName: 'Matrices & Determinants (Cramer’s Rule)',
    question:
      'For a 3×3 matrix A with determinant det(A) = 4, what is the value of det(3A)?',
    options: [
      { id: 'A', text: '12' },
      { id: 'B', text: '36' },
      { id: 'C', text: '108' },
      { id: 'D', text: '324' },
    ],
    correctOptionId: 'C',
    explanation:
      'For an n×n square matrix, det(k · A) = k^n · det(A).\nHere n = 3 and k = 3, det(A) = 4.\ndet(3A) = 3³ × det(A) = 27 × 4 = 108.',
    keyFormula: 'det(k · A) = k^n · det(A) for n×n matrix',
    boardTip: 'Common board exam trap: reviewees multiply 3 × 4 = 12 without raising the scalar to matrix dimension n.',
    difficulty: 'Easy',
  },
  {
    id: 'mock-q-08',
    subjectId: 'subj-math-algebra',
    subjectName: 'Algebra & Engineering Mathematics',
    topicId: 'top-word-problems',
    topicName: 'Word Problems (Rate, Work, Mixture)',
    question:
      'Tank A can be filled by Pipe 1 in 6 hours and by Pipe 2 in 8 hours. Pipe 3 can drain the full tank in 12 hours. If all three pipes are opened simultaneously when the tank is empty, how long will it take to fill the tank?',
    options: [
      { id: 'A', text: '4.8 hours' },
      { id: 'B', text: '4.0 hours' },
      { id: 'C', text: '5.2 hours' },
      { id: 'D', text: '3.6 hours' },
    ],
    correctOptionId: 'A',
    explanation:
      'Net filling rate = Rate₁ + Rate₂ - Rate₃ = 1/6 + 1/8 - 1/12.\nCommon denominator is 24:\nNet rate = (4 + 3 - 2) / 24 = 5 / 24 tank per hour.\nTime to fill = 1 / (Net rate) = 24 / 5 = 4.8 hours (4 hours and 48 minutes).',
    keyFormula: 'Net Rate = 1/T_in1 + 1/T_in2 - 1/T_out ; Total Time = 1 / Net Rate',
    boardTip: 'Make sure drainage or leak rates are subtracted, not added.',
    difficulty: 'Medium',
  },
  {
    id: 'mock-q-09',
    subjectId: 'subj-math-trig',
    subjectName: 'Trigonometry & Geometry',
    topicId: 'top-trig-identities',
    topicName: 'Trigonometric Identities & Equations',
    question:
      'Simplify the expression: (sin 2θ) / (1 + cos 2θ).',
    options: [
      { id: 'A', text: 'tan θ' },
      { id: 'B', text: 'cot θ' },
      { id: 'C', text: 'sec θ' },
      { id: 'D', text: 'sin θ' },
    ],
    correctOptionId: 'A',
    explanation:
      'Use double angle identities:\nsin 2θ = 2 sin θ cos θ\n1 + cos 2θ = 1 + (2 cos² θ - 1) = 2 cos² θ\nRatio = (2 sin θ cos θ) / (2 cos² θ) = sin θ / cos θ = tan θ.',
    keyFormula: 'sin 2θ = 2 sin θ cos θ ; 1 + cos 2θ = 2 cos² θ',
    boardTip: 'If stuck on trig simplification, substitute θ = 30° into the question and test the four choices on your calculator.',
    difficulty: 'Easy',
  },
  {
    id: 'mock-q-10',
    subjectId: 'subj-math-calc',
    subjectName: 'Calculus & Differential Equations',
    topicId: 'top-derivatives',
    topicName: 'Maxima, Minima & Optimization',
    question:
      'An open rectangular box with a square base is to have a volume of 4,000 cm³. Find the dimensions of the base that minimizes the amount of material used (surface area).',
    options: [
      { id: 'A', text: 'Base = 20 cm × 20 cm, Height = 10 cm' },
      { id: 'B', text: 'Base = 10 cm × 10 cm, Height = 40 cm' },
      { id: 'C', text: 'Base = 15 cm × 15 cm, Height = 17.78 cm' },
      { id: 'D', text: 'Base = 25 cm × 25 cm, Height = 6.4 cm' },
    ],
    correctOptionId: 'A',
    explanation:
      'Let base side = x, height = y. Volume V = x²y = 4000  => y = 4000 / x².\nSurface area for open box (1 base + 4 sides): S = x² + 4xy = x² + 4x(4000 / x²) = x² + 16000 / x.\nTake derivative dS/dx = 2x - 16000 / x² = 0\n2x³ = 16000 => x³ = 8000 => x = 20 cm.\nHeight y = 4000 / 20² = 4000 / 400 = 10 cm.',
    keyFormula: 'S = x² + 4xy ; dS/dx = 0 at stationary point',
    boardTip: 'For an open-top box with square base of fixed volume, minimum surface area always occurs when base side = 2 × height (x = 2y).',
    difficulty: 'Medium',
  },

  // --- ELECTRONICS ENGINEERING ---
  {
    id: 'mock-q-11',
    subjectId: 'subj-electronics',
    subjectName: 'Electronics Engineering',
    topicId: 'top-semiconductor-diodes',
    topicName: 'Semiconductor Diodes & Power Supplies',
    question:
      'A silicon diode is operated in a circuit with a forward bias current of 10 mA at room temperature (T = 300 K). What is its dynamic AC resistance (r_d) assuming ideality factor η = 1?',
    options: [
      { id: 'A', text: '2.6 Ω' },
      { id: 'B', text: '26 Ω' },
      { id: 'C', text: '0.26 Ω' },
      { id: 'D', text: '52 Ω' },
    ],
    correctOptionId: 'A',
    explanation:
      'The dynamic resistance of a forward-biased diode is given by Shockley’s derivative:\nr_d = V_T / I_D = 26 mV / 10 mA = 2.6 Ω (where thermal voltage V_T ≈ 26 mV at 300 K).',
    keyFormula: 'r_d = η * V_T / I_D ; V_T = kT/q ≈ 26 mV at 300 K',
    boardTip: 'Thermal voltage V_T is standardly assumed as 26 mV at room temperature in PRC ECE board problems.',
    difficulty: 'Easy',
  },
  {
    id: 'mock-q-12',
    subjectId: 'subj-electronics',
    subjectName: 'Electronics Engineering',
    topicId: 'top-bjt-biasing',
    topicName: 'Bipolar Junction Transistors (BJT)',
    question:
      'In a common-emitter amplifier, if the DC current gain β = 120 and the emitter current I_E = 3.63 mA, what is the base current I_B?',
    options: [
      { id: 'A', text: '30 µA' },
      { id: 'B', text: '30.25 µA' },
      { id: 'C', text: '36.3 µA' },
      { id: 'D', text: '3.0 mA' },
    ],
    correctOptionId: 'A',
    explanation:
      'We know that I_E = (β + 1) * I_B.\nI_B = I_E / (β + 1) = 3.63 mA / (120 + 1) = 3.63 mA / 121 = 0.030 mA = 30 µA.',
    keyFormula: 'I_E = (β + 1) * I_B ; I_C = β * I_B',
    boardTip: 'Do not use I_C / β when given I_E; remember the (β + 1) factor for emitter current.',
    difficulty: 'Easy',
  },
  {
    id: 'mock-q-13',
    subjectId: 'subj-electronics',
    subjectName: 'Electronics Engineering',
    topicId: 'top-op-amps',
    topicName: 'Operational Amplifiers (Op-Amps)',
    question:
      'An ideal op-amp inverting amplifier configuration has input resistor R₁ = 10 kΩ and feedback resistor R_f = 100 kΩ. If an input voltage of +0.5 V is applied, what is the output voltage V_out and the voltage gain A_v?',
    options: [
      { id: 'A', text: 'A_v = -10, V_out = -5.0 V' },
      { id: 'B', text: 'A_v = 10, V_out = +5.0 V' },
      { id: 'C', text: 'A_v = -11, V_out = -5.5 V' },
      { id: 'D', text: 'A_v = +11, V_out = +5.5 V' },
    ],
    correctOptionId: 'A',
    explanation:
      'For an inverting op-amp configuration:\nVoltage gain A_v = -R_f / R₁ = -100 kΩ / 10 kΩ = -10.\nV_out = A_v * V_in = (-10) * (+0.5 V) = -5.0 V.',
    keyFormula: 'A_v(inverting) = -R_f / R_in ; A_v(non-inverting) = 1 + R_f / R_in',
    boardTip: 'Inverting amplifier has negative sign; non-inverting amplifier has 1 + (R_f / R_in).',
    difficulty: 'Easy',
  },
  {
    id: 'mock-q-14',
    subjectId: 'subj-electronics',
    subjectName: 'Electronics Engineering',
    topicId: 'top-digital-logic',
    topicName: 'Digital Logic Gates & Boolean Algebra',
    question:
      'According to De Morgan’s Laws, what is the Boolean complement of the expression: F = (A + B) · (C + D’)?',
    options: [
      { id: 'A', text: 'F’ = A’B’ + C’D' },
      { id: 'B', text: 'F’ = (A’ · B’) · (C’ · D)' },
      { id: 'C', text: 'F’ = (A + B)’ + (C + D’)' },
      { id: 'D', text: 'F’ = A’B’ + CD’' },
    ],
    correctOptionId: 'A',
    explanation:
      'Applying De Morgan’s Law (X · Y)’ = X’ + Y’:\nF’ = [(A + B) · (C + D’)]’ = (A + B)’ + (C + D’)’\nApplying De Morgan again: (A + B)’ = A’B’ and (C + D’)’ = C’(D’)’ = C’D.\nTherefore, F’ = A’B’ + C’D.',
    keyFormula: '(X + Y)’ = X’ · Y’  and  (X · Y)’ = X’ + Y’',
    boardTip: 'Break the line and change the sign.',
    difficulty: 'Medium',
  },
  {
    id: 'mock-q-15',
    subjectId: 'subj-electronics',
    subjectName: 'Electronics Engineering',
    topicId: 'top-power-supplies',
    topicName: 'Rectifiers & Filter Circuits',
    question:
      'A full-wave bridge rectifier is supplied by a 60 Hz AC source. What is the fundamental frequency of the output voltage ripple?',
    options: [
      { id: 'A', text: '60 Hz' },
      { id: 'B', text: '120 Hz' },
      { id: 'C', text: '30 Hz' },
      { id: 'D', text: '240 Hz' },
    ],
    correctOptionId: 'B',
    explanation:
      'A full-wave rectifier inverts both the positive and negative half cycles of the input sine wave, doubling the frequency of the ripple: f_ripple = 2 × f_in = 2 × 60 Hz = 120 Hz. (Half-wave rectifier ripple is equal to input frequency: 60 Hz).',
    keyFormula: 'f_ripple(Full-Wave) = 2 · f_in ; f_ripple(Half-Wave) = f_in',
    boardTip: 'Full-wave rectifiers (both center-tapped and bridge) produce 120 Hz ripple from 60 Hz mains.',
    difficulty: 'Easy',
  },

  // --- COMMUNICATIONS ENGINEERING ---
  {
    id: 'mock-q-16',
    subjectId: 'subj-communications',
    subjectName: 'Communications Engineering',
    topicId: 'top-am-modulation',
    topicName: 'Amplitude Modulation (AM)',
    question:
      'An unmodulated carrier has a power of 500 Watts. If it is amplitude-modulated with a sinusoidal signal with a modulation index of m = 0.8, what is the total transmitted power P_t?',
    options: [
      { id: 'A', text: '660 W' },
      { id: 'B', text: '820 W' },
      { id: 'C', text: '580 W' },
      { id: 'D', text: '740 W' },
    ],
    correctOptionId: 'A',
    explanation:
      'Total AM power formula: P_t = P_c * [1 + (m² / 2)].\nP_t = 500 * [1 + (0.8² / 2)] = 500 * [1 + (0.64 / 2)] = 500 * (1 + 0.32) = 500 * 1.32 = 660 Watts.',
    keyFormula: 'P_t = P_c · [1 + (m² / 2)]',
    boardTip: 'At 100% modulation (m = 1.0), total power is 1.5 times the carrier power (P_t = 1.5 P_c).',
    difficulty: 'Easy',
  },
  {
    id: 'mock-q-17',
    subjectId: 'subj-communications',
    subjectName: 'Communications Engineering',
    topicId: 'top-fm-modulation',
    topicName: 'Frequency Modulation (FM) & Carson’s Rule',
    question:
      'An FM signal has a peak frequency deviation Δf = 75 kHz and a modulating signal frequency f_m = 15 kHz. Using Carson’s rule, calculate the approximate bandwidth required for transmission.',
    options: [
      { id: 'A', text: '90 kHz' },
      { id: 'B', text: '150 kHz' },
      { id: 'C', text: '180 kHz' },
      { id: 'D', text: '210 kHz' },
    ],
    correctOptionId: 'C',
    explanation:
      'Carson’s Rule bandwidth formula:\nBW = 2 * (Δf + f_m) = 2 * (75 kHz + 15 kHz) = 2 * (90 kHz) = 180 kHz.',
    keyFormula: 'BW(Carson) = 2 · (Δf + f_m) = 2f_m(β + 1)',
    boardTip: 'Commercial FM radio broadcast stations in the Philippines use 200 kHz channel spacing based on this bandwidth.',
    difficulty: 'Easy',
  },
  {
    id: 'mock-q-18',
    subjectId: 'subj-communications',
    subjectName: 'Communications Engineering',
    topicId: 'top-transmission-lines',
    topicName: 'Transmission Lines & SWR',
    question:
      'A 50 Ω coaxial transmission line is terminated with a purely resistive load of Z_L = 150 Ω. What is the Voltage Standing Wave Ratio (VSWR) on the line?',
    options: [
      { id: 'A', text: '1.5' },
      { id: 'B', text: '2.0' },
      { id: 'C', text: '3.0' },
      { id: 'D', text: '0.33' },
    ],
    correctOptionId: 'C',
    explanation:
      'For purely resistive load termination:\nWhen R_L > Z₀: VSWR = R_L / Z₀ = 150 Ω / 50 Ω = 3.0.\nAlternatively, reflection coefficient Γ = (150 - 50)/(150 + 50) = 100/200 = 0.5.\nVSWR = (1 + |Γ|) / (1 - |Γ|) = (1 + 0.5) / (1 - 0.5) = 1.5 / 0.5 = 3.0.',
    keyFormula: 'VSWR = (1 + |Γ|) / (1 - |Γ|) ; For resistive load: R_L/Z₀ or Z₀/R_L (always ≥ 1)',
    boardTip: 'VSWR is always greater than or equal to 1. An answer less than 1 is impossible.',
    difficulty: 'Easy',
  },
  {
    id: 'mock-q-19',
    subjectId: 'subj-communications',
    subjectName: 'Communications Engineering',
    topicId: 'top-antennas',
    topicName: 'Antennas & Radiation Patterns',
    question:
      'What is the radiation resistance of an ideal half-wave dipole antenna in free space?',
    options: [
      { id: 'A', text: '50 Ω' },
      { id: 'B', text: '73 Ω' },
      { id: 'C', text: '300 Ω' },
      { id: 'D', text: '36.5 Ω' },
    ],
    correctOptionId: 'B',
    explanation:
      'The theoretical radiation resistance of a thin half-wave dipole antenna in free space is approximately 73.13 Ω (typically cited as 73 Ω, with an inductive reactance of +j42.5 Ω before trimming). For a quarter-wave monopole over an ideal ground plane, it is half: ~36.5 Ω.',
    keyFormula: 'R_rad(Half-Wave Dipole) ≈ 73 Ω ; Quarter-wave monopole ≈ 36.5 Ω',
    boardTip: 'Folded dipole is 4 times standard dipole: 4 × 73 ≈ 292 Ω (~300 Ω twin lead match).',
    difficulty: 'Easy',
  },
  {
    id: 'mock-q-20',
    subjectId: 'subj-communications',
    subjectName: 'Communications Engineering',
    topicId: 'top-information-theory',
    topicName: 'Shannon-Hartley Channel Capacity',
    question:
      'A voice channel has a bandwidth of 3,000 Hz and a Signal-to-Noise Ratio (SNR) of 30 dB. What is the theoretical maximum channel capacity C in bits per second?',
    options: [
      { id: 'A', text: '9,966 bps' },
      { id: 'B', text: '29,902 bps' },
      { id: 'C', text: '35,400 bps' },
      { id: 'D', text: '19,932 bps' },
    ],
    correctOptionId: 'B',
    explanation:
      'Convert SNR from dB to absolute ratio: SNR_ratio = 10^(30 / 10) = 10³ = 1000.\nShannon’s formula: C = B * log₂(1 + S/N)\nC = 3000 * log₂(1 + 1000) = 3000 * log₂(1001)\nSince 2⁹ = 512 and 2¹⁰ = 1024, log₂(1001) ≈ 9.9672.\nC = 3000 * 9.9672 ≈ 29,902 bps (approx 29.9 kbps).',
    keyFormula: 'C = B · log₂(1 + S/N) ; S/N must be linear ratio, NOT dB',
    boardTip: 'Fatal trap: inserting 30 directly into Shannon formula instead of converting 30 dB to 1000.',
    difficulty: 'Medium',
  },

  // Additional High-Yield ECE Questions for 50-Question Full Simulation
  {
    id: 'mock-q-21',
    subjectId: 'subj-math-algebra',
    subjectName: 'Algebra & Engineering Mathematics',
    topicId: 'top-quadratics',
    topicName: 'Quadratic Equations & Discriminants',
    question:
      'For what value of k will the roots of the equation 2x² - kx + 18 = 0 be real and equal?',
    options: [
      { id: 'A', text: 'k = ±12' },
      { id: 'B', text: 'k = ±6' },
      { id: 'C', text: 'k = ±9' },
      { id: 'D', text: 'k = ±18' },
    ],
    correctOptionId: 'A',
    explanation:
      'For real and equal roots, discriminant Δ = b² - 4ac = 0.\n(-k)² - 4(2)(18) = 0\nk² - 144 = 0  => k² = 144  => k = ±12.',
    keyFormula: 'Discriminant: Δ = b² - 4ac = 0 for equal roots',
    boardTip: 'Remember both positive and negative values: ±12.',
    difficulty: 'Easy',
  },
  {
    id: 'mock-q-22',
    subjectId: 'subj-math-algebra',
    subjectName: 'Algebra & Engineering Mathematics',
    topicId: 'top-inequalities',
    topicName: 'Inequalities & Absolute Values',
    question:
      'Solve the inequality: |2x - 5| < 9.',
    options: [
      { id: 'A', text: '-2 < x < 7' },
      { id: 'B', text: 'x < -2 or x > 7' },
      { id: 'C', text: '-7 < x < 7' },
      { id: 'D', text: '2 < x < 9' },
    ],
    correctOptionId: 'A',
    explanation:
      '|u| < a is equivalent to -a < u < a.\n-9 < 2x - 5 < 9\nAdd 5 to all parts: -4 < 2x < 14\nDivide by 2: -2 < x < 7.',
    keyFormula: '|x| < a  <=>  -a < x < a',
    boardTip: 'Remember to reverse inequality signs when multiplying or dividing by negative numbers.',
    difficulty: 'Easy',
  },
  {
    id: 'mock-q-23',
    subjectId: 'subj-electronics',
    subjectName: 'Electronics Engineering',
    topicId: 'top-jfet-mosfet',
    topicName: 'JFETs & MOSFETs',
    question:
      'An n-channel JFET has I_DSS = 12 mA and pinch-off voltage V_P = -4 V. What is the drain current I_D when the gate-to-source voltage V_GS = -1 V?',
    options: [
      { id: 'A', text: '6.75 mA' },
      { id: 'B', text: '9.0 mA' },
      { id: 'C', text: '3.0 mA' },
      { id: 'D', text: '4.5 mA' },
    ],
    correctOptionId: 'A',
    explanation:
      'Use Shockley’s equation for JFET:\nI_D = I_DSS * [1 - (V_GS / V_P)]²\nI_D = 12 mA * [1 - (-1 / -4)]² = 12 * (1 - 0.25)² = 12 * (0.75)² = 12 * 0.5625 = 6.75 mA.',
    keyFormula: 'Shockley: I_D = I_DSS · [1 - (V_GS / V_P)]²',
    boardTip: 'When V_GS = 0, I_D = I_DSS. When V_GS = V_P, I_D = 0.',
    difficulty: 'Medium',
  },
  {
    id: 'mock-q-24',
    subjectId: 'subj-communications',
    subjectName: 'Communications Engineering',
    topicId: 'top-satellite-comm',
    topicName: 'Satellite & Microwave Communications',
    question:
      'What is the orbital altitude of a geostationary earth orbit (GEO) satellite above the Earth’s surface (mean radius R_E = 6,378 km)?',
    options: [
      { id: 'A', text: '35,786 km (~22,236 miles)' },
      { id: 'B', text: '42,164 km' },
      { id: 'C', text: '20,200 km' },
      { id: 'D', text: '1,000 km' },
    ],
    correctOptionId: 'A',
    explanation:
      'The orbital radius of a GEO satellite from Earth’s center is approximately 42,164 km. Subtracting Earth’s radius (~6,378 km) gives the altitude above mean sea level: 42,164 - 6,378 = 35,786 km (often rounded to 36,000 km in quick calculations).',
    keyFormula: 'GEO Altitude = r_orbit - R_earth ≈ 35,786 km',
    boardTip: 'Pay attention to whether the question asks for distance from Earth’s center (42,164 km) or altitude above surface (35,786 km).',
    difficulty: 'Easy',
  },
  {
    id: 'mock-q-25',
    subjectId: 'subj-communications',
    subjectName: 'Communications Engineering',
    topicId: 'top-fiber-optics',
    topicName: 'Fiber Optic Communications',
    question:
      'An optical fiber has a core refractive index n₁ = 1.48 and a cladding refractive index n₂ = 1.46. Calculate the Numerical Aperture (NA) of the fiber in air (n₀ = 1.0).',
    options: [
      { id: 'A', text: '0.242' },
      { id: 'B', text: '0.059' },
      { id: 'C', text: '0.412' },
      { id: 'D', text: '0.125' },
    ],
    correctOptionId: 'A',
    explanation:
      'Numerical Aperture formula:\nNA = √(n₁² - n₂²) = √(1.48² - 1.46²) = √(2.1904 - 2.1316) = √(0.0588) ≈ 0.242487, which rounds to 0.242 to three decimal places (not 0.243).',
    keyFormula: 'NA = √(n₁² - n₂²) = sin θ_acceptance',
    boardTip: 'Core index n₁ must always be higher than cladding index n₂ for total internal reflection to occur.',
    difficulty: 'Medium',
  },
  {
    id: 'mock-q-26',
    subjectId: 'subj-math-calc',
    subjectName: 'Calculus & Differential Equations',
    topicId: 'top-integration',
    topicName: 'Indefinite & Definite Integrals',
    question:
      'Evaluate the definite integral: ∫ from 0 to 1 of x · e^(x) dx.',
    options: [
      { id: 'A', text: '1' },
      { id: 'B', text: 'e - 1' },
      { id: 'C', text: 'e' },
      { id: 'D', text: '2' },
    ],
    correctOptionId: 'A',
    explanation:
      'Integration by parts: ∫ u dv = uv - ∫ v du.\nLet u = x (du = dx), dv = e^x dx (v = e^x).\n∫ x e^x dx = x e^x - ∫ e^x dx = (x - 1)e^x.\nEvaluated from 0 to 1:\n[(1 - 1)e¹] - [(0 - 1)e⁰] = 0 - (-1)(1) = 1.',
    keyFormula: '∫ u dv = uv - ∫ v du',
    boardTip: 'Tabular integration or DI method is fastest for polynomials times exponentials.',
    difficulty: 'Easy',
  },
  {
    id: 'mock-q-27',
    subjectId: 'subj-math-calc',
    subjectName: 'Calculus & Differential Equations',
    topicId: 'top-diff-equations',
    topicName: 'First-Order Differential Equations',
    question:
      'Solve the differential equation: dy/dx + 2y = 4 with initial condition y(0) = 5.',
    options: [
      { id: 'A', text: 'y = 2 + 3e^(-2x)' },
      { id: 'B', text: 'y = 4 + e^(-2x)' },
      { id: 'C', text: 'y = 2 + 3e^(2x)' },
      { id: 'D', text: 'y = 5e^(-2x)' },
    ],
    correctOptionId: 'A',
    explanation:
      'Integrating factor IF = e^(∫ 2 dx) = e^(2x).\nd/dx [y · e^(2x)] = 4e^(2x)\ny · e^(2x) = ∫ 4e^(2x) dx = 2e^(2x) + C\ny = 2 + C · e^(-2x).\nUsing y(0) = 5: 5 = 2 + C  => C = 3.\nTherefore, y = 2 + 3e^(-2x).',
    keyFormula: 'IF = e^(∫ P(x) dx) ; y · IF = ∫ Q(x) · IF dx + C',
    boardTip: 'Standard linear first order form matches transient RC discharge circuits: y(t) = y_final + (y_init - y_final)e^(-t/τ).',
    difficulty: 'Medium',
  },
  {
    id: 'mock-q-28',
    subjectId: 'subj-electronics',
    subjectName: 'Electronics Engineering',
    topicId: 'top-zener-regulators',
    topicName: 'Zener Voltage Regulators',
    question:
      'A 10 V Zener diode with maximum power rating P_Zmax = 1 W is used to regulate an unregulated DC supply varying between 15 V and 20 V. What is the minimum series resistance R_S required to prevent exceeding P_Zmax at no-load condition?',
    options: [
      { id: 'A', text: '100 Ω' },
      { id: 'B', text: '50 Ω' },
      { id: 'C', text: '200 Ω' },
      { id: 'D', text: '150 Ω' },
    ],
    correctOptionId: 'A',
    explanation:
      'Maximum Zener current I_Zmax = P_Zmax / V_Z = 1 W / 10 V = 0.1 A = 100 mA.\nAt no-load, all current from supply passes through Zener diode.\nWorst case is maximum input voltage V_in(max) = 20 V.\nVoltage across series resistor V_Rs = V_in(max) - V_Z = 20 V - 10 V = 10 V.\nMinimum series resistance R_S(min) = V_Rs / I_Zmax = 10 V / 0.1 A = 100 Ω.',
    keyFormula: 'R_S(min) = (V_in,max - V_Z) / I_Z,max',
    boardTip: 'Always calculate R_S(min) using maximum input voltage and zero load current.',
    difficulty: 'Medium',
  },
  {
    id: 'mock-q-29',
    subjectId: 'subj-electronics',
    subjectName: 'Electronics Engineering',
    topicId: 'top-oscillators',
    topicName: 'Oscillator Circuits & Barkhausen Criterion',
    question:
      'According to the Barkhausen criterion, what are the two required conditions for sustained sinusoidal oscillation in a feedback circuit?',
    options: [
      { id: 'A', text: 'Loop gain |Aβ| = 1 and loop phase shift = 0° (or 360°)' },
      { id: 'B', text: 'Loop gain |Aβ| > 10 and phase shift = 180°' },
      { id: 'C', text: 'Loop gain |Aβ| < 1 and phase shift = 90°' },
      { id: 'D', text: 'Loop gain |Aβ| = 0 and phase shift = 0°' },
    ],
    correctOptionId: 'A',
    explanation:
      'Barkhausen criteria for oscillation:\n1. Magnitude condition: The magnitude of loop gain |Aβ| must equal unity (|Aβ| = 1).\n2. Phase condition: Total phase shift around the feedback loop must be an integer multiple of 360° (or 0°), providing positive feedback.',
    keyFormula: '|A · β| = 1  and  ∠(A · β) = 0° (or 2πn)',
    boardTip: 'To start oscillations, loop gain must be slightly greater than 1 initially, then settle to 1.',
    difficulty: 'Easy',
  },
  {
    id: 'mock-q-30',
    subjectId: 'subj-communications',
    subjectName: 'Communications Engineering',
    topicId: 'top-sampling-nyquist',
    topicName: 'Nyquist Sampling Theorem & PCM',
    question:
      'An analog audio signal with highest frequency component f_max = 4 kHz is to be converted to PCM with 8-bit quantization. What is the theoretical minimum Nyquist sampling rate and the resulting transmission bit rate?',
    options: [
      { id: 'A', text: 'Sampling Rate = 8 kHz, Bit Rate = 64 kbps' },
      { id: 'B', text: 'Sampling Rate = 4 kHz, Bit Rate = 32 kbps' },
      { id: 'C', text: 'Sampling Rate = 16 kHz, Bit Rate = 128 kbps' },
      { id: 'D', text: 'Sampling Rate = 8 kHz, Bit Rate = 32 kbps' },
    ],
    correctOptionId: 'A',
    explanation:
      'Nyquist minimum sampling rate: f_s = 2 * f_max = 2 * 4 kHz = 8,000 samples/second.\nBit rate R_b = f_s * n = 8,000 samples/s * 8 bits/sample = 64,000 bits/sec = 64 kbps.\n(This is the standard ITU-T G.711 DS0 voice telephony standard).',
    keyFormula: 'f_s ≥ 2 · f_max ; R_b = f_s · n (bits/second)',
    boardTip: 'Classic telephony DS0 standard in ECE boards: 8 kHz × 8 bits = 64 kbps.',
    difficulty: 'Easy',
  },
  {
    id: 'mock-q-31',
    subjectId: 'subj-communications',
    subjectName: 'Communications Engineering',
    topicId: 'top-superheterodyne',
    topicName: 'Superheterodyne Receivers & Image Frequency',
    question:
      'An AM broadcast receiver is tuned to an incoming station at 1,000 kHz. If the Intermediate Frequency (IF) is standard 455 kHz and high-side local oscillator mixing is used, what is the image frequency?',
    options: [
      { id: 'A', text: '1,910 kHz' },
      { id: 'B', text: '1,455 kHz' },
      { id: 'C', text: '545 kHz' },
      { id: 'D', text: '2,000 kHz' },
    ],
    correctOptionId: 'A',
    explanation:
      'For high-side injection: f_LO = f_signal + f_IF = 1000 + 455 = 1455 kHz.\nThe image frequency is: f_image = f_signal + 2 * f_IF = 1000 kHz + 2(455 kHz) = 1000 + 910 = 1,910 kHz.',
    keyFormula: 'f_image = f_signal + 2 · f_IF (high-side injection)',
    boardTip: 'Image frequency is separated from desired frequency by exactly 2 times the IF.',
    difficulty: 'Medium',
  },
  {
    id: 'mock-q-32',
    subjectId: 'subj-math-algebra',
    subjectName: 'Algebra & Engineering Mathematics',
    topicId: 'top-word-problems',
    topicName: 'Algebraic Modeling & Word Problems',
    question:
      'How many liters of a 20% acid solution must be mixed with 30 liters of a 70% acid solution to produce a mixture that is 50% acid?',
    options: [
      { id: 'A', text: '20 liters' },
      { id: 'B', text: '25 liters' },
      { id: 'C', text: '15 liters' },
      { id: 'D', text: '35 liters' },
    ],
    correctOptionId: 'A',
    explanation:
      'Let x = liters of 20% solution.\nPure acid equation: 0.20(x) + 0.70(30) = 0.50(x + 30)\n0.20x + 21 = 0.50x + 15\n21 - 15 = 0.50x - 0.20x\n6 = 0.30x  => x = 6 / 0.30 = 20 liters.',
    keyFormula: 'C₁V₁ + C₂V₂ = C_final · (V₁ + V₂)',
    boardTip: 'Set up pure component balance. Can also be solved using alligation alternate method.',
    difficulty: 'Easy',
  },
  {
    id: 'mock-q-33',
    subjectId: 'subj-electronics',
    subjectName: 'Electronics Engineering',
    topicId: 'top-555-timer',
    topicName: '555 Timer IC & Multivibrators',
    question:
      'In a 555 timer IC connected in astable multivibrator mode with R_A = 4.7 kΩ, R_B = 10 kΩ, and C = 0.01 µF, what is the frequency of oscillation?',
    options: [
      { id: 'A', text: '5.83 kHz' },
      { id: 'B', text: '10.2 kHz' },
      { id: 'C', text: '2.92 kHz' },
      { id: 'D', text: '14.4 kHz' },
    ],
    correctOptionId: 'A',
    explanation:
      'Frequency formula for 555 astable:\nf = 1.44 / [(R_A + 2R_B) · C]\nf = 1.44 / [(4.7 kΩ + 2 × 10 kΩ) · (0.01 × 10⁻⁶ F)]\nf = 1.44 / [(24.7 × 10³ Ω) · (10⁻⁸ F)] = 1.44 / (2.47 × 10⁻⁴) ≈ 5,830 Hz = 5.83 kHz.',
    keyFormula: 'f = 1.44 / [(R_A + 2R_B) · C] ; Duty Cycle = (R_A + R_B)/(R_A + 2R_B)',
    boardTip: 'Notice the factor 2 multiplied by R_B, because capacitor discharges only through R_B.',
    difficulty: 'Medium',
  },
  {
    id: 'mock-q-34',
    subjectId: 'subj-communications',
    subjectName: 'Communications Engineering',
    topicId: 'top-decibels-link',
    topicName: 'Decibels, Neper & Link Budget',
    question:
      'A microwave transmitter delivers 20 Watts of power. What is this power expressed in dBm?',
    options: [
      { id: 'A', text: '+43 dBm' },
      { id: 'B', text: '+13 dBm' },
      { id: 'C', text: '+20 dBm' },
      { id: 'D', text: '+37 dBm' },
    ],
    correctOptionId: 'A',
    explanation:
      'dBm = 10 * log₁₀(P_mW / 1 mW).\n20 Watts = 20,000 mW = 2 × 10⁴ mW.\ndBm = 10 * log₁₀(20,000) = 10 * (log₁₀ 2 + log₁₀ 10⁴) = 10 * (0.3010 + 4) = 10 * 4.3010 ≈ 43.01 dBm.',
    keyFormula: 'P(dBm) = 10 · log₁₀(P / 1 mW) ; 1 W = 30 dBm, 10 W = 40 dBm, 20 W = 43 dBm',
    boardTip: 'Quick rule of thumb: 1 W = 30 dBm. Doubling power adds 3 dB (+3 dB). 10 W = 40 dBm, 20 W = 43 dBm.',
    difficulty: 'Easy',
  },
  {
    id: 'mock-q-35',
    subjectId: 'subj-math-trig',
    subjectName: 'Trigonometry & Geometry',
    topicId: 'top-spherical-trig',
    topicName: 'Spherical Trigonometry (Napier’s Rules)',
    question:
      'Using Napier’s Rules for a right spherical triangle where C = 90°, what is the relation between the sine of the middle part and the cosine of the opposite parts for hypotenuse c and legs a and b?',
    options: [
      { id: 'A', text: 'sin(co-c) = cos a · cos b => cos c = cos a · cos b' },
      { id: 'B', text: 'sin c = sin a · sin b' },
      { id: 'C', text: 'tan c = tan a · tan b' },
      { id: 'D', text: 'cos c = sin a · sin b' },
    ],
    correctOptionId: 'A',
    explanation:
      'Napier’s Rule 2: "The sine of any middle part is equal to the product of the cosines of the opposite parts" (Sin-Cos-Opp).\nMiddle part = co-c (complement of c = 90° - c).\nOpposite parts = a and b (NOT their complements).\nsin(90° - c) = cos a · cos b  => cos c = cos a · cos b (Spherical Pythagorean Theorem).',
    keyFormula: 'sin(Middle) = cos(Opposite₁) · cos(Opposite₂) ; cos c = cos a · cos b',
    boardTip: 'Remember Napier mnemonic: Sin-Tan-Adj and Sin-Cos-Opp.',
    difficulty: 'Medium',
  },
  {
    id: 'mock-q-36',
    subjectId: 'subj-math-algebra',
    subjectName: 'Algebra & Engineering Mathematics',
    topicId: 'top-order-operations',
    topicName: 'Order of Operations & Algebraic Properties',
    question:
      'Evaluate the exact value of the expression: -3² - 2[5 - (2 - 4)³] ÷ 3.',
    options: [
      { id: 'A', text: '-53/3 (approx. -17.67)' },
      { id: 'B', text: '1/3 (approx. +0.33)' },
      { id: 'C', text: '-11' },
      { id: 'D', text: '-35/3 (approx. -11.67)' },
    ],
    correctOptionId: 'A',
    explanation:
      'Inner grouping: (2 - 4) = -2.\nExponents: (-2)³ = -8, and -3² = -(3²) = -9 (unary negation has lower precedence than exponentiation).\nBrackets: [5 - (-8)] = 5 + 8 = 13.\nMultiply & Divide (Left-to-Right): 2 × 13 = 26, then 26 ÷ 3 = 26/3.\nSubtract: -9 - 26/3 = -27/3 - 26/3 = -53/3 ≈ -17.67.',
    keyFormula: '-a² = -(a²) ≠ (-a)² ; Grouping -> Exponents -> Mult/Div -> Add/Sub',
    boardTip: 'Option B is the classic distractor designed for candidates who mistakenly square the negative sign to get +9.',
    difficulty: 'Medium',
  },
  {
    id: 'mock-q-37',
    subjectId: 'subj-math-algebra',
    subjectName: 'Algebra & Engineering Mathematics',
    topicId: 'top-algebraic-expressions',
    topicName: 'Algebraic Expressions & Terms',
    question:
      'Which of the following algebraic transformations is mathematically VALID for all non-zero real numbers a and b?',
    options: [
      { id: 'A', text: '-(a - b) = b - a' },
      { id: 'B', text: '√(a² + b²) = a + b' },
      { id: 'C', text: '(a + b)² = a² + b²' },
      { id: 'D', text: '1 / (a + b) = 1/a + 1/b' },
    ],
    correctOptionId: 'A',
    explanation:
      'Distributing the negative sign: -(a - b) = -a + b = b - a (Commutative Property of Addition).\nOptions B, C, and D are the classic "Three Freshmen Fallacies": radicals, integer powers, and reciprocals DO NOT distribute over addition.',
    keyFormula: '-(a - b) = -a + b = b - a',
    boardTip: 'Remember that powers, roots, and reciprocals only distribute across multiplication and division, NEVER addition.',
    difficulty: 'Easy',
  },
];

/**
 * Reference-informed Algebra questions that are mature enough for timed assessment.
 * Foundation items remain inside topic practice; timed mocks use Standard/Mixed/ECE/
 * Board-review items only. Option order is deterministically rotated so the generated
 * bank does not inherit the authoring convention that often places the keyed answer first.
 */
/** Preserve original 2019-2026 legacy IDs; append verified original v10.14 practice variants. */
export const MOCK_EXAM_QUESTIONS: MockExamQuestion[] = [
  ...ORIGINAL_MOCK_EXAM_QUESTIONS,
  ...BOARD_EXPANSION_QUESTIONS,
  ...TOS_EXPANSION_QUESTIONS_V1016,
];

const rotateAssessmentOptions = (
  questionId: string,
  options: string[],
  correctIndex: number
): { options: MockExamQuestion['options']; correctOptionId: string } => {
  const ids = ['A', 'B', 'C', 'D', 'E', 'F'];
  const offset = options.length > 0
    ? [...questionId].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % options.length
    : 0;
  const indexed = options.map((text, index) => ({ text, originalIndex: index }));
  const rotated = [...indexed.slice(offset), ...indexed.slice(0, offset)];
  const keyedIndex = rotated.findIndex((item) => item.originalIndex === correctIndex);

  return {
    options: rotated.map((item, index) => ({ id: ids[index] ?? String(index + 1), text: item.text })),
    correctOptionId: ids[keyedIndex] ?? String(keyedIndex + 1),
  };
};

export const ALGEBRA_REFERENCE_ASSESSMENT_QUESTIONS: MockExamQuestion[] = Object.values(
  ALGEBRA_REFERENCE_CONTENT
).flatMap((topic) =>
  topic.practiceQuestions
    .filter((question) => question.difficulty !== 'Foundation')
    .map((question) => {
      const rotated = rotateAssessmentOptions(question.id, question.options, question.correctIndex);
      return {
        id: `ref-assess-${question.id}`,
        subjectId: 'subj-math-algebra',
        subjectName: 'Algebra & Engineering Mathematics',
        topicId: topic.canonicalTopicId,
        topicName: topic.title,
        question: question.prompt,
        options: rotated.options,
        correctOptionId: rotated.correctOptionId,
        explanation: question.explanation,
        boardTip: `Reference-informed ${question.difficulty} item · ${question.subskill}`,
        difficulty: question.difficulty === 'Board-review style' ? 'Hard' : 'Medium',
      } satisfies MockExamQuestion;
    })
);

const shuffleQuestions = (pool: MockExamQuestion[]): MockExamQuestion[] => {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Number of unique questions currently available for a requested scope.
 * Comprehensive mocks preserve the curated cross-subject bank as their primary pool;
 * the reference-informed Algebra pool is available only as unique filler for longer sets.
 */
export const getAvailableMockQuestionCount = (subjectId: string = 'all'): number => {
  if (subjectId === 'all') {
    return MOCK_EXAM_QUESTIONS.length + ALGEBRA_REFERENCE_ASSESSMENT_QUESTIONS.length;
  }
  if (subjectId === 'subj-math-algebra') {
    return (
      MOCK_EXAM_QUESTIONS.filter((q) => q.subjectId === subjectId).length +
      ALGEBRA_REFERENCE_ASSESSMENT_QUESTIONS.length
    );
  }
  return MOCK_EXAM_QUESTIONS.filter((q) => q.subjectId === subjectId).length;
};

/**
 * Assemble a unique-question mock set without cloning or cycling items.
 *
 * Integrity policy:
 * - Algebra-only mocks draw from the curated Algebra mock items plus the audited
 *   reference-informed assessment pool.
 * - Comprehensive mocks use only the curated cross-subject pool while the requested
 *   count fits that pool. Longer comprehensive mocks append only as many unique
 *   Algebra reference items as needed; this is availability filler, not TOS weighting.
 * - Other subject-specific mocks are capped by the unique curated items available.
 */
export function generateMockExamQuestions(
  count: number,
  subjectId: string = 'all'
): MockExamQuestion[] {
  const target = Math.max(0, Math.floor(count));

  if (subjectId === 'subj-math-algebra') {
    const algebraPool = [
      ...MOCK_EXAM_QUESTIONS.filter((q) => q.subjectId === subjectId),
      ...ALGEBRA_REFERENCE_ASSESSMENT_QUESTIONS,
    ];
    return shuffleQuestions(algebraPool).slice(0, target);
  }

  if (subjectId === 'all') {
    const base = shuffleQuestions(MOCK_EXAM_QUESTIONS);
    if (target <= base.length) return base.slice(0, target);

    const fillerNeeded = target - base.length;
    const filler = shuffleQuestions(ALGEBRA_REFERENCE_ASSESSMENT_QUESTIONS).slice(0, fillerNeeded);
    return [...base, ...filler];
  }

  const subjectPool = MOCK_EXAM_QUESTIONS.filter((q) => q.subjectId === subjectId);
  return shuffleQuestions(subjectPool).slice(0, target);
}

