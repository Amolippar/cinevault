import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Film, MessageSquare, Play, TrendingUp, ShieldCheck, Activity, Eye, Award } from 'lucide-react';
import { adminApi } from '../../api/client';
import { AdminHeader } from '../../components/common/AdminHeader';
import { SEO } from '../../components/common/SEO';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    adminApi
      .getDashboard()
      .then(setStats)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <SEO title="Admin Dashboard" description="System telemetry and content statistics." />
      <AdminHeader />

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-900 border border-slate-800" />
          ))}
        </div>
      ) : stats ? (
        <div className="space-y-8">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Total Users</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{stats.totalUsers}</p>
              <p className="text-[11px] text-emerald-400">+{stats.newUsersLastWeek} new this week</p>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Catalog Titles</span>
                <Film className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{stats.totalMovies}</p>
              <p className="text-[11px] text-sky-400">100% legal compliance</p>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Watch Sessions</span>
                <Play className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{stats.totalWatchSessions}</p>
              <p className="text-[11px] text-amber-400">Stream progress synced</p>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Daily Active Users</span>
                <Activity className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{stats.dailyActiveUsers}</p>
              <p className="text-[11px] text-rose-400">Past 24 hours</p>
            </div>
          </div>

          {/* Dual Split: Most Watched Movies & Popular Genres */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Most Watched */}
            <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                Most Watched Titles
              </h3>

              <div className="divide-y divide-slate-800">
                {stats.mostWatchedMovies?.map((m: any, idx: number) => (
                  <div key={m.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-500 w-4">#{idx + 1}</span>
                      <img src={m.posterUrl} alt={m.title} className="w-8 h-12 object-cover rounded" />
                      <div>
                        <Link to={`/movie/${m.slug || m.id}`} className="text-xs font-bold text-white hover:text-emerald-400">
                          {m.title}
                        </Link>
                        <p className="text-[10px] text-slate-400">{m.licenseStatus}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400">{m.viewCount.toLocaleString()}</span>
                      <p className="text-[10px] text-slate-500">streams</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Genres */}
            <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Genre Distribution & Popularity
              </h3>

              <div className="space-y-3">
                {stats.popularGenres?.map((g: any) => (
                  <div key={g.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span>{g.name}</span>
                      <span className="text-emerald-400">{g.movieCount} titles</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full"
                        style={{ width: `${Math.min(100, (g.movieCount / (stats.totalMovies || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Curatorial & Admin Audit Log */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Recent Curatorial Audit Logs
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Curator</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {stats.recentActions?.map((act: any) => (
                    <tr key={act.id}>
                      <td className="p-3 text-slate-400 whitespace-nowrap">
                        {new Date(act.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3 font-semibold text-white whitespace-nowrap">
                        {act.admin?.name || 'System Admin'}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                          {act.actionType}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">
                        {act.details || 'System event'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
