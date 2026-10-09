import React from 'react';

export const MovieCardSkeleton: React.FC = () => {
  return (
    <div className="relative rounded-xl overflow-hidden bg-cinema-card/50 border border-cinema-border/40 animate-pulse flex flex-col h-full">
      <div className="aspect-[2/3] w-full bg-slate-800/60" />
      <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <div className="h-4 bg-slate-700/60 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-800/60 rounded w-1/2" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-3 bg-slate-800/60 rounded w-1/4" />
          <div className="h-3 bg-slate-800/60 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
};

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="relative w-full h-[65vh] min-h-[480px] bg-slate-900 animate-pulse flex items-end p-8 md:p-16">
      <div className="max-w-2xl w-full space-y-4">
        <div className="h-6 w-32 bg-slate-800 rounded-md" />
        <div className="h-10 md:h-14 w-3/4 bg-slate-800 rounded-lg" />
        <div className="h-4 w-full bg-slate-800/80 rounded" />
        <div className="h-4 w-2/3 bg-slate-800/80 rounded" />
        <div className="flex gap-4 pt-4">
          <div className="h-12 w-36 bg-slate-700 rounded-xl" />
          <div className="h-12 w-36 bg-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC = () => {
  return (
    <tr className="animate-pulse border-b border-cinema-border/50">
      <td className="p-4"><div className="h-4 bg-slate-800 rounded w-3/4" /></td>
      <td className="p-4"><div className="h-4 bg-slate-800 rounded w-1/2" /></td>
      <td className="p-4"><div className="h-4 bg-slate-800 rounded w-1/3" /></td>
      <td className="p-4"><div className="h-4 bg-slate-800 rounded w-1/4" /></td>
      <td className="p-4"><div className="h-6 bg-slate-800 rounded w-20" /></td>
    </tr>
  );
};
