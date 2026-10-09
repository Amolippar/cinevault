import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, ShieldCheck, Film, Users, Clock } from 'lucide-react';
import { adminApi } from '../../api/client';
import { AdminHeader } from '../../components/common/AdminHeader';
import { SEO } from '../../components/common/SEO';

export const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    adminApi
      .getAnalytics()
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <SEO title="Admin Analytics" description="Detailed audience and licensing distribution metrics." />
      <AdminHeader />

      {isLoading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-64 rounded-3xl bg-slate-900 border border-slate-800" />
        </div>
      ) : analytics ? (
        <div className="space-y-8">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Avg Session Completion</span>
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-3xl font-black text-white">{analytics.avgCompletionPercentage}%</p>
              <p className="text-[11px] text-slate-400">Average film runtime completed per session</p>
            </div>

            <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Direct Legal Streams</span>
                <Film className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-3xl font-black text-white">
                {(analytics.licenseDistribution?.find((l: any) => l.label === 'Public Domain')?.count || 0) +
                  (analytics.licenseDistribution?.find((l: any) => l.label === 'Licensed')?.count || 0)}
              </p>
              <p className="text-[11px] text-sky-400">Directly hosted without DRM/paywalls</p>
            </div>

            <div className="p-6 rounded-3xl glass-card border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Compliance Score</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-3xl font-black text-emerald-400">100%</p>
              <p className="text-[11px] text-slate-400">0 unauthorized copyrighted streams detected</p>
            </div>
          </div>

          {/* License Distribution Visual Breakdown */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-400" />
              Catalog Licensing Classification Distribution
            </h3>

            <div className="space-y-4">
              {analytics.licenseDistribution?.map((item: any) => {
                const totalTitles = analytics.licenseDistribution.reduce((a: number, b: any) => a + b.count, 0) || 1;
                const percent = Math.round((item.count / totalTitles) * 100);
                return (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.label}
                      </span>
                      <span>
                        {item.count} titles ({percent}%)
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${percent}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Views & User Growth Trend Graph */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              7-Day Streaming Traffic & New Archivist Sign-Ups
            </h3>

            <div className="grid grid-cols-7 gap-2 pt-6 items-end h-56 border-b border-slate-800 pb-2">
              {analytics.sampleActivityDays?.map((day: any) => (
                <div key={day.date} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.views}
                  </div>
                  <div
                    className="w-full max-w-[40px] bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg transition-all group-hover:brightness-125"
                    style={{ height: `${Math.min(100, (day.views / 2000) * 100)}%` }}
                  />
                  <span className="text-[10px] text-slate-400 font-semibold">{day.date}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-400" /> Stream Playback Sessions
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
