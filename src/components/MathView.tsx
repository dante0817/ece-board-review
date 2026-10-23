import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import {
  MathFormula,
  MathFormulaProps,
  FormattedMathText,
  FormattedMathTextProps,
} from './MathFormula';
import 'katex/dist/katex.min.css';

export { InlineMath, BlockMath, MathFormula, FormattedMathText };
export type { MathFormulaProps, FormattedMathTextProps };

export interface MathViewProps extends MathFormulaProps {}

/**
 * Renders mathematical formulas and equations using MathFormula / react-katex.
 */
export const MathView: React.FC<MathViewProps> = (props) => {
  return <MathFormula {...props} />;
};

export default MathView;

