import React from 'react';
import { StageType } from '@/types';

interface GradeBadgeProps {
  stage: StageType;
  gradeNumber?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function GradeBadge({ stage, gradeNumber, className = '', size = 'md' }: GradeBadgeProps) {
  const getStageConfig = () => {
    switch (stage) {
      case 'elementary':
        return {
          name: 'الابتدائي',
          bg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
          dot: 'bg-emerald-500',
        };
      case 'middle':
        return {
          name: 'المتوسط',
          bg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
          dot: 'bg-blue-500',
        };
      case 'secondary':
        return {
          name: 'الثانوي (مسارات)',
          bg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
          dot: 'bg-amber-500',
        };
      default:
        return {
          name: 'عام',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-500',
        };
    }
  };

  const config = getStageConfig();
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-semibold',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors ${config.bg} ${sizeClasses} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <span>{gradeNumber ? `الصف ${gradeNumber} ${config.name}` : config.name}</span>
    </span>
  );
}
