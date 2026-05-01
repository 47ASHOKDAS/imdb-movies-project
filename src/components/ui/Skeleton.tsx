import React from 'react';
import { cn } from '../../lib/utils';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("animate-pulse bg-zinc-800 rounded-lg", className)} />
);

export const MovieGridSkeleton: React.FC<{ count?: number }> = ({ count = 10 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex flex-col gap-3">
        <Skeleton className="aspect-[2/3] w-full rounded-xl" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    ))}
  </div>
);
