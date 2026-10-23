import { AppArtwork } from '../common/AppArtwork';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Sliders, Crosshair, AlertTriangle, CheckCircle2, EyeOff, ArrowRight } from 'lucide-react';
import { MathFormula } from '../MathFormula';

export interface SingularityPoint {
  x: number;
  type: 'hole' | 'asymptote';
  y?: number; // defined for holes
  factor: string;
  cancelled: boolean;
  explanation: string;
  limitLeft?: string;
  limitRight?: string;
  boardNote?: string;
}

export interface RationalPreset {
  id: string;
  name: string;
  shortFormula: string;
  badge: string;
  badgeColor: string;
  expressionLatex: string;
  factoredLatex: string;
  simplifiedLatex: string;
  numeratorLatex: string;
  denominatorLatex: string;
  evalFn: (x: number) => number | null;
  singularities: SingularityPoint[];
  horizontalAsymptote?: number | null;
  slantAsymptoteLatex?: string;
  domainIntervalLatex: string;
  domainSetBuilderLatex: string;
  keyTakeaway: string;
  suggestedXRange: [number, number];
  suggestedYRange: [number, number];
  isCustomizable?: boolean;
}

export const RATIONAL_GRAPH_PRESETS: RationalPreset[] = [
  {
    id: 'hole-and-asymptote',
    name: 'Hole + Vertical Asymptote',
    shortFormula: '\\frac{x^2 - 4}{x^2 - x - 6}',
    badge: 'PRC Board Classic',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    expressionLatex: 'f(x) = \\frac{x^2 - 4}{x^2 - x - 6}',
    factoredLatex: 'f(x) = \\frac{(x - 2)(x + 2)}{(x - 3)(x + 2)}',
    simplifiedLatex: 'f(x) = \\frac{x - 2}{x - 3}, \\quad x \\neq 3, -2',
    numeratorLatex: '(x - 2)(x + 2)',
    denominatorLatex: '(x - 3)(x + 2)',
    evalFn: (x: number) => {
      if (Math.abs(x - (-2)) < 0.0001) return null; // Hole at x = -2
      if (Math.abs(x - 3) < 0.0001) return null; // Asymptote at x = 3
      return (x - 2) / (x - 3);
    },
    singularities: [
      {
        x: -2,
        type: 'hole',
        y: 0.8, // (-2 - 2) / (-2 - 3) = -4 / -5 = 0.8
        factor: '(x + 2)',
        cancelled: true,
        explanation: 'Factor (x + 2) cancels from both numerator & denominator. Creates a 0/0 indeterminate form at x = -2.',
        limitLeft: '0.8',
        limitRight: '0.8',
        boardNote: 'Hole coordinates are (-2, 4/5). Even though the factor cancels, x = -2 is strictly excluded from the domain!',
      },
      {
        x: 3,
        type: 'asymptote',
        factor: '(x - 3)',
        cancelled: false,
        explanation: 'Factor (x - 3) remains exclusively in the denominator. Causes division by zero with non-zero numerator.',
        limitLeft: '-\\infty',
        limitRight: '+\\infty',
        boardNote: 'Vertical Asymptote line x = 3. As x approaches 3 from the left, y → -∞. From the right, y → +∞.',
      },
    ],
    horizontalAsymptote: 1, // degrees equal (2/2) -> 1/1 = 1
    domainIntervalLatex: '(-\\infty, -2) \\cup (-2, 3) \\cup (3, \\infty)',
    domainSetBuilderLatex: '\\{x \\in \\mathbb{R} \\mid x \\neq -2, 3\\}',
    keyTakeaway: 'Both x = -2 and x = 3 are excluded from the domain, but they behave completely differently on the graph: x = -2 is a removable punctured hole, while x = 3 is an infinite vertical asymptote.',
    suggestedXRange: [-7, 7],
    suggestedYRange: [-5, 5],
  },
  {
    id: 'pure-hole',
    name: 'Difference of Squares Hole',
    shortFormula: '\\frac{x - 3}{x^2 - 9}',
    badge: 'Removable Discontinuity',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    expressionLatex: 'f(x) = \\frac{x - 3}{x^2 - 9}',
    factoredLatex: 'f(x) = \\frac{x - 3}{(x - 3)(x + 3)}',
    simplifiedLatex: 'f(x) = \\frac{1}{x + 3}, \\quad x \\neq 3, -3',
    numeratorLatex: 'x - 3',
    denominatorLatex: '(x - 3)(x + 3)',
    evalFn: (x: number) => {
      if (Math.abs(x - 3) < 0.0001) return null;
      if (Math.abs(x - (-3)) < 0.0001) return null;
      return 1 / (x + 3);
    },
    singularities: [
      {
        x: 3,
        type: 'hole',
        y: 1 / 6, // approx 0.1667
        factor: '(x - 3)',
        cancelled: true,
        explanation: 'Factor (x - 3) cancels, giving 1/(3+3) = 1/6.',
        limitLeft: '\\frac{1}{6}',
        limitRight: '\\frac{1}{6}',
        boardNote: 'Hole at (3, 1/6). A frequent board exam trap is choosing only x ≠ -3, forgetting that x ≠ 3 is also excluded.',
      },
      {
        x: -3,
        type: 'asymptote',
        factor: '(x + 3)',
        cancelled: false,
        explanation: 'Factor (x + 3) remains in denominator, creating a pole.',
        limitLeft: '-\\infty',
        limitRight: '+\\infty',
        boardNote: 'Vertical Asymptote at x = -3.',
      },
    ],
    horizontalAsymptote: 0,
    domainIntervalLatex: '(-\\infty, -3) \\cup (-3, 3) \\cup (3, \\infty)',
    domainSetBuilderLatex: '\\{x \\in \\mathbb{R} \\mid x \\neq -3, 3\\}',
    keyTakeaway: 'Always factor the denominator BEFORE canceling. The original expression dictates the domain constraints, never the simplified form.',
    suggestedXRange: [-7, 7],
    suggestedYRange: [-3, 3],
  },
  {
    id: 'double-asymptote',
    name: 'Dual Vertical Asymptotes',
    shortFormula: '\\frac{2x + 1}{x^2 - 5x + 6}',
    badge: 'Quadratic Denominator',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    expressionLatex: 'f(x) = \\frac{2x + 1}{x^2 - 5x + 6}',
    factoredLatex: 'f(x) = \\frac{2x + 1}{(x - 2)(x - 3)}',
    simplifiedLatex: 'f(x) = \\frac{2x + 1}{(x - 2)(x - 3)}, \\quad x \\neq 2, 3',
    numeratorLatex: '2x + 1',
    denominatorLatex: '(x - 2)(x - 3)',
    evalFn: (x: number) => {
      if (Math.abs(x - 2) < 0.0001) return null;
      if (Math.abs(x - 3) < 0.0001) return null;
      return (2 * x + 1) / ((x - 2) * (x - 3));
    },
    singularities: [
      {
        x: 2,
        type: 'asymptote',
        factor: '(x - 2)',
        cancelled: false,
        explanation: 'Denominator zero at x = 2. Numerator is 2(2)+1 = 5 ≠ 0.',
        limitLeft: '+\\infty',
        limitRight: '-\\infty',
        boardNote: 'Vertical Asymptote at x = 2.',
      },
      {
        x: 3,
        type: 'asymptote',
        factor: '(x - 3)',
        cancelled: false,
        explanation: 'Denominator zero at x = 3. Numerator is 2(3)+1 = 7 ≠ 0.',
        limitLeft: '-\\infty',
        limitRight: '+\\infty',
        boardNote: 'Vertical Asymptote at x = 3.',
      },
    ],
    horizontalAsymptote: 0,
    domainIntervalLatex: '(-\\infty, 2) \\cup (2, 3) \\cup (3, \\infty)',
    domainSetBuilderLatex: '\\{x \\in \\mathbb{R} \\mid x \\neq 2, 3\\}',
    keyTakeaway: 'When the numerator shares NO roots with the factored denominator, every root of the denominator produces a full vertical asymptote.',
    suggestedXRange: [-2, 7],
    suggestedYRange: [-6, 8],
  },
  {
    id: 'linear-hole-trap',
    name: 'Linear Function with Hole',
    shortFormula: '\\frac{4 - x^2}{x - 2}',
    badge: 'Straight Line Trap',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    expressionLatex: 'f(x) = \\frac{4 - x^2}{x - 2}',
    factoredLatex: 'f(x) = \\frac{-(x - 2)(x + 2)}{x - 2}',
    simplifiedLatex: 'f(x) = -(x + 2) = -x - 2, \\quad x \\neq 2',
    numeratorLatex: '-(x - 2)(x + 2)',
    denominatorLatex: 'x - 2',
    evalFn: (x: number) => {
      if (Math.abs(x - 2) < 0.0001) return null;
      return -x - 2;
    },
    singularities: [
      {
        x: 2,
        type: 'hole',
        y: -4,
        factor: '(x - 2)',
        cancelled: true,
        explanation: 'Factor (x - 2) cancels entirely. Leaves a straight line y = -x - 2 with a missing point at (2, -4).',
        limitLeft: '-4',
        limitRight: '-4',
        boardNote: 'Hole at (2, -4). Graph is NOT a hyperbola—it is a straight linear line with a puncture!',
      },
    ],
    horizontalAsymptote: null,
    domainIntervalLatex: '(-\\infty, 2) \\cup (2, \\infty)',
    domainSetBuilderLatex: '\\{x \\in \\mathbb{R} \\mid x \\neq 2\\}',
    keyTakeaway: 'A rational expression does NOT always look like a curve. If the entire denominator cancels, the graph becomes a standard polynomial (here, a line) with discrete missing points (holes).',
    suggestedXRange: [-6, 6],
    suggestedYRange: [-8, 4],
  },
  {
    id: 'hyperbola-standard',
    name: 'Standard Rational Hyperbola',
    shortFormula: '\\frac{2x + 4}{x - 1}',
    badge: 'Dual Asymptote Shift',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    expressionLatex: 'f(x) = \\frac{2x + 4}{x - 1}',
    factoredLatex: 'f(x) = \\frac{2(x + 2)}{x - 1}',
    simplifiedLatex: 'f(x) = \\frac{2x + 4}{x - 1}, \\quad x \\neq 1',
    numeratorLatex: '2(x + 2)',
    denominatorLatex: 'x - 1',
    evalFn: (x: number) => {
      if (Math.abs(x - 1) < 0.0001) return null;
      return (2 * x + 4) / (x - 1);
    },
    singularities: [
      {
        x: 1,
        type: 'asymptote',
        factor: '(x - 1)',
        cancelled: false,
        explanation: 'Vertical asymptote at x = 1. Numerator at x=1 is 2(1)+4 = 6 ≠ 0.',
        limitLeft: '-\\infty',
        limitRight: '+\\infty',
        boardNote: 'Vertical Asymptote at x = 1.',
      },
    ],
    horizontalAsymptote: 2, // leading coeff ratio: 2/1 = 2
    domainIntervalLatex: '(-\\infty, 1) \\cup (1, \\infty)',
    domainSetBuilderLatex: '\\{x \\in \\mathbb{R} \\mid x \\neq 1\\}',
    keyTakeaway: 'For equal degree rational functions (1/1), the horizontal asymptote is the ratio of leading coefficients (y = 2/1 = 2). The vertical asymptote is the zero of the denominator (x = 1).',
    suggestedXRange: [-6, 7],
    suggestedYRange: [-6, 8],
  },
  {
    id: 'sum-of-squares',
    name: 'Sum of Squares (No Excluded Values)',
    shortFormula: '\\frac{4x}{x^2 + 4}',
    badge: 'Continuous Everywhere',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    expressionLatex: 'f(x) = \\frac{4x}{x^2 + 4}',
    factoredLatex: 'f(x) = \\frac{4x}{x^2 + 4} \\;\\text{(Irreducible over } \\mathbb{R}\\text{)}',
    simplifiedLatex: 'f(x) = \\frac{4x}{x^2 + 4}',
    numeratorLatex: '4x',
    denominatorLatex: 'x^2 + 4',
    evalFn: (x: number) => {
      return (4 * x) / (x * x + 4);
    },
    singularities: [],
    horizontalAsymptote: 0,
    domainIntervalLatex: '(-\\infty, \\infty) = \\mathbb{R}',
    domainSetBuilderLatex: '\\mathbb{R}',
    keyTakeaway: 'Because x² + 4 ≥ 4 > 0 for all real numbers x, the denominator is NEVER zero! Therefore, this rational function has ZERO holes, ZERO vertical asymptotes, and is continuous on all of ℝ.',
    suggestedXRange: [-6, 6],
    suggestedYRange: [-3, 3],
  },
  {
    id: 'custom-interactive',
    name: 'Interactive Parameter Sandbox',
    shortFormula: '\\frac{(x - a)(x + 1)}{(x - a)(x - b)}',
    badge: 'Dynamic Sliders',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    expressionLatex: 'f(x) = \\frac{(x - a)(x + 1)}{(x - a)(x - b)}',
    factoredLatex: 'f(x) = \\frac{(x - a)(x + 1)}{(x - a)(x - b)}',
    simplifiedLatex: 'f(x) = \\frac{x + 1}{x - b}, \\quad x \\neq a, b',
    numeratorLatex: '(x - a)(x + 1)',
    denominatorLatex: '(x - a)(x - b)',
    evalFn: () => null, // dynamically generated based on sliders
    singularities: [], // dynamically generated
    horizontalAsymptote: 1,
    domainIntervalLatex: '(-\\infty, \\min(a,b)) \\cup (\\dots) \\cup (\\dots, \\infty)',
    domainSetBuilderLatex: '\\{x \\in \\mathbb{R} \\mid x \\neq a, b\\}',
    keyTakeaway: 'Drag slider "a" to see the removable hole travel along the hyperbola! Drag slider "b" to move the vertical asymptote!',
    suggestedXRange: [-7, 7],
    suggestedYRange: [-6, 6],
    isCustomizable: true,
  },
];

interface RationalGraphVisualizerProps {
  initialPresetId?: string;
  onOpenTutor?: (prompt: string) => void;
  className?: string;
}

export const RationalGraphVisualizer: React.FC<RationalGraphVisualizerProps> = ({
  initialPresetId = 'hole-and-asymptote',
  onOpenTutor,
  className = '',
}) => {
  // Active Preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPresetId);

  // Custom sandbox parameters: a = hole root, b = asymptote root
  const [customParamA, setCustomParamA] = useState<number>(-2); // Hole at x = -2
  const [customParamB, setCustomParamB] = useState<number>(3); // Asymptote at x = 3

  // Interactive View Controls
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showAsymptotes, setShowAsymptotes] = useState<boolean>(true);
  const [showHoles, setShowHoles] = useState<boolean>(true);
  const [showDomainInterval, setShowDomainInterval] = useState<boolean>(true);
  const [highlightedSingularity, setHighlightedSingularity] = useState<number | null>(null);

  // Probe cursor tracking
  const [probeX, setProbeX] = useState<number | null>(0);
  const [isMouseProbing, setIsMouseProbing] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Resolve current active preset
  const basePreset =
    RATIONAL_GRAPH_PRESETS.find((p) => p.id === selectedPresetId) || RATIONAL_GRAPH_PRESETS[0];

  // If custom sandbox, compute dynamic properties
  const activePreset = useMemo<RationalPreset>(() => {
    if (!basePreset.isCustomizable) {
      return basePreset;
    }

    const a = customParamA;
    const b = customParamB;

    // Evaluate simplified form: (x + 1) / (x - b), with hole at x = a
    const evalFn = (x: number) => {
      if (Math.abs(x - a) < 0.0001) return null; // Hole
      if (Math.abs(x - b) < 0.0001) return null; // Asymptote
      return (x + 1) / (x - b);
    };

    const holeY = a === b ? 0 : (a + 1) / (a - b);

    const singularities: SingularityPoint[] = [
      {
        x: a,
        type: 'hole',
        y: holeY,
        factor: `(x - ${a >= 0 ? a : `(${a})`})`,
        cancelled: true,
        explanation: `Factor (x - ${a}) cancels out from numerator and denominator, leaving indeterminate 0/0 form.`,
        limitLeft: holeY.toFixed(3),
        limitRight: holeY.toFixed(3),
        boardNote: `Removable Hole at (${a}, ${holeY.toFixed(2)}).`,
      },
      {
        x: b,
        type: 'asymptote',
        factor: `(x - ${b >= 0 ? b : `(${b})`})`,
        cancelled: false,
        explanation: `Factor (x - ${b}) remains solely in the denominator, causing division by zero.`,
        limitLeft: '-\\infty',
        limitRight: '+\\infty',
        boardNote: `Vertical Asymptote at x = ${b}.`,
      },
    ];

    const minRoot = Math.min(a, b);
    const maxRoot = Math.max(a, b);

    return {
      ...basePreset,
      expressionLatex: `f(x) = \\frac{(x - ${a})(x + 1)}{(x - ${a})(x - ${b})}`,
      factoredLatex: `f(x) = \\frac{(x - ${a})(x + 1)}{(x - ${a})(x - ${b})}`,
      simplifiedLatex: `f(x) = \\frac{x + 1}{x - ${b}}, \\quad x \\neq ${a}, ${b}`,
      numeratorLatex: `(x - ${a})(x + 1)`,
      denominatorLatex: `(x - ${a})(x - ${b})`,
      evalFn,
      singularities,
      domainIntervalLatex: `(-\\infty, ${minRoot}) \\cup (${minRoot}, ${maxRoot}) \\cup (${maxRoot}, \\infty)`,
      domainSetBuilderLatex: `\\{x \\in \\mathbb{R} \\mid x \\neq ${a}, ${b}\\}`,
    };
  }, [basePreset, customParamA, customParamB]);

  // Viewport dimensions in SVG space
  const svgWidth = 640;
  const svgHeight = 400;
  const padding = 36;

  // Coordinate scales
  const xMin = activePreset.suggestedXRange[0] / zoomLevel;
  const xMax = activePreset.suggestedXRange[1] / zoomLevel;
  const yMin = activePreset.suggestedYRange[0] / zoomLevel;
  const yMax = activePreset.suggestedYRange[1] / zoomLevel;

  // Math-to-SVG coordinate transforms
  const toSvgX = (x: number) => {
    return padding + ((x - xMin) / (xMax - xMin)) * (svgWidth - 2 * padding);
  };

  const toSvgY = (y: number) => {
    return (
      svgHeight -
      padding -
      ((y - yMin) / (yMax - yMin)) * (svgHeight - 2 * padding)
    );
  };

  const toMathX = (svgX: number) => {
    const clampedSvgX = Math.max(padding, Math.min(svgWidth - padding, svgX));
    return xMin + ((clampedSvgX - padding) / (svgWidth - 2 * padding)) * (xMax - xMin);
  };

  // Generate curve segments partitioned by vertical asymptotes
  const curveSegments = useMemo(() => {
    // Find all vertical asymptote x-values within range
    const vAsymptotes = activePreset.singularities
      .filter((s) => s.type === 'asymptote')
      .map((s) => s.x)
      .sort((a, b) => a - b);

    // Break interval [xMin, xMax] into sub-intervals around asymptotes
    const subIntervals: [number, number][] = [];
    let currentStart = xMin;
    const epsilon = 0.05; // gap around asymptote to prevent connecting lines

    vAsymptotes.forEach((va) => {
      if (va > xMin && va < xMax) {
        subIntervals.push([currentStart, va - epsilon]);
        currentStart = va + epsilon;
      }
    });
    subIntervals.push([currentStart, xMax]);

    // Sample points in each sub-interval
    const segments: string[] = [];
    const samplesPerInterval = 160;

    subIntervals.forEach(([start, end]) => {
      if (start >= end) return;
      let pathD = '';
      const step = (end - start) / samplesPerInterval;

      let isDrawing = false;

      for (let i = 0; i <= samplesPerInterval; i++) {
        const x = start + i * step;
        const y = activePreset.evalFn(x);

        if (y === null || isNaN(y)) {
          isDrawing = false;
          continue;
        }

        // Clamp y to slightly beyond yMin/yMax to prevent extreme off-screen lines
        const clampedY = Math.max(yMin - 5, Math.min(yMax + 5, y));
        const sx = toSvgX(x);
        const sy = toSvgY(clampedY);

        if (!isDrawing) {
          pathD += `M ${sx.toFixed(1)} ${sy.toFixed(1)} `;
          isDrawing = true;
        } else {
          pathD += `L ${sx.toFixed(1)} ${sy.toFixed(1)} `;
        }
      }

      if (pathD.trim()) {
        segments.push(pathD);
      }
    });

    return segments;
  }, [activePreset, xMin, xMax, yMin, yMax]);

  // Probe evaluation at current probeX
  const probeData = useMemo(() => {
    if (probeX === null) return null;

    // Check if probe is directly on a singularity
    const matchSingularity = activePreset.singularities.find(
      (s) => Math.abs(s.x - probeX) < 0.15
    );

    if (matchSingularity) {
      return {
        x: matchSingularity.x,
        y: matchSingularity.y ?? null,
        isSingularity: true,
        singularity: matchSingularity,
      };
    }

    const val = activePreset.evalFn(probeX);
    return {
      x: probeX,
      y: val,
      isSingularity: false,
      singularity: null,
    };
  }, [probeX, activePreset]);

  // Handle pointer movements on the SVG canvas
  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relativeX = ((e.clientX - rect.left) / rect.width) * svgWidth;
    const mathX = toMathX(relativeX);
    setProbeX(parseFloat(mathX.toFixed(2)));
    setIsMouseProbing(true);
  };

  const handleSvgPointerLeave = () => {
    setIsMouseProbing(false);
  };

  // Preset auto-framing on change
  const handleSelectPreset = (id: string) => {
    setSelectedPresetId(id);
    setZoomLevel(1);
    setHighlightedSingularity(null);
    setProbeX(0);
  };

  // Generate grid lines
  const gridLines = useMemo(() => {
    const xStep = (xMax - xMin) > 12 ? 2 : 1;
    const yStep = (yMax - yMin) > 10 ? 2 : 1;

    const vLines: { x: number; svgX: number; isAxis: boolean; label: string }[] = [];
    const hLines: { y: number; svgY: number; isAxis: boolean; label: string }[] = [];

    const firstX = Math.ceil(xMin / xStep) * xStep;
    for (let x = firstX; x <= xMax; x += xStep) {
      vLines.push({
        x,
        svgX: toSvgX(x),
        isAxis: Math.abs(x) < 0.001,
        label: x.toString(),
      });
    }

    const firstY = Math.ceil(yMin / yStep) * yStep;
    for (let y = firstY; y <= yMax; y += yStep) {
      hLines.push({
        y,
        svgY: toSvgY(y),
        isAxis: Math.abs(y) < 0.001,
        label: y.toString(),
      });
    }

    return { vLines, hLines };
  }, [xMin, xMax, yMin, yMax]);

  return (
    <div
      id="rational-graph-visualizer-card"
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col space-y-0 ${className}`}
    >
      {/* 1. Header Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              f(x)
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Rational Graph &amp; Singularity Inspector</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                Interactive Visualizer
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-600">
            Real-time coordinate graph illustrating how denominator factors produce removable holes versus infinite vertical asymptotes.
          </p>
        </div>

        {/* View toggles & Zoom Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(2, +(z * 1.25).toFixed(2)))}
              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.6, +(z / 1.25).toFixed(2)))}
              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Reset Zoom"
            >
              <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowDomainInterval(!showDomainInterval)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
              showDomainInterval
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {showDomainInterval ? <AppArtwork name="eye" inline className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Domain Axis</span>
          </button>

          {onOpenTutor && (
            <button
              type="button"
              onClick={() =>
                onOpenTutor(
                  `Explain the graph of rational function ${activePreset.expressionLatex}. Detail why x = ${activePreset.singularities.map((s) => s.x).join(', ')} are excluded values and distinguish the holes from vertical asymptotes for the ECE board exam.`
                )
              }
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <AppArtwork name="star" inline className="w-3.5 h-3.5 text-blue-600" />
              <span>Ask Tutor on Graph</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Preset Selector Pills */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-200/80 overflow-x-auto flex items-center gap-2 no-scrollbar">
        <span className="text-[11px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">
          Presets:
        </span>
        {RATIONAL_GRAPH_PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset.id)}
              className={`px-3 py-1.5 rounded-xl border whitespace-nowrap text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{preset.name}</span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                  isSelected ? 'bg-white/20 text-white' : preset.badgeColor
                }`}
              >
                {preset.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Workspace: Graph Canvas (Left 8 cols) + Analysis Panel (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* LEFT COLUMN: SVG Graph Canvas + Live Probe Controls */}
        <div className="lg:col-span-8 p-4 sm:p-5 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 space-y-4">
          {/* Formula Display Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/90">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Active Rational Function:
              </span>
              <div className="font-serif text-slate-900 font-bold text-base sm:text-lg mt-0.5">
                <MathFormula formula={activePreset.expressionLatex} />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500">Factored:</span>
              <div className="font-serif text-slate-800 text-xs sm:text-sm px-2.5 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <MathFormula formula={activePreset.factoredLatex} />
              </div>
            </div>
          </div>

          {/* Interactive Sliders for Custom Preset */}
          {activePreset.isCustomizable && (
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Dynamic Parameter Sandbox: Move Hole &amp; Asymptote</span>
                </span>
                <span className="text-[11px] text-indigo-600 font-normal">
                  (a ≠ b to avoid cancel conflicts)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5 bg-white p-3 rounded-lg border border-indigo-100 shadow-2xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-rose-700">
                      Hole Parameter <em>a</em> = {customParamA}
                    </span>
                    <span className="text-[10px] text-slate-400">Cancels out: (x - a)</span>
                  </div>
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="1"
                    value={customParamA}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (val !== customParamB) setCustomParamA(val);
                    }}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>-5</span>
                    <span>0</span>
                    <span>+5</span>
                  </div>
                </div>

                <div className="space-y-1.5 bg-white p-3 rounded-lg border border-indigo-100 shadow-2xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-700">
                      Asymptote Parameter <em>b</em> = {customParamB}
                    </span>
                    <span className="text-[10px] text-slate-400">Remains: (x - b)</span>
                  </div>
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="1"
                    value={customParamB}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (val !== customParamA) setCustomParamB(val);
                    }}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>-5</span>
                    <span>0</span>
                    <span>+5</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SVG Canvas Container */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-slate-900 rounded-2xl overflow-hidden shadow-inner select-none">
            {/* SVG Visual Stage */}
            <svg
              ref={svgRef}
              className="w-full h-full cursor-crosshair"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
              onPointerMove={handleSvgPointerMove}
              onPointerLeave={handleSvgPointerLeave}
            >
              <defs>
                {/* Asymptote Gradient Glow */}
                <linearGradient id="asymptoteGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                </linearGradient>

                {/* Domain allowed stripe pattern */}
                <pattern id="domainStripe" width="8" height="8" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="8" y2="8" stroke="#10b981" strokeWidth="1" strokeOpacity="0.3" />
                </pattern>
              </defs>

              {/* Background fill */}
              <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="#0f172a" />

              {/* Grid Lines */}
              {showGrid && (
                <g className="grid-layer">
                  {gridLines.vLines.map((vl) => (
                    <line
                      key={`vl-${vl.x}`}
                      x1={vl.svgX}
                      y1={padding}
                      x2={vl.svgX}
                      y2={svgHeight - padding}
                      stroke={vl.isAxis ? '#64748b' : '#1e293b'}
                      strokeWidth={vl.isAxis ? 1.5 : 0.8}
                    />
                  ))}
                  {gridLines.hLines.map((hl) => (
                    <line
                      key={`hl-${hl.y}`}
                      x1={padding}
                      y1={hl.svgY}
                      x2={svgWidth - padding}
                      y2={hl.svgY}
                      stroke={hl.isAxis ? '#64748b' : '#1e293b'}
                      strokeWidth={hl.isAxis ? 1.5 : 0.8}
                    />
                  ))}
                </g>
              )}

              {/* Domain Interval highlight band on X-axis */}
              {showDomainInterval && (
                <g className="domain-interval-layer">
                  {/* Base green continuous domain axis */}
                  <line
                    x1={padding}
                    y1={toSvgY(0)}
                    x2={svgWidth - padding}
                    y2={toSvgY(0)}
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeOpacity="0.85"
                  />
                  {/* Cutout / red tick marks for excluded values on the axis */}
                  {activePreset.singularities.map((s) => {
                    const sx = toSvgX(s.x);
                    const sy = toSvgY(0);
                    return (
                      <g key={`dom-ex-${s.x}`}>
                        {/* Gap mask */}
                        <circle cx={sx} cy={sy} r="6" fill="#0f172a" />
                        {/* Excluded Open Circle */}
                        <circle
                          cx={sx}
                          cy={sy}
                          r="4.5"
                          fill="#0f172a"
                          stroke={s.type === 'hole' ? '#f43f5e' : '#38bdf8'}
                          strokeWidth="2.5"
                        />
                        <text
                          x={sx}
                          y={sy + 15}
                          fill={s.type === 'hole' ? '#fda4af' : '#7dd3fc'}
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          x≠{s.x}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* Horizontal Asymptote (y = c) */}
              {showAsymptotes &&
                activePreset.horizontalAsymptote !== null &&
                activePreset.horizontalAsymptote !== undefined && (
                  <g className="h-asymptote-layer">
                    <line
                      x1={padding}
                      y1={toSvgY(activePreset.horizontalAsymptote)}
                      x2={svgWidth - padding}
                      y2={toSvgY(activePreset.horizontalAsymptote)}
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                      strokeDasharray="5,4"
                    />
                    <text
                      x={svgWidth - padding - 6}
                      y={toSvgY(activePreset.horizontalAsymptote) - 6}
                      fill="#7dd3fc"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="end"
                    >
                      H.A. y = {activePreset.horizontalAsymptote}
                    </text>
                  </g>
                )}

              {/* Vertical Asymptotes (x = c) */}
              {showAsymptotes &&
                activePreset.singularities
                  .filter((s) => s.type === 'asymptote')
                  .map((va) => {
                    const vx = toSvgX(va.x);
                    const isHighlighted = highlightedSingularity === va.x;

                    return (
                      <g key={`va-${va.x}`} className="v-asymptote-layer">
                        {/* Glow corridor */}
                        <rect
                          x={vx - 8}
                          y={padding}
                          width="16"
                          height={svgHeight - 2 * padding}
                          fill="#38bdf8"
                          fillOpacity={isHighlighted ? 0.2 : 0.06}
                        />

                        {/* Dashed vertical asymptote line */}
                        <line
                          x1={vx}
                          y1={padding}
                          x2={vx}
                          y2={svgHeight - padding}
                          stroke={isHighlighted ? '#60a5fa' : '#38bdf8'}
                          strokeWidth={isHighlighted ? 2.5 : 1.8}
                          strokeDasharray="6,4"
                        />

                        {/* Top / Bottom Asymptote Badges */}
                        <rect
                          x={vx - 32}
                          y={padding - 2}
                          width="64"
                          height="16"
                          rx="4"
                          fill="#1e293b"
                          stroke="#38bdf8"
                          strokeWidth="1"
                        />
                        <text
                          x={vx}
                          y={padding + 10}
                          fill="#7dd3fc"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          V.A. x = {va.x}
                        </text>

                        {/* Divergent Arrow indicators */}
                        <path
                          d={`M ${vx - 10} ${padding + 30} L ${vx - 10} ${padding + 20} L ${vx - 14} ${padding + 24}`}
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          fill="none"
                        />
                        <text
                          x={vx - 12}
                          y={padding + 38}
                          fill="#94a3b8"
                          fontSize="7"
                          textAnchor="end"
                        >
                          y → ±∞
                        </text>
                      </g>
                    );
                  })}

              {/* Rational Function Curve Branches */}
              <g className="function-curve-layer">
                {curveSegments.map((dString, idx) => (
                  <path
                    key={`curve-seg-${idx}`}
                    d={dString}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-150"
                  />
                ))}
              </g>

              {/* Removable Holes (Open circles on the curve at (c, y)) */}
              {showHoles &&
                activePreset.singularities
                  .filter((s) => s.type === 'hole' && s.y !== undefined)
                  .map((hole) => {
                    const hx = toSvgX(hole.x);
                    const hy = toSvgY(hole.y!);
                    const isHighlighted = highlightedSingularity === hole.x;

                    return (
                      <g
                        key={`hole-${hole.x}`}
                        className="hole-marker-layer cursor-pointer"
                        onClick={() =>
                          setHighlightedSingularity(
                            highlightedSingularity === hole.x ? null : hole.x
                          )
                        }
                      >
                        {/* Drop lines to axes */}
                        <line
                          x1={hx}
                          y1={hy}
                          x2={hx}
                          y2={toSvgY(0)}
                          stroke="#f43f5e"
                          strokeWidth="1"
                          strokeDasharray="2,2"
                          strokeOpacity="0.6"
                        />
                        <line
                          x1={hx}
                          y1={hy}
                          x2={toSvgX(0)}
                          y2={hy}
                          stroke="#f43f5e"
                          strokeWidth="1"
                          strokeDasharray="2,2"
                          strokeOpacity="0.6"
                        />

                        {/* Outer pulsing halo if highlighted */}
                        {isHighlighted && (
                          <circle
                            cx={hx}
                            cy={hy}
                            r="12"
                            fill="none"
                            stroke="#f43f5e"
                            strokeWidth="1.5"
                            strokeOpacity="0.8"
                            className="animate-ping"
                          />
                        )}

                        {/* Open circle on curve */}
                        <circle cx={hx} cy={hy} r="7" fill="#0f172a" />
                        <circle
                          cx={hx}
                          cy={hy}
                          r="5"
                          fill="#0f172a"
                          stroke="#f43f5e"
                          strokeWidth="2.5"
                        />

                        {/* Hole coordinate tag */}
                        <rect
                          x={hx + 8}
                          y={hy - 20}
                          width="78"
                          height="18"
                          rx="4"
                          fill="#1e1b4b"
                          stroke="#f43f5e"
                          strokeWidth="1"
                        />
                        <text
                          x={hx + 12}
                          y={hy - 7}
                          fill="#fecdd3"
                          fontSize="9"
                          fontWeight="bold"
                        >
                          Hole ({hole.x}, {hole.y?.toFixed(2)})
                        </text>
                      </g>
                    );
                  })}

              {/* Interactive Probe Marker Line */}
              {probeX !== null && (
                <g className="probe-layer">
                  {/* Vertical guide line */}
                  <line
                    x1={toSvgX(probeX)}
                    y1={padding}
                    x2={toSvgX(probeX)}
                    y2={svgHeight - padding}
                    stroke="#facc15"
                    strokeWidth="1.2"
                    strokeDasharray="3,3"
                    strokeOpacity="0.8"
                  />

                  {/* Marker Dot on curve if valid point */}
                  {probeData && probeData.y !== null && !probeData.isSingularity && (
                    <g>
                      <circle
                        cx={toSvgX(probeData.x)}
                        cy={toSvgY(probeData.y)}
                        r="5"
                        fill="#facc15"
                        stroke="#0f172a"
                        strokeWidth="2"
                      />
                    </g>
                  )}
                </g>
              )}

              {/* Axis Numbers & Labels */}
              <g className="axis-labels">
                {gridLines.vLines
                  .filter((vl) => !vl.isAxis && Math.abs(vl.x) % 2 === 0)
                  .map((vl) => (
                    <text
                      key={`txt-x-${vl.x}`}
                      x={vl.svgX}
                      y={toSvgY(0) + 12}
                      fill="#64748b"
                      fontSize="8"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {vl.label}
                    </text>
                  ))}

                {gridLines.hLines
                  .filter((hl) => !hl.isAxis && Math.abs(hl.y) % 2 === 0)
                  .map((hl) => (
                    <text
                      key={`txt-y-${hl.y}`}
                      x={toSvgX(0) - 6}
                      y={hl.svgY + 3}
                      fill="#64748b"
                      fontSize="8"
                      fontWeight="bold"
                      textAnchor="end"
                    >
                      {hl.label}
                    </text>
                  ))}
              </g>
            </svg>

            {/* Floating Live Inspection Badge inside Canvas */}
            <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs border border-slate-700/80 rounded-xl p-2.5 shadow-lg text-xs text-white max-w-xs pointer-events-none">
              <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
                <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                <span>Probe: x = {probeX !== null ? probeX.toFixed(2) : '--'}</span>
              </div>

              {probeData ? (
                probeData.isSingularity ? (
                  <div className="mt-1 pt-1 border-t border-slate-700/70 text-[11px]">
                    {probeData.singularity?.type === 'hole' ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Undefined: Removable Hole (0/0)</span>
                      </span>
                    ) : (
                      <span className="text-blue-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Undefined: Vertical Asymptote (Div by 0)</span>
                      </span>
                    )}
                    <p className="text-[10px] text-slate-300 mt-0.5 leading-tight">
                      {probeData.singularity?.boardNote}
                    </p>
                  </div>
                ) : probeData.y !== null ? (
                  <div className="mt-1 pt-1 border-t border-slate-700/70 text-[11px]">
                    <span className="text-emerald-400 font-bold">
                      f({probeData.x.toFixed(2)}) = {probeData.y.toFixed(3)}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5">✓ In Domain</span>
                  </div>
                ) : (
                  <div className="mt-1 pt-1 border-t border-slate-700/70 text-[11px] text-rose-400 font-bold">
                    f(x) is Undefined
                  </div>
                )
              ) : (
                <span className="text-[10px] text-slate-400">Hover graph or slide x below</span>
              )}
            </div>

            {/* Canvas Legend */}
            <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-xs border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-3 text-[10px] text-slate-300">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-blue-400 inline-block" />
                <span>Curve</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full border border-rose-500 bg-slate-900 inline-block" />
                <span>Hole (0/0)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 border-b border-dashed border-blue-400 inline-block" />
                <span>Asymptote (k/0)</span>
              </div>
            </div>
          </div>

          {/* Interactive Slider for Probe Position */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-bold text-slate-800">
                Test Point Inspector: <span className="font-mono text-blue-600">x = {probeX}</span>
              </span>
            </div>

            <div className="flex-1 max-w-sm flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400">{xMin}</span>
              <input
                type="range"
                min={xMin}
                max={xMax}
                step="0.1"
                value={probeX ?? 0}
                onChange={(e) => setProbeX(parseFloat(parseFloat(e.target.value).toFixed(1)))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-slate-400">{xMax}</span>
            </div>

            {/* Jump to Excluded Value Buttons */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 font-bold mr-1">Snap to:</span>
              {activePreset.singularities.map((s) => (
                <button
                  key={`snap-${s.x}`}
                  type="button"
                  onClick={() => setProbeX(s.x)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    s.type === 'hole'
                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  x = {s.x} ({s.type === 'hole' ? 'Hole' : 'V.A.'})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Algebraic Breakdown, Domain Constraints, Board Rule */}
        <div className="lg:col-span-4 p-4 sm:p-5 flex flex-col justify-between space-y-4 bg-slate-50/40">
          <div className="space-y-4">
            {/* Header: Discontinuity Breakdown */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <AppArtwork name="cards" inline className="w-3.5 h-3.5 text-blue-600" />
                <span>Singularity Breakdown</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                {activePreset.singularities.length} Excluded Values
              </span>
            </div>

            {/* List of Singularity Cards */}
            <div className="space-y-2.5">
              {activePreset.singularities.length === 0 ? (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-black flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>No Real Excluded Values</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-700">
                    The denominator is strictly positive (<MathFormula formula="x^2 + 4 > 0" />). There are zero division by zero traps in the real number system.
                  </p>
                </div>
              ) : (
                activePreset.singularities.map((sing) => {
                  const isHole = sing.type === 'hole';
                  const isSelected = highlightedSingularity === sing.x;

                  return (
                    <div
                      key={`sing-card-${sing.x}`}
                      onClick={() =>
                        setHighlightedSingularity(isSelected ? null : sing.x)
                      }
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs space-y-2 ${
                        isHole
                          ? isSelected
                            ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-200 shadow-xs'
                            : 'bg-white border-rose-200/80 hover:border-rose-300'
                          : isSelected
                          ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-200 shadow-xs'
                          : 'bg-white border-blue-200/80 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-extrabold">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isHole ? 'bg-rose-500' : 'bg-blue-600'
                            }`}
                          />
                          <span className={isHole ? 'text-rose-900' : 'text-blue-950'}>
                            {isHole ? 'Removable Hole' : 'Vertical Asymptote'}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            isHole
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          x = {sing.x}
                        </span>
                      </div>

                      {/* Factor cancel state */}
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>Factor: <code className="font-bold text-slate-800">{sing.factor}</code></span>
                        <span className="font-semibold text-[10px] text-slate-500">
                          {sing.cancelled ? '✓ Cancels (0/0)' : '✗ Remains in Denominator'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {sing.explanation}
                      </p>

                      {/* Coordinates or Limits */}
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-[10px] flex items-center justify-between text-slate-700">
                        {isHole ? (
                          <div>
                            <span className="font-bold text-slate-900">Punctured Point: </span>
                            <span>({sing.x}, {sing.y?.toFixed(2)})</span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-slate-900">Limits: </span>
                            <span>x→{sing.x}⁻: {sing.limitLeft}, x→{sing.x}⁺: {sing.limitRight}</span>
                          </div>
                        )}
                        <span className="text-blue-600 font-bold">Highlight on Graph →</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Formal Domain Representations */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Formal Domain Constraints:
              </span>
              <div className="space-y-1.5 font-serif text-slate-900">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                  <span className="font-sans text-[10px] text-slate-500 font-bold">Interval:</span>
                  <MathFormula formula={activePreset.domainIntervalLatex} />
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                  <span className="font-sans text-[10px] text-slate-500 font-bold">Set-Builder:</span>
                  <MathFormula formula={activePreset.domainSetBuilderLatex} />
                </div>
              </div>
            </div>

            {/* Board Exam Rule Alert */}
            <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200 text-xs text-rose-950 space-y-1.5">
              <div className="flex items-center gap-1.5 font-black text-rose-900 text-[11px] uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>PRC Board Rule: Canceling ≠ Inclusion</span>
              </div>
              <p className="text-[11px] leading-relaxed text-rose-900">
                {activePreset.keyTakeaway}
              </p>
            </div>
          </div>

          {/* Quick Action to Ask AI Tutor */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() =>
                onOpenTutor
                  ? onOpenTutor(
                      `How do I determine whether a rational root creates a hole or a vertical asymptote on the ECE Board Exam without graphing? Give me the 3-step test for ${activePreset.expressionLatex}.`
                    )
                  : undefined
              }
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <AppArtwork name="calculator" inline className="w-3.5 h-3.5 text-amber-400" />
              <span>3-Step Discontinuity Test (Tutor)</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
