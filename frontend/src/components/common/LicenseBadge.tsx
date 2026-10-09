import React from 'react';
import { ContentRightsStatus } from '../../types';
import { ShieldCheck, Award, ExternalLink, Film, CheckCircle, AlertTriangle } from 'lucide-react';

interface LicenseBadgeProps {
  status?: ContentRightsStatus | string | null;
  provider?: string | null;
  className?: string;
  showIcon?: boolean;
}

export const LicenseBadge: React.FC<LicenseBadgeProps> = ({
  status = 'PUBLIC_DOMAIN',
  provider,
  className = '',
  showIcon = true,
}) => {
  switch (status) {
    case 'PUBLIC_DOMAIN':
      return (
        <span
          title="Verified Public Domain - Worldwide free cultural heritage"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${className}`}
        >
          {showIcon && <ShieldCheck className="w-3.5 h-3.5" />}
          Public Domain
        </span>
      );

    case 'OWNED_CONTENT':
      return (
        <span
          title="Directly Owned Content - Confirmed distribution rights holder"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 ${className}`}
        >
          {showIcon && <CheckCircle className="w-3.5 h-3.5" />}
          Owned Content
        </span>
      );

    case 'LICENSED':
      return (
        <span
          title="Licensed Content - Contractual agreement verified & documented"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30 ${className}`}
        >
          {showIcon && <Award className="w-3.5 h-3.5" />}
          Licensed Stream
        </span>
      );

    case 'AUTHORIZED_PROVIDER':
    case 'AUTHORIZED_EXTERNAL':
      return (
        <span
          title={`Available legally via authorized partner: ${provider || 'Official Provider'}`}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 ${className}`}
        >
          {showIcon && <ExternalLink className="w-3.5 h-3.5" />}
          {provider ? `Watch on ${provider}` : 'Authorized Partner'}
        </span>
      );

    case 'TRAILER_ONLY':
      return (
        <span
          title="Official promotional trailer only. Direct film streaming is not licensed."
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30 ${className}`}
        >
          {showIcon && <Film className="w-3.5 h-3.5" />}
          Trailer Only
        </span>
      );

    case 'UNVERIFIED':
    default:
      return (
        <span
          title="Unverified Rights - Cannot be published until legal audit is completed"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 ${className}`}
        >
          {showIcon && <AlertTriangle className="w-3.5 h-3.5" />}
          Unverified Rights
        </span>
      );
  }
};
