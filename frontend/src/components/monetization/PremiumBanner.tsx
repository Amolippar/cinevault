import React from 'react';
import { Crown, Sparkles, Check, ArrowRight } from 'lucide-react';

interface PremiumBannerProps {
  className?: string;
}

export const PremiumBanner: React.FC<PremiumBannerProps> = ({ className = '' }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-cinema-surface via-slate-900 to-emerald-950/40 border border-emerald-500/30 p-6 md:p-8 my-10 shadow-2xl ${className}`}
    >
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Crown className="w-3.5 h-3.5" />
            <span>CineVault Patron Pass</span>
          </div>

          <h3 className="text-xl md:text-2xl font-extrabold text-white">
            Support Public Domain Restoration & Film Preservation
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Help us digitize rare celluloid reels, subtitle classic cinema in 15+ languages, and maintain 100% ad-free streaming for educational institutions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Ad-Free 4K Ultra-HD Remasters</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Exclusive Audio Commentary Tracks</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Early Access to Newly Restored Titles</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Official Preservation Benefactor Badge</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => alert('CineVault Patron tiers are launching soon! Thank you for supporting legal public domain preservation.')}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Become a Patron
            <ArrowRight className="w-4 h-4" />
          </button>
          <span className="text-[11px] text-center text-slate-400">
            Cancel anytime • 100% tax-deductible non-profit trust
          </span>
        </div>
      </div>
    </div>
  );
};
