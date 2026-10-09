import React from 'react';
import { ExternalLink, CheckCircle } from 'lucide-react';

interface AffiliateProviderCardProps {
  providerName: string;
  providerUrl: string;
  movieTitle: string;
  quality?: string;
  isFree?: boolean;
}

export const AffiliateProviderCard: React.FC<AffiliateProviderCardProps> = ({
  providerName,
  providerUrl,
  movieTitle,
  quality = '4K UHD / HD',
  isFree = false,
}) => {
  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-700/80 p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-white">{providerName}</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <CheckCircle className="w-3 h-3" /> Official Licensed Partner
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Stream <span className="text-slate-200 font-medium">{movieTitle}</span> legally in {quality}.
          {isFree ? ' (Free with ads)' : ' (Subscription or rental may apply)'}
        </p>
      </div>

      <div className="flex flex-col sm:items-end gap-1 w-full sm:w-auto">
        <a
          href={providerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-900/20 transition-colors"
        >
          <span>Watch on {providerName}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <span className="text-[10px] text-slate-500">
          Authorized external link • CineVault may earn an affiliate referral fee
        </span>
      </div>
    </div>
  );
};
