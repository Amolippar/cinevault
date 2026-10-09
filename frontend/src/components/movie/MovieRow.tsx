import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../../types';
import { MovieCard } from './MovieCard';
import { Link } from 'react-router-dom';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  viewAllLink?: string;
  showProgress?: boolean;
}

export const MovieRow: React.FC<MovieRowProps> = ({
  title,
  movies,
  viewAllLink,
  showProgress = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="relative my-8 sm:my-10">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
        <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>{title}</span>
          <span className="text-xs font-normal text-slate-500">({movies.length})</span>
        </h3>

        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
          >
            Explore All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Row Carousel Area */}
      <div className="relative group">
        {/* Left Arrow Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass-panel text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-slate-800 shadow-xl hidden sm:flex"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Horizontal Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto hide-scrollbar px-4 sm:px-6 lg:px-8 py-2 scroll-smooth"
        >
          {movies.map((movie) => (
            <div key={movie.id} className="w-40 sm:w-48 lg:w-52 shrink-0">
              <MovieCard movie={movie} showProgress={showProgress} />
            </div>
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass-panel text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-slate-800 shadow-xl hidden sm:flex"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
