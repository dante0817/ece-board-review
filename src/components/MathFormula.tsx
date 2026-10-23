import React, { useMemo } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export interface MathFormulaProps {
  /** The LaTeX formula string to render */
  formula?: string;
  /** Alias for formula to support both math and formula props */
  math?: string;
  /** Children string prop fallback */
  children?: string;
  /** Whether to render as block (display mode) or inline mode. Defaults to false (inline), unless formula starts and ends with $$ */
  block?: boolean;
  /** Force inline mode */
  inline?: boolean;
  /** Optional custom CSS class name */
  className?: string;
  /** Color for syntax errors, defaults to #cc0000 */
  errorColor?: string;
  /** Custom fallback renderer when KaTeX fails */
  renderError?: (error: Error | TypeError) => React.ReactNode;
}

/**
 * Reusable MathFormula component that renders LaTeX formulas and equations
 * using react-katex's <BlockMath> or <InlineMath> with book-standard typography.
 */
export const MathFormula: React.FC<MathFormulaProps> = ({
  formula,
  math,
  children,
  block,
  inline,
  className = '',
  errorColor = '#cc0000',
  renderError,
}) => {
  const rawInput = formula ?? math ?? (typeof children === 'string' ? children : '');

  const { parsedFormula, isBlock } = useMemo(() => {
    let str = (rawInput || '').trim();
    let detectedBlock = false;

    // Auto-detect $$...$$ block notation
    if (str.startsWith('$$') && str.endsWith('$$') && str.length >= 4) {
      str = str.slice(2, -2).trim();
      detectedBlock = true;
    } else if (str.startsWith('$') && str.endsWith('$') && str.length >= 2) {
      str = str.slice(1, -1).trim();
      detectedBlock = false;
    }

    const finalBlock = inline ? false : block !== undefined ? block : detectedBlock;

    return {
      parsedFormula: str,
      isBlock: finalBlock,
    };
  }, [rawInput, block, inline]);

  if (!parsedFormula) {
    return null;
  }

  const defaultRenderError = (error: Error | TypeError) => {
    return (
      <span
        className="font-mono text-xs px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 inline-block"
        title={error.message}
      >
        {parsedFormula}
      </span>
    );
  };

  if (isBlock) {
    return (
      <div className={`my-2 overflow-x-auto py-1 text-center select-text font-serif ${className}`}>
        <BlockMath
          math={parsedFormula}
          errorColor={errorColor}
          renderError={renderError || defaultRenderError}
        />
      </div>
    );
  }

  return (
    <span className={`inline-block px-0.5 select-text align-middle font-serif ${className}`}>
      <InlineMath
        math={parsedFormula}
        errorColor={errorColor}
        renderError={renderError || defaultRenderError}
      />
    </span>
  );
};

export interface FormattedMathTextProps {
  text: string;
  className?: string;
}

/**
 * Parses a string containing $inline math$ or $$block math$$ and renders textbook-grade typography.
 */
export const FormattedMathText: React.FC<FormattedMathTextProps> = ({ text, className = '' }) => {
  const parts = useMemo(() => {
    const regex = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g;
    const tokens: Array<{ type: 'text' | 'inline' | 'block'; content: string }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }
      const raw = match[0];
      if (raw.startsWith('$$') && raw.endsWith('$$')) {
        tokens.push({ type: 'block', content: raw.slice(2, -2).trim() });
      } else {
        tokens.push({ type: 'inline', content: raw.slice(1, -1).trim() });
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      tokens.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return tokens;
  }, [text]);

  // A display equation is a block (<div>), so it must never be nested inside a <span>.
  const Wrapper: 'div' | 'span' = parts.some(part=>part.type==='block') ? 'div' : 'span';
  return (
    <Wrapper className={className}>
      {parts.map((part, i) => {
        if (part.type === 'text') {
          return <span key={i}>{part.content}</span>;
        }
        return <MathFormula key={i} formula={part.content} block={part.type === 'block'} />;
      })}
    </Wrapper>
  );
};

export default MathFormula;
