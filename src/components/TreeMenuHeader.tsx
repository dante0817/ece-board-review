import React from 'react';
import { ChevronRight, ArrowLeft } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

export interface TreeMenuHeaderProps {
  items: BreadcrumbItem[];
  backButton?: {
    label: string;
    onClick: () => void;
  };
}

export const TreeMenuHeader: React.FC<TreeMenuHeaderProps> = ({ items, backButton }) => {
  return (
    <header className="shrink-0 bg-[#f4f7fb] border-b border-slate-200/80 z-20 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Breadcrumb Tree Navigation */}
        <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500 flex-wrap">
          {items.map((item, index) => {
            const isLast = index === items.length - 1 || item.isActive;
            return (
              <React.Fragment key={index}>
                {index > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                {isLast ? (
                  <span aria-current="page" className="font-semibold text-slate-800 tracking-tight">
                    {item.label}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="hover:text-blue-600 transition-colors font-medium cursor-pointer rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    {item.label}
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Back Button */}
        {backButton && (
          <button
            type="button"
            onClick={backButton.onClick}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs sm:text-sm font-semibold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>{backButton.label}</span>
          </button>
        )}
      </div>
    </header>
  );
};
