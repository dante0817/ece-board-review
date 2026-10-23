import React from 'react';
import { FormulaQuickSheet } from './algebra/FormulaQuickSheet';
import { useReview } from '../context/ReviewContext';

interface FormulaQuickSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialViewMode?: 'cards' | 'dense' | 'practice';
  initialCategory?: string;
}

export const FormulaQuickSheetModal: React.FC<FormulaQuickSheetModalProps> = ({
  isOpen,
  onClose,
  initialViewMode,
  initialCategory,
}) => {
  const { formulaQuickSheetInitialMode, formulaQuickSheetInitialCategory } = useReview();

  if (!isOpen) return null;

  return (
    <FormulaQuickSheet
      isModal
      onClose={onClose}
      initialViewMode={initialViewMode || formulaQuickSheetInitialMode}
      initialCategory={initialCategory || formulaQuickSheetInitialCategory}
    />
  );
};

