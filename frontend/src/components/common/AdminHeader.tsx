import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Film, Users, MessageSquare, BarChart3, ShieldCheck } from 'lucide-react';

export const AdminHeader: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Movie Management', path: '/admin/movies', icon: Film },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'Review Moderation', path: '/admin/reviews', icon: MessageSquare },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <div className="mb-8 border-b border-slate-800 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              CineVault Administration Console
            </h1>
            <p className="text-xs text-slate-400">
              Content licensing verification, user access control, and moderation
            </p>
          </div>
        </div>

        <Link
          to="/"
          className="text-xs font-semibold text-slate-400 hover:text-emerald-400 self-start sm:self-center"
        >
          ← Return to Public Vault
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto hide-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'glass-panel text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
