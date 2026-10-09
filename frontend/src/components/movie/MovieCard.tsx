import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Bookmark, Star, ExternalLink, Film } from 'lucide-react';
import { Movie } from '../../types';
import { LicenseBadge } from '../common/LicenseBadge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { watchlistApi } from '../../api/client';

interface MovieCardProps {
  movie: Movie;
  onWatchlistToggle?: (movieId: string, isAdded: boolean) => void;
  className?: string;
  showProgress?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onWatchlistToggle,
  className = '',
  showProgress = false,
}) => {
  const { isAuthenticated } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const [inWatchlist, setInWatchlist] = useState<boolean>(
    Boolean(movie.userState?.inWatchlist)
  );
  const [isUpdatingWatchlist, setIsUpdatingWatchlist] = useState<boolean>(false);

  const handleWatchlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      info('Please sign in to add movies to your watchlist.');
      navigate('/login');
      return;
    }

    try {
      setIsUpdatingWatchlist(true);
      if (inWatchlist) {
        await watchlistApi.remove(movie.id);
        setInWatchlist(false);
        success(`Removed "${movie.title}" from watchlist`);
        onWatchlistToggle?.(movie.id, false);
      } else {
        await watchlistApi.add(movie.id);
        setInWatchlist(true);
        success(`Added "${movie.title}" to watchlist`);
        onWatchlistToggle?.(movie.id, true);
      }
    } catch (err: any) {
      error('Failed to update watchlist');
    } finally {
      setIsUpdatingWatchlist(false);
    }
  };

  const primaryGenre = movie.genres?.[0]?.genre?.name;
  const progressPercent = movie.userState?.watchProgress?.completionPercentage;

  return (
    <div
      className={`group relative flex flex-col rounded-xl overflow-hidden glass-card hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-950/30 transition-all duration-300 transform hover:-translate-y-1 ${className}`}
    >
      {/* Poster Image Container */}
      <Link to={`/movie/${movie.slug || movie.id}`} className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900 block">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* License Badge Top Left */}
        <div className="absolute top-2 left-2 z-10">
          <LicenseBadge status={movie.contentRightsStatus || movie.licenseStatus} showIcon={false} className="text-[10px] py-0.5 px-2 backdrop-blur-md" />
        </div>

        {/* Watchlist Quick Button Top Right */}
        <button
          type="button"
          onClick={handleWatchlistClick}
          disabled={isUpdatingWatchlist}
          title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full backdrop-blur-md transition-all ${
            inWatchlist
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
              : 'bg-black/60 text-slate-300 hover:text-white hover:bg-black/80'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${inWatchlist ? 'fill-slate-950' : ''}`} />
        </button>

        {/* Watch Progress Bar if applicable */}
        {showProgress && progressPercent && progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-900/80 z-10">
            <div
              className="h-full bg-emerald-400"
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
        )}

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-2">
            <span className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 transform scale-75 group-hover:scale-100 transition-transform">
              {(movie.contentRightsStatus === 'AUTHORIZED_PROVIDER' || movie.licenseStatus === 'AUTHORIZED_EXTERNAL' || movie.licenseStatus === 'AUTHORIZED_PROVIDER') ? (
                <ExternalLink className="w-5 h-5 ml-0.5" />
              ) : (movie.contentRightsStatus === 'TRAILER_ONLY' || movie.licenseStatus === 'TRAILER_ONLY') ? (
                <Film className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
              )}
            </span>
            <span className="text-[11px] font-bold text-white uppercase tracking-wider">
              {(movie.contentRightsStatus === 'AUTHORIZED_PROVIDER' || movie.licenseStatus === 'AUTHORIZED_EXTERNAL' || movie.licenseStatus === 'AUTHORIZED_PROVIDER')
                ? 'External Link'
                : (movie.contentRightsStatus === 'TRAILER_ONLY' || movie.licenseStatus === 'TRAILER_ONLY')
                ? 'Watch Trailer'
                : 'Watch Now'}
            </span>
          </div>
        </div>
      </Link>

      {/* Card Info Details */}
      <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
        <div>
          <div className="flex items-center justify-between gap-1 text-[11px] text-slate-400 mb-1">
            <span>{movie.releaseYear}</span>
            {primaryGenre && <span className="truncate max-w-[90px]">{primaryGenre}</span>}
          </div>

          <Link
            to={`/movie/${movie.slug || movie.id}`}
            className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1"
            title={movie.title}
          >
            {movie.title}
          </Link>
        </div>

        {/* Rating & Quick Action Row */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-1 text-amber-400 font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{movie.rating > 0 ? movie.rating.toFixed(1) : 'NR'}</span>
          </div>

          <Link
            to={`/movie/${movie.slug || movie.id}`}
            className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300"
          >
            Details →
          </Link>
        </div>
      </div>
    </div>
  );
};
