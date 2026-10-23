import React from 'react';
import { ALGEBRA_REFERENCE_CONTENT } from '../data/algebraReferenceContent';
import { ReferenceInformedTopicScreen } from './math/ReferenceInformedTopicScreen';

export const FunctionsScreen: React.FC = () => (
  <ReferenceInformedTopicScreen content={ALGEBRA_REFERENCE_CONTENT['top-functions']} iconLabel="f(x)" />
);
