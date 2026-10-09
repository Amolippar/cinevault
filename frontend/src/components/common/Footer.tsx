import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Film, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-cinema-border/50 bg-[#080b12] text-slate-400 mt-20 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Legal Compliance Banner */}
        <div className="mb-12 p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="text-xs sm:text-sm text-slate-300 space-y-1">
            <p className="font-semibold text-emerald-400">Strict Legal Content Policy & Public Domain Preservation</p>
            <p className="text-slate-400 leading-relaxed">
              CineVault strictly complies with international copyright law. This platform does NOT host, stream, or offer downloads of copyrighted movies without authorized distribution rights. All full-length films streamed directly on this platform are verified public-domain works or licensed under official agreements. For commercial titles, CineVault acts as a discovery portal pointing to authorized providers and official trailers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.svg" alt="CineVault" className="w-8 h-8" />
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
                CineVault
              </span>
            </Link>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              The premier destination for cinema historians, vintage movie lovers, and open-culture film preservation. Discover the golden era of film legally and in high quality.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Film className="w-3.5 h-3.5" /> 100% Legal & DMCA Compliant
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase mb-3">Explore</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/movies" className="hover:text-emerald-400 transition-colors">Catalog</Link></li>
              <li><Link to="/genres" className="hover:text-emerald-400 transition-colors">All Genres</Link></li>
              <li><Link to="/search" className="hover:text-emerald-400 transition-colors">Advanced Search</Link></li>
              <li><Link to="/movies?sort=trending" className="hover:text-emerald-400 transition-colors">Trending Now</Link></li>
              <li><Link to="/movies?licenseStatus=PUBLIC_DOMAIN" className="hover:text-emerald-400 transition-colors">Public Domain Vault</Link></li>
            </ul>
          </div>

          {/* User & Community */}
          <div>
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase mb-3">Community</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/watchlist" className="hover:text-emerald-400 transition-colors">Personal Watchlist</Link></li>
              <li><Link to="/history" className="hover:text-emerald-400 transition-colors">Watch History</Link></li>
              <li><Link to="/reviews" className="hover:text-emerald-400 transition-colors">Member Reviews</Link></li>
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About CineVault</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Legal Pages */}
          <div>
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase mb-3">Legal & Trust</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/about#licensing" className="hover:text-emerald-400 transition-colors">Licensing Policy</Link></li>
              <li><Link to="/contact#dmca" className="hover:text-emerald-400 transition-colors">DMCA / Copyright Agent</Link></li>
              <li><Link to="/admin/login" className="hover:text-emerald-400 transition-colors flex items-center gap-1">Admin Portal <ExternalLink className="w-3 h-3" /></Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CineVault Initiative. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for classic cinema lovers and legal open-access streaming.
          </p>
        </div>
      </div>
    </footer>
  );
};
