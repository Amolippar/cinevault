export type ContentRightsStatus =
  | 'PUBLIC_DOMAIN'
  | 'OWNED_CONTENT'
  | 'LICENSED'
  | 'AUTHORIZED_PROVIDER'
  | 'AUTHORIZED_EXTERNAL'
  | 'TRAILER_ONLY'
  | 'UNVERIFIED';

// Backwards compatibility alias
export type LicenseStatus = ContentRightsStatus;

export type PublicationStatus =
  | 'DRAFT'
  | 'RIGHTS_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'UNPUBLISHED';

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
  bio?: string | null;
  isActive?: boolean;
  createdAt: string;
  _count?: {
    watchlist?: number;
    watchHistory?: number;
    reviews?: number;
    ratings?: number;
  };
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  _count?: {
    movies?: number;
  };
}

export interface CastMember {
  id: string;
  movieId: string;
  castId: string;
  characterName?: string | null;
  role: 'ACTOR' | 'DIRECTOR' | 'WRITER';
  order: number;
  cast: {
    id: string;
    name: string;
    profileUrl?: string | null;
    bio?: string | null;
  };
}

export interface Review {
  id: string;
  userId: string;
  movieId: string;
  rating: number;
  content: string;
  isApproved: boolean;
  isFlagged?: boolean;
  flagReason?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    email?: string;
  };
  movie?: {
    id: string;
    title: string;
    slug: string;
    posterUrl: string;
    releaseYear: number;
  };
}

export interface Movie {
  id: string;
  title: string;
  slug: string;
  originalTitle?: string | null;
  description: string;
  releaseYear: number;
  releaseDate?: string | null;
  durationMinutes: number;
  director?: string | null;
  cast?: string | null;
  rating: number;
  ratingsCount: number;
  posterUrl: string;
  backdropUrl?: string | null;
  trailerUrl: string;
  videoSourceUrl?: string | null;
  externalStreamUrl?: string | null;
  sourceProvider?: string | null;
  externalStreamProvider?: string | null;
  contentRightsStatus: ContentRightsStatus;
  licenseStatus?: ContentRightsStatus;
  publicationStatus: PublicationStatus;
  rightsHolder?: string | null;
  licenseDocument?: string | null;
  licenseStartDate?: string | null;
  licenseEndDate?: string | null;
  licenseExpiresAt?: string | null;
  ownershipConfirmed?: boolean;
  licenseNotes: string;
  language: string;
  country: string;
  isFeatured: boolean;
  isTrending: boolean;
  viewCount: number;
  createdAt: string;
  canStreamDirect?: boolean;
  canStreamExternal?: boolean;
  isLicenseExpired?: boolean;
  unavailableNotice?: string | null;
  genres?: {
    genre: Genre;
  }[];
  castMembers?: CastMember[];
  reviews?: Review[];
  userState?: {
    inWatchlist: boolean;
    userRating: number | null;
    watchProgress?: {
      progressSeconds: number;
      durationSeconds: number;
      completionPercentage: number;
      lastWatchedAt: string;
    } | null;
  };
}

export interface WatchHistoryItem {
  id: string;
  progressSeconds: number;
  durationSeconds: number;
  completionPercentage: number;
  lastWatchedAt: string;
  movie: Movie;
}

export interface WatchlistItem {
  id: string;
  addedAt: string;
  movie: Movie;
}

export interface HomepageSection {
  id: string;
  title: string;
  genreSlug?: string;
  movies: Movie[];
}

export interface RightsAuditLogEntry {
  id: string;
  adminId: string;
  movieId: string;
  action: string;
  rightsStatus: ContentRightsStatus;
  publicationStatus: PublicationStatus;
  reason: string;
  createdAt: string;
  admin?: {
    name: string;
    email: string;
  };
  movie?: {
    title: string;
    slug: string;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: PaginationMeta;
  error?: string;
  errors?: Record<string, string[]>;
}
