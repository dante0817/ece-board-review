import React from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description, action }) => (
  <div className="mb-3 flex items-end justify-between gap-3">
    <div>
      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>}
    </div>
    {action}
  </div>
);
