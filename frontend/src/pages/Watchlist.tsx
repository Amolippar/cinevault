import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Play, Trash2, Film, Clock, Star } from 'lucide-react';
import { watchlistApi } from '../api/client';
import { WatchlistItem } from '../types';
import { LicenseBadge } from '../components/common/LicenseBadge';
import { SEO } from '../components/common/SEO';
import { useToast } from '../context/ToastContext';

export const Watchlist: React.FC = () => {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  useEffect(() => {
    const loadWatchlist = async () => {
      try {
        setIsLoading(true);
        const data = await watchlistApi.getWatchlist();
        setItems(data || []);
      } catch (err) {
        console.error('Failed to load watchlist', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadWatchlist();
  }, []);

  const handleRemove = async (movieId: string, title: string) => {
    try {
      await watchlistApi.remove(movieId);
      setItems((prev) => prev.filter((item) => item.movie.id !== movieId));
      success(`Removed "${title}" from watchlist`);
    } catch {
      error('Failed to remove from watchlist');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 min-h-screen">
      <SEO
        title="My Watchlist"
        description="Your saved public domain and licensed movies ready for streaming on CineVault."
      />

      <div className="flex items-center justify-between pb-6 border-b border-cinema-border/50 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Bookmark className="w-7 h-7 text-emerald-400 fill-emerald-400" />
            My Watchlist
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {items.length} {items.length === 1 ? 'saved film' : 'saved films'} queued for your private viewing
          </p>
        </div>

        {items.length > 0 && (
          <Link
            to="/movies"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            + Add More Movies
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800 p-8 space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">Your Watchlist is Empty</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Bookmark movies while browsing the vault to save them for later without clutter.
          </p>
          <Link
            to="/movies"
            className="inline-block px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
          >
            Browse Classic Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {items.map(({ movie, addedAt }) => (
            <div
              key={movie.id}
              className="group relative rounded-xl overflow-hidden glass-card border border-slate-800 hover:border-emerald-500/40 flex flex-col justify-between transition-all"
            >
              {/* Image & Quick Overlays */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-2 left-2">
                  <LicenseBadge status={movie.contentRightsStatus || movie.licenseStatus} showIcon={false} className="text-[10px] py-0.5 px-2" />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(movie.id, movie.title)}
                  title="Remove from watchlist"
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-rose-900 text-slate-300 hover:text-white transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <Link
                  to={`/movie/${movie.slug || movie.id}`}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <span className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-xl">
                    <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                  </span>
                </Link>
              </div>

              {/* Card Meta */}
              <div className="p-3.5 space-y-2">
                <Link
                  to={`/movie/${movie.slug || movie.id}`}
                  className="text-xs font-bold text-white hover:text-emerald-400 line-clamp-1"
                >
                  {movie.title}
                </Link>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{movie.releaseYear}</span>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{movie.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                  Added {new Date(addedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
