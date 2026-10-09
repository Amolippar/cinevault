import React, { useState } from 'react';
import { User as UserIcon, Mail, Shield, Bookmark, History, MessageSquare, Edit3, Save, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/client';
import { SEO } from '../components/common/SEO';
import { Link } from 'react-router-dom';

export const UserProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-slate-400 text-sm">Please sign in to view your profile.</p>
        <Link to="/login" className="mt-4 inline-block px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs">
          Sign In
        </Link>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await apiClient.put('/auth/profile', {
        name: name.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
      });

      updateUser(res.data.data);
      success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 min-h-screen">
      <SEO title="User Profile" description="Manage your CineVault profile and view your film archiving activity." />

      <div className="space-y-8">
        {/* Profile Card Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={user.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-xl"
            />

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-black text-white">{user.name}</h1>
                  <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{user.email}</span>
                  </p>
                </div>

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 rounded-xl glass-panel text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer self-center sm:self-start"
                >
                  <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <Shield className="w-3 h-3" />
                  {user.role === 'ADMIN' ? 'System Administrator' : 'CineVault Member'}
                </span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {user.bio || 'Classic cinema admirer and public domain film archivist.'}
              </p>
            </div>
          </div>
        </div>

        {/* Activity Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/watchlist"
            className="p-6 rounded-2xl glass-card border border-slate-800 hover:border-emerald-500/40 transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{user._count?.watchlist ?? 0}</p>
              <p className="text-xs text-slate-400">Movies in Watchlist</p>
            </div>
          </Link>

          <Link
            to="/history"
            className="p-6 rounded-2xl glass-card border border-slate-800 hover:border-emerald-500/40 transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              <History className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{user._count?.watchHistory ?? 0}</p>
              <p className="text-xs text-slate-400">Films Streamed</p>
            </div>
          </Link>

          <Link
            to="/reviews"
            className="p-6 rounded-2xl glass-card border border-slate-800 hover:border-emerald-500/40 transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{user._count?.reviews ?? 0}</p>
              <p className="text-xs text-slate-400">Reviews Written</p>
            </div>
          </Link>
        </div>

        {/* Edit Profile Form */}
        {isEditing && (
          <form
            onSubmit={handleSaveProfile}
            className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/80 space-y-4 animate-fade-in"
          >
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-emerald-400" />
              Update Account Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Bio / Cinema Philosophy
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell other cinephiles about your favorite directors, eras, and restoration projects..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
