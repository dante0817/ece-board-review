import React from 'react';

interface PageHeaderProps {
  title: string;
  icon?: React.ReactNode;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  icon,
  description,
  eyebrow,
  actions,
  className = '',
}) => (
  <div className={`flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between ${className}`}>
    <div className="flex min-w-0 items-center gap-3">
      {icon}
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-100 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>
);
