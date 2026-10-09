import { Request } from 'express';

export type UserRole = 'USER' | 'ADMIN';

export type ContentRightsStatus =
  | 'PUBLIC_DOMAIN'
  | 'OWNED_CONTENT'
  | 'LICENSED'
  | 'AUTHORIZED_PROVIDER'
  | 'TRAILER_ONLY'
  | 'UNVERIFIED';

export type PublicationStatus =
  | 'DRAFT'
  | 'RIGHTS_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'UNPUBLISHED';

export type CastRole = 'ACTOR' | 'DIRECTOR' | 'WRITER';

export interface UserPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
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
  message?: string;
  data?: T;
  meta?: PaginationMeta;
  error?: string;
  errors?: Record<string, string[]>;
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
