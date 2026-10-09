import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { genresApi } from '../api/client';
import { Genre, Movie, PaginationMeta } from '../types';
import { MovieCard } from '../components/movie/MovieCard';
import { MovieCardSkeleton } from '../components/common/SkeletonLoader';
import { SEO } from '../components/common/SEO';

export const GenreDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [genre, setGenre] = useState<Genre | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!slug) return;

    const fetchGenreMovies = async () => {
      try {
        setIsLoading(true);
        const res = await genresApi.getBySlug(slug, { page, limit: 18 });
        setGenre(res.data?.genre || null);
        setMovies(res.data?.movies || []);
        setMeta(res.meta || null);
      } catch (err) {
        console.error('Failed to load genre movies', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenreMovies();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 min-h-screen">
      <SEO
        title={genre ? `${genre.name} Movies` : 'Genre Movies'}
        description={genre?.description || 'Browse curated movies in this genre on CineVault.'}
      />

      <Link
        to="/genres"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to All Genres
      </Link>

      <div className="mb-10 pb-6 border-b border-cinema-border/50">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {genre?.name || 'Genre'} Cinema
        </h1>
        {genre?.description && (
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
            {genre.description}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800 p-8 space-y-3">
          <h3 className="text-base font-bold text-white">No Movies in this Genre Yet</h3>
          <p className="text-xs text-slate-400">
            Check back soon as we continuously archive and restore public domain cinema.
          </p>
          <Link to="/movies" className="inline-block px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs mt-2">
            Browse All Movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!meta.hasPrev}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-panel text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-xs font-semibold text-slate-400 px-3">
            Page <span className="text-white">{meta.page}</span> of {meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!meta.hasNext}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-panel text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
