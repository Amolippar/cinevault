import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Film, Bookmark, Info, ExternalLink, ShieldCheck } from 'lucide-react';
import { moviesApi, historyApi, watchlistApi } from '../api/client';
import { Movie, HomepageSection } from '../types';
import { MovieRow } from '../components/movie/MovieRow';
import { HeroSkeleton, MovieCardSkeleton } from '../components/common/SkeletonLoader';
import { TrailerModal } from '../components/movie/TrailerModal';
import { AdBanner } from '../components/monetization/AdBanner';
import { PremiumBanner } from '../components/monetization/PremiumBanner';
import { SEO } from '../components/common/SEO';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { success, error, info: showInfo } = useToast();

  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [activeHeroIndex, setActiveHeroIndex] = useState<number>(0);
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [continueWatching, setContinueWatching] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [trailerMovie, setTrailerMovie] = useState<Movie | null>(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState<boolean>(false);
  const [inWatchlist, setInWatchlist] = useState<boolean>(false);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setIsLoading(true);
        const [featuredRes, sectionsRes] = await Promise.all([
          moviesApi.getFeatured(),
          moviesApi.getSections(),
        ]);

        setFeaturedMovies(featuredRes || []);
        setSections(sectionsRes || []);

        if (isAuthenticated) {
          const cwRes = await historyApi.getContinueWatching().catch(() => []);
          setContinueWatching(cwRes || []);
        }
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, [isAuthenticated]);

  const heroMovie = featuredMovies[activeHeroIndex];

  // Auto-rotate hero every 10 seconds
  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const timer = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [featuredMovies.length]);

  const handleHeroWatchlist = async () => {
    if (!heroMovie) return;
    if (!isAuthenticated) {
      showInfo('Please sign in to save movies to your watchlist.');
      return;
    }

    try {
      if (inWatchlist) {
        await watchlistApi.remove(heroMovie.id);
        setInWatchlist(false);
        success(`Removed "${heroMovie.title}" from watchlist`);
      } else {
        await watchlistApi.add(heroMovie.id);
        setInWatchlist(true);
        success(`Added "${heroMovie.title}" to watchlist`);
      }
    } catch {
      error('Failed to update watchlist');
    }
  };

  const openTrailer = (movie: Movie) => {
    setTrailerMovie(movie);
    setIsTrailerOpen(true);
  };

  return (
    <div className="min-h-screen pb-16">
      <SEO
        title="Home - Legal Movie Discovery & Public Domain Vault"
        description="Stream verified public-domain cinema gems, watch official trailers, and discover legal movies on CineVault."
      />

      {/* Hero Section */}
      {isLoading ? (
        <HeroSkeleton />
      ) : heroMovie ? (
        <div className="relative w-full h-[70vh] min-h-[500px] max-h-[750px] overflow-hidden select-none">
          {/* Backdrop Image */}
          <div className="absolute inset-0">
            <img
              src={heroMovie.backdropUrl || heroMovie.posterUrl}
              alt={heroMovie.title}
              className="w-full h-full object-cover object-center filter brightness-[0.7] transform scale-105 transition-all duration-1000"
            />
            {/* Dark Vignettes */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-[#0a0d14]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0d14] via-[#0a0d14]/80 to-transparent w-full md:w-3/4" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 sm:pb-16 md:pb-20">
            <div className="max-w-2xl space-y-4">
              
              {/* License & Genre Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 backdrop-blur-md">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {(heroMovie.contentRightsStatus === 'PUBLIC_DOMAIN' || heroMovie.licenseStatus === 'PUBLIC_DOMAIN') ? 'Public Domain Masterpiece' : 'Verified Legal Stream'}
                </span>
                {heroMovie.genres?.[0] && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
                    {heroMovie.genres[0].genre.name}
                  </span>
                )}
                <span className="text-xs text-slate-400 font-semibold">{heroMovie.releaseYear}</span>
                <span className="text-xs text-amber-400 font-bold">★ {heroMovie.rating.toFixed(1)}</span>
                <span className="text-xs text-slate-400">{heroMovie.durationMinutes} min</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-xl leading-none">
                {heroMovie.title}
              </h1>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed drop-shadow">
                {heroMovie.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {/* Watch Now or Provider button */}
                {(heroMovie.contentRightsStatus === 'AUTHORIZED_PROVIDER' || heroMovie.licenseStatus === 'AUTHORIZED_EXTERNAL' || heroMovie.licenseStatus === 'AUTHORIZED_PROVIDER') ? (
                  <a
                    href={heroMovie.externalStreamUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-950/40 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Watch on {heroMovie.sourceProvider || heroMovie.externalStreamProvider || 'Partner'}</span>
                  </a>
                ) : (heroMovie.contentRightsStatus === 'TRAILER_ONLY' || heroMovie.licenseStatus === 'TRAILER_ONLY') ? (
                  <button
                    onClick={() => openTrailer(heroMovie)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm shadow-xl shadow-purple-950/40 transition-all cursor-pointer"
                  >
                    <Film className="w-4 h-4" />
                    <span>Watch Trailer</span>
                  </button>
                ) : (
                  <Link
                    to={`/movie/${heroMovie.slug || heroMovie.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-950/40 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Watch Movie</span>
                  </Link>
                )}

                {/* Watch Trailer Button */}
                {(heroMovie.contentRightsStatus !== 'TRAILER_ONLY' && heroMovie.licenseStatus !== 'TRAILER_ONLY') && heroMovie.trailerUrl && (
                  <button
                    onClick={() => openTrailer(heroMovie)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl glass-panel hover:bg-slate-800 text-white font-semibold text-sm transition-all cursor-pointer"
                  >
                    <Film className="w-4 h-4 text-emerald-400" />
                    <span>Trailer</span>
                  </button>
                )}

                {/* Watchlist Button */}
                <button
                  onClick={handleHeroWatchlist}
                  className="p-3 rounded-xl glass-panel hover:bg-slate-800 text-white transition-all cursor-pointer"
                  title="Save to Watchlist"
                >
                  <Bookmark className={`w-4 h-4 ${inWatchlist ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                </button>

                {/* Details Button */}
                <Link
                  to={`/movie/${heroMovie.slug || heroMovie.id}`}
                  className="p-3 rounded-xl glass-panel hover:bg-slate-800 text-white transition-all"
                  title="Full Cast, Crew & Legal Licensing"
                >
                  <Info className="w-4 h-4" />
                </Link>
              </div>

              {/* Dots selector */}
              {featuredMovies.length > 1 && (
                <div className="flex items-center gap-2 pt-4">
                  {featuredMovies.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveHeroIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        activeHeroIndex === idx ? 'w-6 bg-emerald-400' : 'w-2 bg-slate-600'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Continue Watching Section (if active sessions exist) */}
      {continueWatching && continueWatching.length > 0 && (
        <div className="mt-8">
          <MovieRow
            title="Continue Watching"
            movies={continueWatching.map((item) => ({
              ...item.movie,
              userState: {
                ...item.movie.userState,
                watchProgress: {
                  progressSeconds: item.progressSeconds,
                  durationSeconds: item.durationSeconds,
                  completionPercentage: item.completionPercentage,
                  lastWatchedAt: item.lastWatchedAt,
                },
              },
            }))}
            showProgress
          />
        </div>
      )}

      {/* Main Sections (Trending, Popular, Recently Added, Top Rated, Genres) */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : (
          sections.map((sec, idx) => (
            <React.Fragment key={sec.id}>
              <MovieRow
                title={sec.title}
                movies={sec.movies}
                viewAllLink={sec.genreSlug ? `/genres/${sec.genreSlug}` : '/movies'}
              />

              {/* Insert AdBanner and Patron card seamlessly */}
              {idx === 1 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <AdBanner format="leaderboard" />
                </div>
              )}

              {idx === 3 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <PremiumBanner />
                </div>
              )}
            </React.Fragment>
          ))
        )}
      </div>

      {/* Trailer Modal */}
      {trailerMovie && (
        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
          trailerUrl={trailerMovie.trailerUrl}
          movieTitle={trailerMovie.title}
        />
      )}
    </div>
  );
};
