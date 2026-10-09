import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, X, Sparkles } from 'lucide-react';
import { moviesApi, genresApi } from '../api/client';
import { Movie, Genre } from '../types';
import { MovieCard } from '../components/movie/MovieCard';
import { MovieCardSkeleton } from '../components/common/SkeletonLoader';
import { SEO } from '../components/common/SEO';

export const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search parameters
  const query = searchParams.get('q') || '';
  const actor = searchParams.get('actor') || '';
  const director = searchParams.get('director') || '';
  const genre = searchParams.get('genre') || '';
  const year = searchParams.get('year') || '';
  const language = searchParams.get('language') || '';
  const minRating = searchParams.get('minRating') || '';

  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(Boolean(actor || director || language));

  // Local inputs
  const [searchInput, setSearchInput] = useState<string>(query);
  const [actorInput, setActorInput] = useState<string>(actor);
  const [directorInput, setDirectorInput] = useState<string>(director);

  useEffect(() => {
    genresApi.getAll().then(setGenres).catch(console.error);
  }, []);

  useEffect(() => {
    const executeSearch = async () => {
      try {
        setIsLoading(true);
        const res = await moviesApi.search({
          q: query || undefined,
          actor: actor || undefined,
          director: director || undefined,
          genre: genre || undefined,
          year: year || undefined,
          language: language || undefined,
          minRating: minRating || undefined,
          limit: 30,
        });

        setMovies(res.data || []);
        setTotalCount(res.meta?.total || (res.data ? res.data.length : 0));
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsLoading(false);
      }
    };

    executeSearch();
  }, [query, actor, director, genre, year, language, minRating]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) params.set('q', searchInput.trim());
    else params.delete('q');

    if (actorInput.trim()) params.set('actor', actorInput.trim());
    else params.delete('actor');

    if (directorInput.trim()) params.set('director', directorInput.trim());
    else params.delete('director');

    setSearchParams(params);
  };

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const clearSearch = () => {
    setSearchInput('');
    setActorInput('');
    setDirectorInput('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 min-h-screen">
      <SEO
        title={query ? `Search: "${query}"` : 'Advanced Movie Search'}
        description="Search CineVault's extensive collection of verified public domain movies and legal cinema by actor, director, genre, year, and language."
      />

      {/* Search Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Find Any Film in the Vault
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Search classic cinema by title, actor, director, release year, or language.
        </p>

        {/* Primary Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative mt-4">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title, keywords, or character..."
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl py-3.5 pl-12 pr-28 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 shadow-xl"
          />
          <SearchIcon className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
          <button
            type="submit"
            className="absolute right-2 top-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
          >
            Search
          </button>
        </form>

        {/* Toggle Advanced Filters */}
        <div className="flex items-center justify-center gap-4 text-xs pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            {showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters (Actor, Director, Language)'}
          </button>
          {(query || actor || director || genre || year || language || minRating) && (
            <button
              onClick={clearSearch}
              className="text-slate-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Box */}
      {showAdvanced && (
        <form
          onSubmit={handleSearchSubmit}
          className="max-w-4xl mx-auto mb-10 p-6 rounded-2xl glass-panel border border-slate-700 space-y-4 animate-fade-in"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Actor / Star</label>
              <input
                type="text"
                value={actorInput}
                onChange={(e) => setActorInput(e.target.value)}
                placeholder="e.g. Cary Grant, Duane Jones"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Director</label>
              <input
                type="text"
                value={directorInput}
                onChange={(e) => setDirectorInput(e.target.value)}
                placeholder="e.g. George A. Romero, Fritz Lang"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Genre</label>
              <select
                value={genre}
                onChange={(e) => updateParam('genre', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="">All Genres</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.slug}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Release Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => updateParam('year', e.target.value)}
                placeholder="e.g. 1968"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Language</label>
              <input
                type="text"
                value={language}
                onChange={(e) => updateParam('language', e.target.value)}
                placeholder="e.g. English, German, Silent"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Minimum Score</label>
              <select
                value={minRating}
                onChange={(e) => updateParam('minRating', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="">Any Rating</option>
                <option value="4.5">★ 4.5+ Masterpieces</option>
                <option value="4.0">★ 4.0+ Highly Acclaimed</option>
                <option value="3.0">★ 3.0+ Good</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
            >
              Apply Advanced Filters
            </button>
          </div>
        </form>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <h3 className="text-sm font-bold text-slate-300">
          {query ? `Search results for "${query}"` : 'All Search Results'}
        </h3>
        <span className="text-xs text-emerald-400 font-semibold">
          {totalCount} {totalCount === 1 ? 'film found' : 'films found'}
        </span>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800 p-8 space-y-4 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <SearchIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Matching Films</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            We couldn't find any legal streaming or public domain movies matching your search criteria. Try using different keywords or broader filters.
          </p>
          <button
            onClick={clearSearch}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      )}
    </div>
  );
};
