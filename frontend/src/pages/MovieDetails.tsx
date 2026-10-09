import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Play,
  Film,
  Bookmark,
  Share2,
  Calendar,
  Clock,
  Globe,
  Award,
  ShieldCheck,
  Star,
  ExternalLink,
  MessageSquare,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { moviesApi, watchlistApi, historyApi, reviewsApi } from '../api/client';
import { Movie, Review } from '../types';
import { VideoPlayer } from '../components/player/VideoPlayer';
import { TrailerModal } from '../components/movie/TrailerModal';
import { LicenseBadge } from '../components/common/LicenseBadge';
import { RatingStars } from '../components/common/RatingStars';
import { MovieRow } from '../components/movie/MovieRow';
import { AffiliateProviderCard } from '../components/monetization/AffiliateProviderCard';
import { SEO } from '../components/common/SEO';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { success, error, info } = useToast();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [related, setRelated] = useState<Movie[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState<boolean>(false);
  const [inWatchlist, setInWatchlist] = useState<boolean>(false);

  // Review submission state
  const [userRating, setUserRating] = useState<number>(5);
  const [reviewContent, setReviewContent] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  useEffect(() => {
    const fetchMovieData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setIsPlayingVideo(false);
        const movieData = await moviesApi.getByIdOrSlug(id);
        setMovie(movieData);
        setInWatchlist(Boolean(movieData.userState?.inWatchlist));

        // Load reviews and related in parallel
        const [reviewsRes, relatedRes] = await Promise.all([
          reviewsApi.getByMovie(movieData.id).catch(() => ({ data: [] })),
          moviesApi.getRelated(movieData.id).catch(() => []),
        ]);

        setReviews(reviewsRes.data || []);
        setRelated(relatedRes || []);
      } catch (err) {
        console.error('Failed to load movie details', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleWatchlistToggle = async () => {
    if (!movie) return;
    if (!isAuthenticated) {
      info('Please sign in to save movies to your watchlist.');
      return;
    }

    try {
      if (inWatchlist) {
        await watchlistApi.remove(movie.id);
        setInWatchlist(false);
        success(`Removed "${movie.title}" from watchlist`);
      } else {
        await watchlistApi.add(movie.id);
        setInWatchlist(true);
        success(`Added "${movie.title}" to watchlist`);
      }
    } catch {
      error('Failed to update watchlist');
    }
  };

  const handleProgressSync = (progressSeconds: number, durationSeconds: number) => {
    if (!movie || !isAuthenticated) return;
    historyApi
      .updateProgress({
        movieId: movie.id,
        progressSeconds,
        durationSeconds,
      })
      .catch(() => {});
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movie) return;
    if (!isAuthenticated) {
      info('Please sign in to post a review.');
      return;
    }

    if (!reviewContent.trim() || reviewContent.trim().length < 5) {
      error('Review content must be at least 5 characters long.');
      return;
    }

    try {
      setIsSubmittingReview(true);
      const res = await reviewsApi.create(movie.id, {
        rating: userRating,
        content: reviewContent.trim(),
      });

      success('Review submitted successfully!');
      setReviews([res.data, ...reviews]);
      setReviewContent('');

      // Refresh movie data to show updated aggregate rating
      const updatedMovie = await moviesApi.getByIdOrSlug(movie.id);
      setMovie(updatedMovie);
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    success('Movie link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="h-10 w-48 bg-slate-800 rounded mx-auto mb-4" />
        <div className="h-64 w-full bg-slate-900 rounded-2xl" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Movie Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">
          The movie you are looking for does not exist or has been removed.
        </p>
        <Link to="/movies" className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">
          Browse All Movies
        </Link>
      </div>
    );
  }

  const directors = movie.castMembers?.filter((c) => c.role === 'DIRECTOR') || [];
  const actors = movie.castMembers?.filter((c) => c.role === 'ACTOR') || [];

  return (
    <div className="min-h-screen pb-20">
      <SEO
        title={`${movie.title} (${movie.releaseYear})`}
        description={movie.description}
        movie={movie}
      />

      {/* Hero Backdrop & Details Header */}
      <div className="relative w-full overflow-hidden select-none bg-[#0a0d14]">
        {/* Backdrop Image with gradient overlay */}
        <div className="absolute inset-0 h-[480px] sm:h-[550px] w-full">
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover filter brightness-[0.45]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-[#0a0d14]/70 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-12">
          
          {/* License Expired Notice Banner */}
          {(movie.isLicenseExpired || movie.unavailableNotice) && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm flex items-center gap-3 shadow-lg">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="font-semibold">{movie.unavailableNotice || "This content is currently unavailable because its distribution license has expired."}</span>
            </div>
          )}

          {/* Active Video Player (if clicked Watch Movie) */}
          {isPlayingVideo && movie.canStreamDirect && movie.videoSourceUrl && !movie.isLicenseExpired && (
            <div className="mb-10 max-w-5xl mx-auto animate-fade-in">
              <VideoPlayer
                src={movie.videoSourceUrl}
                title={movie.title}
                licenseStatus={movie.contentRightsStatus || movie.licenseStatus || 'PUBLIC_DOMAIN'}
                licenseNotes={movie.licenseNotes}
                isExpired={movie.isLicenseExpired}
                unavailableNotice={movie.unavailableNotice}
                initialProgressSeconds={movie.userState?.watchProgress?.progressSeconds || 0}
                onProgressUpdate={handleProgressSync}
                onClose={() => setIsPlayingVideo(false)}
              />
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
            {/* Poster column */}
            <div className="w-56 sm:w-64 md:w-72 shrink-0 mx-auto md:mx-0 shadow-2xl rounded-2xl overflow-hidden border border-slate-700/80 group">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full aspect-[2/3] object-cover"
              />
            </div>

            {/* Info details column */}
            <div className="flex-1 space-y-5">
              {/* License Badge & Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <LicenseBadge status={movie.contentRightsStatus || movie.licenseStatus} provider={movie.sourceProvider || movie.externalStreamProvider} />
                {movie.publicationStatus && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    movie.publicationStatus === 'PUBLISHED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : movie.publicationStatus === 'APPROVED'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : movie.publicationStatus === 'RIGHTS_REVIEW'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {movie.publicationStatus}
                  </span>
                )}
                {movie.genres?.map((g) => (
                  <Link
                    key={g.genre.id}
                    to={`/genres/${g.genre.slug}`}
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                  >
                    {g.genre.name}
                  </Link>
                ))}
              </div>

              {/* Title & Tagline */}
              <div>
                <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                  {movie.title}
                </h1>
                {movie.originalTitle && movie.originalTitle !== movie.title && (
                  <p className="text-xs text-slate-400 mt-1 italic">
                    Original Title: {movie.originalTitle}
                  </p>
                )}
              </div>

              {/* Meta stats bar */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 py-2 border-y border-slate-800/80">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{movie.rating > 0 ? movie.rating.toFixed(1) : 'NR'}</span>
                  <span className="text-slate-500 font-normal">({movie.ratingsCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{movie.releaseYear}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{movie.durationMinutes} min</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span>{movie.language} ({movie.country})</span>
                </div>
              </div>

              {/* Synopsis */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Synopsis
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-3xl">
                  {movie.description}
                </p>
              </div>

              {/* Director & Cast Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {(movie.director || directors.length > 0) && (
                  <div>
                    <span className="text-slate-400 font-medium">Director: </span>
                    <span className="text-white font-semibold">
                      {movie.director || directors.map((d) => d.cast.name).join(', ')}
                    </span>
                  </div>
                )}
                {(movie.cast || actors.length > 0) && (
                  <div>
                    <span className="text-slate-400 font-medium">Cast: </span>
                    <span className="text-white font-semibold">
                      {movie.cast || actors.map((a) => a.characterName ? `${a.cast.name} (${a.characterName})` : a.cast.name).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {/* Watch Movie button (if direct stream is permitted) */}
                {movie.canStreamDirect && !movie.isLicenseExpired ? (
                  <button
                    onClick={() => setIsPlayingVideo(true)}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-950/40 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Watch Movie</span>
                  </button>
                ) : ((movie.contentRightsStatus === 'AUTHORIZED_PROVIDER' || movie.licenseStatus === 'AUTHORIZED_EXTERNAL') && (movie.externalStreamUrl || movie.videoSourceUrl) && !movie.isLicenseExpired) ? (
                  <a
                    href={movie.externalStreamUrl || movie.videoSourceUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-950/40 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Watch on {movie.sourceProvider || movie.externalStreamProvider || 'Partner'}</span>
                  </a>
                ) : null}

                {/* Watch Official Trailer */}
                {movie.trailerUrl && (
                  <button
                    onClick={() => setIsTrailerOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl glass-panel hover:bg-slate-800 text-white font-semibold text-sm transition-all cursor-pointer"
                  >
                    <Film className="w-4 h-4 text-emerald-400" />
                    <span>Watch Trailer</span>
                  </button>
                )}

                {/* Watchlist Toggle */}
                <button
                  onClick={handleWatchlistToggle}
                  className={`inline-flex items-center gap-2 px-4 py-3.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    inWatchlist
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'glass-panel text-slate-200 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${inWatchlist ? 'fill-emerald-400' : ''}`} />
                  <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
                </button>

                {/* Share Button */}
                <button
                  onClick={copyShareLink}
                  className="p-3.5 rounded-xl glass-panel text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                  title="Share Movie Link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Legal License Explanatory Card */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5 mt-4">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Verified Legal Verification Details</span>
                </div>
                {movie.rightsHolder && (
                  <p className="text-slate-300">
                    <span className="text-slate-500">Rights Holder:</span> {movie.rightsHolder}
                  </p>
                )}
                {(movie.sourceProvider || movie.externalStreamProvider) && (
                  <p className="text-slate-300">
                    <span className="text-slate-500">Source / Provider:</span> {movie.sourceProvider || movie.externalStreamProvider}
                  </p>
                )}
                {movie.licenseDocument && (
                  <p className="text-slate-300">
                    <span className="text-slate-500">License Document:</span> {movie.licenseDocument}
                  </p>
                )}
                {movie.licenseNotes && (
                  <p className="text-slate-400 leading-relaxed">{movie.licenseNotes}</p>
                )}
                {(movie.licenseEndDate || movie.licenseExpiresAt) && (
                  <p className="text-[11px] text-slate-500">
                    Distribution agreement valid through: {new Date(movie.licenseEndDate || movie.licenseExpiresAt!).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* External Partner Provider Card if Authorized External */}
      {((movie.contentRightsStatus === 'AUTHORIZED_PROVIDER' || movie.licenseStatus === 'AUTHORIZED_EXTERNAL') && (movie.externalStreamUrl || movie.videoSourceUrl)) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <AffiliateProviderCard
            providerName={movie.sourceProvider || movie.externalStreamProvider || 'Licensed Partner'}
            providerUrl={movie.externalStreamUrl || movie.videoSourceUrl || '#'}
            movieTitle={movie.title}
          />
        </div>
      )}

      {/* Reviews Section & Community Discussions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="border-t border-slate-800 pt-10">
          <div className="flex flex-col md:flex-row gap-10">
            
            {/* Reviews List Column */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  Audience Reviews ({reviews.length})
                </h3>
              </div>

              {reviews.length === 0 ? (
                <div className="p-8 rounded-2xl glass-card text-center text-slate-400 text-xs space-y-2">
                  <p>No member reviews yet for this title.</p>
                  <p className="text-slate-500">Be the first to share your thoughts and score!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 rounded-2xl glass-card border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={rev.user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                            alt={rev.user?.name || 'Reviewer'}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <h5 className="text-xs font-bold text-white">
                              {rev.user?.name || 'Cinephile'}
                            </h5>
                            <span className="text-[10px] text-slate-500">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <RatingStars rating={rev.rating} size="sm" showNumber />
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {rev.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write a Review Card */}
            <div className="w-full md:w-96 shrink-0">
              <div className="rounded-2xl glass-panel p-6 border border-slate-700/80 space-y-4 sticky top-24">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Leave a Review
                </h4>

                {isAuthenticated ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">
                        Your Rating (1 to 5 Stars)
                      </label>
                      <RatingStars
                        rating={userRating}
                        interactive
                        onRatingChange={setUserRating}
                        size="lg"
                        showNumber
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">
                        Your Review
                      </label>
                      <textarea
                        rows={4}
                        value={reviewContent}
                        onChange={(e) => setReviewContent(e.target.value)}
                        placeholder="What did you think of the direction, screenplay, and historical preservation?"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingReview ? 'Publishing...' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-6 space-y-3">
                    <p className="text-xs text-slate-400">
                      Sign in to your CineVault account to rate this movie and write a review.
                    </p>
                    <Link
                      to="/login"
                      className="inline-block px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                    >
                      Sign In to Review
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Movies */}
      {related.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <MovieRow title="More Like This" movies={related} />
        </div>
      )}

      {/* Trailer Modal */}
      {movie.trailerUrl && (
        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
          trailerUrl={movie.trailerUrl}
          movieTitle={movie.title}
        />
      )}
    </div>
  );
};
