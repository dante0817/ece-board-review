import React from 'react';
import { ALGEBRA_REFERENCE_CONTENT, AlgebraReferenceTopicId } from '../data/algebraReferenceContent';
import { ReferenceInformedTopicScreen } from './math/ReferenceInformedTopicScreen';

const ReferenceAlgebraTopicScreen: React.FC<{ topicId: AlgebraReferenceTopicId; iconLabel: string }> = ({ topicId, iconLabel }) => (
  <ReferenceInformedTopicScreen content={ALGEBRA_REFERENCE_CONTENT[topicId]} iconLabel={iconLabel} />
);

export const FactoringScreen: React.FC = () => <ReferenceAlgebraTopicScreen topicId="top-factoring" iconLabel="x²" />;
export const PolynomialsScreen: React.FC = () => <ReferenceAlgebraTopicScreen topicId="top-polynomial-eq" iconLabel="∑" />;
export const ExponentsRadicalsScreen: React.FC = () => <ReferenceAlgebraTopicScreen topicId="top-laws-exponents" iconLabel="xⁿ" />;
export const InequalitiesScreen: React.FC = () => <ReferenceAlgebraTopicScreen topicId="top-inequalities" iconLabel="≤" />;
export const AbsoluteValueScreen: React.FC = () => <ReferenceAlgebraTopicScreen topicId="top-absolute-value" iconLabel="|x|" />;
export const RationalRadicalEquationsScreen: React.FC = () => <ReferenceAlgebraTopicScreen topicId="top-rational-radical-eqs" iconLabel="√x" />;
export const ExponentialLogarithmicScreen: React.FC = () => <ReferenceAlgebraTopicScreen topicId="top-logarithms" iconLabel="log" />;

export const SystemsEquationsScreen: React.FC = () => <ReferenceAlgebraTopicScreen topicId="top-simultaneous-linear" iconLabel="2×2" />;
export const ComplexNumbersScreen: React.FC = () => <ReferenceAlgebraTopicScreen topicId="top-complex-numbers" iconLabel="a+bi" />;
export const ArithmeticProgressionsScreen: React.FC = () => <ReferenceAlgebraTopicScreen topicId="top-arithmetic-seq" iconLabel="AP" />;
export const GeometricProgressionsScreen: React.FC = () => <ReferenceAlgebraTopicScreen topicId="top-geometric-seq" iconLabel="GP" />;
export const BinomialTheoremScreen: React.FC = () => <ReferenceAlgebraTopicScreen topicId="top-binomial-theorem" iconLabel="nCr" />;
export const MatricesScreen: React.FC = () => <ReferenceAlgebraTopicScreen topicId="top-matrices" iconLabel="[A]" />;
export const PartialFractionsScreen: React.FC = () => <ReferenceAlgebraTopicScreen topicId="top-partial-fractions" iconLabel="A/B" />;
export const WordProblemsScreen: React.FC = () => <ReferenceAlgebraTopicScreen topicId="top-word-problems" iconLabel="x?" />;

export const InverseFunctionsScreen: React.FC = () => <ReferenceAlgebraTopicScreen topicId="top-inverse-functions" iconLabel="f⁻¹" />;
export const PolynomialFunctionsScreen: React.FC = () => <ReferenceAlgebraTopicScreen topicId="top-polynomial-functions" iconLabel="P(x)" />;
export const RationalFunctionsScreen: React.FC = () => <ReferenceAlgebraTopicScreen topicId="top-rational-functions" iconLabel="R(x)" />;
export const HarmonicProgressionsScreen: React.FC = () => <ReferenceAlgebraTopicScreen topicId="top-harmonic-seq" iconLabel="HP" />;
