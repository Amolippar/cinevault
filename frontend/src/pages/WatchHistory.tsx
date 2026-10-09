import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Play, Trash2, Clock, CheckCircle } from 'lucide-react';
import { historyApi } from '../api/client';
import { WatchHistoryItem } from '../types';
import { SEO } from '../components/common/SEO';
import { useToast } from '../context/ToastContext';

export const WatchHistory: React.FC = () => {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        const data = await historyApi.getHistory();
        setHistory(data || []);
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your complete viewing history?')) return;
    try {
      await historyApi.clear();
      setHistory([]);
      success('Watch history cleared successfully.');
    } catch {
      error('Failed to clear watch history.');
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 min-h-screen">
      <SEO
        title="Watch History"
        description="Review movies you have streamed on CineVault and resume where you left off."
      />

      <div className="flex items-center justify-between pb-6 border-b border-cinema-border/50 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <History className="w-7 h-7 text-emerald-400" />
            Watch History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pick up right where you left off or review past viewing sessions
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear History
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800 p-8 space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
            <History className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Watch History Yet</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            As you stream public domain and licensed movies, your playback progress will automatically save here.
          </p>
          <Link
            to="/movies"
            className="inline-block px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
          >
            Start Watching
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => {
            const isCompleted = item.completionPercentage >= 90;
            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl glass-card border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 sm:w-20 aspect-[2/3] rounded-xl overflow-hidden bg-slate-900 shrink-0">
                    <img
                      src={item.movie.posterUrl}
                      alt={item.movie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Link
                      to={`/movie/${item.movie.slug || item.movie.id}`}
                      className="text-sm sm:text-base font-bold text-white hover:text-emerald-400 transition-colors"
                    >
                      {item.movie.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>{item.movie.releaseYear}</span>
                      <span>•</span>
                      <span>{item.movie.durationMinutes} min</span>
                      <span>•</span>
                      <span>Last watched: {new Date(item.lastWatchedAt).toLocaleDateString()}</span>
                    </div>

                    {/* Progress Bar & percentage */}
                    <div className="w-48 sm:w-64 space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                        <span>{formatSeconds(item.progressSeconds)} watched</span>
                        <span>{Math.round(item.completionPercentage)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full"
                          style={{ width: `${Math.min(100, item.completionPercentage)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                      <CheckCircle className="w-3.5 h-3.5" /> Completed
                    </span>
                  ) : null}

                  <Link
                    to={`/movie/${item.movie.slug || item.movie.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>{isCompleted ? 'Watch Again' : 'Resume'}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
