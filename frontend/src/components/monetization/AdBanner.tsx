import React from 'react';
import { ExternalLink } from 'lucide-react';

interface AdBannerProps {
  format?: 'horizontal' | 'rectangle' | 'leaderboard';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  format = 'leaderboard',
  className = '',
}) => {
  return (
    <div className={`my-6 flex flex-col items-center justify-center ${className}`}>
      <div className="w-full max-w-5xl rounded-xl bg-slate-900/60 border border-slate-800/80 p-3 sm:p-4 text-center overflow-hidden">
        {/* Ad Tag */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider mb-2">
          <span>Sponsored Advertisement • CineVault Partner</span>
          <span className="flex items-center gap-1 hover:text-slate-400 cursor-pointer">
            Ad Choices <ExternalLink className="w-2.5 h-2.5" />
          </span>
        </div>

        {/* Ad Body (Compliant Display Unit) */}
        <div
          className={`w-full rounded-lg bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 border border-slate-700/50 flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 gap-4 ${
            format === 'leaderboard' ? 'min-h-[90px]' : 'min-h-[140px]'
          }`}
        >
          <div className="text-left space-y-1">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Partner Offer
            </span>
            <h5 className="text-sm sm:text-base font-bold text-white">
              Criterion Channel & Turner Classic Movies Pass
            </h5>
            <p className="text-xs text-slate-400 max-w-xl">
              Support 4K digital restoration of silent-era and film noir archives with our authorized streaming partner.
            </p>
          </div>

          <a
            href="https://www.criterionchannel.com"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="shrink-0 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors shadow-lg shadow-emerald-900/20"
          >
            Explore Partner
          </a>
        </div>
      </div>
    </div>
  );
};
