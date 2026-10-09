import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Bookmark,
  History,
  Film,
  Compass,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  Star,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-cinema-border/50 bg-[#0a0d14]/90 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Primary Navigation */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/logo.svg"
                alt="CineVault"
                className="w-9 h-9 sm:w-10 sm:h-10 transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
                  CineVault
                </span>
                <span className="text-[10px] tracking-widest text-emerald-400/80 uppercase font-semibold -mt-1">
                  Legal Stream
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/movies"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/movies')
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Movies
              </Link>
              <Link
                to="/genres"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/genres')
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Genres
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/watchlist"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/watchlist')
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    Watchlist
                  </Link>
                  <Link
                    to="/history"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/history')
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    History
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Action Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Quick Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies, actors, directors..."
                className="w-56 lg:w-72 bg-slate-900/80 border border-slate-700/80 rounded-full py-2 pl-9 pr-4 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </form>

            {/* Auth Buttons or User Avatar */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:ring-2 hover:ring-emerald-500/40 transition-all"
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-emerald-500/50"
                  />
                  <span className="text-xs font-semibold text-slate-200 hidden lg:inline max-w-[100px] truncate">
                    {user.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel shadow-2xl py-2 z-50 border border-slate-700/70 animate-fade-in"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          <Shield className="w-2.5 h-2.5" /> Administrator
                        </span>
                      )}
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60"
                    >
                      <User className="w-4 h-4 text-emerald-400" />
                      My Profile
                    </Link>
                    <Link
                      to="/watchlist"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60"
                    >
                      <Bookmark className="w-4 h-4 text-emerald-400" />
                      Watchlist
                    </Link>
                    <Link
                      to="/history"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60"
                    >
                      <History className="w-4 h-4 text-emerald-400" />
                      Watch History
                    </Link>
                    <Link
                      to="/reviews"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60"
                    >
                      <Star className="w-4 h-4 text-emerald-400" />
                      My Reviews
                    </Link>

                    {isAdmin && (
                      <div className="border-t border-slate-800 my-1 pt-1">
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10"
                        >
                          <Shield className="w-4 h-4" />
                          Admin Console
                        </Link>
                      </div>
                    )}

                    <div className="border-t border-slate-800 my-1 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-950/20"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:opacity-90 shadow-md shadow-emerald-500/20 transition-all"
                >
                  Join Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-3">
            <Link to="/search" className="p-2 text-slate-300 hover:text-white">
              <Search className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-cinema-border px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies, actors..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-100 placeholder-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </form>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/60 text-slate-200"
            >
              <Film className="w-4 h-4 text-emerald-400" /> Home
            </Link>
            <Link
              to="/movies"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/60 text-slate-200"
            >
              <Film className="w-4 h-4 text-emerald-400" /> Movies
            </Link>
            <Link
              to="/genres"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/60 text-slate-200"
            >
              <Compass className="w-4 h-4 text-emerald-400" /> Genres
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/watchlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/60 text-slate-200"
                >
                  <Bookmark className="w-4 h-4 text-emerald-400" /> Watchlist
                </Link>
                <Link
                  to="/history"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/60 text-slate-200"
                >
                  <History className="w-4 h-4 text-emerald-400" /> History
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/60 text-slate-200"
                >
                  <User className="w-4 h-4 text-emerald-400" /> Profile
                </Link>
              </>
            )}
          </div>

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 text-sm"
            >
              <Shield className="w-4 h-4" /> Admin Console
            </Link>
          )}

          <div className="pt-2 border-t border-slate-800">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full py-2.5 rounded-lg bg-rose-500/20 text-rose-300 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-lg bg-slate-800 text-white text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-lg bg-emerald-500 text-slate-950 text-sm font-bold"
                >
                  Join Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
