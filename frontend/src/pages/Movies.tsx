import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { moviesApi, genresApi } from '../api/client';
import { Movie, Genre, PaginationMeta } from '../types';
import { MovieCard } from '../components/movie/MovieCard';
import { MovieCardSkeleton } from '../components/common/SkeletonLoader';
import { SEO } from '../components/common/SEO';

export const Movies: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Filter state synced from query params
  const genre = searchParams.get('genre') || '';
  const licenseStatus = searchParams.get('licenseStatus') || '';
  const sort = searchParams.get('sort') || 'trending';
  const minRating = searchParams.get('minRating') || '';
  const year = searchParams.get('year') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    genresApi.getAll().then(setGenres).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        const res = await moviesApi.getMovies({
          genre: genre || undefined,
          licenseStatus: licenseStatus || undefined,
          sort: sort || undefined,
          minRating: minRating || undefined,
          year: year || undefined,
          page,
          limit: 18,
        });

        setMovies(res.data || []);
        setMeta(res.meta || null);
      } catch (err) {
        console.error('Failed to load movies', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [genre, licenseStatus, sort, minRating, year, page]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams({ sort: 'trending', page: '1' }));
  };

  const hasActiveFilters = Boolean(genre || licenseStatus || minRating || year);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <SEO
        title="Browse Movies - Curated Catalog"
        description="Explore the full catalog of legal streaming movies, verified public domain gems, and licensed titles on CineVault."
      />

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-cinema-border/50">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Movie Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse verified public-domain films, authorized external titles, and licensed releases.
          </p>
        </div>

        {/* Sort and Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'glass-panel text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <select
            value={sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="trending">Sort: Trending</option>
            <option value="top-rated">Sort: Top Rated</option>
            <option value="newest">Sort: Release Year (Newest)</option>
            <option value="title">Sort: Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Filter Panel Drawer */}
      {showFilters && (
        <div className="mt-6 p-6 rounded-2xl glass-panel border border-slate-700/80 space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-400" />
              Filter Movies
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
              >
                <X className="w-3.5 h-3.5" /> Clear All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Genre Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Genre</label>
              <select
                value={genre}
                onChange={(e) => updateFilter('genre', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
              >
                <option value="">All Genres</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.slug}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* License Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Legal Licensing</label>
              <select
                value={licenseStatus}
                onChange={(e) => updateFilter('licenseStatus', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
              >
                <option value="">All Licenses</option>
                <option value="PUBLIC_DOMAIN">Public Domain (Direct Stream)</option>
                <option value="LICENSED">Licensed Streaming</option>
                <option value="AUTHORIZED_EXTERNAL">Authorized External Providers</option>
                <option value="TRAILER_ONLY">Official Trailers Only</option>
              </select>
            </div>

            {/* Min Rating */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Minimum Rating</label>
              <select
                value={minRating}
                onChange={(e) => updateFilter('minRating', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200"
              >
                <option value="">Any Rating</option>
                <option value="4.5">★ 4.5+ Masterpieces</option>
                <option value="4.0">★ 4.0+ Highly Acclaimed</option>
                <option value="3.0">★ 3.0+ Good</option>
              </select>
            </div>

            {/* Release Era / Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Era / Year</label>
              <input
                type="number"
                placeholder="e.g. 1968"
                value={year}
                onChange={(e) => updateFilter('year', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Movie Grid */}
      <div className="mt-8">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800 p-8 space-y-4">
            <h3 className="text-lg font-bold text-white">No Movies Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              We couldn't find any movies matching your current filter criteria. Try adjusting or clearing your filters.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {movies.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-3">
          <button
            onClick={() => updateFilter('page', (page - 1).toString())}
            disabled={!meta.hasPrev}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-panel text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <span className="text-xs font-semibold text-slate-400 px-3">
            Page <span className="text-white">{meta.page}</span> of {meta.totalPages}
          </span>

          <button
            onClick={() => updateFilter('page', (page + 1).toString())}
            disabled={!meta.hasNext}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-panel text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
