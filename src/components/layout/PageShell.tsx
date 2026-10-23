import React from 'react';

type PageWidth = 'compact' | 'standard' | 'wide';

interface PageShellProps {
  children: React.ReactNode;
  width?: PageWidth;
  className?: string;
}

const widthClasses: Record<PageWidth, string> = {
  compact: 'max-w-5xl',
  standard: 'max-w-6xl',
  wide: 'max-w-7xl',
};

export const PageShell: React.FC<PageShellProps> = ({
  children,
  width = 'standard',
  className = '',
}) => (
  <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 ${widthClasses[width]} ${className}`}>
    {children}
  </div>
);
