import React from 'react';

const ARTWORK_NAMES = [
  'calculator', 'plus-minus', 'brackets', 'percent', 'power-ten', 'equals',
  'division', 'sum', 'exponential', 'logarithm', 'matrix', 'book', 'square', 'graph',
] as const;

export type AlgebraArtworkName = typeof ARTWORK_NAMES[number];

export const ALGEBRA_GROUP_ARTWORK: Record<string, AlgebraArtworkName> = {
  'group-fundamentals': 'calculator',
  'group-polynomials': 'square',
  'group-equations': 'equals',
  'group-functions': 'graph',
  'group-exponential': 'exponential',
  'group-systems': 'matrix',
};

// Match artwork to each topic rather than using generic document glyphs.
export const ALGEBRA_TOPIC_ARTWORK: Record<string, AlgebraArtworkName> = {
  'alg-real-numbers': 'calculator',
  'alg-signed-numbers': 'plus-minus',
  'alg-pemdas': 'brackets',
  'alg-algebraic-terms': 'square',
  'alg-ratios': 'percent',
  'alg-scientific-notation': 'power-ten',
  'alg-exponents': 'square',
  'alg-polynomials': 'square',
  'alg-factoring': 'brackets',
  'alg-rational-expressions': 'division',
  'alg-remainder-factor': 'square',
  'alg-synthetic-division': 'division',
  'alg-polynomial-functions': 'graph',
  'alg-binomial-theorem': 'sum',
  'alg-linear-eq': 'equals',
  'alg-quadratic-eq': 'square',
  'alg-radical-eq': 'division',
  'alg-literal-eq': 'equals',
  'alg-linear-ineq': 'plus-minus',
  'alg-quadratic-ineq': 'graph',
  'alg-abs-value': 'plus-minus',
  'alg-cartesian-graph': 'graph',
  'alg-relations-functions': 'graph',
  'alg-domain-range': 'graph',
  'alg-composite-inverse': 'graph',
  'alg-transformations': 'graph',
  'alg-rational-functions': 'graph',
  'alg-exp-models': 'exponential',
  'alg-log-definitions': 'logarithm',
  'alg-log-properties': 'logarithm',
  'alg-exp-log-eq': 'equals',
  'alg-linear-systems': 'matrix',
  'alg-matrices': 'matrix',
  'alg-complex-numbers': 'plus-minus',
  'alg-word-problems': 'book',
  'alg-arithmetic-prog': 'sum',
  'alg-geometric-prog': 'sum',
  'alg-harmonic-prog': 'sum',
  'alg-partial-fractions': 'division',
};

export const AlgebraArtwork: React.FC<{ name: AlgebraArtworkName }> = ({ name }) => (
  <img
    src={`/icons/algebra-3d-v1/${name}.png`}
    alt=""
    aria-hidden="true"
    className="algebra-icon-art"
    width={44}
    height={44}
    loading="lazy"
    decoding="async"
    draggable={false}
  />
);
