import { AppArtwork } from './common/AppArtwork';
import { FeatureIcon } from './common/FeatureIcon';
import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface AlgebraFlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlgebraFlashcardsModal: React.FC<AlgebraFlashcardsModalProps> = ({ isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!isOpen) return null;

  const cards = [
    {
      topic: 'Rational Expressions',
      question: 'What condition creates an extraneous root when solving rational equations?',
      answer: 'Multiplying both sides by a common denominator that equals zero at the solution value (division by zero in original expression).',
    },
    {
      topic: 'Quadratic Equations',
      question: 'What is the sum and product of the roots of ax² + bx + c = 0 (Vieta’s Formulas)?',
      answer: 'Sum of roots: x₁ + x₂ = -b/a.  Product of roots: x₁ · x₂ = c/a.',
    },
    {
      topic: 'Logarithms',
      question: 'What is the change of base formula for log_b(a)?',
      answer: 'log_b(a) = ln(a) / ln(b) = log₁₀(a) / log₁₀(b).',
    },
    {
      topic: 'Complex Numbers',
      question: 'State Euler’s Formula and De Moivre’s Theorem for (cos θ + i sin θ)ⁿ.',
      answer: 'Euler’s: e^(iθ) = cos θ + i sin θ.  De Moivre’s: [r(cos θ + i sin θ)]ⁿ = rⁿ (cos nθ + i sin nθ).',
    },
    {
      topic: 'Arithmetic Progression',
      question: 'What is the formula for the n-th term and sum of an arithmetic progression?',
      answer: 'a_n = a₁ + (n - 1)d   and   S_n = (n / 2) · [2a₁ + (n - 1)d] = (n / 2) · (a₁ + a_n).',
    },
  ];

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FeatureIcon name="flashcards" size="small" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Algebra Recall Flashcards</h3>
              <p className="text-[11px] text-slate-500">
                Card {currentIndex + 1} of {cards.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Body (Interactive Flip) */}
        <div className="p-6">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-56 p-6 rounded-2xl bg-[#f8fafc] border-2 border-dashed border-blue-200 hover:border-blue-400 flex flex-col justify-between cursor-pointer transition-all shadow-inner group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {currentCard.topic}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 group-hover:text-blue-600">
                <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
                <span>Click to flip</span>
              </span>
            </div>

            <div className="my-4 text-center">
              {!isFlipped ? (
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Question
                  </span>
                  <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {currentCard.question}
                  </p>
                </div>
              ) : (
                <div>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-2">
                    Answer / Formula
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed font-mono">
                    {currentCard.answer}
                  </p>
                </div>
              )}
            </div>

            <div className="text-center text-[11px] text-slate-400">
              {isFlipped ? 'Answer shown' : 'Card front'}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-5">
            <button
              onClick={handlePrev}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
              <span>Flip Card</span>
            </button>

            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
