import React from 'react';
import { ALGEBRA_REFERENCE_CONTENT } from '../data/algebraReferenceContent';
import { ReferenceInformedTopicScreen } from './math/ReferenceInformedTopicScreen';

export const QuadraticEquationsScreen: React.FC = () => (
  <ReferenceInformedTopicScreen content={ALGEBRA_REFERENCE_CONTENT['top-quadratics']} iconLabel="x²" />
);
