import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Star, Edit3, Trash2, Save, X } from 'lucide-react';
import { reviewsApi } from '../api/client';
import { Review } from '../types';
import { RatingStars } from '../components/common/RatingStars';
import { SEO } from '../components/common/SEO';
import { useToast } from '../context/ToastContext';

export const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState<number>(5);
  const [editContent, setEditContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const { success, error } = useToast();

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setIsLoading(true);
        const data = await reviewsApi.getUserReviews();
        setReviews(data || []);
      } catch (err) {
        console.error('Failed to load user reviews', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadReviews();
  }, []);

  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditContent(review.content);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    try {
      setIsSaving(true);
      const res = await reviewsApi.update(editingReview.id, {
        rating: editRating,
        content: editContent.trim(),
      });

      setReviews((prev) =>
        prev.map((r) => (r.id === editingReview.id ? { ...r, ...res.data } : r))
      );
      success('Review updated successfully!');
      setEditingReview(null);
    } catch {
      error('Failed to update review.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewsApi.delete(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      success('Review deleted successfully.');
    } catch {
      error('Failed to delete review.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 min-h-screen">
      <SEO title="My Reviews" description="Manage your ratings and reviews on CineVault." />

      <div className="pb-6 border-b border-cinema-border/50 mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <MessageSquare className="w-7 h-7 text-emerald-400" />
          My Ratings & Reviews
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review your film critique notes, star scores, and public cinema reflections
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800 p-8 space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
            <Star className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Reviews Yet</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            You haven't written any reviews yet. Share your thoughts on movies from the vault!
          </p>
          <Link
            to="/movies"
            className="inline-block px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
          >
            Explore Movies
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-slate-700 space-y-3 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
                <div className="flex items-center gap-3">
                  {rev.movie?.posterUrl && (
                    <img
                      src={rev.movie.posterUrl}
                      alt={rev.movie.title}
                      className="w-10 h-14 object-cover rounded-lg shrink-0"
                    />
                  )}
                  <div>
                    <Link
                      to={`/movie/${rev.movie?.slug || rev.movieId}`}
                      className="text-sm font-bold text-white hover:text-emerald-400 transition-colors"
                    >
                      {rev.movie?.title || 'Movie'}
                    </Link>
                    <p className="text-[11px] text-slate-500">
                      Reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <RatingStars rating={rev.rating} size="sm" showNumber />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(rev)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
                      title="Edit Review"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rev.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {rev.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-md w-full glass-panel rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Edit Your Review</h3>
              <button
                onClick={() => setEditingReview(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Rating</label>
                <RatingStars
                  rating={editRating}
                  interactive
                  onRatingChange={setEditRating}
                  size="lg"
                  showNumber
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Review</label>
                <textarea
                  rows={4}
                  required
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Updating...' : 'Update Review'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
