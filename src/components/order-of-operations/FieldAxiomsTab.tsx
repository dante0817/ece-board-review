import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { MathFormula } from '../MathFormula';
import { FIELD_AXIOMS, FieldAxiom } from '../../data/orderOfOperationsData';
import { AlertOctagon, Search } from 'lucide-react';

export const FieldAxiomsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAxiomId, setSelectedAxiomId] = useState<string>(
    FIELD_AXIOMS[0].id
  );

  const filteredAxioms = FIELD_AXIOMS.filter(
    (ax) =>
      ax.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ax.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ax.eceRelevance.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeAxiom =
    FIELD_AXIOMS.find((ax) => ax.id === selectedAxiomId) || FIELD_AXIOMS[0];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AppArtwork name="cards" inline className="w-5 h-5 text-blue-600" />
              <span>The 11 Real Number Field Axioms</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Every simplification step in algebra relies on these rigorous axioms. In the PRC ECE Licensure Examination, theoretical questions frequently ask to identify which property validates a given algebraic transformation.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search properties or axioms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Main Grid Layout: List on Left, Deep Dive on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Axiom Cards List */}
        <div className="lg:col-span-5 space-y-2.5">
          {filteredAxioms.map((ax) => {
            const isSelected = ax.id === activeAxiom.id;
            return (
              <div
                key={ax.id}
                onClick={() => setSelectedAxiomId(ax.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs sm:text-sm text-slate-900">
                    {ax.name}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    Field Axiom
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {ax.definition}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Detailed Axiom Showcase */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 sticky top-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  Axiomatic Foundation
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {activeAxiom.id}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {activeAxiom.name}
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {activeAxiom.definition}
              </p>
            </div>

            {/* Formulas Showcase Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Under Addition (+)
                </span>
                <div className="text-sm sm:text-base font-serif font-bold text-slate-900 py-1">
                  <MathFormula formula={`$$${activeAxiom.additionForm}$$`} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Under Multiplication (·)
                </span>
                <div className="text-sm sm:text-base font-serif font-bold text-slate-900 py-1">
                  <MathFormula formula={`$$${activeAxiom.multiplicationForm}$$`} />
                </div>
              </div>
            </div>

            {/* ECE Engineering Application */}
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
                <AppArtwork name="chip" inline className="w-4 h-4 text-indigo-600" />
                <span>ECE Engineering & Board Licensure Relevance:</span>
              </div>
              <p className="text-xs text-indigo-900 leading-relaxed">
                {activeAxiom.eceRelevance}
              </p>
            </div>

            {/* Counterexample / Failure Trap */}
            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-950">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <span>When Does This Axiom FAIL or Cause an Exam Trap?</span>
              </div>
              <p className="text-xs text-rose-900 leading-relaxed">
                {activeAxiom.counterexampleOrTrap}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
