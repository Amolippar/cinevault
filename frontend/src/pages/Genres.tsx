import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Film, Zap, Smile, Heart, Eye, Globe, Skull, Search, Moon } from 'lucide-react';
import { genresApi } from '../api/client';
import { Genre } from '../types';
import { SEO } from '../components/common/SEO';

const iconMap: Record<string, any> = {
  zap: Zap,
  smile: Smile,
  heart: Heart,
  eye: Eye,
  globe: Globe,
  skull: Skull,
  search: Search,
  film: Film,
  moon: Moon,
};

export const Genres: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    genresApi
      .getAll()
      .then((data) => setGenres(data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 min-h-screen">
      <SEO
        title="Movie Genres & Categories"
        description="Explore curated collections of public-domain and legal films across Action, Comedy, Horror, Sci-Fi, Film-Noir, and more on CineVault."
      />

      <div className="max-w-2xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
          <Compass className="w-3.5 h-3.5" /> Curated Vault Collections
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Explore by Genre
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
          From German expressionist silent sci-fi to landmark 1960s horror and witty screwball comedies, explore cinema history by category.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {genres.map((g) => {
            const IconComponent = (g.icon && iconMap[g.icon]) || Film;
            return (
              <Link
                key={g.id}
                to={`/genres/${g.slug}`}
                className="group relative rounded-2xl p-6 glass-card border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/40 hover:shadow-2xl hover:shadow-emerald-950/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {g.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {g.description || 'Explore timeless classic titles in this genre.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-semibold">
                    {g._count?.movies || 0} {(g._count?.movies || 0) === 1 ? 'Movie' : 'Movies'}
                  </span>
                  <span className="text-slate-400 group-hover:text-white transition-colors">
                    Browse Collection →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
