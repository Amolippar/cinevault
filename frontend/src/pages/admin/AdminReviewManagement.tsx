import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Trash2, CheckCircle, AlertTriangle, Shield } from 'lucide-react';
import { adminApi } from '../../api/client';
import { Review } from '../../types';
import { AdminHeader } from '../../components/common/AdminHeader';
import { RatingStars } from '../../components/common/RatingStars';
import { SEO } from '../../components/common/SEO';
import { useToast } from '../../context/ToastContext';

export const AdminReviewManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getReviews({ limit: 50 });
      setReviews(res.data || []);
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleModerate = async (id: string, isApproved: boolean) => {
    try {
      await adminApi.moderateReview(id, { isApproved });
      success(`Review ${isApproved ? 'approved' : 'rejected'}.`);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isApproved } : r))
      );
    } catch {
      error('Failed to moderate review.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await adminApi.moderateReview(id, { isApproved: false });
      setReviews((prev) => prev.filter((r) => r.id !== id));
      success('Review removed.');
    } catch {
      error('Failed to remove review.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <SEO title="Review Moderation" description="Audit and moderate community reviews and comments." />
      <AdminHeader />

      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Movie</th>
                <th className="p-4">Author</th>
                <th className="p-4">Score</th>
                <th className="p-4">Review Excerpt</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">Loading reviews queue...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">No reviews found.</td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white max-w-[150px] truncate">
                      {rev.movie?.title || 'Unknown Title'}
                    </td>
                    <td className="p-4 text-slate-300">
                      {rev.user?.name || 'Anonymous User'}
                    </td>
                    <td className="p-4">
                      <RatingStars rating={rev.rating} size="sm" showNumber />
                    </td>
                    <td className="p-4 text-slate-300 max-w-sm truncate">
                      {rev.content}
                    </td>
                    <td className="p-4">
                      {rev.isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400">
                          <CheckCircle className="w-3 h-3" /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400">
                          <AlertTriangle className="w-3 h-3" /> Flagged / Hidden
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {rev.isApproved ? (
                          <button
                            onClick={() => handleModerate(rev.id, false)}
                            className="px-2.5 py-1 rounded-lg bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 font-semibold text-[11px]"
                          >
                            Hide
                          </button>
                        ) : (
                          <button
                            onClick={() => handleModerate(rev.id, true)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 font-semibold text-[11px]"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(rev.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
